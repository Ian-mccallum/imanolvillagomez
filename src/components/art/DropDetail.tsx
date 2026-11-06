import { useEffect, useMemo, useRef, useState } from 'react';
import * as api from './artApi';
import { DropRow } from './Queue';
import {
  formatBytes,
  timelineFor,
  type ArtFile,
  type DropEvent,
  type Placement,
} from './studioModel';
import { mediaKind } from './mediaPreview';

const when = (iso: string) =>
  new Intl.DateTimeFormat(undefined, {
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  }).format(new Date(iso));

const EVENT: Record<DropEvent['type'], string> = {
  sent: 'You sent this drop',
  working: 'The studio started preparing it',
  question: 'The studio asked a question',
  answer: 'You answered',
  revision: 'You asked for changes',
  preview: 'Preview ready',
  approved: 'You chose Publish to website',
  live: 'Live on your website',
  failed: 'It could not be completed',
  retry: 'You tried it again',
  removed: 'You removed it',
  requeued: 'Your site changed, so a fresh preview was started',
};

/** Originals the browser can show directly when a drop has no thumbnail (older drops). */
const SHOW_ORIGINAL_MAX = 20 * 1024 ** 2;

function Timeline({ events }: { events: DropEvent[] }) {
  const latestPreview = [...events].reverse().find((e) => e.type === 'preview')?.at;
  return (
    <ol className="studio-timeline">
      {events.map((e, i) => (
        <li key={`${e.at}-${i}`} data-by={e.by}>
          <time dateTime={e.at}>{when(e.at)}</time>
          <span>{EVENT[e.type]}</span>
          {e.text && <p className="studio-preserve">{e.text}</p>}
          {e.previewUrl && (
            <a className="studio-text-link" href={e.previewUrl} target="_blank" rel="noreferrer">
              {e.at === latestPreview ? 'Open this preview (current)' : 'Open this preview'}{' '}
              <span aria-hidden>↗</span>
            </a>
          )}
        </li>
      ))}
    </ol>
  );
}

function badge(p: Placement | undefined, status: api.ArtStatus) {
  if (p?.kind === 'photo' || p?.kind === 'video') return { label: 'On site', tone: 'live' };
  if (p?.kind === 'unused') return { label: 'Not used', tone: 'muted' };
  return status === 'live' ? null : { label: 'Not placed yet', tone: 'working' };
}

function Viewer({
  r,
  file,
  src,
  placement,
  onClose,
}: {
  r: api.ArtRequest;
  file: ArtFile;
  src?: string;
  placement?: Placement;
  onClose: () => void;
}) {
  const [full, setFull] = useState<string | undefined>();
  const [error, setError] = useState('');
  const close = useRef<HTMLButtonElement>(null);
  const kind = mediaKind(file);
  useEffect(() => {
    close.current?.focus();
    if (kind !== 'other')
      api.urls(r.id, [file.name], 'original').then(
        (u) => setFull(u[file.name]),
        () => {}
      );
  }, [r.id, file.name, kind]);
  const download = async () => {
    setError('');
    try {
      const url = (await api.urls(r.id, [file.name], 'original', true))[file.name];
      if (!url) throw new Error();
      window.location.href = url;
    } catch {
      setError('Could not prepare the download. Try again.');
    }
  };
  const short = file.name.split('/').pop();
  return (
    <div className="studio-viewer" role="dialog" aria-modal="true" aria-label={short}>
      <div className="studio-viewer-media">
        {kind === 'video' && full ? (
          <video src={full} poster={src} controls playsInline autoPlay muted />
        ) : full || src ? (
          <img src={full ?? src} alt={file.label || short || ''} />
        ) : (
          <span className="studio-preview-extension">{short?.split('.').pop()?.toUpperCase()}</span>
        )}
      </div>
      <div className="studio-viewer-info">
        <div className="studio-viewer-text">
          <strong>{file.label || short}</strong>
          <p className="studio-muted">
            {formatBytes(file.size)}
            {file.folder ? ` · ${file.folder}` : ''}
          </p>
          {file.note && <p className="studio-preserve">{file.note}</p>}
          {placement?.kind === 'unused' && (
            <p className="studio-muted">
              Not used{placement.reason ? `: ${placement.reason}` : ''}
            </p>
          )}
        </div>
        <div className="studio-actions studio-viewer-actions">
          {placement?.siteUrl && (
            <a className="studio-button" href={placement.siteUrl} target="_blank" rel="noreferrer">
              See it on the site <span aria-hidden>↗</span>
            </a>
          )}
          <button className="studio-button" onClick={download}>
            Download original
          </button>
          <button ref={close} className="studio-button studio-button-primary" onClick={onClose}>
            Close
          </button>
        </div>
        {error && (
          <p role="alert" className="studio-error">
            {error}
          </p>
        )}
      </div>
    </div>
  );
}

export function DropDetail({
  initial,
  id,
  onClose,
  onChange,
}: {
  initial?: api.ArtRequest;
  id: string;
  onClose: () => void;
  onChange: (r: api.ArtRequest) => void;
}) {
  const [r, setR] = useState(initial);
  const [missing, setMissing] = useState(false);
  const [thumbs, setThumbs] = useState<Record<string, string>>({});
  const [open, setOpen] = useState<ArtFile | null>(null);
  const sheet = useRef<HTMLDivElement>(null);
  const practice = id.startsWith('practice-');

  useEffect(() => {
    if (initial) setR(initial);
  }, [initial]);
  useEffect(() => {
    if (practice) return;
    api.get(id).then(setR, () => setMissing(!initial));
  }, [id, initial, practice]);

  useEffect(() => {
    if (!r || practice) return;
    const withThumb = r.files.filter((f) => r.thumbs?.[f.name]).map((f) => f.name);
    const viaOriginal = r.files
      .filter((f) => !r.thumbs?.[f.name] && mediaKind(f) === 'image' && f.size <= SHOW_ORIGINAL_MAX)
      .map((f) => f.name);
    Promise.all([
      withThumb.length ? api.urls(r.id, withThumb, 'thumb') : {},
      viaOriginal.length ? api.urls(r.id, viaOriginal, 'original') : {},
    ]).then(
      ([a, b]) => setThumbs({ ...b, ...a }),
      () => {}
    );
  }, [r, practice]);

  const escape = useRef(() => {});
  escape.current = () => (open ? setOpen(null) : onClose());
  useEffect(() => {
    const previous = document.activeElement as HTMLElement | null;
    sheet.current?.focus();
    const key = (e: KeyboardEvent) => e.key === 'Escape' && escape.current();
    window.addEventListener('keydown', key);
    document.body.style.overflow = 'hidden';
    return () => {
      window.removeEventListener('keydown', key);
      document.body.style.overflow = '';
      if (previous?.isConnected) previous.focus();
    };
  }, []);

  const placements = useMemo(
    () => new Map((r?.placements ?? []).map((p) => [p.file, p])),
    [r?.placements]
  );
  const sections = useMemo(() => {
    if (!r) return [];
    const groups = r.groups ?? [];
    const out = groups.map((g) => ({
      key: g.folder,
      name: g.name || g.folder,
      note: g.note,
      files: r.files.filter((f) => f.folder === g.folder),
    }));
    const loose = r.files.filter((f) => !f.folder || !groups.some((g) => g.folder === f.folder));
    if (loose.length)
      out.push({ key: '', name: groups.length ? 'Other files' : '', note: '', files: loose });
    return out.filter((s) => s.files.length);
  }, [r]);
  const total = r?.files.reduce((n, f) => n + f.size, 0) ?? 0;
  const counts = useMemo(() => {
    const c = { on: 0, unused: 0 };
    for (const p of placements.values()) {
      if (p.kind === 'unused') c.unused++;
      else c.on++;
    }
    return c;
  }, [placements]);

  return (
    <div className="studio-sheet-backdrop" onClick={onClose}>
      <div
        ref={sheet}
        tabIndex={-1}
        className="studio-sheet"
        role="dialog"
        aria-modal="true"
        aria-label={r ? `Drop: ${r.title || 'untitled'}` : 'Drop'}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="studio-sheet-bar">
          <span className="studio-sheet-grip" aria-hidden />
          <span className="studio-sheet-meta">
            {r ? `${r.files.length} files · ${formatBytes(total)}` : ''}
          </span>
          <button
            className="studio-button studio-button-ghost studio-sheet-close"
            onClick={onClose}
          >
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
              <path d="M6 6l12 12M18 6 6 18" />
            </svg>
            Close
          </button>
        </div>
        {!r ? (
          missing ? (
            <div className="studio-empty" role="status">
              <h3>This drop could not be found</h3>
              <p>It may have been removed.</p>
            </div>
          ) : (
            <div className="studio-detail-loading" role="status">
              <span className="sr-only">Loading drop…</span>
              <span className="studio-skeleton" style={{ width: '55%', height: 22 }} aria-hidden />
              <span className="studio-skeleton" style={{ width: '35%', height: 13 }} aria-hidden />
              <span className="studio-skeleton-grid" aria-hidden>
                {Array.from({ length: 6 }, (_, n) => (
                  <span key={n} className="studio-skeleton" />
                ))}
              </span>
            </div>
          )
        ) : (
          <>
            <DropRow
              r={r}
              inDetail
              onChange={(next) => {
                setR(next);
                onChange(next);
              }}
            />
            <section className="studio-detail-section" aria-labelledby="files-heading">
              <h2 id="files-heading">What was in it</h2>
              {placements.size > 0 && (
                <p className="studio-muted studio-detail-counts">
                  {counts.on} on your site
                  {counts.unused ? ` · ${counts.unused} not used` : ''}
                </p>
              )}
              {r.note && <p className="studio-preserve studio-detail-note">{r.note}</p>}
              {sections.map((s) => (
                <div key={s.key || 'loose'} className="studio-file-group">
                  {s.name && <h3>{s.name}</h3>}
                  {s.note && <p className="studio-preserve studio-muted">{s.note}</p>}
                  <ul className="studio-thumb-grid">
                    {s.files.map((f) => {
                      const b = badge(placements.get(f.name), r.status);
                      const short = f.name.split('/').pop();
                      return (
                        <li key={f.key}>
                          <button
                            className="studio-thumb"
                            onClick={() => setOpen(f)}
                            aria-label={`${f.label || short}${b ? `, ${b.label}` : ''}`}
                          >
                            {thumbs[f.name] ? (
                              <img src={thumbs[f.name]} alt="" loading="lazy" decoding="async" />
                            ) : (
                              <span className="studio-preview-extension">
                                {short?.split('.').pop()?.toUpperCase().slice(0, 4)}
                              </span>
                            )}
                            {mediaKind(f) === 'video' && (
                              <span className="studio-thumb-kind">Video</span>
                            )}
                            {b && (
                              <span className={`studio-thumb-badge is-${b.tone}`}>{b.label}</span>
                            )}
                          </button>
                          <span className="studio-thumb-name">{f.label || short}</span>
                        </li>
                      );
                    })}
                  </ul>
                </div>
              ))}
            </section>
            <section className="studio-detail-section" aria-labelledby="history-heading">
              <h2 id="history-heading">History</h2>
              <Timeline events={timelineFor(r)} />
            </section>
          </>
        )}
        {open && r && (
          <Viewer
            r={r}
            file={open}
            src={thumbs[open.name]}
            placement={placements.get(open.name)}
            onClose={() => setOpen(null)}
          />
        )}
      </div>
    </div>
  );
}
