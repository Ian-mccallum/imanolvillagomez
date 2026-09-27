import { useCallback, useEffect, useRef, useState, type ReactNode } from 'react';
import {
  motion,
  AnimatePresence,
  MotionConfig,
  useMotionValue,
  useSpring,
  useTransform,
  animate,
  type MotionValue,
} from 'framer-motion';
import { useMetaTags } from '@/hooks/useMetaTags';
import { Glitch } from '@/components/art/Glitch';
import { Tile, type Item } from '@/components/art/Tile';
import { Queue } from '@/components/art/Queue';
import * as api from '@/components/art/artApi';
import { Backdrop } from '@/components/art/Backdrop';
import { Star } from '@/components/art/Star';

/**
 * /art — Imanol's drop box. Unlisted, noindex, key-gated.
 * Files land in R2 inbox/<id>/; the laptop runner publishes them to a preview,
 * and Imanol holds to ship from the queue below.
 */

const EASE = [0.22, 1, 0.36, 1] as const;
const INK = '#C9C8C7';

const GRAIN =
  "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='220' height='220'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='.85' numOctaves='2' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E\")";

const store = (kind: 'local' | 'session') => ({
  get: (k: string) => {
    try {
      return (kind === 'local' ? localStorage : sessionStorage).getItem(k) ?? '';
    } catch {
      return '';
    }
  },
  set: (k: string, v: string) => {
    try {
      const s = kind === 'local' ? localStorage : sessionStorage;
      if (v) s.setItem(k, v);
      else s.removeItem(k);
    } catch {
      /* private mode */
    }
  },
});
const local = store('local');
const sess = store('session');
const TOKEN = 'art-token';
const BIO = 'art-bio';
const BIO_NO = 'art-bio-no';

/** Pointer speed → 0..1 heat, decaying back to rest. */
function useHeat() {
  const raw = useMotionValue(0);
  const heat = useSpring(raw, { stiffness: 380, damping: 24 });
  useEffect(() => {
    let last = { x: 0, y: 0, t: 0 };
    let tm = 0;
    const move = (e: PointerEvent) => {
      const t = performance.now();
      const v = Math.hypot(e.clientX - last.x, e.clientY - last.y) / Math.max(t - last.t, 1);
      last = { x: e.clientX, y: e.clientY, t };
      raw.set(Math.min(Math.max(v - 1, 0) / 5, 0.7));
      clearTimeout(tm);
      tm = window.setTimeout(() => raw.set(0), 90);
    };
    window.addEventListener('pointermove', move);

    // ambient bursts — the page glitches on its own, in sync with the backdrop
    let bt = 0;
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const burst = () => {
      raw.set(0.3 + Math.random() * 0.35);
      setTimeout(() => raw.set(0), 60 + Math.random() * 90);
      bt = window.setTimeout(burst, 3500 + Math.random() * 5000);
    };
    if (!reduce) bt = window.setTimeout(burst, 1400);

    return () => {
      window.removeEventListener('pointermove', move);
      clearTimeout(tm);
      clearTimeout(bt);
    };
  }, [raw]);
  return { heat, raw };
}

/** Camera-shutter wipe between the lock and the room. */
const Shutter = ({ children, k }: { children: ReactNode; k: string }) => (
  <motion.div
    key={k}
    initial={{ clipPath: 'inset(50% 0 50% 0)' }}
    animate={{ clipPath: 'inset(0% 0 0% 0)' }}
    exit={{ clipPath: 'inset(50% 0 50% 0)' }}
    transition={{ duration: 0.8, ease: EASE }}
    className="min-h-[100svh]"
  >
    {children}
  </motion.div>
);

// ─── lock ──────────────────────────────────────────────────────────────────

/** Face-ID-style glyph: corner brackets that close in while scanning. */
const BioGlyph = ({ scanning }: { scanning: boolean }) => (
  <svg viewBox="0 0 48 48" className="h-full w-full" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round">
    {[
      'M4 15V8a4 4 0 0 1 4-4h7',
      'M33 4h7a4 4 0 0 1 4 4v7',
      'M44 33v7a4 4 0 0 1-4 4h-7',
      'M15 44H8a4 4 0 0 1-4-4v-7',
    ].map((d, i) => (
      <motion.path
        key={i}
        d={d}
        animate={scanning ? { pathLength: [1, 0.35, 1] } : { pathLength: 1 }}
        transition={scanning ? { duration: 0.9, repeat: Infinity, delay: i * 0.08 } : undefined}
      />
    ))}
    <path d="M17 18v3M31 18v3M24 19v8h-2M18 33c3.5 3 8.5 3 12 0" />
  </svg>
);

const Lock = ({
  heat,
  raw,
  onOpen,
}: {
  heat: MotionValue<number>;
  raw: MotionValue<number>;
  onOpen: (via: 'key' | 'bio') => void;
}) => {
  const [v, setV] = useState('');
  const [bad, setBad] = useState(false);
  const [locked, setLocked] = useState(false);
  const [busy, setBusy] = useState(false);
  const [scanning, setScanning] = useState(false);
  const [bio] = useState(() => !!local.get(BIO));
  const input = useRef<HTMLInputElement>(null);
  const x = useMotionValue(0);

  // typing always goes to the key, even when the face button is the focus
  useEffect(() => {
    const k = (e: KeyboardEvent) => {
      if (e.key.length === 1 && !e.metaKey && !e.ctrlKey && document.activeElement !== input.current) input.current?.focus();
    };
    window.addEventListener('keydown', k);
    return () => window.removeEventListener('keydown', k);
  }, []);

  const reject = async () => {
    setBad(true);
    raw.set(0.7);
    setTimeout(() => raw.set(0), 260);
    navigator.vibrate?.([20, 40, 20]);
    await animate(x, [0, -26, 22, -14, 9, -4, 0], { duration: 0.5, ease: 'easeOut' });
    setV('');
    setBad(false);
  };

  const go = async () => {
    if (!v || busy) return;
    setBusy(true);
    try {
      sess.set(TOKEN, await api.unlock(v));
      onOpen('key');
    } catch (e) {
      if (e instanceof api.Locked) setLocked(true);
      await reject();
    } finally {
      setBusy(false);
    }
  };

  const face = async () => {
    if (scanning) return;
    setScanning(true);
    try {
      sess.set(TOKEN, await api.passkeyUnlock());
      onOpen('bio');
    } catch {
      raw.set(0.8);
      setTimeout(() => raw.set(0), 200);
      input.current?.focus();
    } finally {
      setScanning(false);
    }
  };

  return (
    <div
      className="relative z-10 flex min-h-[100svh] cursor-text flex-col items-center justify-center px-4"
      onClick={() => input.current?.focus()}
    >
      <input
        ref={input}
        autoFocus={!bio}
        type="password"
        autoComplete="current-password"
        aria-label="key"
        value={v}
        onChange={(e) => setV(e.target.value)}
        onKeyDown={(e) => e.key === 'Enter' && go()}
        className="absolute h-px w-px opacity-0"
      />
      <motion.div style={{ x }} className="flex h-[22vw] max-h-[180px] items-center md:h-[12vw]">
        <AnimatePresence initial={false}>
          {[...v].map((_, i) => (
            <motion.span
              key={i}
              initial={{ scale: 0, y: 20 }}
              animate={{ scale: 1, y: 0, backgroundColor: bad ? '#dc2626' : INK }}
              exit={{ scale: 0, opacity: 0 }}
              transition={{ type: 'spring', stiffness: 600, damping: 26 }}
              className="mx-[0.6vw] block h-[3.2vw] max-h-7 min-h-3 w-[3.2vw] min-w-3 max-w-7 rounded-full shadow-[0_0_24px_rgba(201,200,199,.35)]"
            />
          ))}
        </AnimatePresence>
        <motion.span
          aria-hidden
          className="ml-[1vw] block h-[14vw] max-h-[120px] w-[0.9vw] min-w-[4px] max-w-[8px] bg-[#dc2626] shadow-[0_0_30px_4px_rgba(220,38,38,.6)] md:h-[8vw]"
          animate={{ opacity: busy ? [1, 0.2, 1] : [1, 1, 0, 0] }}
          transition={{ duration: busy ? 0.4 : 1.05, repeat: Infinity, times: busy ? undefined : [0, 0.5, 0.5, 1] }}
        />
      </motion.div>

      <AnimatePresence>
        {locked && (
          <motion.p
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="mt-6 font-mono text-[11px] uppercase tracking-[0.3em] text-[#dc2626]"
          >
            locked · 15m
          </motion.p>
        )}
      </AnimatePresence>

      {bio && (
        <motion.button
          type="button"
          aria-label={api.bioName()}
          onClick={(e) => {
            e.stopPropagation();
            face();
          }}
          initial={{ opacity: 0, scale: 0.6, filter: 'blur(8px)' }}
          animate={{ opacity: 1, scale: 1, filter: 'blur(0px)' }}
          transition={{ delay: 0.5, type: 'spring', stiffness: 200, damping: 18 }}
          whileHover={{ scale: 1.08 }}
          whileTap={{ scale: 0.92 }}
          className="relative mt-10 h-16 w-16 text-[#C9C8C7] md:h-14 md:w-14"
        >
          <motion.span
            aria-hidden
            className="absolute -inset-4 rounded-full border border-[#dc2626]/50"
            animate={{ scale: [0.8, 1.25], opacity: [0.8, 0] }}
            transition={{ duration: 1.8, repeat: Infinity, ease: 'easeOut' }}
          />
          <BioGlyph scanning={scanning} />
        </motion.button>
      )}

      <div className="pointer-events-none fixed bottom-8 left-1/2 -translate-x-1/2">
        <Star heat={heat} className="h-9 w-9 md:h-10 md:w-10" />
      </div>
    </div>
  );
};

/** One-time offer after a password unlock: save this device's biometric. */
const SaveBio = ({ onDone }: { onDone: () => void }) => {
  const [state, setState] = useState<'ask' | 'busy' | 'saved'>('ask');
  const name = api.bioName();
  const save = async () => {
    setState('busy');
    try {
      local.set(BIO, await api.savePasskey());
      setState('saved');
      setTimeout(onDone, 1400);
    } catch {
      setState('ask');
    }
  };
  return (
    <motion.div
      initial={{ y: -80, opacity: 0, filter: 'blur(10px)' }}
      animate={{ y: 0, opacity: 1, filter: 'blur(0px)' }}
      exit={{ y: -80, opacity: 0, filter: 'blur(10px)' }}
      transition={{ type: 'spring', stiffness: 220, damping: 22, delay: 0.9 }}
      className="fixed left-1/2 top-4 z-40 flex -translate-x-1/2 items-center gap-1 border border-[#C9C8C7]/15 bg-black/70 p-1 font-mono text-[11px] uppercase tracking-[0.2em] text-[#C9C8C7] backdrop-blur-xl"
    >
      <button
        type="button"
        onClick={save}
        disabled={state !== 'ask'}
        className="group flex items-center gap-2.5 px-3 py-2 transition-colors hover:bg-[#dc2626] hover:text-black"
      >
        <span className="h-4 w-4">
          <BioGlyph scanning={state === 'busy'} />
        </span>
        <AnimatePresence mode="wait" initial={false}>
          <motion.span
            key={state}
            initial={{ y: 8, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: -8, opacity: 0 }}
            transition={{ duration: 0.2 }}
          >
            {state === 'saved' ? 'saved' : `save ${name}`}
          </motion.span>
        </AnimatePresence>
      </button>
      {state === 'ask' && (
        <button
          type="button"
          aria-label="not now"
          onClick={() => {
            local.set(BIO_NO, '1');
            onDone();
          }}
          className="px-3 py-2 text-[#C9C8C7]/40 transition-colors hover:text-[#C9C8C7]"
        >
          ×
        </button>
      )}
    </motion.div>
  );
};

// ─── room ──────────────────────────────────────────────────────────────────

type Phase = 'idle' | 'sending' | 'sent' | 'error';

const useCols = () => {
  const get = () => (typeof window === 'undefined' ? 4 : window.innerWidth < 640 ? 2 : window.innerWidth < 1100 ? 3 : 4);
  const [c, setC] = useState(get);
  useEffect(() => {
    const on = () => setC(get());
    window.addEventListener('resize', on);
    return () => window.removeEventListener('resize', on);
  }, []);
  return c;
};

const Field = ({
  value,
  onChange,
  placeholder,
  className = '',
}: {
  value: string;
  onChange: (v: string) => void;
  placeholder: string;
  className?: string;
}) => (
  <input
    value={value}
    onChange={(e) => onChange(e.target.value)}
    placeholder={placeholder}
    className={`min-w-0 border-b border-[#C9C8C7]/15 bg-transparent py-2 font-mono text-[13px] text-[#C9C8C7] outline-none transition-colors placeholder:text-[#C9C8C7]/30 focus:border-[#dc2626] ${className}`}
  />
);

const Room = ({
  heat,
  raw,
  onDim,
}: {
  heat: MotionValue<number>;
  raw: MotionValue<number>;
  onDim: (d: boolean) => void;
}) => {
  const [items, setItems] = useState<Item[]>([]);
  const [drag, setDrag] = useState(false);
  const [phase, setPhase] = useState<Phase>('idle');
  const [title, setTitle] = useState('');
  const [city, setCity] = useState('');
  const [placement, setPlacement] = useState<'top' | 'anywhere'>('anywhere');
  const [note, setNote] = useState('');
  const [requests, setRequests] = useState<api.ArtRequest[]>([]);
  const picker = useRef<HTMLInputElement>(null);
  const cols = useCols();
  const busy = phase === 'sending';

  const total = items.reduce((s, i) => s + i.file.size, 0);
  const loaded = items.reduce((s, i) => s + i.loaded, 0);
  const pct = useSpring(0, { stiffness: 60, damping: 20 });
  const pctText = useTransform(pct, (p) => String(Math.floor(p)).padStart(2, '0'));
  useEffect(() => pct.set(total ? (loaded / total) * 100 : 0), [loaded, total, pct]);

  const refresh = useCallback(() => api.list().then(setRequests).catch(() => {}), []);
  useEffect(() => {
    refresh();
    const t = setInterval(() => document.visibilityState === 'visible' && refresh(), 20000);
    return () => clearInterval(t);
  }, [refresh]);

  const add = useCallback(
    (files: FileList | File[] | null) => {
      if (!files || busy) return;
      const next = [...files].map((file) => ({
        id: `${file.name}-${file.size}-${Math.random().toString(36).slice(2, 7)}`,
        file,
        url: URL.createObjectURL(file),
        rot: (Math.random() - 0.5) * 3,
        loaded: 0,
      }));
      setItems((cur) => [...cur, ...next]);
      raw.set(0.8);
      setTimeout(() => raw.set(0), 180);
    },
    [busy, raw],
  );

  // whole window is the drop target
  useEffect(() => {
    let depth = 0;
    let jitter = 0;
    const enter = (e: DragEvent) => {
      if (!e.dataTransfer?.types.includes('Files')) return;
      e.preventDefault();
      if (depth++ === 0) {
        setDrag(true);
        jitter = window.setInterval(() => raw.set(0.2 + Math.random() * 0.35), 90);
      }
    };
    const leave = () => {
      if (--depth <= 0) {
        depth = 0;
        setDrag(false);
        clearInterval(jitter);
        raw.set(0);
      }
    };
    const over = (e: DragEvent) => e.preventDefault();
    const drop = (e: DragEvent) => {
      e.preventDefault();
      depth = 1;
      leave();
      add(e.dataTransfer?.files ?? null);
    };
    window.addEventListener('dragenter', enter);
    window.addEventListener('dragleave', leave);
    window.addEventListener('dragover', over);
    window.addEventListener('drop', drop);
    return () => {
      window.removeEventListener('dragenter', enter);
      window.removeEventListener('dragleave', leave);
      window.removeEventListener('dragover', over);
      window.removeEventListener('drop', drop);
      clearInterval(jitter);
    };
  }, [add, raw]);

  const remove = (id: string) =>
    setItems((cur) => {
      const it = cur.find((i) => i.id === id);
      if (it) URL.revokeObjectURL(it.url);
      return cur.filter((i) => i.id !== id);
    });

  const send = async () => {
    if (!items.length || busy) return;
    setPhase('sending');
    setItems((cur) => cur.map((i) => ({ ...i, loaded: 0 })));
    try {
      const { id, uploads } = await api.start(items.map((i) => i.file));
      let next = 0;
      const worker = async () => {
        while (next < items.length) {
          const n = next++;
          const it = items[n];
          await api.put(uploads[n], it.file, (b) =>
            setItems((cur) => cur.map((c) => (c.id === it.id ? { ...c, loaded: b } : c))),
          );
        }
      };
      await Promise.all([worker(), worker(), worker()]);
      const req = await api.submit({
        id,
        title,
        city,
        placement,
        note,
        files: uploads.map(({ url: _url, ...f }) => f),
      });
      setRequests((r) => [req, ...r]);
      setPhase('sent');
      raw.set(0.6);
      setTimeout(() => raw.set(0), 300);
      setTimeout(() => {
        items.forEach((i) => URL.revokeObjectURL(i.url));
        setItems([]);
        setTitle('');
        setCity('');
        setNote('');
        setPlacement('anywhere');
        setPhase('idle');
      }, 1900);
    } catch {
      setPhase('error');
    }
  };

  useEffect(() => onDim(items.length > 0), [items.length, onDim]);

  const columns = Array.from({ length: cols }, (_, c) => items.filter((_, i) => i % cols === c));

  return (
    <div className="relative z-10">
      <input
        ref={picker}
        type="file"
        multiple
        accept="video/*,image/*,.zip,.mov,.mp4,.heic"
        className="hidden"
        onChange={(e) => {
          add(e.target.files);
          e.target.value = '';
        }}
      />

      {/* chrome */}
      <header className="pointer-events-none absolute inset-x-0 top-0 z-30 flex items-center justify-between px-4 py-4 font-mono text-[11px] uppercase tracking-[0.25em] text-[#C9C8C7]/50 mix-blend-difference md:px-8">
        <span>nol</span>
        <AnimatePresence mode="popLayout">
          <motion.span
            key={items.length}
            initial={{ y: -10, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 10, opacity: 0 }}
            className="tabular-nums"
          >
            {items.length ? String(items.length).padStart(2, '0') : 'art'}
          </motion.span>
        </AnimatePresence>
      </header>

      {/* empty: the word is the button */}
      <AnimatePresence mode="wait">
        {!items.length ? (
          <motion.button
            key="empty"
            type="button"
            onClick={() => picker.current?.click()}
            exit={{ opacity: 0, scale: 0.94, filter: 'blur(14px)', transition: { duration: 0.45, ease: EASE } }}
            className="flex h-[88svh] w-full items-center justify-center text-[#C9C8C7] outline-none focus-visible:text-white"
          >
            <Glitch text="DROP" heat={heat} className="text-[31vw] md:text-[24vw]" delay={0.35} />
          </motion.button>
        ) : (
          <motion.div
            key="grid"
            className="flex gap-3 px-3 pb-72 pt-16 md:gap-4 md:px-6 md:pb-60"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
          >
            {columns.map((col, c) => (
              <div key={c} className="min-w-0 flex-1" style={{ marginTop: c % 2 ? '2.5rem' : 0 }}>
                <AnimatePresence mode="popLayout">
                  {col.map((it) => (
                    <Tile
                      key={it.id}
                      item={it}
                      index={items.indexOf(it)}
                      busy={busy || phase === 'sent'}
                      onRemove={() => remove(it.id)}
                    />
                  ))}
                </AnimatePresence>
                {c === cols - 1 && !busy && phase !== 'sent' && (
                  <motion.button
                    layout
                    type="button"
                    onClick={() => picker.current?.click()}
                    whileHover={{ scale: 0.98 }}
                    whileTap={{ scale: 0.94 }}
                    className="flex aspect-square w-full items-center justify-center border border-dashed border-[#C9C8C7]/15 font-logo text-5xl text-[#C9C8C7]/30 transition-colors hover:border-[#C9C8C7]/40 hover:text-[#C9C8C7]"
                    aria-label="add more"
                  >
                    +
                  </motion.button>
                )}
              </div>
            ))}
          </motion.div>
        )}
      </AnimatePresence>

      {/* drag-over takeover */}
      <AnimatePresence>
        {drag && (
          <motion.div
            className="pointer-events-none fixed inset-0 z-40 flex items-center justify-center bg-black/85 text-[#C9C8C7] backdrop-blur-sm"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
          >
            <motion.div
              className="absolute inset-4 border border-[#dc2626]/60 md:inset-8"
              initial={{ scale: 1.04 }}
              animate={{ scale: 1 }}
              transition={{ type: 'spring', stiffness: 260, damping: 18 }}
            />
            <Glitch text="DROP" heat={heat} className="text-[31vw] md:text-[24vw]" />
          </motion.div>
        )}
      </AnimatePresence>

      {/* the sheet */}
      <AnimatePresence>
        {items.length > 0 && (
          <motion.section
            initial={{ y: '110%' }}
            animate={{ y: 0 }}
            exit={{ y: '110%' }}
            transition={{ type: 'spring', stiffness: 140, damping: 22 }}
            className="fixed inset-x-0 bottom-0 z-30 border-t border-[#C9C8C7]/10 bg-black/85 px-4 pb-[max(1rem,env(safe-area-inset-bottom))] pt-4 backdrop-blur-xl md:px-8"
          >
            <AnimatePresence mode="wait" initial={false}>
              {busy ? (
                <motion.div
                  key="pct"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  className="flex items-end justify-between"
                >
                  <motion.span className="font-logo text-[22vw] leading-[0.8] tracking-[-0.05em] text-[#C9C8C7] tabular-nums md:text-[10vw]">
                    {pctText}
                  </motion.span>
                  <span className="pb-2 font-mono text-[11px] uppercase tracking-[0.25em] text-[#C9C8C7]/40">
                    keep open
                  </span>
                </motion.div>
              ) : (
                <motion.div
                  key="form"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  className="grid grid-cols-2 items-end gap-x-5 gap-y-3 md:grid-cols-[1.2fr_1fr_auto_2fr_auto]"
                >
                  <Field value={title} onChange={setTitle} placeholder="title" />
                  <Field value={city} onChange={setCity} placeholder="city" />
                  <div className="flex gap-4 pb-2 font-mono text-[11px] uppercase tracking-[0.2em]">
                    {(['top', 'anywhere'] as const).map((p) => (
                      <button
                        key={p}
                        type="button"
                        onClick={() => setPlacement(p)}
                        className={`relative pb-1 transition-colors ${placement === p ? 'text-[#C9C8C7]' : 'text-[#C9C8C7]/30 hover:text-[#C9C8C7]/60'}`}
                      >
                        {p === 'anywhere' ? 'any' : p}
                        {placement === p && (
                          <motion.span
                            layoutId="place"
                            className="absolute inset-x-0 -bottom-px h-px bg-[#dc2626]"
                            transition={{ type: 'spring', stiffness: 500, damping: 34 }}
                          />
                        )}
                      </button>
                    ))}
                  </div>
                  <Field value={note} onChange={setNote} placeholder="notes" className="col-span-2 md:col-span-1" />
                  <motion.button
                    type="button"
                    onClick={send}
                    whileHover={{ scale: 1.03 }}
                    whileTap={{ scale: 0.95 }}
                    className="group relative col-span-2 overflow-hidden bg-[#C9C8C7] px-8 py-3 font-logo text-xl uppercase tracking-tight text-black md:col-span-1"
                  >
                    <span className="absolute inset-0 origin-bottom scale-y-0 bg-[#dc2626] transition-transform duration-300 ease-[cubic-bezier(.22,1,.36,1)] group-hover:scale-y-100" />
                    <span className="relative">{phase === 'error' ? 'retry' : 'send'}</span>
                  </motion.button>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.section>
        )}
      </AnimatePresence>

      {/* sent — slam */}
      <AnimatePresence>
        {phase === 'sent' && (
          <motion.div
            className="fixed inset-0 z-50 flex items-center justify-center bg-black text-[#C9C8C7]"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ clipPath: 'inset(50% 0 50% 0)', transition: { duration: 0.7, ease: EASE } }}
          >
            <motion.div initial={{ scale: 1.5 }} animate={{ scale: 1 }} transition={{ type: 'spring', stiffness: 300, damping: 16 }}>
              <Glitch text="SENT" heat={heat} className="text-[30vw] md:text-[22vw]" />
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {!items.length && (
        <Queue requests={requests} onChange={(r) => setRequests((cur) => cur.map((c) => (c.id === r.id ? r : c)))} />
      )}
    </div>
  );
};

// ─── page ──────────────────────────────────────────────────────────────────

export const ArtPage = () => {
  useMetaTags({ title: 'art', description: '', noindex: true });
  const { heat, raw } = useHeat();
  const [open, setOpen] = useState(false);
  const [offerBio, setOfferBio] = useState(false);
  const [dim, setDim] = useState(false);

  // a live session in this tab skips the lock
  useEffect(() => {
    const t = sess.get(TOKEN);
    if (!t) return;
    api.setToken(t);
    api.list().then(
      () => setOpen(true),
      () => sess.set(TOKEN, ''),
    );
  }, []);

  const onOpen = async (via: 'key' | 'bio') => {
    setOpen(true);
    if (via === 'key' && !local.get(BIO) && !local.get(BIO_NO) && (await api.canPasskey())) setOfferBio(true);
  };

  return (
    <MotionConfig reducedMotion="user">
      <div className="relative min-h-[100svh] overflow-x-hidden bg-black text-[#C9C8C7] selection:bg-[#dc2626] selection:text-black">
        <Backdrop heat={heat} intensity={dim ? 0.3 : open ? 0.8 : 1} />
        <AnimatePresence mode="wait">
          {open ? (
            <Shutter k="room">
              <Room heat={heat} raw={raw} onDim={setDim} />
            </Shutter>
          ) : (
            <Shutter k="lock">
              <Lock heat={heat} raw={raw} onOpen={onOpen} />
            </Shutter>
          )}
        </AnimatePresence>
        <AnimatePresence>{offerBio && <SaveBio onDone={() => setOfferBio(false)} />}</AnimatePresence>
        {/* film grain */}
        <motion.div
          aria-hidden
          className="pointer-events-none fixed -inset-[50%] z-[60] opacity-[0.07] mix-blend-screen"
          style={{ backgroundImage: GRAIN }}
          animate={{ x: ['0%', '-4%', '3%', '-2%', '0%'], y: ['0%', '3%', '-4%', '2%', '0%'] }}
          transition={{ duration: 0.5, repeat: Infinity, ease: (t: number) => (t < 1 ? 0 : 1) }}
        />
      </div>
    </MotionConfig>
  );
};
