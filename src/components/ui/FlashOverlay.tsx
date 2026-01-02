import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/utils';

/**
 * FlashOverlay
 * 
 * Indie sleaze aesthetic: Flash photography effect (overexposed)
 * Creates that raw, unpolished, DIY aesthetic from 2010s Tumblr era
 * STEP-221: Create FlashOverlay component
 */

interface FlashOverlayProps {
  intensity?: 'subtle' | 'medium' | 'strong';
  isActive?: boolean;
  className?: string;
}

export const FlashOverlay = ({ 
  intensity = 'medium',
  isActive = false,
  className = '' 
}: FlashOverlayProps) => {
  const intensityClasses = {
    subtle: 'opacity-20',
    medium: 'opacity-30',
    strong: 'opacity-40',
  };

  return (
    <AnimatePresence>
      {isActive && (
        <motion.div
          className={cn(
            'absolute inset-0 pointer-events-none bg-white',
            intensityClasses[intensity],
            className
          )}
          initial={{ opacity: 0 }}
          animate={{ opacity: [0, 0.5, 0.3, 0] }}
          exit={{ opacity: 0 }}
          transition={{
            duration: 0.2,
            times: [0, 0.3, 0.7, 1],
            ease: 'easeInOut'
          }}
        />
      )}
    </AnimatePresence>
  );
};
