#!/usr/bin/env bash
# Readiness checks only: no drops, builds, inference, uploads or pushes.
# Also checks that NOL and Fortivus can't read each other's secrets on the shared VPS.
set -euo pipefail
[ "$(id -u)" = 0 ] || { echo 'Run with sudo.' >&2; exit 1; }
REPO=/srv/nol
CONF=/etc/nol-studio
fail() { echo "NOT READY: $*" >&2; exit 1; }
[ "$(node -p 'process.versions.node.split(".")[0]')" = 24 ] || fail 'Node 24 is required.'
command -v ffmpeg >/dev/null || fail 'ffmpeg is missing; video stills and web encodes need it.'
for file in "$CONF/env" "$CONF/nolai.env"; do [ -s "$file" ] || fail "Missing $file"; done
for key in R2_ACCOUNT_ID R2_ACCESS_KEY_ID R2_SECRET_ACCESS_KEY R2_BUCKET_NAME R2_PUBLIC_URL VERCEL_TOKEN; do
  grep -Eq "^$key=.+" "$CONF/env" || fail "Set $key in $CONF/env"
done
agent_backend=$(sed -n 's/^ART_AGENT=//p' "$CONF/nolai.env" | tail -1)
case "${agent_backend:-claude}" in
  cursor)
    [ -x /home/nolai/.local/bin/agent ] || fail 'Cursor CLI is missing for nolai.'
    sudo -H -u nolai /home/nolai/.local/bin/agent status 2>&1 | grep -q 'Logged in as' || fail 'Cursor needs login as nolai.'
    # Cursor updates itself into a new versions/<v>/ dir, so the profile must match any version.
    case "$(readlink -f /home/nolai/.local/bin/agent)" in
      /home/nolai/.local/share/cursor-agent/versions/*/cursor-agent) ;;
      *) fail 'Cursor is installed outside ~nolai/.local/share/cursor-agent/versions/; update the AppArmor profile.' ;;
    esac
    grep -qF 'profile nol_cursor_sandbox /home/nolai/.local/share/cursor-agent/versions/*/cursorsandbox ' /etc/apparmor.d/nol-cursor-sandbox \
      || fail 'AppArmor profile nol_cursor_sandbox must match versions/*/cursorsandbox, or Cursor updates break every drop.'
    command -v claude >/dev/null && grep -Eq '^CLAUDE_CODE_OAUTH_TOKEN=.+' "$CONF/nolai.env" \
      || echo 'Note: no Claude backup (claude + CLAUDE_CODE_OAUTH_TOKEN); a Cursor failure fails the drop.' >&2
    ;;
  codex)
    command -v codex >/dev/null || fail 'Codex CLI is missing.'
    sudo -H -u nolai codex login status 2>&1 | grep -q 'Logged in' || fail 'Codex needs login as nolai.'
    ;;
  claude|'')
    command -v claude >/dev/null || fail 'Claude Code is missing.'
    grep -Eq '^CLAUDE_CODE_OAUTH_TOKEN=.+' "$CONF/nolai.env" || fail 'Claude subscription token is missing.'
    ;;
  *) fail 'ART_AGENT must be cursor, codex or claude.' ;;
esac
if grep -Eq '^(ANTHROPIC_API_KEY|ANTHROPIC_AUTH_TOKEN|R2_[A-Z_]*KEY[A-Z_]*|VERCEL_TOKEN)=.+' "$CONF/nolai.env"; then
  fail "Only AI authentication and backend configuration belong in $CONF/nolai.env."
fi

# NOL's own isolation
if sudo -H -u nolai test -r "$CONF/env"; then fail 'nolai can read runner secrets.'; fi
if sudo -H -u nolai test -r /home/nol/.ssh/id_ed25519; then fail 'nolai can read the deploy key.'; fi
for path in "$REPO" "$REPO/scripts" "$REPO/scripts/art-inbox" "$REPO/scripts/art-inbox/run.mjs" "$REPO/.git" "$REPO/.git/config" "$REPO/node_modules"; do
  if sudo -H -u nolai test -w "$path"; then fail "nolai can modify trusted files: $path"; fi
done
sudo -H -u nolai test -r "$REPO/scripts/art-inbox/run.mjs" || fail 'nolai cannot read the checkout.'
for path in "$REPO/.art-inbox/wt" "$REPO/.art-inbox/req"; do
  sudo -H -u nolai test -w "$path" || fail "nolai cannot write its work directory: $path"
done

# Neighbours: neither NOL user may touch Fortivus, and Fortivus's users may not touch NOL.
for u in nol nolai; do
  for path in /etc/fortivus-studio/env /etc/fortivus-studio/leo.env /home/studio/.ssh/id_ed25519 /home/leo/.codex /srv/fortivus/scripts; do
    if [ -e "$path" ] && sudo -H -u "$u" test -r "$path"; then fail "$u can read Fortivus's $path"; fi
  done
done
for u in studio leo; do
  id "$u" >/dev/null 2>&1 || continue
  for path in "$CONF/env" "$CONF/nolai.env" /home/nol/.ssh/id_ed25519 "$REPO/scripts"; do
    if sudo -H -u "$u" test -r "$path"; then fail "Fortivus's $u can read NOL's $path"; fi
  done
done

[ "$(systemctl show nol-studio -p Slice --value)" = studios.slice ] || fail 'nol-studio is not in studios.slice.'
if systemctl is-active --quiet fortivus-studio && [ "$(systemctl show fortivus-studio -p Slice --value)" != studios.slice ]; then
  echo 'Note: Fortivus is not in studios.slice yet; restart fortivus-studio while it is idle.' >&2
fi
sudo -H -u nol git -C "$REPO" ls-remote -q origin main >/dev/null || fail 'GitHub deploy key does not work.'
node --check "$REPO/scripts/art-inbox/run.mjs"
echo 'Local readiness checks passed. A real drop test and cutover still need verification.'
echo "AI backend: ${agent_backend:-claude}. Check that account's usage allowance before sending real drops."
