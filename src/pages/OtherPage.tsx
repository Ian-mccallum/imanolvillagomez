import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { LostFilesHero } from '@/components/ui/LostFilesHero';
import { OtherPageInstagramOutro } from '@/components/layout/OtherPageInstagramOutro';
import { SubpageHeader } from '@/components/layout/SubpageHeader';
import { FullscreenModal } from '@/components/video';
import { VideoCard } from '@/components/video/VideoCard';
import { lostFilesVideos } from '@/constants/videos';
import { Video } from '@/types';
import { videosToMediaItems } from '@/types/media';
import { usePageTitle, useMetaTags } from '@/hooks';
import { SEO_CONFIG, BASE_URL } from '@/constants';
import { StructuredData, createBreadcrumbSchema } from '@/components/seo/StructuredData';

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

  // Filter and sort videos: Remove "che", Osamason first, then others
  const sortedVideos = useMemo(() => {
    const filtered = lostFilesVideos.filter(video => video.id !== 'che');

    const osamasonVideos = filtered.filter(video =>
      video.client?.toLowerCase().includes('osamason')
    );
    const otherVideos = filtered.filter(video =>
      !video.client?.toLowerCase().includes('osamason')
    );

    return [...osamasonVideos, ...otherVideos];
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
      <div className="min-h-screen bg-zinc-darkest text-white relative pb-0 mb-0">
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
        <section className="relative z-10 w-full pt-2 pb-8 md:pt-4 md:pb-12 lg:pb-16">
          <div className="w-full px-4 md:px-6 lg:px-12 xl:px-16">
            {/* West: Minimal header - videos are the hero */}
            <SubpageHeader
              as="h2"
              variant="section"
              title="ARCHIVED WORK"
              subtitle={`${sortedVideos.length} ${sortedVideos.length === 1 ? 'VIDEO' : 'VIDEOS'}`}
              animate={false}
              className="mb-4 md:mb-6"
            />

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

      <OtherPageInstagramOutro />

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
