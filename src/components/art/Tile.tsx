import { forwardRef, useEffect, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { mediaKind } from './mediaPreview';
import { recoverImagePreview } from './imageDecoders';

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

const SPRING = { type: 'spring', stiffness: 170, damping: 20, mass: 0.9 } as const;

const mb = (n: number) =>
  n > 1e9 ? `${(n / 1e9).toFixed(1)}G` : `${Math.max(1, Math.round(n / 1e6))}M`;

const inputCls = 'studio-tile-input';

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
  const k = mediaKind(item.file);
  const [preview, setPreview] = useState<'loading' | 'ready' | 'unavailable'>(
    k === 'other' ? 'unavailable' : 'loading'
  );
  const [previewUrl, setPreviewUrl] = useState(item.url);
  const attempted = useRef(false);
  const generated = useRef<string>();
  const mounted = useRef(true);
  useEffect(() => {
    mounted.current = true;
    return () => {
      mounted.current = false;
      if (generated.current) URL.revokeObjectURL(generated.current);
    };
  }, []);
  const recover = async () => {
    if (attempted.current || k !== 'image') {
      setPreview('unavailable');
      return;
    }
    attempted.current = true;
    try {
      const blob = await recoverImagePreview(item.file);
      if (!mounted.current) return;
      if (!blob) {
        setPreview('unavailable');
        return;
      }
      generated.current = URL.createObjectURL(blob);
      setPreviewUrl(generated.current);
    } catch (error) {
      console.warn('Studio preview decoder failed:', error);
      if (mounted.current) setPreview('unavailable');
    }
  };
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
      className={`studio-tile group relative mb-3 overflow-hidden md:mb-4${selected ? ' is-selected' : ''}`}
    >
      <div className="relative" onClick={selecting && !busy ? onSelect : undefined}>
        <div className={`studio-media-preview ${preview !== 'ready' ? 'has-placeholder' : ''}`}>
          {preview === 'unavailable' ? (
            <div className="studio-preview-fallback">
              <span className="studio-preview-extension">{ext || 'FILE'}</span>
              <p>Preview unavailable in this browser.</p>
              <p>Your original file can still be sent.</p>
              <a href={item.url} download={item.file.name} onClick={(e) => e.stopPropagation()}>
                Open original
              </a>
            </div>
          ) : k === 'video' ? (
            <video
              src={previewUrl}
              muted
              playsInline
              controls
              preload="metadata"
              onLoadedMetadata={() => setPreview('ready')}
              onLoadedData={() => setPreview('ready')}
              onError={recover}
              className="block w-full"
              aria-label={`Preview of ${item.file.name}`}
            />
          ) : (
            <img
              src={previewUrl}
              alt={`Preview of ${item.file.name}`}
              className="block w-full"
              loading="lazy"
              decoding="async"
              onLoad={() => setPreview('ready')}
              onError={recover}
            />
          )}
          {preview === 'loading' && <div className="studio-preview-loading">Loading preview…</div>}
        </div>

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
            className="studio-tile-scan pointer-events-none absolute inset-x-0 h-px"
            animate={{ top: `${(1 - p) * 100}%` }}
            transition={{ type: 'spring', stiffness: 90, damping: 22 }}
          />
        )}

        <figcaption className="studio-tile-caption pointer-events-none absolute inset-x-0 bottom-0 flex items-end justify-between gap-2">
          <span className="truncate">{item.file.name}</span>
          <span className="shrink-0 tabular-nums">
            {busy && !done ? `${Math.floor(p * 100)}` : mb(item.file.size)}
          </span>
        </figcaption>
        {selected && (
          <div aria-hidden className="studio-tile-selected pointer-events-none absolute inset-0" />
        )}
      </div>

      {/* name + instructions for just this one */}
      <div className="studio-tile-meta">
        <input
          value={item.label}
          onChange={(e) => onChange({ label: e.target.value })}
          disabled={busy}
          placeholder={inherit || 'name'}
          aria-label={`name for ${item.file.name}`}
          className={inputCls}
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
              className={`${inputCls} studio-tile-note`}
            />
          ) : (
            !busy && (
              <button type="button" onClick={() => setNoteOpen(true)} className="studio-tile-add">
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
          className={`studio-tile-control absolute left-1.5 top-1.5 flex items-center justify-center transition-opacity md:group-hover:opacity-100 ${selected || selecting ? 'opacity-100' : 'opacity-100 md:opacity-0'}`}
        >
          <span className={`studio-tile-check${selected ? ' is-on' : ''}`}>
            {selected && (
              <svg
                width="12"
                height="12"
                viewBox="0 0 16 16"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.2"
                strokeLinecap="round"
                strokeLinejoin="round"
                aria-hidden
              >
                <path d="m3.5 8.5 3 3 6-7" />
              </svg>
            )}
          </span>
        </button>
      )}

      {!busy && (
        <button
          type="button"
          aria-label={`remove ${item.file.name}`}
          onClick={onRemove}
          className="studio-tile-control studio-tile-remove absolute right-1.5 top-1.5 flex items-center justify-center opacity-100 md:opacity-0 md:group-hover:opacity-100"
        >
          <svg
            width="14"
            height="14"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            aria-hidden
          >
            <path d="M6 6l12 12M18 6 6 18" />
          </svg>
        </button>
      )}
    </motion.figure>
  );
});
Tile.displayName = 'Tile';
