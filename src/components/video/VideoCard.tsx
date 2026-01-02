import { motion } from 'framer-motion';
import { Video } from '@/types';
import { cn } from '@/utils';
import { GrainTexture } from '@/components/ui/GrainTexture';
import { FlashOverlay } from '@/components/ui/FlashOverlay';
import { GlitchOverlay } from '@/components/ui/GlitchOverlay';
import { HandwrittenText } from '@/components/ui/HandwrittenText';
import { useState, useMemo } from 'react';
import { useGlitchIntensity } from '@/hooks/useResponsive';

/**
 * VideoCard
 * 
 * Video-First: Standard sizing (300-500px width) allows many videos per screen
 * Cards are substantial but allow for many videos (80% visual weight through quantity)
 * Carson: Experimental layout, typography as image
 * Oliver: Dark, gothic, videos as light
 * West: Minimal, bold, iconic
 * Weirdcore: Glitch effects on hover
 * 
 * STEP-210: Update VideoCard component with standard sizing
 */

interface VideoCardProps {
  video: Video;
  isFeatured?: boolean;
  onSelect: (position?: { x: number; y: number; width: number; height: number }) => void;
  size?: 'standard' | 'auto';  // Standard size allows many videos (300-500px width)
  darkBackground?: boolean;  // If true, use white text for dark backgrounds
}

export const VideoCard = ({ 
  video, 
  isFeatured = false, 
  onSelect, 
  size = 'standard',
  darkBackground = false
}: VideoCardProps) => {
  const [isHovered, setIsHovered] = useState(false);
  const glitchIntensity = useGlitchIntensity();
  
  // Memoize random values for year tag placement (stable across re-renders)
  const yearTagConfig = useMemo(() => {
    if (!video.year) return null;
    const shouldShow = Math.random() > 0.7;
    if (!shouldShow) return null;
    return {
      show: true,
      top: 10 + Math.random() * 20,
      right: 10 + Math.random() * 20,
      rotation: -5 + Math.random() * 10,
      color: isFeatured ? 'red' : (Math.random() > 0.5 ? 'pink' : 'white') as 'red' | 'pink' | 'white',
    };
  }, [video.year, isFeatured]);

  // Standard sizing for Pinterest/scrapbook layout
  // Allows many videos to fill the page - larger videos with more breathing room
  const sizeClasses = {
    standard: 'w-full aspect-video',  // Standard video size - fills available space, maintains 16:9 aspect ratio
    auto: 'w-full aspect-video'  // Auto sizing, maintains aspect ratio
  };

  const handleClick = (e: React.MouseEvent<HTMLDivElement>) => {
    e.stopPropagation();
    const rect = e.currentTarget.getBoundingClientRect();
    const scrollX = window.scrollX || window.pageXOffset;
    const scrollY = window.scrollY || window.pageYOffset;
    
    const position = {
      x: rect.left + rect.width / 2 + scrollX,
      y: rect.top + rect.height / 2 + scrollY,
      width: rect.width,
      height: rect.height,
    };
    
    onSelect(position);
  };

  return (
    <motion.div
      onClick={handleClick}
      className={cn(
        'group relative cursor-zoom-in',
        'transition-all duration-300',
        sizeClasses[size]
      )}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: 'easeOut' }}
    >
      {/* Video thumbnail container - Standard size */}
      <div className={cn(
        'relative w-full overflow-hidden bg-black',
        sizeClasses[size]
      )}>
        {/* Use video element to display actual video thumbnail */}
        <video
          src={video.thumbnail || video.videoUrl}
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
          muted
          playsInline
          preload="metadata"
          style={{
            transform: video.rotation === 270 ? 'rotate(270deg) scale(1.2)' : 'none', // Scale to fill after rotation, reduced zoom
            transformOrigin: 'center center',
          }}
          onMouseEnter={(e) => {
            const videoEl = e.currentTarget;
            // Seek to 1 second for better thumbnail
            if (videoEl.readyState >= 2) {
              videoEl.currentTime = 1;
              videoEl.play().catch(() => {
                // Autoplay prevented, that's okay
              });
            } else {
              videoEl.addEventListener('loadedmetadata', () => {
                videoEl.currentTime = Math.min(1, videoEl.duration / 2);
                videoEl.play().catch(() => {});
              }, { once: true });
            }
          }}
          onMouseLeave={(e) => {
            const videoEl = e.currentTarget;
            videoEl.pause();
            videoEl.currentTime = Math.min(1, videoEl.duration / 2);
          }}
          onError={(e) => {
            console.error('Video thumbnail error:', e);
            // Could show a placeholder here if needed
          }}
        />
        
        {/* Oliver: Indie sleaze grain overlay - Enhanced (more prominent) */}
        <GrainTexture />
        
        {/* Indie sleaze: Flash photography effect on hover */}
        <FlashOverlay intensity="medium" isActive={isHovered} />
        
        {/* Weirdcore: Glitch overlay - Intentional, responsive intensity */}
        {/* Mobile: Subtle, Tablet: Medium, Desktop: Strong */}
        <GlitchOverlay intensity={glitchIntensity} trigger="hover" />

        {/* Handwritten year tag - Random placement, rotated (Indie sleaze) */}
        {yearTagConfig && (
          <div 
            className="absolute pointer-events-none z-10"
            style={{
              top: `${yearTagConfig.top}%`,
              right: `${yearTagConfig.right}%`,
            }}
          >
            <HandwrittenText
              color={yearTagConfig.color}
              rotation={yearTagConfig.rotation}
              size="sm"
            >
              {video.year}
            </HandwrittenText>
          </div>
        )}

      </div>

      {/* Carson: Title is experimental typography - minimal, videos are primary */}
      {/* Note: Text colors adapt to background (light or dark) */}
      {/* Format: artist/song/tour and date (matching legend) */}
      <div className="mt-3 md:mt-4">
        {/* Format: artist / song / tour (with spaces before and after slashes) */}
        <div className={cn(
          "text-sm md:text-base font-medium",
          darkBackground ? "text-white" : "text-text-dark"
        )}>
          {video.artist && video.song && video.tour ? (
            <span>{video.artist} / {video.song} / {video.tour}</span>
          ) : video.artist && video.song ? (
            <span>{video.artist} / {video.song}</span>
          ) : video.title ? (
            <span>{video.title}</span>
          ) : null}
        </div>
        
        {/* Date */}
        {video.date && (
          <div className={cn(
            "mt-1.5 text-xs md:text-sm",
            darkBackground ? "text-zinc-300" : "text-text-dark-tertiary"
          )}>
            {video.date}
          </div>
        )}
        
        {/* Fallback: show client/year if no date format available */}
        {!video.date && (video.client || video.year) && (
          <div className={cn(
            "flex items-center gap-2 mt-1.5 text-xs md:text-sm",
            darkBackground ? "text-zinc-300" : "text-text-dark-tertiary"
          )}>
            {video.client && (
              <span className="font-medium">{video.client}</span>
            )}
            {video.year && (
              <>
                <span>•</span>
                <span>{video.year}</span>
              </>
            )}
          </div>
        )}
      </div>

    </motion.div>
  );
};
