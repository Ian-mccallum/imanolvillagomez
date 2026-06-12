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
 * - Industrial wordmark (Barlow Condensed) + nav under lockup width on desktop
 * - Centered lowkey nav links under the brand lockup
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
      {/* Background video: omit crossOrigin — anonymous mode requires R2 CORS and breaks playback if misconfigured */}
      <video
        ref={videoRef}
        src={currentVideoSrc}
        autoPlay
        loop
        muted
        playsInline
        preload="auto"
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
        <div className="inline-block max-w-full text-center">
          {/* Hero lockup — width sets the nav row below on desktop */}
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
            className="font-logo text-balance whitespace-nowrap uppercase leading-[0.82] tracking-[0.01em] text-white"
            style={{
              fontSize: 'clamp(1.75rem, 9vw, 5.25rem)',
              textShadow:
                '0 1px 0 rgba(0, 0, 0, 0.95), 0 6px 32px rgba(0, 0, 0, 0.85)',
              WebkitFontSmoothing: 'antialiased',
            }}
          >
            IMANOL VILLAGOMEZ
          </motion.h1>

          {/* Nav spans full name width on md+; stacked on mobile */}
          <motion.nav
            aria-label="Site sections"
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2, ease: [0.22, 1, 0.36, 1] }}
            className="mt-6 flex w-full flex-col items-center gap-2.5 sm:mt-8 md:mt-10 md:flex-row md:justify-between md:gap-0 lg:mt-12"
          >
            {navItems.map((item) => (
              <Link
                key={item.path}
                to={item.path}
                className="text-2xl sm:text-3xl font-semibold uppercase tracking-wide text-white/60 transition-colors duration-200 hover:text-white/90 min-h-[56px] flex items-center justify-center md:text-[clamp(1.125rem,2.8vw,2rem)] md:font-semibold md:tracking-wider lg:text-3xl"
              >
                {item.label}
              </Link>
            ))}
          </motion.nav>
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
