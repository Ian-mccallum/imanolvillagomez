import { useEffect, useRef } from 'react';
import { motion, useIsPresent } from 'framer-motion';

const EASE = [0.22, 1, 0.36, 1] as const;

export interface Details {
  title: string;
  city: string;
  placement: 'top' | 'anywhere';
  note: string;
}

// ─── recents: what Imanol typed before, so repeats are one tap ─────────────

const KEY = 'art-recent';
const MAX = 6;

interface Recent {
  title: string[];
  city: string[];
  note: string[];
  last?: Details;
}

const loadRecent = (): Recent => {
  try {
    return { title: [], city: [], note: [], ...JSON.parse(localStorage.getItem(KEY) ?? '{}') };
  } catch {
    return { title: [], city: [], note: [] };
  }
};

const saveRecent = (d: Details) => {
  const r = loadRecent();
  const bump = (list: string[], v: string) =>
    v.trim()
      ? [v.trim(), ...list.filter((x) => x.toLowerCase() !== v.trim().toLowerCase())].slice(0, MAX)
      : list;
  try {
    localStorage.setItem(
      KEY,
      JSON.stringify({
        title: bump(r.title, d.title),
        city: bump(r.city, d.city),
        note: bump(r.note, d.note),
        last: d,
      })
    );
  } catch {
    /* private mode */
  }
};

// ─── pieces ────────────────────────────────────────────────────────────────

const Label = ({ children }: { children: string }) => (
  <span className="studio-field-label">{children}</span>
);

const Chips = ({
  list,
  current,
  onPick,
}: {
  list: string[];
  current: string;
  onPick: (v: string) => void;
}) =>
  list.length ? (
    <div className="studio-chips">
      {list.map((v) => (
        <motion.button
          key={v}
          type="button"
          whileTap={{ scale: 0.94 }}
          onClick={() => onPick(v)}
          aria-pressed={v === current}
          className="studio-chip"
        >
          {v.length > 48 ? `${v.slice(0, 48)}…` : v}
        </motion.button>
      ))}
    </div>
  ) : null;

const input = 'studio-input studio-input-lg';

// ─── modal ─────────────────────────────────────────────────────────────────

export const DetailsModal = ({
  value,
  onChange,
  count,
  onSend,
  onClose,
  error,
  remember = true,
  artists = [],
}: {
  value: Details;
  onChange: (patch: Partial<Details>) => void;
  count: number;
  onSend: () => void;
  onClose: () => void;
  error: boolean;
  /** off for the tour's practice drop */
  remember?: boolean;
  /** artists in site order, only those with files */
  artists?: { name: string; count: number }[];
}) => {
  const isPresent = useIsPresent();
  const recent = useRef(loadRecent()).current;
  const first = useRef<HTMLInputElement>(null);
  const dialog = useRef<HTMLDivElement>(null);
  const close = useRef(onClose);
  close.current = onClose;

  useEffect(() => {
    if (!isPresent) return;
    const previous = document.activeElement as HTMLElement | null;
    const t = setTimeout(() => first.current?.focus(), 350);
    const esc = (e: KeyboardEvent) => {
      if (e.key === 'Escape') close.current();
      if (e.key !== 'Tab') return;
      const controls = [
        ...(dialog.current?.querySelectorAll<HTMLElement>(
          'button:not(:disabled), input:not(:disabled), textarea:not(:disabled), a[href]'
        ) ?? []),
      ];
      const edge = e.shiftKey ? controls[0] : controls[controls.length - 1];
      if (document.activeElement === edge) {
        e.preventDefault();
        (e.shiftKey ? controls[controls.length - 1] : controls[0])?.focus();
      }
    };
    window.addEventListener('keydown', esc);
    return () => {
      clearTimeout(t);
      window.removeEventListener('keydown', esc);
      if (previous?.isConnected) previous.focus();
    };
  }, [isPresent]);

  const send = () => {
    if (remember) saveRecent(value);
    onSend();
  };

  return (
    <motion.div
      className="studio-modal-wrap fixed inset-0 z-50 flex items-end justify-center md:items-center"
      style={{ pointerEvents: isPresent ? 'auto' : 'none' }}
      aria-hidden={!isPresent || undefined}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      <motion.div className="studio-modal-scrim absolute inset-0" onClick={onClose} aria-hidden />
      <motion.div
        ref={dialog}
        role="dialog"
        aria-modal="true"
        aria-label="details"
        initial={{ y: 60, opacity: 0, scale: 0.97 }}
        animate={{ y: 0, opacity: 1, scale: 1 }}
        exit={{ y: 40, opacity: 0, scale: 0.98 }}
        transition={{ type: 'spring', stiffness: 260, damping: 28 }}
        className="studio-modal relative flex max-h-[92svh] w-full max-w-2xl flex-col overflow-hidden"
      >
        <header className="studio-modal-head">
          <div>
            <h2 className="studio-modal-title">Review &amp; send</h2>
            <span className="studio-modal-sub">
              <span className="tabular-nums">{count}</span> {count === 1 ? 'file' : 'files'}
            </span>
          </div>
          <div className="flex items-center gap-2">
            {recent.last && (
              <button
                type="button"
                onClick={() => onChange(recent.last!)}
                className="studio-button studio-button-ghost studio-button-sm"
              >
                ↺ same as last
              </button>
            )}
            <button
              type="button"
              aria-label="close"
              onClick={onClose}
              className="studio-icon-button"
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
            </button>
          </div>
        </header>

        <div className="studio-modal-body flex-1 space-y-6 overflow-y-auto">
          {artists.length > 0 && (
            <div className="studio-modal-artists">
              <Label>{artists.length > 1 ? 'Artists, in this order' : 'Artist'}</Label>
              <ol>
                {artists.map((a, n) => (
                  <li key={n}>
                    <span>{a.name}</span>
                    <span className="studio-muted">
                      {a.count} {a.count === 1 ? 'file' : 'files'}
                    </span>
                  </li>
                ))}
              </ol>
            </div>
          )}
          <motion.label
            className="block"
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, ease: EASE, delay: 0.05 }}
          >
            <Label>title</Label>
            <input
              ref={first}
              value={value.title}
              onChange={(e) => onChange({ title: e.target.value })}
              placeholder="Artist / song"
              className={input}
            />
            <Chips
              list={recent.title}
              current={value.title}
              onPick={(title) => onChange({ title })}
            />
          </motion.label>

          <motion.div
            className="grid gap-6 md:grid-cols-[1fr_auto]"
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, ease: EASE, delay: 0.1 }}
          >
            <label className="block">
              <Label>city</Label>
              <input
                value={value.city}
                onChange={(e) => onChange({ city: e.target.value })}
                placeholder="Chicago"
                className={input}
              />
              <Chips
                list={recent.city}
                current={value.city}
                onPick={(city) => onChange({ city })}
              />
            </label>
            <div>
              <Label>placement</Label>
              <div className="studio-segmented mt-2" role="group" aria-label="placement">
                {(['top', 'anywhere'] as const).map((p) => (
                  <button
                    key={p}
                    type="button"
                    onClick={() => onChange({ placement: p })}
                    aria-pressed={value.placement === p}
                    className="studio-segmented-option"
                  >
                    {value.placement === p && (
                      <motion.span
                        layoutId="placement-pill"
                        className="studio-segmented-pill"
                        transition={{ type: 'spring', stiffness: 500, damping: 34 }}
                      />
                    )}
                    <span className="relative">{p === 'anywhere' ? 'Anywhere' : 'Top'}</span>
                  </button>
                ))}
              </div>
            </div>
          </motion.div>

          <motion.label
            className="block"
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, ease: EASE, delay: 0.15 }}
          >
            <Label>instructions</Label>
            <textarea
              value={value.note}
              onChange={(e) => onChange({ note: e.target.value })}
              rows={4}
              placeholder="Anything I should know: order, what goes where, which to skip."
              className="studio-input studio-textarea"
            />
            <Chips list={recent.note} current={value.note} onPick={(note) => onChange({ note })} />
          </motion.label>
        </div>

        <footer className="studio-modal-foot">
          <motion.button
            type="button"
            onClick={send}
            whileTap={{ scale: 0.98 }}
            className="studio-button studio-button-primary studio-button-lg w-full"
          >
            {error ? 'Retry' : 'Send'}
          </motion.button>
        </footer>
      </motion.div>
    </motion.div>
  );
};
