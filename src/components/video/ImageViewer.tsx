import { useRef, useState, useEffect, useCallback } from 'react';
import { MediaItem } from '@/types/media';
import { PlatformInfo } from '@/utils/platform';

interface ImageViewerProps {
  item: MediaItem;
  platform: PlatformInfo;
  enableTouchGestures?: boolean;
  onLoad: () => void;
  onError: () => void;
  isLoading: boolean;
  hasError: boolean;
}

interface ZoomState {
  scale: number;
  translateX: number;
  translateY: number;
}

export const ImageViewer = ({
  item,
  platform: _platform,
  enableTouchGestures = true,
  onLoad,
  onError,
  isLoading,
  hasError,
}: ImageViewerProps) => {
  const imageRef = useRef<HTMLImageElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [zoomState, setZoomState] = useState<ZoomState>({
    scale: 1,
    translateX: 0,
    translateY: 0,
  });
  
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [lastTap, setLastTap] = useState(0);
  
  const minScale = 1;
  const maxScale = 2;
  
  // Reset zoom when item changes
  useEffect(() => {
    setZoomState({ scale: 1, translateX: 0, translateY: 0 });
  }, [item.id]);
  
  // Pinch-to-zoom handler
  const handleTouchStart = useCallback((e: React.TouchEvent) => {
    if (!enableTouchGestures || e.touches.length !== 2) return;
    
    e.preventDefault();
    const touch1 = e.touches[0];
    const touch2 = e.touches[1];
    
    const distance = Math.hypot(
      touch2.clientX - touch1.clientX,
      touch2.clientY - touch1.clientY
    );
    
    const initialDistance = distance;
    const initialScale = zoomState.scale;
    
    const handleTouchMove = (e: TouchEvent) => {
      if (e.touches.length !== 2) return;
      
      const touch1 = e.touches[0];
      const touch2 = e.touches[1];
      
      const currentDistance = Math.hypot(
        touch2.clientX - touch1.clientX,
        touch2.clientY - touch1.clientY
      );
      
      const scale = Math.max(
        minScale,
        Math.min(maxScale, (currentDistance / initialDistance) * initialScale)
      );
      
      setZoomState(prev => ({ ...prev, scale }));
    };
    
    const handleTouchEnd = () => {
      document.removeEventListener('touchmove', handleTouchMove);
      document.removeEventListener('touchend', handleTouchEnd);
    };
    
    document.addEventListener('touchmove', handleTouchMove);
    document.addEventListener('touchend', handleTouchEnd);
  }, [enableTouchGestures, zoomState.scale, minScale, maxScale]);
  
  // Double-tap to toggle zoom
  const handleDoubleTap = useCallback((e: React.MouseEvent | React.TouchEvent) => {
    const now = Date.now();
    const DOUBLE_TAP_DELAY = 300;
    
    if (now - lastTap < DOUBLE_TAP_DELAY) {
      e.preventDefault();
      
      if (zoomState.scale > minScale) {
        // Zoom out
        setZoomState({ scale: minScale, translateX: 0, translateY: 0 });
      } else {
        // Zoom in to 2x at tap point
        const rect = containerRef.current?.getBoundingClientRect();
        if (rect) {
          const clientX = 'touches' in e ? e.touches[0]?.clientX : e.clientX;
          const clientY = 'touches' in e ? e.touches[0]?.clientY : e.clientY;
          
          const x = clientX - rect.left - rect.width / 2;
          const y = clientY - rect.top - rect.height / 2;
          
          setZoomState({
            scale: maxScale,
            translateX: -x * (maxScale - 1),
            translateY: -y * (maxScale - 1),
          });
        }
      }
    }
    
    setLastTap(now);
  }, [lastTap, zoomState.scale, minScale, maxScale]);
  
  // Pan when zoomed
  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    if (zoomState.scale <= minScale) return;
    
    e.preventDefault();
    setIsDragging(true);
    setDragStart({ x: e.clientX - zoomState.translateX, y: e.clientY - zoomState.translateY });
  }, [zoomState.scale, zoomState.translateX, zoomState.translateY, minScale]);
  
  const handleMouseMove = useCallback((e: MouseEvent) => {
    if (!isDragging) return;
    
    setZoomState(prev => ({
      ...prev,
      translateX: e.clientX - dragStart.x,
      translateY: e.clientY - dragStart.y,
    }));
  }, [isDragging, dragStart]);
  
  const handleMouseUp = useCallback(() => {
    setIsDragging(false);
  }, []);
  
  useEffect(() => {
    if (isDragging) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
      
      return () => {
        document.removeEventListener('mousemove', handleMouseMove);
        document.removeEventListener('mouseup', handleMouseUp);
      };
    }
  }, [isDragging, handleMouseMove, handleMouseUp]);
  
  // Touch pan when zoomed
  const handleTouchMove = useCallback((e: React.TouchEvent) => {
    if (zoomState.scale <= minScale || e.touches.length !== 1) return;
    
    e.preventDefault();
    const touch = e.touches[0];
    
    setZoomState(prev => ({
      ...prev,
      translateX: touch.clientX - (containerRef.current?.getBoundingClientRect().left || 0) - (containerRef.current?.offsetWidth || 0) / 2,
      translateY: touch.clientY - (containerRef.current?.getBoundingClientRect().top || 0) - (containerRef.current?.offsetHeight || 0) / 2,
    }));
  }, [zoomState.scale, minScale]);
  
  if (!item.imageUrl) return null;
  
  return (
    <div 
      ref={containerRef}
      className="relative w-full h-full flex items-center justify-center overflow-hidden"
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onDoubleClick={handleDoubleTap}
      onMouseDown={handleMouseDown}
    >
      {/* Loading state */}
      {isLoading && !hasError && (
        <div className="absolute inset-0 flex items-center justify-center z-20">
          <div className="w-16 h-16 border-4 border-white border-t-transparent rounded-full animate-spin" />
        </div>
      )}
      
      {/* Error state */}
      {hasError && (
        <div className="absolute inset-0 flex items-center justify-center z-20">
          <div className="text-center p-8">
            <p className="text-red-500 text-xl font-bold mb-2">Failed to load image</p>
            <p className="text-zinc-400 text-sm">{item.title || 'Image'}</p>
          </div>
        </div>
      )}
      
      {/* Image with zoom and pan */}
      <img
        ref={imageRef}
        src={item.imageUrl}
        alt={item.title || 'Image'}
        className={`w-full h-full object-cover ${isLoading ? 'opacity-0' : 'opacity-100'} transition-opacity duration-300 select-none`}
        style={{
          transform: `scale(${zoomState.scale}) translate(${zoomState.translateX / zoomState.scale}px, ${zoomState.translateY / zoomState.scale}px)`,
          transformOrigin: 'center center',
          cursor: zoomState.scale > minScale ? 'grab' : 'default',
        }}
        onLoad={onLoad}
        onError={onError}
        draggable={false}
        aria-label={item.title || 'Image'}
      />
    </div>
  );
};

