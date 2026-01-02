import { Video } from '@/types';
import { VideoCard } from './VideoCard';
import { MasonryGrid } from './MasonryGrid';
import { cn } from '@/utils';

/**
 * VideoGrid
 * 
 * Video-First: Pinterest mood board style masonry layout
 * Carson: Break the grid, experimental layouts, overlapping
 * Oliver: Dark canvas, videos as light, distressed textures
 * Weirdcore: Glitch effects, scan lines, digital artifacts
 */

interface VideoGridProps {
  videos: Video[];
  onVideoSelect: (video: Video, position?: { x: number; y: number; width: number; height: number }) => void;
  layout?: 'asymmetrical' | 'grid' | 'masonry';
  featuredFirst?: boolean;
  darkBackground?: boolean;
}

export const VideoGrid = ({ 
  videos, 
  onVideoSelect, 
  layout = 'masonry', // Default to masonry for mood board style
  featuredFirst = true,
  darkBackground = false
}: VideoGridProps) => {
  // Sort videos: featured first if requested
  const sortedVideos = featuredFirst
    ? [...videos].sort((a, b) => (b.featured ? 1 : 0) - (a.featured ? 1 : 0))
    : videos;

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

  // Masonry/Pinterest mood board layout (default)
  if (layout === 'masonry') {
    return <MasonryGrid videos={sortedVideos} onVideoSelect={onVideoSelect} darkBackground={darkBackground} />;
  }

  // Asymmetrical layout (Carson-inspired)
  if (layout === 'asymmetrical') {
    return (
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8">
        {sortedVideos.map((video, index) => {
          // First video is always featured and spans 2 columns
          const isFeatured = index === 0 && video.featured;
          
          return (
            <div
              key={video.id}
              className={cn(
                isFeatured && 'md:col-span-2 md:row-span-2'
              )}
            >
              <VideoCard
                video={video}
                isFeatured={isFeatured}
                onSelect={(position) => onVideoSelect(video, position)}
                size="standard"
                darkBackground={darkBackground}
              />
            </div>
          );
        })}
      </div>
    );
  }

  // Standard grid layout - 3 columns with increased spacing
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8 lg:gap-10">
      {sortedVideos.map((video) => (
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
  );
};

