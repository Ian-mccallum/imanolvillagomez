import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ROUTES } from '@/constants';
import { videos } from '@/constants/videos';
import shootFeb2026 from '@/constants/data/photos-shoot-20260228.json';
import type { Photo } from '@/types';
import type { Video } from '@/types';

const SESSION_YEAR = 2026;

/**
 * Work hub: interleaved preview of fresh video + stills (same visual language as rest of site).
 */
export const WorkSessionsSpotlight = () => {
  const vids = videos.filter((v): v is Video & { year: number } => v.year === SESSION_YEAR);
  const thumbs = shootFeb2026.slice(0, 8) as Photo[];

  const mosaic: ({ kind: 'video'; item: Video } | { kind: 'photo'; item: Photo })[] = [];
  for (let i = 0; i < Math.min(vids.length, thumbs.length, 8); i++) {
    mosaic.push({ kind: 'video', item: vids[i] }, { kind: 'photo', item: thumbs[i] });
  }

  return (
    <section
      className="relative border-y-2 border-text-dark/20 bg-[#BDBCBB]"
      aria-labelledby="work-sessions-heading"
    >
      <div className="container mx-auto px-4 md:px-6 py-12 md:py-16">
        <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-6 mb-8 md:mb-10">
          <div>
            <p className="text-text-dark-tertiary text-xs md:text-sm uppercase tracking-[0.2em] mb-2">
              Latest
            </p>
            <h2
              id="work-sessions-heading"
              className="text-2xl sm:text-3xl md:text-4xl font-black text-text-dark uppercase tracking-tighter"
            >
              2026 sessions
            </h2>
            <p className="mt-2 text-text-dark-secondary text-sm max-w-xl">
              New video and photography from Feb 2026—split across both sides of{' '}
              <span className="uppercase tracking-wide font-bold">WORK</span>.
            </p>
          </div>
          <div className="flex flex-wrap gap-3">
            <Link
              to={`${ROUTES.WORK_VIDEOS}?year=${SESSION_YEAR}`}
              className="inline-flex items-center justify-center px-5 py-2.5 border-2 border-text-dark bg-text-dark text-white text-sm font-bold uppercase tracking-wider hover:bg-transparent hover:text-text-dark transition-colors min-h-[44px]"
            >
              2026 video →
            </Link>
            <Link
              to={`${ROUTES.WORK_PHOTOS}?year=${SESSION_YEAR}`}
              className="inline-flex items-center justify-center px-5 py-2.5 border-2 border-text-dark bg-transparent text-text-dark text-sm font-bold uppercase tracking-wider hover:bg-text-dark hover:text-white transition-colors min-h-[44px]"
            >
              2026 photos →
            </Link>
          </div>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 md:gap-4">
          {mosaic.map((cell, index) => (
            <motion.div
              key={`${cell.kind}-${cell.item.id}`}
              initial={{ opacity: 0, y: 12 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-40px' }}
              transition={{ duration: 0.35, delay: index * 0.04 }}
              className="min-w-0"
            >
              {cell.kind === 'video' ? (
                <Link
                  to={`${ROUTES.WORK_VIDEOS}?year=${SESSION_YEAR}`}
                  className="group block border-2 border-text-dark/30 bg-black overflow-hidden aspect-[4/5] relative"
                >
                  <video
                    src={cell.item.videoUrl}
                    muted
                    playsInline
                    preload="metadata"
                    className="absolute inset-0 w-full h-full object-cover opacity-90 group-hover:opacity-100 transition-opacity"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent pointer-events-none" />
                  <div className="absolute bottom-0 left-0 right-0 p-3">
                    <p className="text-white text-[10px] md:text-xs font-bold uppercase tracking-wider line-clamp-2">
                      {cell.item.title}
                    </p>
                    <p className="text-zinc-400 text-[9px] mt-0.5 uppercase tracking-wider">Video</p>
                  </div>
                </Link>
              ) : (
                <Link
                  to={`${ROUTES.WORK_PHOTOS}?year=${SESSION_YEAR}`}
                  className="group block border-2 border-text-dark/30 overflow-hidden aspect-[4/5] bg-zinc-900 relative"
                >
                  <img
                    src={cell.item.imageUrl}
                    alt=""
                    className="absolute inset-0 w-full h-full object-cover group-hover:scale-[1.02] transition-transform duration-300"
                    loading="lazy"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                  <div className="absolute bottom-0 left-0 right-0 p-3 translate-y-1 group-hover:translate-y-0 opacity-0 group-hover:opacity-100 transition-all">
                    <p className="text-white text-[10px] md:text-xs font-bold uppercase tracking-wider line-clamp-1">
                      {cell.item.client}
                    </p>
                    <p className="text-zinc-400 text-[9px] mt-0.5 uppercase tracking-wider">Photo</p>
                  </div>
                </Link>
              )}
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};
