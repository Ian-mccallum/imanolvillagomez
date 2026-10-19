#!/usr/bin/env bash
# Sets up the NOL /studio drop runner on the VPS that already runs Fortivus Studio.
# Run as root; safe to rerun. Never touches Fortivus's users, config or service.
#
#   scp -i ~/.ssh/fortivus_vm -r scripts/art-inbox/vm ubuntu@<vm>:~/nol-vm
#   ssh -i ~/.ssh/fortivus_vm ubuntu@<vm>
#   sudo env GIT_NAME="Ian McCallum" GIT_EMAIL=you@example.com bash ~/nol-vm/setup.sh
#
# First run: adds ffmpeg, the two users and a GitHub deploy key, then stops.
# Add the key (write access), fill in the two env files it names, and rerun to prepare.
# It NEVER starts the runner unless passed --start after the laptop timer is off.
#
# Box-level setup (Node 24, pinned Claude Code, firewall, swap, SSH hardening, automatic
# security updates, journald caps) belongs to Fortivus's scripts/studio/vm/setup.sh; this
# script checks for it instead of reinstalling, so Fortivus's pinned versions don't move.
#
# Two users, mirroring Fortivus's studio/leo:
#   nol     runs scripts/art-inbox/run.mjs. Holds the secrets (R2, Vercel, deploy key)
#           and does every R2 upload and git push.
#   nolai   runs Claude and every build of code Claude touched. Holds only its Claude
#           token; can't read nol's secrets, can't push, can't write the checkout, and
#           can't read anything of Fortivus's.
set -euo pipefail
umask 0022
START=0
case "${1:-}" in
  '') ;;
  --start) START=1 ;;
  *) echo 'Usage: setup.sh [--start]' >&2; exit 64 ;;
esac

REPO=/srv/nol
REPO_URL=${REPO_URL:-git@github.com:Ian-mccallum/imanolvillagomez.git}
# A review branch can be installed/tested while stopped. Live runner always follows main.
REPO_REF=${REPO_REF:-origin/main}
[ "$START" = 0 ] || [ "$REPO_REF" = origin/main ] || { echo 'Only origin/main can be activated.' >&2; exit 1; }
CONF=/etc/nol-studio
HERE=$(cd "$(dirname "$0")" && pwd)
# GitHub's published SSH host key fingerprint (docs.github.com, "GitHub's SSH key fingerprints")
GITHUB_FP=SHA256:+DiY3wvvV6TuJJhbpZisF/zLDA0zPMSvHdkr4UvCOqU

[ "$(id -u)" = 0 ] || { echo "Run as root." >&2; exit 1; }
. /etc/os-release
[ "$ID" = ubuntu ] && [ "$VERSION_ID" = 24.04 ] || { echo 'This setup targets Ubuntu 24.04.' >&2; exit 1; }
if systemctl is-active --quiet nol-studio.timer || systemctl is-active --quiet nol-studio.service; then
  echo 'Stop the NOL runner first: systemctl disable --now nol-studio.timer' >&2
  exit 1
fi
say() { printf '\n\033[1m%s\033[0m\n' "$*"; }
# sudo/PAM can replace the caller's umask. Set it inside the target user's shell
# so trusted checkout files never become writable by the AI user's shared group.
as_nol() { sudo -H -u nol bash -c 'umask 0027; exec "$@"' -- "$@"; }

say "Shared box"
[ "$(node -p 'process.versions.node.split(".")[0]' 2>/dev/null)" = 24 ] && command -v claude >/dev/null && command -v ufw >/dev/null ||
  { echo 'Run Fortivus scripts/studio/vm/setup.sh on this box first (Node 24, Claude Code, firewall).' >&2; exit 1; }
export DEBIAN_FRONTEND=noninteractive
command -v ffmpeg >/dev/null || { apt-get update -q && apt-get install -yq ffmpeg; }

say "Users"
id nolai >/dev/null 2>&1 || useradd --create-home --shell /usr/sbin/nologin nolai
id nol >/dev/null 2>&1 || useradd --create-home --shell /bin/bash nol
usermod -aG nolai nol # so the runner can commit and clean up what nolai writes
chmod 700 /home/nolai /home/nol
for f in /etc/cron.deny /etc/at.deny; do grep -qx nolai "$f" 2>/dev/null || echo nolai >>"$f"; done

say "Wrapper + sudoers"
sed "s|__REPO__|$REPO|" "$HERE/nolai-run" >/usr/local/bin/nolai-run
chown root:root /usr/local/bin/nolai-run && chmod 755 /usr/local/bin/nolai-run
echo 'nol ALL=(nolai) NOPASSWD: /usr/local/bin/nolai-run' >/etc/sudoers.d/nol-studio
chmod 440 /etc/sudoers.d/nol-studio
visudo -cf /etc/sudoers.d/nol-studio >/dev/null
install -m 0755 -o root -g root "$HERE/doctor.sh" /usr/local/sbin/nol-studio-doctor

say "Config"
install -d -m 755 "$CONF"
if [ ! -f "$CONF/env" ]; then
  cat >"$CONF/env" <<'EOF'
# Runner secrets. Only root reads this file; systemd hands it to the runner (user nol).
# Use an R2 token scoped to NOL's bucket only, not the laptop's token.
R2_ACCOUNT_ID=
R2_ACCESS_KEY_ID=
R2_SECRET_ACCESS_KEY=
R2_BUCKET_NAME=
R2_PUBLIC_URL=
VERCEL_TOKEN=
# Public values the build bakes into the site (safe to hand to the worktree's .env).
VITE_R2_PUBLIC_URL=
VITE_TURNSTILE_SITE_KEY=
# Optional: email Ian about previews, questions and failures (Resend, verified sender domain).
RESEND_API_KEY=
ART_EMAIL_FROM=
ART_EMAIL_TO=
# Optional Healthchecks.io ping URL (pinged after every run); alert recipient Ian only.
ART_HEALTHCHECK_URL=
EOF
fi
chown root:root "$CONF/env" && chmod 600 "$CONF/env"
if [ ! -f "$CONF/nolai.env" ]; then
  cat >"$CONF/nolai.env" <<'EOF'
# Subscription authentication only. Get Claude's token using `claude setup-token`.
CLAUDE_CODE_OAUTH_TOKEN=
DISABLE_AUTOUPDATER=1
EOF
fi
chown root:nolai "$CONF/nolai.env" && chmod 640 "$CONF/nolai.env"

say "Deploy key"
sudo -H -u nol mkdir -p -m 700 /home/nol/.ssh
[ -f /home/nol/.ssh/id_ed25519 ] || sudo -H -u nol ssh-keygen -q -t ed25519 -N '' -C nol-studio-vm -f /home/nol/.ssh/id_ed25519
if ! sudo -H -u nol ssh-keygen -F github.com >/dev/null 2>&1; then
  scan=$(ssh-keyscan -t ed25519 github.com 2>/dev/null)
  fp=$(ssh-keygen -lf - <<<"$scan" | awk '{print $2}')
  [ "$fp" = "$GITHUB_FP" ] || { echo "github.com host key fingerprint $fp doesn't match $GITHUB_FP. Stopping." >&2; exit 1; }
  echo "$scan" | sudo -H -u nol tee -a /home/nol/.ssh/known_hosts >/dev/null
fi
sudo -H -u nol git config --global user.name "${GIT_NAME:-$(sudo -H -u nol git config --global user.name || echo 'NOL Studio')}"
sudo -H -u nol git config --global user.email "${GIT_EMAIL:-$(sudo -H -u nol git config --global user.email || echo 'studio@imanolvillagomez.com')}"

say "systemd"
# A oneshot on a 2-minute timer, like the laptop's art-inbox.timer but faster.
# run.mjs takes its own lock, so a long drop never overlaps the next tick.
cat >/etc/systemd/system/nol-studio.service <<EOF
[Unit]
Description=NOL /studio drop runner
After=network-online.target
Wants=network-online.target

[Service]
Type=oneshot
User=nol
Group=nol
WorkingDirectory=$REPO
EnvironmentFile=$CONF/env
Environment=ART_AI_RUN=/usr/local/bin/nolai-run ART_SYNC=1 HOME=/home/nol
ExecStart=/usr/bin/node $REPO/scripts/art-inbox/run.mjs
TimeoutStartSec=4h
KillMode=control-group
MemoryAccounting=yes
MemoryHigh=2200M
MemoryMax=2600M
TasksMax=512
UMask=0027
PrivateTmp=yes
ProtectSystem=full
EOF
cat >/etc/systemd/system/nol-studio.timer <<'EOF'
[Unit]
Description=Check NOL /studio drops

[Timer]
OnBootSec=90s
OnUnitInactiveSec=2min

[Install]
WantedBy=timers.target
EOF
systemctl daemon-reload
# Bound AI logs and leftover drop files so the shared disk cannot fill.
cat >/etc/tmpfiles.d/nol-studio.conf <<EOF
e $REPO/.art-inbox/logs - nol nol 30d
e $REPO/.art-inbox/req - nol nolai 14d
EOF

say "Repo"
install -d -o nol -g nolai -m 2750 "$REPO" # nolai can read the checkout, never write it
if [ ! -d "$REPO/.git" ]; then
  if ! err=$(as_nol git clone -q "$REPO_URL" "$REPO" 2>&1); then
    cat <<EOF

Couldn't clone yet ($(tail -1 <<<"$err")).

Next:
  1. GitHub → Ian-mccallum/imanolvillagomez → Settings → Deploy keys → Add deploy key,
     tick "Allow write access", and paste:

$(cat /home/nol/.ssh/id_ed25519.pub)

  2. Fill in $CONF/env and $CONF/nolai.env   (nano $CONF/env)
  3. Rerun this script.
EOF
    exit 0
  fi
fi
# Stale git-lfs hooks break checkouts; the runner already skips hooks for the same reason.
as_nol git -C "$REPO" config core.hooksPath /dev/null
as_nol git -C "$REPO" fetch -q origin
ref_sha=$(sudo -H -u nol git -C "$REPO" rev-parse --verify --end-of-options "$REPO_REF^{commit}")
as_nol git -C "$REPO" checkout -q -f --detach "$ref_sha"
install -d -o nol -g nolai -m 2750 "$REPO/.art-inbox"
install -d -o nol -g nolai -m 2770 "$REPO/.art-inbox/wt" "$REPO/.art-inbox/req"
install -d -o nol -g nol -m 700 "$REPO/.art-inbox/logs"
as_nol bash -c "umask 0027; cd $REPO && npm ci --no-audit --no-fund >/dev/null && sha256sum package-lock.json | cut -d' ' -f1 | tr -d '\n' > .art-inbox/npm.sha"
# Vite 7 bundles vite.config.ts into node_modules/.vite-temp; nolai's builds must write there.
install -d -o nol -g nolai -m 2770 "$REPO/node_modules/.vite-temp"
# Repair older installations too. Preserve only the two intentionally mutable
# AI directories; never follow worktree symlinks while changing trusted modes.
find "$REPO" -path "$REPO/.art-inbox/wt" -prune -o -path "$REPO/.art-inbox/req" -prune -o \
  -path "$REPO/node_modules/.vite-temp" -prune -o \
  \( -type f -o -type d \) -exec chmod g-w,o-rwx {} +

missing=()
grep -q '^R2_SECRET_ACCESS_KEY=.' "$CONF/env" || missing+=("R2 keys in $CONF/env")
grep -q '^VERCEL_TOKEN=.' "$CONF/env" || missing+=("VERCEL_TOKEN in $CONF/env")
grep -Eq '^CLAUDE_CODE_OAUTH_TOKEN=.' "$CONF/nolai.env" || missing+=("a Claude subscription token in $CONF/nolai.env")
if [ ${#missing[@]} -gt 0 ]; then
  printf '\nStill needed before the runner starts:\n'; printf '  • %s\n' "${missing[@]}"; echo "Then rerun this script."
  exit 0
fi

say "Checks"
nol-studio-doctor

if [ "$START" = 1 ]; then
  [ "${LAPTOP_RUNNER_STOPPED:-}" = yes ] || { echo 'First run `systemctl --user disable --now art-inbox.timer` on the laptop, then set LAPTOP_RUNNER_STOPPED=yes with --start.' >&2; exit 1; }
  systemctl enable --now nol-studio.timer
  say 'Runner started.'
else
  say 'Prepared. The runner stays stopped until --start.'
fi
echo "  journalctl -u nol-studio -f               # watch it"
echo "  systemctl start nol-studio                # run the queue now"
