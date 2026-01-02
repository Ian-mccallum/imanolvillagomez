import { useState, useMemo, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { FullscreenModal, VideoGrid } from '@/components/video';
import { VideoFilterBar } from '@/components/video/VideoFilterBar';
import { VideoFormatLegend } from '@/components/video/VideoFormatLegend';
import { videos } from '@/constants/videos';
import { Video } from '@/types';
import { FilterState, EMPTY_FILTER_STATE } from '@/types/filters';
import { generateFilterOptions, applyFilters, queryStringToFilterState, filterStateToQueryString } from '@/utils/filters';
import { videosToMediaItems } from '@/types/media';
import { usePageTitle, useMetaTags } from '@/hooks';
import { SEO_CONFIG, BASE_URL } from '@/constants';
import { StructuredData, createBreadcrumbSchema } from '@/components/seo/StructuredData';

/**
 * VideosPage
 * 
 * Redesign 2: Dedicated videos page with filter system
 * Video-First: Videos dominate, light background
 * Carson: Experimental typography
 * West: Minimal, clean
 */

export const VideosPage = () => {
  const seoConfig = SEO_CONFIG.videos;
  usePageTitle('Videos');
  useMetaTags({
    title: seoConfig.title,
    description: seoConfig.description,
    keywords: seoConfig.keywords,
  });

  // Breadcrumb schema
  const breadcrumbSchema = createBreadcrumbSchema([
    { name: 'Home', url: BASE_URL },
    { name: 'Work', url: `${BASE_URL}/work` },
    { name: 'Videos', url: `${BASE_URL}${seoConfig.path}` },
  ]);
  
  const [selectedVideoIndex, setSelectedVideoIndex] = useState<number | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [clickPosition, setClickPosition] = useState<{ x: number; y: number; width: number; height: number } | null>(null);
  const [searchParams, setSearchParams] = useSearchParams();

  // Initialize filter state from URL or use empty state
  const [filterState, setFilterState] = useState<FilterState>(() => {
    const queryString = searchParams.toString();
    if (queryString) {
      return queryStringToFilterState(queryString);
    }
    return EMPTY_FILTER_STATE;
  });

  // Update URL when filter state changes
  useEffect(() => {
    const queryString = filterStateToQueryString(filterState);
    if (queryString) {
      setSearchParams(new URLSearchParams(queryString), { replace: true });
    } else {
      setSearchParams({}, { replace: true });
    }
  }, [filterState, setSearchParams]);

  // Generate filter options from all videos
  const filterOptions = useMemo(() => generateFilterOptions(videos), []);

  // Apply filters to videos and sort alphabetically by artist
  const filteredVideos = useMemo(() => {
    const filtered = applyFilters(videos, filterState);
    // Sort alphabetically by artist (case-insensitive)
    return [...filtered].sort((a, b) => {
      const artistA = (a.artist || a.client || '').toLowerCase();
      const artistB = (b.artist || b.client || '').toLowerCase();
      return artistA.localeCompare(artistB);
    });
  }, [filterState]);

  const handleVideoSelect = (video: Video, position?: { x: number; y: number; width: number; height: number }) => {
    const index = filteredVideos.findIndex(v => v.id === video.id);
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
  
  // Convert filtered videos to media items
  const mediaItems = useMemo(() => videosToMediaItems(filteredVideos), [filteredVideos]);

  const handleFilterChange = (newState: FilterState) => {
    setFilterState(newState);
  };

  return (
    <>
      <StructuredData data={breadcrumbSchema} />
      <div className="min-h-screen bg-black text-white relative -mt-12 md:-mt-14">
      {/* Oliver: Very intense grainy background texture - multiple layers - fixed at top */}
      <div
        className="fixed top-0 left-0 right-0 bottom-0 pointer-events-none z-0"
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 400 400' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='5.0' numOctaves='12' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)' opacity='1'/%3E%3C/svg%3E")`,
          mixBlendMode: 'overlay',
          opacity: 1,
        }}
      />
      
      {/* Second grain layer - more intensity */}
      <div
        className="fixed top-0 left-0 right-0 bottom-0 pointer-events-none z-0"
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 400 400' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter2'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='8.0' numOctaves='15' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter2)' opacity='1'/%3E%3C/svg%3E")`,
          mixBlendMode: 'multiply',
          opacity: 0.9,
        }}
      />
      
      {/* Third grain layer - maximum intensity */}
      <div
        className="fixed top-0 left-0 right-0 bottom-0 pointer-events-none z-0"
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 400 400' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter3'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='10.0' numOctaves='18' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter3)' opacity='1'/%3E%3C/svg%3E")`,
          mixBlendMode: 'screen',
          opacity: 0.7,
        }}
      />

      {/* Minimal header */}
      {/* Mobile: Stack elements, reduce typography size */}
      <header className="container mx-auto px-4 md:px-6 pt-24 md:pt-20 lg:pt-24 pb-4 relative z-10">
        <div className="relative z-10 flex flex-col md:flex-row md:items-start md:justify-between gap-3 md:gap-6">
          <div>
            <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-black text-white uppercase tracking-tighter transform rotate-neg05">
              VIDEOS
            </h1>
            <p className="mt-2 md:mt-4 text-zinc-50 text-xs sm:text-sm md:text-sm uppercase tracking-wider">
              {videos.length} PROJECTS
            </p>
          </div>
          {/* Formatting legend - positioned on right side, aligned with header */}
          <div className="hidden md:block">
            <VideoFormatLegend darkBackground={true} />
          </div>
        </div>
        {/* Formatting legend - mobile version below header */}
        <div className="md:hidden mt-4">
          <VideoFormatLegend darkBackground={true} />
        </div>
      </header>

      {/* Filter Bar - 5% visual weight, minimal */}
      <div className="container mx-auto px-4 md:px-6 relative z-20">
        <VideoFilterBar
          videos={videos}
          filterState={filterState}
          filterOptions={filterOptions}
          onFilterChange={handleFilterChange}
          videoCount={filteredVideos.length}
          darkBackground={true}
        />
      </div>

      {/* Video Grid - 80% visual weight */}
      {filteredVideos.length === 0 ? (
        <div className="container mx-auto px-4 md:px-6 py-12 relative z-10">
          <div className="min-h-[600px] flex items-center justify-center">
            <div className="text-center">
              <h2 className="text-4xl font-black text-white mb-4 uppercase tracking-tighter">
                NO VIDEOS FOUND
              </h2>
              <p className="text-zinc-400 text-sm uppercase tracking-wider mb-6">
                No videos match your filters
              </p>
              <button
                onClick={() => setFilterState(EMPTY_FILTER_STATE)}
                className="px-4 py-2 text-xs uppercase tracking-wider font-medium border border-zinc-700 text-white hover:bg-zinc-900 transition-colors focus:outline-none focus:ring-1 focus:ring-white/50"
              >
                CLEAR FILTERS
              </button>
            </div>
          </div>
        </div>
      ) : (
        <main className="w-full max-w-[98vw] mx-auto px-4 md:px-6 lg:px-8 pb-12 md:pb-20 relative z-10">
          <VideoGrid
            videos={filteredVideos}
            layout="masonry"
            featuredFirst={false}
            onVideoSelect={handleVideoSelect}
            darkBackground={true}
          />
        </main>
      )}

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
    </>
  );
};
