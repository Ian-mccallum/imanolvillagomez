import { motion } from 'framer-motion';

/**
 * LostFilesHero
 * 
 * Redesign 2: Striking "LOST FILES" hero with background image
 * Carson: Experimental typography, break conventions
 * Oliver: Dark, grainy, distressed textures
 * Weirdcore: Glitch animations, digital artifacts
 * 
 * Features:
 * - Background image (osamason-1.jpeg) with dark overlay
 * - Heavy grainy texture overlay (indie sleaze aesthetic)
 * - Full-width "LOST FILES" text stacked multiple times
 * - Advanced continuous animations with RGB channel separation
 * - Text covers full image
 * - No white space - starts at top of page
 */

export const LostFilesHero = () => {
  // Indie Sleaze - Flash Photography Effect
  // Carson: Badly aligned, experimental typography | Indie Sleaze: Flash photography
  // No glitching - just misaligned layers and flash effects
  
  // Fade in animations - subtle sequential delays
  const fadeIn1 = {
    initial: { opacity: 0 },
    animate: {
      opacity: 1,
      transition: {
        duration: 0.8,
        ease: 'easeOut',
      },
    },
  };

  const fadeIn2 = {
    initial: { opacity: 0 },
    animate: {
      opacity: 1,
      transition: {
        duration: 0.8,
        delay: 0.15, // Slightly slower than first
        ease: 'easeOut',
      },
    },
  };

  const fadeIn3 = {
    initial: { opacity: 0 },
    animate: {
      opacity: 1,
      transition: {
        duration: 0.8,
        delay: 0.3, // Slightly slower than second
        ease: 'easeOut',
      },
    },
  };

  const fadeIn4 = {
    initial: { opacity: 0 },
    animate: {
      opacity: 1,
      transition: {
        duration: 0.8,
        delay: 0.45, // After third layer
        ease: 'easeOut',
      },
    },
  };

  // Flash photography effect - subtle, less popping (indie sleaze)
  const flashEffect = {
    animate: {
      opacity: [0, 0.12, 0, 0, 0, 0.08, 0],
      transition: {
        duration: 0.5,
        repeat: Infinity,
        delay: 1.5,
        ease: 'easeInOut',
      },
    },
  };

  // Animated grain overlay - heavier, moving grain effect
  const animatedGrain = {
    animate: {
      backgroundPosition: ['0% 0%', '100% 100%'],
      transition: {
        duration: 20,
        repeat: Infinity,
        ease: 'linear',
      },
    },
  };

  return (
    <div 
      className="relative w-full h-[calc(100vh-48px)] md:h-[calc(100vh-56px)] flex items-center justify-center overflow-hidden -mt-12 md:-mt-14"
      style={{
        backgroundImage: 'url(/images/osamason-1.jpeg)',
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat',
        backgroundColor: '#C9C8C7', // Match body background
      }}
    >
      {/* Dark overlay to darken the background image */}
      <div className="absolute inset-0 bg-black/60 z-0" />

      {/* Animated grain texture layers - heavier, moving grain effect */}
      {/* First animated grain layer - heavier opacity */}
      <motion.div
        className="absolute inset-0 pointer-events-none z-10 opacity-70"
        variants={animatedGrain}
        animate="animate"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 400 400' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")`,
          backgroundSize: '200% 200%',
          mixBlendMode: 'overlay',
        }}
      />
      
      {/* Second animated grain layer - even heavier */}
      <motion.div
        className="absolute inset-0 pointer-events-none z-10 opacity-60"
        variants={animatedGrain}
        animate="animate"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 400 400' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter2'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='1.2' numOctaves='5' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter2)'/%3E%3C/svg%3E")`,
          backgroundSize: '200% 200%',
          mixBlendMode: 'multiply',
          animationDirection: 'reverse',
        }}
      />

      {/* Third grain layer - static heavy grain */}
      <div
        className="absolute inset-0 pointer-events-none z-10 opacity-50"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 400 400' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter3'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='1.5' numOctaves='6' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter3)'/%3E%3C/svg%3E")`,
          mixBlendMode: 'hard-light',
        }}
      />

      {/* Stacked "LOST FILES" text - Badly aligned, experimental typography */}
      {/* Carson: Break the grid, misaligned layers | Indie Sleaze: Flash photography */}
      {/* Centered container but each layer is offset differently */}
      <div className="relative w-full h-full flex flex-col items-center justify-center z-20">
        {/* First layer - centered, fades in first */}
        <motion.h1
          className="w-full text-8xl md:text-9xl lg:text-[10rem] xl:text-[12rem] 2xl:text-[14rem] font-black text-white uppercase tracking-tighter leading-[0.9] text-center"
          variants={fadeIn1}
          initial="initial"
          animate="animate"
          style={{ transform: 'translateX(-8%)' }}
        >
          LOST FILES
        </motion.h1>

        {/* Second layer - offset to the right, fades in second */}
        <motion.h1
          className="w-full text-8xl md:text-9xl lg:text-[10rem] xl:text-[12rem] 2xl:text-[14rem] font-black text-white uppercase tracking-tighter leading-[0.9] text-center"
          variants={fadeIn2}
          initial="initial"
          animate="animate"
          style={{ transform: 'translateX(4%)' }}
        >
          LOST FILES
        </motion.h1>

        {/* Third layer - offset even more to the right, fades in third */}
        <motion.h1
          className="w-full text-8xl md:text-9xl lg:text-[10rem] xl:text-[12rem] 2xl:text-[14rem] font-black text-white uppercase tracking-tighter leading-[0.9] text-center"
          variants={fadeIn3}
          initial="initial"
          animate="animate"
          style={{ transform: 'translateX(12%)' }}
        >
          LOST FILES
        </motion.h1>

        {/* Flash photography overlay - subtle, top left corner (indie sleaze) */}
        <motion.div
          className="absolute top-0 left-0 w-1/3 h-1/3 pointer-events-none"
          variants={flashEffect}
          animate="animate"
          style={{
            background: 'radial-gradient(circle at top left, rgba(255,255,255,0.15) 0%, transparent 60%)',
            mixBlendMode: 'overlay',
          }}
        />
      </div>

      {/* Subheading - positioned at bottom of image */}
      <motion.p
        className="absolute bottom-8 md:bottom-12 lg:bottom-16 left-0 right-0 text-base md:text-lg lg:text-xl xl:text-2xl text-white/80 lowercase tracking-wide text-center z-20 px-4"
        variants={fadeIn4}
        initial="initial"
        animate="animate"
        style={{ transform: 'translateX(2%)' }}
      >
        edits, archived content, and whatever the fuck else
      </motion.p>
    </div>
  );
};

