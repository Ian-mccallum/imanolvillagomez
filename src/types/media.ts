import { Video, Photo } from './index';

/**
 * Unified media item type for FullscreenModal
 * Supports both videos and photos with a consistent interface
 */
export type MediaType = 'video' | 'image';

export interface MediaItem {
  id: string;
  type: MediaType;
  
  // Video-specific properties
  videoUrl?: string;
  thumbnail?: string;
  rotation?: number; // For video rotation (270deg)
  
  // Image-specific properties
  imageUrl?: string;
  
  // Common metadata
  title?: string;
  artist?: string;
  song?: string;
  tour?: string;
  client?: string;
  date?: string;
  year?: number;
  description?: string;
}

/**
 * Convert Video to MediaItem
 */
export function videoToMediaItem(video: Video): MediaItem {
  return {
    id: video.id,
    type: 'video',
    videoUrl: video.videoUrl,
    thumbnail: video.thumbnail,
    rotation: video.rotation,
    title: video.title,
    artist: video.artist,
    song: video.song,
    tour: video.tour,
    client: video.client,
    date: video.date,
    year: video.year,
    description: video.description,
  };
}

/**
 * Convert Photo to MediaItem
 */
export function photoToMediaItem(photo: Photo): MediaItem {
  return {
    id: photo.id,
    type: 'image',
    imageUrl: photo.imageUrl,
    title: photo.title,
    client: photo.client,
    year: photo.year,
  };
}

/**
 * Convert array of Videos to MediaItems
 */
export function videosToMediaItems(videos: Video[]): MediaItem[] {
  return videos.map(videoToMediaItem);
}

/**
 * Convert array of Photos to MediaItems
 */
export function photosToMediaItems(photos: Photo[]): MediaItem[] {
  return photos.map(photoToMediaItem);
}

