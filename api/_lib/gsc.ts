import { createSign } from 'node:crypto';
import { getJson, putJson } from './storage.js';
import type { IndexState, SearchDay } from '../../src/components/art/insights/model.js';

const SCOPE = 'https://www.googleapis.com/auth/webmasters.readonly';
const INDEX = 'analytics/index.json';
const INSPECT_PER_RUN = 20;

interface ServiceAccount {
  client_email: string;
  private_key: string;
}

export const gscConfigured = () => !!process.env.GSC_SERVICE_ACCOUNT_JSON && !!process.env.GSC_SITE;

function account(): ServiceAccount {
  const raw = process.env.GSC_SERVICE_ACCOUNT_JSON ?? '';
  return JSON.parse(raw.trim().startsWith('{') ? raw : Buffer.from(raw, 'base64').toString('utf8'));
}

const b64 = (v: object | Buffer) =>
  (Buffer.isBuffer(v) ? v : Buffer.from(JSON.stringify(v))).toString('base64url');

/** A signed service-account assertion (RS256), exchanged for a one-hour access token. */
export function assertion(sa: ServiceAccount, now = Math.floor(Date.now() / 1000)) {
  const head = b64({ alg: 'RS256', typ: 'JWT' });
  const claims = b64({
    iss: sa.client_email,
    scope: SCOPE,
    aud: 'https://oauth2.googleapis.com/token',
    iat: now,
    exp: now + 3600,
  });
  const sig = createSign('RSA-SHA256').update(`${head}.${claims}`).sign(sa.private_key);
  return `${head}.${claims}.${b64(sig)}`;
}

async function token() {
  const res = await fetch('https://oauth2.googleapis.com/token', {
    method: 'POST',
    headers: { 'content-type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      grant_type: 'urn:ietf:params:oauth:grant-type:jwt-bearer',
      assertion: assertion(account()),
    }),
    signal: AbortSignal.timeout(8000),
  });
  // never echo Google's body: it can quote the request
  if (!res.ok) throw new Error(`Google sign-in ${res.status}`);
  return (await res.json()).access_token as string;
}

async function google(tok: string, url: string, body: unknown) {
  const res = await fetch(url, {
    method: 'POST',
    headers: { authorization: `Bearer ${tok}`, 'content-type': 'application/json' },
    body: JSON.stringify(body),
    signal: AbortSignal.timeout(8000),
  });
  if (!res.ok) throw new Error(`Search Console ${res.status}`);
  return res.json();
}

const site = () => encodeURIComponent(process.env.GSC_SITE ?? '');

/** Search results for each day: totals, top searches and top pages. */
export async function searchDays(days: string[]): Promise<Record<string, SearchDay>> {
  const tok = await token();
  const url = `https://www.googleapis.com/webmasters/v3/sites/${site()}/searchAnalytics/query`;
  const out: Record<string, SearchDay> = {};
  for (const day of days) {
    const q = (dimensions: string[], rowLimit: number) =>
      google(tok, url, { startDate: day, endDate: day, dimensions, rowLimit, dataState: 'all' });
    const [total, queries, pages] = await Promise.all([q([], 1), q(['query'], 25), q(['page'], 25)]);
    const row = total.rows?.[0] ?? {};
    const pick = (rows: { keys: string[]; clicks: number; impressions: number; position: number }[] = []) =>
      rows.map((r) => ({
        key: r.keys[0],
        clicks: r.clicks,
        impressions: r.impressions,
        position: Math.round(r.position * 10) / 10,
      }));
    out[day] = {
      clicks: row.clicks ?? 0,
      impressions: row.impressions ?? 0,
      position: row.position ? Math.round(row.position * 10) / 10 : null,
      queries: pick(queries.rows),
      pages: pick(pages.rows),
    };
  }
  return out;
}

/** Check a rotating slice of the sitemap with URL Inspection; returns the running picture. */
export async function inspectSome(origin: string): Promise<IndexState> {
  const state = (await getJson<IndexState>(INDEX)) ?? { pages: {}, cursor: 0, updatedAt: '' };
  const xml = await fetch(`${origin}/sitemap.xml`, { signal: AbortSignal.timeout(5000) }).then((r) =>
    r.ok ? r.text() : ''
  );
  const urls = [...xml.matchAll(/<loc>\s*([^<\s]+)\s*<\/loc>/g)].map((m) => m[1]).slice(0, 500);
  if (!urls.length) return state;
  const tok = await token();
  const batch = Array.from({ length: Math.min(INSPECT_PER_RUN, urls.length) }, (_, i) => urls[(state.cursor + i) % urls.length]);
  // four at a time keeps the daily run short and far under the 600/minute quota
  for (let i = 0; i < batch.length; i += 4)
    await Promise.all(
      batch.slice(i, i + 4).map(async (url) => {
        const r = await google(tok, 'https://searchconsole.googleapis.com/v1/urlInspection/index:inspect', {
          inspectionUrl: url,
          siteUrl: process.env.GSC_SITE,
        });
        const s = r.inspectionResult?.indexStatusResult ?? {};
        state.pages[url] = {
          verdict: String(s.verdict ?? 'VERDICT_UNSPECIFIED'),
          coverage: String(s.coverageState ?? ''),
          lastCrawl: s.lastCrawlTime,
          checkedAt: new Date().toISOString(),
        };
      })
    );
  for (const url of Object.keys(state.pages)) if (!urls.includes(url)) delete state.pages[url];
  state.cursor = (state.cursor + INSPECT_PER_RUN) % urls.length;
  state.updatedAt = new Date().toISOString();
  await putJson(INDEX, state);
  return state;
}
