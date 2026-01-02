import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useLocalStorage } from '@/hooks/useLocalStorage';

/**
 * EpilepsyWarning
 * 
 * Carson: Experimental typography, break the grid, bold statements
 * Oliver: Dark beauty, super grainy textures, gothic elegance
 * West: Minimalist perfectionism, bold unapologetic statements
 * Weirdcore: Glitch effects, digital artifacts
 * 
 * Aesthetic epilepsy warning that must be acknowledged before site access
 */

interface EpilepsyWarningProps {
  onAcknowledge: () => void;
}

export const EpilepsyWarning = ({ onAcknowledge }: EpilepsyWarningProps) => {
  const [hasAcknowledged, setHasAcknowledged] = useLocalStorage<boolean>(
    'epilepsy-warning-acknowledged',
    false
  );
  const [isVisible, setIsVisible] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [loadingProgress, setLoadingProgress] = useState(0);

  // Check localStorage on mount and sync with state
  useEffect(() => {
    if (typeof window !== 'undefined') {
      try {
        const stored = localStorage.getItem('epilepsy-warning-acknowledged');
        const acknowledged = stored ? JSON.parse(stored) === true : false;
        setIsVisible(!acknowledged);
      } catch {
        setIsVisible(true);
      }
    } else {
      setIsVisible(true);
    }
  }, [hasAcknowledged]);

  const handleAcknowledge = () => {
    setIsLoading(true);
    setLoadingProgress(0);
    
    // Smooth loading animation
    const duration = 1500; // 1.5 seconds
    const startTime = Date.now();
    
    const animate = () => {
      const elapsed = Date.now() - startTime;
      const progress = Math.min((elapsed / duration) * 100, 100);
      setLoadingProgress(progress);
      
      if (progress < 100) {
        requestAnimationFrame(animate);
      } else {
        // Loading complete
        setHasAcknowledged(true);
        setIsVisible(false);
        setTimeout(() => {
          onAcknowledge();
        }, 300);
      }
    };
    
    requestAnimationFrame(animate);
  };

  return (
    <AnimatePresence>
      {isVisible && (
        <>
          {/* Static grainy black background - gorecore/liveleak aesthetic */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.8 }}
            className="fixed inset-0 z-[10000]"
            style={{
              backgroundColor: '#000',
              backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 400 400' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='6.0' numOctaves='12' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)' opacity='1'/%3E%3C/svg%3E")`,
              backgroundSize: '100% 100%',
              backgroundRepeat: 'repeat',
              imageRendering: 'pixelated',
            }}
          />

          {/* Low-quality centered content - gorecore/liveleak aesthetic */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.8 }}
            className="fixed inset-0 z-[10002] flex items-center justify-center p-4 md:p-8"
          >
            {!isLoading ? (
              <div className="relative max-w-2xl w-full text-center">
              {/* WARNING in red */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4, duration: 0.6 }}
                className="relative"
              >
                <h1 
                  className="text-5xl md:text-7xl lg:text-8xl xl:text-9xl font-bold uppercase tracking-tight text-red-600"
                  style={{
                    imageRendering: 'pixelated',
                    letterSpacing: '0.02em',
                  }}
                >
                  WARNING
                </h1>
              </motion.div>

              {/* Subtitle */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5, duration: 0.6 }}
                className="mt-2 md:mt-3"
              >
                <h2 className="text-2xl md:text-4xl lg:text-5xl font-medium uppercase tracking-wider text-white/90" style={{ imageRendering: 'pixelated' }}>
                  EPILEPSY
                </h2>
              </motion.div>

              {/* Description text */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.7, duration: 0.6 }}
                className="mt-4 md:mt-6"
              >
                <p className="text-base md:text-lg text-white/80 leading-tight font-medium" style={{ imageRendering: 'pixelated' }}>
                  This website contains flashing lights, rapid motion, and visual effects that may trigger seizures in individuals with photosensitive epilepsy.
                </p>
              </motion.div>

              {/* Button - just border, no fill */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.9, duration: 0.6 }}
                className="mt-6 md:mt-8"
              >
                <motion.button
                  onClick={handleAcknowledge}
                  whileHover={{ opacity: 0.8 }}
                  whileTap={{ scale: 0.98 }}
                  className="px-4 md:px-6 py-2 md:py-2.5 border-2 border-white text-white font-medium uppercase tracking-wider text-sm md:text-base transition-opacity duration-200"
                  style={{
                    imageRendering: 'pixelated',
                    backgroundColor: 'transparent',
                  }}
                >
                  VIEW CONTENT
                </motion.button>
              </motion.div>
            </div>
            ) : (
              /* Loading animation - smooth, minimal, dark */
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.5 }}
                className="relative max-w-md w-full"
              >
                {/* Loading progress bar */}
                <div className="relative w-full h-1 bg-white/20 overflow-hidden" style={{ imageRendering: 'pixelated' }}>
                  <motion.div
                    className="absolute top-0 left-0 h-full bg-white"
                    initial={{ width: '0%' }}
                    animate={{ width: `${loadingProgress}%` }}
                    transition={{ duration: 0.1, ease: 'linear' }}
                    style={{ imageRendering: 'pixelated' }}
                  />
                </div>
                
                {/* Loading text */}
                <motion.p
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.2 }}
                  className="mt-4 text-sm md:text-base text-white/70 font-medium uppercase tracking-wider text-center"
                  style={{ imageRendering: 'pixelated' }}
                >
                  LOADING...
                </motion.p>
              </motion.div>
            )}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

