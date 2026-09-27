import { forwardRef } from 'react';
import { motion } from 'framer-motion';

export interface Item {
  id: string;
  file: File;
  url: string;
  rot: number;
  loaded: number;
}

const kind = (f: File) =>
  f.type.startsWith('video/') ? 'video' : f.type.startsWith('image/') ? 'image' : 'other';

const SPRING = { type: 'spring', stiffness: 170, damping: 20, mass: 0.9 } as const;

const mb = (n: number) => (n > 1e9 ? `${(n / 1e9).toFixed(1)}G` : `${Math.max(1, Math.round(n / 1e6))}M`);

/** One scrapbook tile. A dark veil lifts as bytes land. */
export const Tile = forwardRef<
  HTMLElement,
  { item: Item; index: number; busy: boolean; onRemove: () => void }
>(({ item, index, busy, onRemove }, ref) => {
  const k = kind(item.file);
  const p = item.file.size ? item.loaded / item.file.size : 0;
  const done = p >= 1;
  const ext = item.file.name.split('.').pop()?.toUpperCase().slice(0, 4) ?? '';

  return (
    <motion.figure
      ref={ref}
      layout
      initial={{ opacity: 0, y: 60, rotate: item.rot * 5, scale: 0.86, filter: 'blur(10px)' }}
      animate={{
        opacity: 1,
        y: 0,
        rotate: item.rot,
        scale: 1,
        filter: 'blur(0px)',
        transition: { ...SPRING, delay: Math.min(index, 12) * 0.045 },
      }}
      exit={{ opacity: 0, scale: 0.7, rotate: item.rot * -6, filter: 'blur(12px)', transition: { duration: 0.35 } }}
      whileHover={busy ? undefined : { rotate: 0, scale: 1.025, zIndex: 2 }}
      transition={SPRING}
      className="group relative mb-3 overflow-hidden bg-[#111] md:mb-4"
    >
      {k === 'video' ? (
        <video src={item.url} muted loop playsInline autoPlay preload="metadata" className="block w-full" />
      ) : k === 'image' ? (
        <img src={item.url} alt="" className="block w-full" />
      ) : (
        <div className="flex aspect-[4/5] items-center justify-center font-logo text-[18vw] leading-none text-[#C9C8C7]/90 sm:text-[9vw] lg:text-[5.5vw]">
          {ext}
        </div>
      )}

      {/* veil — lifts from the bottom with upload progress */}
      <motion.div
        aria-hidden
        className="pointer-events-none absolute inset-0 origin-top bg-black/80"
        initial={false}
        animate={{ scaleY: busy ? 1 - p : 0 }}
        transition={{ type: 'spring', stiffness: 90, damping: 22 }}
      />
      {busy && !done && (
        <motion.div
          aria-hidden
          className="pointer-events-none absolute inset-x-0 h-px bg-[#dc2626] shadow-[0_0_12px_2px_rgba(220,38,38,.7)]"
          animate={{ top: `${(1 - p) * 100}%` }}
          transition={{ type: 'spring', stiffness: 90, damping: 22 }}
        />
      )}

      <figcaption className="pointer-events-none absolute inset-x-0 bottom-0 flex items-end justify-between gap-2 bg-gradient-to-t from-black/70 to-transparent px-2 pb-1.5 pt-6 font-mono text-[10px] uppercase tracking-wider text-[#C9C8C7]">
        <span className="truncate">{item.file.name}</span>
        <span className="shrink-0 tabular-nums text-[#C9C8C7]/60">
          {busy && !done ? `${Math.floor(p * 100)}` : mb(item.file.size)}
        </span>
      </figcaption>

      {!busy && (
        <button
          type="button"
          aria-label={`remove ${item.file.name}`}
          onClick={onRemove}
          className="absolute right-1.5 top-1.5 flex h-7 w-7 items-center justify-center bg-black/70 font-mono text-sm text-[#C9C8C7] opacity-100 transition-[opacity,background-color] hover:bg-[#dc2626] hover:text-black md:opacity-0 md:group-hover:opacity-100"
        >
          ×
        </button>
      )}
    </motion.figure>
  );
});
Tile.displayName = 'Tile';
