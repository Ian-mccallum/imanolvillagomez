# /art — Imanol's drop page

`imanolvillagomez.com/art` lets Imanol upload new work himself. A runner on
Ian's laptop picks each drop up, runs the `imanol-publish` skill in Claude Code,
and pushes the result to a Vercel preview. Nothing reaches `main` until Imanol
holds **ship** on that preview.

```
Imanol ──/art──▶ R2 inbox/<id>/ ──runner (laptop)──▶ claude -p /imanol-publish
                                                        │
          ◀── question (he answers on /art) ────────────┤
          ◀── preview link ─── branch art/<id> ─────────┘
          hold to ship ──▶ runner rebases + pushes to main ──▶ live
```

## For Imanol

1. Open `/art`, enter the password. After the first login, save Face ID / Touch ID
   when the pill offers it — later visits just need the face button.
2. Tap **DROP** → **files** or **folder**. Each folder becomes a group; name it and
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
| Page | `src/pages/ArtPage.tsx`, `src/components/art/` |
| API (Vercel function) | `api/art.ts` — auth, presigned uploads, queue actions |
| Queue storage | R2 `inbox/<id>/request.json` + `inbox/<id>/files/*` |
| Auth storage | R2 `auth/passkeys.json`, `auth/fails.json` |
| Runner | `scripts/art-inbox/run.mjs`, systemd user timer `art-inbox.timer` |
| Runner working dir | `.art-inbox/` (gitignored): downloads, worktrees, logs |

### Auth

- Password (`ART_KEY`) or a saved passkey is traded for a 12h HMAC-signed session
  token, kept in `sessionStorage`. The password itself is never stored client-side.
- 8 wrong passwords lock password entry for 15 minutes; passkeys still work.
- Passkeys are bound to `imanolvillagomez.com` — they won't work on `*.vercel.app`
  previews or localhost.

### Statuses

`pending` (queued) → `working` → `question` | `preview` | `failed` →
`approved` (shipping) → `live`. A `working` drop older than 3.5h (laptop slept
mid-run) goes back to `pending`.

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

## Operating it

```bash
# watch the runner
tail -f .art-inbox/runner.log

# run now instead of waiting for the timer (blocks until Claude finishes)
systemctl --user start art-inbox.service

# test the plumbing without running Claude
ART_DRY=1 node scripts/art-inbox/run.mjs
```

Per drop, `.art-inbox/<id>/` holds `files/`, `result.json` (what went back to the
page) and `claude.log` (Claude's final summary). For the full step-by-step,
`claude --resume` from `.art-inbox/wt/<id>`.

### Local development

`npm run dev` serves `/api/art` through a dev-only Vite middleware
(`vite.config.ts`) using `.env`, so the whole page works on localhost against the
real R2 bucket.

### Cleaning up a test drop

Delete `inbox/<id>/` in R2, the `art/<id>` branch on GitHub, then locally:

```bash
git worktree remove --force .art-inbox/wt/<id>
git branch -D art/<id>
rm -rf .art-inbox/<id>
```

## Limits

- 5 GB per file (single presigned PUT).
- The laptop must be awake; drops wait until the next run.
- The runner commits with hooks disabled — the repo has stale git-lfs hooks and no
  LFS content.
