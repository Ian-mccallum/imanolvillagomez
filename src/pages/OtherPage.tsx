import { useState, useMemo, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { LostFilesHero } from '@/components/ui/LostFilesHero';
import { FullscreenModal } from '@/components/video';
import { VideoCard } from '@/components/video/VideoCard';
import { lostFilesVideos } from '@/constants/videos';
import { Video } from '@/types';
import { videosToMediaItems } from '@/types/media';
import { usePageTitle, useMetaTags } from '@/hooks';
import { SEO_CONFIG, BASE_URL } from '@/constants';
import { StructuredData, createBreadcrumbSchema } from '@/components/seo/StructuredData';
import { useResponsive } from '@/hooks/useResponsive';

/**
 * OtherPage
 * 
 * Carson: Experimental typography, break the grid, asymmetrical layouts
 * Oliver: Dark canvas, videos as light, distressed textures, gothic beauty
 * West: Minimalist perfectionism, bold statements, clean aesthetics
 * Weirdcore: Glitch effects, digital artifacts, intentional glitches
 * 
 * Features:
 * - Striking "LOST FILES" hero with background image
 * - Dark background with intense grain texture
 * - Videos organized in Pinterest/masonry layout (scrapbook aesthetic)
 * - Video-First: Videos dominate (80% visual weight)
 * - Many videos, appropriately sized (300-500px width)
 * - Glitch effects on hover (Weirdcore)
 * - Indie sleaze grain textures (Oliver)
 */

export const OtherPage = () => {
  const seoConfig = SEO_CONFIG.other;
  const { isMobile } = useResponsive();
  usePageTitle('Other');
  useMetaTags({
    title: seoConfig.title,
    description: seoConfig.description,
    keywords: seoConfig.keywords,
  });

  // Breadcrumb schema
  const breadcrumbSchema = createBreadcrumbSchema([
    { name: 'Home', url: BASE_URL },
    { name: 'Other', url: `${BASE_URL}${seoConfig.path}` },
  ]);
  
  const [selectedVideoIndex, setSelectedVideoIndex] = useState<number | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [clickPosition, setClickPosition] = useState<{ x: number; y: number; width: number; height: number } | null>(null);

  // Filter and sort videos: Remove "che", Hellp first, then Osamason
  const sortedVideos = useMemo(() => {
    // Filter out "che" video
    const filtered = lostFilesVideos.filter(video => video.id !== 'che');
    
    // Separate by client
    const hellpVideos = filtered.filter(video => 
      video.client?.toLowerCase().includes('hellp')
    );
    const osamasonVideos = filtered.filter(video => 
      video.client?.toLowerCase().includes('osamason')
    );
    const otherVideos = filtered.filter(video => 
      !video.client?.toLowerCase().includes('hellp') && 
      !video.client?.toLowerCase().includes('osamason')
    );
    
    // Order: Hellp first, then Osamason, then others
    return [...hellpVideos, ...osamasonVideos, ...otherVideos];
  }, []);

  const handleVideoSelect = (video: Video, position?: { x: number; y: number; width: number; height: number }) => {
    const index = sortedVideos.findIndex(v => v.id === video.id);
    if (index !== -1) {
      setSelectedVideoIndex(index);
      setClickPosition(position || null);
      setIsModalOpen(true);
    }
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedVideoIndex(null);
    setClickPosition(null);
  };
  
  // Convert sorted videos to media items
  const mediaItems = useMemo(() => videosToMediaItems(sortedVideos), [sortedVideos]);

  return (
    <>
      <StructuredData data={breadcrumbSchema} />
      <div className="min-h-screen bg-black text-white relative pb-0 mb-0">
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

      {/* Striking glitchy hero - no white space above */}
      <LostFilesHero />

      {/* Lost files videos section (80% visual weight) - Video-First */}
      {sortedVideos.length > 0 ? (
        <section className="relative z-10 w-full py-8 md:py-12 lg:py-16">
          <div className="w-full px-4 md:px-6 lg:px-12 xl:px-16">
            {/* West: Minimal header - videos are the hero */}
            <motion.div
              className="mb-8 md:mb-12"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.3 }}
            >
              <h2 className="text-xl sm:text-2xl md:text-3xl lg:text-4xl font-black text-white uppercase tracking-tighter">
                ARCHIVED WORK
              </h2>
              <p className="mt-2 text-zinc-400 text-sm md:text-base uppercase tracking-wider">
                {sortedVideos.length} {sortedVideos.length === 1 ? 'VIDEO' : 'VIDEOS'}
              </p>
            </motion.div>

            {/* Video grid - 2 videos per row, even bigger */}
            <AnimatePresence mode="wait">
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.3 }}
                className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6 lg:gap-8"
              >
                {sortedVideos.map((video, index) => (
                  <motion.div
                    key={video.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.4, delay: index * 0.1 }}
                  >
                    <VideoCard
                      video={video}
                      isFeatured={false}
                      onSelect={() => handleVideoSelect(video)}
                      size="auto"
                      darkBackground={true}
                    />
                  </motion.div>
                ))}
              </motion.div>
            </AnimatePresence>
          </div>
        </section>
      ) : (
        <motion.section
          className="relative z-10 min-h-[60vh] flex items-center justify-center py-16"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5 }}
        >
          <div className="text-center">
            <h2 className="text-4xl md:text-6xl font-black text-white mb-4">NO ARCHIVED VIDEOS</h2>
            <p className="text-zinc-400 text-lg">Check back soon for archived content.</p>
          </div>
        </motion.section>
      )}

      {/* Instagram CTA Hero Section - West: Bold minimalism, Oliver: Dark beauty, Carson: Experimental typography - At bottom */}
      <motion.section
        className="relative z-10 w-full overflow-hidden"
        style={{
          height: '60vh',
          minHeight: '500px',
          marginBottom: '-1px', // Overlap footer border to eliminate whitespace
          paddingBottom: 0,
        }}
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true, margin: "-100px" }}
        transition={{ duration: 0.8 }}
      >
        {/* Background Image - Oliver: Dark, cinematic beauty - Fixed at absolute bottom */}
        <div
          className="absolute inset-0 z-0"
          style={{
            backgroundImage: 'url("/images/ninevicious-2.jpeg")',
            backgroundSize: isMobile ? 'contain' : 'cover',
            backgroundPosition: isMobile ? 'center center' : 'center bottom',
            backgroundRepeat: 'no-repeat',
            backgroundAttachment: isMobile ? 'scroll' : 'fixed',
          }}
        />
        
        {/* Dark overlay for text readability - Oliver: Dark beauty */}
        <div className="absolute inset-0 z-0 bg-black/60" />
        
        {/* Grain texture overlay - Oliver: Distressed textures */}
        <div
          className="absolute inset-0 z-0 pointer-events-none"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 400 400' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='5.0' numOctaves='12' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)' opacity='1'/%3E%3C/svg%3E")`,
            mixBlendMode: 'overlay',
            opacity: 0.4,
          }}
        />

        <div className="container mx-auto px-4 md:px-6 relative z-10 h-full flex items-center justify-center">
          <div className="max-w-4xl mx-auto text-center">
            {/* Carson: Experimental typography - break the grid */}
            <motion.h2
              className="text-4xl md:text-6xl lg:text-7xl xl:text-8xl font-black text-white uppercase tracking-tighter mb-6 md:mb-8"
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.2 }}
            >
              FOLLOW
            </motion.h2>
            
            {/* West: Minimal, bold statement */}
            <motion.p
              className="text-xl md:text-2xl lg:text-3xl text-zinc-300 mb-8 md:mb-12 uppercase tracking-wider"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.4 }}
            >
              FOR MORE
            </motion.p>

            {/* West: Bold CTA button - minimal, iconic */}
            <motion.div className="relative inline-block">
              <motion.a
                href="https://instagram.com/imanol.villagomez"
                target="_blank"
                rel="noopener noreferrer"
                className="relative inline-flex items-center gap-3 md:gap-4 bg-white text-black font-black px-6 py-4 md:px-12 md:py-6 lg:px-16 lg:py-8 text-base md:text-xl lg:text-2xl uppercase tracking-tighter transition-all duration-300 hover:bg-white/90 group z-10 min-h-[44px]"
                initial={{ opacity: 0, scale: 0.9 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: 0.6, ease: "backOut" }}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                {/* Instagram Icon */}
                <svg
                  className="w-6 h-6 md:w-8 md:h-8 lg:w-10 lg:h-10"
                  fill="currentColor"
                  viewBox="0 0 24 24"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
                </svg>
                <span>@imanol.villagomez</span>
              </motion.a>
            </motion.div>
          </div>
        </div>
      </motion.section>

      {/* Video Modal */}
      <FullscreenModal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        items={mediaItems}
        initialIndex={selectedVideoIndex ?? 0}
        initialPosition={clickPosition || undefined}
        enableGalleryNavigation={true}
        enableNativeFullscreen={true}
        enableTouchGestures={true}
        enableKeyboardNavigation={true}
      />
      </div>
    </>
  );
};
