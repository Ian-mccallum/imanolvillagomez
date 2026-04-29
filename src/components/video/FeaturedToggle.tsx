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
  /** Compact bordered chip aligned with Photos / video filter dropdowns */
  photosStyle?: boolean;
  className?: string;
}

export const FeaturedToggle = ({
  value,
  onChange,
  darkBackground = false,
  photosStyle = false,
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
        photosStyle
          ? 'px-2 py-1 text-[11px] md:text-xs font-bold uppercase tracking-wider transition-all duration-200 border-2 min-h-[32px] md:min-h-[36px] flex items-center justify-center focus:outline-none focus:ring-2 focus:ring-white/40'
          : 'px-3 py-1.5 text-xs uppercase tracking-wider font-medium border transition-colors focus:outline-none focus:ring-1 focus:ring-white/50',
        photosStyle
          ? isActive
            ? 'border-red-600 bg-red-600/20 text-white'
            : 'bg-transparent text-white border-white/30 hover:border-white/60'
          : cn(
              darkBackground
                ? 'bg-black/50 border-zinc-700 text-white hover:bg-black/70'
                : 'bg-black/50 border-zinc-700 text-white hover:bg-black/70',
              isActive && 'border-red-600 bg-red-600/20'
            ),
        className
      )}
      aria-pressed={isActive}
    >
      FEATURED {isActive && '×'}
    </button>
  );
};

