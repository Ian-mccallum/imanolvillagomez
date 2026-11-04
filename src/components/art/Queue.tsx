import { useMemo, useState } from 'react';
import * as api from './artApi';
import { inProgress, needsAttention, requestTitle } from './studioModel';

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

function DropRow({ r, onChange }: { r: api.ArtRequest; onChange: (r: api.ArtRequest) => void }) {
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
  const removable = ['question', 'preview', 'failed'].includes(r.status);
  return (
    <article
      className={`studio-drop ${needsAttention(r.status) ? 'studio-drop-attention' : ''}`}
      aria-label={requestTitle(r)}
    >
      <header className="studio-drop-head">
        <div>
          <h3>{requestTitle(r)}</h3>
          <p className="studio-muted">
            {r.files.length} {r.files.length === 1 ? 'file' : 'files'}
            {r.city ? ` · ${r.city}` : ''} · {date(r.createdAt)}
          </p>
        </div>
        <span className={`studio-status studio-status-${r.status}`}>{LABEL[r.status]}</span>
      </header>
      {EXPLAIN[r.status] && <p className="studio-drop-explain">{EXPLAIN[r.status]}</p>}
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
        <button className="studio-button" disabled={!!busy} onClick={() => run('retry')}>
          {busy === 'retry' ? 'Queueing…' : 'Try this drop again'}
        </button>
      )}
      {r.status === 'live' && (
        <a
          className="studio-text-link"
          href="https://www.imanolvillagomez.com/work"
          target="_blank"
          rel="noreferrer"
        >
          View website <span aria-hidden>↗</span>
        </a>
      )}
      {confirm && (
        <div
          className="studio-confirm"
          role="group"
          aria-label={confirm === 'approve' ? 'Confirm publish' : 'Confirm removal'}
        >
          <strong>
            {confirm === 'approve'
              ? 'Ready to put this version on your website?'
              : 'Remove this drop and its uploaded files?'}
          </strong>
          <p>
            {confirm === 'approve'
              ? 'Publish only after you have checked the preview.'
              : 'This cannot be undone. Your existing live work stays on the website.'}
          </p>
          <div className="studio-actions">
            <button
              className="studio-button studio-button-primary"
              disabled={!!busy}
              onClick={() => run(confirm)}
            >
              {busy
                ? 'Please wait…'
                : confirm === 'approve'
                  ? 'Yes, publish this version'
                  : 'Remove this drop'}
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
      <details className="studio-drop-details">
        <summary>Drop details</summary>
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
            Remove drop
          </button>
        )}
      </details>
    </article>
  );
}

export function Queue({
  requests,
  onChange,
  onNewDrop,
}: {
  requests: api.ArtRequest[];
  onChange: (r: api.ArtRequest) => void;
  onNewDrop?: () => void;
}) {
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
          <h2 id="drops-heading">Your drops</h2>
          <p className="studio-muted">Follow every drop from upload to live.</p>
        </div>
        {onNewDrop && (
          <button className="studio-button" onClick={onNewDrop}>
            New drop
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
        <input
          type="search"
          aria-label="Search drops"
          placeholder="Search drops…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>
      {visible.length ? (
        <div className="studio-drop-list">
          {visible.map((r) => (
            <DropRow key={r.id} r={r} onChange={onChange} />
          ))}
        </div>
      ) : (
        <div className="studio-empty">
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
      {requests.length >= 40 && <p className="studio-muted">Showing your 40 most recent drops.</p>}
    </section>
  );
}
