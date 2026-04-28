#!/bin/bash
# Re-encode HEVC/H.265 MP4s in public/videos/ to H.264 so they play in all browsers (Chrome,
# Firefox, etc.). iPhone HDR exports are often HEVC — <video> in Chrome typically cannot decode them.
#
# Usage: ./scripts/reencode-hevc-to-h264-web.sh file1.mp4 file2.mp4 ...
# Or with no args, scans public/videos/*.mp4 for hevc video track.

set -euo pipefail

if ! command -v ffmpeg &>/dev/null || ! command -v ffprobe &>/dev/null; then
  echo "ffmpeg and ffprobe required (brew install ffmpeg)"
  exit 1
fi

reencode_one() {
  local rel="$1"
  local src="public/videos/$rel"
  local dst="public/videos/.tmp-h264-$rel"
  echo "Re-encoding: $rel"
  ffmpeg -hide_banner -y -i "$src" \
    -c:v libx264 -preset fast -crf 23 -pix_fmt yuv420p \
    -c:a aac -b:a 192k -movflags +faststart \
    "$dst"
  mv "$dst" "$src"
  echo "  -> $(ffprobe -v error -select_streams v:0 -show_entries stream=codec_name -of csv=p=0 "$src")"
}

if [[ $# -gt 0 ]]; then
  for rel in "$@"; do
    reencode_one "$(basename "$rel")"
  done
  exit 0
fi

for src in public/videos/*.mp4; do
  [[ -f "$src" ]] || continue
  codec=$(ffprobe -v error -select_streams v:0 -show_entries stream=codec_name -of csv=p=0 "$src" 2>/dev/null || true)
  if [[ "$codec" == "hevc" ]]; then
    reencode_one "$(basename "$src")"
  fi
done
