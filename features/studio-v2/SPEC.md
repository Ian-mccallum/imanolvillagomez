# Studio v2: Drop detail, Library and Insights

Status: ready to implement · Owner: Ian · Written 2026-11-05 · Target implementer: a lead agent (Claude Sonnet 5 or similar) running parallel subagents.

This spec adds three things to the Studio at `studio.imanolvillagomez.com`:

1. **Drop detail.** Open any drop and see exactly what was in it: thumbnails, notes, the conversation, every preview, and where each file ended up on the website.
2. **Library.** Browse every file the site serves (videos in R2, photos in the repo) and the original drop uploads. Fix, rename, replace or remove them safely.
3. **Insights.** Who is looking at the work, which work gets attention, how people find the site, and how it shows up on Google (Search Console).

Before any feature work, read §0 (constraints you must not break) and §11 (setup steps Ian must finish first). Each section names the files it owns, so subagents can work in parallel without conflicts (§12).

---

## 0. Ground rules (read first, never violate)

These come from incidents and from how the Studio is built. Breaking one is a failed implementation, even if the tests pass.

| # | Rule | Why |
|---|------|-----|
| R1 | Nothing changes the live website without a preview Imanol approved. Site-affecting Library edits become **edit drops** that go through the existing runner → preview → **Publish to website** flow. | This approval step is the product's core promise (`documentation/ops/studio.md`). |
| R2 | Never overwrite a live R2 key in place. A replacement gets a new name, the site reference switches over through an edit drop, and the old key goes to trash after the edit is live. | `videos.imanolvillagomez.com` is cached at the Cloudflare edge and the site requests it as immutable. An in-place overwrite would serve stale or mixed bytes. |
| R3 | The AI worker never gets R2, Vercel, Google or Cloudflare credentials. All new secrets live only in Vercel env (Production) or in the root-only `/etc/nol-studio/env`. | The isolation model is in `scripts/art-inbox/vm/doctor.sh`. |
| R4 | Every local import in `api/` code uses an explicit `.js` extension, and Node must be able to load the emitted API. `npm run build` passing is not proof. | Incident 2026-11-04 in `.harness/rules.md`. The regression test is `scripts/art-inbox/studio.test.mjs`. |
| R5 | Vercel Hobby: the whole `api/` directory deploys as one function today (`api/art.ts`). Put shared code in `api/_lib/*.ts`; Vercel does not turn underscore-prefixed files into functions ([discussion](https://github.com/vercel/vercel/discussions/4983)). Keep each request well under 10s. | Function count and duration limits; cold starts. |
| R6 | Keep the Safari WebAuthn rule: fetch the passkey challenge before the tap (`artApi.ts` `prepareSave`/`prepareUnlock`). Don't put any awaits in front of `startAuthentication`. | Documented in `studio.md` → Auth. |
| R7 | The privacy page currently says the site uses no analytics (`src/pages/PrivacyPage.tsx` lines 82–86 and 134–136). Rewrite it **in the same PR** that adds the analytics script. Never ship the script while that text is live. | Legal accuracy. |
| R8 | Imanol is not technical. Use plain language everywhere: no "object", "key", "prefix", "R2", "GSC", "CTR" or status codes in the UI. Put technical details behind a "Details" disclosure. | Product voice (`DESIGN.md`, `documentation/design/studio-workspace.md`). |
| R9 | The Studio is a separate, `noindex` workspace. The analytics script must not run on `studio.imanolvillagomez.com`, `/studio`, `/art`, `*.vercel.app` or localhost. | Keeps the numbers clean, and Imanol's sessions out of the site analytics. |
| R10 | Before changing the runner, follow the operating rules in `studio.md` → Operating it. Check `origin/main` and the VPS. Never enable the laptop timer while the VPS runs. | Incident 2026-11-04. |

Verify with `npm run build`, `npm run lint`, `npm run test:studio`, plus a browser pass of each changed flow (§10).

---

## 1. Current system (facts verified 2026-11-05)

- **Front end:** `src/pages/StudioPage.tsx` (1,603 lines) holds the views `upload | drops | help` (`src/components/art/Workspace.tsx` `StudioView`). `Queue.tsx` renders drop cards. Each card's "Files & notes" disclosure is a plain list of file names (`Queue.tsx:246-293`). Style tokens are in `DESIGN.md`; CSS is in `src/components/art/studio.css`.
- **API:** `api/art.ts` is one handler dispatching on `?action=`. Auth is a 12h HMAC session from `ART_KEY` or a passkey. Storage helpers are `getJson`/`putJson`/`readReq`/`writeReq`. The `ArtRequest` type is duplicated in `api/art.ts:49` and `src/components/art/artApi.ts:19`.
- **Client:** `artApi.ts` `call<T>(action, body)` sends `POST /api/art?action=…` with a Bearer token.
- **Runner:** `scripts/art-inbox/run.mjs` runs on the VPS (`nol-studio.timer`, every 2 min, as user `nol`). The AI runs as `nolai` through `/usr/local/bin/nolai-run`: Cursor first, Claude Code as backup. The runner commits, path-checks, uploads staged videos and pushes previews. `ART_SYNC=1` makes the VPS follow `origin/main`.
- **R2 bucket inventory (64 objects):**

  | Prefix | Objects | Size | Notes |
  |---|---|---|---|
  | `videos/` | 26 `.mp4` | 1.52 GB | Public through `https://videos.imanolvillagomez.com/videos/<name>` |
  | `inbox/<id>/` | 35 (32 jpg + `request.json`) | 0.27 GB | Originals are kept for live drops; only `removed` drops get deleted (`run.mjs` `handleRemoved`) |
  | `auth/` | 2 | — | Passkeys and lockout. **Never list or expose.** |
  | `queue/` | 1 | — | Worker heartbeat. **Never list or expose.** |

- **Photos are not in R2.** They live in git under `public/images/` (465 MB). They're registered through `src/constants/photos.ts`, which imports `src/constants/data/photos-shoot-*.json` (`{id, imageUrl, year, client}`). Sized WebP copies plus `photo-meta.json` (`{w,h,hash,widths,color}`) come from `scripts/prepare-media.mjs` (uses `sharp ^0.34.5`).
- **Videos** are registered in `src/constants/videos.ts` through `getVideoUrl('<file>.mp4')`, which reads `import.meta.env.VITE_R2_PUBLIC_URL`. **This module can't be imported in the Node API** (Vite-only `import.meta.env`), so §4.3 adds a build-time manifest.
- **Analytics:** none on the site. The Vercel project `imanolvillagomez` (`prj_r9omRaiVco4DyAD0zQnxo9Ti2cLr`) has a `webAnalytics` id, but the API answers `web_analytics_not_enabled` (checked with the existing `VERCEL_TOKEN`).
- **DNS:** the `imanolvillagomez.com` zone is on Cloudflare. The `studio` CNAME is DNS-only to Vercel; `videos.` is an R2 custom domain proxied by Cloudflare.

---

## 2. UX principles for this work

Apply these to every screen. Reviewers should check against this list.

1. **Recognition over recall.** Show thumbnails and posters, not file names. A file name is secondary text.
2. **Status always visible, always honest.** Every number states how fresh it is ("Through Nov 3", "Updated 2 h ago"). Every async action has idle, working, done and failed states. Never show a spinner without a label.
3. **Reversible by default; confirm only what can't be undone.** Trash and restore with an **Undo** toast (8s) instead of "Are you sure?". Keep confirmations for publishing (existing) and for emptying trash.
4. **Progressive disclosure.** Lead with the answer ("12 people visited this week, up 30%"), then the chart, then the table, then technical details behind a disclosure.
5. **No dead ends.** Every empty, error or unavailable state names the next action ("Search data appears 2–3 days after Google sees your site", "Ian is connecting Google. Nothing for you to do").
6. **Mobile-first.** Imanol signs in with Face ID. Every flow must work one-handed at 390×844: 44px minimum targets, bottom-sheet details on mobile, side sheet on desktop at ≥1024px.
7. **Keyboard and screen-reader complete.** A roving-tabindex grid, Space for preview, Enter to open, Delete moves to trash, Esc closes, focus returns where it was. Charts get a text summary plus an accessible data table.
8. **Motion with purpose.** 120–240ms opacity/transform only, and `prefers-reduced-motion` removes it all (match `studio.css`).
9. **Deep-linkable.** Each new view and each opened item has a URL hash (`#drop/<id>`, `#library/<path>`, `#insights?range=30d`), so the Back button, refresh and shared links all work.
10. **One visual system.** Use the `DESIGN.md` tokens only. Status colors map: live is sage `#becaa0`, working is amber `#e5c58f`, attention is `#f2b1a5`, primary action is coral `#ef6058`. No new fonts.

---

## 3. Feature A: Drop detail

### 3.1 User stories
- **A1.** As Imanol, after sending a drop I can open it and see every file as a thumbnail, grouped the way I sorted it, with my notes.
- **A2.** I can see what happened to each file: which photo or video it became on the site (with a link), or that it was not used, and why.
- **A3.** I can see the drop's whole history: sent, questions and my answers, change requests, each preview, when it went live.
- **A4.** I can download any original I uploaded.
- **A5.** I can start a new drop from some of these files without uploading them again (P2).
- **A6.** Once the drop is live, I see how its work is doing (visits and loads since it went live; depends on Feature C).

### 3.2 UX
- Opening a drop: tap the card or a "View drop" button. Desktop opens a side sheet (min(720px, 60vw)); mobile opens a full-height bottom sheet with a drag handle. The URL becomes `#drop/<id>`, and Esc or Back closes it.
- Layout, top to bottom:
  1. **Header:** title, status pill (existing `LABEL` map), city, file count and total size, "Sent Nov 5, 3:12 PM".
  2. **Primary action row**, depending on state: Open preview / Publish / Needs changes / Answer / Try again (reuse the logic from `DropRow` and move it into a shared `DropActions.tsx`).
  3. **Timeline:** a vertical list of history events (§3.3) with relative times. Every preview event links to its own preview URL; the newest is marked "Current".
  4. **Files:** grouped by folder (group name and note as a section header). A responsive grid of square tiles (3 columns at 390px, auto-fill at minmax(140px, 1fr)). Each tile shows the thumbnail, a type badge for video, and a placement badge: "On site" (sage), "Not used" (muted), "Pending" (amber) while unknown. Tapping a tile opens a viewer: full image, or video playback through a presigned URL, plus the name, size, label, note, placement and a "Download original" button.
  5. **Performance** (live drops only, once Feature C exists): "Since it went live: N visits to pages showing this work · M video loads". Each number links to Insights, filtered.
- The drop list gets upgraded too: each card shows a thumbnail strip (the first 4 thumbs plus "+N"). Working drops show "Started 6 min ago". When the worker heartbeat is `error`, pending drops say "Waiting for the studio. Ian has been told." instead of the generic queued text.
- Pagination: replace the hard 40 limit with "Show older drops" (cursor = `createdAt` of the last item).

### 3.3 Data model changes (`src/components/art/studioModel.ts` becomes the single source of truth)

Move `ArtRequest`, `ArtFile` and `ArtGroup` into `studioModel.ts`, and import them from both `api/art.ts` (with the `.js` extension, per R4) and `artApi.ts`. Then add:

```ts
export interface DropEvent {
  at: string;                 // ISO
  type: 'sent' | 'queued' | 'working' | 'question' | 'answer' | 'revision'
      | 'preview' | 'approved' | 'live' | 'failed' | 'retry' | 'removed';
  text?: string;              // answer/revision text, question list joined, failure reason for Ian
  previewUrl?: string;        // on 'preview'
  sha?: string;               // on 'preview' / 'live'
  by: 'imanol' | 'studio';
}

export interface Placement {
  file: string;               // ArtFile.name (path inside the drop)
  kind: 'photo' | 'video' | 'unused';
  siteId?: string;            // Photo.id or Video.id
  siteUrl?: string;           // public URL of the asset (image path or videos.* URL)
  page?: '/work/photos' | '/work/videos' | '/';
  reason?: string;            // for 'unused' (duplicate, out of focus, per instructions…)
}

export interface ArtRequest {
  /* existing fields … */
  kind?: 'drop' | 'edit';     // default 'drop' (see Feature B edit drops)
  history?: DropEvent[];      // append-only, max 200 entries
  placements?: Placement[];   // written by runner from result.json, revalidated
  thumbs?: Record<string, string>; // ArtFile.name -> R2 key of a WebP thumbnail
  liveAt?: string;
  previewSha?: string;        // already used by runner; make it typed
}
```

- Add an `appendEvent(r, event)` helper in `studioModel.ts`: it caps the list at 200 and drops a duplicate when the last event has the same type and text. Use it everywhere status changes: every API action (`submit`, `reply`, `revise`, `retry`, `approve`, `remove`) and every runner transition (`handlePending`, `handleApproved`, the worker-down path). Old drops without `history` show a reconstructed timeline from `createdAt`, `answers`, `revisions`, `updatedAt` and `status`. Write this as a pure `timelineFor(r)` with a unit test.

### 3.4 Thumbnails
- **New drops (primary path):** the browser already decodes previews (`mediaPreview.ts`, `imageDecoders.ts`, HEIC/TIFF/RAW support). At upload, also render a 480px-max-edge WebP (quality 0.78) per image or video poster using `canvas.toBlob('image/webp')`. `start` returns a second presigned PUT per file for `inbox/<id>/thumbs/<n>.webp`, where `n` is the file's index. A failed thumbnail upload must never block the drop: mark that thumb missing and continue. `submit` records `thumbs`.
- **Old drops (backfill):** the runner, while handling any drop without `thumbs`, also makes thumbnails with `sharp` (images) and `ffmpeg -ss 1 -frames:v 1` (videos) and writes them to `inbox/<id>/thumbs/`. That runs as `nol`, not `nolai`: it's trusted code and needs R2. Add a one-off script, `scripts/art-inbox/backfill-thumbs.mjs`, for existing live drops (idempotent; prints a dry run unless `--write`).
- **Serving:** add an `urls` action that takes `{ id, names[] }` and returns 10-minute presigned GET URLs for thumbs, or originals when `download: true` (which sets `ResponseContentDisposition: attachment; filename="…"`). Cap 200 per call. The client caches URLs in memory until 1 minute before they expire.

### 3.5 Placements (where each file went)
- Extend the runner prompt (`run.mjs` `prompt()`) and `.claude/skills/imanol-publish/SKILL.md`: on `preview`, `result.json` must include `"placements": [{ "file": "<path as given>", "kind": "photo"|"video"|"unused", "siteId": "...", "siteUrl": "...", "reason": "..." }]`.
- The runner validates placements before storing them: drop entries whose `file` isn't in `r.files`; keep `siteId`/`siteUrl` only if they appear in the branch's diff of `photos.ts`/`videos.ts`/`src/constants/data/*.json`, or in the uploaded videos; truncate strings (200 chars); add any file that's missing as `kind: 'unused', reason: 'not reported'`. Never trust AI output beyond this. Store them in `r.placements`.
- Cursor and Codex read the same skill (`nolai-run` prepends it), so one skill edit covers every provider.

### 3.6 API actions (all session-gated)

| Action | Method | Body | Returns |
|---|---|---|---|
| `get` | POST | `{ id }` | `{ request }` (full, including history/placements/thumbs) |
| `list` | GET | `?before=<createdAt>&limit=20` | `{ requests, worker, next? }`. Keep the default response compatible with existing clients |
| `urls` | POST | `{ id, names: string[], download?: boolean }` | `{ urls: Record<name, string> }` |
| `start` | POST | existing + `thumbs: boolean[]` | existing + `thumbUploads?: {index, url}[]` |

### 3.7 Acceptance criteria
- A live drop with 14 photos shows 14 thumbnails within 1.5s on a cold load over a throttled "Fast 4G" connection (thumbnails ≤ 40 KB each).
- Every file shows a placement state. `On site` links open the right photo or video on production.
- The timeline shows every status change made after deploy, and a reconstructed timeline for older drops.
- Download gives the exact original bytes (SHA-256 matches the uploaded file in a test).
- `#drop/<id>` deep link works after a refresh. Back closes the sheet. Focus returns to the card.
- Missing thumbnails fall back to a typed placeholder (camera/video glyph and file extension), never a broken image.

---

## 4. Feature B: Library

### 4.1 What it is
One place to see **everything the site shows and everything Imanol ever uploaded**, and to change it safely. There are three tabs:

1. **On the site:** every photo and video that's live, in site order, built from the site manifest (§4.3). This is the main tab.
2. **Uploads:** the original files from every drop (`inbox/<id>/files/*`), grouped by drop.
3. **Trash:** soft-deleted files (`trash/…`). Each one has a restore button and shows the days left before it's purged.

Raw storage paths are never the main view. Technical info (path, size, type, upload date, last fetched) lives in a "Details" disclosure inside the item sheet.

### 4.2 Operations and their safety class

| Operation | Allowed on | Class | Mechanism |
|---|---|---|---|
| Preview / play / download | everything listed | read | presigned GET (10 min) |
| Rename | not-in-use files in `videos/`, `inbox/*/files/` | immediate, reversible | CopyObject → verify ETag/size → DeleteObject; audit event; Undo renames back |
| Move to trash | not-in-use files | immediate, reversible | CopyObject to `trash/<yyyymmdd>/<original-path>` + write `trash/<…>.meta.json` `{from, at}` + Delete; Undo restores |
| Restore | trash | immediate | reverse of the above; refuses if the original path is taken (offers "Restore as copy") |
| Upload a new video file | `videos/` | immediate | presigned PUT; name must match `^[A-Za-z0-9._-]+\.mp4$`; refuses existing keys; the client runs a faststart check (§4.6) |
| Hide or remove from site, change title/artist/city/order, replace a photo or video | anything **in use** | **edit drop (R1)** | creates `kind: 'edit'` request with structured `ops` (§4.4) → runner → preview → Publish |
| Empty trash now | trash | irreversible | confirm dialog naming the count and size; otherwise the R2 lifecycle rule purges after 30 days |

"In use" means referenced by the production site manifest **or** listed in `uploaded` on any non-removed drop. The server re-checks this on every mutating call; client state is never trusted.

### 4.3 Site manifest (new build artifact)
- Add `scripts/build-manifest.mjs`, run from the `vercel-build`/`build` script after `prepare-media`. It imports the data with Vite's SSR loader (`vite.ssrLoadModule('/src/constants/videos.ts')`, and the same for `photos.ts`) so `import.meta.env` resolves. It writes `dist/site-manifest.json`:

```jsonc
{
  "builtAt": "ISO", "commit": "<VERCEL_GIT_COMMIT_SHA>",
  "videos": [{ "id", "title", "artist", "client", "song", "location", "year", "tour", "file": "PROBLEMA.mp4", "url", "poster", "order": 0, "featured": true }],
  "photos": [{ "id", "imageUrl", "client", "year", "tour", "order": 0, "w", "h", "color", "sized": ["/images/sized/…"] }]
}
```

- Production serves it at `https://www.imanolvillagomez.com/site-manifest.json` (public data, already visible on the site). Add a `Cache-Control: public, max-age=60` header rule for it in `vercel.json`.
- The API reads it from the production origin (`SITE_ORIGIN` env, default `https://www.imanolvillagomez.com`) with a 5-second timeout. If it can't be read, every mutating Library call fails closed ("Can't check what's on the site right now. Try again in a minute").
- Test: the manifest includes every `videoUrl` file and every `imageUrl` currently referenced. A snapshot count test fails if it drops below what `videos.ts`/`photos.ts` export.

### 4.4 Edit drops
- `ArtRequest.kind = 'edit'` with `ops: EditOp[]`, `title` generated from the ops ("Hide 2 photos, retitle 1 video"), `files` for any replacement uploads, and `note` for free text.

```ts
type Target = { kind: 'photo' | 'video'; id: string };
type EditOp =
  | { op: 'remove'; target: Target }
  | { op: 'update'; target: Target; set: Partial<{ title: string; artist: string; client: string; song: string; location: string; year: number; tour: string; featured: boolean }> }
  | { op: 'move'; target: Target; to: { before?: string; after?: string; position?: 'top' | 'bottom' } }
  | { op: 'replace'; target: Target; file: string /* ArtFile.name in this request */ };
```

- Validate with a schema in `api/_lib/edit.ts`: max 100 ops, every target id exists in the manifest, strings trimmed and capped, no duplicate conflicting ops on the same target. Unit-test every rejection.
- The runner prompt gets an **edit** variant: "Apply exactly these operations; touch nothing else" plus the JSON ops. The existing path allowlist and diff checks apply unchanged. Add one runner check that is mechanical, not AI: after the edit, regenerate the manifest from the worktree and confirm each op took effect (a removed id is absent, an updated field matches, the order moved as asked). If not, set the drop to `failed` with the mismatch sent to Ian.
- A replaced video uploads under a new name (`<base>-v2.mp4`, staged by the worker as today). After the edit drop is `live`, the runner moves the superseded `videos/<old>` to trash if nothing in the new manifest references it.
- Library UI: in-use items show "Change on site…" actions that add ops to an **Edit tray** (bottom dock, like the upload dock). "Review & send" opens a summary (before/after for each op) and creates the edit drop. Imanol then reviews the preview as usual.

### 4.5 Audit log
- Every mutating Library call writes `audit/<yyyymm>/<iso>-<rand6>.json`: `{ at, action, from?, to?, bytes?, ok, error? }`. R2 has no append, so it's one object per event. Add an `activity` action that lists the latest 100 for an "Activity" panel in the Library. Never list `audit/` through the file browser.

### 4.6 Upload check for new videos
- Before the presigned PUT, the client reads the first 64 KB and last 64 KB to check the MP4 `moov` atom comes before `mdat` (faststart). If it doesn't, warn: "This video will be slow to start on the site. Send it as a drop instead, so it gets optimized." Offer "Send as drop" as the primary action, since drops run `publish-video.sh` with web-encode. Direct upload is an advanced path; keep it behind "More".

### 4.7 API actions (session-gated; all keys validated by `api/_lib/keys.ts`)

| Action | Body | Notes |
|---|---|---|
| `library` | `{ tab: 'site'|'uploads'|'trash', cursor? }` | site comes from the manifest joined with HEAD data; uploads/trash use ListObjectsV2 under an allowlisted prefix, 200 per page |
| `library-item` | `{ path }` | HEAD + in-use info + R2 "last fetched" (§5.4, optional) |
| `library-rename` | `{ path, to }` | in-use check, name rules, target must not exist |
| `library-trash` | `{ paths: string[] }` (≤ 50) | in-use check per path; partial results returned per path |
| `library-restore` | `{ trashPath, asCopy? }` | |
| `library-upload` | `{ name, size, type }` | returns presigned PUT for `videos/<name>` only |
| `library-empty-trash` | `{ confirm: '<count>' }` | the count must match the server's count |
| `edit-submit` | `{ ops, note, files? }` | creates `kind: 'edit'`; replacement files use the existing `start` flow first |
| `activity` | `{}` | latest audit events |

**Key validation (`keys.ts`, unit-tested):** allow exactly `videos/<name>`, `inbox/<id>/files/<one-level-folder>/<name>` or `inbox/<id>/files/<name>`, `inbox/<id>/thumbs/<n>.webp` (read only), and `trash/<yyyymmdd>/<one of the above>`. Reject `..`, leading `/`, backslashes, control characters, `%2e`, and any other prefix (`auth/`, `queue/`, `analytics/`, `audit/`). Reuse `safeName`/`safeFolder` from `api/art.ts`, moved into `_lib`.

### 4.8 UI
- Grid/list toggle (remembered in `localStorage`); search across title/artist/file name; filters (Photos, Videos, In use, Not used); sort (Site order, Newest, Largest, Name).
- Multi-select: long-press on touch, Shift/Cmd-click on desktop; selection count in a dock with the actions valid for **all** selected items. Disabled actions explain why ("2 of these are on the site; use Change on site").
- Item sheet: large preview (video plays with native controls; the poster comes from the manifest), title block, "On the site: Photos · position 4 of 212" with a link, actions, then a "Details" disclosure.
- Storage meter in the header: "1.8 GB of 10 GB free storage used", from R2 storage analytics (§5.4) or summed list sizes as a fallback.
- Optimistic updates with an Undo toast; reconcile with the server response and roll back with an inline error on failure.

### 4.9 Acceptance criteria
- All 26 live videos and every live photo appear in **On the site**, in site order, with posters and thumbnails.
- Rename, trash, restore and undo all work on a not-in-use file and leave audit events. The same calls on an in-use file are rejected **by the server** (verified by calling the API directly, bypassing the UI).
- An edit drop "remove photo X, move video Y to top" produces a preview where exactly those two changes happen. After Publish, the manifest reflects them.
- No path outside the allowlist can be read, listed or written (fuzz test with 200 crafted paths).
- Lighthouse a11y ≥ 95 on the Library view in fixture mode. Keyboard-only run-through passes.

---

## 5. Feature C: Insights

### 5.1 Questions it answers (in this order on screen)
1. **Is anyone looking?** Visitors and page views for the last 7 or 30 days, with the change against the previous period.
2. **What gets attention?** Top pages (`/work/photos`, `/work/videos`, `/about`, …) and top videos by loads.
3. **How do they find me?** Top referrers (Instagram, Google, direct…), countries, devices.
4. **Am I on Google?** Search clicks, how often the site appears, average position, top searches (e.g. "imanol villagomez"), top pages from search.
5. **Is Google seeing every page?** "X of Y pages on Google", plus a plain-language list of problems.

Every card leads with a sentence ("You had **312 visitors** this week, **up 24%**"), then a sparkline or bar chart, then "See all" (a table).

### 5.2 Data sources (feasibility verified)

| Source | What | How | Plan limits / facts | Verified |
|---|---|---|---|---|
| **Vercel Web Analytics** | visitors, page views, pages, referrers, countries, devices, OS, browser | Add `@vercel/analytics`; read `GET https://api.vercel.com/v1/query/web-analytics/visits/aggregate` (`by`, `since`, `until`, `limit≤100`, OData `filter`) and `/visits/count` with a Vercel token + `projectId` (+ `teamId`) | Hobby: 50k events/month, 1-month reporting window, **no custom events** (Pro: 12 months, custom events). Over the limit, collection pauses (no charge). | API reachable with the current token; answers `web_analytics_not_enabled` until enabled ([docs](https://vercel.com/docs/rest-api/web-analytics/aggregates-page-views), [pricing](https://vercel.com/docs/analytics/limits-and-pricing), [changelog](https://vercel.com/changelog/web-analytics-api)) |
| **Google Search Console** | clicks, impressions, CTR, position by query/page/date/country/device; URL index status; sitemaps | Service-account JWT (RS256 via `node:crypto`, **no googleapis dependency**) → `https://oauth2.googleapis.com/token`, scope `webmasters.readonly`. `POST https://www.googleapis.com/webmasters/v3/sites/{site}/searchAnalytics/query`; `POST https://searchconsole.googleapis.com/v1/urlInspection/index:inspect`; `GET …/sites/{site}/sitemaps` | Search Analytics: 1,200 queries/min per site. URL Inspection: **2,000/day, 600/min per site**. `rowLimit ≤ 25,000`. Data lags 2–3 days (use `dataState: 'all'` and show the `metadata` "incomplete after" date). The service account must be added as a user on the property. | Docs: [query](https://developers.google.com/webmaster-tools/v1/searchanalytics/query), [inspect](https://developers.google.com/webmaster-tools/v1/urlInspection.index/inspect), [limits](https://developers.google.com/webmaster-tools/limits), [users](https://support.google.com/webmasters/answer/7687615) |
| **Cloudflare (videos)** | video loads and bytes per file on `videos.imanolvillagomez.com` | GraphQL `httpRequestsAdaptiveGroups` on the zone, filtered `clientRequestHTTPHost = "videos.imanolvillagomez.com"`, `clientRequestPath` starting `/videos/`, grouped by path; R2 `r2StorageAdaptiveGroups` for storage | Free plan: 30 days of HTTP analytics, queryable in one request (Oct 2026). 300 GraphQL queries per 5 min. **Confirm field availability at implementation time** with the dataset `settings` discovery query; if `clientRequestPath` can't be grouped on Free, fall back to `r2OperationsAdaptiveGroups` (dimension `objectName`, `actionType = GetObject`), which counts only cache misses, and label it as such. | Docs: [limits](https://developers.cloudflare.com/analytics/graphql-api/limits/), [settings](https://developers.cloudflare.com/analytics/graphql-api/features/discovery/settings/), [R2 metrics](https://developers.cloudflare.com/r2/platform/metrics-analytics/), [30 days](https://developers.cloudflare.com/changelog/post/2026-10-02-30-days-analytics-on-every-plan/) |

"Video loads" is not "plays". Range requests make one viewing several requests. Count only requests with `edgeResponseStatus` 200 or 206 **and** `clientRequestHTTPMethodName = GET`. Label the metric "Video loads (approximate)" with a "?" explanation. A true play count needs custom events (Vercel Pro) and is out of scope for Hobby; note it as a future upgrade.

### 5.3 Architecture: daily snapshots in R2
Insights must not depend on live third-party calls while Imanol is looking, and Hobby only keeps one month of Vercel data. So:

- **Collector:** `action=insights-collect`, run by a **Vercel cron** once a day (`vercel.json` → `"crons": [{ "path": "/api/art?action=insights-collect", "schedule": "15 9 * * *" }]`). Hobby allows daily crons, timed within the hour ([docs](https://vercel.com/docs/cron-jobs/usage-and-pricing)). If query strings in cron paths are rejected at deploy, add the rewrite `/api/insights-collect → /api/art?action=insights-collect`. Auth: the `Authorization: Bearer ${CRON_SECRET}` header, compared timing-safe. The collector also runs on demand from the Insights view ("Refresh now", rate-limited to once per 10 min through a `analytics/lock.json` timestamp).
- Each run writes `analytics/daily/<yyyy-mm-dd>.json` (yesterday, UTC) and rewrites `analytics/summary.json` (rolling 90-day aggregates the UI reads in one GET):

```ts
interface DailySnapshot {
  date: string; collectedAt: string;
  sources: Record<'vercel' | 'gsc' | 'cloudflare', { ok: boolean; error?: string; dataThrough?: string }>;
  traffic?: { visitors: number; pageviews: number;
              pages: {path: string; views: number; visitors: number}[];     // top 50
              referrers: {host: string; visitors: number}[];                // top 25
              countries: {code: string; visitors: number}[];                // top 25
              devices: {type: string; visitors: number}[] };
  search?: { clicks: number; impressions: number; ctr: number; position: number;
             queries: {q: string; clicks: number; impressions: number; position: number}[]; // top 50
             pages: {url: string; clicks: number; impressions: number}[] };               // top 50
  videos?: { file: string; loads: number; bytes: number }[];
  index?: { checked: number; indexed: number; issues: {url: string; verdict: string; coverage: string}[] };
  storage?: { bytes: number; objects: number };
}
```

- Each source runs independently with its own 8s timeout (`Promise.allSettled`). One failure records `ok:false` and never blocks the others.
- **GSC freshness:** because of the 2–3 day lag, each run also re-collects the previous 3 days and overwrites them.
- **Backfill:** the first run collects as far back as each source allows (Vercel up to 30 days, GSC up to 16 months as daily rows, Cloudflare up to 30 days) and writes one snapshot per day.
- **URL inspection:** inspect at most 50 sitemap URLs per day in rotation (`analytics/index-cursor.json`), well under 2,000/day. Parse `public/sitemap.xml` from production.
- The Insights UI uses `action=insights` → `{ summary, range }` and never calls third parties. `summary.json` stays under 200 KB.

### 5.4 Library extras from analytics
- `storage` from `r2StorageAdaptiveGroups` (bucket `payloadSize`, `objectCount`) drives the Library storage meter.
- Optional: per-object "last fetched" from `r2OperationsAdaptiveGroups` (`objectName`, max `datetime`) to help find unused uploads.

### 5.5 Tracking script (public site)
- `npm i @vercel/analytics` (exact version pinned in `package.json`). In `src/main.tsx` (public app only), call `inject({ mode: 'production', beforeSend })`. `beforeSend` returns `null` when `location.hostname` isn't `www.imanolvillagomez.com` or `imanolvillagomez.com`, or when the path starts with `/studio` or `/art` (R9). It also strips query strings except `utm_*`.
- `App.tsx` renders `StudioPage` early on `STUDIO_HOST`. Make sure `inject` is never reached there (call it in the non-studio branch, or check the host first).
- SPA route changes: confirm the package tracks `history.pushState` page views for react-router v6. If it doesn't, call `pageview()` from a router listener in `Layout`.
- v2 loads from a per-project path (`/<unique-path>/script.js`) and posts page views to `/<unique-path>/view` ([docs](https://vercel.com/docs/analytics/package)). The SPA rewrite in `vercel.json` (`/((?!api|_next|.*\\..*).*)` → `/index.html`) matches extensionless paths like `/view`. After the first preview deploy, confirm in the network panel that the view POST returns 2xx JSON and not `index.html`. If it doesn't, exclude that path in the rewrite's negative lookahead.
- **R7:** rewrite the privacy sections "COOKIES & LOCAL STORAGE" and "DO NOT TRACK SIGNALS" to say the site uses Vercel Web Analytics (cookieless, aggregated, no personal profiles), and keep the local-storage text. Ian approves the wording before merge.

### 5.6 UI
- Range control: 7d / 30d / 90d / 12 months (the longer ranges grow as snapshots accumulate). Default 30d. Show "Collecting since Nov 6" when there's less history than the range.
- Cards: Visitors (big number, delta chip, 30-point sparkline), Top work (bars, plus top videos by loads with posters from the manifest), Found via (referrer bars with favicons; map `l.instagram.com`, `instagram.com` and `ig.me` to "Instagram"), Google (clicks, impressions, average position as "usually shows up around #8"), Google coverage ("41 of 44 pages are on Google" plus an issue list in plain words, mapping `coverageState` strings).
- Each card has 4 states: loading skeleton, ready, partial (the source failed today, so show the last good data with a "From Nov 3" label), not connected ("Ian is connecting Google Search. Nothing for you to do").
- Charts: inline SVG, no chart library (the dependency budget is zero). Each chart has a `role="img"` with an `aria-label` summary and a visually-hidden `<table>`. Colors use `DESIGN.md` tokens. Tabular numbers. Follow the repo's dataviz skill rules for marks and colors.
- Per-drop performance (§3.2 item 5): for a live drop with placements, sum page views of `/work/photos` or `/work/videos` and `videos[].loads` for its files since `liveAt`. Label it "pages showing this work". Photos have no per-photo views on Hobby, so say "visits to Photos" and never imply per-photo counts.

### 5.7 Acceptance criteria
- With all three sources connected, the cron produces one valid snapshot per day for 3 consecutive days (validated by a schema test in CI using fixtures, and a manual check of R2).
- If one source's credentials are revoked, Insights still renders the other two, and the failed card shows "partial" with the last good date.
- The Studio host and `/studio` produce **zero** Vercel analytics events (check the network panel: no analytics `script.js` load and no `/view` POST).
- On `www`, one route change produces exactly one page view.
- The privacy page wording is updated in the same deploy that turns analytics on.
- Insights loads in under 1s from `summary.json` (one request) on Fast 4G.

---

## 6. Navigation and information architecture
- `StudioView` becomes `'upload' | 'drops' | 'library' | 'insights' | 'help'`. Desktop side nav order: New drop, Your drops, Library, Insights, Help. Mobile bottom nav has 5 slots, which fits at 390px with 44px targets. If the label widths overflow, merge Help into the account menu.
- A hash router in `StudioPage` (a small `useHashRoute()` hook in `src/components/art/route.ts`) maps `#drops`, `#drop/<id>`, `#library[/<tab>][?q=]`, `#library/item/<path>`, `#insights[?range=]`, `#help`. It must not interfere with react-router on the www host (the Studio uses only the hash).
- The header attention count includes failed edit drops.

---

## 7. Security and privacy
- All new actions require the existing session; `insights-collect` requires the session **or** the cron secret.
- New secrets (Vercel env, **Production only**, marked Sensitive): `GSC_SERVICE_ACCOUNT_JSON` (base64), `GSC_SITE` (e.g. `sc-domain:imanolvillagomez.com`), `CF_ANALYTICS_TOKEN` (Account Analytics:Read + Zone Analytics:Read, zone-scoped), `CF_ZONE_ID`, `VERCEL_ANALYTICS_TOKEN` (team-scoped, with an expiry; it's separate from the runner's `VERCEL_TOKEN`), `VERCEL_PROJECT_ID`, `VERCEL_TEAM_ID`, `CRON_SECRET`, `SITE_ORIGIN`.
- The Google private key never leaves the function: no logs, no error echo. Errors from third parties are reduced to `{source, status}` before being stored.
- Presigned GET ≤ 10 min; PUT ≤ 6h (as today). `Content-Disposition` on downloads uses an RFC 5987-encoded filename.
- The browser never receives raw `ListObjects` output; the server maps it to `{path, name, size, uploadedAt, kind, inUse}` after allowlisting.
- Rate-limit mutating Library calls to 60/min per session (an in-memory, best-effort token bucket is fine on one function), and `insights-collect` on demand to once per 10 min.
- Threat checks to test explicitly: path traversal, prefix escape, an in-use bypass (call the API directly), cron endpoint without a secret, a replayed expired session, and an XSS payload in file names, notes or GSC queries (render as text only; never `dangerouslySetInnerHTML`).

---

## 8. Performance budgets
- Studio JS stays lazy-loaded (`App.tsx` `lazy(StudioPage)`). Library and Insights are their own `lazy()` chunks, each under 45 KB gzipped. No new runtime dependencies besides `@vercel/analytics` (public site, under 2 KB).
- The public site's LCP must not regress more than 50ms (measure before and after with Lighthouse on `/` and `/work/photos`).
- Thumbnail grids use `loading="lazy"`, `decoding="async"`, explicit `width`/`height`, and `content-visibility: auto` for off-screen groups.

---

## 9. Phasing

| Phase | Ships | Depends on |
|---|---|---|
| **P0** | WS0 foundations; Feature A (detail, timeline, thumbs, downloads, list upgrades); tracking script + privacy text; Insights with Vercel traffic only | Ian: enable Web Analytics |
| **P1** | Placements (runner + skill); Library read-only + rename/trash/restore/upload; Search Console in Insights; per-drop performance | Ian: GSC + service account; R2 lifecycle rule |
| **P2** | Edit drops (ops, runner edit mode, mechanical verification); Cloudflare video loads + storage meter; "Start a new drop from these files"; browser notifications when a preview is ready | Ian: Cloudflare token |

Each phase is its own PR, merged and verified in production before the next one starts.

---

## 10. Test and verification plan
- **Unit (node:test, under `scripts/art-inbox/` or `api/_lib/*.test.mjs`, wired into `npm run test:studio`):** `keys.ts` allowlist (with a fuzz corpus), `edit.ts` op validation, `timelineFor`, `appendEvent`, placements validation, snapshot schema + aggregation (`summary.json` from daily fixtures), JWT signing (sign and verify a fixture with a throwaway RSA key generated in the test), the Vercel/GSC/Cloudflare response mappers using recorded fixtures in `fixtures/insights/`.
- **Native ESM load test (R4):** extend `studio.test.mjs` so it transpiles and imports `api/art.ts` and every `api/_lib/*.ts` under plain Node.
- **Runner:** extend the existing tests with a placements validation fixture and an edit-drop verification fixture. A dry run (`ART_DRY=1`) must keep working.
- **Fixture mode for UI:** `npm run dev` with `VITE_STUDIO_FIXTURE=1` serves `/api/art` from `fixtures/studio/*.json` through the existing Vite middleware (`vite.config.ts`), with no R2 access. Never point dev at the production bucket for destructive Library tests.
- **Browser verification (required, per the harness):** start the dev server in fixture mode, then check each flow at 390×844 and 1280×800 in light/dark where relevant. Open a drop, see the thumbnails, open the viewer, download; Library search, filter, multi-select, trash, Undo, restore; build an edit tray and send it; Insights in all 4 card states. Capture screenshots to `.impeccable/review/studio-v2-*.jpg` and list them in `documentation/design/studio-workspace.md`.
- **Production smoke after each phase (Ian present):** a real drop shows thumbnails and placements; `insights-collect` runs from the cron (check the `analytics/daily/` object); a Library rename on a scratch upload, then Undo; the network panel shows no analytics beacons on the Studio host.

---

## 11. Setup steps Ian must finish (blocking; they can't be done by an agent)

1. **Vercel → project imanolvillagomez → Analytics → Enable Web Analytics.** Then create a team-scoped read token with an expiry, and set `VERCEL_ANALYTICS_TOKEN`, `VERCEL_PROJECT_ID=prj_r9omRaiVco4DyAD0zQnxo9Ti2cLr` and `VERCEL_TEAM_ID`.
2. **Search Console:** add the domain property `imanolvillagomez.com` if it doesn't exist (DNS TXT record in Cloudflare). Google Cloud → new project → enable "Google Search Console API" → service account → JSON key. In Search Console → Settings → Users and permissions → add the service account email as **Restricted**. Set `GSC_SERVICE_ACCOUNT_JSON` (base64 of the JSON) and `GSC_SITE=sc-domain:imanolvillagomez.com`. Submit `https://www.imanolvillagomez.com/sitemap.xml` once in the UI.
3. **Cloudflare:** an API token with Account → Account Analytics: Read and Zone → Analytics: Read (zone `imanolvillagomez.com` only). Set `CF_ANALYTICS_TOKEN`, `CF_ZONE_ID`. (`R2_ACCOUNT_ID` is already the account id.)
4. **R2 lifecycle rule:** bucket → Settings → Object lifecycle → prefix `trash/` → delete after 30 days.
5. **Secrets:** `CRON_SECRET` (32+ random bytes) and `SITE_ORIGIN=https://www.imanolvillagomez.com`. Production only. Redeploy.
6. Approve the privacy-page wording (R7).

The implementation must render "not connected" states, never crashes, while any of these are missing. That way the code can merge before setup is finished.

---

## 12. Implementation plan for a lead agent with subagents

The lead agent owns integration, `StudioPage.tsx`, `Workspace.tsx`, `run.mjs` and the final verification. Subagents get bounded workstreams with **disjoint file ownership**. When a subagent needs a change in a file it doesn't own, it writes the request into its report and the lead applies it.

### WS0 Foundations (lead, sequential, first)
Files: `src/components/art/studioModel.ts`, `api/art.ts` → `api/_lib/{storage,auth,keys,http}.ts`, `artApi.ts` (types only), `Workspace.tsx` (nav), `src/components/art/route.ts`, `StudioPage.tsx` (view routing with placeholder `lazy()` components for Library/Insights/DropDetail), `vite.config.ts` (fixture mode), `fixtures/studio/`.
Done when: types are deduplicated, `appendEvent` is used in every API transition, the hash routes work, the fixture mode serves list/get, every existing test passes, and the native ESM load test covers `_lib`.

### WS1 Drop detail (subagent A, after WS0)
Owns: `src/components/art/DropDetail.tsx`, `DropActions.tsx`, `Timeline.tsx`, `FileGrid.tsx`, `Viewer.tsx`, `thumbs.ts` (client WebP generation), the CSS section `/* drop detail */` in `studio.css`, `api/_lib/drops.ts` (`get`, `urls`, paged `list`), `scripts/art-inbox/backfill-thumbs.mjs`, and its tests.
Needs from the lead: changes to `start`/`submit` for thumbs, plus the runner backfill hook in `run.mjs`.

### WS2 Library (subagent B, after WS0; edit drops in P2)
Owns: `src/components/art/library/*`, `api/_lib/library.ts`, `api/_lib/edit.ts`, `api/_lib/audit.ts`, `scripts/build-manifest.mjs`, the `vercel.json` header for the manifest, the CSS section `/* library */`, and its tests (including the key fuzz corpus).
Needs from the lead: the edit-mode prompt and mechanical verification in `run.mjs`, the skill update, and manifest wiring into `package.json` scripts.

### WS3 Insights (subagent C, after WS0)
Owns: `src/components/art/insights/*` (cards, inline SVG charts), `api/_lib/insights/{collect,vercel,gsc,cloudflare,summary,jwt}.ts`, `fixtures/insights/`, the `vercel.json` cron, `src/main.tsx` analytics `inject`, `src/pages/PrivacyPage.tsx` (R7), the CSS section `/* insights */`, and its tests.

### WS4 Verification (subagent D, last; read-only plus test files)
Runs the §10 browser pass in fixture mode, the a11y audit (keyboard, screen-reader labels, contrast against `DESIGN.md`), the security threat checks from §7 against a local server, and the performance budgets. It reports findings ranked by severity; the lead fixes them.

### Order and merge points
1. WS0 → merge (PR 1).
2. WS1 and WS3 (Vercel only) in parallel → lead integrates → WS4 → merge (PR 2 = P0).
3. WS2 read/ops, WS3 GSC, placements → WS4 → merge (PR 3 = P1).
4. WS2 edit drops, WS3 Cloudflare, A5 → WS4 → merge (PR 4 = P2).

### Prompt guidance for subagents
Give each subagent: this spec's §0, §2 and its own section; the exact files it owns; the data contracts from §3.3, §4.4 and §5.3; and the definition of done. Require it to run `npm run build`, `npm run lint` and `npm run test:studio` before it reports, and to list any file it wanted to touch but doesn't own.

---

## 13. Out of scope / later
- Per-photo view counts and true video play counts. These need custom events, which means Vercel Pro (custom events included) or a self-hosted event endpoint. Revisit if Ian upgrades.
- Multi-user roles. The Studio has one shared identity today; the audit log records actions, not people.
- Editing photos (crop or color) in the browser.
- Moving photos from git to R2. That would simplify the Library, but it's a separate migration with its own spec.

## 14. Open questions for Ian
1. Should Imanol be able to trash **uploads** from live drops, or only Ian? (Default in this spec: Imanol can, because trash is reversible for 30 days.)
2. Are you OK putting Vercel Web Analytics on the public site, with the privacy-page change in R7?
3. Five nav items on mobile, or move Help into the account menu?
