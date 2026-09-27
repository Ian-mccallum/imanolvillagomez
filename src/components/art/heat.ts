import { useEffect, useRef } from 'react';
import { useMotionValue, type MotionValue } from 'framer-motion';

/**
 * Pointer energy for /art. Nothing glitches on its own — every bit of color
 * and tearing on the page comes from the cursor.
 *
 * `energy` climbs with pointer speed and keeps climbing past 1 while you
 * scribble fast (a color flood, up to MAX), then bleeds off within a few hundred
 * ms of stopping. `heat` is the same thing clamped to 0..1 for the DOM.
 * `trail` is the recent path in uv space (y up) so the backdrop can glitch
 * where the cursor actually went.
 */

export const TRAIL = 16;
const MAX = 1.4;

export interface Field {
  /** x, y (uv, y up), e — TRAIL points, oldest first in ring order */
  trail: Float32Array;
  x: number;
  y: number;
  energy: number;
}

export function usePointerHeat(): {
  heat: MotionValue<number>;
  field: React.MutableRefObject<Field>;
} {
  const heat = useMotionValue(0);
  const field = useRef<Field>({ trail: new Float32Array(TRAIL * 3), x: 0.5, y: 0.5, energy: 0 });

  useEffect(() => {
    const f = field.current;
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const cap = reduce ? 0.3 : MAX;
    let last: { x: number; y: number; t: number } | null = null;
    let speed = 0;
    let head = 0;
    let lastPush = { x: -1e4, y: -1e4 };

    const move = (cx: number, cy: number) => {
      const t = performance.now();
      f.x = cx / window.innerWidth;
      f.y = 1 - cy / window.innerHeight;
      if (last) {
        const dt = Math.max(t - last.t, 8);
        const d = Math.hypot(cx - last.x, cy - last.y);
        speed = speed * 0.45 + (d / dt) * 0.55; // px/ms, smoothed
        // ~0.2 px/ms is a lazy drift, ~2 px/ms is a flick
        const kick = Math.min(Math.max(speed - 0.15, 0) / 1.7, 1);
        // hold the peak, and stack a little on top so sustained speed floods the frame
        f.energy = Math.min(cap, Math.max(f.energy, kick) + kick * kick * 0.09);
        if (Math.hypot(cx - lastPush.x, cy - lastPush.y) > 14 && kick > 0) {
          f.trail[head * 3] = f.x;
          f.trail[head * 3 + 1] = f.y;
          f.trail[head * 3 + 2] = Math.min(kick * 1.2, 1.2);
          head = (head + 1) % TRAIL;
          lastPush = { x: cx, y: cy };
        }
      }
      last = { x: cx, y: cy, t };
    };

    const pm = (e: PointerEvent) => move(e.clientX, e.clientY);
    // pointermove is silent while dragging files; dragover isn't
    const dm = (e: DragEvent) => move(e.clientX, e.clientY);
    window.addEventListener('pointermove', pm);
    window.addEventListener('dragover', dm);

    let raf = 0;
    let prev = performance.now();
    const tick = (now: number) => {
      raf = requestAnimationFrame(tick);
      const k = Math.min((now - prev) / 16.7, 4);
      prev = now;
      // the flood bleeds off slower than normal heat, so a burst lingers
      f.energy *= Math.pow(f.energy > 1 ? 0.95 : 0.9, k);
      if (f.energy < 0.002) f.energy = 0;
      const fade = Math.pow(0.93, k);
      for (let i = 2; i < f.trail.length; i += 3) f.trail[i] *= fade;
      // ease toward the target so color swells and fades instead of snapping
      const cur = heat.get();
      const h = cur + (Math.min(f.energy, 1) - cur) * (1 - Math.pow(0.8, k));
      if (Math.abs(h - cur) > 0.001) heat.set(h);
      else if (h < 0.005 && cur !== 0) heat.set(0);
    };
    raf = requestAnimationFrame(tick);

    return () => {
      window.removeEventListener('pointermove', pm);
      window.removeEventListener('dragover', dm);
      cancelAnimationFrame(raf);
    };
  }, [heat]);

  return { heat, field };
}
