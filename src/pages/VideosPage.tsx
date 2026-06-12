import { useState, useMemo, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { FullscreenModal, VideoGrid } from '@/components/video';
import { VideoFilterBar } from '@/components/video/VideoFilterBar';
import { VideoFormatLegend } from '@/components/video/VideoFormatLegend';
import { SubpageHeader, subpageHeaderShellClass } from '@/components/layout/SubpageHeader';
import { videos } from '@/constants/videos';
import { Video } from '@/types';
import { FilterState, EMPTY_FILTER_STATE } from '@/types/filters';
import { generateFilterOptions, applyFilters, queryStringToFilterState, videoBarFilterStateToQueryString, sanitizeVideoBarFilterState } from '@/utils/filters';
import { videosToMediaItems } from '@/types/media';
import { usePageTitle, useMetaTags } from '@/hooks';
import { SEO_CONFIG, BASE_URL } from '@/constants';
import { PAGE_FILM_GRAIN_OPACITY, PAGE_FILM_GRAIN_SVG } from '@/constants/pageFilmGrain';
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
      return sanitizeVideoBarFilterState(queryStringToFilterState(queryString));
    }
    return EMPTY_FILTER_STATE;
  });

  // Update URL when filter state changes
  useEffect(() => {
    const queryString = videoBarFilterStateToQueryString(filterState);
    if (queryString) {
      setSearchParams(new URLSearchParams(queryString), { replace: true });
    } else {
      setSearchParams({}, { replace: true });
    }
  }, [filterState, setSearchParams]);

  // Generate filter options from all videos
  const filterOptions = useMemo(() => generateFilterOptions(videos), []);

  // Apply filters to videos and sort by year, featured, artist — hellp-full follows mgna-crrrta
  const filteredVideos = useMemo(() => {
    const filtered = applyFilters(videos, sanitizeVideoBarFilterState(filterState));
    const sorted = [...filtered].sort((a, b) => {
      const yearA = a.year ?? 0;
      const yearB = b.year ?? 0;
      if (yearA !== yearB) return yearB - yearA;
      const featA = a.featured ? 1 : 0;
      const featB = b.featured ? 1 : 0;
      if (featA !== featB) return featB - featA;
      const artistA = (a.artist || a.client || '').toLowerCase();
      const artistB = (b.artist || b.client || '').toLowerCase();
      return artistA.localeCompare(artistB);
    });

    const mgnaIndex = sorted.findIndex((v) => v.id === 'mgna-crrrta');
    const hellpIndex = sorted.findIndex((v) => v.id === 'hellp-full');
    if (mgnaIndex !== -1 && hellpIndex !== -1 && hellpIndex !== mgnaIndex + 1) {
      const [hellpFull] = sorted.splice(hellpIndex, 1);
      const insertAt = sorted.findIndex((v) => v.id === 'mgna-crrrta') + 1;
      sorted.splice(insertAt, 0, hellpFull);
    }

    return sorted;
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
    setFilterState(sanitizeVideoBarFilterState(newState));
  };

  return (
    <>
      <StructuredData data={breadcrumbSchema} />
      <div className="min-h-screen bg-black text-white relative -mt-12 md:-mt-14">
      {(
        [
          { blend: 'overlay' as const, bg: PAGE_FILM_GRAIN_SVG.layer1 },
          { blend: 'multiply' as const, bg: PAGE_FILM_GRAIN_SVG.layer2 },
          { blend: 'screen' as const, bg: PAGE_FILM_GRAIN_SVG.layer3 },
        ] as const
      ).map((layer, i) => (
        <div
          key={i}
          className="fixed top-0 left-0 right-0 bottom-0 pointer-events-none z-0"
          style={{
            backgroundImage: layer.bg,
            mixBlendMode: layer.blend,
            opacity: PAGE_FILM_GRAIN_OPACITY[i],
          }}
        />
      ))}

      <header className={subpageHeaderShellClass}>
        <SubpageHeader
          title="VIDEOS"
          parent="WORK"
          subtitle={`${videos.length} PROJECTS`}
          aside={
            <div className="hidden md:block">
              <VideoFormatLegend darkBackground={true} />
            </div>
          }
        />
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
