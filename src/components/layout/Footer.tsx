import { Link } from 'react-router-dom';

/**
 * Legal footer — copyright and privacy only.
 * Instagram lives in InstagramPromoStrip / OtherPageInstagramOutro above this bar.
 */

export const Footer = () => {
  return (
    <footer className="relative z-10 border-t border-zinc-800/50 bg-zinc-darkest py-2 md:py-3">
      {/* Grain texture overlay - subtle */}
      <div
        className="absolute inset-0 pointer-events-none z-0"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 400 400' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='4.0' numOctaves='10' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)' opacity='1'/%3E%3C/svg%3E")`,
          mixBlendMode: 'overlay',
          opacity: 0.3,
        }}
      />
      
      <div className="container mx-auto px-4 md:px-6 relative z-10">
        <div className="flex flex-col items-center justify-center gap-1 md:flex-row md:justify-between">
          <div className="flex flex-wrap items-center justify-center gap-x-4 gap-y-1 text-xs md:text-sm text-white font-medium">
            <span>© 2026 IMANOL VILLAGOMEZ. All rights reserved.</span>
            <span className="hidden text-zinc-400 sm:inline">•</span>
            <Link
              to="/privacy"
              className="text-white hover:text-white/80 transition-colors duration-200 underline min-h-[44px] flex items-center"
            >
              Privacy Policy
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
};
