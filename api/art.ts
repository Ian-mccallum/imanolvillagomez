import type { VercelRequest, VercelResponse } from '@vercel/node';
import { createHmac, randomBytes, timingSafeEqual } from 'node:crypto';
import { ListObjectsV2Command } from '@aws-sdk/client-s3';
import {
  appendEvent,
  fileProblem,
  queueAgain,
  type ArtRequest,
  type WorkerHeartbeat,
} from '../src/components/art/studioModel.js';
import {
  generateRegistrationOptions,
  verifyRegistrationResponse,
  generateAuthenticationOptions,
  verifyAuthenticationResponse,
} from '@simplewebauthn/server';
import {
  Bucket,
  ID,
  INBOX,
  clean,
  getJson,
  putJson,
  readReq,
  s3,
  safeFolder,
  safeName,
  signGet,
  signPut,
  writeReq,
} from './_lib/storage.js';
import { collect, readSummary, refreshAllowed } from './_lib/insights.js';

/**
 * /api/art — Imanol's drop box.
 *
 * Files go browser → R2 directly via presigned PUT (Vercel caps request
 * bodies at 4.5MB). Each drop lives at inbox/<id>/ with a request.json that
 * doubles as the queue entry; the runner (scripts/art-inbox) polls it.
 *
 * Auth: the ART_KEY passphrase (or a saved passkey — Face ID / Touch ID) is
 * traded for a short-lived HMAC-signed session token. The raw key is never
 * stored client-side. Repeated wrong keys lock key entry for a while;
 * passkeys keep working through a lockout.
 */

export type { ArtRequest };

const PASSKEYS = 'auth/passkeys.json';
const FAILS = 'auth/fails.json';
const MAX_FILE = 5 * 1024 ** 3; // R2 single-PUT ceiling
const SESSION_MS = 12 * 3600e3;
const LOCK_AFTER = 8;
const LOCK_MS = 15 * 60e3;
const PAGE = 40;

interface Passkey {
  id: string;
  publicKey: string; // base64url
  counter: number;
  transports?: string[];
  createdAt: string;
}

// ─── tokens ─────────────────────────────────────────────────────────────────

const eq = (a: string, b: string) =>
  a.length === b.length && timingSafeEqual(Buffer.from(a), Buffer.from(b));
const mac = (s: string) =>
  createHmac('sha256', `art:${process.env.ART_KEY}`).update(s).digest('base64url');

function sign(payload: Record<string, unknown>, ttl: number) {
  const b = Buffer.from(JSON.stringify({ ...payload, exp: Date.now() + ttl })).toString(
    'base64url'
  );
  return `${b}.${mac(b)}`;
}

function unsign<T extends { exp: number }>(tok: string): T | null {
  const [b, s] = tok.split('.');
  if (!b || !s || !eq(s, mac(b))) return null;
  try {
    const p = JSON.parse(Buffer.from(b, 'base64url').toString()) as T;
    return p.exp > Date.now() ? p : null;
  } catch {
    return null;
  }
}

const session = () => sign({ t: 's' }, SESSION_MS);

function hasSession(req: VercelRequest) {
  const tok = String(req.headers.authorization ?? '').replace(/^Bearer /, '');
  const p = tok ? unsign<{ t: string; exp: number }>(tok) : null;
  return p?.t === 's';
}

/** Relying party = the site the page is on. www and apex share one. */
function rp(req: VercelRequest) {
  const origin = String(req.headers.origin ?? '');
  let host = '';
  try {
    host = new URL(origin).hostname;
  } catch {
    /* no origin */
  }
  const rpID = host.endsWith('imanolvillagomez.com') ? 'imanolvillagomez.com' : host;
  const ok = !!host && (origin.startsWith('https://') || host === 'localhost');
  return { rpID, origin, ok };
}

// ─── handler ────────────────────────────────────────────────────────────────

export default async function handler(req: VercelRequest, res: VercelResponse) {
  res.setHeader('Cache-Control', 'no-store');
  res.setHeader('X-Robots-Tag', 'noindex');

  const action = String(req.query.action ?? '');
  const body = (req.body ?? {}) as Record<string, unknown>;
  const post = req.method === 'POST';

  try {
    // ── key → session, with lockout ──
    if (action === 'unlock' && post) {
      const fails = (await getJson<{ n: number; until: number }>(FAILS)) ?? { n: 0, until: 0 };
      if (fails.until > Date.now()) return res.status(429).json({ error: 'locked' });
      const want = process.env.ART_KEY ?? '';
      if (want && eq(String(body.key ?? ''), want)) {
        if (fails.n) await putJson(FAILS, { n: 0, until: 0 });
        return res.json({ token: session() });
      }
      const n = fails.n + 1;
      await putJson(
        FAILS,
        n >= LOCK_AFTER ? { n: 0, until: Date.now() + LOCK_MS } : { n, until: 0 }
      );
      await new Promise((r) => setTimeout(r, 400 + Math.random() * 400));
      return res.status(401).json({ error: 'nope' });
    }

    // ── passkey → session (no session needed) ──
    if (action === 'passkey-login-options' && post) {
      const { rpID, ok } = rp(req);
      const keys = (await getJson<Passkey[]>(PASSKEYS)) ?? [];
      if (!ok || !keys.length) return res.status(404).json({ error: 'none' });
      const options = await generateAuthenticationOptions({
        rpID,
        userVerification: 'required',
        allowCredentials: keys.map((k) => ({ id: k.id, transports: k.transports as never })),
      });
      return res.json({ options, challenge: sign({ t: 'c', ch: options.challenge }, 5 * 60e3) });
    }

    if (action === 'passkey-login' && post) {
      const { rpID, origin, ok } = rp(req);
      const c = unsign<{ t: string; ch: string; exp: number }>(String(body.challenge ?? ''));
      const response = body.response as { id?: string } | undefined;
      const keys = (await getJson<Passkey[]>(PASSKEYS)) ?? [];
      const k = keys.find((x) => x.id === response?.id);
      if (!ok || c?.t !== 'c' || !k) return res.status(401).json({ error: 'nope' });
      const v = await verifyAuthenticationResponse({
        response: response as never,
        expectedChallenge: c.ch,
        expectedOrigin: origin,
        expectedRPID: rpID,
        requireUserVerification: true,
        credential: {
          id: k.id,
          publicKey: Buffer.from(k.publicKey, 'base64url'),
          counter: k.counter,
          transports: k.transports,
        },
      });
      if (!v.verified) return res.status(401).json({ error: 'nope' });
      k.counter = v.authenticationInfo.newCounter;
      await putJson(PASSKEYS, keys);
      return res.json({ token: session() });
    }

    // Vercel's daily cron: Authorization is the project's CRON_SECRET, not a session.
    if (action === 'insights-collect' && req.method === 'GET') {
      const secret = process.env.CRON_SECRET ?? '';
      const auth = String(req.headers.authorization ?? '');
      if (!secret || !eq(auth, `Bearer ${secret}`)) return res.status(401).json({ error: 'nope' });
      const summary = await collect();
      return res.json({ ok: true, sources: summary.sources });
    }

    // everything below needs a session
    if (!hasSession(req)) return res.status(401).json({ error: 'nope' });

    if (action === 'insights' && req.method === 'GET') {
      return res.json({
        summary: await readSummary(),
        connected: { vercel: !!process.env.VERCEL_ANALYTICS_TOKEN },
      });
    }

    if (action === 'insights-collect' && post) {
      if (!(await refreshAllowed()))
        return res.status(409).json({ error: 'Updated in the last 10 minutes. Try again soon.' });
      return res.json({ summary: await collect() });
    }

    // ── save this device's Face ID / Touch ID ──
    if (action === 'passkey-register-options' && post) {
      const { rpID, ok } = rp(req);
      if (!ok) return res.status(400).json({ error: 'bad origin' });
      const keys = (await getJson<Passkey[]>(PASSKEYS)) ?? [];
      const options = await generateRegistrationOptions({
        rpName: 'NOL art',
        rpID,
        userName: 'imanol',
        userDisplayName: 'Imanol',
        attestationType: 'none',
        excludeCredentials: keys.map((k) => ({ id: k.id, transports: k.transports })),
        authenticatorSelection: {
          authenticatorAttachment: 'platform',
          residentKey: 'preferred',
          userVerification: 'required',
        },
      });
      return res.json({ options, challenge: sign({ t: 'r', ch: options.challenge }, 5 * 60e3) });
    }

    if (action === 'passkey-register' && post) {
      const { rpID, origin, ok } = rp(req);
      const c = unsign<{ t: string; ch: string; exp: number }>(String(body.challenge ?? ''));
      if (!ok || c?.t !== 'r') return res.status(400).json({ error: 'expired' });
      const v = await verifyRegistrationResponse({
        response: body.response as never,
        expectedChallenge: c.ch,
        expectedOrigin: origin,
        expectedRPID: rpID,
        requireUserVerification: true,
      });
      if (!v.verified || !v.registrationInfo)
        return res.status(400).json({ error: 'not verified' });
      const { credential } = v.registrationInfo;
      const keys = ((await getJson<Passkey[]>(PASSKEYS)) ?? []).filter(
        (k) => k.id !== credential.id
      );
      keys.push({
        id: credential.id,
        publicKey: Buffer.from(credential.publicKey).toString('base64url'),
        counter: credential.counter,
        transports: credential.transports,
        createdAt: new Date().toISOString(),
      });
      await putJson(PASSKEYS, keys.slice(-10));
      return res.json({ id: credential.id });
    }

    // ── drops ──
    if (action === 'list' && req.method === 'GET') {
      const out = await s3.send(
        new ListObjectsV2Command({ Bucket, Prefix: INBOX, Delimiter: '/' })
      );
      const ids = (out.CommonPrefixes ?? []).map((p) => p.Prefix!.slice(INBOX.length, -1));
      // removed drops wait for the runner to clean up their files; Imanol never sees them again
      const all = ((await Promise.all(ids.map(readReq))).filter(Boolean) as ArtRequest[]).filter(
        (r) => r.status !== 'removed'
      );
      all.sort((a, b) => b.createdAt.localeCompare(a.createdAt));
      const before = clean(req.query.before, 40);
      const older = before ? all.filter((r) => r.createdAt < before) : all;
      const page = older.slice(0, PAGE);
      const worker = await getJson<WorkerHeartbeat>('queue/nol-heartbeat.json');
      return res.json({
        requests: page,
        worker,
        next: older.length > PAGE ? page[page.length - 1].createdAt : undefined,
      });
    }

    if (action === 'get' && post) {
      const r = await readReq(clean(body.id, 40));
      if (!r || r.status === 'removed') return res.status(404).json({ error: 'Drop not found.' });
      return res.json({ request: r });
    }

    // Short-lived links to a drop's thumbnails, or its originals for viewing/downloading.
    if (action === 'urls' && post) {
      const r = await readReq(clean(body.id, 40));
      if (!r || r.status === 'removed') return res.status(404).json({ error: 'Drop not found.' });
      const kind = body.kind === 'original' ? 'original' : 'thumb';
      const names = (Array.isArray(body.names) ? body.names : []).slice(0, 200).map((n) => clean(n, 400));
      const byName = new Map(r.files.map((f) => [f.name, f]));
      const urls: Record<string, string> = {};
      await Promise.all(
        names.map(async (name) => {
          const file = byName.get(name);
          if (!file) return;
          if (kind === 'thumb') {
            const key = r.thumbs?.[name];
            if (key) urls[name] = await signGet(key);
          } else {
            urls[name] = await signGet(file.key, body.download ? name.split('/').pop() : undefined);
          }
        })
      );
      return res.json({ urls });
    }

    // Reserve an id and hand back one presigned PUT per file.
    if (action === 'start' && post) {
      const files = Array.isArray(body.files) ? body.files : [];
      if (!files.length) return res.status(400).json({ error: 'no files' });
      const problem = fileProblem(
        files.map((f) => ({ name: String(f?.name ?? 'File'), size: Number(f?.size) }))
      );
      if (problem) return res.status(400).json({ error: problem });
      const d = new Date();
      const id = `${d.toISOString().slice(0, 10).replace(/-/g, '')}-${randomBytes(3).toString('hex')}`;
      const seen = new Set<string>();
      const uploads = await Promise.all(
        files.map(async (f: { name?: string; folder?: string; size?: number; type?: string }, n: number) => {
          // one folder level per group, so the runner sees the drop the way Imanol sorted it
          const folder = safeFolder(f.folder);
          let base = safeName(clean(f.name, 200));
          const path = () => (folder ? `${folder}/${base}` : base);
          while (seen.has(path())) base = `_${base}`;
          const name = path();
          seen.add(name);
          const size = Number(f.size) || 0;
          if (size > MAX_FILE) throw new Error(`${name} is over 5GB`);
          const type = clean(f.type, 100) || 'application/octet-stream';
          const key = `${INBOX}${id}/files/${name}`;
          const thumbKey = `${INBOX}${id}/thumbs/${n}.webp`;
          const [url, thumbUrl] = await Promise.all([
            signPut(key, type),
            signPut(thumbKey, 'image/webp'),
          ]);
          return { name, key, size, type, folder, url, thumbKey, thumbUrl };
        })
      );
      return res.json({ id, uploads });
    }

    // Files are up — register the drop so the runner picks it up.
    if (action === 'submit' && post) {
      const id = clean(body.id, 40);
      if (!ID.test(id)) return res.status(400).json({ error: 'bad id' });
      const now = new Date().toISOString();
      type In = {
        name: string;
        key: string;
        size: number;
        type: string;
        folder?: string;
        label?: string;
        note?: string;
      };
      const files = (Array.isArray(body.files) ? body.files : [])
        .map((f: In) => ({
          name: clean(f.name, 400),
          key: clean(f.key, 600),
          size: Number(f.size) || 0,
          type: clean(f.type, 100),
          folder: safeFolder(f.folder),
          label: clean(f.label, 200),
          note: clean(f.note, 2000),
        }))
        .filter((f) => f.key.startsWith(`${INBOX}${id}/files/`));
      const groups = (Array.isArray(body.groups) ? body.groups.slice(0, 100) : []).map(
        (g: { folder?: string; name?: string; note?: string }) => ({
          folder: safeFolder(g.folder),
          name: clean(g.name, 200),
          note: clean(g.note, 4000),
        })
      );
      const r: ArtRequest = {
        id,
        createdAt: now,
        updatedAt: now,
        status: 'pending',
        title: clean(body.title, 200),
        city: clean(body.city, 100),
        placement: body.placement === 'top' ? 'top' : 'anywhere',
        note: clean(body.note, 4000),
        files,
        groups,
      };
      // thumbnails the browser managed to upload; a missing one just shows a placeholder
      const thumbs = (body.thumbs ?? {}) as Record<string, unknown>;
      const thumbKey = new RegExp(`^${INBOX}${id}/thumbs/\\d{1,3}\\.webp$`);
      for (const f of files) {
        const key = clean(thumbs[f.name], 200);
        if (thumbKey.test(key)) (r.thumbs ??= {})[f.name] = key;
      }
      appendEvent(r, { type: 'sent', by: 'imanol' });
      await writeReq(r);
      return res.json({ request: r });
    }

    // Answer the runner's questions → back into the queue.
    if (action === 'reply' && post) {
      if (!clean(body.text, 4000))
        return res.status(400).json({ error: 'Write an answer before sending.' });
      const r = await readReq(clean(body.id, 40));
      if (!r || r.status !== 'question') return res.status(409).json({ error: 'not waiting' });
      r.answers = [
        ...(r.answers ?? []),
        { at: new Date().toISOString(), text: clean(body.text, 4000) },
      ];
      r.status = 'pending';
      appendEvent(r, { type: 'answer', text: clean(body.text, 4000), by: 'imanol' });
      await writeReq(r);
      return res.json({ request: r });
    }

    if ((action === 'revise' || action === 'retry') && post) {
      const current = await readReq(clean(body.id, 40));
      if (!current) return res.status(404).json({ error: 'Drop not found.' });
      let r: ArtRequest;
      try {
        r = queueAgain(current, action, clean(body.text, 4000));
      } catch (e) {
        return res
          .status(409)
          .json({
            error: e instanceof Error ? e.message : 'This drop has changed. Refresh and try again.',
          });
      }
      appendEvent(
        r,
        action === 'revise'
          ? { type: 'revision', text: clean(body.text, 4000), by: 'imanol' }
          : { type: 'retry', by: 'imanol' }
      );
      await writeReq(r);
      return res.json({ request: r });
    }

    // Preview looks right → runner ships it to main next wake.
    if (action === 'approve' && post) {
      const r = await readReq(clean(body.id, 40));
      if (!r || r.status !== 'preview') return res.status(409).json({ error: 'not in preview' });
      r.status = 'approved';
      appendEvent(r, { type: 'approved', by: 'imanol' });
      await writeReq(r);
      return res.json({ request: r });
    }

    // Clear a drop that didn't ship. The runner deletes its branch, files and unshipped videos.
    if (action === 'remove' && post) {
      const r = await readReq(clean(body.id, 40));
      if (!r || !['question', 'preview', 'failed'].includes(r.status))
        return res.status(409).json({ error: 'cannot remove' });
      r.status = 'removed';
      appendEvent(r, { type: 'removed', by: 'imanol' });
      await writeReq(r);
      return res.json({ request: r });
    }

    return res.status(404).json({ error: 'unknown action' });
  } catch (e) {
    return res.status(500).json({ error: e instanceof Error ? e.message : 'failed' });
  }
}
