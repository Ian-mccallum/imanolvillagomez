import { useState, useMemo, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { FullscreenModal, VideoFilterBar, VideoFormatLegend } from '@/components/video';
import { photos } from '@/constants/photos';
import { Photo } from '@/types';
import { FilterState, EMPTY_FILTER_STATE } from '@/types/filters';
import { cn } from '@/utils';
import {
  generatePhotoFilterOptions,
  applyPhotoFilters,
  queryStringToFilterState,
  videoBarFilterStateToQueryString,
  sanitizeVideoBarFilterState,
  hasVideoBarActiveFilters,
} from '@/utils/filters';
import { photosToMediaItems } from '@/types/media';
import { usePageTitle, useMetaTags, useResponsive } from '@/hooks';
import { SEO_CONFIG, BASE_URL } from '@/constants';
import { PAGE_FILM_GRAIN_OPACITY, PAGE_FILM_GRAIN_SVG } from '@/constants/pageFilmGrain';
import { StructuredData, createBreadcrumbSchema } from '@/components/seo/StructuredData';

/**
 * PhotosPage — same filter bar as Videos: ALL + ARTIST / YEAR / TOUR (artist ↔ photo client).
 */
export const PhotosPage = () => {
  const seoConfig = SEO_CONFIG.photos;
  usePageTitle('Photos');
  useMetaTags({
    title: seoConfig.title,
    description: seoConfig.description,
    keywords: seoConfig.keywords,
  });

  const breadcrumbSchema = createBreadcrumbSchema([
    { name: 'Home', url: BASE_URL },
    { name: 'Work', url: `${BASE_URL}/work` },
    { name: 'Photos', url: `${BASE_URL}${seoConfig.path}` },
  ]);

  const [searchParams, setSearchParams] = useSearchParams();
  const [filterState, setFilterState] = useState<FilterState>(() => {
    const queryString = searchParams.toString();
    if (queryString) {
      return sanitizeVideoBarFilterState(queryStringToFilterState(queryString));
    }
    return EMPTY_FILTER_STATE;
  });

  useEffect(() => {
    const queryString = videoBarFilterStateToQueryString(filterState);
    if (queryString) {
      setSearchParams(new URLSearchParams(queryString), { replace: true });
    } else {
      setSearchParams({}, { replace: true });
    }
  }, [filterState, setSearchParams]);

  const [selectedPhotoIndex, setSelectedPhotoIndex] = useState<number | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [clickPosition, setClickPosition] = useState<{ x: number; y: number; width: number; height: number } | null>(null);

  const filterOptions = useMemo(() => generatePhotoFilterOptions(photos), []);

  const filteredAndSortedPhotos = useMemo(() => {
    const filtered = applyPhotoFilters(photos, sanitizeVideoBarFilterState(filterState));
    return [...filtered].sort((a, b) => {
      const yearA = a.year ?? 0;
      const yearB = b.year ?? 0;
      if (yearA !== yearB) return yearB - yearA;
      const artistA = a.client || 'Unknown';
      const artistB = b.client || 'Unknown';
      if (artistA !== artistB) return artistA.localeCompare(artistB);
      return a.id.localeCompare(b.id);
    });
  }, [filterState]);

  const handlePhotoSelect = (
    photo: Photo,
    position: { x: number; y: number; width: number; height: number }
  ) => {
    const index = filteredAndSortedPhotos.findIndex((p) => p.id === photo.id);
    if (index !== -1) {
      setSelectedPhotoIndex(index);
      setClickPosition(position);
      setIsModalOpen(true);
    }
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedPhotoIndex(null);
    setClickPosition(null);
  };

  const mediaItems = useMemo(() => photosToMediaItems(filteredAndSortedPhotos), [filteredAndSortedPhotos]);

  const handleFilterChange = (newState: FilterState) => {
    setFilterState(sanitizeVideoBarFilterState(newState));
  };

  const filtersActive = hasVideoBarActiveFilters(filterState);

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
          className="fixed inset-0 pointer-events-none z-0"
          style={{
            backgroundImage: layer.bg,
            mixBlendMode: layer.blend,
            opacity: PAGE_FILM_GRAIN_OPACITY[i],
          }}
        />
      ))}

      <header className="container mx-auto px-4 md:px-6 pt-24 md:pt-20 lg:pt-24 pb-4 relative z-10">
        <div className="relative z-10 flex flex-col md:flex-row md:items-start md:justify-between gap-3 md:gap-6">
          <div>
            <motion.h1
              className="text-2xl sm:text-3xl md:text-5xl lg:text-6xl font-black text-white uppercase tracking-tighter"
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, ease: 'easeOut' }}
            >
              PHOTOS
            </motion.h1>
            <motion.p
              className="mt-2 text-zinc-400 text-xs sm:text-sm md:text-base uppercase tracking-wider"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.5, delay: 0.1 }}
            >
              {filteredAndSortedPhotos.length}{' '}
              {filteredAndSortedPhotos.length === 1 ? 'PHOTO' : 'PHOTOS'}
              {filtersActive && ' • FILTERED'}
            </motion.p>
          </div>
          <div className="hidden md:block">
            <VideoFormatLegend darkBackground />
          </div>
        </div>
        <div className="md:hidden mt-4">
          <VideoFormatLegend darkBackground />
        </div>
      </header>

      {/* z-20 sibling so filter dropdowns stack above main (also z-10); same pattern as VideosPage */}
      <div className="container mx-auto px-4 md:px-6 relative z-20">
        <VideoFilterBar
          filterState={filterState}
          filterOptions={filterOptions}
          onFilterChange={handleFilterChange}
          videoCount={filteredAndSortedPhotos.length}
          countLabel="photos"
          darkBackground
        />
      </div>

      <main className="w-full max-w-[100vw] mx-auto px-2 sm:px-4 md:px-6 pb-12 md:pb-20 relative z-10">
        {filteredAndSortedPhotos.length === 0 ? (
          <motion.div
            className="min-h-[60vh] flex items-center justify-center"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5 }}
          >
            <div className="text-center">
              <h2 className="text-4xl md:text-6xl font-black text-white mb-4">NO PHOTOS</h2>
              <p className="text-zinc-400 text-lg">No photos match your filters.</p>
              <button
                type="button"
                onClick={() => setFilterState(EMPTY_FILTER_STATE)}
                className="mt-6 px-4 py-2 text-xs uppercase tracking-wider font-medium border border-zinc-700 text-white hover:bg-zinc-900 transition-colors focus:outline-none focus:ring-1 focus:ring-white/50"
              >
                Clear filters
              </button>
            </div>
          </motion.div>
        ) : (
          <AnimatePresence mode="wait">
            <motion.div
              key={`grid-${filteredAndSortedPhotos.length}-${filtersActive ? 'f' : 'all'}`}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3 }}
              className={cn(
                'mx-auto',
                'columns-1 sm:columns-2 lg:columns-3 xl:columns-4',
                'gap-1.5 sm:gap-2 md:gap-4 space-y-1.5 sm:space-y-2 md:space-y-4'
              )}
            >
              {filteredAndSortedPhotos.map((photo) => (
                <PhotoMasonryCard key={photo.id} photo={photo} onSelect={handlePhotoSelect} />
              ))}
            </motion.div>
          </AnimatePresence>
        )}
      </main>

      <FullscreenModal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        items={mediaItems}
        initialIndex={selectedPhotoIndex ?? 0}
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

/** Single photo tile (masonry) — kept colocated; uses responsive hooks */
function PhotoMasonryCard({
  photo,
  onSelect,
}: {
  photo: Photo;
  onSelect: (photo: Photo, position: { x: number; y: number; width: number; height: number }) => void;
}) {
  const { isMobile } = useResponsive();
  const [isHovered, setIsHovered] = useState(false);

  return (
    <motion.div
      className="break-inside-avoid mb-1.5 sm:mb-2 md:mb-4"
      layout
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <motion.div
        onClick={(e) => {
          const rect = e.currentTarget.getBoundingClientRect();
          const scrollX = window.scrollX || window.pageXOffset;
          const scrollY = window.scrollY || window.pageYOffset;
          onSelect(photo, {
            x: rect.left + rect.width / 2 + scrollX,
            y: rect.top + rect.height / 2 + scrollY,
            width: rect.width,
            height: rect.height,
          });
        }}
        className="relative group cursor-zoom-in"
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
      >
        <div className="relative overflow-hidden bg-black">
          <img
            src={photo.imageUrl}
            alt={`IMANOL VILLAGOMEZ - ${photo.client || 'Concert'} photography${photo.year ? ` - ${photo.year}` : ''}`}
            className={cn('w-full', isMobile ? 'h-auto object-contain' : 'h-full object-cover')}
            loading="lazy"
            style={{ maxWidth: '100%', display: 'block' }}
          />
          <div
            className="absolute inset-0 pointer-events-none opacity-[0.1]"
            style={{
              backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 400 400' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")`,
              mixBlendMode: 'overlay',
            }}
          />
          <AnimatePresence>
            {isHovered && (
              <motion.div
                className="absolute inset-0 pointer-events-none"
                initial={{ opacity: 0 }}
                animate={{
                  opacity: [0, 0.3, 0, 0.2, 0],
                  x: [0, -2, 2, -1, 1, 0],
                }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.3 }}
                style={{
                  background:
                    'linear-gradient(45deg, rgba(220, 38, 38, 0.1) 0%, rgba(34, 197, 94, 0.1) 100%)',
                  mixBlendMode: 'screen',
                }}
              />
            )}
          </AnimatePresence>
        </div>
        <div className="relative z-10 mt-2 md:mt-3 p-1">
          <div className="flex items-center justify-between gap-2">
            <div>
              <p className="text-xs md:text-sm font-black text-white uppercase tracking-tighter">
                {photo.client || 'PHOTO'}
              </p>
              {photo.year && (
                <p className="text-[10px] md:text-xs text-zinc-400 uppercase tracking-wider mt-0.5">
                  {photo.year}
                </p>
              )}
            </div>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}
