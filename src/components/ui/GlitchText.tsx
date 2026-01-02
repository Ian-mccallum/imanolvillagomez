import { motion } from 'framer-motion';
import { cn } from '@/utils';
import { useEffect, useState } from 'react';
import { useResponsive } from '@/hooks/useResponsive';

/**
 * GlitchText
 * 
 * Weirdcore-inspired: Enhanced glitch text effect with color channel separation
 * Carson-inspired: Experimental typography
 */

interface GlitchTextProps {
  children: React.ReactNode;
  className?: string;
  intensity?: 'subtle' | 'medium' | 'strong';
  trigger?: 'always' | 'hover' | 'random';
}

export const GlitchText = ({ 
  children, 
  className, 
  intensity: propIntensity = 'medium',
  trigger = 'always'
}: GlitchTextProps) => {
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
        setTimeout(() => setIsGlitching(false), 200);
      }, Math.random() * 4000 + 2000);
      return () => clearInterval(interval);
    } else if (trigger === 'always') {
      setIsGlitching(true);
    }
  }, [trigger]);

  // Adjust animation frequency for mobile (less frequent)
  const animationDuration = isMobile ? 0.1 : 0.15;
  const repeatDelay = isMobile ? 3 : 2;

  const glitchVariants = {
    glitch: {
      x: [0, -2, 2, -1, 1, 0],
      y: [0, 1, -1, 0.5, -0.5, 0],
      transition: {
        duration: animationDuration,
        repeat: prefersReducedMotion ? 0 : Infinity,
        repeatDelay: prefersReducedMotion ? 0 : repeatDelay,
        ease: 'easeInOut',
      },
    },
    idle: {
      x: 0,
      y: 0,
    },
  };

  return (
    <span className={cn('relative inline-block', className)}>
      {/* Base text */}
      <span className="relative z-10">{children}</span>
      
      {/* Red channel glitch layer */}
      <motion.span
        className={cn(
          'absolute inset-0 z-0 text-red-primary',
          intensityClasses[intensity]
        )}
        variants={glitchVariants}
        animate={isGlitching ? 'glitch' : 'idle'}
        style={{ 
          mixBlendMode: 'screen',
          clipPath: 'inset(0 0 0 0)',
        }}
      >
        {children}
      </motion.span>
      
      {/* White channel glitch layer */}
      <motion.span
        className={cn(
          'absolute inset-0 z-0 text-white',
          intensityClasses[intensity]
        )}
        variants={glitchVariants}
        animate={isGlitching ? 'glitch' : 'idle'}
        style={{ 
          mixBlendMode: 'screen',
          clipPath: 'inset(0 0 0 0)',
          filter: 'blur(0.5px)',
        }}
      >
        {children}
      </motion.span>
      
      {/* Red channel glitch layer */}
      <motion.span
        className={cn(
          'absolute inset-0 z-0 text-red-primary',
          intensityClasses[intensity]
        )}
        variants={glitchVariants}
        animate={isGlitching ? 'glitch' : 'idle'}
        style={{ 
          mixBlendMode: 'screen',
          clipPath: 'inset(0 0 0 0)',
        }}
      >
        {children}
      </motion.span>
    </span>
  );
};

