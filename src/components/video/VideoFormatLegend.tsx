import { cn } from '@/utils';

/**
 * Legend for caption format on Videos (song | location + year) or Photos (artist only + year).
 *
 * INTENTIONALLY NOT RENDERED. The Videos and Photos pages deliberately stopped
 * displaying this — the captions read clearly enough on their own and the legend
 * was taking up space above the grid. The component is kept, working and ready to
 * drop back into either page's header, so please don't remove it as dead code.
 *
 * To show it again, pass it to SubpageHeader's `aside` prop:
 *   aside={<VideoFormatLegend darkBackground />}            // Videos
 *   aside={<VideoFormatLegend darkBackground variant="photo" />}  // Photos
 */

interface VideoFormatLegendProps {
  className?: string;
  darkBackground?: boolean;
  /** Photos page: primary line is artist only */
  variant?: 'video' | 'photo';
}

export const VideoFormatLegend = ({
  className,
  darkBackground = false,
  variant = 'video',
}: VideoFormatLegendProps) => {
  if (variant === 'photo') {
    return (
      <div
        className={cn(
          'flex flex-col gap-2 md:gap-3',
          darkBackground ? 'text-zinc-50' : 'text-text-dark-tertiary',
          'text-xs md:text-sm',
          'uppercase tracking-wider',
          className
        )}
      >
        <div className="flex items-center gap-2">
          <span className="font-medium">FORMAT:</span>
          <span className="font-normal">artist</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="font-medium">DATE:</span>
          <span className="font-normal">year</span>
        </div>
      </div>
    );
  }

  return (
    <div
      className={cn(
        'flex flex-col gap-2 md:gap-3',
        darkBackground ? 'text-zinc-50' : 'text-text-dark-tertiary',
        'text-xs md:text-sm',
        'uppercase tracking-wider',
        className
      )}
    >
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
