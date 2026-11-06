import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import * as api from '../artApi';
import { formatBytes } from '../studioModel';
import type { LibraryActivity, LibraryFile, LibrarySiteItem } from './model';

export type LibraryTab = 'site' | 'files' | 'trash' | 'activity';
const TABS: [LibraryTab, string][] = [
  ['site', 'On your site'],
  ['files', 'Video files'],
  ['trash', 'Trash'],
  ['activity', 'Activity'],
];
const PAGE_NAME: Record<string, string> = {
  '/work/photos': 'Photos',
  '/work/videos': 'Videos',
  '/other': 'Other',
};
const when = (iso?: string) =>
  iso
    ? new Intl.DateTimeFormat(undefined, {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
      }).format(new Date(iso))
    : '';
const message = (e: unknown) =>
  e instanceof api.Unauthorized
    ? 'Your session expired. Sign in again.'
    : e instanceof Error && e.message
      ? e.message
      : 'Something went wrong. Try again.';

/** Videos are big: read only the start to see whether it begins playing quickly (faststart). */
async function startsFast(file: File) {
  const head = new TextDecoder('latin1').decode(await file.slice(0, 256 * 1024).arrayBuffer());
  const moov = head.indexOf('moov');
  const mdat = head.indexOf('mdat');
  return moov >= 0 && (mdat < 0 || moov < mdat);
}

function Viewer({
  title,
  kind,
  src,
  onClose,
}: {
  title: string;
  kind: 'photo' | 'video';
  src?: string;
  onClose: () => void;
}) {
  const close = useRef<HTMLButtonElement>(null);
  useEffect(() => {
    close.current?.focus();
    const key = (e: KeyboardEvent) => e.key === 'Escape' && onClose();
    window.addEventListener('keydown', key);
    return () => window.removeEventListener('keydown', key);
  }, [onClose]);
  return (
    <div className="studio-viewer" role="dialog" aria-modal="true" aria-label={title}>
      <div className="studio-viewer-media">
        {!src ? (
          <p className="studio-muted" role="status">
            Loading…
          </p>
        ) : kind === 'video' ? (
          <video src={src} controls playsInline autoPlay muted />
        ) : (
          <img src={src} alt={title} />
        )}
      </div>
      <div className="studio-viewer-info">
        <div className="studio-viewer-text">
          <strong>{title}</strong>
        </div>
        <div className="studio-actions studio-viewer-actions">
          <button ref={close} className="studio-button studio-button-primary" onClick={onClose}>
            Close
          </button>
        </div>
      </div>
    </div>
  );
}

function SiteTab({
  items,
  onOpen,
}: {
  items: LibrarySiteItem[];
  onOpen: (i: LibrarySiteItem) => void;
}) {
  const [kind, setKind] = useState<'all' | 'photo' | 'video'>('all');
  const [q, setQ] = useState('');
  const shown = items.filter(
    (i) =>
      (kind === 'all' || i.kind === kind) &&
      `${i.title} ${i.artist ?? ''}`.toLowerCase().includes(q.trim().toLowerCase())
  );
  const videos = shown.filter((i) => i.kind === 'video');
  const photos = shown.filter((i) => i.kind === 'photo');
  return (
    <>
      <div className="studio-queue-tools">
        <div className="studio-filters" role="group" aria-label="Show">
          {(
            [
              ['all', `Everything (${items.length})`],
              ['photo', 'Photos'],
              ['video', 'Videos'],
            ] as const
          ).map(([v, label]) => (
            <button key={v} aria-pressed={kind === v} onClick={() => setKind(v)}>
              {label}
            </button>
          ))}
        </div>
        <label className="studio-search">
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
            <circle cx="11" cy="11" r="7" />
            <path d="m20 20-3.5-3.5" />
          </svg>
          <span className="sr-only">Search your site</span>
          <input
            type="search"
            placeholder="Search by artist or title…"
            value={q}
            onChange={(e) => setQ(e.target.value)}
          />
        </label>
      </div>
      {videos.length > 0 && (
        <section className="studio-detail-section" aria-labelledby="lib-videos">
          <h2 id="lib-videos">Videos</h2>
          <ul className="studio-lib-list">
            {videos.map((v) => (
              <li key={`${v.page}-${v.id}`}>
                <button className="studio-lib-row" onClick={() => onOpen(v)}>
                  <span className="studio-lib-order">{v.order + 1}</span>
                  <span className="studio-lib-name">
                    <strong>{v.title}</strong>
                    <span className="studio-muted">
                      {PAGE_NAME[v.page] ?? v.page}
                      {v.size ? ` · ${formatBytes(v.size)}` : ''}
                    </span>
                  </span>
                  {v.missing ? (
                    <span className="studio-status studio-status-failed">File missing</span>
                  ) : (
                    <span className="studio-status studio-status-live">On site</span>
                  )}
                </button>
              </li>
            ))}
          </ul>
        </section>
      )}
      {photos.length > 0 && (
        <section className="studio-detail-section" aria-labelledby="lib-photos">
          <h2 id="lib-photos">Photos</h2>
          <ul className="studio-thumb-grid">
            {photos.map((p) => (
              <li key={p.id}>
                <button
                  className="studio-thumb"
                  style={{ background: p.color }}
                  onClick={() => onOpen(p)}
                  aria-label={`${p.title || 'Photo'}, number ${p.order + 1} on Photos`}
                >
                  <img src={p.thumb} alt="" loading="lazy" decoding="async" />
                  <span className="studio-thumb-kind">{p.order + 1}</span>
                </button>
                <span className="studio-thumb-name">{p.title}</span>
              </li>
            ))}
          </ul>
        </section>
      )}
      {!shown.length && (
        <div className="studio-empty">
          <h3>Nothing matches</h3>
          <p>Try a different search.</p>
        </div>
      )}
    </>
  );
}

function FileRow({
  f,
  trash,
  busy,
  onOpen,
  onRename,
  onTrash,
  onRestore,
}: {
  f: LibraryFile;
  trash: boolean;
  busy: boolean;
  onOpen: () => void;
  onRename: (to: string) => Promise<void>;
  onTrash: () => void;
  onRestore: () => void;
}) {
  const [renaming, setRenaming] = useState(false);
  const [name, setName] = useState(f.name);
  const [error, setError] = useState('');
  return (
    <li className="studio-lib-file">
      <div className="studio-lib-row">
        <button className="studio-lib-name studio-lib-open" onClick={onOpen}>
          <strong>{f.name}</strong>
          <span className="studio-muted">
            {formatBytes(f.size)}
            {f.uploadedAt ? ` · ${when(f.uploadedAt)}` : ''}
            {trash && f.daysLeft !== undefined ? ` · deleted for good in ${f.daysLeft} days` : ''}
          </span>
        </button>
        {!trash &&
          (f.usedBy ? (
            <span className="studio-status studio-status-live" title={f.usedBy}>
              In use
            </span>
          ) : (
            <span className="studio-status">Not used</span>
          ))}
        <div className="studio-actions">
          {trash ? (
            <button className="studio-button studio-button-sm" disabled={busy} onClick={onRestore}>
              Restore
            </button>
          ) : (
            !f.usedBy && (
              <>
                <button
                  className="studio-button studio-button-sm studio-button-ghost"
                  disabled={busy}
                  onClick={() => setRenaming((v) => !v)}
                >
                  Rename
                </button>
                <button
                  className="studio-button studio-button-sm studio-button-ghost studio-danger"
                  disabled={busy}
                  onClick={onTrash}
                >
                  Move to trash
                </button>
              </>
            )
          )}
        </div>
      </div>
      {f.usedBy && !trash && (
        <p className="studio-muted studio-lib-usedby">
          Used by {f.usedBy}. Change it through a drop.
        </p>
      )}
      {renaming && (
        <form
          className="studio-lib-rename"
          onSubmit={async (e) => {
            e.preventDefault();
            setError('');
            try {
              await onRename(name.trim());
              setRenaming(false);
            } catch (err) {
              setError(message(err));
            }
          }}
        >
          <label className="sr-only" htmlFor={`rename-${f.path}`}>
            New name
          </label>
          <input
            id={`rename-${f.path}`}
            className="studio-input"
            value={name}
            onChange={(e) => setName(e.target.value)}
            autoFocus
          />
          <button
            className="studio-button studio-button-sm studio-button-primary"
            disabled={busy || !name.trim()}
          >
            Save
          </button>
          <button
            type="button"
            className="studio-button studio-button-sm"
            onClick={() => setRenaming(false)}
          >
            Cancel
          </button>
          {error && (
            <p role="alert" className="studio-error">
              {error}
            </p>
          )}
        </form>
      )}
    </li>
  );
}

const ACTION: Record<LibraryActivity['action'], string> = {
  rename: 'Renamed',
  trash: 'Moved to trash',
  restore: 'Restored',
  upload: 'Upload started',
  'empty-trash': 'Emptied the trash',
};
const short = (p?: string) => p?.split('/').pop() ?? '';

export default function Library({
  tab: raw,
  onTab,
}: {
  tab?: string;
  onTab: (t: LibraryTab) => void;
}) {
  const tab: LibraryTab = TABS.some(([t]) => t === raw) ? (raw as LibraryTab) : 'site';
  const [site, setSite] = useState<LibrarySiteItem[] | null>(null);
  const [files, setFiles] = useState<LibraryFile[] | null>(null);
  const [trash, setTrash] = useState<LibraryFile[] | null>(null);
  const [activity, setActivity] = useState<LibraryActivity[] | null>(null);
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);
  const [toast, setToast] = useState<{ text: string; undo?: () => void } | null>(null);
  const [viewer, setViewer] = useState<{
    title: string;
    kind: 'photo' | 'video';
    src?: string;
  } | null>(null);
  const [emptying, setEmptying] = useState(false);
  const [upload, setUpload] = useState<{ file: File; slow: boolean } | null>(null);
  const [uploading, setUploading] = useState(0);
  const picker = useRef<HTMLInputElement>(null);

  const load = useCallback(async (t: LibraryTab) => {
    setError('');
    try {
      if (t === 'site') setSite(await api.librarySite());
      if (t === 'files') setFiles(await api.libraryFiles());
      if (t === 'trash') setTrash(await api.libraryTrash());
      if (t === 'activity') setActivity(await api.libraryActivity());
    } catch (e) {
      setError(message(e));
    }
  }, []);
  useEffect(() => {
    load(tab);
  }, [tab, load]);
  useEffect(() => {
    if (!toast) return;
    const t = setTimeout(() => setToast(null), 8000);
    return () => clearTimeout(t);
  }, [toast]);

  const run = async (work: () => Promise<void>) => {
    setBusy(true);
    setError('');
    try {
      await work();
    } catch (e) {
      setError(message(e));
    } finally {
      setBusy(false);
    }
  };

  const openFile = async (path: string, title: string) => {
    setViewer({ title, kind: 'video' });
    try {
      const src = await api.libraryUrl(path);
      setViewer({ title, kind: 'video', src });
    } catch (e) {
      setViewer(null);
      setError(message(e));
    }
  };

  const trashFile = (f: LibraryFile) =>
    run(async () => {
      const [moved] = await api.libraryTrashFiles([f.path]);
      setFiles((cur) => cur?.filter((x) => x.path !== f.path) ?? null);
      setTrash(null);
      if (moved)
        setToast({
          text: `${f.name} moved to trash.`,
          undo: () =>
            run(async () => {
              await api.libraryRestore(moved.to);
              setToast({ text: `${f.name} restored.` });
              await load('files');
            }),
        });
    });

  const sendUpload = (file: File) =>
    run(async () => {
      const { url } = await api.libraryUpload(file.name, file.size);
      await new Promise<void>((resolve, reject) => {
        const xhr = new XMLHttpRequest();
        xhr.open('PUT', url);
        xhr.setRequestHeader('content-type', 'video/mp4');
        xhr.upload.onprogress = (e) =>
          setUploading(e.total ? Math.round((e.loaded / e.total) * 100) : 0);
        xhr.onload = () =>
          xhr.status < 300 ? resolve() : reject(new Error('The upload did not finish.'));
        xhr.onerror = () => reject(new Error('The upload did not finish. Check your connection.'));
        xhr.send(file);
      });
      setUpload(null);
      setUploading(0);
      setToast({ text: `${file.name} uploaded. Send a drop to put it on your site.` });
      await load('files');
    });

  const totalSize = useMemo(() => (files ?? []).reduce((n, f) => n + f.size, 0), [files]);

  return (
    <section className="studio-library" aria-labelledby="library-heading">
      <div className="studio-section-head">
        <div>
          <h1 id="library-heading">Library</h1>
          <p className="studio-muted">Everything on your website, and the video files behind it.</p>
        </div>
      </div>
      <div className="studio-filters studio-lib-tabs" role="tablist" aria-label="Library">
        {TABS.map(([t, label]) => (
          <button
            key={t}
            role="tab"
            aria-selected={tab === t}
            aria-pressed={tab === t}
            onClick={() => onTab(t)}
          >
            {label}
          </button>
        ))}
      </div>
      {error && (
        <div className="studio-notice" role="alert">
          {error} <button onClick={() => load(tab)}>Try again</button>
        </div>
      )}

      {tab === 'site' &&
        (site ? (
          <SiteTab
            items={site}
            onOpen={(i) =>
              i.kind === 'photo'
                ? setViewer({ title: i.title || 'Photo', kind: 'photo', src: i.url })
                : i.path && openFile(i.path, i.title)
            }
          />
        ) : (
          !error && (
            <div className="studio-skeleton-grid" role="status" aria-label="Loading your site">
              {Array.from({ length: 9 }, (_, i) => (
                <span key={i} className="studio-skeleton" />
              ))}
            </div>
          )
        ))}

      {tab === 'files' && (
        <>
          <div className="studio-lib-bar">
            <p className="studio-muted">
              {files ? `${files.length} video files · ${formatBytes(totalSize)}` : 'Loading…'}
            </p>
            <button
              className="studio-button studio-button-sm"
              onClick={() => picker.current?.click()}
              disabled={busy}
            >
              Upload a video file
            </button>
            <input
              ref={picker}
              type="file"
              accept="video/mp4"
              hidden
              onChange={async (e) => {
                const file = e.target.files?.[0];
                e.target.value = '';
                if (file) setUpload({ file, slow: !(await startsFast(file)) });
              }}
            />
          </div>
          {upload && (
            <div className="studio-confirm" role="group" aria-label="Upload a video file">
              <strong>Upload {upload.file.name}?</strong>
              <p>
                {upload.slow
                  ? 'This video will be slow to start on your site. Send it as a drop instead, so the studio can optimize it.'
                  : 'It goes into your video files, not onto the site. Send a drop to put it on a page.'}
              </p>
              {uploading > 0 && <p role="status">{uploading}%</p>}
              <div className="studio-actions">
                <button
                  className="studio-button studio-button-primary"
                  disabled={busy}
                  onClick={() => sendUpload(upload.file)}
                >
                  {busy ? 'Uploading…' : 'Upload anyway'}
                </button>
                <button className="studio-button" disabled={busy} onClick={() => setUpload(null)}>
                  Cancel
                </button>
              </div>
            </div>
          )}
          {files && (
            <ul className="studio-lib-list">
              {files.map((f) => (
                <FileRow
                  key={f.path}
                  f={f}
                  trash={false}
                  busy={busy}
                  onOpen={() => openFile(f.path, f.name)}
                  onTrash={() => trashFile(f)}
                  onRestore={() => {}}
                  onRename={async (to) => {
                    setBusy(true);
                    try {
                      await api.libraryRename(f.path, to);
                      setToast({ text: `Renamed to ${to}.` });
                      await load('files');
                    } finally {
                      setBusy(false);
                    }
                  }}
                />
              ))}
            </ul>
          )}
        </>
      )}

      {tab === 'trash' && (
        <>
          <div className="studio-lib-bar">
            <p className="studio-muted">Files here are deleted for good after 30 days.</p>
            {!!trash?.length && (
              <button
                className="studio-button studio-button-sm studio-danger"
                onClick={() => setEmptying(true)}
                disabled={busy}
              >
                Empty trash
              </button>
            )}
          </div>
          {emptying && trash && (
            <div className="studio-confirm" role="group" aria-label="Confirm emptying trash">
              <strong>
                Delete {trash.length} {trash.length === 1 ? 'file' : 'files'} (
                {formatBytes(trash.reduce((n, f) => n + f.size, 0))}) for good?
              </strong>
              <p>This can't be undone.</p>
              <div className="studio-actions">
                <button
                  className="studio-button studio-button-danger"
                  disabled={busy}
                  onClick={() =>
                    run(async () => {
                      await api.libraryEmptyTrash(trash.length);
                      setEmptying(false);
                      setToast({ text: 'Trash emptied.' });
                      await load('trash');
                    })
                  }
                >
                  Delete for good
                </button>
                <button className="studio-button" onClick={() => setEmptying(false)}>
                  Cancel
                </button>
              </div>
            </div>
          )}
          {trash &&
            (trash.length ? (
              <ul className="studio-lib-list">
                {trash.map((f) => (
                  <FileRow
                    key={f.path}
                    f={f}
                    trash
                    busy={busy}
                    onOpen={() => openFile(f.path, f.name)}
                    onTrash={() => {}}
                    onRename={async () => {}}
                    onRestore={() =>
                      run(async () => {
                        await api.libraryRestore(f.path).catch(async (e) => {
                          if (!/as a copy/.test(message(e))) throw e;
                          await api.libraryRestore(f.path, true);
                        });
                        setToast({ text: `${f.name} restored.` });
                        await load('trash');
                        setFiles(null);
                      })
                    }
                  />
                ))}
              </ul>
            ) : (
              <div className="studio-empty">
                <h3>Trash is empty</h3>
                <p>Video files you move to trash wait here for 30 days.</p>
              </div>
            ))}
        </>
      )}

      {tab === 'activity' &&
        activity &&
        (activity.length ? (
          <ol className="studio-timeline">
            {activity.map((a) => (
              <li key={`${a.at}-${a.action}-${a.to ?? ''}`} data-by="imanol">
                <time dateTime={a.at}>{new Date(a.at).toLocaleString()}</time>
                <span>
                  {ACTION[a.action]}
                  {a.action === 'rename' ? `: ${short(a.from)} → ${short(a.to)}` : ''}
                  {a.action === 'trash' || a.action === 'restore' ? `: ${short(a.from)}` : ''}
                  {a.action === 'upload' ? `: ${short(a.to)}` : ''}
                  {a.action === 'empty-trash' ? ` (${a.count} files)` : ''}
                </span>
              </li>
            ))}
          </ol>
        ) : (
          <div className="studio-empty">
            <h3>No changes yet</h3>
            <p>Renames, trash and uploads show up here.</p>
          </div>
        ))}

      {viewer && <Viewer {...viewer} onClose={() => setViewer(null)} />}
      {toast && (
        <div className="studio-toast" role="status">
          <span>{toast.text}</span>
          {toast.undo && (
            <button
              className="studio-text-link"
              onClick={() => {
                const undo = toast.undo!;
                setToast(null);
                undo();
              }}
            >
              Undo
            </button>
          )}
        </div>
      )}
    </section>
  );
}
