import { motion } from 'framer-motion';

/**
 * AnimatedBackground
 * 
 * Dynamic, grungy background with animated patterns
 * Oliver: Dark, textured, atmospheric
 * Weirdcore: Abstract geometries, digital patterns
 */

export const AnimatedBackground = () => {
  return (
    <div className="fixed inset-0 z-0 overflow-hidden pointer-events-none">
      {/* Base dark gradient */}
      <div className="absolute inset-0 bg-gradient-to-br from-black via-zinc-900 to-black" />
      
      {/* Animated gradient orbs */}
      <motion.div
        className="absolute top-0 left-1/4 w-96 h-96 bg-white/5 rounded-full blur-3xl"
        animate={{
          x: [0, 100, -100, 0],
          y: [0, 50, -50, 0],
          scale: [1, 1.2, 0.8, 1],
        }}
        transition={{
          duration: 20,
          repeat: Infinity,
          ease: 'easeInOut',
        }}
      />
      
      <motion.div
        className="absolute bottom-0 right-1/4 w-96 h-96 bg-red-gore/5 rounded-full blur-3xl"
        animate={{
          x: [0, -100, 100, 0],
          y: [0, -50, 50, 0],
          scale: [1, 0.8, 1.2, 1],
        }}
        transition={{
          duration: 25,
          repeat: Infinity,
          ease: 'easeInOut',
        }}
      />
      
      <motion.div
        className="absolute top-1/2 left-1/2 w-96 h-96 bg-cyan-digital/3 rounded-full blur-3xl"
        animate={{
          x: [0, 150, -150, 0],
          y: [0, -100, 100, 0],
          scale: [1, 1.3, 0.7, 1],
        }}
        transition={{
          duration: 30,
          repeat: Infinity,
          ease: 'easeInOut',
        }}
      />
      
      {/* Grain texture overlay */}
      <div
        className="absolute inset-0 opacity-[0.15]"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 400 400' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")`,
          mixBlendMode: 'overlay',
        }}
      />
      
      {/* Scan line effect */}
      <motion.div
        className="absolute inset-0"
        style={{
          background: `repeating-linear-gradient(
            0deg,
            transparent,
            transparent 2px,
            rgba(34, 197, 94, 0.03) 2px,
            rgba(34, 197, 94, 0.03) 4px
          )`,
        }}
        animate={{
          y: [0, 100],
        }}
        transition={{
          duration: 8,
          repeat: Infinity,
          ease: 'linear',
        }}
      />
      
      {/* Distressed overlay pattern */}
      <div
        className="absolute inset-0 opacity-[0.05]"
        style={{
          backgroundImage: `
            radial-gradient(circle at 20% 30%, rgba(0,0,0,0.3) 0%, transparent 50%),
            radial-gradient(circle at 80% 70%, rgba(0,0,0,0.3) 0%, transparent 50%),
            radial-gradient(circle at 50% 50%, rgba(0,0,0,0.2) 0%, transparent 50%)
          `,
        }}
      />
    </div>
  );
};

