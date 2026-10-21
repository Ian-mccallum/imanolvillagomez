# /studio — Imanol's drop page

`imanolvillagomez.com/studio` (`/art` redirects here) lets Imanol upload new work himself. A runner
(Ian's laptop today; the Fortivus VPS once cut over, see [The VPS](#the-vps)) picks each drop up,
runs the `imanol-publish` skill in Claude Code, and pushes the result to a Vercel preview. Nothing reaches `main` until Imanol
holds **ship** on that preview.

```
Imanol ─/studio─▶ R2 inbox/<id>/ ──runner──▶ claude -p /imanol-publish (as nolai on the VPS)
                                              │
          ◀── question (answered on /studio) ──┤
          ◀── preview link ── runner commits, checks paths, uploads staged videos,
                              pushes branch art/<id>
          hold to ship ──▶ runner rebases + pushes to main ──▶ live
```

## For Imanol

1. Open `/studio`, enter the password. The first time, a TV-style **welcome to the
   studio** screen offers a guided practice run (nothing uploads); **?** bottom-left
   replays it. Then then save Face ID / Touch ID — from the pill
   that drops in after login, or the **face id** button top-left any time. Later
   visits just need the face button. Must be on `imanolvillagomez.com`.
2. Tap **DROP** (or press **Cmd/Ctrl+0**) → **files** or **folder**. Each folder becomes a group; name it and
   add instructions per folder or per file. The **+** under the grid adds more.
3. **details →** opens title, city, placement (top / any) and instructions. Recent
   values show as chips; **↺ same as last** refills the previous drop.
4. **send**. Keep the page open until it hits 100.
5. The queue below shows each drop: queued → working → question / preview → live.
   Answer questions inline; on a preview, open **view ↗**, then **hold to ship**.

A refresh keeps an unsent drop (files and all) on that device. A refresh mid-upload
keeps the files but restarts the upload.

## Pieces

| Piece | Where |
|---|---|
| Page | `src/pages/StudioPage.tsx`, `src/components/art/` (tour: `Tour.tsx`) |
| API (Vercel function) | `api/art.ts` (internal name kept) — auth, presigned uploads, queue actions |
| Queue storage | R2 `inbox/<id>/request.json` + `inbox/<id>/files/*` |
| Auth storage | R2 `auth/passkeys.json`, `auth/fails.json` |
| Runner | `scripts/art-inbox/run.mjs`: laptop user timer `art-inbox.timer`, or VPS timer `nol-studio.timer` |
| VPS setup | `scripts/art-inbox/vm/setup.sh`, `vm/nolai-run` (the only thing the runner may run as nolai), `vm/doctor.sh` |
| Runner working dir | `.art-inbox/` (gitignored): `req/<id>/` downloads + `result.json`, `wt/<id>/` worktrees, `logs/` |

### Auth

- Password (`ART_KEY`) or a saved passkey is traded for a 12h HMAC-signed session
  token, kept in `sessionStorage`. The password itself is never stored client-side.
- 8 wrong passwords lock password entry for 15 minutes; passkeys still work.
- Safari only allows WebAuthn straight from a tap, so the page fetches the passkey
  challenge *before* the tap (`prepareSave` / `prepareUnlock` in `artApi.ts`) and
  the tap calls the OS prompt with nothing awaited first. Keep it that way.
- Passkeys are bound to `imanolvillagomez.com` — they won't work on `*.vercel.app`
  previews or localhost.

### What a drop may change

Claude doesn't commit or upload. The runner commits whatever it changed, then refuses to push
(drop → `failed`, details to Ian) if the branch touches anything outside:

- photos under `public/images/` (jpg/png/webp/avif, including `sized/`)
- `src/constants/data/*.json`, `src/constants/videos.ts`, `src/constants/photos.ts`
- `src/assets/posters/*.jpg`, `CHANGELOG.md`

Added lines in `videos.ts`/`photos.ts` can't contain imports, URLs, `fetch`, `window`,
`document`, `process.env`, `import.meta` and similar: a new entry only needs the helpers
already imported there. The one import allowed is a new shoot's data file
(`import x from '@/constants/data/photos-shoot-YYYYMMDD.json';`). Anything else (a component, config, the runner) is Ian's job.

**Videos:** the runner hands Claude no R2 keys. `publish-video.sh` runs in staged mode
(`ART_STAGED_UPLOADS=1`): it encodes and checks faststart, then leaves the file in the
worktree's `public/videos/`. After Claude finishes, the runner uploads every new `.mp4` there
to `videos/<name>` (names `[A-Za-z0-9._-]`, plain files only), skips one already up at the same
size (a rerun), and refuses to replace a different live video. Then it checks the public URL
answers a range request.

**Approval** ships the exact commit Imanol previewed (`previewSha`): the runner rebases it in a
fresh worktree only it touches, rechecks the paths, and pushes to `main`.

### Statuses

`pending` (queued) → `working` → `question` | `preview` | `failed` →
`approved` (shipping) → `live`. A `working` drop older than 3.5h (laptop slept
mid-run, VPS restarted) goes back to `pending`.

## Setup

### Vercel environment (Production + Preview)

`ART_KEY`, `R2_ACCOUNT_ID`, `R2_ACCESS_KEY_ID`, `R2_SECRET_ACCESS_KEY`,
`R2_BUCKET_NAME`, `R2_PUBLIC_URL`. Mark `ART_KEY` and the secret as Sensitive.
Redeploy after changing them.

Deployment Protection → Vercel Authentication must be **off** for previews, or
Imanol hits a Vercel login on every preview link.

### R2 CORS

The bucket's CORS rule must allow `PUT` from the site origins (uploads go
straight from the browser to R2). See
[cloudflare-r2-setup.md](./cloudflare-r2-setup.md).

### Laptop

`.env` needs the `R2_*` values, `ART_KEY`, and `VERCEL_TOKEN` (a Vercel token
scoped to the team — the runner uses it to find each preview URL). `gh` must be
logged in and `git config user.name/email` set. Then, once:

```bash
./scripts/art-inbox/install.sh
```

That installs `art-inbox.timer`: it runs ~90s after login and every 10 minutes.

### The VPS

The runner can move to the Fortivus Studio VPS (OVH VPS-1, `40.160.97.8`, 2 vCPU / 4GB / 40GB).
Fortivus's `scripts/studio/vm/setup.sh` owns the box (Node 24, pinned Claude Code, firewall,
swap, updates); NOL's setup only checks for it, adds ffmpeg, and never touches Fortivus's
users, config or service. See `~/Coding/fortivus/docs/studio.md` → "The VM".

| | `nol` | `nolai` |
|---|---|---|
| Runs | `run.mjs` (`nol-studio.timer`, every 2 min) | Claude and its builds, via `/usr/local/bin/nolai-run` |
| Has | R2, Vercel keys (root-only `/etc/nol-studio/env`), the GitHub deploy key | a Claude subscription token (`/etc/nol-studio/nolai.env`) |
| Can write | the checkout `/srv/nol` | `.art-inbox/wt/`, `.art-inbox/req/`, `node_modules/.vite-temp/` |

Both runners live in `studios.slice` (3.4GB cap for the pair, set up by NOL's setup.sh; Fortivus
joins through the drop-in `fortivus-studio.service.d/10-studios-slice.conf`). Nick comes first:
NOL runs with `Nice=10`, half the CPU weight, idle IO and `OOMScoreAdjust=500`, so a squeeze
slows NOL and, at worst, kills a NOL step (the drop fails and can be resent), never Fortivus's.
There's deliberately no lock between them: a NOL drop can run for hours, and Fortivus caps
each AI step at 25 minutes.

The worktree's `.env` holds only public values (`VITE_*`, `R2_PUBLIC_URL`). Neither NOL user
can read Fortivus's secrets and vice versa; `nol-studio-doctor` checks both directions. With
`ART_SYNC=1` the checkout follows `origin/main` (and reruns `npm ci` when the lockfile
changes), so merging to main updates the runner and skill. Optional `/etc/nol-studio/env`
values: `RESEND_API_KEY` + `ART_EMAIL_FROM` + `ART_EMAIL_TO` email Ian what the laptop shows
as popups; `ART_HEALTHCHECK_URL` is pinged after every run.

Install (the VPS's SSH key is `~/.ssh/fortivus_vm`):

```bash
scp -i ~/.ssh/fortivus_vm -r scripts/art-inbox/vm ubuntu@40.160.97.8:~/nol-vm
ssh -i ~/.ssh/fortivus_vm ubuntu@40.160.97.8
sudo env GIT_NAME="Ian McCallum" GIT_EMAIL="<GitHub email>" bash ~/nol-vm/setup.sh
```

The first run prints a deploy key for `Ian-mccallum/imanolvillagomez` (write access). Fill
both env files (a bucket-scoped R2 token, not the laptop's; `claude setup-token` for nolai),
rerun, then cut over: `systemctl --user disable --now art-inbox.timer` on the laptop, and
`sudo env LAPTOP_RUNNER_STOPPED=yes bash ~/nol-vm/setup.sh --start` on the VPS. Never run both.

## Operating it

```bash
# watch the runner
tail -f .art-inbox/runner.log

# run now instead of waiting for the timer (blocks until Claude finishes)
systemctl --user start art-inbox.service

# test the plumbing without running Claude
ART_DRY=1 node scripts/art-inbox/run.mjs
```

Per drop, `.art-inbox/req/<id>/` holds `files/` and `result.json` while it runs (cleared
after, downloads can be GBs) and `.art-inbox/logs/<id>-claude.log` keeps Claude's output.
For the full step-by-step, `claude --resume` from `.art-inbox/wt/<id>`.

On the VPS: `journalctl -u nol-studio -f`, `sudo systemctl start nol-studio` (run now),
`sudo nol-studio-doctor` (isolation and config checks).

### Local development

`npm run dev` serves `/api/art` through a dev-only Vite middleware
(`vite.config.ts`) using `.env`, so `/studio` works on localhost against the
real R2 bucket.

### Cleaning up a test drop

Delete `inbox/<id>/` in R2, the `art/<id>` branch on GitHub, then locally:

```bash
git worktree remove --force .art-inbox/wt/<id>
git branch -D art/<id>
rm -rf .art-inbox/req/<id>
```

A staged video the runner already uploaded stays at `videos/<name>` in R2; delete it there too.

## Limits

- 5 GB per file (single presigned PUT).
- On the laptop, it must be awake; drops wait until the next run. The VPS checks every 2 min.
- A 4K `--web-encode` on the VPS takes about 9 min per minute of footage and peaks near 2GB
  (measured Oct 19, 2026: 10s of 4K in 90s, 1.96GB). A plain build as nolai: 19s, ~480MB.
- The runner commits with hooks disabled — the repo has stale git-lfs hooks and no
  LFS content.
