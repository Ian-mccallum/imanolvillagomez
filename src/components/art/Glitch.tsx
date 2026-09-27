import { useState } from 'react';
import { motion, useMotionValueEvent, useTransform, type MotionValue } from 'framer-motion';

const EASE = [0.22, 1, 0.36, 1] as const;
const GLYPHS = 'IMANOLVILLAGOMEZ';

const scramble = (t: string) =>
  [...t].map((c) => (c !== ' ' && Math.random() < 0.4 ? GLYPHS[(Math.random() * GLYPHS.length) | 0] : c)).join('');

/**
 * Oversized wordmark that splits into a red channel and an outline ghost as
 * `heat` rises (0 → 1). At rest it's clean; motion is what breaks it.
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
  const xRed = useTransform(heat, (h) => `${h * -0.035}em`);
  const xGhost = useTransform(heat, (h) => `${h * 0.03}em`);
  const skew = useTransform(heat, (h) => h * -4);
  const y = useTransform(heat, (h) => `${(h > 0.5 ? (Math.random() - 0.5) * h : 0) * 0.04}em`);
  const [shown, setShown] = useState(text);
  useMotionValueEvent(heat, 'change', (h) => {
    if (h > 0.5 && Math.random() < 0.2) setShown(scramble(text));
    else if (h < 0.3 && shown !== text) setShown(text);
  });
  const clip = useTransform(heat, (h) =>
    h > 0.35 ? `inset(${30 + h * 20}% 0 ${40 - h * 30}% 0)` : 'inset(0 0 0 0)',
  );

  return (
    <motion.span
      aria-label={text}
      style={{ skewX: skew, y }}
      className={`relative inline-block select-none font-logo leading-[0.78] tracking-[-0.05em] ${className}`}
    >
      <motion.span aria-hidden style={{ x: xRed, opacity: heat }} className="absolute inset-0 text-[#dc2626]">
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
            {c === ' ' ? ' ' : c}
          </motion.span>
        ))}
      </span>
    </motion.span>
  );
};
