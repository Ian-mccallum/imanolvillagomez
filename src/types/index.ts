// Common types used across the application

export interface Video {
  id: string;
  title: string;
  description?: string;
  thumbnail: string;
  videoUrl: string;
  client?: string; // Artist/client name
  artist?: string; // Artist name (captions: song | location; edits without song use artist)
  song?: string; // Song name
  tour?: string; // Tour name
  date?: string; // Date in format like "October 25, 2025"
  year?: number;
  location?: string; // Venue or site when known (e.g. theatre, park); CHICAGO when unknown
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
  /** Session / tour label for filters (matches video “tour” dimension) */
  tour?: string;
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
