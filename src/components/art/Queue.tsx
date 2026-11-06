import { useEffect, useMemo, useState } from 'react';
import * as api from './artApi';
import { inProgress, needsAttention, requestTitle } from './studioModel';

/** First few thumbnails per drop, signed links cached until shortly before they expire. */
const stripCache = new Map<string, { at: number; urls: string[] }>();
function useStrip(r: api.ArtRequest) {
  const names = r.files
    .filter((f) => r.thumbs?.[f.name])
    .slice(0, 4)
    .map((f) => f.name);
  const key = `${r.id}:${names.join('|')}`;
  const [urls, setUrls] = useState<string[]>(() => stripCache.get(key)?.urls ?? []);
  useEffect(() => {
    if (!names.length || r.id.startsWith('practice-')) return;
    const hit = stripCache.get(key);
    if (hit && Date.now() - hit.at < 8 * 60_000) return setUrls(hit.urls);
    let live = true;
    api.urls(r.id, names, 'thumb').then(
      (u) => {
        const list = names.map((n) => u[n]).filter(Boolean);
        stripCache.set(key, { at: Date.now(), urls: list });
        if (live) setUrls(list);
      },
      () => {}
    );
    return () => {
      live = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key]);
  return urls;
}

const LABEL: Record<api.ArtStatus, string> = {
  pending: 'Queued',
  working: 'Preparing preview',
  question: 'Needs your answer',
  preview: 'Ready to review',
  approved: 'Publishing',
  live: 'Live',
  failed: 'Needs attention',
  removed: 'Removed',
};
const EXPLAIN: Partial<Record<api.ArtStatus, string>> = {
  pending: 'Your files are safe. The studio checks for new work every two minutes.',
  working: 'Your work is being prepared. You can close this tab and come back later.',
  approved: 'Your approved preview is being published to the website.',
  failed: 'This drop could not be completed. Try again, or text Ian if it happens again.',
  live: 'Published to your website.',
};
const date = (iso: string) =>
  new Intl.DateTimeFormat(undefined, {
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  }).format(new Date(iso));

type Action = 'approve' | 'remove' | 'revise' | 'retry' | 'reply';

export function DropRow({
  r,
  onChange,
  onOpen,
  inDetail = false,
  workerDown = false,
}: {
  r: api.ArtRequest;
  onChange: (r: api.ArtRequest) => void;
  onOpen?: () => void;
  inDetail?: boolean;
  workerDown?: boolean;
}) {
  const strip = useStrip(r);
  const [confirm, setConfirm] = useState<'approve' | 'remove' | null>(null);
  const [feedback, setFeedback] = useState(false);
  const [text, setText] = useState('');
  const [busy, setBusy] = useState<Action | null>(null);
  const [error, setError] = useState('');
  const practice = r.id.startsWith('practice-');
  const run = async (action: Action) => {
    if (busy) return;
    setBusy(action);
    setError('');
    try {
      const next = practice
        ? {
            ...r,
            status: (action === 'approve'
              ? 'live'
              : action === 'remove'
                ? 'removed'
                : 'pending') as api.ArtStatus,
          }
        : await (action === 'approve'
            ? api.approve(r.id)
            : action === 'remove'
              ? api.remove(r.id)
              : action === 'revise'
                ? api.revise(r.id, text)
                : action === 'retry'
                  ? api.retry(r.id)
                  : api.reply(r.id, text));
      onChange(next);
      setText('');
      setConfirm(null);
      setFeedback(false);
    } catch (e) {
      setError(
        e instanceof api.Unauthorized
          ? 'Your session expired. Sign in again; your drop is safe.'
          : e instanceof Error && e.message
            ? e.message
            : 'Could not connect. Please try again.'
      );
    } finally {
      setBusy(null);
    }
  };
  const removable = ['pending', 'question', 'preview', 'failed', 'live'].includes(r.status);
  return (
    <article
      className={`studio-drop${needsAttention(r.status) ? ' studio-drop-attention' : ''}${inDetail ? ' is-detail' : ''}`}
      aria-label={requestTitle(r)}
    >
      <header className="studio-drop-head">
        <div className="studio-drop-titles">
          <h3>{requestTitle(r)}</h3>
          <p className="studio-drop-meta">
            {r.files.length} {r.files.length === 1 ? 'file' : 'files'}
            {r.city ? ` · ${r.city}` : ''} · {date(r.createdAt)}
          </p>
        </div>
        <span className={`studio-status studio-status-${r.status}`}>{LABEL[r.status]}</span>
      </header>
      {!inDetail && strip.length > 0 && (
        <button className="studio-strip" onClick={onOpen} aria-label={`View ${requestTitle(r)}`}>
          {strip.map((u) => (
            <img key={u} src={u} alt="" loading="lazy" decoding="async" />
          ))}
          {r.files.length > strip.length && (
            <span className="studio-strip-more">+{r.files.length - strip.length}</span>
          )}
        </button>
      )}
      {r.status === 'pending' && workerDown && !r.siteChanged ? (
        <p className="studio-drop-explain">
          Waiting for the studio to come back. Your files are safe and Ian has been told.
        </p>
      ) : r.siteChanged && (r.status === 'pending' || r.status === 'working') ? (
        <p className="studio-drop-explain">
          Other work went live since your preview, so a fresh preview is on its way. You'll approve
          the new one.
        </p>
      ) : (
        EXPLAIN[r.status] && <p className="studio-drop-explain">{EXPLAIN[r.status]}</p>
      )}
      {r.status === 'question' && (
        <div className="studio-reply">
          <h4>A quick question before we continue</h4>
          <ul>
            {r.questions?.map((q, i) => (
              <li key={i}>{q}</li>
            ))}
          </ul>
          <label htmlFor={`answer-${r.id}`}>Your answer</label>
          <textarea
            id={`answer-${r.id}`}
            value={text}
            onChange={(e) => setText(e.target.value)}
            rows={3}
            placeholder="Tell us what you have in mind…"
            disabled={!!busy}
          />
          <button
            className="studio-button studio-button-primary"
            disabled={!text.trim() || !!busy}
            onClick={() => run('reply')}
          >
            {busy === 'reply' ? 'Sending…' : 'Send answer'}
          </button>
        </div>
      )}
      {r.status === 'preview' && (
        <>
          {r.summary && <p className="studio-drop-explain">{r.summary}</p>}
          <div className="studio-actions">
            {practice ? (
              <span className="studio-muted">Practice preview — nothing was uploaded</span>
            ) : r.previewUrl ? (
              <a className="studio-button" href={r.previewUrl} target="_blank" rel="noreferrer">
                Open preview <span aria-hidden>↗</span>
              </a>
            ) : (
              <span className="studio-muted">
                Preview link unavailable. Text Ian before publishing.
              </span>
            )}
            {(practice || r.previewUrl) && (
              <button
                className="studio-button studio-button-primary"
                disabled={!!busy}
                onClick={() => {
                  setConfirm('approve');
                  setFeedback(false);
                }}
              >
                Publish to website
              </button>
            )}
            {!practice && (
              <button
                className="studio-button"
                disabled={!!busy}
                onClick={() => {
                  setFeedback((v) => !v);
                  setConfirm(null);
                }}
              >
                Needs changes
              </button>
            )}
          </div>
        </>
      )}
      {feedback && r.status === 'preview' && (
        <div className="studio-reply">
          <label htmlFor={`feedback-${r.id}`}>What should change in this preview?</label>
          <textarea
            id={`feedback-${r.id}`}
            autoFocus
            value={text}
            onChange={(e) => setText(e.target.value)}
            rows={3}
            placeholder="For example: put the second photo first and change the city to Chicago."
            disabled={!!busy}
          />
          <div className="studio-actions">
            <button
              className="studio-button studio-button-primary"
              disabled={!text.trim() || !!busy}
              onClick={() => run('revise')}
            >
              {busy === 'revise' ? 'Sending…' : 'Send changes'}
            </button>
            <button className="studio-button" disabled={!!busy} onClick={() => setFeedback(false)}>
              Cancel
            </button>
          </div>
          <p className="studio-muted">
            You will get a new preview to approve. Nothing goes live yet.
          </p>
        </div>
      )}
      {r.status === 'failed' && (
        <div className="studio-actions">
          <button
            className="studio-button studio-button-primary"
            disabled={!!busy}
            onClick={() => run('retry')}
          >
            {busy === 'retry' ? 'Queueing…' : 'Try this drop again'}
          </button>
        </div>
      )}
      {r.status === 'live' && r.summary && <p className="studio-drop-explain">{r.summary}</p>}
      {r.status === 'live' && (
        <div className="studio-actions">
          <a
            className="studio-button"
            href="https://www.imanolvillagomez.com/work"
            target="_blank"
            rel="noreferrer"
          >
            View website <span aria-hidden>↗</span>
          </a>
        </div>
      )}
      {confirm && (
        <div
          className="studio-confirm"
          role="group"
          aria-label={confirm === 'approve' ? 'Confirm publish' : 'Confirm delete'}
          data-tone={confirm === 'approve' ? undefined : 'danger'}
        >
          <strong>
            {confirm === 'approve'
              ? 'Ready to put this version on your website?'
              : r.status === 'live'
                ? 'Delete this drop from your list?'
                : 'Delete this drop and its uploaded files?'}
          </strong>
          <p>
            {confirm === 'approve'
              ? 'Publish only after you have checked the preview.'
              : r.status === 'live'
                ? 'Your work stays on your website. The uploaded originals are deleted.'
                : "This can't be undone. Nothing is published."}
          </p>
          <div className="studio-actions">
            <button
              className={`studio-button ${confirm === 'approve' ? 'studio-button-primary' : 'studio-button-danger'}`}
              disabled={!!busy}
              onClick={() => run(confirm)}
            >
              {busy
                ? 'Please wait…'
                : confirm === 'approve'
                  ? 'Yes, publish this version'
                  : 'Delete drop'}
            </button>
            <button className="studio-button" disabled={!!busy} onClick={() => setConfirm(null)}>
              Cancel
            </button>
          </div>
        </div>
      )}
      {error && (
        <p role="alert" className="studio-error">
          {error}
        </p>
      )}
      {inDetail && removable && (
        <div className="studio-drop-foot">
          <button
            className="studio-button studio-button-ghost studio-danger"
            disabled={!!busy}
            onClick={() => setConfirm('remove')}
          >
            Delete drop
          </button>
        </div>
      )}
      {!inDetail && (
        <div className="studio-drop-foot">
          <details className="studio-drop-details">
            <summary>
              <span>Files &amp; notes</span>
              <span className="studio-details-toggle" aria-hidden>
                <svg
                  width="14"
                  height="14"
                  viewBox="0 0 16 16"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.5"
                >
                  <path d="M3 8h10M8 3v10" />
                </svg>
              </span>
            </summary>
            <div className="studio-details-body">
              {r.note && <p className="studio-preserve">{r.note}</p>}
              <ul>
                {r.files.map((f, i) => (
                  <li key={`${f.key}-${i}`}>
                    {f.label || f.name}
                    {f.note ? ` — ${f.note}` : ''}
                  </li>
                ))}
              </ul>
              {r.revisions?.map((v) => (
                <p key={v.at}>
                  <strong>Changes requested:</strong> {v.text}
                </p>
              ))}
              {r.answers?.map((a) => (
                <p key={a.at}>
                  <strong>Your answer:</strong> {a.text}
                </p>
              ))}
              <p className="studio-muted">Last update: {date(r.updatedAt)}</p>
              {removable && (
                <button
                  className="studio-text-link studio-danger"
                  disabled={!!busy}
                  onClick={() => setConfirm('remove')}
                >
                  Delete drop
                </button>
              )}
            </div>
          </details>
          {onOpen && (
            <button className="studio-button studio-button-ghost studio-view-drop" onClick={onOpen}>
              View drop <span aria-hidden>→</span>
            </button>
          )}
        </div>
      )}
    </article>
  );
}

export function Queue({
  requests,
  onChange,
  onNewDrop,
  onOpen,
  onOlder,
  workerDown = false,
  loading = false,
}: {
  requests: api.ArtRequest[];
  onChange: (r: api.ArtRequest) => void;
  onNewDrop?: () => void;
  onOpen?: (id: string) => void;
  /** loads the next older page; absent when there is none */
  onOlder?: () => Promise<void>;
  workerDown?: boolean;
  /** first load still in flight: show placeholders, not the empty state */
  loading?: boolean;
}) {
  const [loadingOlder, setLoadingOlder] = useState(false);
  const [olderError, setOlderError] = useState('');
  const [filter, setFilter] = useState('all');
  const [search, setSearch] = useState('');
  const visible = useMemo(
    () =>
      requests.filter(
        (r) =>
          r.status !== 'removed' &&
          (filter === 'all' ||
            (filter === 'attention' && needsAttention(r.status)) ||
            (filter === 'progress' && inProgress(r.status)) ||
            (filter === 'live' && r.status === 'live')) &&
          `${requestTitle(r)} ${r.city} ${r.files.map((f) => f.name).join(' ')}`
            .toLowerCase()
            .includes(search.toLowerCase())
      ),
    [requests, filter, search]
  );
  const attention = requests.filter((r) => needsAttention(r.status)).length;
  return (
    <section className="studio-queue" aria-labelledby="drops-heading">
      <div className="studio-section-head">
        <div>
          <h1 id="drops-heading">Your drops</h1>
          <p className="studio-muted">Uploads, previews, and published work.</p>
        </div>
        {onNewDrop && (
          <button className="studio-button studio-button-primary" onClick={onNewDrop}>
            <span aria-hidden>+</span> New drop
          </button>
        )}
      </div>
      <div className="studio-queue-tools">
        <div className="studio-filters" role="group" aria-label="Filter drops">
          {(
            [
              ['all', 'All drops'],
              ['attention', `Needs you${attention ? ` (${attention})` : ''}`],
              ['progress', 'In progress'],
              ['live', 'Live'],
            ] as const
          ).map(([value, label]) => (
            <button key={value} aria-pressed={filter === value} onClick={() => setFilter(value)}>
              {label}
            </button>
          ))}
        </div>
        <div className="studio-search">
          <svg
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.8"
            strokeLinecap="round"
            aria-hidden
          >
            <circle cx="11" cy="11" r="6.5" />
            <path d="m16 16 4 4" />
          </svg>
          <input
            type="search"
            aria-label="Search drops"
            placeholder="Search drops…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      </div>
      {!requests.length && loading ? (
        <div className="studio-drop-list" role="status" aria-label="Loading your drops">
          {[0, 1, 2].map((n) => (
            <div key={n} className="studio-drop studio-drop-skeleton" aria-hidden>
              <span className="studio-skeleton" style={{ width: '45%', height: 18 }} />
              <span className="studio-skeleton" style={{ width: '30%', height: 12 }} />
              <span className="studio-skeleton-row">
                <span className="studio-skeleton" />
                <span className="studio-skeleton" />
                <span className="studio-skeleton" />
              </span>
            </div>
          ))}
        </div>
      ) : visible.length ? (
        <div className="studio-drop-list">
          {visible.map((r) => (
            <DropRow
              key={r.id}
              r={r}
              onChange={onChange}
              onOpen={onOpen ? () => onOpen(r.id) : undefined}
              workerDown={workerDown}
            />
          ))}
        </div>
      ) : (
        <div className="studio-empty">
          <span className="studio-empty-icon" aria-hidden>
            <svg
              width="22"
              height="22"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.6"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M5 5h14v14H5zM5 10h14M10 10v9" />
            </svg>
          </span>
          <h3>{requests.length ? 'No matching drops' : 'Your first drop starts here'}</h3>
          <p>
            {requests.length
              ? 'Try a different search or filter.'
              : 'Add your work, check the preview, then choose when it goes live.'}
          </p>
          {!requests.length && onNewDrop && (
            <button className="studio-button studio-button-primary" onClick={onNewDrop}>
              Add new work
            </button>
          )}
        </div>
      )}
      {onOlder && (
        <div className="studio-older">
          <button
            className="studio-button"
            disabled={loadingOlder}
            onClick={async () => {
              setLoadingOlder(true);
              setOlderError('');
              try {
                await onOlder();
              } catch {
                setOlderError('Could not load older drops. Try again.');
              } finally {
                setLoadingOlder(false);
              }
            }}
          >
            {loadingOlder ? 'Loading…' : 'Show older drops'}
          </button>
          {olderError && (
            <p role="alert" className="studio-error">
              {olderError}
            </p>
          )}
        </div>
      )}
    </section>
  );
}
