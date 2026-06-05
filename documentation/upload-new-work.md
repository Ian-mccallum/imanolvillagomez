# Upload new work — atomic playbook

This document is for **humans and AI coding agents** who need to add new **videos** and **photos** to the NOL site safely. Follow steps **in order**. Skipping steps (especially codec or basename matching) causes playback or deploy issues.

**Related docs:** [Cloudflare R2 setup](./ops/cloudflare-r2-setup.md) (one-time bucket + DNS + CORS), [Scripts README](../scripts/README.md).

---

## Mental model (read once)

| Concern | Where it lives |
|--------|----------------|
| **Portfolio video URLs** used by the React app | `src/constants/videos.ts` → `getVideoUrl('FileName.mp4')` |
| **Portfolio stills** | `public/images/` + `src/constants/photos.ts` and/or `src/constants/data/photos-shoot-*.json` |
| **Actual video files in production** | **Cloudflare R2** at object keys `videos/<FileName.mp4>` |
| **Secrets for uploading to R2** | `.env` (`R2_*`, not committed). **Public** URL only: `VITE_R2_PUBLIC_URL` |
| **Git / repo** | Nearly all `public/videos/*.mp4` are **gitignored**. Only **`osamasonpreview.mp4`** may be tracked (homepage fallback). Videos ship via R2 + env, **not** via git blobs. |

**Basename rule:** The string passed to `getVideoUrl(...)` **must equal** the filename on disk in `public/videos/` **and** the R2 object name after `videos/`.

---

## Part A — New videos (disk → web-safe → constants → R2)

### Step A1 — Ingest raw files into the repo tree

**Atomic:**

1. Unzip/source material stays in **`newWork/`** (optional staging folder; safe to gitignore large zips locally if desired).
2. Decide **final filenames**: ASCII, **no spaces** (use `camelCase` or `PascalCaps` to match existing entries, e.g. `cartiLIKEWEEZY.mp4`).
3. Copy or move finalized **`.mp4`** into **`public/videos/`** using those exact basenames.

**If the file is `.mov`:** put it under `public/videos/` and run `./scripts/convert-videos-to-mp4.sh`, or ffmpeg-convert manually to `.mp4` with the same basename you will register in code.

### Step A2 — Ensure browser-compatible codec (critical)

Chrome/Firefox often **cannot play HEVC (H.265)** MP4 inside `<video>`. iPhone HDR exports are frequently HEVC.

**Atomic:**

1. Check codec (optional): `ffprobe -v error -select_streams v:0 -show_entries stream=codec_name -of csv=p=0 public/videos/YOURFILE.mp4`
   - Output `hevc` → must re-encode before relying on playback.
   - Output `h264` → OK for typical web playback.
2. If HEVC, run:
   ```bash
   ./scripts/reencode-hevc-to-h264-web.sh YOURFILE.mp4
   ```
   Or re-encode everything HEVC in `public/videos/` with no arguments (see [`scripts/README.md`](../scripts/README.md)).
3. Re-upload affected files to R2 after any re-encode (same basename overwrites the object).

### Step A3 — Register in `videos.ts`

**Atomic:**

1. Open **`src/constants/videos.ts`**.
2. Add a **`Video`** object to the **`videos`** array (or **`lostFilesVideos`** only if deliberately “lost files” editorial).
3. Set **`videoUrl`** and **`thumbnail`** with **`getVideoUrl('ExactFile.mp4')`** — **same basename** as **`public/videos/ExactFile.mp4`**.
4. Fill **`id`**, **`title`**, **`client`**, **`artist`**, dates, **`year`**, **`location`**, **`category`**, **`rotation`** if needed, **`featured`** optionally.
5. Run `npm run type-check` locally.

### Step A4 — Faststart MP4 (optional but recommended before upload)

**Atomic:**

1. `./scripts/optimize-videos-for-r2.sh` (targets `public/videos/*.mp4`; see script notes).

### Step A5 — Load secrets and upload **only new** files to R2

The script **`scripts/upload-to-r2.js`** reads **`process.env` only** — it does **not** auto-load `.env`. **`source`** your shell env first.

**Atomic:**

1. Ensure `.env` contains **`R2_ACCOUNT_ID`**, **`R2_ACCESS_KEY_ID`**, **`R2_SECRET_ACCESS_KEY`**, **`R2_BUCKET_NAME`**, **`R2_PUBLIC_URL`** (see `.env.example`).
2. From project root:
   ```bash
   set -a && source .env && set +a
   ```
3. **Prefer selective uploads** (avoids resending entire library):

   Edit **`newWork/upload-batch.txt`** (one **`SomeFile.mp4`** per line, filenames only) **or**:

   ```bash
   node scripts/upload-to-r2.js earlylifecrisis.mp4 OtherNew.mp4
   ```

   **Full library re-sync only if intended:**
   ```bash
   node scripts/upload-to-r2.js --all
   ```

   Objects land at **`videos/<filename>`** in the bucket.

4. Confirm a URL in the browser: **`https://<your-public-video-host>/videos/<filename>.mp4`** plays.

### Step A6 — Frontend env (local + Vercel)

**Atomic:**

1. Local **`VITE_R2_PUBLIC_URL`** must match the **same hostname** browsers use for video URLs (**no trailing slash**). Typically equals **`R2_PUBLIC_URL`** host.
2. **Vercel → Project → Settings → Environment Variables:** set **`VITE_R2_PUBLIC_URL`** for Production (and Preview if needed). Redeploy after changes.

---

## Part B — New photos

### Step B1 — Files on disk

**Atomic:**

1. Normalize names (avoid spaces/special chars in URLs).
2. Place files under **`public/images/`**.

### Step B2 — Data

Choose one approach consistent with the repo:

**Atomic (simple):**

1. Append **`Photo`** objects to **`src/constants/photos.ts`**, OR
2. If using a shoot batch JSON pattern, extend **`src/constants/data/photos-shoot-*.json`** and import in **`photos.ts`** (mirror existing imports).

Ensure each entry has **`id`**, **`imageUrl`** (starts with **`/images/...`**), **`year`**, **`client`**.

---

## Part C — Site behavior / troubleshooting (agents)

### Video “failed to load” for everyone

1. **`VITE_R2_PUBLIC_URL`** wrong or trailing slash mismatch.
2. **HEVC file** never re-encoded → use Part A Step A2 then re-upload.
3. **R2 CORS** may still matter for tooling; **`crossOrigin`** is **not** set on playback `<video>` elements in this codebase so normal playback does not depend on CORS for decoding (see codebase comments).

### Local dev loads from `/videos/` fallback

When **`VITE_R2_PUBLIC_URL`** is empty, **`getVideoUrl`** returns **`/videos/...`** (Vite serves **`public/`**). Files must exist at **`public/videos/`**.

### Git

Do not commit giant MP4s. **`.gitignore`** ignores **`public/videos/*.mp4`** except **`osamasonpreview.mp4`**. The **`newWork/`** folder is for **local staging only** (zips, camera dumps): **`newWork/*`** is ignored except **`newWork/README.md`** and **`newWork/upload-batch.txt`**. Push code + **`public/images`** + constants; ship video via **R2**, not git.

---

## Checklist summary (copy-paste for agents)

- [ ] **A1** Files in **`public/videos/`** with final basename (no spaces).
- [ ] **A2** H.264 / re-encode if source was **HEVC**.
- [ ] **`videos.ts`** updated with **`getVideoUrl('…')`** matching basename.
- [ ] **A5** **`source .env`**, then **`node scripts/upload-to-r2.js`** with **`--list=...`** or explicit filenames (**not `--all`** unless intended).
- [ ] **A6** **`VITE_R2_PUBLIC_URL`** locally + **Vercel** + redeploy.
- [ ] **B** **`public/images/`** + **`photos.ts`** / JSON.
- [ ] **`npm run type-check`** passes.
