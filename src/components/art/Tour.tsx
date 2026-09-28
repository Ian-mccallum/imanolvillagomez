import { useEffect, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const EASE = [0.22, 1, 0.36, 1] as const;

// ─── welcome: a CRT switching on ───────────────────────────────────────────

/** Animated TV static on a canvas — cheap: small buffer, scaled up. */
const Static = ({ opacity }: { opacity: number }) => {
  const ref = useRef<HTMLCanvasElement>(null);
  useEffect(() => {
    const cv = ref.current!;
    const x = cv.getContext('2d')!;
    const w = (cv.width = 160);
    const h = (cv.height = 100);
    const img = x.createImageData(w, h);
    let raf = 0;
    const frame = () => {
      for (let i = 0; i < img.data.length; i += 4) {
        const v = (Math.random() * 255) | 0;
        img.data[i] = img.data[i + 1] = img.data[i + 2] = v;
        img.data[i + 3] = 255;
      }
      x.putImageData(img, 0, 0);
      raf = requestAnimationFrame(frame);
    };
    raf = requestAnimationFrame(frame);
    return () => cancelAnimationFrame(raf);
  }, []);
  return (
    <canvas
      ref={ref}
      aria-hidden
      className="pointer-events-none absolute inset-0 h-full w-full [image-rendering:pixelated]"
      style={{ opacity }}
    />
  );
};

/** Big type with an RGB split that twitches like a bad signal. */
const Signal = ({ children, className = '' }: { children: string; className?: string }) => (
  <span className={`relative inline-block ${className}`}>
    <motion.span
      aria-hidden
      className="absolute inset-0 text-[#dc2626] mix-blend-screen"
      animate={{ x: [0, -6, 2, -3, 0, 0, 0, -10, 0], opacity: [0.8, 1, 0.6, 1, 0.8, 0.8, 0.8, 1, 0.8] }}
      transition={{ duration: 2.4, repeat: Infinity, times: [0, 0.05, 0.1, 0.15, 0.2, 0.6, 0.8, 0.82, 0.86] }}
    >
      {children}
    </motion.span>
    <motion.span
      aria-hidden
      className="absolute inset-0 text-[#38bdf8] mix-blend-screen"
      animate={{ x: [0, 5, -2, 3, 0, 0, 0, 8, 0], opacity: [0.6, 0.9, 0.5, 0.9, 0.6, 0.6, 0.6, 0.9, 0.6] }}
      transition={{ duration: 2.4, repeat: Infinity, times: [0, 0.05, 0.1, 0.15, 0.2, 0.6, 0.8, 0.82, 0.86] }}
    >
      {children}
    </motion.span>
    <motion.span
      className="relative"
      animate={{ skewX: [0, 0, 8, -4, 0, 0], x: [0, 0, 4, -2, 0, 0] }}
      transition={{ duration: 3.1, repeat: Infinity, times: [0, 0.7, 0.72, 0.74, 0.76, 1] }}
    >
      {children}
    </motion.span>
  </span>
);

export const Welcome = ({ onStart, onSkip }: { onStart: () => void; onSkip: () => void }) => {
  // off → line → on → ready
  const [stage, setStage] = useState<'line' | 'on' | 'ready'>('line');
  useEffect(() => {
    const a = setTimeout(() => setStage('on'), 550);
    const b = setTimeout(() => setStage('ready'), 1900);
    return () => {
      clearTimeout(a);
      clearTimeout(b);
    };
  }, []);

  return (
    <motion.div
      className="fixed inset-0 z-[80] flex items-center justify-center overflow-hidden bg-black"
      exit={{ opacity: 0, transition: { duration: 0.5 } }}
    >
      {/* the tube: collapses to a line, then blooms open */}
      <motion.div
        className="absolute inset-0 flex items-center justify-center bg-[#0c0c0c]"
        initial={{ clipPath: 'inset(50% 50% 50% 50%)', filter: 'brightness(4)' }}
        animate={
          stage === 'line'
            ? { clipPath: 'inset(49.6% 0% 49.6% 0%)', filter: 'brightness(4)' }
            : { clipPath: 'inset(0% 0% 0% 0%)', filter: 'brightness(1)' }
        }
        exit={{ clipPath: 'inset(49.6% 0% 49.6% 0%)', filter: 'brightness(3)', transition: { duration: 0.35, ease: 'easeIn' } }}
        transition={{ duration: stage === 'line' ? 0.45 : 0.55, ease: EASE }}
      >
        <Static opacity={stage === 'ready' ? 0.06 : stage === 'on' ? 0.45 : 1} />

        {/* scanlines + a rolling bar */}
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 opacity-40"
          style={{ backgroundImage: 'repeating-linear-gradient(0deg, rgba(0,0,0,.55) 0 1px, transparent 1px 3px)' }}
        />
        <motion.div
          aria-hidden
          className="pointer-events-none absolute inset-x-0 h-[18vh] bg-gradient-to-b from-transparent via-white/[0.06] to-transparent"
          animate={{ top: ['-20%', '110%'] }}
          transition={{ duration: 3.8, repeat: Infinity, ease: 'linear' }}
        />
        {/* vignette like curved glass */}
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0"
          style={{ background: 'radial-gradient(ellipse at center, transparent 45%, rgba(0,0,0,.85) 100%)' }}
        />

        <div className="relative px-6 text-center">
          <AnimatePresence>
            {stage !== 'line' && (
              <motion.div
                initial={{ opacity: 0, scale: 1.08, filter: 'blur(12px)' }}
                animate={{ opacity: 1, scale: 1, filter: 'blur(0px)' }}
                transition={{ duration: 0.8, ease: EASE }}
              >
                <p className="mb-4 font-mono text-[11px] uppercase tracking-[0.5em] text-[#C9C8C7]/50">welcome to the</p>
                <h1 className="font-logo text-[22vw] uppercase leading-[0.8] tracking-[-0.05em] text-[#C9C8C7] md:text-[15vw]">
                  <Signal>STUDIO</Signal>
                </h1>
              </motion.div>
            )}
          </AnimatePresence>

          <AnimatePresence>
            {stage === 'ready' && (
              <motion.div
                className="mt-12 flex flex-col items-center gap-5"
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, ease: EASE }}
              >
                <p className="max-w-sm font-mono text-[13px] leading-relaxed text-[#C9C8C7]/60">
                  The newest way to add content to imanolvillagomez.com
                </p>
                <motion.button
                  type="button"
                  autoFocus
                  onClick={onStart}
                  whileHover={{ scale: 1.04 }}
                  whileTap={{ scale: 0.96 }}
                  className="rounded-full bg-[#C9C8C7] px-9 py-4 font-logo text-xl uppercase tracking-tight text-black shadow-[0_0_60px_rgba(201,200,199,.25)] outline-none hover:bg-white focus-visible:ring-2 focus-visible:ring-[#dc2626] focus-visible:ring-offset-4 focus-visible:ring-offset-black"
                >
                  show me
                </motion.button>
                <button
                  type="button"
                  onClick={onSkip}
                  className="font-mono text-[11px] uppercase tracking-[0.25em] text-[#C9C8C7]/35 transition-colors hover:text-[#C9C8C7]"
                >
                  skip
                </button>
                <p className="mt-6 font-mono text-[10px] uppercase tracking-[0.4em] text-[#C9C8C7]/30">
                  built by IM for IV
                </p>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </motion.div>
    </motion.div>
  );
};

// ─── coach: one step at a time, advanced by doing ─────────────────────────

export interface Step {
  title: string;
  body: string;
  /** a button that does the step's action for you (e.g. load samples) */
  action?: { label: string; run: () => void };
  /** steps with no real-world trigger advance on "next" */
  next?: boolean;
}

export const Coach = ({
  steps,
  step,
  onNext,
  onSkip,
  onFinish,
}: {
  steps: Step[];
  step: number;
  onNext: () => void;
  onSkip: () => void;
  onFinish: () => void;
}) => {
  const s = steps[step];
  const last = step === steps.length - 1;
  return (
    <motion.div
      initial={{ y: -40, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      exit={{ y: -40, opacity: 0 }}
      transition={{ type: 'spring', stiffness: 260, damping: 26 }}
      className="fixed inset-x-3 top-3 z-[70] mx-auto max-w-md md:top-5"
      role="status"
      aria-live="polite"
    >
      <div className="overflow-hidden rounded-2xl border border-[#C9C8C7]/15 bg-[#0b0b0b]/95 shadow-[0_24px_80px_rgba(0,0,0,.75)] backdrop-blur-xl">
        {/* progress */}
        <div className="flex gap-1 px-4 pt-4">
          {steps.map((_, i) => (
            <div key={i} className="h-[3px] flex-1 overflow-hidden rounded-full bg-[#C9C8C7]/10">
              <motion.div
                className="h-full bg-[#dc2626]"
                initial={false}
                animate={{ width: i < step ? '100%' : i === step ? '45%' : '0%' }}
                transition={{ duration: 0.5, ease: EASE }}
              />
            </div>
          ))}
        </div>
        <AnimatePresence mode="wait">
          <motion.div
            key={step}
            initial={{ opacity: 0, x: 24 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -24 }}
            transition={{ duration: 0.3, ease: EASE }}
            className="px-5 pb-4 pt-4"
          >
            <div className="mb-1 flex items-baseline justify-between">
              <h2 className="font-logo text-2xl uppercase leading-none tracking-tight text-[#C9C8C7]">{s.title}</h2>
              <span className="font-mono text-[10px] tabular-nums text-[#C9C8C7]/35">
                {String(step + 1).padStart(2, '0')}/{String(steps.length).padStart(2, '0')}
              </span>
            </div>
            <p className="font-mono text-[12.5px] leading-relaxed text-[#C9C8C7]/70">{s.body}</p>
            <div className="mt-4 flex items-center gap-3">
              {s.action && (
                <motion.button
                  type="button"
                  whileTap={{ scale: 0.95 }}
                  onClick={s.action.run}
                  className="rounded-full border border-[#C9C8C7]/25 px-4 py-2 font-mono text-[11px] uppercase tracking-[0.2em] text-[#C9C8C7] transition-colors hover:bg-[#C9C8C7] hover:text-black"
                >
                  {s.action.label}
                </motion.button>
              )}
              {(s.next || last) && (
                <motion.button
                  type="button"
                  whileTap={{ scale: 0.95 }}
                  onClick={last ? onFinish : onNext}
                  className="rounded-full bg-[#C9C8C7] px-5 py-2 font-mono text-[11px] uppercase tracking-[0.2em] text-black hover:bg-white"
                >
                  {last ? "let's go" : 'next'}
                </motion.button>
              )}
              {!last && (
                <button
                  type="button"
                  onClick={onSkip}
                  className="ml-auto font-mono text-[10px] uppercase tracking-[0.25em] text-[#C9C8C7]/35 transition-colors hover:text-[#C9C8C7]"
                >
                  skip tour
                </button>
              )}
            </div>
          </motion.div>
        </AnimatePresence>
      </div>
    </motion.div>
  );
};
