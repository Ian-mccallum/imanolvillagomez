import { useEffect, useRef, useState, type ReactNode } from 'react';
import * as api from '../artApi';
import type { EditOp, LibrarySiteItem } from './model';

/** A change waiting in the tray; a replacement keeps its file until the tray is sent. */
export type DraftOp = EditOp & { local?: File; label: string };

const FIELDS: Record<
  'photo' | 'video',
  [keyof Extract<EditOp, { op: 'update' }>['set'], string][]
> = {
  video: [
    ['title', 'Title'],
    ['artist', 'Artist'],
    ['song', 'Song'],
    ['location', 'City or venue'],
    ['year', 'Year'],
  ],
  photo: [
    ['artist', 'Artist'],
    ['year', 'Year'],
    ['tour', 'Tour'],
  ],
};

/** Focus in on open, Esc closes, focus back where it was on close. Runs once per dialog. */
function useDialog(onClose: () => void) {
  const ref = useRef<HTMLDivElement>(null);
  const close = useRef(onClose);
  close.current = onClose;
  useEffect(() => {
    const previous = document.activeElement as HTMLElement | null;
    ref.current?.querySelector<HTMLElement>('button, input')?.focus();
    const key = (e: KeyboardEvent) => e.key === 'Escape' && close.current();
    window.addEventListener('keydown', key);
    return () => {
      window.removeEventListener('keydown', key);
      if (previous?.isConnected) previous.focus();
    };
  }, []);
  return ref;
}

/** What can change about one item on the site. Nothing happens until the tray is sent. */
export function ChangePanel({
  item,
  neighbours,
  onAdd,
  onClose,
}: {
  item: LibrarySiteItem;
  neighbours: { before?: LibrarySiteItem; after?: LibrarySiteItem };
  onAdd: (op: DraftOp) => void;
  onClose: () => void;
}) {
  const ref = useDialog(onClose);
  const [editing, setEditing] = useState(false);
  const [values, setValues] = useState<Record<string, string>>({});
  const target = { kind: item.kind, id: item.id };
  const name = item.title || (item.kind === 'photo' ? 'this photo' : 'this video');
  const add = (op: DraftOp) => {
    onAdd(op);
    onClose();
  };
  return (
    <div className="studio-sheet-backdrop" onClick={onClose}>
      <div
        ref={ref}
        className="studio-modal studio-change"
        role="dialog"
        aria-modal="true"
        aria-label={`Change ${name}`}
        onClick={(e) => e.stopPropagation()}
      >
        <header className="studio-modal-head">
          <div>
            <h2 className="studio-modal-title">Change on site</h2>
            <span className="studio-modal-sub">
              {name} · number {item.order + 1} on {item.kind === 'photo' ? 'Photos' : 'Videos'}
            </span>
          </div>
          <button className="studio-text-link" onClick={onClose}>
            Close
          </button>
        </header>
        <div className="studio-modal-body">
          {!editing ? (
            <div className="studio-change-actions">
              <button
                className="studio-button"
                onClick={() =>
                  add({
                    op: 'move',
                    target,
                    to: { position: 'top' },
                    label: `Move ${name} to the top`,
                  })
                }
              >
                Move to the top
              </button>
              {neighbours.before && (
                <button
                  className="studio-button"
                  onClick={() =>
                    add({
                      op: 'move',
                      target,
                      to: { before: neighbours.before!.id },
                      label: `Move ${name} up one`,
                    })
                  }
                >
                  Move up one
                </button>
              )}
              {neighbours.after && (
                <button
                  className="studio-button"
                  onClick={() =>
                    add({
                      op: 'move',
                      target,
                      to: { after: neighbours.after!.id },
                      label: `Move ${name} down one`,
                    })
                  }
                >
                  Move down one
                </button>
              )}
              <button className="studio-button" onClick={() => setEditing(true)}>
                Edit details
              </button>
              {item.kind === 'video' && (
                <label className="studio-button">
                  Replace the video…
                  <input
                    type="file"
                    accept="video/*"
                    hidden
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file)
                        add({
                          op: 'replace',
                          target,
                          file: file.name,
                          local: file,
                          label: `Replace ${name} with ${file.name}`,
                        });
                    }}
                  />
                </label>
              )}
              <button
                className="studio-button studio-button-danger"
                onClick={() => add({ op: 'remove', target, label: `Remove ${name} from the site` })}
              >
                Remove from site
              </button>
            </div>
          ) : (
            <form
              className="studio-change-form"
              onSubmit={(e) => {
                e.preventDefault();
                const set = Object.fromEntries(
                  Object.entries(values)
                    .map(([k, v]) => [k, v.trim()])
                    .filter(([, v]) => v)
                    .map(([k, v]) => [k, k === 'year' ? Number(v) : v])
                );
                if (!Object.keys(set).length) return;
                add({
                  op: 'update',
                  target,
                  set,
                  label: `Change ${name}: ${Object.entries(set)
                    .map(([k, v]) => `${k} → ${v}`)
                    .join(', ')}`,
                });
              }}
            >
              <p className="studio-muted">Fill in only what should change.</p>
              {FIELDS[item.kind].map(([key, label]) => (
                <label key={key} className="studio-field-label">
                  {label}
                  <input
                    className="studio-input"
                    inputMode={key === 'year' ? 'numeric' : undefined}
                    placeholder={
                      key === 'artist' ? (item.artist ?? '') : key === 'title' ? item.title : ''
                    }
                    value={values[key] ?? ''}
                    onChange={(e) => setValues((v) => ({ ...v, [key]: e.target.value }))}
                  />
                </label>
              ))}
              <div className="studio-actions">
                <button className="studio-button studio-button-primary">Add to changes</button>
                <button type="button" className="studio-button" onClick={() => setEditing(false)}>
                  Back
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}

function DialogShell({ onClose, children }: { onClose: () => void; children: ReactNode }) {
  const ref = useDialog(onClose);
  return (
    <div ref={ref} className="studio-sheet-backdrop" onClick={onClose}>
      {children}
    </div>
  );
}

/** The waiting changes; sending makes one edit drop with its own preview. */
export function Tray({
  ops,
  onRemove,
  onClear,
  onSent,
}: {
  ops: DraftOp[];
  onRemove: (i: number) => void;
  onClear: () => void;
  onSent: (r: api.ArtRequest) => void;
}) {
  const [open, setOpen] = useState(false);
  const [note, setNote] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  if (!ops.length) return null;

  const send = async () => {
    setBusy(true);
    setError('');
    try {
      const files = ops.filter((o) => o.local).map((o) => o.local!);
      let id: string | undefined;
      let uploaded: api.Upload[] = [];
      if (files.length) {
        const started = await api.start(files.map((file) => ({ file, folder: '' })));
        id = started.id;
        uploaded = started.uploads;
        for (let n = 0; n < files.length; n++) await api.put(uploaded[n], files[n], () => {});
      }
      const nameOf = new Map(files.map((f, n) => [f, uploaded[n]?.name]));
      const request = await api.editSubmit({
        id,
        note,
        files: uploaded.map(({ url: _u, thumbUrl: _t, thumbKey: _k, ...f }) => f),
        ops: ops.map(({ local, label: _l, ...op }) =>
          op.op === 'replace' && local ? { ...op, file: nameOf.get(local) ?? op.file } : op
        ) as EditOp[],
      });
      setOpen(false);
      setNote('');
      onSent(request);
    } catch (e) {
      setError(e instanceof Error && e.message ? e.message : 'Could not send. Try again.');
    } finally {
      setBusy(false);
    }
  };

  return (
    <>
      <div className="studio-dock studio-tray" role="region" aria-label="Changes to your site">
        <span className="studio-dock-count">
          {ops.length} <span>{ops.length === 1 ? 'change' : 'changes'}</span>
        </span>
        <button
          className="studio-dock-title min-w-0 flex-1 truncate text-left"
          onClick={() => setOpen(true)}
        >
          {ops[ops.length - 1].label}
        </button>
        <button
          className="studio-button studio-button-primary studio-dock-send"
          onClick={() => setOpen(true)}
        >
          Review changes
        </button>
      </div>
      {open && (
        <DialogShell onClose={() => !busy && setOpen(false)}>
          <div
            className="studio-modal studio-change"
            role="dialog"
            aria-modal="true"
            aria-label="Review changes"
            onClick={(e) => e.stopPropagation()}
          >
            <header className="studio-modal-head">
              <div>
                <h2 className="studio-modal-title">Review changes</h2>
                <span className="studio-modal-sub">
                  You'll get a preview to check before anything changes.
                </span>
              </div>
              <button className="studio-text-link" disabled={busy} onClick={() => setOpen(false)}>
                Close
              </button>
            </header>
            <div className="studio-modal-body">
              <ol className="studio-change-list">
                {ops.map((o, i) => (
                  <li key={`${o.label}-${i}`}>
                    <span>{o.label}</span>
                    <button
                      className="studio-text-link"
                      disabled={busy}
                      onClick={() => onRemove(i)}
                    >
                      Undo
                    </button>
                  </li>
                ))}
              </ol>
              <label className="studio-field-label">
                Anything else? (optional)
                <textarea
                  className="studio-input studio-textarea"
                  rows={3}
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                  placeholder="For example: keep the order of the rest the same."
                />
              </label>
              {error && (
                <p role="alert" className="studio-error">
                  {error}
                </p>
              )}
              <div className="studio-actions">
                <button
                  className="studio-button studio-button-primary"
                  disabled={busy}
                  onClick={send}
                >
                  {busy ? 'Sending…' : 'Send for a preview'}
                </button>
                <button className="studio-button studio-danger" disabled={busy} onClick={onClear}>
                  Clear all
                </button>
              </div>
            </div>
          </div>
        </DialogShell>
      )}
    </>
  );
}
