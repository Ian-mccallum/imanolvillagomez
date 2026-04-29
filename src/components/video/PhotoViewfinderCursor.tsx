import { useEffect, useState } from 'react';
import { motion, useMotionValue, useSpring, useTransform, AnimatePresence } from 'framer-motion';

const BOX = 44;
const HALF = BOX / 2;

/** Spring physics — calm lag (Miyazaki ma), not bouncy */
const SPRING = { stiffness: 140, damping: 28, mass: 0.38 };

interface PhotoViewfinderCursorProps {
  containerRef: React.RefObject<HTMLElement | null>;
  /** Parent gates: loaded image, 1× zoom, not dragging */
  enabled: boolean;
}

export function useFinePointer(): boolean {
  const [fine, setFine] = useState(() =>
    typeof window !== 'undefined' ? window.matchMedia('(pointer: fine)').matches : true
  );

  useEffect(() => {
    const mq = window.matchMedia('(pointer: fine)');
    const sync = () => setFine(mq.matches);
    sync();
    mq.addEventListener('change', sync);
    return () => mq.removeEventListener('change', sync);
  }, []);

  return fine;
}

/**
 * Quiet rangefinder brackets following the pointer with spring lag.
 * Parent must gate: fullscreen photo, 1× zoom, not dragging, desktop fine pointer, no reduced motion.
 */
export function PhotoViewfinderCursor({ containerRef, enabled }: PhotoViewfinderCursorProps) {
  const [hovering, setHovering] = useState(false);

  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const springX = useSpring(x, SPRING);
  const springY = useSpring(y, SPRING);

  const ox = useTransform(springX, (v) => v - HALF);
  const oy = useTransform(springY, (v) => v - HALF);

  useEffect(() => {
    if (!enabled) return;

    const el = containerRef.current;
    if (!el) return;

    const onMove = (e: MouseEvent) => {
      const r = el.getBoundingClientRect();
      x.set(e.clientX - r.left);
      y.set(e.clientY - r.top);
    };

    const onEnter = () => setHovering(true);
    const onLeave = () => setHovering(false);

    el.addEventListener('mousemove', onMove);
    el.addEventListener('mouseenter', onEnter);
    el.addEventListener('mouseleave', onLeave);

    return () => {
      el.removeEventListener('mousemove', onMove);
      el.removeEventListener('mouseenter', onEnter);
      el.removeEventListener('mouseleave', onLeave);
    };
  }, [enabled, containerRef, x, y]);

  useEffect(() => {
    if (!enabled) setHovering(false);
  }, [enabled]);

  if (!enabled) return null;

  return (
    <AnimatePresence>
      {hovering && (
        <motion.div
          key="viewfinder-brackets"
          aria-hidden
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.15, ease: 'easeOut' }}
          className="pointer-events-none absolute inset-0 z-[25] overflow-visible"
        >
          <motion.div
            className="absolute mix-blend-screen"
            style={{
              left: ox,
              top: oy,
              width: BOX,
              height: BOX,
            }}
          >
            <svg
              width={BOX}
              height={BOX}
              viewBox={`0 0 ${BOX} ${BOX}`}
              fill="none"
              className="text-white/55"
              aria-hidden
            >
              {/* L-brackets: quiet viewfinder */}
              <path
                d="M2 14 L2 2 L14 2"
                stroke="currentColor"
                strokeWidth={1.25}
                strokeLinecap="square"
              />
              <path
                d={`M${BOX - 14} 2 L${BOX - 2} 2 L${BOX - 2} 14`}
                stroke="currentColor"
                strokeWidth={1.25}
                strokeLinecap="square"
              />
              <path
                d={`M${BOX - 2} ${BOX - 14} L${BOX - 2} ${BOX - 2} L${BOX - 14} ${BOX - 2}`}
                stroke="currentColor"
                strokeWidth={1.25}
                strokeLinecap="square"
              />
              <path
                d={`M14 ${BOX - 2} L2 ${BOX - 2} L2 ${BOX - 14}`}
                stroke="currentColor"
                strokeWidth={1.25}
                strokeLinecap="square"
              />
            </svg>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
