import { useEffect, useRef } from 'react';
import { motion } from 'framer-motion';

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

export const loadRecent = (): Recent => {
  try {
    return { title: [], city: [], note: [], ...JSON.parse(localStorage.getItem(KEY) ?? '{}') };
  } catch {
    return { title: [], city: [], note: [] };
  }
};

export const saveRecent = (d: Details) => {
  const r = loadRecent();
  const bump = (list: string[], v: string) =>
    v.trim() ? [v.trim(), ...list.filter((x) => x.toLowerCase() !== v.trim().toLowerCase())].slice(0, MAX) : list;
  try {
    localStorage.setItem(
      KEY,
      JSON.stringify({ title: bump(r.title, d.title), city: bump(r.city, d.city), note: bump(r.note, d.note), last: d }),
    );
  } catch {
    /* private mode */
  }
};

// ─── pieces ────────────────────────────────────────────────────────────────

const Label = ({ children }: { children: string }) => (
  <span className="font-mono text-[10px] uppercase tracking-[0.3em] text-[#C9C8C7]/40">{children}</span>
);

const Chips = ({ list, current, onPick }: { list: string[]; current: string; onPick: (v: string) => void }) =>
  list.length ? (
    <div className="flex flex-wrap gap-1.5 pt-2">
      {list.map((v) => (
        <motion.button
          key={v}
          type="button"
          whileTap={{ scale: 0.94 }}
          onClick={() => onPick(v)}
          className={`max-w-full truncate rounded-full border px-3 py-1 font-mono text-[11px] transition-colors ${
            v === current
              ? 'border-[#dc2626] bg-[#dc2626] text-black'
              : 'border-[#C9C8C7]/15 text-[#C9C8C7]/60 hover:border-[#C9C8C7]/40 hover:text-[#C9C8C7]'
          }`}
        >
          {v.length > 48 ? `${v.slice(0, 48)}…` : v}
        </motion.button>
      ))}
    </div>
  ) : null;

const input =
  'w-full border-b border-[#C9C8C7]/15 bg-transparent py-2 font-logo text-2xl uppercase tracking-tight text-[#C9C8C7] outline-none transition-colors placeholder:text-[#C9C8C7]/15 focus:border-[#dc2626] md:text-3xl';

// ─── modal ─────────────────────────────────────────────────────────────────

export const DetailsModal = ({
  value,
  onChange,
  count,
  onSend,
  onClose,
  error,
  remember = true,
}: {
  value: Details;
  onChange: (patch: Partial<Details>) => void;
  count: number;
  onSend: () => void;
  onClose: () => void;
  error: boolean;
  /** off for the tour's practice drop */
  remember?: boolean;
}) => {
  const recent = useRef(loadRecent()).current;
  const first = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const t = setTimeout(() => first.current?.focus(), 350);
    const esc = (e: KeyboardEvent) => e.key === 'Escape' && onClose();
    window.addEventListener('keydown', esc);
    return () => {
      clearTimeout(t);
      window.removeEventListener('keydown', esc);
    };
  }, [onClose]);

  const send = () => {
    if (remember) saveRecent(value);
    onSend();
  };

  return (
    <motion.div
      className="fixed inset-0 z-50 flex items-end justify-center md:items-center"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      <motion.div
        className="absolute inset-0 bg-black/70 backdrop-blur-md"
        onClick={onClose}
        aria-hidden
      />
      <motion.div
        role="dialog"
        aria-modal="true"
        aria-label="details"
        initial={{ y: 60, opacity: 0, scale: 0.97 }}
        animate={{ y: 0, opacity: 1, scale: 1 }}
        exit={{ y: 40, opacity: 0, scale: 0.98 }}
        transition={{ type: 'spring', stiffness: 260, damping: 28 }}
        className="relative flex max-h-[92svh] w-full max-w-2xl flex-col overflow-hidden rounded-t-3xl border border-[#C9C8C7]/10 bg-[#0b0b0b] shadow-[0_40px_120px_rgba(0,0,0,.8)] md:rounded-3xl"
      >
        <header className="flex items-center justify-between px-6 pb-2 pt-5 md:px-8">
          <span className="font-mono text-[11px] uppercase tracking-[0.25em] text-[#C9C8C7]/50">
            <span className="tabular-nums text-[#C9C8C7]">{String(count).padStart(2, '0')}</span> files
          </span>
          <div className="flex items-center gap-4">
            {recent.last && (
              <button
                type="button"
                onClick={() => onChange(recent.last!)}
                className="font-mono text-[11px] uppercase tracking-[0.2em] text-[#C9C8C7]/50 transition-colors hover:text-[#C9C8C7]"
              >
                ↺ same as last
              </button>
            )}
            <button
              type="button"
              aria-label="close"
              onClick={onClose}
              className="flex h-8 w-8 items-center justify-center rounded-full text-[#C9C8C7]/50 transition-colors hover:bg-[#C9C8C7]/10 hover:text-[#C9C8C7]"
            >
              ×
            </button>
          </div>
        </header>

        <div className="flex-1 space-y-7 overflow-y-auto px-6 pb-6 pt-3 md:px-8">
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
            <Chips list={recent.title} current={value.title} onPick={(title) => onChange({ title })} />
          </motion.label>

          <motion.div
            className="grid gap-7 md:grid-cols-[1fr_auto]"
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
              <Chips list={recent.city} current={value.city} onPick={(city) => onChange({ city })} />
            </label>
            <div>
              <Label>placement</Label>
              <div className="mt-2 flex rounded-full border border-[#C9C8C7]/15 p-1">
                {(['top', 'anywhere'] as const).map((p) => (
                  <button
                    key={p}
                    type="button"
                    onClick={() => onChange({ placement: p })}
                    className="relative px-5 py-2 font-mono text-[11px] uppercase tracking-[0.2em]"
                  >
                    {value.placement === p && (
                      <motion.span
                        layoutId="placement-pill"
                        className="absolute inset-0 rounded-full bg-[#C9C8C7]"
                        transition={{ type: 'spring', stiffness: 500, damping: 34 }}
                      />
                    )}
                    <span className={`relative ${value.placement === p ? 'text-black' : 'text-[#C9C8C7]/50'}`}>
                      {p === 'anywhere' ? 'any' : p}
                    </span>
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
              className="mt-2 w-full resize-none rounded-xl border border-[#C9C8C7]/10 bg-[#C9C8C7]/[0.03] p-4 font-mono text-[13px] leading-relaxed text-[#C9C8C7] outline-none transition-colors placeholder:text-[#C9C8C7]/25 focus:border-[#dc2626]/60"
            />
            <Chips list={recent.note} current={value.note} onPick={(note) => onChange({ note })} />
          </motion.label>
        </div>

        <footer className="border-t border-[#C9C8C7]/10 px-6 pb-[max(1.25rem,env(safe-area-inset-bottom))] pt-4 md:px-8">
          <motion.button
            type="button"
            onClick={send}
            whileHover={{ scale: 1.01 }}
            whileTap={{ scale: 0.98 }}
            className="group relative w-full overflow-hidden rounded-full bg-[#C9C8C7] py-4 font-logo text-2xl uppercase tracking-tight text-black"
          >
            <span className="absolute inset-0 origin-bottom scale-y-0 bg-[#dc2626] transition-transform duration-300 ease-[cubic-bezier(.22,1,.36,1)] group-hover:scale-y-100" />
            <span className="relative">{error ? 'retry' : 'send'}</span>
          </motion.button>
        </footer>
      </motion.div>
    </motion.div>
  );
};
