#!/usr/bin/env bash
# Make the Videos-grid still for a clip: src/assets/posters/<Name>.jpg
#
#   scripts/make-poster.sh public/videos/<Name>.mp4 [seconds]
#
# seconds = the video's thumbnailTime in videos.ts, or 1 (the default the grid always used).
#
# Picks the frame a browser shows after video.currentTime = seconds, i.e. the last frame at or
# before that time; `ffmpeg -ss` takes the first one after it, which on fast cuts is a different
# picture. HDR (HLG/PQ) clips are tone-mapped close to how browsers display them (settings were
# matched against Chrome on this site's own HDR clips); without that they come out washed out.
set -euo pipefail

src=${1:?usage: make-poster.sh <video.mp4> [seconds]}
t=${2:-1}
out="$(cd "$(dirname "$0")/.." && pwd)/src/assets/posters/$(basename "$src" .mp4).jpg"

vf="scale=w=960:h=960:force_original_aspect_ratio=decrease"
info=$(ffmpeg -hide_banner -i "$src" 2>&1 || true)
if grep -qE 'arib-std-b67|smpte2084' <<<"$info"; then
  vf="zscale=t=linear:npl=500,format=gbrpf32le,zscale=p=bt709,tonemap=clip:desat=0,zscale=t=bt709:m=bt709:r=tv,format=yuv420p,$vf"
fi

ffmpeg -nostdin -v error -i "$src" -t "$(awk -v t="$t" 'BEGIN { print t + 0.001 }')" \
  -vf "$vf" -update 1 -q:v 4 -y "$out"
echo "poster: ${out#"$(pwd)/"}"
