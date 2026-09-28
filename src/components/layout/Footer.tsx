import { useRef } from 'react';
import { Link } from 'react-router-dom';
import { Backdrop } from '@/components/art/Backdrop';
import { usePointerHeat } from '@/components/art/heat';

/**
 * Legal footer — copyright and privacy only, over the /studio WebGL light
 * field (IMANOL VILLAGOMEZ type lit by the cursor). The cursor is mapped into
 * the footer's own box, so the flare follows the pointer across it.
 * Instagram lives in InstagramPromoStrip / OtherPageInstagramOutro above this bar.
 */

export const Footer = () => {
  const ref = useRef<HTMLElement>(null);
  const { field } = usePointerHeat(ref);
  return (
    <footer ref={ref} className="relative z-10 overflow-hidden border-t border-white/10 bg-black">
      <Backdrop field={field} intensity={1.15} className="absolute inset-0" />
      {/* keep the legal line readable over the light */}
      <div className="pointer-events-none absolute inset-0 z-0 bg-gradient-to-r from-black/45 via-transparent to-black/35" />
      <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-red-primary/80 to-transparent" />

      <div className="container mx-auto px-4 md:px-6 relative z-10">
        <div className="flex flex-col gap-4 py-10 sm:flex-row sm:items-center sm:justify-between md:py-14">
          <div className="flex items-center gap-3">
            <span className="footer-signal-dot h-2 w-2 shrink-0 bg-red-primary shadow-[0_0_18px_rgba(220,38,38,0.85)]" />
            <p className="max-w-[42rem] text-[11px] font-black uppercase leading-relaxed tracking-[0.16em] text-[#F2F0EF] sm:text-xs">
              © 2026 IMANOL VILLAGOMEZ. All rights reserved.
            </p>
          </div>

          <Link
            to="/privacy"
            className="group inline-flex min-h-[44px] w-fit items-center gap-2 border border-white/15 px-3 text-[11px] font-black uppercase tracking-[0.18em] text-[#F2F0EF] transition-colors duration-200 hover:border-red-primary hover:bg-red-primary hover:text-white focus:outline-none focus:ring-1 focus:ring-red-primary/70"
          >
            Privacy Policy
            <span
              aria-hidden="true"
              className="text-red-primary transition-colors duration-200 group-hover:text-white"
            >
              /
            </span>
          </Link>
        </div>
      </div>
    </footer>
  );
};
