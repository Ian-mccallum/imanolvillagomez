#!/bin/bash
# Publish one video to Cloudflare R2 for the NOL site.
#
#   ./publish-video.sh <source-video> <DestName.mp4> [--dry-run] [--web-encode]
#
# Does the whole mechanical pipeline in one shot:
#   probe codec -> H.264 + faststart -> public/videos/ -> R2 -> verify it actually plays
#
# Why this exists — two failure modes that both look like "the video won't play",
# and both are invisible until a real viewer on a real connection hits them:
#
#   1. No faststart. The moov atom sits at the end, so the browser must download
#      almost the whole file before it can start. This script hard-blocks on it.
#   2. Camera-master bitrate. A 4K clip straight off the card runs 35-40Mbps and
#      no ordinary connection can sustain that, faststart or not. This script warns
#      and offers --web-encode, but doesn't block: shipping 4K is a valid choice.
#
# Run from the repo root (it resolves paths relative to the repo, not your cwd).

set -euo pipefail

REPO_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/../../../.." && pwd)"
VIDEOS_DIR="$REPO_ROOT/public/videos"

# ---------- args ----------
DRY_RUN=0
WEB_ENCODE=0
ARGS=()
for a in "$@"; do
  case "$a" in
    --dry-run) DRY_RUN=1 ;;
    --web-encode) WEB_ENCODE=1 ;;
    -h|--help)
      sed -n '2,18p' "${BASH_SOURCE[0]}" | sed 's/^# \{0,1\}//'
      exit 0 ;;
    *) ARGS+=("$a") ;;
  esac
done

if [ "${#ARGS[@]}" -ne 2 ]; then
  echo "usage: publish-video.sh <source-video> <DestName.mp4> [--dry-run] [--web-encode]" >&2
  echo "example: publish-video.sh 'UPDATED WORK 8.22.26/ROMMULAS/raw.mp4' PROBLEMA.mp4" >&2
  exit 1
fi

SRC="${ARGS[0]}"
DEST_NAME="$(basename "${ARGS[1]}")"
DEST="$VIDEOS_DIR/$DEST_NAME"

step() { printf '\n\033[1m==> %s\033[0m\n' "$1"; }
ok()   { printf '   \033[32mok\033[0m  %s\n' "$1"; }
warn() { printf '   \033[33m!\033[0m   %s\n' "$1"; }
die()  { printf '\n\033[31mfailed:\033[0m %s\n' "$1" >&2; exit 1; }

# ---------- preflight ----------
step "Checking inputs"
[ -f "$SRC" ] || die "source not found: $SRC"
case "$DEST_NAME" in
  *.mp4) ;;
  *) die "destination must end in .mp4 (got: $DEST_NAME)" ;;
esac
case "$DEST_NAME" in
  *" "*) die "destination name has a space: '$DEST_NAME'. Use no spaces — the name becomes a URL path segment." ;;
esac
command -v ffmpeg  >/dev/null || die "ffmpeg not installed (brew install ffmpeg)"
command -v ffprobe >/dev/null || die "ffprobe not installed (brew install ffmpeg)"
mkdir -p "$VIDEOS_DIR"
ok "source: $SRC"
ok "destination: public/videos/$DEST_NAME"

if [ -e "$DEST" ] && [ "$DRY_RUN" -eq 0 ]; then
  warn "public/videos/$DEST_NAME already exists and will be overwritten."
  warn "Overwriting an existing R2 object can leave Cloudflare serving a cached 404 —"
  warn "see references/troubleshooting.md if the URL 404s after this finishes."
fi

# ---------- codec ----------
step "Probing codec and bitrate"
CODEC="$(ffprobe -v error -select_streams v:0 -show_entries stream=codec_name -of csv=p=0 "$SRC" | tr -d '[:space:]')"
RES="$(ffprobe -v error -select_streams v:0 -show_entries stream=width,height -of csv=p=0 "$SRC" | tr -d '[:space:]')"
BITRATE="$(ffprobe -v error -show_entries format=bit_rate -of default=nw=1:nk=1 "$SRC" 2>/dev/null | tr -d '[:space:]')"
[ -n "$BITRATE" ] && [ "$BITRATE" != "N/A" ] || BITRATE=0
MBPS="$(awk -v b="$BITRATE" 'BEGIN{printf "%.1f", b/1000000}')"
SIZE_MB="$(du -m "$SRC" | cut -f1)"
ok "codec=$CODEC  ${RES}  ${MBPS}Mbps  size=${SIZE_MB}MB"

# HEVC/H.265 is what iPhone HDR exports produce and Chrome/Firefox generally will
# not decode it in a <video> tag, so it has to become H.264 even though that costs
# a real re-encode. H.264 only needs a container rewrite, which is lossless + fast.
if [ "$CODEC" = "hevc" ]; then
  warn "HEVC detected — re-encoding to H.264 (slow, but browsers can't play HEVC)"
  VIDEO_ARGS=(-c:v libx264 -preset slow -crf 21 -maxrate 16M -bufsize 32M -pix_fmt yuv420p)
elif [ "$WEB_ENCODE" -eq 1 ]; then
  warn "--web-encode: re-encoding to a streamable bitrate (slow, lossy, but plays everywhere)"
  VIDEO_ARGS=(-c:v libx264 -preset slow -crf 21 -maxrate 16M -bufsize 32M -pix_fmt yuv420p -profile:v high)
else
  VIDEO_ARGS=(-c:v copy)
fi

# Camera masters come off the card at 35-40Mbps and stream-copying keeps them there.
# Faststart makes such a file *start*, then it stalls anyway because the viewer can't
# sustain the throughput. Every clip in this library that plays reliably sits at or
# below ~15Mbps, so that's the line worth flagging. Not a hard block: shipping a 4K
# master is a legitimate call, it just shouldn't happen by accident.
BITRATE_CEILING=16000000
if [ "$WEB_ENCODE" -eq 0 ] && [ "$CODEC" != "hevc" ] && [ "$BITRATE" -gt "$BITRATE_CEILING" ] 2>/dev/null; then
  warn "${MBPS}Mbps is above the ~16Mbps that reliably streams here."
  warn "This looks like an untouched camera master. Faststart alone will NOT fix"
  warn "playback for it — viewers who can't sustain ${MBPS}Mbps will still stall."
  warn "Re-run with --web-encode to transcode it down, or continue if 4K is intended."
fi

if [ "$DRY_RUN" -eq 1 ]; then
  step "Dry run — stopping before any writes"
  echo "   would write:  public/videos/$DEST_NAME"
  echo "   would upload: videos/$DEST_NAME"
  exit 0
fi

# ---------- transcode / remux with faststart ----------
step "Writing H.264 + faststart"
TMP="$VIDEOS_DIR/.publishing-$DEST_NAME"
trap 'rm -f "$TMP"' EXIT
if ! ffmpeg -loglevel error -i "$SRC" "${VIDEO_ARGS[@]}" -c:a copy -movflags +faststart -y "$TMP" 2>/dev/null; then
  warn "stream-copying audio failed; re-encoding audio to AAC"
  ffmpeg -loglevel error -i "$SRC" "${VIDEO_ARGS[@]}" -c:a aac -b:a 192k -movflags +faststart -y "$TMP" \
    || die "ffmpeg could not process $SRC"
fi
mv "$TMP" "$DEST"
trap - EXIT
ok "wrote public/videos/$DEST_NAME ($(du -m "$DEST" | cut -f1)MB)"

# ---------- verify faststart BEFORE uploading ----------
# This is the gate. Whichever of moov/mdat appears first wins: moov first means the
# player gets metadata immediately and can start streaming.
step "Verifying faststart"
FIRST_ATOM="$(ffprobe -v trace -i "$DEST" 2>&1 | grep -oE "type:'(moov|mdat)'" | head -1 | grep -oE 'moov|mdat' || true)"
[ "$FIRST_ATOM" = "moov" ] || die "moov atom is not first (found '${FIRST_ATOM:-none}'). Refusing to upload — this file would stall in the browser."
ok "moov atom is first — will stream immediately"

# ---------- upload ----------
# upload-to-r2.js reads process.env only; it does not read .env on its own, which is
# why this sources it explicitly. Named file (never --all) so we don't resend the library.
step "Uploading to R2"
[ -f "$REPO_ROOT/.env" ] || die ".env not found at repo root (needs R2_* credentials)"
set -a
# shellcheck disable=SC1091
source "$REPO_ROOT/.env"
set +a
(cd "$REPO_ROOT" && node scripts/upload-to-r2.js "$DEST_NAME") || die "upload failed"

# ---------- verify it actually serves ----------
step "Verifying the public URL"
BASE="${R2_PUBLIC_URL:-}"
[ -n "$BASE" ] || { warn "R2_PUBLIC_URL not set; skipping URL check"; exit 0; }
URL="${BASE%/}/videos/$DEST_NAME"

# Range request rather than a plain HEAD: 206 proves range streaming works, which is
# what the <video> element actually relies on to seek and progressively load.
HEADERS="$(curl -s -D - -o /dev/null -r 0-1023 "$URL" || true)"
CODE="$(printf '%s' "$HEADERS" | grep -iE '^HTTP/' | tail -1 | awk '{print $2}')"

if [ "$CODE" = "206" ] || [ "$CODE" = "200" ]; then
  ok "$URL -> $CODE (range streaming works)"
else
  printf '   \033[31m%s -> %s\033[0m\n' "$URL" "${CODE:-no response}"
  if printf '%s' "$HEADERS" | grep -qi 'cf-cache-status: HIT'; then
    warn "Cloudflare served this from cache. A stale cached 404 can survive a successful"
    warn "upload — the file is fine on R2, the edge just remembers it missing."
    warn "Fix: Cloudflare dashboard -> your zone -> Caching -> Configuration -> Custom Purge"
    warn "     purge exactly: $URL"
  fi
  die "uploaded, but the public URL is not serving. See references/troubleshooting.md"
fi

# ---------- hand back what to paste ----------
step "Next: register it in src/constants/videos.ts"
cat <<SNIPPET

  {
    id: '<artist>-<song>',
    title: '<Artist> <Song>',
    client: '<ARTIST>',
    artist: '<ARTIST>',
    song: '<SONG>',                                   // caption renders "SONG | LOCATION"
    tour: videoTourFilterLabel('<Artist>', '<Tour>'), // omit if the client said not to tag it
    year: <YEAR>,
    location: '<CITY>',
    category: 'music-video',
    videoUrl: getVideoUrl('$DEST_NAME'),
    thumbnail: getVideoUrl('$DEST_NAME'),
    featured: true,
  },

SNIPPET
echo "Then: npm run type-check"
