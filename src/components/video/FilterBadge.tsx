import { motion } from 'framer-motion';
import { cn } from '@/utils';

/**
 * FilterBadge
 * 
 * Displays an active filter as a removable badge
 * Carson: Experimental typography, minimal
 * Oliver: Dark aesthetic
 * West: Minimal, bold, clean
 */

interface FilterBadgeProps {
  label: string;
  value: string | number;
  onRemove: () => void;
  darkBackground?: boolean;
  className?: string;
}

export const FilterBadge = ({
  label,
  value,
  onRemove,
  darkBackground = false,
  className,
}: FilterBadgeProps) => {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.8 }}
      className={cn(
        'inline-flex items-center gap-2 px-3 py-1.5',
        'bg-zinc-800 border border-zinc-700',
        'text-xs uppercase tracking-wider font-medium',
        darkBackground ? 'text-white' : 'text-white',
        'rounded-sm',
        className
      )}
    >
      <span className="text-zinc-400">{label}:</span>
      <span>{value}</span>
      <button
        onClick={onRemove}
        className={cn(
          'ml-1 w-4 h-4 flex items-center justify-center',
          'hover:bg-zinc-700 rounded transition-colors',
          'focus:outline-none focus:ring-1 focus:ring-white/50'
        )}
        aria-label={`Remove ${label} filter: ${value}`}
      >
        <span className="text-zinc-400 hover:text-white">×</span>
      </button>
    </motion.div>
  );
};

