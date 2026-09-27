import { useRef, useState } from 'react';
import { motion, useMotionValueEvent, useTransform, type MotionValue } from 'framer-motion';

const EASE = [0.22, 1, 0.36, 1] as const;
const GLYPHS = 'IMANOLVILLAGOMEZ';

const scramble = (t: string, odds: number) =>
  [...t]
    .map((c) =>
      c !== ' ' && Math.random() < odds ? GLYPHS[(Math.random() * GLYPHS.length) | 0] : c
    )
    .join('');

interface Slice {
  top: number;
  bottom: number;
  x: number;
  red: boolean;
}

const slices = (h: number): Slice[] =>
  Array.from({ length: h > 0.8 ? 4 : h > 0.55 ? 3 : 2 }, () => {
    const top = Math.random() * 85;
    return {
      top,
      bottom: Math.max(0, 100 - top - (4 + Math.random() * 18)),
      x: (Math.random() - 0.5) * h * 0.28,
      red: Math.random() < 0.4,
    };
  });

/**
 * Oversized wordmark that tears apart as `heat` rises (0 → 1). At rest it's
 * clean ink — no color. Moving the cursor splits out a red channel and an
 * outline ghost; moving it fast slices the word into shifted bands and
 * scrambles the letters.
 */
export const Glitch = ({
  text,
  heat,
  className = '',
  delay = 0,
}: {
  text: string;
  heat: MotionValue<number>;
  className?: string;
  delay?: number;
}) => {
  const jolt = () => (Math.random() - 0.5) * 2;
  const xRed = useTransform(heat, (h) => `${h * -0.07 + (h > 0.6 ? jolt() * h * 0.03 : 0)}em`);
  const xGhost = useTransform(heat, (h) => `${h * 0.06 + (h > 0.6 ? jolt() * h * 0.025 : 0)}em`);
  const skew = useTransform(heat, (h) => h * -7 * (h > 0.7 && Math.random() < 0.3 ? -1 : 1));
  const x = useTransform(heat, (h) => `${h > 0.75 ? jolt() * (h - 0.75) * 0.08 : 0}em`);
  const y = useTransform(heat, (h) => `${h > 0.4 ? jolt() * h * 0.035 : 0}em`);
  const clip = useTransform(heat, (h) =>
    h > 0.3
      ? `inset(${20 + Math.random() * 40 * h}% 0 ${Math.random() * 45 * h}% 0)`
      : 'inset(0 0 0 0)'
  );
  const [shown, setShown] = useState(text);
  const [cuts, setCuts] = useState<Slice[]>([]);
  const lastCut = useRef(0);

  useMotionValueEvent(heat, 'change', (h) => {
    // cooling down always lands, so nothing stays torn once the cursor stops
    if (h < 0.3) {
      setCuts((c) => (c.length ? [] : c));
      setShown((s) => (s === text ? s : text));
      return;
    }
    const now = performance.now();
    if (now - lastCut.current < 45) return;
    lastCut.current = now;
    setCuts(slices(h));
    if (Math.random() < 0.15 + h * 0.5) setShown(scramble(text, 0.15 + h * 0.45));
  });

  return (
    <motion.span
      aria-label={text}
      style={{ skewX: skew, x, y }}
      className={`relative inline-block select-none font-logo leading-[0.78] tracking-[-0.05em] ${className}`}
    >
      <motion.span
        aria-hidden
        style={{ x: xRed, opacity: heat }}
        className="absolute inset-0 text-[#dc2626]"
      >
        {text}
      </motion.span>
      <motion.span
        aria-hidden
        style={{ x: xGhost, opacity: heat, clipPath: clip, WebkitTextStroke: '1px #C9C8C7' }}
        className="absolute inset-0 text-transparent"
      >
        {text}
      </motion.span>
      <span aria-hidden className="relative inline-flex overflow-hidden pb-[0.04em]">
        {[...shown].map((c, i) => (
          <motion.span
            key={i}
            className="inline-block"
            initial={{ y: '105%' }}
            animate={{ y: '0%' }}
            exit={{ y: '-105%' }}
            transition={{ duration: 0.9, ease: EASE, delay: delay + i * 0.06 }}
          >
            {c === ' ' ? ' ' : c}
          </motion.span>
        ))}
      </span>
      {/* torn bands — only exist while the cursor is moving fast */}
      {cuts.map((s, i) => (
        <span
          key={i}
          aria-hidden
          className={`absolute inset-0 bg-black ${s.red ? 'text-[#dc2626]' : 'text-[#C9C8C7]'}`}
          style={{
            clipPath: `inset(${s.top}% 0 ${s.bottom}% 0)`,
            transform: `translateX(${s.x}em)`,
          }}
        >
          {shown}
        </span>
      ))}
    </motion.span>
  );
};
