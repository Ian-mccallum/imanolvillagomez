import { ListObjectsV2Command } from '@aws-sdk/client-s3';
import { Bucket, getJson, putJson, s3 } from './storage.js';
import type { DaySnapshot, InsightsSummary, SourceState } from '../../src/components/art/insights/model.js';

const DAILY = 'analytics/daily/';
const SUMMARY = 'analytics/summary.json';
const LOCK = 'analytics/lock.json';
const KEEP_DAYS = 90;
const PROJECT = process.env.VERCEL_PROJECT_ID || 'prj_r9omRaiVco4DyAD0zQnxo9Ti2cLr';

type Row = Record<string, string | number>;

async function vercel(by: string | null, day: string, limit: number): Promise<Row[]> {
  const q = new URLSearchParams({
    projectId: PROJECT,
    since: `${day}T00:00:00.000Z`,
    until: `${day}T23:59:59.999Z`,
    limit: String(limit),
  });
  if (by) q.set('by', by);
  if (process.env.VERCEL_TEAM_ID) q.set('teamId', process.env.VERCEL_TEAM_ID);
  const path = by ? 'aggregate' : 'count';
  const res = await fetch(`https://api.vercel.com/v1/query/web-analytics/visits/${path}?${q}`, {
    headers: { Authorization: `Bearer ${process.env.VERCEL_ANALYTICS_TOKEN}` },
    signal: AbortSignal.timeout(8000),
  });
  if (!res.ok) throw new Error(`Vercel ${res.status}`);
  const data = (await res.json()).data;
  return Array.isArray(data) ? data : [data];
}

const top = (rows: Row[], key: string, n: number) =>
  rows
    .filter((r) => r[key] !== 'Others')
    .map((r) => ({ key: String(r[key] ?? ''), visitors: Number(r.visitors) || 0, views: Number(r.pageviews) || 0 }))
    .slice(0, n);

/** One UTC day of site traffic. */
export async function trafficDay(day: string): Promise<DaySnapshot['traffic']> {
  const [total, pages, referrers, countries, devices] = await Promise.all([
    vercel(null, day, 1),
    vercel('requestPath', day, 30),
    vercel('referrerHostname', day, 15),
    vercel('country', day, 15),
    vercel('deviceType', day, 5),
  ]);
  return {
    visitors: Number(total[0]?.visitors) || 0,
    views: Number(total[0]?.pageviews) || 0,
    pages: top(pages, 'requestPath', 30),
    referrers: top(referrers, 'referrerHostname', 15),
    countries: top(countries, 'country', 15),
    devices: top(devices, 'deviceType', 5),
  };
}

const dayOf = (offset: number, now = Date.now()) =>
  new Date(now - offset * 86400e3).toISOString().slice(0, 10);

/**
 * Snapshot today (partial) and the two days before it, then rebuild the summary the
 * Insights page reads. Each source fails on its own; a failure keeps the last good data.
 */
export async function collect(now = Date.now()): Promise<InsightsSummary> {
  const sources: Record<string, SourceState> = {};
  const vercelReady = !!process.env.VERCEL_ANALYTICS_TOKEN;
  sources.vercel = vercelReady ? { ok: true } : { ok: false, connected: false };
  if (vercelReady) {
    for (const offset of [0, 1, 2]) {
      const date = dayOf(offset, now);
      try {
        const traffic = await trafficDay(date);
        const prev = (await getJson<DaySnapshot>(`${DAILY}${date}.json`)) ?? { date };
        await putJson(`${DAILY}${date}.json`, { ...prev, date, traffic, partial: offset === 0 });
        sources.vercel.dataThrough ??= date;
      } catch (e) {
        sources.vercel = { ok: false, connected: true, error: e instanceof Error ? e.message : 'failed' };
        break;
      }
    }
  }
  const summary = await buildSummary(sources, now);
  await putJson(SUMMARY, summary);
  return summary;
}

async function buildSummary(sources: Record<string, SourceState>, now: number): Promise<InsightsSummary> {
  const out = await s3.send(new ListObjectsV2Command({ Bucket, Prefix: DAILY }));
  const cutoff = dayOf(KEEP_DAYS, now);
  const keys = (out.Contents ?? [])
    .map((o) => o.Key!)
    .filter((k) => k.slice(DAILY.length, -5) >= cutoff)
    .sort();
  const days = (await Promise.all(keys.map((k) => getJson<DaySnapshot>(k)))).filter(
    Boolean
  ) as DaySnapshot[];
  const previous = await getJson<InsightsSummary>(SUMMARY);
  // a source that failed this run keeps the date its last good data reached
  for (const [name, state] of Object.entries(sources))
    if (!state.ok && state.connected) state.dataThrough ??= previous?.sources?.[name]?.dataThrough;
  return { updatedAt: new Date(now).toISOString(), sources, days };
}

export const readSummary = () => getJson<InsightsSummary>(SUMMARY);

/** On-demand refresh at most every 10 minutes; the daily cron is never limited. */
export async function refreshAllowed(now = Date.now()) {
  const lock = await getJson<{ at: number }>(LOCK);
  if (lock && now - lock.at < 10 * 60e3) return false;
  await putJson(LOCK, { at: now });
  return true;
}
