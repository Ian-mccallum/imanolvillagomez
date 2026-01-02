import { cn } from '@/utils';

/**
 * FeaturedToggle
 * 
 * Toggle component for featured filter
 * Carson: Experimental typography, minimal
 * Oliver: Dark aesthetic
 * West: Minimal, bold
 */

interface FeaturedToggleProps {
  value: boolean | null;
  onChange: (value: boolean | null) => void;
  darkBackground?: boolean;
  className?: string;
}

export const FeaturedToggle = ({
  value,
  onChange,
  darkBackground = false,
  className,
}: FeaturedToggleProps) => {
  const handleClick = () => {
    // Cycle: null -> true -> null (we don't need false state for "only non-featured")
    if (value === null) {
      onChange(true);
    } else {
      onChange(null);
    }
  };

  const isActive = value === true;

  return (
    <button
      onClick={handleClick}
      className={cn(
        'px-3 py-1.5 text-xs uppercase tracking-wider font-medium',
        'border transition-colors',
        'focus:outline-none focus:ring-1 focus:ring-white/50',
        darkBackground
          ? 'bg-black/50 border-zinc-700 text-white hover:bg-black/70'
          : 'bg-black/50 border-zinc-700 text-white hover:bg-black/70',
        isActive && 'border-red-600 bg-red-600/20',
        className
      )}
      aria-pressed={isActive}
    >
      FEATURED {isActive && '×'}
    </button>
  );
};

