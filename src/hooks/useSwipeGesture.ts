import { useRef, useCallback } from 'react';

interface SwipeGestureOptions {
  onSwipeLeft?: () => void;
  onSwipeRight?: () => void;
  onSwipeUp?: () => void;
  onSwipeDown?: () => void;
  threshold?: number; // Minimum distance in pixels
  velocityThreshold?: number; // Minimum velocity
  preventDefault?: boolean;
}

/**
 * Hook for detecting swipe gestures
 */
export function useSwipeGesture({
  onSwipeLeft,
  onSwipeRight,
  onSwipeUp,
  onSwipeDown,
  threshold = 50,
  velocityThreshold = 0.3,
  preventDefault = true,
}: SwipeGestureOptions) {
  const startPos = useRef<{ x: number; y: number; time: number } | null>(null);
  
  const handleTouchStart = useCallback((e: React.TouchEvent) => {
    if (e.touches.length !== 1) return;
    
    const touch = e.touches[0];
    startPos.current = {
      x: touch.clientX,
      y: touch.clientY,
      time: Date.now(),
    };
  }, []);
  
  const handleTouchMove = useCallback((e: React.TouchEvent) => {
    if (preventDefault && e.touches.length === 1) {
      e.preventDefault();
    }
  }, [preventDefault]);
  
  const handleTouchEnd = useCallback((e: React.TouchEvent) => {
    if (!startPos.current || e.changedTouches.length !== 1) {
      startPos.current = null;
      return;
    }
    
    const touch = e.changedTouches[0];
    const deltaX = touch.clientX - startPos.current.x;
    const deltaY = touch.clientY - startPos.current.y;
    const deltaTime = Date.now() - startPos.current.time;
    const distance = Math.hypot(deltaX, deltaY);
    const velocity = distance / deltaTime;
    
    // Check if swipe meets threshold
    if (distance < threshold || velocity < velocityThreshold) {
      startPos.current = null;
      return;
    }
    
    // Determine swipe direction
    const absX = Math.abs(deltaX);
    const absY = Math.abs(deltaY);
    
    if (absX > absY) {
      // Horizontal swipe
      if (deltaX > 0 && onSwipeRight) {
        onSwipeRight();
      } else if (deltaX < 0 && onSwipeLeft) {
        onSwipeLeft();
      }
    } else {
      // Vertical swipe
      if (deltaY > 0 && onSwipeDown) {
        onSwipeDown();
      } else if (deltaY < 0 && onSwipeUp) {
        onSwipeUp();
      }
    }
    
    startPos.current = null;
  }, [threshold, velocityThreshold, onSwipeLeft, onSwipeRight, onSwipeUp, onSwipeDown]);
  
  return {
    onTouchStart: handleTouchStart,
    onTouchMove: handleTouchMove,
    onTouchEnd: handleTouchEnd,
  };
}

