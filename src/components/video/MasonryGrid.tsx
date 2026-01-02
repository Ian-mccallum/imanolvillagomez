import { Video } from '@/types';
import { VideoCard } from './VideoCard';
import { cn } from '@/utils';

/**
 * MasonryGrid
 * 
 * TRUE Pinterest-style masonry layout using CSS columns
 * Video-First: Many videos filling the page (80% visual weight)
 * Standard sizing: 300-500px width, allowing 3-4 videos per row
 * Carson: Experimental, organic flow
 * Oliver: Dark canvas, videos as light
 * West: Minimalist perfectionism
 * Weirdcore: Glitch effects
 * 
 * STEP-200: Implement CSS columns masonry layout
 */

interface MasonryGridProps {
  videos: Video[];
  onVideoSelect: (video: Video, position?: { x: number; y: number; width: number; height: number }) => void;
  darkBackground?: boolean;
}

export const MasonryGrid = ({ videos, onVideoSelect, darkBackground = false }: MasonryGridProps) => {
  if (videos.length === 0) {
    return (
      <div className="min-h-[600px] flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-4xl font-black text-white mb-4">NO VIDEOS</h2>
          <p className="text-zinc-400">Check back soon for new work.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="relative min-h-screen py-8">
      {/* CSS Grid - 3 columns per row with generous spacing for breathing room */}
      {/* Mobile: 1 column, Tablet: 2 columns, Desktop: 3 columns */}
      <div 
        className={cn(
          'grid grid-cols-1',        // Mobile: 1 column
          'md:grid-cols-2',          // Tablet: 2 columns
          'lg:grid-cols-3',          // Desktop: 3 columns (as requested)
          'gap-6',                   // Base gap - good spacing between videos
          'md:gap-8',                // Larger gap on tablet+ - comfortable spacing
          'lg:gap-10',               // Desktop gap - balanced spacing
          'xl:gap-12',               // XL screens - generous but not excessive
          // Padding handled by parent container
        )}
      >
        {videos.map((video) => (
          <VideoCard
            key={video.id}
            video={video}
            isFeatured={video.featured}
            onSelect={(position) => onVideoSelect(video, position)}
            size="standard"
            darkBackground={darkBackground}
          />
        ))}
      </div>
    </div>
  );
};
