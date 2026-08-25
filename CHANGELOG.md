# Changelog

Notable changes to the NOL portfolio site.

Portfolio media is not versioned here in detail — individual photo and video
additions are listed by delivery, since that is how the work actually arrives.

Format loosely follows [Keep a Changelog](https://keepachangelog.com/en/1.1.0/).

---

## 2026-08-24

### Added

- **Nine Vicious** work from the client delivery: 5 photos and the `SAY WHAT?`
  video (`NINE VICIOUS - EMOTIONS TOUR`, caption `SAY WHAT? | CHICAGO`).
- **`imanol-publish` skill** (`.claude/skills/imanol-publish/`) — one command takes a
  client video from the delivery folder to live on R2, handling codec conversion,
  faststart, upload and URL verification, plus reference docs for photos and
  troubleshooting.
- `CHANGELOG.md` (this file).

### Changed

- **Site-wide ordering is now purely newest → oldest.** Removed the pin lists from
  `photos.ts` and `videos.ts` entirely; order comes from the stable year sort plus
  each shoot's position in the source array.
  - Photos: ROMMULAS → DGNR8 → NINE VICIOUS → Sofaygo → SahBabii → Don Toliver → …
  - Videos: ROMMULAS (`PROBLEMA`) → NINE VICIOUS (`SAY WHAT?`) → …
  - Note: Don Toliver was previously pinned to the top and now sits in its real
    June date position.
- **Lead photo per artist** set from client direction — Rommulas, DGNR8 and Nine
  Vicious each now open with a specific chosen frame. Display order is the shoot
  JSON's array order; the `NN` filename suffix is a stable ingest identifier and no
  longer implies position.
- **Caption legend hidden** on the Videos and Photos pages. The `VideoFormatLegend`
  component is deliberately kept and ready to re-enable via `SubpageHeader`'s `aside`
  prop — it is not dead code.
- **Page headings flush left.** The Videos/Photos headers and filter bars previously
  sat in a centred `container` (capped at 1536px) while the grid ran nearly
  full-width, leaving the title indented ~165px from the content on wide screens.
  Header, filter bar and grid now share one width.

### Fixed

- **404 pages advertised themselves as indexable.** `useMetaTags` hardcoded
  `robots: index, follow` on every route, so every mistyped or stale URL — all of
  which render the 404 — invited itself into the search index. Added a `noindex`
  option, applied to the 404 and the thank-you page. The tag is still written on
  every page rather than skipped, so a noindex page can't leak its setting onto the
  next route in this single-page app.
- **`/about` had no SEO at all** — no title, description, canonical or breadcrumb
  data, and it was missing from `sitemap.xml`. In a single-page app that means it
  silently inherited whatever metadata the previously-viewed page had left behind.
  Now wired up like every other route and listed in the sitemap.
- **Duplicate `<h1>` elements** on `/about` (2) and `/other` (3). The Lost Files hero
  stacks the same words three times for its offset visual; the repeats are now
  decorative `div`s hidden from assistive tech, leaving one real heading. Styling and
  animation are untouched, so the effect is unchanged.
- **Stale sitemap.** Every `lastmod` read `2025-01-15`, which tells crawlers nothing
  has changed on pages that update most often.
- **SEO pointed at a domain that doesn't exist.** `BASE_URL` was
  `https://nolvideography.com`, which does not resolve — so canonical tags, Open
  Graph metadata, structured data, `sitemap.xml` and `robots.txt` were all sending
  search engines and link previews to a dead host. Now `https://www.imanolvillagomez.com`
  (the site 307-redirects the apex to `www`, so `www` is canonical).
  `useMetaTags` kept its own second copy of `BASE_URL`, meaning a domain change in
  one place would silently leave canonical tags on the old host — it now imports the
  single definition from `constants/seo.ts`.
- **Videos stalling for viewers on large clips.** `VIKING`, `MM3` and `PROBLEMA` were
  published as untouched 4K camera masters at 37–41 Mbps — more sustained throughput
  than an ordinary connection can hold, so playback started and then hung. Re-encoded
  to ~15 Mbps (matching `TheHellpPromo`, the 4K clip that always streamed fine),
  keeping full resolution: **667MB → 275MB total, a 59% cut**. `publish-video.sh` now
  warns above ~16 Mbps so this cannot ship unnoticed again.
- **Client deliveries no longer risk breaking the push.** `.gitignore` previously
  named each staging folder, so every new drop was unprotected until someone
  remembered to add it — and one >100MB file caught in a commit makes GitHub reject
  the entire push. Root-level directories are now ignored by default with the
  project's own directories allowlisted, so an unfamiliar client folder is invisible
  to git the moment it appears.

---

## 2026-08-23

### Added

- **Rommulas and DGNR8** work from the 8.22.26 delivery: 20 photos and the
  `PROBLEMA` video (`ROMMULAS - RHEA SILVIA TOUR`, `DGNR8 - US TOUR`).

### Changed

- Featured items pinned above the recency sort (superseded on 2026-08-24).

### Fixed

- **Photos page column order.** The grid used CSS multi-column, which fills column 1
  top-to-bottom before starting column 2 — so the newest photos stacked vertically
  instead of forming the top row. Now distributed round-robin across columns, making
  sort order read as an actual first row.
- **Black-frame thumbnails.** Added an optional `thumbnailTime` field on videos so a
  clip that opens on black can show a real frame instead (used for the NETTSPEND
  Milwaukee reel).
