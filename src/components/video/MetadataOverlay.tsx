import { motion, AnimatePresence } from 'framer-motion';
import { MediaItem } from '@/types/media';

interface MetadataOverlayProps {
  item: MediaItem;
  isVisible: boolean;
  onToggle: () => void;
}

export const MetadataOverlay = ({
  item,
  isVisible,
  onToggle,
}: MetadataOverlayProps) => {
  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 20 }}
          transition={{ duration: 0.3 }}
          className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/90 via-black/70 to-transparent p-6 md:p-8 z-20"
          onClick={onToggle}
          role="button"
          tabIndex={0}
          onKeyDown={(e) => {
            if (e.key === 'Enter' || e.key === ' ') {
              e.preventDefault();
              onToggle();
            }
          }}
          aria-label="Toggle metadata"
        >
          {item.type === 'video' ? (
            <>
              {/* Video metadata: Artist / Song / Tour and Date */}
              <h2 className="text-2xl md:text-4xl font-black text-white mb-2 uppercase tracking-tighter">
                {item.artist && item.song && item.tour ? (
                  <span>{item.artist} / {item.song} / {item.tour}</span>
                ) : item.artist && item.song ? (
                  <span>{item.artist} / {item.song}</span>
                ) : item.title ? (
                  <span>{item.title}</span>
                ) : null}
              </h2>
              {/* Date */}
              {item.date ? (
                <div className="text-sm md:text-base text-zinc-400">
                  {item.date}
                </div>
              ) : (
                <div className="flex items-center gap-3 text-sm md:text-base text-zinc-400">
                  {item.client && (
                    <span className="font-medium">{item.client}</span>
                  )}
                  {item.year && (
                    <>
                      {item.client && <span>•</span>}
                      <span>{item.year}</span>
                    </>
                  )}
                </div>
              )}
            </>
          ) : (
            <>
              {/* Photo metadata: Title, Client, Year */}
              {item.title && (
                <h2 className="text-2xl md:text-4xl font-black text-white mb-2 uppercase tracking-tighter">
                  {item.title}
                </h2>
              )}
              <div className="flex items-center gap-3 text-sm md:text-base text-zinc-400">
                {item.client && (
                  <span className="font-medium">{item.client}</span>
                )}
                {item.year && (
                  <>
                    {item.client && <span>•</span>}
                    <span>{item.year}</span>
                  </>
                )}
              </div>
            </>
          )}
        </motion.div>
      )}
    </AnimatePresence>
  );
};

