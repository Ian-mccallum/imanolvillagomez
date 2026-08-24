# Troubleshooting

Failures this project has actually hit, and how each was diagnosed.

## A video stalls, buffers forever, or never starts

**Two distinct causes produce identical symptoms.** Check both before concluding —
they need completely different fixes, and fixing the wrong one changes nothing.

Run this first; it separates them in one shot:

```bash
f=public/videos/NAME.mp4
echo "first atom: $(ffprobe -v trace -i "$f" 2>&1 | grep -oE "type:'(moov|mdat)'" | head -1)"
ffprobe -v error -select_streams v:0 -show_entries stream=width,height \
  -show_entries stream_tags=encoder -show_entries format=bit_rate -of default=nw=1 "$f"
```

- `mdat` first → **cause 1, faststart** (below).
- `bit_rate` above ~16,000,000, or an `encoder` tag that is bare `H.264` rather than
  something starting `Lavc.../libx264` → **cause 2, camera-master bitrate**.

Both can be true at once.

### Cause 2 — bitrate too high to stream

A clip straight off the camera runs 35–40Mbps at 4K. The viewer needs to sustain
roughly 5MB/s for the entire runtime or the buffer never fills, so it spins forever
no matter how perfect the container is. Faststart does **not** help here: the video
starts and *then* stalls.

The tell is the `encoder` tag. Files that went through a real encode carry
`Lavc…libx264`; untouched masters carry a bare `H.264` from the camera. In this
library everything that plays reliably sits at or below ~15Mbps, and
`TheHellpPromo.mp4` is proof a 4K file is fine at that rate — resolution isn't the
problem, bitrate is.

Fix by re-encoding with a ceiling, then republishing:

```bash
.claude/skills/publish-work/scripts/publish-video.sh <source> NAME.mp4 --web-encode
```

`--web-encode` caps at 16Mbps and keeps the original resolution. To cut further for
phones, add `-vf scale=-2:1440` to a manual `ffmpeg` pass. This is lossy and
irreversible on the copy it writes, so keep the master in the staging folder.

`publish-video.sh` warns when a source exceeds the ceiling but does not block —
shipping a 4K master is a legitimate choice, it just shouldn't happen unnoticed.
Note that neither `optimize-videos-for-r2.sh` nor `check-video-faststart.sh` can
detect this: both only look at container structure, and will report a 39Mbps file as
"optimized".

### Cause 1 — missing faststart

The `moov` atom (the index the player needs before it can render anything) sits at
the *end* of the file, so the browser must download nearly the entire thing first. A
50MB clip gets away with it; a 300MB clip looks completely broken.

Check which atom comes first:

```bash
ffprobe -v trace -i public/videos/NAME.mp4 2>&1 | grep -oE "type:'(moov|mdat)'" | head -1
```

`moov` = fine. `mdat` = broken.

Fix — lossless container rewrite, no re-encode, seconds even for large files:

```bash
ffmpeg -i public/videos/NAME.mp4 -c:v copy -c:a copy -movflags +faststart -y /tmp/fixed.mp4
mv /tmp/fixed.mp4 public/videos/NAME.mp4
```

Then re-upload. `publish-video.sh` does this automatically and refuses to upload
without it, so this only comes up for files published before that gate existed.

Survey the whole library at once with `./scripts/check-video-faststart.sh`.

## URL 404s on the custom domain but works on r2.dev

The file is fine on R2 — Cloudflare's edge cached a 404 and keeps serving it. This
happens when a request lands during the window where an object is being overwritten.

Confirm it's a cached negative rather than a genuinely missing object:

```bash
curl -sI https://videos.imanolvillagomez.com/videos/NAME.mp4 | head -8
```

The signature is a `404` together with `cf-cache-status: HIT` and a non-zero `age:`.
A real missing file shows `age: 0` or no cache hit.

**Fix requires the Cloudflare dashboard** — `.env` holds R2 storage keys only, which
cannot purge cache, so this can't be scripted with what's in the repo:

Cloudflare → the `imanolvillagomez.com` zone → **Caching → Configuration → Custom
Purge** → enter the exact failing URL → Purge.

Takes effect within seconds. Re-run the curl to confirm `200`.

## Video plays nowhere / decode error in Chrome and Firefox

HEVC (H.265), which those browsers won't decode in a `<video>` tag. Common in iPhone
HDR exports.

```bash
ffprobe -v error -select_streams v:0 -show_entries stream=codec_name -of csv=p=0 FILE.mp4
```

`hevc` needs a real re-encode to H.264 (unlike faststart, this is lossy and slow).
`publish-video.sh` detects and handles it; otherwise
`./scripts/reencode-hevc-to-h264-web.sh FILE.mp4`, then re-upload.

## Push rejected, or a commit is enormous

A client staging folder got swept into a commit. GitHub hard-rejects any file over
100MB, and these drops routinely contain 300–600MB zips and videos.

```bash
git ls-tree -r -l HEAD | sort -k4 -n -r | head -5
```

If the commit is **not yet pushed**, remove the files and amend. A follow-up "remove
them" commit does *not* work — git still has to transmit the oversized blobs from the
parent commit, so the push fails anyway:

```bash
git rm -r --cached "<staging folder>" "<staging>.zip"
# add the paths to .gitignore
git add .gitignore && git commit --amend --no-edit
```

Reclaim the disk space afterwards with `git reflog expire --expire=now --all && git gc --prune=now`.

Prevention: `.gitignore` carries a `UPDATED WOR[Kk]*` glob, but new drops arrive under
unpredictable names. Always check `git status --short --untracked-files=all` before
staging.

## Photos appear in the wrong order on screen

If the data order is right but the page looks scrambled, check whether the grid is
using CSS multi-column (`columns-1 sm:columns-2 …`). That fills column 1 completely
top-to-bottom before starting column 2, so the "first" items stack vertically instead
of forming the top row — correct data, wrong-looking page.

`PhotosPage.tsx` distributes round-robin (`index % columnCount`) to avoid this. If a
new grid is added elsewhere, it needs the same treatment.

## A thumbnail is a black frame

The clip opens on black. Set `thumbnailTime` (seconds) on that video's entry in
`videos.ts` and the card seeks there for the still and hover preview:

```ts
thumbnailTime: 3,
```

## Verifying a deploy actually landed

A green Vercel build doesn't prove the assets are reachable. Note the site redirects
to the `www` host, so follow redirects:

```bash
curl -sL -o /dev/null -w "%{http_code}\n" https://www.imanolvillagomez.com/images/<file>.jpg
```

For videos, request a byte range — `206` proves range streaming works, which is what
the `<video>` element relies on to seek and progressively load:

```bash
curl -s -o /dev/null -w "%{http_code}\n" -r 0-1023 https://videos.imanolvillagomez.com/videos/<file>.mp4
```

## Uploading

`scripts/upload-to-r2.js` reads `process.env` only — it does not load `.env` itself:

```bash
set -a && source .env && set +a
node scripts/upload-to-r2.js NAME.mp4
```

Name files explicitly. `--all` re-uploads the entire library, which is slow and
pointlessly re-transfers hundreds of megabytes that are already there.
