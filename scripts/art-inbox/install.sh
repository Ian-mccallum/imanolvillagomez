#!/usr/bin/env bash
# Installs the art-inbox runner as a systemd user timer: runs ~90s after login,
# then every 10 minutes while the laptop is awake.
set -euo pipefail
REPO="$(cd "$(dirname "$0")/../.." && pwd)"
UNIT_DIR="$HOME/.config/systemd/user"
mkdir -p "$UNIT_DIR" "$REPO/.art-inbox"

cat > "$UNIT_DIR/art-inbox.service" <<UNIT
[Unit]
Description=Imanol /art drops -> Claude Code publish
After=network-online.target

[Service]
Type=oneshot
WorkingDirectory=$REPO
Environment=PATH=/usr/local/bin:/usr/bin:/bin:%h/.local/bin:%h/.npm-global/bin
ExecStart=$(command -v node) $REPO/scripts/art-inbox/run.mjs
StandardOutput=append:$REPO/.art-inbox/runner.log
StandardError=append:$REPO/.art-inbox/runner.log
UNIT

cat > "$UNIT_DIR/art-inbox.timer" <<UNIT
[Unit]
Description=Check /art drops

[Timer]
OnStartupSec=90s
OnUnitActiveSec=10min
Persistent=true

[Install]
WantedBy=timers.target
UNIT

systemctl --user daemon-reload
systemctl --user enable --now art-inbox.timer
systemctl --user list-timers art-inbox.timer --no-pager
