import { useState, useMemo } from 'react';
import { VideoGrid, FullscreenModal } from '@/components/video';
import { videos } from '@/constants/videos';
import { Video } from '@/types';
import { videosToMediaItems } from '@/types/media';

/**
 * PortfolioPage
 * 
 * Carson: Experimental typography, break the grid
 * Oliver: Dark canvas, videos as light, distressed textures
 * Strauss: Bold, viral-worthy, iconic green
 * Weirdcore: Glitch effects, digital artifacts
 * Video-First: Videos dominate, logo/name minimal
 */

export const PortfolioPage = () => {
  const [selectedVideoIndex, setSelectedVideoIndex] = useState<number | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [clickPosition, setClickPosition] = useState<{ x: number; y: number; width: number; height: number } | null>(null);

  const handleVideoSelect = (video: Video, position?: { x: number; y: number; width: number; height: number }) => {
    const index = videos.findIndex(v => v.id === video.id);
    if (index !== -1) {
      setSelectedVideoIndex(index);
      setClickPosition(position || null);
      setIsModalOpen(true);
    }
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedVideoIndex(null);
    setClickPosition(null);
  };
  
  // Convert videos to media items
  const mediaItems = useMemo(() => videosToMediaItems(videos), []);

  return (
    <div className="min-h-screen bg-black">
      {/* Minimal header (5% visual weight) - West's bold but minimal */}
      <header className="container mx-auto px-4 md:px-6 py-6 md:py-8 relative">
        {/* Background texture - Oliver's distressed */}
        <div 
          className="absolute inset-0 opacity-[0.02] pointer-events-none"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 400 400' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")`,
          }}
        />
        
        {/* Clean, minimal header */}
        <div className="relative z-10">
          <h1 className="text-2xl md:text-4xl lg:text-5xl font-black text-white uppercase tracking-tighter">
            VIDEO WORK
          </h1>
          <p className="mt-2 md:mt-4 text-zinc-400 text-xs md:text-sm uppercase tracking-wider">
            {videos.length} PROJECTS
          </p>
        </div>
      </header>

      {/* THE CONTENT: Video grid (80% visual weight) - Videos dominate */}
      <main className="container mx-auto px-4 md:px-6 pb-12 md:pb-20">
        <VideoGrid
          videos={videos}
          layout="masonry"
          featuredFirst={true}
          onVideoSelect={handleVideoSelect}
        />
      </main>

      {/* Fullscreen Modal */}
      <FullscreenModal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        items={mediaItems}
        initialIndex={selectedVideoIndex ?? 0}
        initialPosition={clickPosition ?? undefined}
        enableGalleryNavigation={true}
        enableNativeFullscreen={true}
        enableTouchGestures={true}
        enableKeyboardNavigation={true}
      />
    </div>
  );
};
