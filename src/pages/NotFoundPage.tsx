import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { GlitchText } from '@/components/ui/GlitchText';
import { usePageTitle, useMetaTags } from '@/hooks';
import { ROUTES } from '@/constants';

/**
 * NotFoundPage (404)
 * 
 * Carson: Experimental typography, break the grid, asymmetrical layouts
 * Oliver: Dark canvas, distressed textures, gothic beauty
 * West: Minimalist perfectionism, bold statements, clean aesthetics
 * Weirdcore: Glitch effects, digital artifacts, intentional glitches
 * 
 * Features:
 * - Bold "404" text with glitch effects
 * - Dark background with intense grain texture
 * - Experimental typography layout
 * - Minimal navigation back to home
 * - Memorable, viral-worthy design
 */

export const NotFoundPage = () => {
  usePageTitle('404 - Not Found');
  useMetaTags({
    title: '404 - Page Not Found | IMANOL VILLAGOMEZ',
    description: 'The page you are looking for does not exist.',
  });

  return (
    <>
      <div className="min-h-screen bg-black text-white relative -mt-12 md:-mt-14">
        {/* Oliver: Very intense grainy background texture - multiple layers */}
        <div
          className="fixed inset-0 pointer-events-none z-0"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 400 400' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='5.0' numOctaves='12' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)' opacity='1'/%3E%3C/svg%3E")`,
            mixBlendMode: 'overlay',
            opacity: 1,
          }}
        />
        
        {/* Second grain layer - more intensity */}
        <div
          className="fixed inset-0 pointer-events-none z-0"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 400 400' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter2'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='8.0' numOctaves='15' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter2)' opacity='1'/%3E%3C/svg%3E")`,
            mixBlendMode: 'multiply',
            opacity: 0.9,
          }}
        />
        
        {/* Third grain layer - maximum intensity */}
        <div
          className="fixed inset-0 pointer-events-none z-0"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 400 400' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter3'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='10.0' numOctaves='18' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter3)' opacity='1'/%3E%3C/svg%3E")`,
            mixBlendMode: 'screen',
            opacity: 0.7,
          }}
        />

        <div className="container mx-auto px-4 md:px-6 pt-20 md:pt-24 pb-8 md:pb-12 lg:pb-16 relative z-10 min-h-screen flex items-center justify-center">
          <div className="max-w-4xl mx-auto text-center">
            {/* Carson: Experimental typography - break the grid */}
            {/* West: Bold, unapologetic statements */}
            {/* Weirdcore: Glitch effects */}
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, ease: "easeOut" }}
            >
              {/* 404 - Massive, glitched */}
              <motion.h1
                className="text-8xl sm:text-9xl md:text-[12rem] lg:text-[16rem] xl:text-[20rem] font-black text-white uppercase tracking-tighter mb-4 md:mb-8"
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.8, delay: 0.2, ease: "backOut" }}
              >
                <GlitchText intensity="strong">404</GlitchText>
              </motion.h1>

              {/* Carson: Asymmetrical text layout */}
              {/* Oliver: Dark, gothic beauty */}
              <motion.div
                className="mb-8 md:mb-12"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.6, delay: 0.4 }}
              >
                <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-black text-white uppercase tracking-tighter mb-4">
                  PAGE NOT FOUND
                </h2>
                <p className="text-zinc-300 text-sm md:text-base lg:text-lg uppercase tracking-wider max-w-2xl mx-auto">
                  THE PAGE YOU ARE LOOKING FOR DOES NOT EXIST
                </p>
              </motion.div>

              {/* West: Minimal, bold CTA */}
              {/* Carson: Experimental but functional */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.6 }}
              >
                <Link
                  to={ROUTES.HOME}
                  className="inline-flex items-center gap-3 bg-white text-black font-black px-8 py-4 md:px-12 md:py-6 text-base md:text-lg lg:text-xl uppercase tracking-tighter transition-all duration-300 hover:bg-white/90 group"
                >
                  <span>←</span>
                  <span>BACK TO HOME</span>
                </Link>
              </motion.div>

              {/* Weirdcore: Subtle glitch decoration */}
              <motion.div
                className="mt-12 md:mt-16 text-zinc-500 text-xs md:text-sm uppercase tracking-wider"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.6, delay: 0.8 }}
              >
                <motion.span
                  animate={{
                    opacity: [1, 0.5, 1],
                    x: [0, -1, 1, 0],
                  }}
                  transition={{
                    duration: 2,
                    repeat: Infinity,
                    repeatDelay: 3,
                  }}
                >
                  ERROR CODE: 404
                </motion.span>
              </motion.div>
            </motion.div>
          </div>
        </div>
      </div>
    </>
  );
};

