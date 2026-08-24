---
name: imanol-publish
description: Publish new client work to the NOL portfolio site — upload videos to Cloudflare R2, add photos, register everything in videos.ts/photos.ts with the right names, tour tags and ordering, then deploy. Use this whenever new work needs to go on the site: a client delivery or staging folder has landed, videos need uploading to R2, photos need adding to the grid, or someone asks where to put new footage. Also use it when a published video won't load or stalls partway, when a video URL 404s on the custom domain but works on r2.dev, or when the order of photos/videos on the site needs changing.
---

# Publishing new work to the NOL site

## How this site stores media

Videos and photos are handled differently, and mixing them up is the root of most
problems here.

| Thing | Lives at |
|---|---|
| **Video files (production)** | Cloudflare R2, object key `videos/<Name.mp4>` |
| Video URLs used by the app | `src/constants/videos.ts` via `getVideoUrl('Name.mp4')` |
| Local video copies | `public/videos/` — gitignored, dev fallback only |
| **Photo files** | `public/images/` — committed to git and served by Vercel |
| Photo data | `src/constants/data/photos-shoot-<YYYYMMDD>.json` + `src/constants/photos.ts` |
| R2 credentials | `.env` at repo root (gitignored) |

**The basename rule:** the string inside `getVideoUrl('...')` must exactly match the
filename in `public/videos/` *and* the R2 object key after `videos/`. Three places,
one spelling. A mismatch produces a silent 404 at runtime rather than a build error,
so it's worth a glance before shipping.

Videos never go into git — they're far too large and GitHub rejects anything over
100MB. Photos do go into git.

## Before touching files: resolve ambiguity

Client instructions routinely leave gaps, and guessing wrong means redoing the work
and re-uploading hundreds of megabytes. Read the delivery notes against what's
actually in the folder, and ask about mismatches rather than picking a default:

- **Missing assets.** A named video or photo set that isn't in the folder. Check any
  accompanying `.zip` before concluding it's absent — then ask.
- **No location given.** Video captions render as `SONG | LOCATION`. If the notes
  name a song but no city, ask. (`CHICAGO` is the codebase's convention for unknown,
  but confirm — it's visible on the page.)
- **Ordering that conflicts with what's already pinned.** "Put X at the top" may mean
  replacing the current pins or sitting beneath them. Ask which.
- **Spelling.** Folder names drift from the client's intended spelling
  (`NINE VISCOUS` vs `NINE VICIOUS`). The written instructions win; the site is what
  the public reads.
- **Footage that's already published under a different name.** Clients re-send the
  same cut with a new song title. Publishing it again puts identical footage on the
  site twice, and it costs a pointless multi-hundred-MB upload. Compare the video
  bitstream — not file size, which shifts by a few KB after a faststart remux:

  ```bash
  ffmpeg -v error -i "<source>" -map 0:v -f md5 -
  ffmpeg -v error -i public/videos/<Existing>.mp4 -map 0:v -f md5 -
  ```

  Matching hashes usually mean the piece was renamed, so the fix is editing the
  existing entry's `song`/`id`/`title` rather than adding a second one. Confirm which
  before uploading.

## Videos

One command does the whole mechanical pipeline — codec check, H.264 conversion if
needed, faststart, copy into `public/videos/`, upload to R2, and verification that
the URL actually streams:

```bash
.claude/skills/imanol-publish/scripts/publish-video.sh "<source file>" "<Name.mp4>"
```

Add `--dry-run` to see what it would do without writing or uploading anything.

Pick a destination name that's ASCII with no spaces, matching the client's title for
the piece (`PROBLEMA.mp4`, `VIKING.mp4`, `TheHellpPromo.mp4`). The name becomes a
public URL path segment.

The script guards the two ways a video ships looking fine and plays badly:

- **Faststart** is a hard block. Without the `moov` atom at the front, a large file
  uploads cleanly and then hangs forever in the browser. This shipped broken twice
  before the gate existed.
- **Bitrate** is a warning. Camera masters run 35–40Mbps at 4K, which no ordinary
  connection can sustain — the clip starts, then stalls, and faststart doesn't help.
  Everything in this library that plays reliably is at or below ~15Mbps. Re-run with
  `--web-encode` to transcode down. It warns rather than blocks because shipping a 4K
  master is a legitimate call; it just shouldn't happen by accident. Note the source
  is left untouched, so the master stays available.

When it finishes it prints a ready-to-fill entry for `src/constants/videos.ts`. Paste
it into the `videosChronological` array and fill in the fields:

- `song` + `location` produce the caption `SONG | LOCATION`.
- For a three-part caption, put the first two parts in `song`
  (`song: 'PROMO | THE HELLP'`, `location: 'LOS ANGELES'` → `PROMO | THE HELLP | LOS ANGELES`).
- `tour` uses the `videoTourFilterLabel(artist, tourName)` helper. **Omit it entirely**
  if the client said not to tag that piece — an untagged video still appears under its
  artist and year.
- `thumbnailTime: <seconds>` if the clip opens on a black frame, so the still shows a
  real frame instead of darkness.

Then `npm run type-check`.

## Photos

Photos have more fiddly rules than videos — naming, per-shoot data files, tour
mapping, and display order. Read `references/photos.md` before adding any.

## Ordering and pinning

Both `photos.ts` and `videos.ts` export their arrays through the same two-stage
pipeline: a stable sort by year descending, then an explicit pin list lifted above it.

```ts
const PINNED_VIDEO_IDS = ['thehellp-promo', 'rommulas-problema'];
const PINNED_PHOTO_CLIENTS = ['Don Toliver', 'ROMMULAS', 'DGNR8'];
```

Because the year sort is *stable*, items sharing a year keep the order they have in
the source array — so within a year, position is controlled by where you insert the
entry, and the pin lists override everything regardless of year.

To put new work at the very top, add its id (videos) or client name (photos) to the
relevant pin list, in the order the client asked for.

Don't rely on reading the code to confirm the result — verify against the real data:

```bash
cat > /tmp/ordercheck.ts <<'EOF'
import { photos } from '@/constants/photos';
import { videos } from '@/constants/videos';
console.log('videos:', videos.slice(0, 5).map(v => v.id));
console.log('photo clients:', [...new Set(photos.slice(0, 30).map(p => p.client))]);
EOF
npx vite-node /tmp/ordercheck.ts
```

(`vite-node` needs a file path — it won't read a heredoc on stdin. It resolves the
`@/` alias, which is why plain `node` or `tsx` won't work here.)

Note the Photos page distributes items round-robin across columns so that sort order
reads as a true top row. CSS multi-column would fill column 1 top-to-bottom first,
which makes correct data look wrong on screen.

## Shipping it

1. **Check the staging folder is gitignored.** Client drops arrive with names like
   `UPDATED WORK 8.22.26/` alongside multi-hundred-MB zips. The `.gitignore` glob
   covers `UPDATED WOR[Kk]*`, but confirm — a stray drop caught in a commit means
   GitHub rejects the push outright and the commit has to be rewritten.

   ```bash
   git status --short --untracked-files=all
   ```

   Everything listed should be photos, constants, or data files. No zips, no `.mp4`,
   no staging directories.

2. **Build the way Vercel will**, so failures surface locally rather than in the deploy:

   ```bash
   npm run build
   ```

3. Commit and push (only when asked). Then confirm the deploy actually served the new
   files — a green build doesn't prove the assets are reachable:

   ```bash
   curl -s -o /dev/null -w "%{http_code}\n" https://www.imanolvillagomez.com/images/<new-photo>.jpg
   ```

## When something's wrong

`references/troubleshooting.md` covers the failures this project actually hits:
videos that stall or won't play, a URL that 404s on the custom domain while working
on r2.dev, HEVC files, oversized commits, and ordering that looks wrong on screen.
