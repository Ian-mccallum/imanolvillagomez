import { cn } from '@/utils';

/**
 * VideoFormatLegend
 * 
 * Shows the formatting legend for video captions
 * Primary line: song | location (all caps); edits without song: artist | location
 * 
 * Carson: Experimental typography, minimal
 * West: Clean, minimal, bold
 */

interface VideoFormatLegendProps {
  className?: string;
  darkBackground?: boolean;
}

export const VideoFormatLegend = ({ className, darkBackground = false }: VideoFormatLegendProps) => {
  return (
    <div className={cn(
      'flex flex-col gap-2 md:gap-3',
      darkBackground ? 'text-zinc-50' : 'text-text-dark-tertiary',
      'text-xs md:text-sm',
      'uppercase tracking-wider',
      className
    )}>
      <div className="flex items-center gap-2">
        <span className="font-medium">FORMAT:</span>
        <span className="font-normal">song | location</span>
      </div>
      <div className="flex items-center gap-2">
        <span className="font-medium">DATE:</span>
        <span className="font-normal">year</span>
      </div>
    </div>
  );
};

