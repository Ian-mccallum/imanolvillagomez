import { motion, AnimatePresence } from 'framer-motion';
import { useEffect, useRef, useState, useMemo, useCallback } from 'react';
import { createPortal } from 'react-dom';
import { MediaItem } from '@/types/media';
import { detectPlatform } from '@/utils/platform';
import { useSwipeGesture } from '@/hooks/useSwipeGesture';
import { preloadVideo, preloadImage } from '@/utils/preload';
import { VideoPlayer } from './VideoPlayer';
import { ImageViewer } from './ImageViewer';
import { useResponsive } from '@/hooks/useResponsive';

/**
 * FullscreenModal
 * 
 * Clean, minimal fullscreen modal with custom video controls
 * - True fullscreen (100vw/100vh)
 * - Custom video player UI (no browser controls)
 * - Always-accessible exit button
 * - Excellent UX with clear, intuitive controls
 */

export interface FullscreenModalProps {
  isOpen: boolean;
  onClose: () => void;
  items: MediaItem[];
  initialIndex?: number;
  initialPosition?: { x: number; y: number; width: number; height: number };
  
  // Configuration
  enableGalleryNavigation?: boolean;
  enableNativeFullscreen?: boolean;
  enableTouchGestures?: boolean;
  enableKeyboardNavigation?: boolean;
  
  // Callbacks
  onItemChange?: (item: MediaItem, index: number) => void;
}

export const FullscreenModal = ({
  isOpen,
  onClose,
  items,
  initialIndex = 0,
  initialPosition,
  enableGalleryNavigation = true,
  enableNativeFullscreen = true,
  enableTouchGestures = true,
  enableKeyboardNavigation = true,
  onItemChange,
}: FullscreenModalProps) => {
  const [currentIndex, setCurrentIndex] = useState(initialIndex);
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);
  const [showControls, setShowControls] = useState(true);
  const [controlsTimeout, setControlsTimeout] = useState<NodeJS.Timeout | null>(null);
  const modalRef = useRef<HTMLDivElement>(null);
  const platform = useMemo(() => detectPlatform(), []);
  const { isMobile } = useResponsive();
  
  // Get current item
  const currentItem = useMemo(() => {
    if (items.length === 0) return null;
    return items[currentIndex] || null;
  }, [items, currentIndex]);
  
  // Calculate animation values for smooth zoom-in from clicked position
  const getAnimationValues = useCallback(() => {
    if (!initialPosition) {
      return {
        initial: { scale: 0.3, opacity: 0 },
        animate: { scale: 1, opacity: 1 },
        exit: { scale: 0.3, opacity: 0 },
      };
    }
    
    const viewportCenterX = window.innerWidth / 2;
    const viewportCenterY = window.innerHeight / 2;
    const initialX = initialPosition.x - (window.scrollX || 0);
    const initialY = initialPosition.y - (window.scrollY || 0);
    const offsetX = initialX - viewportCenterX;
    const offsetY = initialY - viewportCenterY;
    const targetWidth = window.innerWidth;
    const initialScale = Math.min(initialPosition.width / targetWidth, 0.6);
    
    return {
      initial: { scale: initialScale, opacity: 0, x: offsetX, y: offsetY },
      animate: { scale: 1, opacity: 1, x: 0, y: 0 },
      exit: { scale: initialScale, opacity: 0, x: offsetX, y: offsetY },
    };
  }, [initialPosition]);
  
  const animationValues = getAnimationValues();
  
  // Navigation handlers (defined before keyboard handler)
  const handleNext = useCallback(() => {
    if (items.length <= 1) return;
    const nextIndex = (currentIndex + 1) % items.length;
    setCurrentIndex(nextIndex);
    setIsLoading(true);
    setHasError(false);
    if (onItemChange) {
      onItemChange(items[nextIndex], nextIndex);
    }
  }, [currentIndex, items, onItemChange]);
  
  const handlePrevious = useCallback(() => {
    if (items.length <= 1) return;
    const prevIndex = currentIndex === 0 ? items.length - 1 : currentIndex - 1;
    setCurrentIndex(prevIndex);
    setIsLoading(true);
    setHasError(false);
    if (onItemChange) {
      onItemChange(items[prevIndex], prevIndex);
    }
  }, [currentIndex, items, onItemChange]);
  
  // Handle keyboard navigation
  useEffect(() => {
    if (!isOpen || !enableKeyboardNavigation) return;
    
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
        return;
      }
      
      if (!enableGalleryNavigation || items.length <= 1) return;
      
      if (e.key === 'ArrowLeft') {
        e.preventDefault();
        handlePrevious();
      } else if (e.key === 'ArrowRight') {
        e.preventDefault();
        handleNext();
      }
    };
    
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, enableKeyboardNavigation, enableGalleryNavigation, items.length, onClose, handlePrevious, handleNext]);
  
  // Prevent body scroll
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);
  
  // Update current index when initialIndex changes
  useEffect(() => {
    if (isOpen && initialIndex >= 0 && initialIndex < items.length) {
      setCurrentIndex(initialIndex);
    }
  }, [isOpen, initialIndex, items.length]);
  
  // Reset state when item changes
  useEffect(() => {
    if (currentItem) {
      setIsLoading(true);
      setHasError(false);
    }
  }, [currentItem]);
  
  // Preload next and previous items
  useEffect(() => {
    if (!isOpen || items.length <= 1) return;
    
    const preloadItems = async () => {
      const nextIndex = (currentIndex + 1) % items.length;
      const nextItem = items[nextIndex];
      if (nextItem) {
        try {
          if (nextItem.type === 'video' && nextItem.videoUrl) {
            await preloadVideo(nextItem.videoUrl);
          } else if (nextItem.type === 'image' && nextItem.imageUrl) {
            await preloadImage(nextItem.imageUrl);
          }
        } catch (err) {
          // Silent fail
        }
      }
      
      const prevIndex = currentIndex === 0 ? items.length - 1 : currentIndex - 1;
      const prevItem = items[prevIndex];
      if (prevItem) {
        try {
          if (prevItem.type === 'video' && prevItem.videoUrl) {
            await preloadVideo(prevItem.videoUrl);
          } else if (prevItem.type === 'image' && prevItem.imageUrl) {
            await preloadImage(prevItem.imageUrl);
          }
        } catch (err) {
          // Silent fail
        }
      }
    };
    
    preloadItems();
  }, [isOpen, currentIndex, items]);
  
  // Handle loading/error states
  const handleLoad = useCallback(() => {
    setIsLoading(false);
    setHasError(false);
  }, []);
  
  const handleError = useCallback(() => {
    setIsLoading(false);
    setHasError(true);
  }, []);
  
  // Show controls and reset auto-hide timer
  const showControlsWithTimer = useCallback(() => {
    setShowControls(true);
    
    // Clear existing timer
    if (controlsTimeout) {
      clearTimeout(controlsTimeout);
    }
    
    // Auto-hide after 3 seconds (only for videos)
    if (currentItem?.type === 'video') {
      const timer = setTimeout(() => {
        setShowControls(false);
      }, 3000);
      setControlsTimeout(timer);
    }
  }, [controlsTimeout, currentItem?.type]);
  
  // Cleanup timer on unmount
  useEffect(() => {
    return () => {
      if (controlsTimeout) {
        clearTimeout(controlsTimeout);
      }
    };
  }, [controlsTimeout]);
  
  // Swipe gesture handlers
  const swipeHandlers = useSwipeGesture({
    onSwipeLeft: enableGalleryNavigation && items.length > 1 ? handleNext : undefined,
    onSwipeRight: enableGalleryNavigation && items.length > 1 ? handlePrevious : undefined,
    onSwipeDown: enableTouchGestures ? onClose : undefined,
    threshold: 50,
    velocityThreshold: 0.3,
    preventDefault: true,
  });
  
  if (!currentItem) return null;
  
  // Check if video is vertical (portrait orientation) for mobile arrow positioning
  const isVerticalVideo = currentItem.type === 'video' && currentItem.rotation === 270;
  const shouldPositionArrowsBelow = isMobile && isVerticalVideo;
  
  const modalContent = (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black"
            style={{
              zIndex: 99998,
              paddingTop: platform.isIOS ? `env(safe-area-inset-top)` : 0,
              paddingBottom: platform.isIOS ? `env(safe-area-inset-bottom)` : 0,
              paddingLeft: platform.isIOS ? `env(safe-area-inset-left)` : 0,
              paddingRight: platform.isIOS ? `env(safe-area-inset-right)` : 0,
            }}
          />
          
          {/* Modal content - true fullscreen */}
          <motion.div
            ref={modalRef}
            initial={animationValues.initial}
            animate={animationValues.animate}
            exit={animationValues.exit}
            transition={{ 
              duration: 0.6, 
              ease: [0.16, 1, 0.3, 1],
            }}
            style={{
              position: 'fixed',
              left: 0,
              top: 0,
              width: '100vw',
              height: '100vh',
              zIndex: 99999,
              pointerEvents: 'none',
            }}
            onClick={(e) => {
              e.stopPropagation();
              showControlsWithTimer();
            }}
            onMouseMove={() => {
              if (currentItem?.type === 'video') {
                showControlsWithTimer();
              }
            }}
            {...(enableTouchGestures ? swipeHandlers : {})}
            role="dialog"
            aria-modal="true"
            aria-label={`Fullscreen ${currentItem.type === 'video' ? 'video' : 'image'} viewer`}
          >
            <div 
              className="relative w-full h-full pointer-events-auto flex items-center justify-center"
              style={{
                paddingTop: platform.isIOS ? `env(safe-area-inset-top)` : 0,
                paddingBottom: platform.isIOS ? `env(safe-area-inset-bottom)` : 0,
                paddingLeft: platform.isIOS ? `env(safe-area-inset-left)` : 0,
                paddingRight: platform.isIOS ? `env(safe-area-inset-right)` : 0,
                minWidth: '100%',
                minHeight: '100%',
              }}
            >
              {/* Video or Image content */}
              {currentItem.type === 'video' ? (
                <VideoPlayer
                  item={currentItem}
                  platform={platform}
                  enableNativeFullscreen={enableNativeFullscreen}
                  onLoad={handleLoad}
                  onError={handleError}
                  isLoading={isLoading}
                  hasError={hasError}
                  showControls={showControls}
                  onControlsToggle={showControlsWithTimer}
                />
              ) : (
                <ImageViewer
                  item={currentItem}
                  platform={platform}
                  enableTouchGestures={enableTouchGestures}
                  onLoad={handleLoad}
                  onError={handleError}
                  isLoading={isLoading}
                  hasError={hasError}
                />
              )}
              
              {/* Always-visible Exit Button - Below Header (Never hidden) */}
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onClose();
                }}
                className="absolute top-20 md:top-24 right-6 w-14 h-14 bg-white/15 hover:bg-white/25 backdrop-blur-md text-white rounded-full flex items-center justify-center transition-all pointer-events-auto z-[100] focus:outline-none focus:ring-2 focus:ring-white/50 shadow-xl hover:scale-110 active:scale-95 border border-white/10"
                aria-label="Close modal"
              >
                <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
              
              {/* Gallery Navigation - Always visible arrows if multiple items */}
              {enableGalleryNavigation && items.length > 1 && (
                <>
                      {/* Previous Button - Positioned below video on mobile for vertical videos, otherwise on left */}
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handlePrevious();
                        }}
                        className={`absolute w-16 h-16 bg-white/15 hover:bg-white/25 backdrop-blur-md text-white rounded-full flex items-center justify-center transition-all pointer-events-auto z-50 focus:outline-none focus:ring-2 focus:ring-white/50 shadow-xl hover:scale-110 active:scale-95 border border-white/10 ${
                          shouldPositionArrowsBelow 
                            ? 'bottom-20 left-[calc(50%-4.5rem)]' 
                            : 'left-6 top-1/2 -translate-y-1/2'
                        }`}
                        aria-label="Previous item"
                      >
                        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M15 19l-7-7 7-7" />
                        </svg>
                      </button>
                      
                      {/* Next Button - Positioned below video on mobile for vertical videos, otherwise on right */}
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleNext();
                        }}
                        className={`absolute w-16 h-16 bg-white/15 hover:bg-white/25 backdrop-blur-md text-white rounded-full flex items-center justify-center transition-all pointer-events-auto z-50 focus:outline-none focus:ring-2 focus:ring-white/50 shadow-xl hover:scale-110 active:scale-95 border border-white/10 ${
                          shouldPositionArrowsBelow 
                            ? 'bottom-20 left-[calc(50%+1.5rem)]' 
                            : 'right-6 top-1/2 -translate-y-1/2'
                        }`}
                        aria-label="Next item"
                      >
                        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M9 5l7 7-7 7" />
                        </svg>
                      </button>
                      
                      {/* Gallery Counter - Bottom Center (Simple, no bar) - Adjust position for mobile vertical videos */}
                      <div className={`absolute bg-black/60 backdrop-blur-md text-white px-4 py-2 rounded-full text-sm font-medium pointer-events-auto z-50 shadow-lg ${
                        shouldPositionArrowsBelow 
                          ? 'bottom-6 left-1/2 -translate-x-1/2' 
                          : 'bottom-6 left-1/2 -translate-x-1/2'
                      }`}>
                        {currentIndex + 1} / {items.length}
                      </div>
                </>
              )}
              
              {/* Minimal Metadata - Above video controls (only if available) - Bigger space */}
              {showControls && (currentItem.title || currentItem.artist || currentItem.client) && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 10 }}
                  transition={{ duration: 0.2 }}
                  className="absolute bottom-24 left-6 bg-black/60 backdrop-blur-md text-white px-6 py-4 rounded-lg max-w-md pointer-events-auto z-50 shadow-lg"
                >
                  {currentItem.type === 'video' ? (
                    <>
                      {currentItem.artist && currentItem.song && (
                        <div className="font-semibold text-base md:text-lg leading-tight">{currentItem.artist} / {currentItem.song}</div>
                      )}
                      {currentItem.title && !currentItem.artist && (
                        <div className="font-semibold text-base md:text-lg leading-tight">{currentItem.title}</div>
                      )}
                      {currentItem.date && (
                        <div className="text-sm text-white/70 mt-2">{currentItem.date}</div>
                      )}
                    </>
                  ) : (
                    <>
                      {currentItem.title && (
                        <div className="font-semibold text-base md:text-lg leading-tight">{currentItem.title}</div>
                      )}
                      {currentItem.client && (
                        <div className="text-sm text-white/70 mt-2">{currentItem.client}</div>
                      )}
                    </>
                  )}
                </motion.div>
              )}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );

  // Render modal in a portal to document.body to ensure it's above everything
  return typeof document !== 'undefined' 
    ? createPortal(modalContent, document.body)
    : null;
};
