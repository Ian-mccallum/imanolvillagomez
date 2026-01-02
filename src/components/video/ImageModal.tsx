import { motion, AnimatePresence } from 'framer-motion';
import { Photo } from '@/types';
import { useEffect, useState } from 'react';

/**
 * ImageModal
 * 
 * Zoom-in animation for photos
 * Oliver: Dim everything else; the image is the only light
 * Strauss: Bold, viral-worthy
 */

interface ImageModalProps {
  isOpen: boolean;
  onClose: () => void;
  photo: Photo | null;
  initialPosition?: { x: number; y: number; width: number; height: number } | null;
}

export const ImageModal = ({ isOpen, onClose, photo, initialPosition }: ImageModalProps) => {
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);
  
  // Calculate animation values for smooth zoom-in from clicked position
  const getAnimationValues = () => {
    if (!initialPosition) {
      // Fallback: animate from center with scale
      return {
        initial: { scale: 0.5, opacity: 0, x: 0, y: 0 },
        animate: { scale: 1, opacity: 1, x: 0, y: 0 },
        exit: { scale: 0.5, opacity: 0, x: 0, y: 0 },
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
    const targetWidth = window.innerWidth * 0.9;
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

  // Reset state when photo changes
  useEffect(() => {
    if (photo) {
      setIsLoading(true);
      setHasError(false);
    }
  }, [photo]);

  if (!photo) return null;

  const handleImageLoad = () => {
    setIsLoading(false);
  };

  const handleImageError = () => {
    setIsLoading(false);
    setHasError(true);
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/95 z-[9998] cursor-pointer"
          />

          {/* Image container with zoom-in animation */}
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
              maxWidth: '90vw',
              maxHeight: '90vh',
              zIndex: 9999, // Very high z-index to ensure it appears above everything
              pointerEvents: 'none',
              transformOrigin: 'center center',
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div 
              className="relative w-full h-full pointer-events-auto flex items-center justify-center"
              style={{
                transform: 'translate(-50%, -50%)',
              }}
            >
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
                    <p className="text-red-gore text-xl font-bold mb-2">Failed to load image</p>
                    <p className="text-zinc-400 text-sm">{photo.title || 'Photo'}</p>
                  </div>
                </div>
              )}

              {/* Image */}
              <img
                src={photo.imageUrl}
                alt={photo.title || 'Photo'}
                className={`max-w-full max-h-[90vh] md:max-h-[95vh] object-contain ${isLoading ? 'opacity-0' : 'opacity-100'} transition-opacity duration-300`}
                onLoad={handleImageLoad}
                onError={handleImageError}
              />
              
              {/* Photo metadata */}
              {(photo.title || photo.client || photo.year) && (
                <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/90 via-black/70 to-transparent p-6 md:p-8 z-20">
                  {photo.title && (
                    <h2 className="text-2xl md:text-4xl font-black text-white mb-2 uppercase tracking-tighter">
                      {photo.title}
                    </h2>
                  )}
                  <div className="flex items-center gap-3 text-sm md:text-base text-zinc-400">
                    {photo.client && (
                      <span className="font-medium">{photo.client}</span>
                    )}
                    {photo.year && (
                      <>
                        {photo.client && <span>•</span>}
                        <span>{photo.year}</span>
                      </>
                    )}
                  </div>
                </div>
              )}
              
              {/* Close button */}
              <motion.button
                onClick={onClose}
                className="absolute top-4 right-4 w-12 h-12 md:w-14 md:h-14 bg-white text-black font-black rounded-full hover:bg-white/90 transition-colors duration-200 flex items-center justify-center text-2xl md:text-3xl leading-none z-30 shadow-lg"
                aria-label="Close image"
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

