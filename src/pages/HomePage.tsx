import { useState, useEffect, useRef, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { FullscreenModal } from '@/components/video';
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
  const [currentVideoSrc, setCurrentVideoSrc] = useState<string>('');

  // Background video URLs with fallback strategy
  // Primary: R2 CDN (fast, cached)
  // Fallback: Local path (reliable, always available)
  const R2_BASE_URL = import.meta.env.VITE_R2_PUBLIC_URL || '';
  const primaryVideoUrl = R2_BASE_URL ? `${R2_BASE_URL}/videos/osamasonpreview.mp4` : '';
  const fallbackVideoUrl = '/videos/osamasonpreview.mp4';

  // Initialize with primary URL, fallback to local if needed
  useEffect(() => {
    if (primaryVideoUrl) {
      setCurrentVideoSrc(primaryVideoUrl);
    } else {
      setCurrentVideoSrc(fallbackVideoUrl);
    }
  }, [primaryVideoUrl]);

  // Foolproof video loading and playback with multiple strategies
  useEffect(() => {
    const videoEl = videoRef.current;
    if (!videoEl || !currentVideoSrc) return;

    let playAttempts = 0;
    const maxPlayAttempts = 5;
    let retryTimeout: NodeJS.Timeout | null = null;
    let loadTimeout: NodeJS.Timeout | null = null;
    let playPromise: Promise<void> | null = null;
    let isPlaying = false;

    // Strategy 1: Try to play immediately when video can play
    const attemptPlay = async (): Promise<void> => {
      if (isPlaying || playAttempts >= maxPlayAttempts) return;
      
      playAttempts++;
      try {
        playPromise = videoEl.play();
        await playPromise;
        isPlaying = true;
        console.log('✅ Background video playing successfully');
      } catch (err: any) {
        // Ignore AbortError (video was paused/removed)
        if (err.name === 'AbortError') {
          return;
        }
        
        console.warn(`⚠️ Autoplay attempt ${playAttempts} failed:`, err.name);
        
        // Strategy 2: Retry after short delay
        if (playAttempts < maxPlayAttempts) {
          retryTimeout = setTimeout(() => {
            attemptPlay();
          }, 300 * playAttempts); // Exponential backoff
        } else {
          // Strategy 3: Wait for user interaction
          const tryPlayOnInteraction = () => {
            videoEl.play().catch(() => {});
            document.removeEventListener('click', tryPlayOnInteraction);
            document.removeEventListener('touchstart', tryPlayOnInteraction);
            document.removeEventListener('scroll', tryPlayOnInteraction);
            document.removeEventListener('keydown', tryPlayOnInteraction);
          };
          document.addEventListener('click', tryPlayOnInteraction, { once: true });
          document.addEventListener('touchstart', tryPlayOnInteraction, { once: true });
          document.addEventListener('scroll', tryPlayOnInteraction, { once: true });
          document.addEventListener('keydown', tryPlayOnInteraction, { once: true });
        }
      }
    };

    // Handle video ready to play
    const handleCanPlay = () => {
      console.log('📹 Video can play, attempting autoplay...');
      attemptPlay();
    };

    const handleCanPlayThrough = () => {
      console.log('📹 Video can play through, ensuring playback...');
      if (!isPlaying) {
        attemptPlay();
      }
    };

    // Handle video errors with fallback
    const handleError = () => {
      const error = videoEl.error;
      console.error('❌ Video error:', {
        code: error?.code,
        message: error?.message,
        src: videoEl.src,
        currentSrc: videoEl.currentSrc
      });

      // Strategy 4: Fallback to local video if R2 fails
      if (currentVideoSrc === primaryVideoUrl && primaryVideoUrl) {
        console.log('🔄 Falling back to local video...');
        setCurrentVideoSrc(fallbackVideoUrl);
        return; // Will trigger useEffect to reload with fallback
      }

      // If fallback also fails, log error but keep trying
      console.error('❌ Both R2 and local video failed to load');
    };

    // Handle video loaded
    const handleLoadedData = () => {
      console.log('📹 Video data loaded');
      if (!isPlaying) {
        attemptPlay();
      }
    };

    // Set up event listeners
    videoEl.addEventListener('canplay', handleCanPlay);
    videoEl.addEventListener('canplaythrough', handleCanPlayThrough);
    videoEl.addEventListener('loadeddata', handleLoadedData);
    videoEl.addEventListener('error', handleError);
    
    // Ensure video is muted for autoplay
    videoEl.muted = true;
    videoEl.volume = 0;

    // Strategy 5: Force load video immediately
    videoEl.load();

    // Strategy 6: Retry load if not loading after delay
    loadTimeout = setTimeout(() => {
      if (videoEl.readyState === 0 && videoEl.networkState === 0) {
        console.log('🔄 Video not loading, retrying...');
        videoEl.load();
      }
    }, 500);

    // Strategy 7: Periodic check to ensure video is playing
    const playCheckInterval = setInterval(() => {
      if (videoEl.paused && !videoEl.ended && videoEl.readyState >= 2) {
        console.log('🔄 Video paused, attempting to resume...');
        attemptPlay();
      }
    }, 2000);

    // Cleanup
    return () => {
      if (retryTimeout) clearTimeout(retryTimeout);
      if (loadTimeout) clearTimeout(loadTimeout);
      clearInterval(playCheckInterval);
      
      if (playPromise) {
        videoEl.pause();
        playPromise.catch(() => {}); // Swallow errors
      }
      
      videoEl.removeEventListener('canplay', handleCanPlay);
      videoEl.removeEventListener('canplaythrough', handleCanPlayThrough);
      videoEl.removeEventListener('loadeddata', handleLoadedData);
      videoEl.removeEventListener('error', handleError);
    };
  }, [currentVideoSrc, primaryVideoUrl, fallbackVideoUrl]);

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
      
      {/* Homepage content */}
      <div className="relative min-h-screen w-full overflow-hidden homepage-scrollbar">
      {/* Full-screen video background - osamason video only, fully visible */}
      {/* Foolproof implementation with R2 CDN primary + local fallback */}
      <video
        ref={videoRef}
        src={currentVideoSrc}
        autoPlay
        loop
        muted
        playsInline
        preload="auto"
        crossOrigin={currentVideoSrc.startsWith('http') ? "anonymous" : undefined}
        className="fixed inset-0 w-screen h-screen object-cover z-0 pointer-events-none opacity-100"
        style={{ 
          width: '100vw', 
          height: '100vh', 
          objectFit: 'cover',
          zIndex: 0,
          backgroundColor: 'transparent'
        }}
        onPlay={() => {
          console.log('✅ Background video started playing');
        }}
        onPause={() => {
          // Auto-resume if paused unintentionally
          const videoEl = videoRef.current;
          if (videoEl && !videoEl.ended && videoEl.readyState >= 2) {
            setTimeout(() => {
              videoEl.play().catch(() => {});
            }, 100);
          }
        }}
        onEnded={() => {
          // Restart if video ends (shouldn't happen with loop, but just in case)
          const videoEl = videoRef.current;
          if (videoEl) {
            videoEl.currentTime = 0;
            videoEl.play().catch(() => {});
          }
        }}
      />

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
            to={ROUTES.PRIVACY}
            className="text-white/70 hover:text-white/90 transition-colors duration-200 underline"
          >
            Privacy Policy
          </Link>
        </div>
      </footer>
    </div>
    </>
  );
};
