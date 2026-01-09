import { motion } from 'framer-motion';
import { useEffect, useState } from 'react';
import { cn } from '@/utils';
import { useResponsive } from '@/hooks/useResponsive';

/**
 * GlitchOverlay
 * 
 * Weirdcore-inspired: Intentional glitch effects
 * Color channel separation, digital artifacts
 */

interface GlitchOverlayProps {
  intensity?: 'subtle' | 'medium' | 'strong';
  trigger?: 'hover' | 'always' | 'random';
  className?: string;
}

export const GlitchOverlay = ({ 
  intensity: propIntensity = 'medium', 
  trigger = 'hover',
  className = '' 
}: GlitchOverlayProps) => {
  const [isGlitching, setIsGlitching] = useState(false);
  const { prefersReducedMotion, isMobile, isTablet } = useResponsive();
  
  // Override intensity based on device and accessibility preferences
  const intensity = prefersReducedMotion 
    ? 'subtle' 
    : propIntensity === 'medium' && isMobile
      ? 'subtle'
      : propIntensity === 'strong' && (isMobile || isTablet)
        ? isMobile ? 'subtle' : 'medium'
        : propIntensity;

  const intensityClasses = {
    subtle: 'opacity-20',
    medium: 'opacity-40',
    strong: 'opacity-60',
  };

  useEffect(() => {
    if (trigger === 'random') {
      const interval = setInterval(() => {
        setIsGlitching(true);
        setTimeout(() => setIsGlitching(false), 100);
      }, Math.random() * 5000 + 3000);
      return () => clearInterval(interval);
    }
  }, [trigger]);

  // Adjust animation frequency for mobile (less frequent)
  const animationDuration = isMobile ? 0.1 : 0.1;
  const repeatDelay = isMobile ? 3 : 2;

  const glitchVariants = {
    glitch: {
      x: [0, -2, 2, -1, 1, 0],
      y: [0, 1, -1, 0.5, -0.5, 0],
      transition: {
        duration: animationDuration,
        repeat: prefersReducedMotion ? 0 : 3,
        repeatDelay: prefersReducedMotion ? 0 : repeatDelay,
        ease: 'easeInOut',
      },
    },
    idle: {
      x: 0,
      y: 0,
    },
  };

  if (trigger === 'always') {
    return (
      <motion.div
        className={cn('absolute inset-0 pointer-events-none', intensityClasses[intensity], className)}
        variants={glitchVariants}
        animate="glitch"
        style={{
          background: 'linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.05), transparent)',
          mixBlendMode: 'difference',
        }}
      />
    );
  }

  if (trigger === 'hover') {
    return (
      <motion.div
        className={cn('absolute inset-0 pointer-events-none opacity-0 group-hover:opacity-100', intensityClasses[intensity], className)}
        variants={glitchVariants}
        whileHover="glitch"
        style={{
          background: 'linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.05), transparent)',
          mixBlendMode: 'difference',
        }}
      />
    );
  }

  return (
    <motion.div
      className={cn('absolute inset-0 pointer-events-none', intensityClasses[intensity], className)}
      variants={glitchVariants}
      animate={isGlitching ? 'glitch' : 'idle'}
      style={{
        background: 'linear-gradient(90deg, transparent, rgba(34, 197, 94, 0.1), transparent)',
        mixBlendMode: 'difference',
      }}
    />
  );
};

