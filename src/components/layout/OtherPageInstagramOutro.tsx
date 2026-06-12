import { motion } from 'framer-motion';
import { INSTAGRAM_HANDLE, INSTAGRAM_URL } from '@/constants/social';
import { useResponsive } from '@/hooks/useResponsive';

/**
 * Other page only: editorial Instagram outro matching Lost Files energy.
 * Sits above the legal footer instead of the shared promo strip.
 */
export const OtherPageInstagramOutro = () => {
  const { prefersReducedMotion } = useResponsive();

  return (
    <section aria-label="Follow on Instagram" className="relative z-10 overflow-hidden">
      {/* Signal break — matches site gore accent */}
      <div
        className="h-[3px] w-full"
        style={{
          background:
            'linear-gradient(90deg, #dc2626 0%, #ef4444 35%, transparent 70%, transparent 100%)',
        }}
      />

      <div className="relative min-h-[240px] md:min-h-[300px]">
        {/* Background */}
        <div
          className="absolute inset-0 bg-zinc-darkest"
          style={{
            backgroundImage: 'url("/images/osamason-2.jpeg")',
            backgroundSize: 'cover',
            backgroundPosition: 'center 30%',
          }}
        />
        <div className="absolute inset-0 bg-black/75" />
        <div className="absolute inset-0 bg-gradient-to-t from-zinc-darkest via-black/40 to-red-primary/10" />

        {/* Animated grain */}
        <motion.div
          className="pointer-events-none absolute inset-0 opacity-50 mix-blend-overlay"
          animate={
            prefersReducedMotion
              ? undefined
              : { backgroundPosition: ['0% 0%', '100% 100%'] }
          }
          transition={{ duration: 18, repeat: Infinity, ease: 'linear' }}
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 400 400' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='1.1' numOctaves='5' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E")`,
            backgroundSize: '200% 200%',
          }}
        />

        {/* VHS timestamp corner */}
        <div className="pointer-events-none absolute right-4 top-4 font-mono text-[10px] uppercase tracking-widest text-red-primary/80 md:right-8 md:top-6 md:text-xs">
          REC ● IG
        </div>

        <div className="container relative z-10 mx-auto flex h-full min-h-[240px] flex-col justify-end px-4 pb-8 pt-10 md:min-h-[300px] md:px-6 md:pb-10 md:pt-12">
          <div className="grid items-end gap-8 md:grid-cols-12 md:gap-6">
            {/* Carson: stacked, misaligned type — same family as Lost Files hero */}
            <div className="md:col-span-7">
              <motion.h2
                className="text-4xl font-black uppercase leading-[0.88] tracking-tighter text-white sm:text-5xl md:text-6xl lg:text-7xl"
                style={{ transform: 'translateX(-5%)' }}
                initial={{ opacity: 0, x: -24 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
              >
                NOT EVERYTHING
              </motion.h2>
              <motion.h2
                className="text-4xl font-black uppercase leading-[0.88] tracking-tighter text-white/90 sm:text-5xl md:text-6xl lg:text-7xl"
                style={{ transform: 'translateX(7%)' }}
                initial={{ opacity: 0, x: 24 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.55, delay: 0.08, ease: [0.22, 1, 0.36, 1] }}
              >
                GETS ARCHIVED
              </motion.h2>
              <motion.p
                className="mt-4 text-sm lowercase tracking-wide text-zinc-400 md:mt-5 md:text-base"
                style={{ transform: 'translateX(3%)' }}
                initial={{ opacity: 0 }}
                whileInView={{ opacity: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: 0.15 }}
              >
                scraps, bts, unreleased cuts — the rest lives here
              </motion.p>
            </div>

            {/* West: typographic link, no pill button */}
            <motion.div
              className="md:col-span-5 md:text-right"
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.2, ease: [0.22, 1, 0.36, 1] }}
            >
              <a
                href={INSTAGRAM_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="group inline-block text-left md:text-right"
              >
                <span className="mb-2 block text-[10px] font-black uppercase tracking-[0.4em] text-red-primary md:text-xs">
                  Instagram
                </span>
                <span className="flex items-center gap-3 text-2xl font-black uppercase tracking-tighter text-white transition-colors duration-300 group-hover:text-red-bright md:justify-end md:text-3xl lg:text-4xl">
                  {INSTAGRAM_HANDLE}
                  <span
                    aria-hidden
                    className="inline-block transition-transform duration-300 group-hover:translate-x-1.5"
                  >
                    →
                  </span>
                </span>
                <span className="mt-2 block h-px w-0 bg-red-primary transition-all duration-500 group-hover:w-full md:ml-auto" />
              </a>
            </motion.div>
          </div>
        </div>
      </div>

      <div className="h-px bg-zinc-800/80" />
    </section>
  );
};
