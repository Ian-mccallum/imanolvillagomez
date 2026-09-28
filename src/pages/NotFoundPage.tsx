import { createPortal } from 'react-dom';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { usePageTitle, useMetaTags } from '@/hooks';
import { ROUTES } from '@/constants';
import { Backdrop } from '@/components/art/Backdrop';
import { Glitch } from '@/components/art/Glitch';
import { Star } from '@/components/art/Star';
import { usePointerHeat } from '@/components/art/heat';

const EASE = [0.22, 1, 0.36, 1] as const;

/**
 * 404 — the /studio light field at full strength, with a dead-channel 404 torn
 * by the cursor. Covers the layout entirely; the only way out is home.
 */
export const NotFoundPage = () => {
  usePageTitle('404 - Not Found');
  useMetaTags({
    title: '404 - Page Not Found | IMANOL VILLAGOMEZ',
    description: 'The page you are looking for does not exist.',
    // Every mistyped or stale URL renders this page, so without noindex the site
    // offers search engines an unlimited supply of indexable dead ends.
    noindex: true,
  });
  const { heat, field } = usePointerHeat();

  // portal: the layout's <main> is its own stacking context, which would trap
  // this under the nav and footer
  return createPortal(
    <div className="fixed inset-0 z-[100] overflow-hidden bg-black text-[#C9C8C7] selection:bg-[#dc2626] selection:text-black">
      <Backdrop field={field} intensity={1} />

      {/* scanlines — a channel with nothing on it */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 z-10 opacity-30"
        style={{ backgroundImage: 'repeating-linear-gradient(0deg, rgba(0,0,0,.6) 0 1px, transparent 1px 3px)' }}
      />

      <div className="relative z-20 flex h-full flex-col items-center justify-center px-4 text-center">
        <motion.p
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, ease: EASE, delay: 0.6 }}
          className="mb-6 font-mono text-[11px] uppercase tracking-[0.5em] text-[#C9C8C7]/50"
        >
          no signal
        </motion.p>

        <h1 className="text-[#C9C8C7] drop-shadow-[0_0_40px_rgba(0,0,0,.8)]">
          <Glitch text="404" heat={heat} className="text-[min(42vw,40vh)] md:text-[min(30vw,40vh)]" delay={0.1} />
        </h1>

        <motion.p
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, ease: EASE, delay: 0.9 }}
          className="mt-6 max-w-xs font-mono text-[13px] leading-relaxed text-[#C9C8C7]/60"
        >
          This page isn't here. The work is.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, ease: EASE, delay: 1.1 }}
          className="mt-10"
        >
          <Link
            to={ROUTES.HOME}
            className="group inline-flex items-center gap-3 rounded-full bg-[#C9C8C7] px-8 py-4 font-logo text-lg uppercase tracking-tight text-black shadow-[0_0_60px_rgba(201,200,199,.2)] transition-colors hover:bg-white"
          >
            <span className="inline-block transition-transform group-hover:-translate-x-1">←</span>
            back to the work
          </Link>
        </motion.div>
      </div>

      <div className="pointer-events-none absolute bottom-8 left-1/2 z-20 hidden -translate-x-1/2 [@media(min-height:640px)]:block">
        <Star heat={heat} className="h-8 w-8" />
      </div>
    </div>,
    document.body
  );
};
