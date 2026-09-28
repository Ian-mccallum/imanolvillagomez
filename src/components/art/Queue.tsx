import { useRef, useState } from 'react';
import { motion, AnimatePresence, animate, useMotionValue, useTransform } from 'framer-motion';
import { approve, reply, type ArtRequest, type ArtStatus } from './artApi';

const EASE = [0.22, 1, 0.36, 1] as const;

const LABEL: Record<ArtStatus, string> = {
  pending: 'queued',
  working: 'working',
  question: 'question',
  preview: 'preview',
  approved: 'shipping',
  live: 'live',
  failed: 'failed',
};

const date = (iso: string) => {
  const d = new Date(iso);
  return `${String(d.getMonth() + 1).padStart(2, '0')}.${String(d.getDate()).padStart(2, '0')}`;
};

/**
 * Press-and-hold to confirm. Fills red over 1.1s; letting go drains it.
 *
 * The pointer is captured on press, so drifting off the button (or the button
 * shrinking under the finger) doesn't cancel the hold — only lifting does. A
 * quick tap shakes and says "keep holding" instead of silently doing nothing,
 * and long-press menus (iOS callout, right-click) are suppressed.
 */
const Hold = ({ onConfirm, children }: { onConfirm: () => void; children: string }) => {
  const p = useMotionValue(0);
  const scale = useTransform(p, [0, 1], [0, 1]);
  const x = useMotionValue(0);
  const ctrl = useRef<ReturnType<typeof animate> | null>(null);
  const done = useRef(false);
  const [hint, setHint] = useState(false);
  const [holding, setHolding] = useState(false);

  const go = () => {
    if (done.current) return;
    setHolding(true);
    setHint(false);
    ctrl.current?.stop();
    ctrl.current = animate(p, 1, {
      duration: 1.1 * (1 - p.get()),
      ease: 'linear',
      onComplete: () => {
        done.current = true;
        setHolding(false);
        navigator.vibrate?.(30);
        onConfirm();
      },
    });
  };
  const stop = () => {
    setHolding(false);
    if (done.current || p.get() >= 1) return;
    const early = p.get() < 0.6;
    ctrl.current?.stop();
    ctrl.current = animate(p, 0, { duration: 0.35, ease: EASE });
    if (early) {
      setHint(true);
      animate(x, [0, -6, 6, -4, 4, 0], { duration: 0.35 });
    }
  };

  return (
    <span className="inline-flex flex-col items-start gap-1.5">
      <motion.button
        type="button"
        style={{ x, WebkitTouchCallout: 'none' }}
        onPointerDown={(e) => {
          if (e.button !== 0) return;
          try {
            e.currentTarget.setPointerCapture(e.pointerId);
          } catch {
            /* some pointers can't be captured — the hold still works */
          }
          go();
        }}
        onPointerUp={stop}
        onPointerCancel={stop}
        onContextMenu={(e) => e.preventDefault()}
        onKeyDown={(e) => (e.key === ' ' || e.key === 'Enter') && !e.repeat && (e.preventDefault(), go())}
        onKeyUp={(e) => (e.key === ' ' || e.key === 'Enter') && stop()}
        animate={{ scale: holding ? 0.97 : 1 }}
        className="relative touch-none select-none overflow-hidden rounded-full border border-[#C9C8C7]/30 px-5 py-2.5 font-mono text-[11px] uppercase tracking-[0.2em] text-[#C9C8C7] transition-colors hover:border-[#C9C8C7]/60"
      >
        <motion.span aria-hidden style={{ scaleX: scale }} className="absolute inset-0 origin-left bg-[#dc2626]" />
        <span className="relative">{children}</span>
      </motion.button>
      <AnimatePresence>
        {hint && (
          <motion.span
            initial={{ opacity: 0, y: -4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="pl-2 font-mono text-[10px] uppercase tracking-[0.2em] text-[#dc2626]"
          >
            keep holding
          </motion.span>
        )}
      </AnimatePresence>
    </span>
  );
};

const Status = ({ s }: { s: ArtStatus }) => {
  const label = LABEL[s];
  if (s === 'working' || s === 'approved')
    return (
      <span className="relative font-mono text-[11px] uppercase tracking-[0.2em] text-[#C9C8C7]/40">
        {label}
        <motion.span
          aria-hidden
          className="absolute inset-0 bg-[linear-gradient(90deg,transparent,#C9C8C7,transparent)] bg-[length:50%_100%] bg-no-repeat bg-clip-text text-transparent"
          animate={{ backgroundPositionX: ['-100%', '200%'] }}
          transition={{ duration: 1.6, repeat: Infinity, ease: 'linear' }}
        >
          {label}
        </motion.span>
      </span>
    );
  return (
    <span className="flex items-center gap-2 font-mono text-[11px] uppercase tracking-[0.2em]">
      <motion.span
        aria-hidden
        className={`h-1.5 w-1.5 ${s === 'question' || s === 'failed' ? 'bg-[#dc2626]' : 'bg-[#C9C8C7]'}`}
        animate={s === 'pending' || s === 'question' ? { opacity: [1, 0.15, 1] } : { opacity: s === 'live' ? 1 : 0.5 }}
        transition={s === 'pending' || s === 'question' ? { duration: 1.2, repeat: Infinity } : undefined}
      />
      <span className={s === 'question' || s === 'failed' ? 'text-[#dc2626]' : 'text-[#C9C8C7]/70'}>{label}</span>
    </span>
  );
};

/**
 * The preview, as a real button: a real one opens the Vercel preview. A practice drop
 * gets the same button crossed out with a TEST tag, so the tour shows what a
 * preview looks like without pretending one exists.
 */
const PreviewLink = ({ r }: { r: ArtRequest }) => {
  const test = r.id.startsWith('practice-');
  const url = r.previewUrl;
  if (!test && !url) return null;
  const sub = test ? 'no preview for a practice drop' : 'the site, with this drop on it';
  const body = (
    <>
      <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[#C9C8C7]/10 text-base">
        {test ? '×' : '↗'}
      </span>
      <span className="min-w-0 text-left">
        <span className={`block font-logo text-base uppercase leading-none tracking-tight ${test ? 'line-through decoration-[#dc2626] decoration-2' : ''}`}>
          view preview
        </span>
        <span className="mt-1 block truncate font-mono text-[10px] text-[#C9C8C7]/40">{sub}</span>
      </span>
      {test && (
        <span className="ml-1 rounded-full border border-[#dc2626]/60 px-2 py-0.5 font-mono text-[9px] uppercase tracking-[0.2em] text-[#dc2626]">
          test
        </span>
      )}
    </>
  );
  const cls =
    'group flex max-w-full items-center gap-3 rounded-2xl border border-[#C9C8C7]/15 py-2 pl-2 pr-4 text-[#C9C8C7] transition-colors';
  return test ? (
    <div aria-disabled title="Practice drops don't get a preview" className={`${cls} cursor-not-allowed opacity-70`}>
      {body}
    </div>
  ) : (
    <motion.a
      href={url}
      target="_blank"
      rel="noreferrer"
      whileHover={{ y: -2 }}
      whileTap={{ scale: 0.97 }}
      className={`${cls} hover:border-[#C9C8C7]/40 hover:bg-[#C9C8C7]/[0.04]`}
    >
      {body}
    </motion.a>
  );
};

const Row = ({ r, i, onChange }: { r: ArtRequest; i: number; onChange: (r: ArtRequest) => void }) => {
  const [text, setText] = useState('');
  const [busy, setBusy] = useState(false);
  const open = r.status === 'question' || r.status === 'preview' || r.status === 'failed';

  const send = async () => {
    if (!text.trim() || busy) return;
    setBusy(true);
    try {
      onChange(r.id.startsWith('practice-') ? { ...r, status: 'pending' } : await reply(r.id, text));
      setText('');
    } finally {
      setBusy(false);
    }
  };

  return (
    <motion.li
      layout
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.7, ease: EASE, delay: i * 0.05 }}
      className="border-t border-[#C9C8C7]/10 py-4"
    >
      <div className="flex items-baseline gap-4">
        <span className="w-10 shrink-0 font-mono text-[11px] tabular-nums text-[#C9C8C7]/35">{date(r.createdAt)}</span>
        <span className="min-w-0 flex-1 truncate font-logo text-lg uppercase leading-none tracking-tight text-[#C9C8C7] md:text-2xl">
          {r.title || r.groups?.map((g) => g.name).filter(Boolean).join(' · ') || r.files[0]?.name || r.id}
        </span>
        <span className="hidden font-mono text-[11px] tabular-nums text-[#C9C8C7]/35 sm:inline">{r.files.length}</span>
        <Status s={r.status} />
      </div>

      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.5, ease: EASE }}
            className="overflow-hidden pl-14"
          >
            <div className="pt-3">
              {r.status === 'question' && (
                <>
                  <ol className="space-y-1.5 font-mono text-[13px] leading-relaxed text-[#C9C8C7]">
                    {(r.questions ?? []).map((q, qi) => (
                      <li key={qi} className="flex gap-3">
                        <span className="text-[#dc2626]">?</span>
                        <span>{q}</span>
                      </li>
                    ))}
                  </ol>
                  <div className="mt-3 flex items-end gap-3">
                    <textarea
                      value={text}
                      onChange={(e) => setText(e.target.value)}
                      onKeyDown={(e) => e.key === 'Enter' && (e.metaKey || e.ctrlKey) && send()}
                      rows={2}
                      className="min-w-0 flex-1 resize-none border-b border-[#C9C8C7]/20 bg-transparent py-1 font-mono text-[13px] text-[#C9C8C7] outline-none transition-colors placeholder:text-[#C9C8C7]/25 focus:border-[#dc2626]"
                      placeholder="answer"
                    />
                    <button
                      type="button"
                      onClick={send}
                      disabled={!text.trim() || busy}
                      className="font-mono text-[11px] uppercase tracking-[0.2em] text-[#C9C8C7] transition-opacity disabled:opacity-25"
                    >
                      {busy ? '…' : 'send'}
                    </button>
                  </div>
                </>
              )}
              {r.status === 'preview' && (
                <div className="flex flex-wrap items-center gap-x-5 gap-y-3">
                  {r.summary && <p className="w-full font-mono text-[13px] text-[#C9C8C7]/60">{r.summary}</p>}
                  <PreviewLink r={r} />
                  <Hold
                    onConfirm={async () =>
                      onChange(r.id.startsWith('practice-') ? { ...r, status: 'live' } : await approve(r.id))
                    }
                  >
                    hold to ship
                  </Hold>
                </div>
              )}
              {r.status === 'failed' && r.error && (
                <p className="font-mono text-[13px] text-[#dc2626]/80">{r.error}</p>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.li>
  );
};

/**
 * The log of drops. Sits on its own solid panel so it reads cleanly over the
 * backdrop — no glitch in here, this is the part you actually read.
 */
export const Queue = ({ requests, onChange }: { requests: ArtRequest[]; onChange: (r: ArtRequest) => void }) =>
  requests.length ? (
    <section className="relative z-20 mx-auto w-full max-w-4xl px-3 pb-40 pt-16 md:px-8">
      <motion.div
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, ease: EASE, delay: 0.3 }}
        className="rounded-2xl border border-[#C9C8C7]/10 bg-[#0a0a0a]/95 px-5 py-2 shadow-[0_30px_80px_rgba(0,0,0,.7)] backdrop-blur-2xl md:px-8"
      >
        <header className="flex items-baseline justify-between pb-2 pt-5 font-mono text-[11px] uppercase tracking-[0.25em] text-[#C9C8C7]/40">
          <span>drops</span>
          <span className="tabular-nums">{String(requests.length).padStart(2, '0')}</span>
        </header>
        <ul className="[&>li:first-child]:border-t-[#C9C8C7]/15">
          {requests.map((r, i) => (
            <Row key={r.id} r={r} i={i} onChange={onChange} />
          ))}
        </ul>
      </motion.div>
    </section>
  ) : null;
