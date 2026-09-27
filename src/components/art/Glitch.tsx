import { motion, useTransform, type MotionValue } from 'framer-motion';

const EASE = [0.22, 1, 0.36, 1] as const;

/**
 * Oversized wordmark. At rest it's clean ink — no color. Moving the cursor
 * slides a red channel and an outline ghost out from behind it, further the
 * faster you go, and they ease back in when you stop. No shake.
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
  const xRed = useTransform(heat, (h) => `${h * -0.045}em`);
  const xGhost = useTransform(heat, (h) => `${h * 0.035}em`);
  const red = useTransform(heat, (h) => Math.min(h * 1.8, 1));
  const ghost = useTransform(heat, (h) => Math.min(h * 1.2, 0.8));

  return (
    <span
      aria-label={text}
      className={`relative inline-block select-none font-logo leading-[0.78] tracking-[-0.05em] ${className}`}
    >
      <motion.span
        aria-hidden
        style={{ x: xRed, opacity: red }}
        className="absolute inset-0 text-[#dc2626]"
      >
        {text}
      </motion.span>
      <motion.span
        aria-hidden
        style={{ x: xGhost, opacity: ghost, WebkitTextStroke: '1px #C9C8C7' }}
        className="absolute inset-0 text-transparent"
      >
        {text}
      </motion.span>
      <span aria-hidden className="relative inline-flex overflow-hidden pb-[0.04em]">
        {[...text].map((c, i) => (
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
    </span>
  );
};
