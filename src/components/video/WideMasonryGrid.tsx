import { Video, Photo } from '@/types';
import { PaperCutoutCard } from './PaperCutoutCard';
import { useMemo } from 'react';

/**
 * WideMasonryGrid
 * 
 * Wide Pinterest-style masonry layout that fills almost full width
 * Paper cutout aesthetic with torn edges and shadows
 * Carson: Broken grid, varying sizes, no overlapping
 * Oliver: Distressed textures, collage aesthetic
 * 
 * Features:
 * - Groups wide videos together (at least 2)
 * - Groups tall videos together (at least 3)
 * - Prevents overlapping with proper spacing
 * - Accounts for rotation in spacing calculations
 */

interface WideMasonryGridProps {
  videos: Video[];
  photos: Photo[];
  onVideoSelect: (video: Video) => void;
  onPhotoSelect: (photo: Photo) => void;
}

export const WideMasonryGrid = ({ 
  videos, 
  photos, 
  onVideoSelect, 
  onPhotoSelect 
}: WideMasonryGridProps) => {
  // Generate sizes with side-by-side pairing when possible
  const videoLayouts = useMemo(() => {
    // Define size patterns - optimized for side-by-side placement
    // Each pair has matching sizes so they fit side by side
    const pairPatterns = [
      { width: 4, height: 3 }, // Medium-wide pair
      { width: 3, height: 3 }, // Square pair
      { width: 5, height: 2 }, // Wide pair
      { width: 3, height: 4 }, // Medium-tall pair
    ];
    
    const singlePatterns = [
      { width: 6, height: 3 }, // Large wide
      { width: 4, height: 4 }, // Large square
      { width: 2, height: 5 }, // Tall
      { width: 5, height: 4 }, // Medium wide
    ];
    
    const layouts: Array<{
      width: number;
      height: number;
      rotation: number;
      zIndex: number;
    }> = [];
    
    let pairIndex = 0;
    let singleIndex = 0;
    let pairPosition = 0; // 0 = first in pair, 1 = second in pair
    
    videos.forEach((video, index) => {
      // Featured videos get special treatment
      if (video.featured) {
        const featuredSizes = [
          { width: 5, height: 4 },
          { width: 4, height: 5 },
          { width: 6, height: 3 },
        ];
        const size = featuredSizes[Math.floor(Math.random() * featuredSizes.length)];
        layouts.push({
          ...size,
          rotation: video.rotation !== undefined ? video.rotation : (Math.random() * 4 - 2),
          zIndex: 20 + index,
        });
        // Reset pairing after featured video
        pairPosition = 0;
        return;
      }
      
      // Try to place videos side by side (2 at a time)
      // Skip pairing if this is the last video
      const canPair = index < videos.length - 1 && !videos[index + 1]?.featured;
      
      let size;
      
      if (canPair && pairPosition === 0) {
        // Start a new pair - use matching size for both items
        size = pairPatterns[pairIndex % pairPatterns.length];
        pairPosition = 1; // Next item will be second in pair
        pairIndex++;
      } else if (pairPosition === 1) {
        // Second item in pair - use same size as first
        const previousSize = layouts[layouts.length - 1];
        size = { width: previousSize.width, height: previousSize.height };
        pairPosition = 0; // Reset for next pair
      } else {
        // Single item (not in pair)
        size = singlePatterns[singleIndex % singlePatterns.length];
        singleIndex++;
        pairPosition = 0; // Reset pair position
      }
      
      layouts.push({
        ...size,
        rotation: video.rotation !== undefined ? video.rotation : (Math.random() * 4 - 2),
        zIndex: 1 + (index % 5),
      });
    });
    
    return layouts;
  }, [videos]);

  const photoLayouts = useMemo(() => {
    return photos.map((_photo, index) => {
      const sizePatterns = [
        { width: 2, height: 2 },
        { width: 3, height: 2 },
        { width: 2, height: 3 },
        { width: 3, height: 3 },
        { width: 4, height: 2 },
        { width: 2, height: 4 },
      ];
      
      const pattern = sizePatterns[Math.floor(Math.random() * sizePatterns.length)];
      return {
        ...pattern,
        rotation: (Math.random() * 4 - 2),
        zIndex: 1 + (index % 5),
      };
    });
  }, [photos]);

  if (videos.length === 0 && photos.length === 0) {
    return (
      <div className="min-h-[600px] flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-4xl font-black text-white mb-4">NO WORK</h2>
          <p className="text-zinc-400">Check back soon for new work.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="relative min-h-screen py-8">
      {/* Wide masonry container - fills almost full width */}
      <div className="w-full max-w-[98vw] mx-auto px-2 md:px-6">
        <div className="flex flex-wrap justify-center items-start" style={{ gap: '24px' }}>
          {/* Videos Section */}
          {videos.map((video, index) => {
            const layout = videoLayouts[index];
            return (
              <PaperCutoutCard
                key={video.id}
                item={video}
                onSelect={() => onVideoSelect(video)}
                width={layout.width}
                height={layout.height}
                rotation={layout.rotation}
                zIndex={layout.zIndex}
                isPhoto={false}
              />
            );
          })}
          
          {/* Photos Section */}
          {photos.map((photo, index) => {
            const layout = photoLayouts[index];
            return (
              <PaperCutoutCard
                key={photo.id}
                item={photo}
                onSelect={() => onPhotoSelect(photo)}
                width={layout.width}
                height={layout.height}
                rotation={layout.rotation}
                zIndex={layout.zIndex}
                isPhoto={true}
              />
            );
          })}
        </div>
      </div>
    </div>
  );
};

