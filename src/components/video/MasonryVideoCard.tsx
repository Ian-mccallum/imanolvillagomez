import { motion } from 'framer-motion';
import { Video } from '@/types';
import { cn } from '@/utils';
import { GrainTexture } from '@/components/ui/GrainTexture';
import { TornEdge } from '@/components/ui/TornEdge';
import { ScanLines } from '@/components/ui/ScanLines';
import { GlitchOverlay } from '@/components/ui/GlitchOverlay';
import { HandwrittenText } from '@/components/ui/HandwrittenText';

/**
 * MasonryVideoCard
 * 
 * Pinterest mood board style video card
 * Carson: Overlapping, torn edges, experimental
 * Oliver: Distressed textures, dark beauty
 * Strauss: Bold, viral-worthy
 * Weirdcore: Glitch effects, scan lines
 */

interface MasonryVideoCardProps {
  video: Video;
  onSelect: (position?: { x: number; y: number; width: number; height: number }) => void;
  width: number; // Column span (1-4)
  height: number; // Row span (1-4)
  rotation?: number; // Random rotation for collage effect
  zIndex?: number; // For overlapping
}

export const MasonryVideoCard = ({
  video,
  onSelect,
  width,
  height,
  rotation = 0,
  zIndex = 1,
}: MasonryVideoCardProps) => {
  // Calculate size based on width/height
  const baseSize = 200; // Base size in pixels
  const cardWidth = width * baseSize;
  const cardHeight = height * baseSize;

  // Random rotation for collage effect (-2 to 2 degrees)
  const randomRotation = rotation || (Math.random() * 4 - 2);

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
        'group relative cursor-pointer',
        'transition-all duration-300',
        'bg-black'
      )}
      style={{
        width: `${cardWidth}px`,
        height: `${cardHeight}px`,
        transform: `rotate(${randomRotation}deg)`,
        zIndex,
      }}
      whileHover={{ 
        scale: 1.05,
        rotate: randomRotation + 0.5,
        zIndex: 100,
      }}
      whileTap={{ scale: 0.98 }}
      initial={{ opacity: 0, y: 50, rotate: randomRotation }}
      animate={{ opacity: 1, y: 0, rotate: randomRotation }}
      transition={{ duration: 0.5, ease: 'easeOut' }}
    >
      {/* Torn edge effect */}
      <TornEdge intensity="medium" />
      
          {/* Video thumbnail container */}
          <div className="relative w-full h-full overflow-hidden">
            <video
              src={video.thumbnail}
              className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
              muted
              playsInline
              preload="metadata"
              crossOrigin="anonymous"
              style={{
                transform: video.rotation === 270 ? 'rotate(270deg) scale(1.2)' : 'none', // Scale to fill after rotation, reduced zoom
                transformOrigin: 'center center',
              }}
              onMouseEnter={(e) => {
                const video = e.currentTarget;
                if (isFinite(video.duration) && video.duration > 0) {
                  video.currentTime = Math.min(1, video.duration / 2);
                } else {
                  video.currentTime = 1;
                }
                video.play().catch(() => {});
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
            />
        
        {/* Weirdcore: Glitch overlay */}
        <GlitchOverlay intensity="medium" trigger="hover" />
        
        {/* Scan lines */}
        <ScanLines intensity="subtle" speed="slow" />
        
        {/* Grain texture */}
        <GrainTexture />
        
        {/* Handwritten text overlay (indie sleaze) */}
        {Math.random() > 0.7 && (
          <div className="absolute top-2 left-2 z-10">
            <HandwrittenText
              color={Math.random() > 0.5 ? 'green' : 'pink'}
              size="sm"
              rotation={Math.random() * 10 - 5}
            >
              {video.year || 'NEW'}
            </HandwrittenText>
          </div>
        )}
        
        {/* Play button overlay */}
        <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
          <motion.div
            className="w-16 h-16 bg-white/90 rounded-full flex items-center justify-center backdrop-blur-sm"
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
          >
            <svg
              className="w-8 h-8 text-black ml-1"
              fill="currentColor"
              viewBox="0 0 24 24"
            >
              <path d="M8 5v14l11-7z" />
            </svg>
          </motion.div>
        </div>
      </div>

      {/* Title overlay (bottom) */}
      <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/90 via-black/50 to-transparent p-3">
        <h3 className={cn(
          'font-black uppercase tracking-tighter text-white text-xs md:text-sm',
          'group-hover:text-white transition-colors duration-300'
        )}>
          {video.title}
        </h3>
        {video.client && (
          <p className="text-[10px] md:text-xs text-zinc-400 mt-0.5">
            {video.client}
          </p>
        )}
      </div>
    </motion.div>
  );
};

