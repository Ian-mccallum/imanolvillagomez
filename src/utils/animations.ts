import { Variants } from 'framer-motion';

/**
 * Animation Presets
 * 
 * Based on Carson-Oliver-West-Weirdcore methodology
 * All animations are cinematic and intentional
 */

/**
 * Timing system for animations
 */
export const timing = {
  micro: 0.1,      // Blink (instant feedback)
  fast: 0.2,       // Quick state change (gore core)
  normal: 0.3,     // Standard transition
  slow: 0.5,       // Dramatic reveal
  emphasis: 0.7    // Maximum impact
};

/**
 * Glitch animation (Weirdcore/Aphex Twin)
 * Intentional digital artifacts, purposeful glitches
 */
export const glitchAnimation: Variants = {
  initial: { 
    opacity: 0, 
    x: -10 
  },
  animate: { 
    opacity: 1, 
    x: 0 
  },
  exit: {
    opacity: 0,
    x: 10
  }
};

export const glitchTransition = {
  duration: timing.normal,
  ease: [0.4, 0, 0.2, 1] as [number, number, number, number]
};

/**
 * Bold entrance animation (West's minimalist perfectionism)
 * Clean, impactful, memorable
 */
export const boldAnimation: Variants = {
  initial: { 
    opacity: 0, 
    scale: 0.9 
  },
  animate: { 
    opacity: 1, 
    scale: 1 
  },
  exit: {
    opacity: 0,
    scale: 0.95
  }
};

export const boldTransition = {
  duration: 0.4,
  ease: "backOut" as const
};

/**
 * Experimental reveal animation (Carson's rule-breaking)
 * Asymmetrical, unexpected, memorable
 */
export const experimentalAnimation: Variants = {
  initial: { 
    opacity: 0, 
    rotateX: -15 
  },
  animate: { 
    opacity: 1, 
    rotateX: 0 
  },
  exit: {
    opacity: 0,
    rotateX: 15
  }
};

export const experimentalTransition = {
  duration: timing.slow,
  ease: "easeOut" as const
};

/**
 * Indie sleaze animation (Raw, grainy, DIY)
 * Blur effect for that raw, unpolished aesthetic
 */
export const sleazeAnimation: Variants = {
  initial: { 
    opacity: 0, 
    filter: "blur(2px)" 
  },
  animate: { 
    opacity: 1, 
    filter: "blur(0px)" 
  },
  exit: {
    opacity: 0,
    filter: "blur(2px)"
  }
};

export const sleazeTransition = {
  duration: 0.4,
  ease: "easeOut" as const
};

/**
 * Gore core animation (Oliver's aggressive, quick)
 * Fast, punchy, dramatic
 */
export const goreAnimation: Variants = {
  initial: { 
    opacity: 0, 
    scale: 1.1 
  },
  animate: { 
    opacity: 1, 
    scale: 1 
  },
  exit: {
    opacity: 0,
    scale: 1.05
  }
};

export const goreTransition = {
  duration: timing.fast,
  ease: "easeOut" as const
};

/**
 * Video card hover animation
 * Subtle scale with smooth transition
 */
export const videoCardHover = {
  scale: 1.02,
  transition: {
    duration: timing.normal,
    ease: "easeOut" as const
  }
};

/**
 * Video card tap animation
 * Quick feedback
 */
export const videoCardTap = {
  scale: 0.98,
  transition: {
    duration: timing.micro,
    ease: "easeOut" as const
  }
};

/**
 * Page entrance animation
 * Dramatic reveal for page loads
 */
export const pageEntrance: Variants = {
  initial: {
    opacity: 0,
    y: 20
  },
  animate: {
    opacity: 1,
    y: 0,
    transition: {
      duration: timing.slow,
      ease: "easeOut" as const,
      staggerChildren: 0.1
    }
  }
};

/**
 * Stagger children animation
 * For lists and grids
 */
export const staggerChildren = {
  staggerChildren: 0.1,
  delayChildren: 0.05
};

/**
 * Fade in animation
 * Simple, clean fade
 */
export const fadeIn: Variants = {
  initial: { opacity: 0 },
  animate: { opacity: 1 },
  exit: { opacity: 0 }
};

export const fadeInTransition = {
  duration: timing.normal,
  ease: "easeOut" as const
};

