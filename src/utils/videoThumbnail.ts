/**
 * Video Thumbnail Utilities
 * 
 * Generate thumbnails from video files
 */

/**
 * Generate a thumbnail from a video file
 * Uses the video element to capture a frame
 */
export const generateVideoThumbnail = (
  videoUrl: string,
  time: number = 1
): Promise<string> => {
  return new Promise((resolve, reject) => {
    const video = document.createElement('video');
    video.crossOrigin = 'anonymous';
    video.preload = 'metadata';
    
    video.onloadedmetadata = () => {
      video.currentTime = time;
    };
    
    video.onseeked = () => {
      const canvas = document.createElement('canvas');
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      const ctx = canvas.getContext('2d');
      
      if (ctx) {
        ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
        const thumbnail = canvas.toDataURL('image/jpeg', 0.8);
        resolve(thumbnail);
      } else {
        reject(new Error('Could not get canvas context'));
      }
    };
    
    video.onerror = () => {
      reject(new Error('Failed to load video'));
    };
    
    video.src = videoUrl;
  });
};

/**
 * Get video thumbnail URL
 * For now, returns the video URL - browser will handle thumbnail generation
 * In production, you might want to use a service or pre-generate thumbnails
 */
export const getVideoThumbnail = (videoUrl: string): string => {
  // Return video URL - browsers can generate thumbnails from video files
  // For better performance, consider pre-generating thumbnails
  return videoUrl;
};

