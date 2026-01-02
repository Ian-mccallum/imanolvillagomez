import { FilterDropdown } from './FilterDropdown';
import { FeaturedToggle } from './FeaturedToggle';
import { FilterBadge } from './FilterBadge';
import { FilterState, FilterOptions } from '@/types/filters';
import { Video } from '@/types';
import { cn } from '@/utils';
import { hasActiveFilters } from '@/utils/filters';

/**
 * VideoFilterBar
 * 
 * Main filter bar component for video filtering
 * Video-First: 5% visual weight, minimal, unobtrusive
 * Carson: Experimental typography
 * Oliver: Dark aesthetic
 * West: Minimal, clean
 * Weirdcore: Subtle effects
 */

interface VideoFilterBarProps {
  videos: Video[];
  filterState: FilterState;
  filterOptions: FilterOptions;
  onFilterChange: (newState: FilterState) => void;
  videoCount: number;
  darkBackground?: boolean;
  className?: string;
}

export const VideoFilterBar = ({
  videos: _videos,
  filterState,
  filterOptions,
  onFilterChange,
  videoCount,
  darkBackground = false,
  className,
}: VideoFilterBarProps) => {
  // Handler for selecting a filter value
  const handleSelect = (type: 'artist' | 'location' | 'year' | 'tour' | 'category') => {
    return (value: string | number) => {
      const newState: FilterState = { ...filterState };

      if (type === 'artist') {
        newState.artists = [...newState.artists, value as string];
      } else if (type === 'location') {
        newState.locations = [...newState.locations, value as string];
      } else if (type === 'year') {
        newState.years = [...newState.years, value as number];
      } else if (type === 'tour') {
        newState.tours = [...newState.tours, value as string];
      } else if (type === 'category') {
        newState.categories = [...newState.categories, value as string];
      }

      onFilterChange(newState);
    };
  };

  // Handler for deselecting a filter value
  const handleDeselect = (type: 'artist' | 'location' | 'year' | 'tour' | 'category') => {
    return (value: string | number) => {
      const newState: FilterState = { ...filterState };

      if (type === 'artist') {
        newState.artists = newState.artists.filter(v => v !== value);
      } else if (type === 'location') {
        newState.locations = newState.locations.filter(v => v !== value);
      } else if (type === 'year') {
        newState.years = newState.years.filter(v => v !== value);
      } else if (type === 'tour') {
        newState.tours = newState.tours.filter(v => v !== value);
      } else if (type === 'category') {
        newState.categories = newState.categories.filter(v => v !== value);
      }

      onFilterChange(newState);
    };
  };

  // Handler for removing a filter badge
  const handleRemoveBadge = (
    type: 'artist' | 'location' | 'year' | 'tour' | 'category',
    value: string | number
  ) => {
    handleDeselect(type)(value);
  };

  // Handler for clearing all filters
  const handleClearAll = () => {
    onFilterChange({
      artists: [],
      locations: [],
      years: [],
      tours: [],
      categories: [],
      featured: null,
    });
  };

  // Handler for featured toggle
  const handleFeaturedChange = (value: boolean | null) => {
    onFilterChange({
      ...filterState,
      featured: value,
    });
  };

  const activeFilters = hasActiveFilters(filterState);

  return (
    <div className={cn('w-full py-4 space-y-4', className)}>
      {/* Filter Controls Row */}
      <div className="flex flex-wrap items-center gap-2">
        {/* Artist Dropdown */}
        {filterOptions.artists.length > 0 && (
          <FilterDropdown
            label="ARTIST"
            options={filterOptions.artists}
            selected={filterState.artists}
            onSelect={handleSelect('artist')}
            onDeselect={handleDeselect('artist')}
            type="artist"
            darkBackground={darkBackground}
          />
        )}

        {/* Location Dropdown */}
        {filterOptions.locations.length > 0 && (
          <FilterDropdown
            label="LOCATION"
            options={filterOptions.locations}
            selected={filterState.locations}
            onSelect={handleSelect('location')}
            onDeselect={handleDeselect('location')}
            type="location"
            darkBackground={darkBackground}
          />
        )}

        {/* Year Dropdown */}
        {filterOptions.years.length > 0 && (
          <FilterDropdown
            label="YEAR"
            options={filterOptions.years}
            selected={filterState.years}
            onSelect={handleSelect('year')}
            onDeselect={handleDeselect('year')}
            type="year"
            darkBackground={darkBackground}
          />
        )}

        {/* Tour Dropdown */}
        {filterOptions.tours.length > 0 && (
          <FilterDropdown
            label="TOUR"
            options={filterOptions.tours}
            selected={filterState.tours}
            onSelect={handleSelect('tour')}
            onDeselect={handleDeselect('tour')}
            type="tour"
            darkBackground={darkBackground}
          />
        )}

        {/* Category Dropdown */}
        {filterOptions.categories.length > 0 && (
          <FilterDropdown
            label="CATEGORY"
            options={filterOptions.categories}
            selected={filterState.categories}
            onSelect={handleSelect('category')}
            onDeselect={handleDeselect('category')}
            type="category"
            darkBackground={darkBackground}
          />
        )}

        {/* Featured Toggle */}
        <FeaturedToggle
          value={filterState.featured}
          onChange={handleFeaturedChange}
          darkBackground={darkBackground}
        />

        {/* Clear All Button - only show when filters are active */}
        {activeFilters && (
          <button
            onClick={handleClearAll}
            className={cn(
              'px-3 py-1.5 text-xs uppercase tracking-wider font-medium',
              'border border-zinc-700 text-zinc-400 hover:text-white hover:border-zinc-600',
              'transition-colors',
              'focus:outline-none focus:ring-1 focus:ring-white/50'
            )}
          >
            CLEAR ALL
          </button>
        )}
      </div>

      {/* Active Filters and Video Count Row */}
      {(activeFilters || videoCount > 0) && (
        <div className="flex flex-wrap items-center gap-2">
          {/* Active Filter Badges */}
          {filterState.artists.map((artist) => (
            <FilterBadge
              key={`artist-${artist}`}
              label="Artist"
              value={artist}
              onRemove={() => handleRemoveBadge('artist', artist)}
              darkBackground={darkBackground}
            />
          ))}

          {filterState.locations.map((location) => (
            <FilterBadge
              key={`location-${location}`}
              label="Location"
              value={location}
              onRemove={() => handleRemoveBadge('location', location)}
              darkBackground={darkBackground}
            />
          ))}

          {filterState.years.map((year) => (
            <FilterBadge
              key={`year-${year}`}
              label="Year"
              value={year}
              onRemove={() => handleRemoveBadge('year', year)}
              darkBackground={darkBackground}
            />
          ))}

          {filterState.tours.map((tour) => (
            <FilterBadge
              key={`tour-${tour}`}
              label="Tour"
              value={tour}
              onRemove={() => handleRemoveBadge('tour', tour)}
              darkBackground={darkBackground}
            />
          ))}

          {filterState.categories.map((category) => (
            <FilterBadge
              key={`category-${category}`}
              label="Category"
              value={category}
              onRemove={() => handleRemoveBadge('category', category)}
              darkBackground={darkBackground}
            />
          ))}

          {filterState.featured !== null && (
            <FilterBadge
              label="Featured"
              value={filterState.featured ? 'Yes' : 'No'}
              onRemove={() => handleFeaturedChange(null)}
              darkBackground={darkBackground}
            />
          )}

          {/* Video Count */}
          <div className={cn('ml-auto text-xs uppercase tracking-wider', darkBackground ? 'text-zinc-50' : 'text-zinc-400')}>
            {videoCount} {videoCount === 1 ? 'video' : 'videos'}
          </div>
        </div>
      )}
    </div>
  );
};

