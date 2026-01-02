import { Photo } from '@/types';
import { motion } from 'framer-motion';
import { useState, useEffect, useRef } from 'react';

/**
 * PhotoScatter
 * 
 * Carson: Organic layout - break the grid
 * Oliver: Photos scattered like a dark collage
 * West: Minimalist perfectionism - fewer photos, cleaner
 * Video-First: Photos overlay video background organically
 * 
 * Scatters photos organically across the screen with random positions,
 * rotations, and sizes - like a moodboard or scrapbook
 * 
 * Features smooth, subtle movement and fade in/out effects
 */

interface PhotoScatterProps {
  photos: Photo[];
  onPhotoClick?: (photo: Photo) => void;
  // Navigation bounds to avoid overlap
  navigationBounds?: { centerX: number; centerY: number; width: number; height: number };
}

export const PhotoScatter = ({ photos, onPhotoClick, navigationBounds }: PhotoScatterProps) => {
  const [visiblePhotoIndices, setVisiblePhotoIndices] = useState<number[]>([]);
  const [photoPositions, setPhotoPositions] = useState<Map<number, { x: number; y: number; size: number; rotation: number; scale: number }>>(new Map());
  const timersRef = useRef<Map<number, NodeJS.Timeout>>(new Map());

  // Function to generate a random position that doesn't overlap
  const generateRandomPosition = (
    existingPositions: Map<number, { x: number; y: number; size: number }>,
    viewportWidth: number,
    viewportHeight: number,
    navCenterX: number,
    navCenterY: number,
    minSize: number,
    maxSize: number,
    minPhotoDistance: number,
    minDistanceFromCenter: number,
    edgeMargin: number,
    footerBuffer: number
  ): { x: number; y: number; size: number } | null => {
    let attempts = 0;
    const size = minSize + Math.random() * (maxSize - minSize);
    
    while (attempts < 500) {
      // Completely random position
      const x = Math.random() * (viewportWidth - 2 * edgeMargin) + edgeMargin;
      // Avoid footer area - ensure photo's bottom edge (y + size/2) doesn't go into footer zone
      const maxY = viewportHeight - footerBuffer - (size / 2);
      const y = Math.random() * (maxY - edgeMargin) + edgeMargin;
      
      // Check distance from center
      const distanceFromCenter = Math.sqrt(
        Math.pow(x - navCenterX, 2) + Math.pow(y - navCenterY, 2)
      );
      
      if (distanceFromCenter >= minDistanceFromCenter) {
        // Check distance from existing photos
        let tooClose = false;
        for (const [_, placed] of existingPositions) {
          const distance = Math.sqrt(
            Math.pow(x - placed.x, 2) + Math.pow(y - placed.y, 2)
          );
          const minRequiredDistance = (size / 2) + (placed.size / 2) + minPhotoDistance;
          if (distance < minRequiredDistance) {
            tooClose = true;
            break;
          }
        }
        
        if (!tooClose) {
          return { x, y, size };
        }
      }
      
      attempts++;
    }
    
    return null;
  };

  // Initialize with random photos and positions
  useEffect(() => {
    if (photos.length === 0 || typeof window === 'undefined') return;
    
    const viewportWidth = window.innerWidth;
    const viewportHeight = window.innerHeight;
    const navCenterX = navigationBounds?.centerX ?? viewportWidth / 2;
    const navCenterY = navigationBounds?.centerY ?? viewportHeight / 2;
    const navWidth = navigationBounds?.width ?? 600;
    const navHeight = navigationBounds?.height ?? 400;
    const navRadius = Math.max(navWidth, navHeight) / 2;
    
    const minSize = viewportWidth < 768 ? 140 : 200;
    const maxSize = viewportWidth < 768 ? 220 : 320;
    const minPhotoDistance = maxSize * 1.5; // More spacing between photos
    const minDistanceFromCenter = navRadius + maxSize * 2.5;
    const edgeMargin = maxSize * 0.15;
    const footerHeight = 30;
    const footerBuffer = footerHeight + 120;
    
    const initialIndices: number[] = [];
    const used = new Set<number>();
    const positions = new Map<number, { x: number; y: number; size: number }>();
    
    // West: Minimalist - fewer photos for cleaner look
    const photoCount = 6;
    for (let i = 0; i < photoCount; i++) {
      // Select random photo - prefer unique photos
      let randomIndex = Math.floor(Math.random() * photos.length);
      let attempts = 0;
      while (used.has(randomIndex) && attempts < 100 && photos.length > photoCount) {
        randomIndex = Math.floor(Math.random() * photos.length);
        attempts++;
      }
      
      used.add(randomIndex);
      initialIndices.push(randomIndex);
      
      // Generate position
      let position = generateRandomPosition(
        positions,
        viewportWidth,
        viewportHeight,
        navCenterX,
        navCenterY,
        minSize,
        maxSize,
        minPhotoDistance,
        minDistanceFromCenter,
        edgeMargin,
        footerBuffer
      );
      
      // Fallback: if position generation fails, place in corner areas
      if (!position) {
        const maxY = viewportHeight - footerBuffer;
        const safeBottomY = maxY * 0.85;
        const cornerAreas = [
          { x: viewportWidth * 0.15, y: viewportHeight * 0.15 },
          { x: viewportWidth * 0.85, y: viewportHeight * 0.15 },
          { x: viewportWidth * 0.15, y: safeBottomY },
          { x: viewportWidth * 0.85, y: safeBottomY },
          { x: viewportWidth * 0.1, y: viewportHeight * 0.5 },
          { x: viewportWidth * 0.9, y: viewportHeight * 0.5 },
        ];
        const corner = cornerAreas[i % cornerAreas.length];
        const size = minSize + Math.random() * (maxSize - minSize);
        const maxYForSize = viewportHeight - footerBuffer - (size / 2);
        position = {
          x: Math.max(edgeMargin, Math.min(viewportWidth - edgeMargin, corner.x + (Math.random() - 0.5) * maxSize * 0.5)),
          y: Math.max(edgeMargin, Math.min(maxYForSize, corner.y + (Math.random() - 0.5) * maxSize * 0.5)),
          size,
        };
      }
      
      positions.set(i, position);
    }
    
    setVisiblePhotoIndices(initialIndices);
    
    // Initialize positions with rotation and scale
    const positionsWithProps = new Map<number, { x: number; y: number; size: number; rotation: number; scale: number }>();
    positions.forEach((pos, index) => {
      positionsWithProps.set(index, {
        ...pos,
        rotation: (Math.random() * 20) - 10, // Reduced rotation range
        scale: 0.9 + Math.random() * 0.2, // Tighter scale range
      });
    });
    setPhotoPositions(positionsWithProps);
  }, [photos, navigationBounds]);

  // Cycle photos at different staggered times - simplified, no position changes
  useEffect(() => {
    if (photoPositions.size === 0 || visiblePhotoIndices.length === 0 || photos.length === 0 || typeof window === 'undefined') return;
    
    // Only set up timers if they haven't been set up yet
    if (timersRef.current.size > 0) return;

    // Cycle function with staggered initial delays and randomizing delays
    const setupCycleForPosition = (positionIndex: number, isInitial: boolean = false) => {
      const existingTimer = timersRef.current.get(positionIndex);
      if (existingTimer) {
        clearTimeout(existingTimer);
      }

      // Initial staggered delays: 8s, 15s, 22s, 29s, 36s, 43s...
      // After that, randomize: 12-25 seconds
      const cycleTime = isInitial 
        ? 8000 + (positionIndex * 7000) + (Math.random() * 3000) // Staggered: ~8s, ~15s, ~22s, etc. with randomness
        : 12000 + Math.random() * 13000; // Random: 12-25 seconds
      
      const timer = setTimeout(() => {
        // Pick new random photo - simple, no position changes
        setVisiblePhotoIndices(prev => {
          const newIndices = [...prev];
          const availablePhotos = photos
            .map((_, idx) => idx)
            .filter(idx => !prev.includes(idx) || idx === prev[positionIndex]);
          
          if (availablePhotos.length > 0) {
            const randomNewPhoto = availablePhotos[Math.floor(Math.random() * availablePhotos.length)];
            newIndices[positionIndex] = randomNewPhoto;
          }
          return newIndices;
        });
        
        // Set up next cycle with randomized delay (not initial)
        setupCycleForPosition(positionIndex, false);
      }, cycleTime);

      timersRef.current.set(positionIndex, timer);
    };

    // Set up initial cycles with staggered delays
    visiblePhotoIndices.forEach((_, positionIndex) => {
      setupCycleForPosition(positionIndex, true);
    });

    return () => {
      timersRef.current.forEach(timer => clearTimeout(timer));
      timersRef.current.clear();
    };
  }, [photoPositions.size, photos, navigationBounds]);


  if (photoPositions.size === 0 || visiblePhotoIndices.length === 0) return null;

  return (
    <div className="relative w-full h-full pointer-events-none">
      {Array.from(photoPositions.entries()).map(([positionIndex, position]) => {
        const { x, y, size, rotation, scale } = position;
        const photoIndex = visiblePhotoIndices[positionIndex];
        
        // Only render if we have a valid photo
        if (photoIndex === undefined || photoIndex < 0 || photoIndex >= photos.length || !photos[photoIndex]) {
          return null;
        }
        
        const photo = photos[photoIndex];
        const zIndex = positionIndex + 1;

        return (
          <motion.div
            key={`${positionIndex}-${photoIndex}`}
            className="absolute cursor-pointer group pointer-events-auto"
            style={{
              left: `${x}px`,
              top: `${y}px`,
              width: `${size}px`,
              height: `${size}px`,
              zIndex,
              transform: 'translate(-50%, -50%)',
            }}
            initial={{ 
              opacity: 0,
              scale: scale * 0.8,
            }}
            animate={{
              opacity: 1,
              scale: scale,
            }}
            exit={{
              opacity: 0,
              scale: scale * 0.8,
              transition: { duration: 0.3 }
            }}
            transition={{
              duration: 0.3,
              ease: "easeOut",
            }}
            whileHover={{ 
              scale: scale * 1.1,
              rotate: rotation + (Math.random() > 0.5 ? 3 : -3),
              zIndex: 50,
              transition: { duration: 0.2 }
            }}
            onClick={() => onPhotoClick?.(photo)}
            data-photo-id={photo.id}
          >
            {/* Photo with rounded corners and shadow */}
            <div className="w-full h-full overflow-hidden rounded-sm shadow-2xl">
              <img
                src={photo.imageUrl}
                alt={photo.client || 'Photo'}
                className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110"
                loading="lazy"
              />
              
              {/* Subtle border */}
              <div className="absolute inset-0 border border-white/10 pointer-events-none" />
            </div>
            
            {/* Indie sleaze grain overlay */}
            <div 
              className="absolute inset-0 pointer-events-none opacity-20"
              style={{
                backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 400 400' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")`,
                mixBlendMode: 'overlay',
              }}
            />
          </motion.div>
        );
      })}
    </div>
  );
};
