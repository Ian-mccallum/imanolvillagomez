import { useCallback, useEffect, useMemo, useState } from 'react';
import * as api from '../artApi';
import {
  RANGES,
  aggregate,
  aggregateSearch,
  aggregateVideos,
  indexHealth,
  change,
  countryName,
  pageName,
  sources,
  type Count,
  type InsightsSummary,
  type Range,
} from './model';

const fmt = new Intl.NumberFormat();
const dayLabel = (iso: string) =>
  new Intl.DateTimeFormat(undefined, { month: 'short', day: 'numeric', timeZone: 'UTC' }).format(
    new Date(`${iso}T00:00:00Z`)
  );

function Sparkline({
  points,
  label,
}: {
  points: { date: string; visitors: number }[];
  label: string;
}) {
  const max = Math.max(1, ...points.map((p) => p.visitors));
  const w = 300;
  const h = 64;
  const step = points.length > 1 ? w / (points.length - 1) : w;
  const d = points
    .map(
      (p, i) =>
        `${i ? 'L' : 'M'}${(i * step).toFixed(1)},${(h - (p.visitors / max) * (h - 6) - 3).toFixed(1)}`
    )
    .join(' ');
  return (
    <figure className="studio-spark">
      <svg viewBox={`0 0 ${w} ${h}`} preserveAspectRatio="none" role="img" aria-label={label}>
        <path d={`${d} L${w},${h} L0,${h} Z`} className="studio-spark-fill" />
        <path d={d} className="studio-spark-line" vectorEffect="non-scaling-stroke" />
      </svg>
      <table className="sr-only">
        <caption>Visitors per day</caption>
        <tbody>
          {points.map((p) => (
            <tr key={p.date}>
              <th scope="row">{dayLabel(p.date)}</th>
              <td>{p.visitors}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </figure>
  );
}

function Bars({
  rows,
  name,
  unit,
}: {
  rows: Count[];
  name: (k: string) => string;
  unit: 'views' | 'visitors';
}) {
  if (!rows.length) return <p className="studio-muted">Nothing yet for this period.</p>;
  const max = Math.max(1, ...rows.map((r) => r[unit]));
  return (
    <ol className="studio-bars">
      {rows.map((r) => (
        <li key={r.key}>
          <span className="studio-bar-label">{name(r.key)}</span>
          <span className="studio-bar-value">{fmt.format(r[unit])}</span>
          <span className="studio-bar-track" aria-hidden>
            <span className="studio-bar" style={{ width: `${(r[unit] / max) * 100}%` }} />
          </span>
        </li>
      ))}
    </ol>
  );
}

/** Rows ranked by a number, with a track; works for any list of labelled counts. */
function RankList({
  rows,
}: {
  rows: { key: string; label: string; value: number; note?: string }[];
}) {
  if (!rows.length) return <p className="studio-muted">Nothing yet for this period.</p>;
  const max = Math.max(1, ...rows.map((r) => r.value));
  return (
    <ol className="studio-bars">
      {rows.map((r) => (
        <li key={r.key}>
          <span className="studio-bar-label">
            {r.label}
            {r.note && <span className="studio-muted"> · {r.note}</span>}
          </span>
          <span className="studio-bar-value">{fmt.format(r.value)}</span>
          <span className="studio-bar-track" aria-hidden>
            <span className="studio-bar" style={{ width: `${(r.value / max) * 100}%` }} />
          </span>
        </li>
      ))}
    </ol>
  );
}

/** Which videos people load, from Cloudflare; titles come from the site manifest. */
function VideoCard({
  summary,
  range,
  connected,
}: {
  summary: InsightsSummary | null;
  range: Range;
  connected: boolean;
}) {
  const [titles, setTitles] = useState<Record<string, string>>({});
  useEffect(() => {
    fetch('/site-manifest.json')
      .then((r) => (r.ok ? r.json() : null))
      .then(
        (m: { videos?: { file: string; title: string }[] } | null) =>
          m?.videos && setTitles(Object.fromEntries(m.videos.map((v) => [v.file, v.title]))),
        () => {}
      );
  }, []);
  const videos = summary ? aggregateVideos(summary, range) : null;
  return (
    <article className="studio-card studio-card-wide">
      <h2>Which videos people watch</h2>
      {videos ? (
        <>
          <RankList
            rows={videos.slice(0, 10).map((v) => ({
              key: v.file,
              label: titles[v.file] ?? v.file.replace(/\.mp4$/, ''),
              value: v.loads,
            }))}
          />
          <p className="studio-muted studio-fineprint">
            Counted as video loads, so one viewing can count a few times. Good for comparing videos,
            not exact plays.
          </p>
        </>
      ) : (
        <p className="studio-muted">
          {connected
            ? 'Video numbers arrive with the next daily update.'
            : 'Ian is connecting video numbers. Nothing for you to do.'}
        </p>
      )}
    </article>
  );
}

/** How the site shows up on Google, and whether Google lists every page. */
function GoogleCards({
  summary,
  range,
  connected,
}: {
  summary: InsightsSummary | null;
  range: Range;
  connected: boolean;
}) {
  const search = summary ? aggregateSearch(summary, range) : null;
  const health = indexHealth(summary?.index);
  const state = summary?.sources.gsc;
  if (!connected && !search)
    return (
      <div className="studio-cards">
        <article className="studio-card studio-card-wide">
          <h2>On Google</h2>
          <p className="studio-muted">
            Ian is connecting Google Search, so you'll see how people find you there. Nothing for
            you to do.
          </p>
        </article>
      </div>
    );
  return (
    <div className="studio-cards">
      <article className="studio-card studio-card-wide">
        <h2>On Google</h2>
        {state && !state.ok && state.connected !== false && (
          <p className="studio-notice">
            Google's latest numbers didn't come through; these are older.
          </p>
        )}
        {search ? (
          <>
            <div className="studio-stats">
              <p className="studio-stat">
                <strong>{fmt.format(search.clicks)}</strong>
                <span>visits from Google</span>
              </p>
              <p className="studio-stat">
                <strong>{fmt.format(search.impressions)}</strong>
                <span>times you showed up</span>
              </p>
              {search.position !== null && (
                <p className="studio-stat">
                  <strong>#{Math.max(1, Math.round(search.position))}</strong>
                  <span>usual spot in results</span>
                </p>
              )}
              <p className="studio-stat-caption">
                Google reports a couple of days late; numbers run through {dayLabel(search.through)}
                .
              </p>
            </div>
            <h3 className="studio-card-sub">What people searched</h3>
            <RankList
              rows={[...search.queries]
                .sort((x, y) => y.impressions - x.impressions)
                .map((q) => ({
                  key: q.key,
                  label: q.key,
                  value: q.impressions,
                  note: q.clicks ? `${fmt.format(q.clicks)} clicked` : undefined,
                }))}
            />
          </>
        ) : (
          <p className="studio-muted">The first Google numbers arrive within a few days.</p>
        )}
      </article>
      {health && (
        <article className="studio-card studio-card-wide">
          <h2>Is Google seeing every page?</h2>
          <p className="studio-lead">
            <strong>{health.indexed}</strong> of {health.checked} pages checked are on Google.
          </p>
          {health.issues.length > 0 ? (
            <ul className="studio-issue-list">
              {health.issues.slice(0, 8).map((i) => (
                <li key={i.url}>
                  <span>{pageName(new URL(i.url).pathname)}</span>
                  <span className="studio-muted">{i.why}</span>
                </li>
              ))}
            </ul>
          ) : (
            <p className="studio-muted">Every page checked so far is listed. Nothing to fix.</p>
          )}
        </article>
      )}
    </div>
  );
}

/** Placeholder cards while the first summary loads. */
function InsightsSkeleton() {
  return (
    <div className="studio-cards" role="status" aria-label="Loading insights">
      <div className="studio-card studio-card-wide" aria-hidden>
        <span className="studio-skeleton" style={{ width: 90, height: 14 }} />
        <span className="studio-skeleton" style={{ width: 180, height: 34, marginTop: 16 }} />
        <span className="studio-skeleton" style={{ width: '100%', height: 72, marginTop: 20 }} />
      </div>
      {[0, 1, 2, 3].map((n) => (
        <div key={n} className="studio-card" aria-hidden>
          <span className="studio-skeleton" style={{ width: 140, height: 14 }} />
          {[80, 60, 45].map((w) => (
            <span
              key={w}
              className="studio-skeleton"
              style={{ width: `${w}%`, height: 10, marginTop: 18 }}
            />
          ))}
        </div>
      ))}
    </div>
  );
}

export default function Insights({
  range: raw,
  onRange,
}: {
  range?: string;
  onRange: (r: Range) => void;
}) {
  const range: Range = raw && raw in RANGES ? (raw as Range) : '30d';
  const [data, setData] = useState<api.InsightsResponse | null>(null);
  const [error, setError] = useState('');
  const [refreshing, setRefreshing] = useState(false);
  const [note, setNote] = useState('');

  const load = useCallback(() => {
    setError('');
    return api
      .insights()
      .then(setData, () =>
        setError('Could not load insights. Check your connection and try again.')
      );
  }, []);
  useEffect(() => {
    load();
  }, [load]);

  const summary: InsightsSummary | null = data?.summary ?? null;
  const a = useMemo(() => (summary ? aggregate(summary, range) : null), [summary, range]);
  const vercel = summary?.sources.vercel;
  const delta = a ? change(a.visitors, a.previousVisitors) : null;

  const refresh = async () => {
    setRefreshing(true);
    setNote('');
    try {
      const { summary: next } = await api.refreshInsights();
      setData((d) => ({ connected: d?.connected ?? { vercel: true }, summary: next }));
      setNote('Updated just now.');
    } catch (e) {
      setNote(e instanceof Error && e.message ? e.message : 'Could not update. Try again.');
    } finally {
      setRefreshing(false);
    }
  };

  return (
    <section className="studio-insights" aria-labelledby="insights-heading">
      <div className="studio-section-head">
        <div>
          <h1 id="insights-heading">Insights</h1>
          <p className="studio-muted">
            Who visits your website and what they look at.
            {summary ? ` Updated ${new Date(summary.updatedAt).toLocaleString()}.` : ''}
          </p>
        </div>
        <div className="studio-insights-tools">
          <div className="studio-filters" role="group" aria-label="Time period">
            {(Object.keys(RANGES) as Range[]).map((r) => (
              <button key={r} aria-pressed={range === r} onClick={() => onRange(r)}>
                {r === '7d' ? '7 days' : r === '30d' ? '30 days' : '90 days'}
              </button>
            ))}
          </div>
          {data?.connected.vercel && (
            <button className="studio-button" onClick={refresh} disabled={refreshing}>
              {refreshing ? 'Updating…' : 'Update now'}
            </button>
          )}
        </div>
      </div>
      {note && (
        <p className="studio-muted" role="status">
          {note}
        </p>
      )}
      {error && (
        <div className="studio-notice" role="alert">
          {error} <button onClick={load}>Try again</button>
        </div>
      )}
      {!data && !error && <InsightsSkeleton />}
      {data && !data.connected.vercel && !summary && (
        <div className="studio-empty">
          <h3>Visitor numbers are almost ready</h3>
          <p>Ian is connecting your website's visitor counts. Nothing for you to do.</p>
        </div>
      )}
      {data && data.connected.vercel && !summary && (
        <div className="studio-empty">
          <h3>No numbers yet</h3>
          <p>The first update runs once a day. Choose Update now to get today's numbers.</p>
        </div>
      )}
      {a && (
        <>
          {vercel && !vercel.ok && vercel.connected !== false && (
            <p className="studio-notice">
              Today's update didn't work, so these numbers are from{' '}
              {vercel.dataThrough ? dayLabel(vercel.dataThrough) : 'the last good update'}.
            </p>
          )}
          {a.collectingSince && (
            <p className="studio-muted">
              Counting since {dayLabel(a.collectingSince)}, so this period isn't full yet.
            </p>
          )}
          <div className="studio-cards">
            <article className="studio-card studio-card-wide">
              <h2>Visitors</h2>
              <div className="studio-stats">
                <p className="studio-stat">
                  <strong>{fmt.format(a.visitors)}</strong>
                  <span>visits</span>
                </p>
                <p className="studio-stat">
                  <strong>{fmt.format(a.views)}</strong>
                  <span>page views</span>
                </p>
                <p className="studio-stat-caption">
                  in the last {RANGES[range]} days
                  {delta !== null && (
                    <span className={`studio-delta ${delta >= 0 ? 'is-up' : 'is-down'}`}>
                      {delta >= 0 ? '↑' : '↓'} {Math.abs(delta)}% vs the {RANGES[range]} days before
                    </span>
                  )}
                </p>
              </div>
              <Sparkline
                points={a.series}
                label={`Visitors per day over the last ${RANGES[range]} days, up to ${fmt.format(
                  Math.max(0, ...a.series.map((p) => p.visitors))
                )} in a day`}
              />
            </article>
            <article className="studio-card">
              <h2>What people look at</h2>
              <Bars rows={a.pages} name={pageName} unit="views" />
            </article>
            <article className="studio-card">
              <h2>How they find you</h2>
              <Bars rows={sources(a.referrers)} name={(k) => k} unit="visitors" />
            </article>
            <article className="studio-card">
              <h2>Where they are</h2>
              <Bars rows={a.countries} name={countryName} unit="visitors" />
            </article>
            <article className="studio-card">
              <h2>Phone or computer</h2>
              <Bars
                rows={a.devices}
                name={(k) =>
                  k === 'mobile'
                    ? 'Phone'
                    : k === 'desktop'
                      ? 'Computer'
                      : k === 'tablet'
                        ? 'Tablet'
                        : k
                }
                unit="visitors"
              />
            </article>
          </div>
          <p className="studio-muted studio-fineprint">
            Visits count each visitor once per day. Visitors whose browser asks not to be tracked
            aren't counted.
          </p>
        </>
      )}
      {data && <GoogleCards summary={summary} range={range} connected={!!data.connected.gsc} />}
      {data && (
        <div className="studio-cards">
          <VideoCard summary={summary} range={range} connected={!!data.connected.cloudflare} />
        </div>
      )}
    </section>
  );
}
