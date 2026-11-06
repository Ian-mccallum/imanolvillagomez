export interface Count {
  key: string;
  visitors: number;
  views: number;
}

export interface DaySnapshot {
  date: string;
  /** today's snapshot is refreshed during the day */
  partial?: boolean;
  traffic?: {
    visitors: number;
    views: number;
    pages: Count[];
    referrers: Count[];
    countries: Count[];
    devices: Count[];
  };
}

export interface SourceState {
  ok: boolean;
  /** false when its credentials aren't set up yet */
  connected?: boolean;
  error?: string;
  dataThrough?: string;
}

export interface InsightsSummary {
  updatedAt: string;
  sources: Record<string, SourceState>;
  days: DaySnapshot[];
}

export const RANGES = { '7d': 7, '30d': 30, '90d': 90 } as const;
export type Range = keyof typeof RANGES;

const merge = (lists: Count[][], n: number) => {
  const m = new Map<string, Count>();
  for (const list of lists)
    for (const c of list) {
      const k = m.get(c.key) ?? { key: c.key, visitors: 0, views: 0 };
      k.visitors += c.visitors;
      k.views += c.views;
      m.set(k.key, k);
    }
  return [...m.values()].sort((a, b) => b.views - a.views || b.visitors - a.visitors).slice(0, n);
};

const isoDay = (t: number) => new Date(t).toISOString().slice(0, 10);

/** Totals for the last `days` days ending `today`, the period before it, and one point per day. */
export function aggregate(summary: InsightsSummary, range: Range, today = isoDay(Date.now())) {
  const days = RANGES[range];
  const end = Date.parse(`${today}T00:00:00Z`);
  const start = isoDay(end - (days - 1) * 86400e3);
  const prevStart = isoDay(end - (2 * days - 1) * 86400e3);
  const byDate = new Map(summary.days.map((d) => [d.date, d]));
  const inRange = summary.days.filter((d) => d.date >= start && d.date <= today && d.traffic);
  const before = summary.days.filter((d) => d.date >= prevStart && d.date < start && d.traffic);
  const sum = (list: DaySnapshot[], k: 'visitors' | 'views') =>
    list.reduce((n, d) => n + (d.traffic?.[k] ?? 0), 0);
  const series = Array.from({ length: days }, (_, i) => {
    const date = isoDay(end - (days - 1 - i) * 86400e3);
    return { date, visitors: byDate.get(date)?.traffic?.visitors ?? 0 };
  });
  const first = summary.days.find((d) => d.traffic)?.date;
  return {
    visitors: sum(inRange, 'visitors'),
    views: sum(inRange, 'views'),
    // only compare against a previous period the history fully covers
    previousVisitors: first && first <= prevStart ? sum(before, 'visitors') : null,
    series,
    pages: merge(inRange.map((d) => d.traffic!.pages), 10),
    referrers: merge(inRange.map((d) => d.traffic!.referrers), 8),
    countries: merge(inRange.map((d) => d.traffic!.countries), 8),
    devices: merge(inRange.map((d) => d.traffic!.devices), 4),
    /** history is shorter than the range */
    collectingSince: first && first > start ? first : null,
  };
}

/** Percent change, or null when there's nothing to compare against. */
export const change = (now: number, before: number | null) =>
  before ? Math.round(((now - before) / before) * 100) : null;

const PAGES: Record<string, string> = {
  '/': 'Home',
  '/work': 'Work',
  '/work/photos': 'Photos',
  '/work/videos': 'Videos',
  '/other': 'Other',
  '/about': 'About',
  '/contact': 'Contact',
  '/privacy': 'Privacy policy',
  '/thank-you': 'Thank-you page',
};
export const pageName = (path: string) => PAGES[path] ?? path;

export function sourceName(host: string) {
  const h = host.replace(/^www\./, '').toLowerCase();
  if (!h) return 'Direct or unknown';
  if (/(^|\.)instagram\.com$|^ig\.me$/.test(h)) return 'Instagram';
  if (/(^|\.)google\./.test(h)) return 'Google';
  if (/(^|\.)(t\.co|twitter\.com|x\.com)$/.test(h)) return 'X / Twitter';
  if (/(^|\.)(facebook\.com|fb\.me)$/.test(h)) return 'Facebook';
  if (/(^|\.)tiktok\.com$/.test(h)) return 'TikTok';
  if (/(^|\.)linkedin\.com$/.test(h)) return 'LinkedIn';
  if (/(^|\.)youtube\.com$/.test(h)) return 'YouTube';
  return h;
}

/** Referrers merged by friendly name (all Instagram hosts become one row). */
export function sources(list: Count[]) {
  return [...merge([list.map((c) => ({ ...c, key: sourceName(c.key) }))], 8)];
}

export function countryName(code: string) {
  try {
    return new Intl.DisplayNames(['en'], { type: 'region' }).of(code) ?? code;
  } catch {
    return code || 'Unknown';
  }
}
