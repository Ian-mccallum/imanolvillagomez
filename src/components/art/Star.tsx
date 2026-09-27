import { motion, useTransform, type MotionValue } from 'framer-motion';

const Arms = ({ className = '' }: { className?: string }) => (
  <svg viewBox="-50 -50 100 100" className={`absolute inset-0 h-full w-full ${className}`} fill="currentColor">
    {[0, 60, 120].map((r) => (
      <rect key={r} x="-6" y="-46" width="12" height="92" rx="1" transform={`rotate(${r})`} />
    ))}
  </svg>
);

/** The ✱ mark — slow turn, and a red channel that slips out when `heat` rises. */
export const Star = ({ heat, className = '' }: { heat: MotionValue<number>; className?: string }) => {
  const xRed = useTransform(heat, (h) => h * -6);
  const xGhost = useTransform(heat, (h) => h * 5);
  const op = useTransform(heat, (h) => Math.min(h * 1.6, 1));

  return (
    <motion.div
      className={`relative ${className}`}
      initial={{ scale: 0, rotate: -90, opacity: 0 }}
      animate={{ scale: 1, rotate: 0, opacity: 1 }}
      transition={{ type: 'spring', stiffness: 120, damping: 14, delay: 0.3 }}
    >
      <motion.div
        className="absolute inset-0"
        animate={{ rotate: 360 }}
        transition={{ duration: 40, repeat: Infinity, ease: 'linear' }}
      >
        <motion.div style={{ x: xRed, opacity: op }} className="absolute inset-0 text-[#dc2626]">
          <Arms />
        </motion.div>
        <motion.div style={{ x: xGhost, opacity: op }} className="absolute inset-0 text-transparent">
          <svg viewBox="-50 -50 100 100" className="absolute inset-0 h-full w-full" fill="none" stroke="#C9C8C7" strokeWidth="1">
            {[0, 60, 120].map((r) => (
              <rect key={r} x="-6" y="-46" width="12" height="92" rx="1" transform={`rotate(${r})`} />
            ))}
          </svg>
        </motion.div>
        <motion.div
          className="absolute inset-0 text-[#C9C8C7] drop-shadow-[0_0_18px_rgba(201,200,199,.35)]"
          animate={{ scale: [1, 0.94, 1] }}
          transition={{ duration: 3.2, repeat: Infinity, ease: 'easeInOut' }}
        >
          <Arms />
        </motion.div>
      </motion.div>
    </motion.div>
  );
};
