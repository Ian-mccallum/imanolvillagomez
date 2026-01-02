/**
 * Preloading utilities for media items
 */

/**
 * Preload a video
 */
export function preloadVideo(url: string): Promise<void> {
  return new Promise((resolve, reject) => {
    const video = document.createElement('video');
    video.preload = 'metadata';
    video.src = url;
    
    video.addEventListener('loadedmetadata', () => {
      resolve();
    });
    
    video.addEventListener('error', (_e) => {
      reject(new Error('Failed to preload video'));
    });
    
    // Start loading
    video.load();
  });
}

/**
 * Preload an image
 */
export function preloadImage(url: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    
    img.onload = () => {
      resolve(img);
    };
    
    img.onerror = () => {
      reject(new Error('Failed to preload image'));
    };
    
    img.src = url;
  });
}

