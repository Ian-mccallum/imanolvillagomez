/**
 * Filter System Types
 * 
 * Types for the video filter system feature
 */

/**
 * Filter state representing active filters
 */
export interface FilterState {
  artists: string[];        // Array of selected artist/client names
  locations: string[];      // Array of selected locations
  years: number[];          // Array of selected years
  tours: string[];          // Array of selected tour names
  categories: string[];     // Array of selected categories
  featured: boolean | null; // true = only featured, false = only non-featured, null = both
}

/**
 * Available filter options generated from video data
 */
export interface FilterOptions {
  artists: string[];        // All available artists (unique, sorted)
  locations: string[];      // All available locations (unique, sorted)
  years: number[];          // All available years (unique, sorted desc)
  tours: string[];          // All available tours (unique, sorted)
  categories: string[];     // All available categories (unique, sorted)
}

/**
 * Filter category types
 */
export type FilterType = 'artist' | 'location' | 'year' | 'tour' | 'category';

/**
 * Empty filter state (all filters cleared)
 */
export const EMPTY_FILTER_STATE: FilterState = {
  artists: [],
  locations: [],
  years: [],
  tours: [],
  categories: [],
  featured: null,
};

