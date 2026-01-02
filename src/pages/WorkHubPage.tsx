import { Link } from 'react-router-dom';
import { ROUTES, SEO_CONFIG, BASE_URL } from '@/constants';
import { motion } from 'framer-motion';
import { usePageTitle, useMetaTags } from '@/hooks';
import { StructuredData, createBreadcrumbSchema } from '@/components/seo/StructuredData';

/**
 * WorkHubPage
 * 
 * Redesign 2: Work hub page with navigation to Videos/Photos
 * Carson: Experimental typography, asymmetrical layout
 * West: Minimal, bold, clean
 * 
 * Features:
 * - Two large clickable sections (Videos/Photos)
 * - Arrow indicators for navigation
 * - Hover effects
 * - Choice interface
 */

export const WorkHubPage = () => {
  const seoConfig = SEO_CONFIG.work;
  usePageTitle('Work');
  useMetaTags({
    title: seoConfig.title,
    description: seoConfig.description,
    keywords: seoConfig.keywords,
  });

  // Breadcrumb schema
  const breadcrumbSchema = createBreadcrumbSchema([
    { name: 'Home', url: BASE_URL },
    { name: 'Work', url: `${BASE_URL}${seoConfig.path}` },
  ]);
  
  return (
    <>
      <StructuredData data={breadcrumbSchema} />
    <div className="min-h-screen text-text-dark" style={{ backgroundColor: '#C9C8C7' }}>
      {/* Header */}
      <header className="container mx-auto px-4 md:px-6 py-12 md:py-16">
        <h1 className="text-3xl sm:text-4xl md:text-6xl lg:text-7xl font-black text-text-dark uppercase tracking-tighter transform rotate-neg05">
          WORK
        </h1>
        <p className="mt-4 text-text-dark-tertiary text-sm md:text-base uppercase tracking-wider">
          CHOOSE YOUR PATH
        </p>
      </header>

      {/* Choice Interface - Two large clickable sections */}
      <main className="container mx-auto px-4 md:px-6 pb-12 md:pb-20">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8 max-w-5xl mx-auto">
          {/* Videos Section */}
          <motion.div
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            <Link
              to={ROUTES.WORK_VIDEOS}
              className="group relative block h-[300px] sm:h-[400px] md:h-[500px] border-2 border-text-dark hover:border-red-primary transition-all duration-300 overflow-hidden min-h-[300px]"
              style={{ backgroundColor: '#D4D4D4' }}
            >
              {/* Background texture */}
              <div className="absolute inset-0 opacity-10 group-hover:opacity-20 transition-opacity">
                <div 
                  className="w-full h-full"
                  style={{
                    backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 400 400' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")`,
                  }}
                />
              </div>

              {/* Content */}
              <div className="relative z-10 h-full flex flex-col items-center justify-center p-8">
                <h2 className="text-3xl sm:text-4xl md:text-5xl lg:text-7xl font-black text-text-dark uppercase tracking-tighter mb-4 transform rotate-05 group-hover:rotate-1 transition-transform">
                  VIDEOS
                </h2>
                
                {/* Arrow indicator */}
                <motion.div
                  className="text-2xl sm:text-3xl md:text-4xl lg:text-6xl text-red-primary"
                  animate={{ x: [0, 10, 0] }}
                  transition={{ duration: 1.5, repeat: Infinity, ease: 'easeInOut' }}
                >
                  →
                </motion.div>
              </div>
            </Link>
          </motion.div>

          {/* Photos Section */}
          <motion.div
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            <Link
              to={ROUTES.WORK_PHOTOS}
              className="group relative block h-[300px] sm:h-[400px] md:h-[500px] border-2 border-text-dark hover:border-green-500 transition-all duration-300 overflow-hidden min-h-[300px]"
              style={{ backgroundColor: '#D4D4D4' }}
            >
              {/* Background texture */}
              <div className="absolute inset-0 opacity-10 group-hover:opacity-20 transition-opacity">
                <div 
                  className="w-full h-full"
                  style={{
                    backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 400 400' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")`,
                  }}
                />
              </div>

              {/* Content */}
              <div className="relative z-10 h-full flex flex-col items-center justify-center p-8">
                <h2 className="text-3xl sm:text-4xl md:text-5xl lg:text-7xl font-black text-text-dark uppercase tracking-tighter mb-4 transform rotate-neg05 group-hover:rotate-neg1 transition-transform">
                  PHOTOS
                </h2>
                
                {/* Arrow indicator */}
                <motion.div
                  className="text-2xl sm:text-3xl md:text-4xl lg:text-6xl text-green-500"
                  animate={{ x: [0, 10, 0] }}
                  transition={{ duration: 1.5, repeat: Infinity, ease: 'easeInOut', delay: 0.3 }}
                >
                  →
                </motion.div>
              </div>
            </Link>
          </motion.div>
        </div>
      </main>
      </div>
    </>
  );
};

