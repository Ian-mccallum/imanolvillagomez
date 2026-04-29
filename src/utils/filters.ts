/**
 * Filter Utility Functions
 * 
 * Functions for generating filter options, applying filters, and managing URL state
 */

import { Video, Photo } from '@/types';
import { FilterState, FilterOptions } from '@/types/filters';

/**
 * Generate filter options from video collection
 * Extracts unique values for each filter category
 */
export function generateFilterOptions(videos: Video[]): FilterOptions {
  const artists = [...new Set(videos.map(v => v.artist).filter((a): a is string => Boolean(a)))];
  const locations = [...new Set(videos.map(v => v.location).filter((l): l is string => Boolean(l)))];
  const years = [...new Set(videos.map(v => v.year).filter((y): y is number => Boolean(y)))];
  const tours = [...new Set(videos.map(v => v.tour).filter((t): t is string => Boolean(t)))];
  const categories = [...new Set(videos.map(v => v.category).filter((c): c is string => Boolean(c)))];

  return {
    artists: artists.sort(),
    locations: locations.sort(),
    years: years.sort((a, b) => b - a), // Descending order (newest first)
    tours: tours.sort(),
    categories: categories.sort(),
  };
}

/** Filter options for photos (artist = client; year; tour — same bar as videos). */
export function generatePhotoFilterOptions(photoList: Photo[]): FilterOptions {
  const artists = [
    ...new Set(photoList.map((p) => p.client).filter((c): c is string => Boolean(c))),
  ];
  const years = [
    ...new Set(photoList.map((p) => p.year).filter((y): y is number => typeof y === 'number')),
  ];
  const tours = [...new Set(photoList.map((p) => p.tour).filter((t): t is string => Boolean(t)))];

  return {
    artists: artists.sort(),
    locations: [],
    years: years.sort((a, b) => b - a),
    tours: tours.sort(),
    categories: [],
  };
}

/** AND logic for photos: artist ↔ client; year; tour. */
export function applyPhotoFilters(photoList: Photo[], state: FilterState): Photo[] {
  return photoList.filter((photo) => {
    if (state.artists.length > 0) {
      if (!photo.client || !state.artists.includes(photo.client)) return false;
    }
    if (state.years.length > 0) {
      if (!photo.year || !state.years.includes(photo.year)) return false;
    }
    if (state.tours.length > 0) {
      if (!photo.tour || !state.tours.includes(photo.tour)) return false;
    }
    return true;
  });
}

/**
 * Apply filters to video collection (AND logic - all filters must match)
 */
export function applyFilters(videos: Video[], filters: FilterState): Video[] {
  return videos.filter(video => {
    // Artist filter
    if (filters.artists.length > 0) {
      if (!video.artist || !filters.artists.includes(video.artist)) {
        return false;
      }
    }

    // Location filter
    if (filters.locations.length > 0) {
      if (!video.location || !filters.locations.includes(video.location)) {
        return false;
      }
    }

    // Year filter
    if (filters.years.length > 0) {
      if (!video.year || !filters.years.includes(video.year)) {
        return false;
      }
    }

    // Tour filter
    if (filters.tours.length > 0) {
      if (!video.tour || !filters.tours.includes(video.tour)) {
        return false;
      }
    }

    // Category filter
    if (filters.categories.length > 0) {
      if (!video.category || !filters.categories.includes(video.category)) {
        return false;
      }
    }

    // Featured filter
    if (filters.featured !== null) {
      if (video.featured !== filters.featured) {
        return false;
      }
    }

    return true;
  });
}

/**
 * Convert filter state to URL query string
 */
export function filterStateToQueryString(state: FilterState): string {
  const params = new URLSearchParams();

  state.artists.forEach(artist => params.append('artist', artist));
  state.locations.forEach(location => params.append('location', location));
  state.years.forEach(year => params.append('year', year.toString()));
  state.tours.forEach(tour => params.append('tour', tour));
  state.categories.forEach(category => params.append('category', category));

  if (state.featured !== null) {
    params.set('featured', state.featured.toString());
  }

  return params.toString();
}

/** Videos page UI only uses artist / year / tour — strip legacy URL fields so they do not affect results. */
export function sanitizeVideoBarFilterState(state: FilterState): FilterState {
  return {
    ...state,
    locations: [],
    categories: [],
    featured: null,
  };
}

/** Query string for the video filter bar only (no location, category, featured). */
export function videoBarFilterStateToQueryString(state: FilterState): string {
  const params = new URLSearchParams();
  state.artists.forEach((artist) => params.append('artist', artist));
  state.years.forEach((year) => params.append('year', year.toString()));
  state.tours.forEach((tour) => params.append('tour', tour));
  return params.toString();
}

/** Whether the video bar shows any active filter (artist / year / tour only). */
export function hasVideoBarActiveFilters(state: FilterState): boolean {
  return state.artists.length > 0 || state.years.length > 0 || state.tours.length > 0;
}

/**
 * Parse URL query string to filter state
 */
export function queryStringToFilterState(search: string): FilterState {
  const params = new URLSearchParams(search);

  const years = params.getAll('year')
    .map(y => parseInt(y, 10))
    .filter(y => !isNaN(y));

  const featuredParam = params.get('featured');
  const featured = featuredParam === 'true' ? true : featuredParam === 'false' ? false : null;

  return {
    artists: params.getAll('artist'),
    locations: params.getAll('location'),
    years,
    tours: params.getAll('tour'),
    categories: params.getAll('category'),
    featured,
  };
}

/**
 * Check if filter state has any active filters
 */
export function hasActiveFilters(state: FilterState): boolean {
  return (
    state.artists.length > 0 ||
    state.locations.length > 0 ||
    state.years.length > 0 ||
    state.tours.length > 0 ||
    state.categories.length > 0 ||
    state.featured !== null
  );
}

/**
 * Get count of active filters
 */
export function getActiveFilterCount(state: FilterState): number {
  let count = 0;
  count += state.artists.length;
  count += state.locations.length;
  count += state.years.length;
  count += state.tours.length;
  count += state.categories.length;
  if (state.featured !== null) count += 1;
  return count;
}

