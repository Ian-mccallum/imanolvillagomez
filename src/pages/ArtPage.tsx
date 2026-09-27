import { useCallback, useEffect, useRef, useState, type ReactNode } from 'react';
import {
  motion,
  AnimatePresence,
  MotionConfig,
  useMotionValue,
  useSpring,
  useTransform,
  animate,
  motionValue,
  type MotionValue,
} from 'framer-motion';
import { useMetaTags } from '@/hooks/useMetaTags';
import { Glitch } from '@/components/art/Glitch';
import { Tile, type Item } from '@/components/art/Tile';
import { Queue } from '@/components/art/Queue';
import * as api from '@/components/art/artApi';
import { Backdrop } from '@/components/art/Backdrop';
import { Star } from '@/components/art/Star';
import { DetailsModal } from '@/components/art/Details';
import { loadDraft, saveDraft, clearDraft } from '@/components/art/draft';
import { usePointerHeat } from '@/components/art/heat';
import { fromDrop, fromList, type Incoming } from '@/components/art/files';

/**
 * /art — Imanol's drop box. Unlisted, noindex, key-gated.
 * Files land in R2 inbox/<id>/; the laptop runner publishes them to a preview,
 * and Imanol holds to ship from the queue below.
 */

const EASE = [0.22, 1, 0.36, 1] as const;
/** DROP stays clean — the cursor glitch lives in the backdrop only. */
const STILL = motionValue(0);
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
  <svg
    viewBox="0 0 48 48"
    className="h-full w-full"
    fill="none"
    stroke="currentColor"
    strokeWidth="2.2"
    strokeLinecap="round"
  >
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
  onOpen,
}: {
  heat: MotionValue<number>;
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
      if (
        e.key.length === 1 &&
        !e.metaKey &&
        !e.ctrlKey &&
        document.activeElement !== input.current
      )
        input.current?.focus();
    };
    window.addEventListener('keydown', k);
    return () => window.removeEventListener('keydown', k);
  }, []);

  const reject = async () => {
    setBad(true);
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
          transition={{
            duration: busy ? 0.4 : 1.05,
            repeat: Infinity,
            times: busy ? undefined : [0, 0.5, 0.5, 1],
          }}
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

/** One + for everything: tap it, pick files or a whole folder. */
const Add = ({ onFiles, onFolder }: { onFiles: () => void; onFolder: () => void }) => {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (!open) return;
    const close = (e: PointerEvent) => !ref.current?.contains(e.target as Node) && setOpen(false);
    window.addEventListener('pointerdown', close);
    return () => window.removeEventListener('pointerdown', close);
  }, [open]);
  const pick = (fn: () => void) => () => {
    setOpen(false);
    fn();
  };
  return (
    <div ref={ref} className="relative flex items-center justify-center">
      <AnimatePresence>
        {open &&
          (
            [
              ['files', onFiles, -1],
              ['folder', onFolder, 1],
            ] as const
          ).map(([label, fn, dir]) => (
            <motion.button
              key={label}
              type="button"
              onClick={pick(fn)}
              initial={{ opacity: 0, x: 0, scale: 0.6 }}
              animate={{ opacity: 1, x: dir * 92, scale: 1 }}
              exit={{ opacity: 0, x: 0, scale: 0.6 }}
              transition={{ type: 'spring', stiffness: 420, damping: 28 }}
              className="absolute whitespace-nowrap rounded-full bg-[#C9C8C7] px-4 py-2 font-mono text-[11px] uppercase tracking-[0.2em] text-black shadow-[0_8px_30px_rgba(0,0,0,.6)] hover:bg-white"
            >
              {label}
            </motion.button>
          ))}
      </AnimatePresence>
      <motion.button
        type="button"
        aria-label="add files or a folder"
        aria-expanded={open}
        onClick={(e) => {
          e.stopPropagation();
          setOpen((o) => !o);
        }}
        whileHover={{ scale: 1.08 }}
        whileTap={{ scale: 0.92 }}
        animate={{ rotate: open ? 45 : 0 }}
        transition={{ type: 'spring', stiffness: 400, damping: 22 }}
        className="relative z-10 flex h-16 w-16 items-center justify-center rounded-full bg-[#C9C8C7] text-black shadow-[0_0_0_6px_rgba(0,0,0,.55),0_0_40px_rgba(201,200,199,.35)]"
      >
        <svg viewBox="0 0 24 24" className="h-7 w-7" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
          <path d="M12 4v16M4 12h16" />
        </svg>
      </motion.button>
    </div>
  );
};

/** The empty state: DROP is the button, and tapping it offers files or a folder. */
const DropWord = ({
  onFiles,
  onFolder,
}: {
  onFiles: () => void;
  onFolder: () => void;
}) => {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (!open) return;
    const close = (e: PointerEvent) => !ref.current?.contains(e.target as Node) && setOpen(false);
    window.addEventListener('pointerdown', close);
    return () => window.removeEventListener('pointerdown', close);
  }, [open]);
  const pick = (fn: () => void) => () => {
    setOpen(false);
    fn();
  };
  return (
    <div ref={ref} className="relative flex h-[88svh] w-full flex-col items-center justify-center">
      <motion.button
        type="button"
        aria-expanded={open}
        onClick={() => setOpen((o) => !o)}
        animate={{ scale: open ? 0.92 : 1, opacity: open ? 0.55 : 1 }}
        transition={{ type: 'spring', stiffness: 300, damping: 24 }}
        className="text-[#C9C8C7] outline-none focus-visible:text-white"
      >
        <Glitch text="DROP" heat={STILL} className="text-[31vw] md:text-[24vw]" delay={0.35} />
      </motion.button>
      <div className="absolute top-[calc(50%+min(13vw,11rem))] flex gap-3">
        <AnimatePresence>
          {open &&
            (
              [
                ['files', onFiles],
                ['folder', onFolder],
              ] as const
            ).map(([label, fn], i) => (
              <motion.button
                key={label}
                type="button"
                onClick={pick(fn)}
                initial={{ opacity: 0, y: -16, scale: 0.8 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -10, scale: 0.8, transition: { duration: 0.15 } }}
                transition={{ type: 'spring', stiffness: 420, damping: 26, delay: i * 0.05 }}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="rounded-full bg-[#C9C8C7] px-6 py-3 font-mono text-xs uppercase tracking-[0.25em] text-black shadow-[0_0_40px_rgba(201,200,199,.3)] hover:bg-white"
              >
                {label}
              </motion.button>
            ))}
        </AnimatePresence>
      </div>
    </div>
  );
};

// ─── room ──────────────────────────────────────────────────────────────────

type Phase = 'idle' | 'sending' | 'sent' | 'error';

/** A folder in the drop — usually one artist/client. */
interface Group {
  id: string;
  name: string;
  note: string;
}

const uid = () => Math.random().toString(36).slice(2, 9);

/** Same alphabet the server allows for a folder, so what he sees is what lands. */
const folderName = (n: string) =>
  n
    .normalize('NFKD')
    .replace(/[^\w.\- ]+/g, '')
    .replace(/\s+/g, ' ')
    .replace(/^[.\s]+/, '')
    .trim()
    .slice(0, 80);

const useCols = () => {
  const get = () =>
    typeof window === 'undefined'
      ? 4
      : window.innerWidth < 640
        ? 2
        : window.innerWidth < 1100
          ? 3
          : 4;
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
  disabled,
}: {
  value: string;
  onChange: (v: string) => void;
  placeholder: string;
  className?: string;
  disabled?: boolean;
}) => (
  <input
    value={value}
    onChange={(e) => onChange(e.target.value)}
    placeholder={placeholder}
    aria-label={placeholder}
    disabled={disabled}
    className={`min-w-0 border-b border-[#C9C8C7]/15 bg-transparent py-2 font-mono text-[13px] text-[#C9C8C7] outline-none transition-colors placeholder:text-[#C9C8C7]/30 focus:border-[#dc2626] disabled:opacity-50 ${className}`}
  />
);

const Chip = ({
  children,
  onClick,
  hot,
}: {
  children: ReactNode;
  onClick: () => void;
  hot?: boolean;
}) => (
  <motion.button
    type="button"
    onClick={onClick}
    whileTap={{ scale: 0.94 }}
    className={`max-w-[14rem] truncate border px-3 py-1.5 font-mono text-[11px] uppercase tracking-[0.2em] transition-colors ${
      hot
        ? 'border-[#dc2626] bg-[#dc2626] text-black'
        : 'border-[#C9C8C7]/25 text-[#C9C8C7] hover:border-[#dc2626] hover:bg-[#dc2626] hover:text-black'
    }`}
  >
    {children}
  </motion.button>
);

const Room = ({ heat, onDim }: { heat: MotionValue<number>; onDim: (d: boolean) => void }) => {
  const [items, setItems] = useState<Item[]>([]);
  const [groups, setGroups] = useState<Group[]>([]);
  const [selected, setSelected] = useState<Set<string>>(() => new Set());
  const [newFolder, setNewFolder] = useState('');
  const [drag, setDrag] = useState(false);
  const [phase, setPhase] = useState<Phase>('idle');
  const [title, setTitle] = useState('');
  const [city, setCity] = useState('');
  const [placement, setPlacement] = useState<'top' | 'anywhere'>('anywhere');
  const [note, setNote] = useState('');
  const [detailsOpen, setDetailsOpen] = useState(false);
  const [requests, setRequests] = useState<api.ArtRequest[]>([]);
  const picker = useRef<HTMLInputElement>(null);
  const folderPicker = useRef<HTMLInputElement>(null);
  const groupsRef = useRef(groups);
  groupsRef.current = groups;
  const cols = useCols();
  const busy = phase === 'sending';
  const locked = busy || phase === 'sent';

  // ── draft: survive a refresh ──
  const restored = useRef(false);
  useEffect(() => {
    loadDraft().then((d) => {
      if (d?.items.length) {
        setGroups(d.groups);
        setItems(d.items.map((i) => ({ ...i, url: URL.createObjectURL(i.file), loaded: 0 })));
        setTitle(d.title);
        setCity(d.city);
        setPlacement(d.placement);
        setNote(d.note);
      }
      restored.current = true;
    });
  }, []);
  useEffect(() => {
    if (!restored.current || phase === 'sending') return;
    const t = setTimeout(() => {
      if (!items.length) clearDraft();
      else
        saveDraft({
          items: items.map(({ id, file, rot, group, label, note: n }) => ({ id, file, rot, group, label, note: n })),
          groups,
          title,
          city,
          placement,
          note,
        });
    }, 400);
    return () => clearTimeout(t);
  }, [items, groups, title, city, placement, note, phase]);

  const total = items.reduce((s, i) => s + i.file.size, 0);
  const loaded = items.reduce((s, i) => s + i.loaded, 0);
  const pct = useSpring(0, { stiffness: 60, damping: 20 });
  const pctText = useTransform(pct, (p) => String(Math.floor(p)).padStart(2, '0'));
  useEffect(() => pct.set(total ? (loaded / total) * 100 : 0), [loaded, total, pct]);

  const refresh = useCallback(
    () =>
      api
        .list()
        .then(setRequests)
        .catch(() => {}),
    []
  );
  useEffect(() => {
    refresh();
    const t = setInterval(() => document.visibilityState === 'visible' && refresh(), 20000);
    return () => clearInterval(t);
  }, [refresh]);

  useEffect(() => {
    folderPicker.current?.setAttribute('webkitdirectory', '');
  }, []);

  /** Files from a folder join the group of that name (made if new); loose files stay loose. */
  const add = useCallback(
    (incoming: Incoming[]) => {
      if (!incoming.length || busy) return;
      const gs = [...groupsRef.current];
      const groupFor = (folder: string) => {
        if (!folder) return null;
        let g = gs.find((x) => x.name.toLowerCase() === folder.toLowerCase());
        if (!g) gs.push((g = { id: uid(), name: folder, note: '' }));
        return g.id;
      };
      const next: Item[] = incoming.map(({ file, folder }) => ({
        id: `${file.name}-${file.size}-${uid()}`,
        file,
        url: URL.createObjectURL(file),
        rot: (Math.random() - 0.5) * 3,
        loaded: 0,
        group: groupFor(folder),
        label: '',
        note: '',
      }));
      setGroups(gs);
      setItems((cur) => [...cur, ...next]);
    },
    [busy]
  );

  // folders with nothing left in them disappear
  useEffect(() => {
    setGroups((gs) => {
      const kept = gs.filter((g) => items.some((i) => i.group === g.id));
      return kept.length === gs.length ? gs : kept;
    });
    setSelected((sel) => {
      const kept = new Set([...sel].filter((id) => items.some((i) => i.id === id)));
      return kept.size === sel.size ? sel : kept;
    });
  }, [items]);

  // whole window is the drop target — files or whole folders
  useEffect(() => {
    let depth = 0;
    const enter = (e: DragEvent) => {
      if (!e.dataTransfer?.types.includes('Files')) return;
      e.preventDefault();
      if (depth++ === 0) setDrag(true);
    };
    const leave = () => {
      if (--depth <= 0) {
        depth = 0;
        setDrag(false);
      }
    };
    const over = (e: DragEvent) => e.preventDefault();
    const drop = (e: DragEvent) => {
      e.preventDefault();
      depth = 1;
      leave();
      fromDrop(e.dataTransfer).then(add);
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
    };
  }, [add]);

  // esc lets go of the selection
  useEffect(() => {
    const k = (e: KeyboardEvent) => e.key === 'Escape' && setSelected(new Set());
    window.addEventListener('keydown', k);
    return () => window.removeEventListener('keydown', k);
  }, []);

  const remove = (id: string) =>
    setItems((cur) => {
      const it = cur.find((i) => i.id === id);
      if (it) URL.revokeObjectURL(it.url);
      return cur.filter((i) => i.id !== id);
    });

  const patchItem = (id: string, patch: Partial<Item>) =>
    setItems((cur) => cur.map((i) => (i.id === id ? { ...i, ...patch } : i)));
  const patchGroup = (id: string, patch: Partial<Group>) =>
    setGroups((cur) => cur.map((g) => (g.id === id ? { ...g, ...patch } : g)));

  const toggle = (id: string) =>
    setSelected((cur) => {
      const n = new Set(cur);
      if (!n.delete(id)) n.add(id);
      return n;
    });

  /** Put the selection into a folder (null = loose). */
  const moveTo = (group: string | null) => {
    setItems((cur) => cur.map((i) => (selected.has(i.id) ? { ...i, group } : i)));
    setSelected(new Set());
  };

  const makeFolder = () => {
    const name = newFolder.trim();
    const existing = groups.find((g) => name && g.name.toLowerCase() === name.toLowerCase());
    if (existing) return (moveTo(existing.id), setNewFolder(''));
    const g = { id: uid(), name, note: '' };
    setGroups((cur) => [...cur, g]);
    moveTo(g.id);
    setNewFolder('');
  };

  const ungroup = (id: string) =>
    setItems((cur) => cur.map((i) => (i.group === id ? { ...i, group: null } : i)));

  const send = async () => {
    if (!items.length || busy) return;
    setPhase('sending');
    setSelected(new Set());
    setItems((cur) => cur.map((i) => ({ ...i, loaded: 0 })));
    try {
      // each group gets its own folder in the drop; names kept unique
      const used = new Set<string>();
      const folderOf = new Map<string, string>();
      groups.forEach((g, n) => {
        const base = folderName(g.name) || `folder ${n + 1}`;
        let f = base;
        for (let k = 2; used.has(f.toLowerCase()); k++) f = `${base} ${k}`;
        used.add(f.toLowerCase());
        folderOf.set(g.id, f);
      });
      const folderFor = (i: Item) => (i.group ? (folderOf.get(i.group) ?? '') : '');

      const { id, uploads } = await api.start(
        items.map((i) => ({ file: i.file, folder: folderFor(i) }))
      );
      let next = 0;
      const worker = async () => {
        while (next < items.length) {
          const n = next++;
          const it = items[n];
          await api.put(uploads[n], it.file, (b) =>
            setItems((cur) => cur.map((c) => (c.id === it.id ? { ...c, loaded: b } : c)))
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
        files: uploads.map(({ url: _url, ...f }, n) => ({
          ...f,
          label: items[n].label.trim(),
          note: items[n].note.trim(),
        })),
        groups: groups
          .map((g) => ({ g, n: items.findIndex((i) => i.group === g.id) }))
          .filter(({ n }) => n >= 0)
          .map(({ g, n }) => ({
            folder: uploads[n].folder ?? '',
            name: g.name.trim(),
            note: g.note.trim(),
          })),
      });
      setRequests((r) => [req, ...r]);
      setPhase('sent');
      setTimeout(() => {
        items.forEach((i) => URL.revokeObjectURL(i.url));
        setItems([]);
        setGroups([]);
        setTitle('');
        setCity('');
        setNote('');
        setPlacement('anywhere');
        setPhase('idle');
        clearDraft();
      }, 1900);
    } catch {
      setPhase('error');
    }
  };

  useEffect(() => onDim(items.length > 0), [items.length, onDim]);

  const sections = [
    ...groups.map((g) => ({ g, list: items.filter((i) => i.group === g.id) })),
    { g: null, list: items.filter((i) => !i.group) },
  ].filter((s) => s.list.length);
  const selecting = selected.size > 0;
  const selGroups = new Set(items.filter((i) => selected.has(i.id)).map((i) => i.group));

  const AddTiles = () => (
    <motion.div layout className="flex justify-center pb-6 pt-10">
      <Add onFiles={() => picker.current?.click()} onFolder={() => folderPicker.current?.click()} />
    </motion.div>
  );

  return (
    <div className="relative z-10">
      <input
        ref={picker}
        type="file"
        multiple
        accept="video/*,image/*,.zip,.mov,.mp4,.heic"
        className="hidden"
        onChange={(e) => {
          add(fromList(e.target.files));
          e.target.value = '';
        }}
      />
      <input
        ref={folderPicker}
        type="file"
        multiple
        className="hidden"
        onChange={(e) => {
          add(fromList(e.target.files));
          e.target.value = '';
        }}
      />

      {/* empty: the word is the button */}
      <AnimatePresence mode="wait">
        {!items.length ? (
          <motion.div
            key="empty"
            exit={{
              opacity: 0,
              scale: 0.94,
              filter: 'blur(14px)',
              transition: { duration: 0.45, ease: EASE },
            }}
            className="relative"
          >
<DropWord onFiles={() => picker.current?.click()} onFolder={() => folderPicker.current?.click()} />

          </motion.div>
        ) : (
          <motion.div
            key="grid"
            className="px-3 pb-80 pt-10 md:px-6 md:pb-64 md:pt-12"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
          >
            {sections.map(({ g, list }, si) => {
              const columns = Array.from({ length: cols }, (_, c) =>
                list.filter((_, i) => i % cols === c)
              );
              return (
                <motion.section
                  key={g?.id ?? 'loose'}
                  layout
                  className={si ? 'mt-14 md:mt-20' : ''}
                >
                  {g ? (
                    <div className="mb-4 flex flex-wrap items-end gap-x-6 gap-y-1 border-b border-[#C9C8C7]/10 pb-3">
                      <input
                        value={g.name}
                        onChange={(e) => patchGroup(g.id, { name: e.target.value })}
                        disabled={locked}
                        placeholder="folder name"
                        aria-label="folder name"
                        className="min-w-0 flex-1 basis-[14rem] bg-transparent font-logo text-4xl uppercase leading-none tracking-tight text-[#C9C8C7] outline-none placeholder:text-[#C9C8C7]/25 md:text-6xl"
                      />
                      <span className="pb-1 font-mono text-[11px] tabular-nums text-[#C9C8C7]/35">
                        {String(list.length).padStart(2, '0')}
                      </span>
                      <Field
                        value={g.note}
                        onChange={(v) => patchGroup(g.id, { note: v })}
                        disabled={locked}
                        placeholder="instructions — this folder"
                        className="flex-[2] basis-[16rem]"
                      />
                      {!locked && (
                        <button
                          type="button"
                          onClick={() => ungroup(g.id)}
                          className="pb-2 font-mono text-[11px] uppercase tracking-[0.2em] text-[#C9C8C7]/30 transition-colors hover:text-[#dc2626]"
                        >
                          unfolder
                        </button>
                      )}
                    </div>
                  ) : (
                    groups.length > 0 && (
                      <div className="mb-4 flex items-end gap-6 border-b border-[#C9C8C7]/10 pb-3 font-mono text-[11px] uppercase tracking-[0.2em] text-[#C9C8C7]/40">
                        <span>loose</span>
                        <span className="tabular-nums text-[#C9C8C7]/25">
                          {String(list.length).padStart(2, '0')}
                        </span>
                        <span className="ml-auto hidden normal-case tracking-normal text-[#C9C8C7]/25 md:inline">
                          select some to put them in a folder
                        </span>
                      </div>
                    )
                  )}
                  <div className="flex gap-3 md:gap-4">
                    {columns.map((col, c) => (
                      <div
                        key={c}
                        className="min-w-0 flex-1"
                        style={{ marginTop: c % 2 ? '2.5rem' : 0 }}
                      >
                        <AnimatePresence mode="popLayout">
                          {col.map((it) => (
                            <Tile
                              key={it.id}
                              item={it}
                              index={items.indexOf(it)}
                              busy={locked}
                              selected={selected.has(it.id)}
                              selecting={selecting}
                              inherit={g?.name ?? ''}
                              onRemove={() => remove(it.id)}
                              onSelect={() => toggle(it.id)}
                              onChange={(p) => patchItem(it.id, p)}
                            />
                          ))}
                        </AnimatePresence>
                      </div>
                    ))}
                  </div>
                </motion.section>
              );
            })}
            {!locked && <AddTiles />}
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
            <Glitch text="DROP" heat={STILL} className="text-[31vw] md:text-[24vw]" />
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
              ) : selecting ? (
                <motion.div
                  key="sel"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  className="flex flex-wrap items-end gap-x-6 gap-y-3"
                >
                  <span className="font-logo text-5xl leading-[0.8] tabular-nums text-[#dc2626]">
                    {String(selected.size).padStart(2, '0')}
                  </span>
                  <form
                    className="flex min-w-[15rem] flex-1 items-end gap-3"
                    onSubmit={(e) => {
                      e.preventDefault();
                      makeFolder();
                    }}
                  >
                    <Field
                      value={newFolder}
                      onChange={setNewFolder}
                      placeholder="folder name"
                      className="flex-1"
                    />
                    <button
                      type="submit"
                      className="whitespace-nowrap bg-[#C9C8C7] px-4 py-2 font-mono text-[11px] uppercase tracking-[0.2em] text-black transition-colors hover:bg-[#dc2626]"
                    >
                      make folder
                    </button>
                  </form>
                  {(groups.length > 0 || !selGroups.has(null)) && (
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="pr-1 font-mono text-[11px] uppercase tracking-[0.2em] text-[#C9C8C7]/35">
                        move to
                      </span>
                      {groups.map((g, n) => (
                        <Chip key={g.id} onClick={() => moveTo(g.id)}>
                          {g.name || `folder ${n + 1}`}
                        </Chip>
                      ))}
                      {[...selGroups].some(Boolean) && (
                        <Chip onClick={() => moveTo(null)}>loose</Chip>
                      )}
                    </div>
                  )}
                  <button
                    type="button"
                    onClick={() => setSelected(new Set())}
                    className="pb-2 font-mono text-[11px] uppercase tracking-[0.2em] text-[#C9C8C7]/40 transition-colors hover:text-[#C9C8C7]"
                  >
                    done
                  </button>
                </motion.div>
              ) : (
                <motion.div
                  key="dock"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  className="flex items-center gap-4"
                >
                  <span className="font-logo text-4xl leading-none tabular-nums text-[#C9C8C7]">
                    {String(items.length).padStart(2, '0')}
                  </span>
                  <button
                    type="button"
                    onClick={() => setDetailsOpen(true)}
                    className="min-w-0 flex-1 truncate text-left font-mono text-[12px] uppercase tracking-[0.15em] text-[#C9C8C7]/50 transition-colors hover:text-[#C9C8C7]"
                  >
                    {title ? `${title}${city ? ` · ${city}` : ''}` : 'no title yet'}
                  </button>
                  <motion.button
                    type="button"
                    onClick={() => setDetailsOpen(true)}
                    whileHover={{ scale: 1.03 }}
                    whileTap={{ scale: 0.95 }}
                    className="rounded-full bg-[#C9C8C7] px-7 py-3 font-logo text-lg uppercase tracking-tight text-black hover:bg-white"
                  >
                    {phase === 'error' ? 'retry' : 'details →'}
                  </motion.button>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.section>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {detailsOpen && !busy && (
          <DetailsModal
            value={{ title, city, placement, note }}
            onChange={(d) => {
              if (d.title !== undefined) setTitle(d.title);
              if (d.city !== undefined) setCity(d.city);
              if (d.placement !== undefined) setPlacement(d.placement);
              if (d.note !== undefined) setNote(d.note);
            }}
            count={items.length}
            error={phase === 'error'}
            onClose={() => setDetailsOpen(false)}
            onSend={() => {
              setDetailsOpen(false);
              send();
            }}
          />
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
            <motion.div
              initial={{ scale: 1.5 }}
              animate={{ scale: 1 }}
              transition={{ type: 'spring', stiffness: 300, damping: 16 }}
            >
              <Glitch text="SENT" heat={heat} className="text-[30vw] md:text-[22vw]" />
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {!items.length && (
        <Queue
          requests={requests}
          onChange={(r) => setRequests((cur) => cur.map((c) => (c.id === r.id ? r : c)))}
        />
      )}
    </div>
  );
};

// ─── page ──────────────────────────────────────────────────────────────────

export const ArtPage = () => {
  useMetaTags({ title: 'art', description: '', noindex: true });
  const { heat, field } = usePointerHeat();
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
      () => sess.set(TOKEN, '')
    );
  }, []);

  const onOpen = async (via: 'key' | 'bio') => {
    setOpen(true);
    if (via === 'key' && !local.get(BIO) && !local.get(BIO_NO) && (await api.canPasskey()))
      setOfferBio(true);
  };

  return (
    <MotionConfig reducedMotion="user">
      <div className="relative min-h-[100svh] overflow-x-hidden bg-black text-[#C9C8C7] selection:bg-[#dc2626] selection:text-black">
        <Backdrop field={field} intensity={dim ? 0.3 : open ? 0.8 : 1} />
        <AnimatePresence mode="wait">
          {open ? (
            <Shutter k="room">
              <Room heat={heat} onDim={setDim} />
            </Shutter>
          ) : (
            <Shutter k="lock">
              <Lock heat={heat} onOpen={onOpen} />
            </Shutter>
          )}
        </AnimatePresence>
        <AnimatePresence>
          {offerBio && <SaveBio onDone={() => setOfferBio(false)} />}
        </AnimatePresence>
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
