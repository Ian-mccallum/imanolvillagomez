import { Link } from 'react-router-dom';

/**
 * Legal footer — copyright and privacy only.
 * Instagram lives in InstagramPromoStrip / OtherPageInstagramOutro above this bar.
 */

export const Footer = () => {
  return (
    <footer className="relative z-10 overflow-hidden border-t border-white/10 bg-[#070707]">
      <div
        className="absolute inset-0 pointer-events-none z-0"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 400 400' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='4.0' numOctaves='10' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)' opacity='1'/%3E%3C/svg%3E")`,
          mixBlendMode: 'overlay',
          opacity: 0.22,
        }}
      />
      <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-red-primary/80 to-transparent" />

      <div className="container mx-auto px-4 md:px-6 relative z-10">
        <div className="flex flex-col gap-4 py-5 sm:flex-row sm:items-center sm:justify-between md:py-6">
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
