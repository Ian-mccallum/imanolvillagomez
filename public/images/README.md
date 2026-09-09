# Images Directory

This directory contains image assets that are served directly from the public folder.

## Usage

Images in this directory can be referenced directly in your code:

```tsx
// In HTML/JSX
<img src="/images/logo.png" alt="Logo" />

// Or with require/import in component code
<img src="/images/hero-image.jpg" alt="Hero" />
```

## Naming Convention

**New work uses the shoot convention** — this is what to follow when adding photos:

```
shoot-<YYYYMMDD>-<artist>-<NN>.jpg
```

- `YYYYMMDD` — the date the photos were **taken**, not the delivery date.
- `<artist>` — lowercase, no spaces (`rommulas`, `dgnr8`, `ninevicious`, `ye`).
- `<NN>` — zero-padded, assigned once at ingest in ascending camera frame order.

Examples: `shoot-20260903-ye-01.jpg`, `shoot-20260822-dgnr8-03.jpg`.
`.png` is fine where the source was a PNG (e.g. `shoot-20260903-ye-07.png`) —
deliverables are not re-encoded.

> **`NN` is an identifier, not a position.** Display order is the shoot JSON's
> array order. The two start out matching and deliberately diverge whenever a
> client asks for a specific frame to lead. Renaming files to reorder would churn
> every entry and achieve nothing — reorder the JSON instead.

### Legacy convention

Pre-2026 archive stills use `{artistname}-{number}.jpeg` (`yunglean-1.jpeg`,
`osamason-3.jpeg`, `thehellp-4.jpeg`). These are stable — don't rename them.

## Current Artists

111 photos across 17 clients. Newest first:

| Client | Photos | Shoot |
|---|---|---|
| YE | 7 | `shoot-20260903-ye-*` |
| ROMMULAS | 7 | `shoot-20260820-rommulas-*` |
| DGNR8 | 13 | `shoot-20260814-dgnr8-*` |
| NINE VICIOUS | 5 | `shoot-20260724-ninevicious-*` |
| Sofaygo | 6 | `shoot-20260612-sofaygo-*` |
| SahBabii | 5 | `shoot-20260612-sahbabii-*` |
| Don Toliver | 5 | `shoot-20260612-dontoliver-*` |
| Puma Blue | 15 | `shoot-20260228-puma-*` |
| 1300saint | 7 | `shoot-20260228-roll-*` |
| NETTSPEND | 9 | `shoot-20260228-roll-*` |
| Kels | 2 | `shoot-20260228-roll-*` |
| Salami | 10 | `shoot-20260228-salami-*` |
| Frost Children | 6 | legacy `frostchildren-*` |
| The Hellp | 4 | legacy `thehellp-*` |
| 2hollis | 3 | legacy `2hollis-*` |
| Yung Lean | 4 | legacy `yunglean-*` |
| Osamason | 3 | legacy `osamason-*` |

Counts drift as work is delivered; `src/constants/photos.ts` is the source of truth.

## Image References

Photos are registered per shoot in `src/constants/data/photos-shoot-<YYYYMMDD>.json`
and imported into `src/constants/photos.ts`, which attaches the tour label and
concatenates shoots newest-first. Only the pre-2026 archive is inlined directly in
`photos.ts`.

> **The JSON date and the filename date can differ.** The data file is named for the
> **delivery**, the image files for the **shoot** — one drop can carry several shoot
> dates. `photos-shoot-20260822.json` holds `shoot-20260820-rommulas-*` alongside
> `shoot-20260814-dgnr8-*`. Don't infer one name from the other.

Each photo entry includes:
- `id`: Unique identifier, continuing the global `photo-2026-NNN` sequence
- `imageUrl`: Path to image (e.g., `/images/shoot-20260903-ye-01.jpg`)
- `client`: Artist/client name — rendered **verbatim**, not auto-uppercased
- `year`: Year of the photo (drives the newest-first sort)

Tour labels live in `photos.ts`, not the JSON, and drive the Tour filter — a typo
creates a duplicate filter entry rather than an error.

See the `imanol-publish` skill (`.claude/skills/imanol-publish/references/photos.md`)
for the full ingest procedure.

## Image Optimization

- Use appropriate formats (WebP, AVIF for modern browsers)
- Optimize file sizes for web
- Use descriptive filenames following the artist naming convention
- Include alt text for accessibility
