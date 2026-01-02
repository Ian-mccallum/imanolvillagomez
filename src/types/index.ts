// Common types used across the application

export interface Video {
  id: string;
  title: string;
  description?: string;
  thumbnail: string;
  videoUrl: string;
  client?: string; // Artist/client name
  artist?: string; // Artist name (for legend format: artist/song/tour)
  song?: string; // Song name
  tour?: string; // Tour name
  date?: string; // Date in format like "October 25, 2025"
  year?: number;
  location?: string; // Location like "CHICAGO"
  category?: string; // music-video, behind-the-scenes, etc.
  tags?: string[];
  featured?: boolean; // For featured videos in grid
  rotation?: number; // Custom rotation in degrees (for specific videos)
  isEdit?: boolean; // Mark as an edit (separate from artist work)
}

export interface Photo {
  id: string;
  title?: string;
  imageUrl: string;
  client?: string;
  year?: number;
  category?: string;
  tags?: string[];
  isEdit?: boolean; // Mark as an edit (separate from artist work)
}

export interface PortfolioItem extends Video {
  featured?: boolean;
}

export interface ContactFormData {
  name: string;
  email: string;
  message: string;
  subject?: string;
}

export interface RouteConfig {
  path: string;
  label: string;
  component: React.ComponentType;
}

export type LoadingState = 'idle' | 'loading' | 'success' | 'error';

export interface ApiResponse<T> {
  data: T;
  message?: string;
  error?: string;
}

// Export filter types
export * from './filters';
