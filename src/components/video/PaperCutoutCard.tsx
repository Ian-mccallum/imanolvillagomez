import { motion } from 'framer-motion';
import { Video, Photo } from '@/types';
import { cn } from '@/utils';
import { GrainTexture } from '@/components/ui/GrainTexture';
import { TornEdge } from '@/components/ui/TornEdge';
import { ScanLines } from '@/components/ui/ScanLines';
import { GlitchOverlay } from '@/components/ui/GlitchOverlay';
import { useState, useEffect } from 'react';

/**
 * PaperCutoutCard
 * 
 * Paper cutout style card for videos and photos
 * Carson: Overlapping, torn edges, experimental
 * Oliver: Distressed textures, dark beauty
 * Paper cutout aesthetic with shadows and rotations
 */

interface PaperCutoutCardProps {
  item: Video | Photo;
  onSelect: (position: { x: number; y: number; width: number; height: number }) => void;
  width: number;
  height: number;
  rotation?: number; // Layout rotation (from grid)
  zIndex?: number;
  isPhoto?: boolean;
}

export const PaperCutoutCard = ({
  item,
  onSelect,
  width,
  height,
  rotation = 0,
  zIndex = 1,
  isPhoto = false,
}: PaperCutoutCardProps) => {
  const [isHovered, setIsHovered] = useState(false);
  const [baseSize, setBaseSize] = useState(280); // Larger base so two cards fit per row
  
  // Calculate responsive base size - sized for 2 cards per row
  useEffect(() => {
    const updateBaseSize = () => {
      if (window.innerWidth < 768) {
        setBaseSize(160);  // Mobile: smaller base, 1 per row
      } else if (window.innerWidth < 1024) {
        setBaseSize(220);  // Tablet: medium base
      } else {
        setBaseSize(280);  // Desktop: larger base for 2-per-row layout
      }
    };
    
    updateBaseSize();
    window.addEventListener('resize', updateBaseSize);
    return () => window.removeEventListener('resize', updateBaseSize);
  }, []);
  
  const cardWidth = width * baseSize;
  const cardHeight = height * baseSize;
  
  // Use custom rotation from video data if available (for video element orientation correction)
  const videoRotation = !isPhoto && (item as Video).rotation !== undefined 
    ? (item as Video).rotation 
    : null;
  
  // Random rotation for paper cutout effect (aesthetic, always small -3 to 3 degrees)
  // Don't use videoRotation for container rotation - that's for video element only
  const randomRotation = rotation || (Math.random() * 6 - 3); // -3 to 3 degrees
  
  // Calculate margin to prevent overlap when rotated
  // For rotated items, we need extra space to account for the rotated bounding box
  const rotationRad = Math.abs(randomRotation) * (Math.PI / 180);
  
  // Calculate the bounding box of the rotated rectangle
  const cos = Math.abs(Math.cos(rotationRad));
  const sin = Math.abs(Math.sin(rotationRad));
  const rotatedWidth = cardWidth * cos + cardHeight * sin;
  const rotatedHeight = cardWidth * sin + cardHeight * cos;
  
  // Calculate extra margin needed (difference between rotated and original dimensions)
  const extraWidth = (rotatedWidth - cardWidth) / 2;
  const extraHeight = (rotatedHeight - cardHeight) / 2;
  // For messy organization, allow more overlap - reduce minimum margin
  const safeMargin = Math.max(extraWidth, extraHeight, 15); // Minimum 15px margin for messy aesthetic

  const imageUrl = isPhoto ? (item as Photo).imageUrl : (item as Video).thumbnail;
  const title = isPhoto ? (item as Photo).title : (item as Video).title;
  const client = item.client;

  const handleClick = (e: React.MouseEvent<HTMLDivElement>) => {
    e.stopPropagation();
    const rect = e.currentTarget.getBoundingClientRect();
    const scrollX = window.scrollX || window.pageXOffset;
    const scrollY = window.scrollY || window.pageYOffset;
    
    // Get the center of the clicked element
    const x = rect.left + rect.width / 2 + scrollX;
    const y = rect.top + rect.height / 2 + scrollY;
    
    onSelect({
      x,
      y,
      width: rect.width,
      height: rect.height,
    });
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      const rect = (e.currentTarget as HTMLElement).getBoundingClientRect();
      const scrollX = window.scrollX || window.pageXOffset;
      const scrollY = window.scrollY || window.pageYOffset;
      
      const x = rect.left + rect.width / 2 + scrollX;
      const y = rect.top + rect.height / 2 + scrollY;
      
      onSelect({
        x,
        y,
        width: rect.width,
        height: rect.height,
      });
    }
  };

  return (
    <div
      className="flex-shrink-0 cursor-pointer"
      onClick={handleClick}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      style={{
        width: `${cardWidth + safeMargin * 2}px`,
        height: `${cardHeight + safeMargin * 2}px`,
        padding: `${safeMargin}px`,
        zIndex: isHovered ? 40 : zIndex, // Lower z-index so modals (z-50) appear above
      }}
      role="button"
      tabIndex={0}
      onKeyDown={handleKeyDown}
      aria-label={isPhoto ? `View photo: ${title || 'Photo'}` : `View video: ${title || 'Video'}`}
    >
      <motion.div
        className={cn(
          'group relative w-full h-full',
          'transition-all duration-300'
        )}
        style={{
          width: `${cardWidth}px`,
          height: `${cardHeight}px`,
          transform: `rotate(${randomRotation}deg)`,
        }}
        whileHover={{ 
          scale: 1.05,
          rotate: randomRotation + 1, // Small aesthetic rotation on hover
        }}
        whileTap={{ scale: 0.98 }}
        initial={{ opacity: 0, y: 50, rotate: randomRotation }}
        animate={{ opacity: 1, y: 0, rotate: randomRotation }}
        transition={{ duration: 0.5, ease: 'easeOut' }}
      >
      {/* Paper cutout shadow */}
      <motion.div
        className="absolute inset-0 bg-black/40 blur-xl"
        style={{
          transform: `translate(8px, 8px) translateZ(-20px)`,
          opacity: isHovered ? 0.6 : 0.4,
        }}
      />
      
      {/* Main card - paper cutout style */}
      <motion.div
        className="relative w-full h-full bg-black overflow-hidden"
        style={{
          boxShadow: isHovered
            ? '0 20px 60px rgba(0, 0, 0, 0.8), 0 0 40px rgba(0, 0, 0, 0.4)'
            : '0 10px 30px rgba(0, 0, 0, 0.6), 0 0 20px rgba(0, 0, 0, 0.3)',
          transformStyle: 'preserve-3d',
        }}
      >
        {/* Torn edge effect - more pronounced for paper cutout */}
        <TornEdge intensity="strong" />
        
        {/* Content container - ensure full thumbnail is visible */}
        <div className="relative w-full h-full bg-black flex items-center justify-center">
          {isPhoto ? (
            <img
              src={imageUrl}
              alt={title || 'Photo'}
              className="w-full h-full object-contain transition-transform duration-700 group-hover:scale-105"
              loading="lazy"
              onError={(e) => {
                // Fallback placeholder for broken images
                (e.target as HTMLImageElement).src = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="800" height="600"%3E%3Crect fill="%2318181b" width="800" height="600"/%3E%3Ctext x="50%25" y="50%25" text-anchor="middle" dy=".3em" fill="%2322c55e" font-size="48" font-weight="bold"%3EPHOTO%3C/text%3E%3C/svg%3E';
              }}
            />
          ) : (
            <video
              src={imageUrl}
              className={`w-full h-full ${videoRotation === 270 ? 'object-cover' : 'object-contain'} transition-transform duration-700 group-hover:scale-105`}
              muted
              playsInline
              preload="metadata"
              style={{
                transform: videoRotation === 270 ? 'rotate(270deg) scale(1.2)' : 'none', // Scale to fill after rotation, reduced zoom
                transformOrigin: 'center center',
              }}
              onMouseEnter={(e) => {
                const video = e.currentTarget;
                // Seek to 1 second for better thumbnail
                if (video.readyState >= 2) {
                  if (isFinite(video.duration) && video.duration > 0) {
                    video.currentTime = Math.min(1, video.duration / 2);
                  } else {
                    video.currentTime = 1;
                  }
                  video.play().catch(() => {
                    // Autoplay prevented, that's okay
                  });
                } else {
                  video.addEventListener('loadedmetadata', () => {
                    if (isFinite(video.duration) && video.duration > 0) {
                      video.currentTime = Math.min(1, video.duration / 2);
                    } else {
                      video.currentTime = 1;
                    }
                    video.play().catch(() => {});
                  }, { once: true });
                }
              }}
              onMouseLeave={(e) => {
                const video = e.currentTarget;
                video.pause();
                if (isFinite(video.duration) && video.duration > 0) {
                  video.currentTime = Math.min(1, video.duration / 2);
                } else {
                  video.currentTime = 1;
                }
              }}
              onError={(e) => {
                const video = e.currentTarget;
                const errorCodes: Record<number, string> = {
                  1: 'MEDIA_ERR_ABORTED - Video loading aborted',
                  2: 'MEDIA_ERR_NETWORK - Network error',
                  3: 'MEDIA_ERR_DECODE - Video decoding error (codec not supported)',
                  4: 'MEDIA_ERR_SRC_NOT_SUPPORTED - Video format not supported'
                };
                console.error('Video thumbnail error:', {
                  code: video.error?.code,
                  codeName: video.error ? errorCodes[video.error.code] || 'Unknown error' : 'No error code',
                  message: video.error?.message,
                  src: video.src,
                  networkState: video.networkState,
                  readyState: video.readyState,
                  videoUrl: imageUrl
                });
                // Could show a placeholder here if needed
              }}
            />
          )}
          
          {/* Weirdcore: Glitch overlay */}
          {!isPhoto && <GlitchOverlay intensity="medium" trigger="hover" />}
          
          {/* Scan lines */}
          {!isPhoto && <ScanLines intensity="subtle" speed="slow" />}
          
          {/* Grain texture */}
          <GrainTexture />
        </div>
        
        {/* Title overlay (bottom) */}
        <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/90 via-black/50 to-transparent p-3">
          {title && (
            <h3 className={cn(
              'font-black uppercase tracking-tighter text-white text-xs md:text-sm',
              'group-hover:text-white transition-colors duration-300'
            )}>
              {title}
            </h3>
          )}
          {client && (
            <p className="text-[10px] md:text-xs text-zinc-400 mt-0.5">
              {client}
            </p>
          )}
        </div>
      </motion.div>
      </motion.div>
    </div>
  );
};

