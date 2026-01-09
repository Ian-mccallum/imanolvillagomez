import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FullscreenModal } from '@/components/video';
import { photos } from '@/constants/photos';
import { Photo } from '@/types';
import { cn } from '@/utils';
import { photosToMediaItems } from '@/types/media';
import { usePageTitle, useMetaTags, useResponsive } from '@/hooks';
import { SEO_CONFIG, BASE_URL } from '@/constants';
import { StructuredData, createBreadcrumbSchema } from '@/components/seo/StructuredData';

/**
 * PhotosPage
 * 
 * Carson: Experimental typography, break the grid, asymmetrical layouts
 * Oliver: Dark canvas, photos as light, distressed textures, gothic beauty
 * West: Minimalist perfectionism, bold statements, clean aesthetics
 * Weirdcore: Glitch effects, digital artifacts, intentional glitches
 * 
 * Features:
 * - Photos sorted by artist (client)
 * - Artist filter dropdown/buttons
 * - Pinterest/masonry layout (scrapbook aesthetic)
 * - Dark background (Oliver)
 * - Experimental typography (Carson)
 * - Minimal, bold design (West)
 * - Glitch effects on hover (Weirdcore)
 * - Indie sleaze grain textures (Oliver)
 */

export const PhotosPage = () => {
  const seoConfig = SEO_CONFIG.photos;
  usePageTitle('Photos');
  useMetaTags({
    title: seoConfig.title,
    description: seoConfig.description,
    keywords: seoConfig.keywords,
  });

  // Breadcrumb schema
  const breadcrumbSchema = createBreadcrumbSchema([
    { name: 'Home', url: BASE_URL },
    { name: 'Work', url: `${BASE_URL}/work` },
    { name: 'Photos', url: `${BASE_URL}${seoConfig.path}` },
  ]);
  
  const [selectedPhotoIndex, setSelectedPhotoIndex] = useState<number | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [clickPosition, setClickPosition] = useState<{ x: number; y: number; width: number; height: number } | null>(null);
  const [selectedArtist, setSelectedArtist] = useState<string | null>(null);

  // Get all unique artists from photos
  const artists = useMemo(() => {
    const artistSet = new Set<string>();
    photos.forEach(photo => {
      if (photo.client) {
        artistSet.add(photo.client);
      }
    });
    return Array.from(artistSet).sort();
  }, []);

  // Filter and sort photos by artist
  const filteredAndSortedPhotos = useMemo(() => {
    let filtered = photos;
    
    // Filter by selected artist
    if (selectedArtist) {
      filtered = photos.filter(photo => photo.client === selectedArtist);
    }

    // Sort by artist (client), then by id
    return filtered.sort((a, b) => {
      const artistA = a.client || 'Unknown';
      const artistB = b.client || 'Unknown';
      
      if (artistA !== artistB) {
        return artistA.localeCompare(artistB);
      }
      
      return a.id.localeCompare(b.id);
    });
  }, [selectedArtist]);


  const handlePhotoSelect = (photo: Photo, position: { x: number; y: number; width: number; height: number }) => {
    const index = filteredAndSortedPhotos.findIndex(p => p.id === photo.id);
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
  
  // Convert filtered photos to media items
  const mediaItems = useMemo(() => photosToMediaItems(filteredAndSortedPhotos), [filteredAndSortedPhotos]);

  const handleArtistFilter = (artist: string | null) => {
    setSelectedArtist(artist);
  };

  return (
    <>
      <StructuredData data={breadcrumbSchema} />
      <div className="min-h-screen bg-black text-white relative -mt-12 md:-mt-14">
      {/* Oliver: Very intense grainy background texture - multiple layers */}
      <div
        className="fixed inset-0 pointer-events-none z-0"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 400 400' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='5.0' numOctaves='12' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)' opacity='1'/%3E%3C/svg%3E")`,
          mixBlendMode: 'overlay',
          opacity: 1,
        }}
      />
      
      {/* Second grain layer - more intensity */}
      <div
        className="fixed inset-0 pointer-events-none z-0"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 400 400' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter2'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='8.0' numOctaves='15' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter2)' opacity='1'/%3E%3C/svg%3E")`,
          mixBlendMode: 'multiply',
          opacity: 0.9,
        }}
      />
      
      {/* Third grain layer - maximum intensity */}
      <div
        className="fixed inset-0 pointer-events-none z-0"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 400 400' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter3'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='10.0' numOctaves='18' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter3)' opacity='1'/%3E%3C/svg%3E")`,
          mixBlendMode: 'screen',
          opacity: 0.7,
        }}
      />

      {/* Minimal header (5% visual weight) - West's bold minimalism + Carson's experimental typography */}
      {/* Mobile: Stack elements, reduce typography size */}
      <header className="container mx-auto px-4 md:px-6 pt-24 md:pt-20 lg:pt-24 pb-4 relative z-10">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3 md:gap-6">
          {/* Carson: Experimental typography - break the grid */}
          <div>
            <motion.h1
              className="text-2xl sm:text-3xl md:text-5xl lg:text-6xl font-black text-white uppercase tracking-tighter"
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, ease: "easeOut" }}
            >
            PHOTOS
            </motion.h1>
            <motion.p
              className="mt-2 text-zinc-400 text-xs sm:text-sm md:text-base uppercase tracking-wider"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.5, delay: 0.1 }}
            >
              {filteredAndSortedPhotos.length} {filteredAndSortedPhotos.length === 1 ? 'PHOTO' : 'PHOTOS'}
              {selectedArtist && ` • ${selectedArtist.toUpperCase()}`}
            </motion.p>
          </div>

          {/* Artist filter - West's minimal but bold - Touch-friendly on mobile */}
          <div className="flex flex-wrap gap-2 md:gap-3">
            <motion.button
              onClick={() => handleArtistFilter(null)}
              className={cn(
                "px-4 py-2.5 text-sm md:text-base font-bold uppercase tracking-wider transition-all duration-200",
                "border-2 min-h-[44px] flex items-center justify-center",
                selectedArtist === null
                  ? "bg-white text-black border-white"
                  : "bg-transparent text-white border-white/30 hover:border-white/60"
              )}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.3, delay: 0.2 }}
            >
              ALL
            </motion.button>
            
            {artists.map((artist, index) => (
              <motion.button
                key={artist}
                onClick={() => handleArtistFilter(artist)}
                className={cn(
                  "px-4 py-2.5 text-sm md:text-base font-bold uppercase tracking-wider transition-all duration-200",
                  "border-2 min-h-[44px] flex items-center justify-center",
                  selectedArtist === artist
                    ? "bg-white text-black border-white"
                    : "bg-transparent text-white border-white/30 hover:border-white/60"
                )}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.3, delay: 0.2 + index * 0.05 }}
              >
                {artist}
              </motion.button>
            ))}
          </div>
        </div>
      </header>

      {/* Photo grid (80% visual weight) - Pinterest/masonry layout - scrapbook aesthetic */}
      {/* Mobile: Single column grid for better photo visibility, Desktop: Masonry columns */}
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
              <p className="text-zinc-400 text-lg">No photos found for this filter.</p>
            </div>
          </motion.div>
        ) : (
          <AnimatePresence mode="wait">
            {/* Mobile: Single column grid for full photo visibility, Desktop: Masonry columns for scrapbook aesthetic */}
            <motion.div
              key={selectedArtist || 'all'}
              className="grid grid-cols-1 md:block md:columns-2 lg:columns-3 xl:columns-4 gap-3 md:gap-6"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3 }}
            >
              {filteredAndSortedPhotos.map((photo, index) => (
                <PhotoCard
                  key={photo.id}
                  photo={photo}
                  index={index}
                  onSelect={handlePhotoSelect}
                />
              ))}
            </motion.div>
          </AnimatePresence>
        )}
      </main>

      {/* Fullscreen Modal */}
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

/**
 * PhotoCard
 * 
 * Individual photo card for masonry layout
 * Carson: Experimental layout, typography as image
 * Oliver: Dark, gothic, photos as light
 * West: Minimal, bold, iconic
 * Weirdcore: Glitch effects on hover
 */
interface PhotoCardProps {
  photo: Photo;
  index: number;
  onSelect: (photo: Photo, position: { x: number; y: number; width: number; height: number }) => void;
}

const PhotoCard = ({ photo, index, onSelect }: PhotoCardProps) => {
  const [isHovered, setIsHovered] = useState(false);
  const { isMobile } = useResponsive();

  // Random sizing for scrapbook aesthetic (but not too extreme)
  // Mobile: Let photos use natural aspect ratio, Desktop: Varied for scrapbook feel
  const aspectRatios = [1, 1.2, 0.8, 1.5, 0.9, 1.3];
  const aspectRatio = aspectRatios[index % aspectRatios.length];

  const handleClick = (e: React.MouseEvent<HTMLDivElement>) => {
    e.stopPropagation();
    const rect = e.currentTarget.getBoundingClientRect();
    const scrollX = window.scrollX || window.pageXOffset;
    const scrollY = window.scrollY || window.pageYOffset;
    
    const x = rect.left + rect.width / 2 + scrollX;
    const y = rect.top + rect.height / 2 + scrollY;
    const width = rect.width;
    const height = rect.height;
    
    onSelect(photo, { x, y, width, height });
  };

  return (
    <motion.div
      className="break-inside-avoid mb-3 md:mb-6 group cursor-pointer w-full"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: index * 0.05 }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onClick={handleClick}
    >
      {/* Mobile: Container adapts to image natural size, Desktop: Fixed aspect ratio for masonry */}
      <motion.div
        className={cn(
          "relative overflow-hidden bg-black w-full",
          isMobile ? "min-h-[200px]" : ""
        )}
        style={{ 
          // Mobile: No aspect ratio constraint - let image determine height naturally
          // Desktop: Use aspect ratio for masonry layout
          aspectRatio: !isMobile ? aspectRatio : undefined,
          maxWidth: '100%',
        }}
        whileHover={{ scale: isMobile ? 1 : 1.02 }}
        transition={{ duration: 0.2 }}
      >
        {/* Photo - Oliver: Photos as light in darkness */}
        {/* Mobile: object-contain to show full photo without cropping, Desktop: object-cover for scrapbook aesthetic */}
        <img
          src={photo.imageUrl}
          alt={`IMANOL VILLAGOMEZ - ${photo.client || 'Concert'} photography${photo.year ? ` - ${photo.year}` : ''}`}
          className={cn(
            "w-full",
            isMobile ? "h-auto object-contain" : "h-full object-cover"
          )}
          loading="lazy"
          style={{
            maxWidth: '100%',
            display: 'block',
          }}
        />

        {/* Oliver: Indie sleaze grain overlay */}
        <div
          className="absolute inset-0 pointer-events-none opacity-20"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 400 400' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")`,
            mixBlendMode: 'overlay',
          }}
        />

        {/* Weirdcore: Glitch overlay on hover */}
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
                background: 'linear-gradient(90deg, transparent 0%, rgba(255, 255, 255, 0.1) 50%, transparent 100%)',
              }}
            />
          )}
        </AnimatePresence>

        {/* West: Minimal metadata overlay - Show on tap for mobile */}
        <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-4 opacity-0 group-active:opacity-100 md:group-hover:opacity-100 transition-opacity duration-200">
          {photo.client && (
            <p className="text-white text-sm font-bold uppercase tracking-wider">
              {photo.client}
            </p>
          )}
          {photo.year && (
            <p className="text-zinc-400 text-xs mt-1">
              {photo.year}
            </p>
          )}
        </div>
      </motion.div>
    </motion.div>
  );
};
