import { forwardRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

export interface Item {
  id: string;
  file: File;
  url: string;
  rot: number;
  loaded: number;
  /** group id, or null when loose */
  group: string | null;
  /** who/what this one is — overrides the group's name */
  label: string;
  /** instructions for just this file */
  note: string;
}

const kind = (f: File) =>
  f.type.startsWith('video/') ? 'video' : f.type.startsWith('image/') ? 'image' : 'other';

const SPRING = { type: 'spring', stiffness: 170, damping: 20, mass: 0.9 } as const;

const mb = (n: number) =>
  n > 1e9 ? `${(n / 1e9).toFixed(1)}G` : `${Math.max(1, Math.round(n / 1e6))}M`;

const inputCls =
  'w-full min-w-0 bg-transparent font-mono text-[12px] text-[#C9C8C7] outline-none placeholder:text-[#C9C8C7]/30 disabled:opacity-60';

/**
 * One scrapbook tile. A dark veil lifts as bytes land. Underneath: a name for
 * this one (falls back to its folder's) and optional instructions for just it.
 * The corner square selects it for moving into a folder.
 */
export const Tile = forwardRef<
  HTMLElement,
  {
    item: Item;
    index: number;
    busy: boolean;
    selected: boolean;
    /** true while anything is selected — a tap on the picture toggles it */
    selecting: boolean;
    /** the folder's name, shown faded when this one has none of its own */
    inherit: string;
    onRemove: () => void;
    onSelect: () => void;
    onChange: (patch: Partial<Pick<Item, 'label' | 'note'>>) => void;
  }
>(({ item, index, busy, selected, selecting, inherit, onRemove, onSelect, onChange }, ref) => {
  const [noteOpen, setNoteOpen] = useState(!!item.note);
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
      exit={{
        opacity: 0,
        scale: 0.7,
        rotate: item.rot * -6,
        filter: 'blur(12px)',
        transition: { duration: 0.35 },
      }}
      whileHover={busy ? undefined : { rotate: 0, scale: 1.025, zIndex: 2 }}
      transition={SPRING}
      className={`group relative mb-3 overflow-hidden bg-[#111] outline outline-2 -outline-offset-2 transition-[outline-color] md:mb-4 ${selected ? 'outline-[#dc2626]' : 'outline-transparent'}`}
    >
      <div className="relative" onClick={selecting && !busy ? onSelect : undefined}>
        {k === 'video' ? (
          <video
            src={item.url}
            muted
            loop
            playsInline
            autoPlay
            preload="metadata"
            className="block w-full"
          />
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
        {selected && (
          <div aria-hidden className="pointer-events-none absolute inset-0 bg-[#dc2626]/15" />
        )}
      </div>

      {/* name + instructions for just this one */}
      <div className="border-t border-[#C9C8C7]/10 px-2 py-1.5">
        <input
          value={item.label}
          onChange={(e) => onChange({ label: e.target.value })}
          disabled={busy}
          placeholder={inherit || 'name'}
          aria-label={`name for ${item.file.name}`}
          className={`${inputCls} uppercase tracking-wider`}
        />
        <AnimatePresence initial={false}>
          {noteOpen ? (
            <motion.textarea
              key="note"
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              autoFocus={!item.note}
              value={item.note}
              onChange={(e) => onChange({ note: e.target.value })}
              onBlur={() => !item.note.trim() && setNoteOpen(false)}
              disabled={busy}
              rows={2}
              placeholder="instructions for just this one"
              aria-label={`instructions for ${item.file.name}`}
              className={`${inputCls} mt-1 resize-none border-t border-[#C9C8C7]/10 pt-1 leading-snug`}
            />
          ) : (
            !busy && (
              <button
                type="button"
                onClick={() => setNoteOpen(true)}
                className="mt-0.5 font-mono text-[10px] uppercase tracking-[0.2em] text-[#C9C8C7]/30 transition-colors hover:text-[#C9C8C7]"
              >
                + instructions
              </button>
            )
          )}
        </AnimatePresence>
      </div>

      {!busy && (
        <button
          type="button"
          aria-label={`${selected ? 'deselect' : 'select'} ${item.file.name}`}
          aria-pressed={selected}
          onClick={onSelect}
          className={`absolute left-1.5 top-1.5 flex h-7 w-7 items-center justify-center bg-black/70 transition-opacity md:group-hover:opacity-100 ${selected || selecting ? 'opacity-100' : 'opacity-100 md:opacity-0'}`}
        >
          <span
            className={`block h-3 w-3 border transition-colors ${selected ? 'border-[#dc2626] bg-[#dc2626]' : 'border-[#C9C8C7]/70'}`}
          />
        </button>
      )}

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
