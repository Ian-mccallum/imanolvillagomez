import type { VercelRequest, VercelResponse } from '@vercel/node';
import { createHmac, randomBytes, timingSafeEqual } from 'node:crypto';
import {
  S3Client,
  PutObjectCommand,
  GetObjectCommand,
  ListObjectsV2Command,
} from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import {
  generateRegistrationOptions,
  verifyRegistrationResponse,
  generateAuthenticationOptions,
  verifyAuthenticationResponse,
} from '@simplewebauthn/server';

/**
 * /api/art — Imanol's drop box.
 *
 * Files go browser → R2 directly via presigned PUT (Vercel caps request
 * bodies at 4.5MB). Each drop lives at inbox/<id>/ with a request.json that
 * doubles as the queue entry; the laptop runner (scripts/art-inbox) polls it.
 *
 * Auth: the ART_KEY passphrase (or a saved passkey — Face ID / Touch ID) is
 * traded for a short-lived HMAC-signed session token. The raw key is never
 * stored client-side. Repeated wrong keys lock key entry for a while;
 * passkeys keep working through a lockout.
 */

const INBOX = 'inbox/';
const PASSKEYS = 'auth/passkeys.json';
const FAILS = 'auth/fails.json';
const MAX_FILE = 5 * 1024 ** 3; // R2 single-PUT ceiling
const SESSION_MS = 12 * 3600e3;
const LOCK_AFTER = 8;
const LOCK_MS = 15 * 60e3;

type Status = 'pending' | 'working' | 'question' | 'preview' | 'approved' | 'live' | 'failed';

export interface ArtRequest {
  id: string;
  createdAt: string;
  updatedAt: string;
  status: Status;
  title: string;
  city: string;
  placement: 'top' | 'anywhere';
  note: string;
  files: { name: string; key: string; size: number; type: string }[];
  questions?: string[];
  answers?: { at: string; text: string }[];
  previewUrl?: string;
  summary?: string;
  error?: string;
}

interface Passkey {
  id: string;
  publicKey: string; // base64url
  counter: number;
  transports?: string[];
  createdAt: string;
}

const s3 = new S3Client({
  region: 'auto',
  endpoint: `https://${process.env.R2_ACCOUNT_ID}.r2.cloudflarestorage.com`,
  credentials: {
    accessKeyId: process.env.R2_ACCESS_KEY_ID ?? '',
    secretAccessKey: process.env.R2_SECRET_ACCESS_KEY ?? '',
  },
});
const Bucket = process.env.R2_BUCKET_NAME ?? '';

// ─── storage ────────────────────────────────────────────────────────────────

async function getJson<T>(Key: string): Promise<T | null> {
  try {
    const r = await s3.send(new GetObjectCommand({ Bucket, Key }));
    return JSON.parse(await r.Body!.transformToString());
  } catch {
    return null;
  }
}

const putJson = (Key: string, v: unknown) =>
  s3.send(new PutObjectCommand({ Bucket, Key, Body: JSON.stringify(v, null, 2), ContentType: 'application/json' }));

const readReq = (id: string) => getJson<ArtRequest>(`${INBOX}${id}/request.json`);

async function writeReq(r: ArtRequest) {
  r.updatedAt = new Date().toISOString();
  await putJson(`${INBOX}${r.id}/request.json`, r);
}

// ─── tokens ─────────────────────────────────────────────────────────────────

const eq = (a: string, b: string) => a.length === b.length && timingSafeEqual(Buffer.from(a), Buffer.from(b));
const mac = (s: string) => createHmac('sha256', `art:${process.env.ART_KEY}`).update(s).digest('base64url');

function sign(payload: Record<string, unknown>, ttl: number) {
  const b = Buffer.from(JSON.stringify({ ...payload, exp: Date.now() + ttl })).toString('base64url');
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
      await putJson(FAILS, n >= LOCK_AFTER ? { n: 0, until: Date.now() + LOCK_MS } : { n, until: 0 });
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
        credential: { id: k.id, publicKey: Buffer.from(k.publicKey, 'base64url'), counter: k.counter, transports: k.transports },
      });
      if (!v.verified) return res.status(401).json({ error: 'nope' });
      k.counter = v.authenticationInfo.newCounter;
      await putJson(PASSKEYS, keys);
      return res.json({ token: session() });
    }

    // everything below needs a session
    if (!hasSession(req)) return res.status(401).json({ error: 'nope' });

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
        authenticatorSelection: { authenticatorAttachment: 'platform', residentKey: 'preferred', userVerification: 'required' },
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
      if (!v.verified || !v.registrationInfo) return res.status(400).json({ error: 'not verified' });
      const { credential } = v.registrationInfo;
      const keys = ((await getJson<Passkey[]>(PASSKEYS)) ?? []).filter((k) => k.id !== credential.id);
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
      const out = await s3.send(new ListObjectsV2Command({ Bucket, Prefix: INBOX, Delimiter: '/' }));
      const ids = (out.CommonPrefixes ?? []).map((p) => p.Prefix!.slice(INBOX.length, -1));
      const all = (await Promise.all(ids.map(readReq))).filter(Boolean) as ArtRequest[];
      all.sort((a, b) => b.createdAt.localeCompare(a.createdAt));
      return res.json({ requests: all.slice(0, 40) });
    }

    // Reserve an id and hand back one presigned PUT per file.
    if (action === 'start' && post) {
      const files = Array.isArray(body.files) ? body.files.slice(0, 200) : [];
      if (!files.length) return res.status(400).json({ error: 'no files' });
      const d = new Date();
      const id = `${d.toISOString().slice(0, 10).replace(/-/g, '')}-${randomBytes(3).toString('hex')}`;
      const seen = new Set<string>();
      const uploads = await Promise.all(
        files.map(async (f: { name?: string; size?: number; type?: string }) => {
          let name = safeName(clean(f.name, 200));
          while (seen.has(name)) name = `_${name}`;
          seen.add(name);
          const size = Number(f.size) || 0;
          if (size > MAX_FILE) throw new Error(`${name} is over 5GB`);
          const type = clean(f.type, 100) || 'application/octet-stream';
          const key = `${INBOX}${id}/files/${name}`;
          const url = await getSignedUrl(s3, new PutObjectCommand({ Bucket, Key: key, ContentType: type }), {
            expiresIn: 60 * 60 * 6,
          });
          return { name, key, size, type, url };
        }),
      );
      return res.json({ id, uploads });
    }

    // Files are up — register the drop so the runner picks it up.
    if (action === 'submit' && post) {
      const id = clean(body.id, 40);
      if (!/^\d{8}-[0-9a-f]{6}$/.test(id)) return res.status(400).json({ error: 'bad id' });
      const now = new Date().toISOString();
      const files = (Array.isArray(body.files) ? body.files : [])
        .map((f: { name: string; key: string; size: number; type: string }) => ({
          name: clean(f.name, 200),
          key: clean(f.key, 400),
          size: Number(f.size) || 0,
          type: clean(f.type, 100),
        }))
        .filter((f) => f.key.startsWith(`${INBOX}${id}/files/`));
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
      };
      await writeReq(r);
      return res.json({ request: r });
    }

    // Answer the runner's questions → back into the queue.
    if (action === 'reply' && post) {
      const r = await readReq(clean(body.id, 40));
      if (!r || r.status !== 'question') return res.status(409).json({ error: 'not waiting' });
      r.answers = [...(r.answers ?? []), { at: new Date().toISOString(), text: clean(body.text, 4000) }];
      r.status = 'pending';
      await writeReq(r);
      return res.json({ request: r });
    }

    // Preview looks right → runner ships it to main next wake.
    if (action === 'approve' && post) {
      const r = await readReq(clean(body.id, 40));
      if (!r || r.status !== 'preview') return res.status(409).json({ error: 'not in preview' });
      r.status = 'approved';
      await writeReq(r);
      return res.json({ request: r });
    }

    return res.status(404).json({ error: 'unknown action' });
  } catch (e) {
    return res.status(500).json({ error: e instanceof Error ? e.message : 'failed' });
  }
}

const clean = (s: unknown, max = 2000) => String(s ?? '').slice(0, max).trim();
const safeName = (n: string) =>
  n.normalize('NFKD').replace(/[^\w.\- ]+/g, '').replace(/\s+/g, ' ').trim().slice(0, 160) || 'file';
