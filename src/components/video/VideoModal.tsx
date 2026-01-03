import { motion, AnimatePresence } from 'framer-motion';
import { Video } from '@/types';
import { ScanLines } from '@/components/ui/ScanLines';
import { GlitchOverlay } from '@/components/ui/GlitchOverlay';
import { useEffect, useRef, useState } from 'react';

/**
 * VideoModal
 * 
 * Video-First: Full-screen video player
 * Oliver: Dim everything else; the video is the only light
 * Strauss: Bold, viral-worthy close button
 * Weirdcore: Glitch effects, scan lines
 */

interface VideoModalProps {
  isOpen: boolean;
  onClose: () => void;
  video: Video | null;
  initialPosition?: { x: number; y: number; width: number; height: number } | null;
}

export const VideoModal = ({ isOpen, onClose, video, initialPosition }: VideoModalProps) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);
  
  // Calculate animation values for smooth zoom-in from clicked position
  const getAnimationValues = () => {
    if (!initialPosition) {
      // Fallback: animate from center with scale
      return {
        initial: { scale: 0.3, opacity: 0, x: 0, y: 0 },
        animate: { scale: 1, opacity: 1, x: 0, y: 0 },
        exit: { scale: 0.3, opacity: 0, x: 0, y: 0 },
      };
    }
    
    // Calculate viewport center (absolute position)
    const viewportCenterX = window.innerWidth / 2;
    const viewportCenterY = window.innerHeight / 2;
    
    // Calculate initial position relative to viewport (accounting for scroll)
    const initialX = initialPosition.x - window.scrollX;
    const initialY = initialPosition.y - window.scrollY;
    
    // Calculate offset from center in pixels
    const offsetX = initialX - viewportCenterX;
    const offsetY = initialY - viewportCenterY;
    
    // Calculate initial scale based on element size vs target size
    const targetWidth = window.innerWidth * 0.95;
    const initialScale = Math.min(initialPosition.width / targetWidth, 0.6);
    
    return {
      initial: { 
        scale: initialScale, 
        opacity: 0,
        x: offsetX,
        y: offsetY,
      },
      animate: { 
        scale: 1, 
        opacity: 1,
        x: 0,
        y: 0,
      },
      exit: { 
        scale: initialScale, 
        opacity: 0,
        x: offsetX,
        y: offsetY,
      },
    };
  };
  
  const animationValues = getAnimationValues();

  // Handle keyboard navigation
  useEffect(() => {
    if (!isOpen) return;

    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };

    document.addEventListener('keydown', handleEscape);
    // Prevent body scroll when modal is open
    document.body.style.overflow = 'hidden';

    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.body.style.overflow = 'unset';
    };
  }, [isOpen, onClose]);

  // Reset video when modal opens/closes or video changes
  useEffect(() => {
    if (isOpen && video && videoRef.current) {
      setIsLoading(true);
      setHasError(false);
      const videoEl = videoRef.current;
      
      // Track pending play promise to cancel on cleanup
      let playPromise: Promise<void> | null = null;
      
      // Reset and load video
      videoEl.load();
      
      const handleCanPlay = () => {
        setIsLoading(false);
        // Auto-play when ready
        playPromise = videoEl.play();
        playPromise.catch((err) => {
          // Ignore AbortError (video was removed/paused during play)
          if (err.name !== 'AbortError') {
            console.warn('Autoplay prevented:', err);
          }
          setIsLoading(false);
        });
      };

      const handleError = () => {
        setIsLoading(false);
        setHasError(true);
      };

      videoEl.addEventListener('canplay', handleCanPlay, { once: true });
      videoEl.addEventListener('error', handleError, { once: true });

      return () => {
        // Cancel pending play promise to prevent AbortError
        if (playPromise) {
          videoEl.pause();
          playPromise.catch(() => {}); // Swallow any errors from cancelled promise
        }
        
        videoEl.removeEventListener('canplay', handleCanPlay);
        videoEl.removeEventListener('error', handleError);
      };
    } else if (!isOpen && videoRef.current) {
      // Pause video when modal closes
      videoRef.current.pause();
    }
  }, [isOpen, video]);

  if (!video) return null;

  const needsRotation = video.rotation === 270;

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Oliver: Backdrop - dark, dims everything */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/95 z-[9998] cursor-pointer"
          />

          {/* Video container (the light) - FULL SCREEN with zoom-in */}
          <motion.div
            initial={animationValues.initial}
            animate={animationValues.animate}
            exit={animationValues.exit}
            transition={{ 
              duration: 0.7, 
              ease: [0.16, 1, 0.3, 1],
              opacity: { duration: 0.5 }
            }}
            style={{
              position: 'fixed',
              left: '50%',
              top: '50%',
              width: '95vw',
              height: '95vh',
              maxWidth: '95vw',
              maxHeight: '95vh',
              zIndex: 9999, // Very high z-index to ensure it appears above everything
              pointerEvents: 'none',
              transformOrigin: 'center center',
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div 
              className="relative w-full h-full bg-black pointer-events-auto group flex items-center justify-center"
              style={{
                transform: 'translate(-50%, -50%)',
              }}
            >
              {/* Weirdcore: Scan lines */}
              <ScanLines intensity="subtle" speed="slow" />
              
              {/* Weirdcore: Glitch overlay */}
              <GlitchOverlay intensity="subtle" trigger="random" />
              
              {/* Loading state */}
              {isLoading && !hasError && (
                <div className="absolute inset-0 flex items-center justify-center z-20">
                  <div className="w-16 h-16 border-4 border-white border-t-transparent rounded-full animate-spin" />
                </div>
              )}

              {/* Error state */}
              {hasError && (
                <div className="absolute inset-0 flex items-center justify-center z-20">
                  <div className="text-center p-8">
                    <p className="text-red-gore text-xl font-bold mb-2">Failed to load video</p>
                    <p className="text-zinc-400 text-sm">{video.title}</p>
                  </div>
                </div>
              )}
              
              {/* Video player - centered and large, preserve rotation if 270° */}
              <video
                ref={videoRef}
                src={video.videoUrl}
                controls
                autoPlay
                playsInline
                preload="metadata"
                crossOrigin="anonymous"
                className={`w-full h-full max-w-full max-h-full object-contain relative z-10 ${isLoading ? 'opacity-0' : 'opacity-100'} transition-opacity duration-300`}
                style={{
                  transform: needsRotation ? 'rotate(270deg)' : 'none',
                  transformOrigin: 'center center',
                }}
                onError={() => {
                  setHasError(true);
                  setIsLoading(false);
                }}
                onLoadedData={() => {
                  setIsLoading(false);
                }}
              >
                Your browser does not support the video tag.
              </video>
              
              {/* Video metadata - matching legend format: artist/ song/ tour and date */}
              <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/90 via-black/70 to-transparent p-6 md:p-8 z-20">
                {/* Format: artist / song / tour (with spaces before and after slashes) */}
                <h2 className="text-2xl md:text-4xl font-black text-white mb-2 uppercase tracking-tighter">
                  {video.artist && video.song && video.tour ? (
                    <span>{video.artist} / {video.song} / {video.tour}</span>
                  ) : video.artist && video.song ? (
                    <span>{video.artist} / {video.song}</span>
                  ) : video.title ? (
                    <span>{video.title}</span>
                  ) : null}
                </h2>
                {/* Date */}
                {video.date ? (
                  <div className="text-sm md:text-base text-zinc-400">
                    {video.date}
                  </div>
                ) : (
                  <div className="flex items-center gap-3 text-sm md:text-base text-zinc-400">
                    {video.client && (
                      <span className="font-medium">{video.client}</span>
                    )}
                    {video.year && (
                      <>
                        <span>•</span>
                        <span>{video.year}</span>
                      </>
                    )}
                  </div>
                )}
              </div>
              
              {/* Strauss: Bold green close button */}
              <motion.button
                onClick={onClose}
                className="absolute top-4 right-4 w-12 h-12 md:w-14 md:h-14 bg-white text-black font-black rounded-full hover:bg-white/90 transition-colors duration-200 flex items-center justify-center text-2xl md:text-3xl leading-none z-30 shadow-lg"
                aria-label="Close video"
                whileHover={{ scale: 1.1, rotate: 90 }}
                whileTap={{ scale: 0.9 }}
              >
                ×
              </motion.button>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};


