import { motion } from 'framer-motion';
import { cn } from '@/utils';

/**
 * HandwrittenText
 * 
 * Indie sleaze aesthetic: Handwritten text overlays
 * Carson-inspired: Experimental typography
 */

interface HandwrittenTextProps {
  children: React.ReactNode;
  className?: string;
  rotation?: number;
  color?: 'green' | 'red' | 'pink' | 'white' | 'black';
  size?: 'sm' | 'md' | 'lg' | 'xl';
}

export const HandwrittenText = ({
  children,
  className,
  rotation = 0,
  color = 'white',
  size = 'md',
}: HandwrittenTextProps) => {
  const colorClasses = {
    green: 'text-white',
    red: 'text-red-gore',
    pink: 'text-pink-sleaze',
    white: 'text-white',
    black: 'text-black',
  };

  const sizeClasses = {
    sm: 'text-xs md:text-sm',
    md: 'text-sm md:text-base',
    lg: 'text-base md:text-lg',
    xl: 'text-lg md:text-xl',
  };

  return (
    <motion.span
      className={cn(
        'font-handwritten inline-block',
        colorClasses[color],
        sizeClasses[size],
        className
      )}
      style={{
        transform: `rotate(${rotation}deg)`,
        fontFamily: 'cursive',
        textShadow: '0 0 10px rgba(0,0,0,0.5)',
      }}
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.3, ease: 'easeOut' }}
    >
      {children}
    </motion.span>
  );
};

