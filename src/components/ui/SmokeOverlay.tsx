import { motion } from 'framer-motion';

/**
 * SmokeOverlay
 * 
 * Blunt visual with hitting animation
 * Oliver: Dark beauty, atmospheric, moody
 * West: Minimalist perfectionism - subtle, not overwhelming
 * 
 * Features:
 * - Horizontal blunt above footer
 * - Subtle pulsing ember at tip
 * - Hit animation flash every 10 seconds
 */

export const SmokeOverlay = () => {
  return (
    <div 
      className="fixed inset-0 pointer-events-none overflow-hidden"
      style={{ zIndex: 15 }}
    >
      {/* Horizontal blunt above footer */}
      <motion.div
        className="absolute"
        style={{
          left: '50%',
          bottom: '50px', // Above footer (footer is 30px, so 50px gives 20px gap)
          transform: 'translateX(-50%) rotate(0deg)',
          width: '60px', // Horizontal length
          height: '8px', // Thickness
          zIndex: 16,
        }}
        initial={{ opacity: 0.4 }}
        animate={{
          opacity: [0.4, 0.6, 0.4],
        }}
        transition={{
          duration: 2.5,
          repeat: Infinity,
          ease: 'easeInOut',
        }}
      >
        {/* Blunt body - horizontal */}
        <div
          className="w-full h-full rounded-full"
          style={{
            background: `linear-gradient(to right,
              rgba(139, 90, 43, 0.7) 0%,
              rgba(101, 67, 33, 0.6) 50%,
              rgba(139, 90, 43, 0.5) 100%
            )`,
            boxShadow: '0 0 10px rgba(139, 90, 43, 0.4)',
          }}
        />
        
        {/* Ember/glow at tip (right side) - pulsing */}
        <motion.div
          className="absolute right-0 top-1/2"
          style={{
            transform: 'translateY(-50%)',
            width: '8px',
            height: '8px',
            borderRadius: '50%',
          }}
          animate={{
            opacity: [0.5, 0.9, 0.5],
            scale: [0.9, 1.3, 0.9],
          }}
          transition={{
            duration: 1.8,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
        >
          <div
            className="w-full h-full rounded-full"
            style={{
              background: `radial-gradient(circle,
                rgba(255, 140, 0, 0.9) 0%,
                rgba(255, 100, 0, 0.7) 50%,
                rgba(255, 60, 0, 0.4) 80%,
                transparent 100%
              )`,
              boxShadow: '0 0 15px rgba(255, 140, 0, 0.6), 0 0 8px rgba(255, 100, 0, 0.4)',
            }}
          />
        </motion.div>
        
        {/* Hit animation - bright flash every 10 seconds */}
        <motion.div
          className="absolute right-0 top-1/2"
          style={{
            transform: 'translateY(-50%)',
            width: '12px',
            height: '12px',
            borderRadius: '50%',
            pointerEvents: 'none',
          }}
          animate={{
            opacity: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0.8, 0.4, 0],
            scale: [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1.5, 2, 2.5, 1],
          }}
          transition={{
            duration: 10,
            repeat: Infinity,
            ease: 'easeOut',
            times: [0, 0.9, 0.91, 0.92, 0.93, 0.94, 0.95, 0.96, 0.97, 0.98, 0.99, 0.995, 1, 1],
          }}
        >
          <div
            className="w-full h-full rounded-full"
            style={{
              background: `radial-gradient(circle,
                rgba(255, 200, 0, 1) 0%,
                rgba(255, 140, 0, 0.9) 40%,
                rgba(255, 100, 0, 0.6) 70%,
                transparent 100%
              )`,
              boxShadow: '0 0 25px rgba(255, 200, 0, 0.9), 0 0 15px rgba(255, 140, 0, 0.7)',
            }}
          />
        </motion.div>
      </motion.div>
    </div>
  );
};
