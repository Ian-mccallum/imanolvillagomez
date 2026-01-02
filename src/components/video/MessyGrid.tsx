import { Video, Photo } from '@/types';
import { PaperCutoutCard } from './PaperCutoutCard';
import { useMemo } from 'react';

/**
 * MessyGrid
 * 
 * Carson: Break every rule, chaotic organization, experimental layouts
 * Oliver: Dark collage aesthetic, distressed textures
 * Strauss: Bold, viral-worthy, high-art/low-art mix
 * Weirdcore: Glitch effects, digital artifacts
 * 
 * Features:
 * - Intentionally messy organization
 * - Videos and photos mixed randomly
 * - Extreme size variations
 * - Dramatic rotations (-15° to 15°)
 * - Overlapping elements with z-index
 * - Experimental typography overlays
 * - Collage mood board aesthetic
 */

interface MessyGridProps {
  videos: Video[];
  photos: Photo[];
  onVideoSelect: (video: Video, position: { x: number; y: number; width: number; height: number }) => void;
  onPhotoSelect: (photo: Photo, position: { x: number; y: number; width: number; height: number }) => void;
}

export const MessyGrid = ({ 
  videos, 
  photos, 
  onVideoSelect, 
  onPhotoSelect 
}: MessyGridProps) => {
  // Organize items by Edits and Artists
  const organizedSections = useMemo(() => {
    const allItems: Array<{ item: Video | Photo; type: 'video' | 'photo' }> = [
      ...videos.map(v => ({ item: v, type: 'video' as const })),
      ...photos.map(p => ({ item: p, type: 'photo' as const })),
    ];

    // Separate edits from artist work
    const edits: Array<{ item: Video | Photo; type: 'video' | 'photo' }> = [];
    const artistWork: Array<{ item: Video | Photo; type: 'video' | 'photo'; artist: string }> = [];

    allItems.forEach(({ item, type }) => {
      if (item.isEdit) {
        edits.push({ item, type });
      } else {
        const artist = item.client || 'Unknown';
        artistWork.push({ item, type, artist });
      }
    });

    // Group artist work by artist name
    const artistGroups = artistWork.reduce((acc, { item, type, artist }) => {
      if (!acc[artist]) {
        acc[artist] = [];
      }
      acc[artist].push({ item, type });
      return acc;
    }, {} as Record<string, Array<{ item: Video | Photo; type: 'video' | 'photo' }>>);

    // Convert to array of sections
    const sections: Array<{ 
      title: string; 
      items: Array<{ item: Video | Photo; type: 'video' | 'photo' }>;
      isEdit?: boolean;
    }> = [];

    // Add Edits section first
    if (edits.length > 0) {
      sections.push({
        title: 'EDITS',
        items: edits,
        isEdit: true,
      });
    }

    // Add Artist sections (sorted alphabetically)
    const sortedArtists = Object.keys(artistGroups).sort();
    sortedArtists.forEach(artist => {
      sections.push({
        title: artist.toUpperCase(),
        items: artistGroups[artist],
      });
    });

    return sections;
  }, [videos, photos]);

  // Flatten all items for layout generation
  const allItems = useMemo(() => {
    return organizedSections.flatMap(section => section.items);
  }, [organizedSections]);

  // Generate layouts optimized for 2 cards per row - bigger and aligned
  const layouts = useMemo(() => {
    return allItems.map(({ item, type }, index) => {
      // Size patterns optimized for 2-per-row layout
      // Total width should be around 5-6 units to fit 2 cards per row nicely
      const sizePatterns = [
        { width: 3, height: 3, weight: 4 }, // Medium square (most common - fits 2 per row)
        { width: 3, height: 4, weight: 3 }, // Medium tall (common)
        { width: 4, height: 3, weight: 3 }, // Medium wide (common)
        { width: 2, height: 3, weight: 2 }, // Smaller tall
        { width: 3, height: 2, weight: 2 }, // Smaller wide
        { width: 4, height: 4, weight: 2 }, // Large square
        { width: 2, height: 4, weight: 1 }, // Small tall
        { width: 4, height: 2, weight: 1 }, // Small wide
        { width: 5, height: 3, weight: 1 }, // Extra wide (spans most of row)
        { width: 3, height: 5, weight: 1 }, // Extra tall
      ];
      
      // Flatten weighted patterns
      const weightedPatterns: Array<{ width: number; height: number }> = [];
      sizePatterns.forEach(pattern => {
        const count = Math.ceil(pattern.weight);
        for (let i = 0; i < count; i++) {
          weightedPatterns.push({ width: pattern.width, height: pattern.height });
        }
      });
      
      // Featured items get larger sizes
      if (type === 'video' && (item as Video).featured) {
        const featuredSizes = [
          { width: 4, height: 4 },
          { width: 5, height: 3 },
          { width: 3, height: 5 },
          { width: 4, height: 5 },
          { width: 5, height: 4 },
        ];
        const size = featuredSizes[Math.floor(Math.random() * featuredSizes.length)];
        return {
          ...size,
          rotation: (item as Video).rotation !== undefined 
            ? (item as Video).rotation 
            : 0, // All videos straight up (0 degrees)
          zIndex: 20 + (index % 10), // Moderate z-index for featured
        };
      }
      
      // Random size from weighted patterns
      const size = weightedPatterns[Math.floor(Math.random() * weightedPatterns.length)];
      
      // Minimal rotations for better alignment - videos always straight, photos very subtle
      const rotation = type === 'video'
        ? ((item as Video).rotation !== undefined ? (item as Video).rotation : 0) // All videos straight up (0 degrees)
        : (Math.random() * 4 - 2); // Photos: -2° to 2° for very subtle styling
      
      // Varying z-index for subtle overlapping effect
      const zIndex = Math.floor(Math.random() * 15) + 1;
      
      return {
        ...size,
        rotation,
        zIndex,
      };
    });
  }, [allItems]);

  if (allItems.length === 0) {
    return (
      <div className="min-h-[600px] flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-4xl font-black text-white mb-4">NO WORK</h2>
          <p className="text-zinc-400">Check back soon for new work.</p>
        </div>
      </div>
    );
  }

  // Calculate starting index for each section
  const sectionStartIndices = useMemo(() => {
    let index = 0;
    return organizedSections.map(section => {
      const start = index;
      index += section.items.length;
      return start;
    });
  }, [organizedSections]);

  return (
    <div className="relative min-h-screen py-8 md:py-12">

      {/* Pinterest moodboard sections container - organic flow */}
      <div className="w-full max-w-[100vw] mx-auto px-2 md:px-4 lg:px-6 overflow-x-hidden space-y-12 md:space-y-20">
        {organizedSections.map((section, sectionIndex) => {
          const sectionStartIndex = sectionStartIndices[sectionIndex];
          
          return (
            <div key={section.title} className="relative">
              {/* Section header - Clean, minimal */}
              <div className="mb-8 md:mb-12">
                <h2 className="text-2xl md:text-4xl lg:text-5xl font-black uppercase tracking-tighter text-white">
                  {section.title}
                </h2>
              </div>

              {/* Grid for this section - 3 items per row with increased spacing */}
              <div 
                className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8 lg:gap-10"
                style={{ 
                  maxWidth: '100%',
                  width: '100%',
                }}
              >
                {section.items.map(({ item, type }, itemIndex) => {
                  const globalIndex = sectionStartIndex + itemIndex;
                  const layout = layouts[globalIndex];
                  
                  return (
                    <PaperCutoutCard
                      key={type === 'video' ? (item as Video).id : (item as Photo).id}
                      item={item}
                      onSelect={(position) => {
                        if (type === 'video') {
                          onVideoSelect(item as Video, position);
                        } else {
                          onPhotoSelect(item as Photo, position);
                        }
                      }}
                      width={layout.width}
                      height={layout.height}
                      rotation={layout.rotation}
                      zIndex={layout.zIndex}
                      isPhoto={type === 'photo'}
                    />
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

