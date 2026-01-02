import { motion } from 'framer-motion';
import { PlatformInfo } from '@/utils/platform';

interface GalleryNavigationProps {
  currentIndex: number;
  totalItems: number;
  onPrevious: () => void;
  onNext: () => void;
  platform: PlatformInfo;
}

export const GalleryNavigation = ({
  currentIndex,
  totalItems,
  onPrevious,
  onNext,
  platform,
}: GalleryNavigationProps) => {
  // Hide navigation if only one item
  if (totalItems <= 1) return null;
  
  const showButtons = platform.isWeb; // Show buttons on desktop, hide on mobile (use swipe)
  
  return (
    <>
      {/* Previous Button */}
      {showButtons && (
        <motion.button
          onClick={onPrevious}
          className="absolute left-4 top-1/2 -translate-y-1/2 w-12 h-12 md:w-14 md:h-14 bg-white/10 hover:bg-white/20 text-white rounded-full flex items-center justify-center transition-colors opacity-0 group-hover:opacity-100 z-30 focus:outline-none focus:ring-2 focus:ring-white/50"
          aria-label="Previous item"
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
        </motion.button>
      )}
      
      {/* Next Button */}
      {showButtons && (
        <motion.button
          onClick={onNext}
          className="absolute right-4 top-1/2 -translate-y-1/2 w-12 h-12 md:w-14 md:h-14 bg-white/10 hover:bg-white/20 text-white rounded-full flex items-center justify-center transition-colors opacity-0 group-hover:opacity-100 z-30 focus:outline-none focus:ring-2 focus:ring-white/50"
          aria-label="Next item"
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </motion.button>
      )}
      
      {/* Gallery Indicator (dots) */}
      {totalItems > 1 && (
        <div className="absolute bottom-20 left-1/2 -translate-x-1/2 flex gap-2 z-30">
          {Array.from({ length: totalItems }).map((_, index) => (
            <button
              key={index}
              className={`w-2 h-2 rounded-full transition-all ${
                index === currentIndex ? 'bg-white w-8' : 'bg-white/40'
              }`}
              aria-label={`Go to item ${index + 1}`}
              onClick={() => {
                // This would need to be handled by parent component
                // For now, just show the indicator
              }}
            />
          ))}
        </div>
      )}
    </>
  );
};

