import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { GlitchText } from '@/components/ui/GlitchText';
import { ROUTES, SEO_CONFIG, BASE_URL } from '@/constants';
import { usePageTitle, useMetaTags } from '@/hooks';
import { StructuredData, createBreadcrumbSchema } from '@/components/seo/StructuredData';

/**
 * ThankYouPage
 * 
 * Carson: Experimental typography, break the grid, asymmetrical layouts
 * Oliver: Dark canvas, distressed textures, gothic beauty
 * West: Minimalist perfectionism, bold statements, clean aesthetics
 * Weirdcore: Glitch effects, digital artifacts, intentional glitches
 * 
 * Features:
 * - Dark background with intense grain texture
 * - Bold, minimal typography
 * - Thank you message with navigation options
 * - Memorable, viral-worthy design
 */

export const ThankYouPage = () => {
  const seoConfig = SEO_CONFIG.thankYou;
  usePageTitle('Thank You');
  useMetaTags({
    title: seoConfig.title,
    description: seoConfig.description,
    keywords: seoConfig.keywords,
  });

  // Breadcrumb schema
  const breadcrumbSchema = createBreadcrumbSchema([
    { name: 'Home', url: BASE_URL },
    { name: 'Thank You', url: `${BASE_URL}${seoConfig.path}` },
  ]);
  
  return (
    <>
      <StructuredData data={breadcrumbSchema} />
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

      <div className="container mx-auto px-4 md:px-6 pt-20 md:pt-24 pb-8 md:pb-12 lg:pb-16 relative z-10">
        <div className="max-w-3xl mx-auto">
          {/* Header - Carson: Experimental typography, West: Bold minimalism */}
          <motion.div
            className="mb-12 md:mb-16 text-center"
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: "easeOut" }}
          >
            <motion.h1
              className="text-5xl md:text-7xl lg:text-8xl font-black text-white uppercase tracking-tighter mb-4"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.6, delay: 0.1 }}
            >
              <GlitchText intensity="medium">THANK YOU</GlitchText>
            </motion.h1>
            <motion.p
              className="text-zinc-300 text-lg md:text-xl uppercase tracking-wider"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.6, delay: 0.2 }}
            >
              YOUR MESSAGE HAS BEEN SENT
            </motion.p>
          </motion.div>

          {/* Message - West: Minimal, bold */}
          <motion.div
            className="mb-12 md:mb-16 text-center"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
          >
            <p className="text-white text-base md:text-lg leading-relaxed max-w-2xl mx-auto">
              I'll get back to you as soon as possible. Looking forward to creating something bold together.
            </p>
          </motion.div>

          {/* Navigation buttons - West: Bold, minimal, iconic */}
          <motion.div
            className="flex flex-col sm:flex-row gap-4 md:gap-6 justify-center items-center"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
          >
            <motion.div
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <Link
                to={ROUTES.HOME}
                className="inline-block bg-white hover:bg-white/90 text-black font-black px-8 py-4 md:px-12 md:py-6 text-lg md:text-xl uppercase tracking-tighter transition-colors duration-200"
              >
                BACK TO HOME
              </Link>
            </motion.div>
            
            <motion.div
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <Link
                to={ROUTES.WORK}
                className="inline-block border-2 border-white text-white hover:bg-white hover:text-black font-black px-8 py-4 md:px-12 md:py-6 text-lg md:text-xl uppercase tracking-tighter transition-colors duration-200"
              >
                VIEW WORK
              </Link>
            </motion.div>
          </motion.div>
        </div>
      </div>
      </div>
    </>
  );
};

