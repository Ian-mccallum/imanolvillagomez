# Adding photos

Photos are committed to git and served by Vercel from `public/images/` — they do not
go to R2. Each shoot gets its own JSON data file, which keeps deliveries reviewable
as discrete units instead of one ever-growing array.

## 1. Name and copy the files

```
public/images/shoot-<YYYYMMDD>-<artist>-<NN>.jpg
```

`YYYYMMDD` is the date the photos were **taken**, not the date the client sent them.
Read it off the file rather than guessing:

```bash
mdls -name kMDItemContentCreationDate -raw "<file>.jpg"
```

Note this returns UTC. A show shot at 9pm Chicago time reports as the following day —
use the local date of the shoot.

`<artist>` is lowercase, no spaces (`dontoliver`, `rommulas`, `dgnr8`). `<NN>` is
zero-padded and defines display order.

**Order is almost always ascending camera frame number** — the first frame the client
listed is the first photo shown. Camera filenames (`DSC04274`, `DSC04276`, …) already
sort correctly, so map them in ascending order. Watch for variants like
`DSC04274-2.jpg`, which sorts after `DSC04274` and before `DSC04276`.

Copy them in one deliberate pass so the mapping is explicit and reviewable:

```bash
i=1
for f in DSC04274-2 DSC04276 DSC04278; do
  printf -v n "%02d" $i
  cp "<staging>/ROMMULAS/$f.jpg" "public/images/shoot-20260820-rommulas-$n.jpg"
  i=$((i+1))
done
```

Then confirm nothing was mis-mapped or silently truncated. Comparing checksums is
worth the extra step — a wrong-order copy is invisible until it's live:

```bash
md5 -q "<staging>/ROMMULAS/DSC04274-2.jpg"
md5 -q public/images/shoot-20260820-rommulas-01.jpg   # must match
```

## 2. Create the shoot data file

`src/constants/data/photos-shoot-<YYYYMMDD>.json`, named for the **delivery** date
(a single drop can contain several shoot dates). Ids continue the global
`photo-2026-NNN` sequence — check the highest existing id first:

```bash
grep -ho '"photo-[0-9]*-[0-9]*"' src/constants/data/*.json | sort | tail -1
```

```json
[
  {
    "id": "photo-2026-060",
    "imageUrl": "/images/shoot-20260820-rommulas-01.jpg",
    "year": 2026,
    "client": "ROMMULAS"
  }
]
```

`client` renders verbatim on the page — it is not auto-uppercased. Match whatever
casing the client's notes use for their name.

## 3. Wire it into photos.ts

Add the import, a tour-mapping function, and the spread — newest shoot first in
`photosChronological`:

```ts
import shootAug2026 from '@/constants/data/photos-shoot-20260822.json';

function tourForAug2026Shoot(client: string | undefined): string {
  switch (client) {
    case 'ROMMULAS': return 'ROMMULAS - RHEA SILVIA TOUR';
    case 'DGNR8':    return 'DGNR8 - US TOUR';
    default:         return 'ROMMULAS - RHEA SILVIA TOUR';
  }
}

const photosChronological: Photo[] = [
  ...(shootAug2026 as Photo[]).map((p) => ({
    ...p,
    tour: p.tour ?? tourForAug2026Shoot(p.client),
  })),
  // ...older shoots below
];
```

Tour labels are ALL CAPS in the form `ARTIST - TOUR NAME` and drive the Tour filter,
so a typo creates a duplicate filter entry rather than an error. Copy the client's
wording exactly.

If the client said not to tag a particular artist, leave that artist out of the switch
and let it fall through — the photos still appear under artist and year.

## 4. Pin if needed

See the ordering section in `SKILL.md`. Photo pins are by `client` name and lift every
photo of that client above the year sort, preserving their relative order.

## A note on file size

These arrive as full-resolution camera JPEGs — frequently 10–17MB each. They're
committed to git permanently and shipped to every visitor at full size, which is the
main driver of slow photo loading on the site.

There's no resize step in the pipeline today. If a delivery is unusually large, it's
worth raising with the user before committing rather than silently adding another
150MB. A resize to ~2000px long edge at quality 80 typically cuts 90%+ with no visible
difference at display size — but don't do it unasked, since it alters the client's
deliverable.
