import { motion, useMotionValue, useSpring, useTransform } from 'framer-motion';
import { Video } from '@/types';
import { cn } from '@/utils';
import { GrainTexture } from '@/components/ui/GrainTexture';
import { TornEdge } from '@/components/ui/TornEdge';
import { ScanLines } from '@/components/ui/ScanLines';
import { GlitchOverlay } from '@/components/ui/GlitchOverlay';
import { HandwrittenText } from '@/components/ui/HandwrittenText';
import { useState } from 'react';

/**
 * VideoCard3D
 * 
 * 3D video card with perspective and tilt effects
 * Carson: Experimental, overlapping
 * Oliver: Distressed textures, dark beauty
 * Strauss: Bold, viral-worthy
 * Weirdcore: Glitch effects, digital artifacts
 */

interface VideoCard3DProps {
  video: Video;
  onSelect: () => void;
  width: number;
  height: number;
  rotation?: number;
  zIndex?: number;
}

export const VideoCard3D = ({
  video,
  onSelect,
  width,
  height,
  rotation = 0,
  zIndex = 1,
}: VideoCard3DProps) => {
  const [isHovered, setIsHovered] = useState(false);
  
  // 3D tilt effect
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  
  const springConfig = { damping: 25, stiffness: 200 };
  const xSpring = useSpring(x, springConfig);
  const ySpring = useSpring(y, springConfig);
  
  // Calculate rotation based on mouse position
  const rotateX = useTransform(ySpring, [-0.5, 0.5], [7.5, -7.5]);
  const rotateY = useTransform(xSpring, [-0.5, 0.5], [-7.5, 7.5]);
  
  // Calculate size
  const baseSize = 200;
  const cardWidth = width * baseSize;
  const cardHeight = height * baseSize;
  
  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;
    
    const xValue = (e.clientX - centerX) / (rect.width / 2);
    const yValue = (e.clientY - centerY) / (rect.height / 2);
    
    x.set(xValue);
    y.set(yValue);
  };
  
  const handleMouseLeave = () => {
    x.set(0);
    y.set(0);
    setIsHovered(false);
  };

  return (
    <motion.div
      onClick={onSelect}
      onMouseMove={handleMouseMove}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={handleMouseLeave}
      className={cn(
        'group relative cursor-pointer',
        'transition-all duration-300'
      )}
      style={{
        width: `${cardWidth}px`,
        height: `${cardHeight}px`,
        transform: `rotate(${rotation}deg)`,
        zIndex: isHovered ? 100 : zIndex,
        perspective: '1000px',
      }}
      whileTap={{ scale: 0.98 }}
      initial={{ opacity: 0, y: 50 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: 'easeOut' }}
    >
      {/* 3D container */}
      <motion.div
        style={{
          rotateX,
          rotateY,
          transformStyle: 'preserve-3d',
          width: '100%',
          height: '100%',
        }}
        className="relative"
      >
        {/* Card shadow/glow - 3D depth */}
        <motion.div
          className="absolute inset-0 bg-white/10 blur-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"
          style={{
            transform: 'translateZ(-80px) scale(1.2)',
          }}
        />
        
        {/* Additional depth layer */}
        <motion.div
          className="absolute inset-0 bg-red-gore/10 blur-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500"
          style={{
            transform: 'translateZ(-40px) scale(1.1)',
          }}
        />
        
        {/* Main card */}
        <motion.div
          className="relative w-full h-full bg-black"
          style={{
            transform: 'translateZ(0)',
            boxShadow: isHovered
              ? '0 30px 80px rgba(34, 197, 94, 0.4), 0 0 60px rgba(34, 197, 94, 0.2), 0 0 100px rgba(34, 197, 94, 0.1)'
              : '0 10px 30px rgba(0, 0, 0, 0.5), 0 0 20px rgba(0, 0, 0, 0.3)',
            transformStyle: 'preserve-3d',
          }}
        >
          {/* Torn edge effect */}
          <TornEdge intensity="medium" />
          
          {/* Video thumbnail container */}
          <div className="relative w-full h-full overflow-hidden">
            {/* Use video as thumbnail - browser will generate thumbnail */}
            <video
              src={video.thumbnail}
              className="w-full h-full object-cover"
              muted
              playsInline
              preload="metadata"
              crossOrigin="anonymous"
              style={{
                transform: isHovered ? 'scale(1.1) translateZ(20px)' : 'scale(1) translateZ(0)',
              }}
              onMouseEnter={(e) => {
                const video = e.currentTarget;
                video.currentTime = 1; // Seek to 1 second for thumbnail
                video.play().catch(() => {}); // Try to play on hover
              }}
              onMouseLeave={(e) => {
                e.currentTarget.pause();
                e.currentTarget.currentTime = 1;
              }}
            />
            
            {/* Weirdcore: Glitch overlay */}
            <GlitchOverlay intensity="medium" trigger="hover" />
            
            {/* Scan lines */}
            <ScanLines intensity="subtle" speed="slow" />
            
            {/* Grain texture */}
            <GrainTexture />
            
            {/* Handwritten text overlay */}
            {Math.random() > 0.7 && (
              <motion.div
                className="absolute top-2 left-2 z-10"
                style={{
                  transform: 'translateZ(30px)',
                }}
              >
                <HandwrittenText
                  color={Math.random() > 0.5 ? 'green' : 'pink'}
                  size="sm"
                  rotation={Math.random() * 10 - 5}
                >
                  {video.year || 'NEW'}
                </HandwrittenText>
              </motion.div>
            )}
            
            {/* Play button overlay */}
            <motion.div
              className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300"
              style={{
                transform: 'translateZ(40px)',
              }}
            >
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
            </motion.div>
          </div>
          
          {/* Title overlay (bottom) */}
          <motion.div
            className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/90 via-black/50 to-transparent p-3"
            style={{
              transform: 'translateZ(20px)',
            }}
          >
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
          </motion.div>
        </motion.div>
      </motion.div>
    </motion.div>
  );
};

