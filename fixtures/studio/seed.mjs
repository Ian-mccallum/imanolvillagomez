// Sample Studio data for `STUDIO_FIXTURE=1 npm run dev`. Values are text, or { file } served from disk.
const img = (name) => ({ file: `public/images/${name}`, type: 'image/jpeg' });
const day = (d, h = 12) => new Date(Date.UTC(2026, 10, d, h)).toISOString();

function drop(id, status, title, names, extra = {}) {
  const files = names.map((n) => ({
    name: n,
    key: `inbox/${id}/files/${n}`,
    size: 2_400_000,
    type: 'image/jpeg',
  }));
  return {
    id,
    status,
    title,
    city: 'Chicago',
    placement: 'top',
    note: 'Put these at the top of Photos, in this order.',
    createdAt: extra.createdAt ?? day(3),
    updatedAt: extra.updatedAt ?? day(3, 14),
    files,
    groups: [],
    ...extra,
  };
}

export function seedStudio() {
  const objects = new Map();
  const put = (key, value) => objects.set(key, value);
  const hollis = ['2hollis-1.jpeg', '2hollis-2.jpeg'];
  const frost = ['frostchildren-1.jpeg', 'frostchildren-2.jpeg', 'frostchildren-3.jpeg', 'frostchildren-4.jpeg', 'frostchildren-5.jpeg'];

  const live = drop('20261103-aaaaaa', 'live', 'FROST CHILDREN', frost, {
    createdAt: day(3, 9),
    liveAt: day(3, 16),
    summary: '5 FROST CHILDREN photos at the top of Photos, in the order sent.',
    previewUrl: 'https://example.vercel.app',
    thumbs: Object.fromEntries(frost.slice(0, 4).map((n, i) => [n, `inbox/20261103-aaaaaa/thumbs/${i}.webp`])),
    placements: [
      ...frost.slice(0, 4).map((n, i) => ({ file: n, kind: 'photo', siteId: `photo-2026-20${i}`, siteUrl: `/images/${n}` })),
      { file: frost[4], kind: 'unused', reason: 'Near-duplicate of the photo before it' },
    ],
    history: [
      { at: day(3, 9), type: 'sent', by: 'imanol' },
      { at: day(3, 9, 10), type: 'working', by: 'studio' },
      { at: day(3, 10), type: 'preview', by: 'studio', previewUrl: 'https://example-1.vercel.app' },
      { at: day(3, 11), type: 'revision', by: 'imanol', text: 'Drop the blurry one at the end.' },
      { at: day(3, 12), type: 'preview', by: 'studio', previewUrl: 'https://example.vercel.app' },
      { at: day(3, 15), type: 'approved', by: 'imanol' },
      { at: day(3, 16), type: 'live', by: 'studio' },
    ],
  });
  const preview = drop('20261104-bbbbbb', 'preview', '2HOLLIS', hollis, {
    createdAt: day(4, 9),
    summary: '2 2HOLLIS photos above FROST CHILDREN.',
    previewUrl: 'https://example-2.vercel.app',
  });
  const question = drop('20261105-cccccc', 'question', '', hollis, {
    createdAt: day(5, 9),
    questions: ['Which tour should these be tagged with?'],
  });
  const failed = drop('20261105-dddddd', 'failed', 'NATION', hollis, {
    createdAt: day(5, 11),
    error: "something went wrong on our end. text Ian and he'll sort it",
  });

  for (const r of [live, preview, question, failed]) {
    put(`inbox/${r.id}/request.json`, JSON.stringify(r));
    r.files.forEach((f) => put(f.key, img(f.name)));
    for (const [name, key] of Object.entries(r.thumbs ?? {})) put(key, img(name));
  }
  put('queue/nol-heartbeat.json', JSON.stringify({ state: 'idle', updatedAt: new Date().toISOString() }));
  put('analytics/summary.json', JSON.stringify(sampleInsights()));
  return objects;
}

/** 40 days of plausible traffic, deterministic so screenshots compare. */
function sampleInsights() {
  let seed = 7;
  const rand = () => ((seed = (seed * 16807) % 2147483647) / 2147483647);
  const today = Date.now();
  const days = Array.from({ length: 40 }, (_, i) => {
    const date = new Date(today - (39 - i) * 86400e3).toISOString().slice(0, 10);
    const visitors = Math.round(18 + i * 0.6 + rand() * 14);
    const views = Math.round(visitors * (2.4 + rand()));
    const split = (keys, total) =>
      keys.map(([key, share]) => ({ key, visitors: Math.round(visitors * share), views: Math.round(total * share) }));
    return {
      date,
      partial: i === 39,
      traffic: {
        visitors,
        views,
        pages: split([['/', 0.4], ['/work/photos', 0.3], ['/work/videos', 0.15], ['/about', 0.08], ['/contact', 0.07]], views),
        referrers: split([['', 0.45], ['l.instagram.com', 0.3], ['www.google.com', 0.15], ['instagram.com', 0.1]], views),
        countries: split([['US', 0.78], ['CA', 0.08], ['GB', 0.06], ['MX', 0.05]], views),
        devices: split([['mobile', 0.72], ['desktop', 0.25], ['tablet', 0.03]], views),
      },
      // Google reports two days late
      ...(i < 38
        ? {
            search: {
              clicks: Math.round(2 + rand() * 4),
              impressions: Math.round(30 + rand() * 40),
              position: Math.round((6 + rand() * 4) * 10) / 10,
              queries: [
                ['imanol villagomez', 3, 12, 1.2],
                ['chicago concert photographer', 1, 18, 9.4],
                ['osamason live photos', 0, 9, 14.1],
                ['nol videography', 1, 4, 2.5],
              ].map(([key, clicks, impressions, position]) => ({ key, clicks, impressions, position })),
              pages: [],
            },
          }
        : {}),
    };
  });
  return {
    updatedAt: new Date().toISOString(),
    sources: { vercel: { ok: true, dataThrough: days[39].date }, gsc: { ok: true, dataThrough: days[37].date } },
    days,
    index: {
      cursor: 0,
      updatedAt: new Date().toISOString(),
      pages: Object.fromEntries(
        ['/', '/work', '/work/photos', '/work/videos', '/about', '/contact', '/other', '/privacy'].map((p, i) => [
          `https://www.imanolvillagomez.com${p}`,
          i === 6
            ? { verdict: 'NEUTRAL', coverage: 'Crawled - currently not indexed', checkedAt: '' }
            : i === 7
              ? { verdict: 'NEUTRAL', coverage: 'Discovered - currently not indexed', checkedAt: '' }
              : { verdict: 'PASS', coverage: 'Submitted and indexed', checkedAt: '' },
        ])
      ),
    },
  };
}
