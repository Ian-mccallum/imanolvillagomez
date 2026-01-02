import { useState, useEffect, useRef, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { FullscreenModal } from '@/components/video';
import { EpilepsyWarning } from '@/components/ui/EpilepsyWarning';
import { ROUTES, SEO_CONFIG, BASE_URL } from '@/constants';
import { motion } from 'framer-motion';
import { videoToMediaItem } from '@/types/media';
import { videos } from '@/constants/videos';
import { usePageTitle, useMetaTags } from '@/hooks';
import { StructuredData, createPersonSchema, createProfessionalServiceSchema, createWebSiteSchema } from '@/components/seo/StructuredData';

/**
 * HomePage
 * 
 * Immersive homepage with full-screen osamason video background
 * Carson: Experimental typography, break the grid, centered bold hero
 * Oliver: Dark beauty, video as light, photos as collage
 * West: Minimalist perfectionism, bold statements, clean centered layout
 * Weirdcore: Subtle glitch effects, digital artifacts
 * 
 * Features:
 * - Full-screen osamason video background
 * - Centered "IMANOL VILLAGOMEZ" hero text (same font as nav)
 * - Centered bold navigation buttons (VIDEOS, PHOTOS, OTHER, CONTACT)
 * - No traditional nav bar (homepage-specific design)
 */

export const HomePage = () => {
  const seoConfig = SEO_CONFIG.home;
  usePageTitle('Official Website');
  useMetaTags({
    title: seoConfig.title,
    description: seoConfig.description,
    keywords: seoConfig.keywords,
  });

  // Structured data schemas
  const personSchema = createPersonSchema({
    name: 'IMANOL VILLAGOMEZ',
    jobTitle: 'Music Videographer',
    url: BASE_URL,
    email: 'imanolV20@icloud.com',
    address: {
      locality: 'Aurora',
      region: 'Illinois',
    },
  });

  const professionalServiceSchema = createProfessionalServiceSchema({
    name: 'IMANOL VILLAGOMEZ Videography',
    description: 'Professional music videography and photography services',
    providerName: 'IMANOL VILLAGOMEZ',
    areaServed: 'United States',
    serviceType: ['Music Videography', 'Concert Videography', 'Tour Documentation', 'Music Video Production'],
  });

  const webSiteSchema = createWebSiteSchema({
    name: 'IMANOL VILLAGOMEZ',
    url: BASE_URL,
    searchUrl: `${BASE_URL}/work/videos?search={search_term_string}`,
  });

  const [hasAcknowledgedWarning, setHasAcknowledgedWarning] = useState(() => {
    if (typeof window !== 'undefined') {
      try {
        const stored = localStorage.getItem('epilepsy-warning-acknowledged');
        return stored ? JSON.parse(stored) === true : false;
      } catch {
        return false;
      }
    }
    return false;
  });
  const [selectedVideoIndex, setSelectedVideoIndex] = useState<number | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [clickPosition, setClickPosition] = useState<{ x: number; y: number; width: number; height: number } | null>(null);


  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedVideoIndex(null);
    setClickPosition(null);
  };
  
  // Convert videos to media items
  const mediaItems = useMemo(() => videos.map(videoToMediaItem), []);

  // Video ref for background video
  const videoRef = useRef<HTMLVideoElement>(null);

  // Background video - osamasonpreview.mov from public/videos
  const heroVideoUrl = '/videos/osamasonpreview.mov';

  // Ensure video loads and plays
  useEffect(() => {
    const videoEl = videoRef.current;
    if (!videoEl) return;

    // Load the video
    videoEl.load();

    // Handle video ready to play
    const handleCanPlay = () => {
      // Attempt to play the video
      videoEl.play().catch((err) => {
        console.warn('Video autoplay prevented:', err);
        // Autoplay was prevented, but video is loaded
      });
    };

    // Handle video errors
    const handleError = (e: Event) => {
      console.error('Video background error:', e);
      const video = e.target as HTMLVideoElement;
      if (video.error) {
        console.error('Video error details:', {
          code: video.error.code,
          message: video.error.message,
        });
      }
    };

    // Handle video loaded metadata
    const handleLoadedMetadata = () => {
      // Video metadata loaded, try to play
      videoEl.play().catch((err) => {
        console.warn('Video autoplay prevented after metadata load:', err);
      });
    };

    videoEl.addEventListener('canplay', handleCanPlay);
    videoEl.addEventListener('error', handleError);
    videoEl.addEventListener('loadedmetadata', handleLoadedMetadata);

    return () => {
      videoEl.removeEventListener('canplay', handleCanPlay);
      videoEl.removeEventListener('error', handleError);
      videoEl.removeEventListener('loadedmetadata', handleLoadedMetadata);
    };
  }, [heroVideoUrl]);

  // Navigation items
  const navItems = [
    { path: ROUTES.WORK_VIDEOS, label: 'VIDEOS' },
    { path: ROUTES.WORK_PHOTOS, label: 'PHOTOS' },
    { path: ROUTES.OTHER, label: 'OTHER' },
    { path: ROUTES.CONTACT, label: 'CONTACT' },
  ];

  return (
    <>
      {/* Structured Data - Invisible to users, only for search engines */}
      <StructuredData data={[personSchema, professionalServiceSchema, webSiteSchema]} />
      
      {/* Epilepsy Warning - must be acknowledged before site opens */}
      <EpilepsyWarning onAcknowledge={() => setHasAcknowledgedWarning(true)} />

      {/* Homepage content - only visible after warning is acknowledged */}
      {hasAcknowledgedWarning && (
        <div className="relative min-h-screen w-full overflow-hidden homepage-scrollbar">
      {/* Full-screen video background - osamason video only, fully visible */}
      <video
        ref={videoRef}
        autoPlay
        loop
        muted
        playsInline
        preload="metadata"
        className="fixed inset-0 w-screen h-screen object-cover z-0 pointer-events-none"
        style={{ 
          width: '100vw', 
          height: '100vh', 
          objectFit: 'cover',
          zIndex: 0,
          backgroundColor: '#000'
        }}
        onError={(e) => {
          console.error('Video background error:', e);
          const video = e.currentTarget;
          if (video.error) {
            console.error('Video error details:', {
              code: video.error.code,
              message: video.error.message,
            });
          }
        }}
        onLoadedData={() => {
          // Video data loaded, ensure it plays
          const videoEl = videoRef.current;
          if (videoEl) {
            videoEl.play().catch((err) => {
              console.warn('Video autoplay prevented:', err);
            });
          }
        }}
        onCanPlay={() => {
          // Video can start playing
          const videoEl = videoRef.current;
          if (videoEl) {
            videoEl.play().catch((err) => {
              console.warn('Video autoplay prevented on canplay:', err);
            });
          }
        }}
      >
        <source src={heroVideoUrl} type="video/quicktime" />
        <source src={heroVideoUrl} />
      </video>

      {/* Black grainy overlay - reduces video visibility with heavy grain */}
      {/* Mobile: Reduced opacity for performance, but maintain grain aesthetic */}
      <div 
        className="fixed inset-0 pointer-events-none opacity-70 md:opacity-90 lg:opacity-100"
        style={{
          zIndex: 5,
          backgroundColor: 'rgba(0, 0, 0, 0.98)',
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 400 400' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='4.0' numOctaves='10' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)' opacity='1'/%3E%3C/svg%3E")`,
          mixBlendMode: 'multiply',
          willChange: 'opacity',
        }}
      />

      {/* Additional black filter layer for extra darkness */}
      {/* Mobile: Reduced opacity for performance */}
      <div 
        className="fixed inset-0 pointer-events-none opacity-60 md:opacity-75 lg:opacity-100"
        style={{
          zIndex: 6,
          backgroundColor: 'rgba(0, 0, 0, 0.75)',
          willChange: 'opacity',
        }}
      />

      {/* Centered hero content - West's minimalist perfectionism - fits viewport with fixed footer */}
      {/* Mobile: Account for smaller footer height */}
      <div className="relative z-20 h-[calc(100vh-24px)] md:h-[calc(100vh-30px)] flex items-center justify-center px-4 md:px-6">
        <div className="text-center">
          {/* Hero name - IMANOL VILLAGOMEZ - same font as nav, smaller size */}
          {/* Mobile: text-2xl (24px) for very small screens, maintaining boldness */}
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: 'easeOut' }}
            className="text-2xl sm:text-3xl md:text-5xl lg:text-6xl xl:text-7xl font-medium uppercase tracking-tighter text-white mb-4 md:mb-8 lg:mb-12 leading-tight"
            style={{
              textShadow: '0 4px 20px rgba(0, 0, 0, 0.8), 0 2px 8px rgba(0, 0, 0, 0.6)',
            }}
          >
            IMANOL VILLAGOMEZ
          </motion.h1>

          {/* Centered navigation buttons - bold, clean */}
          {/* Mobile: Touch-friendly padding, 44x44px minimum touch targets */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2, ease: 'easeOut' }}
            className="flex flex-col md:flex-row items-center justify-center gap-3 md:gap-8 lg:gap-12"
          >
            {navItems.map((item, index) => (
              <motion.div
                key={item.path}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.3 + index * 0.1, ease: 'easeOut' }}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <Link
                  to={item.path}
                  className="text-xl sm:text-2xl md:text-3xl lg:text-4xl font-bold uppercase tracking-wider transition-all duration-200 block px-4 py-3 md:px-0 md:py-0 min-h-[44px] flex items-center justify-center"
                  style={{
                    color: '#F2F0EF', // Off-white color
                    textShadow: '0 2px 12px rgba(0, 0, 0, 0.8), 0 1px 4px rgba(0, 0, 0, 0.6)',
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.color = '#E8E6E4'; // Slightly darker on hover
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.color = '#F2F0EF'; // Back to off-white
                  }}
                >
                  {item.label}
                </Link>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </div>

      {/* Fullscreen Modal */}
      <FullscreenModal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        items={mediaItems}
        initialIndex={selectedVideoIndex ?? 0}
        initialPosition={clickPosition ?? undefined}
        enableGalleryNavigation={true}
        enableNativeFullscreen={true}
        enableTouchGestures={true}
        enableKeyboardNavigation={true}
      />

      {/* Footer - Pure text, no background or decorative elements */}
      {/* Mobile: Reduced height */}
      <footer className="fixed bottom-0 left-0 right-0 z-20 h-[24px] md:h-[30px] flex items-center justify-center">
        <div className="flex items-center gap-2 text-[10px] md:text-xs text-white/70 leading-tight font-medium tracking-tight">
          <span>© 2026 IMANOL VILLAGOMEZ. All rights reserved.</span>
          <span className="text-white/50">•</span>
          <Link
            to="/privacy"
            target="_blank"
            rel="noopener noreferrer"
            className="text-white/70 hover:text-white/90 transition-colors duration-200 underline"
          >
            Privacy Policy
          </Link>
        </div>
      </footer>
    </div>
      )}
    </>
  );
};
