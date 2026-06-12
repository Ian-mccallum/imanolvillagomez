import { motion } from 'framer-motion';
import { INSTAGRAM_HANDLE, INSTAGRAM_URL } from '@/constants/social';
import { InstagramIcon } from './InstagramIcon';

/**
 * Slim Instagram band above the legal footer.
 * Red signal line separates it from page content; footer stays clean.
 */
export const InstagramPromoStrip = () => {
  return (
    <section
      aria-label="Follow on Instagram"
      className="relative z-10"
    >
      {/* Gore-core signal bar: unique break from page canvas */}
      <div
        className="h-[3px] w-full"
        style={{
          background:
            'linear-gradient(90deg, transparent 0%, #dc2626 18%, #ef4444 50%, #dc2626 82%, transparent 100%)',
        }}
      />
      <div className="h-px w-full bg-gradient-to-r from-transparent via-red-primary/40 to-transparent" />

      <motion.a
        href={INSTAGRAM_URL}
        target="_blank"
        rel="noopener noreferrer"
        className="group relative block overflow-hidden bg-zinc-darker"
        initial={{ opacity: 0, y: 12 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: '-40px' }}
        transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
        whileHover={{ backgroundColor: '#1f1f23' }}
      >
        {/* Diagonal wash — indie sleaze flash */}
        <div
          className="pointer-events-none absolute inset-0 opacity-60 mix-blend-soft-light"
          style={{
            background:
              'linear-gradient(118deg, rgba(220,38,38,0.14) 0%, transparent 42%, transparent 68%, rgba(220,38,38,0.06) 100%)',
          }}
        />

        {/* Scan-line texture */}
        <div
          className="pointer-events-none absolute inset-0 opacity-[0.07]"
          style={{
            backgroundImage:
              'repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(255,255,255,0.4) 2px, rgba(255,255,255,0.4) 3px)',
          }}
        />

        {/* Grain */}
        <div
          className="pointer-events-none absolute inset-0 opacity-30 mix-blend-overlay"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 400 400' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='4.5' numOctaves='8' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E")`,
          }}
        />

        <div className="container relative z-10 mx-auto px-4 md:px-6 py-4 md:py-5">
          <div className="flex items-center justify-between gap-4 md:gap-8">
            <div className="min-w-0 flex-1">
              <p className="mb-1 text-[10px] font-black uppercase tracking-[0.35em] text-red-primary md:text-xs">
                Off the site
              </p>
              <p className="truncate text-xl font-black uppercase tracking-tighter text-white transition-colors duration-300 group-hover:text-red-bright md:text-2xl">
                {INSTAGRAM_HANDLE}
              </p>
            </div>

            <div className="flex shrink-0 items-center gap-3 md:gap-5">
              <p className="hidden text-right text-[10px] uppercase leading-relaxed tracking-[0.2em] text-zinc-500 transition-colors duration-300 group-hover:text-zinc-300 sm:block md:text-xs">
                BTS
                <span className="mx-1.5 text-red-primary/70">·</span>
                drops
                <span className="mx-1.5 text-red-primary/70">·</span>
                process
              </p>
              <span className="flex h-11 w-11 items-center justify-center border border-white/15 text-white transition-all duration-300 group-hover:border-red-primary group-hover:bg-red-primary/10 group-hover:text-red-bright md:h-12 md:w-12">
                <InstagramIcon className="h-5 w-5" />
              </span>
            </div>
          </div>
        </div>

        {/* Hard edge into legal footer */}
        <div className="h-px bg-zinc-800/80" />
      </motion.a>
    </section>
  );
};
