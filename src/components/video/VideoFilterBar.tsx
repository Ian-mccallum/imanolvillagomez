import { motion } from 'framer-motion';
import { FilterDropdown } from './FilterDropdown';
import { FilterBadge } from './FilterBadge';
import { FilterState, FilterOptions, EMPTY_FILTER_STATE } from '@/types/filters';
import { Video } from '@/types';
import { cn } from '@/utils';
import { hasVideoBarActiveFilters } from '@/utils/filters';

/**
 * VideoFilterBar
 *
 * Artist / year / tour only (no location, category, featured).
 */

interface VideoFilterBarProps {
  /** Optional; reserved for future use when bar is video-specific */
  videos?: Video[];
  filterState: FilterState;
  filterOptions: FilterOptions;
  onFilterChange: (newState: FilterState) => void;
  videoCount: number;
  darkBackground?: boolean;
  className?: string;
  /** Plural noun for the count line (default: videos) */
  countLabel?: string;
}

export const VideoFilterBar = ({
  videos: _videos = [],
  filterState,
  filterOptions,
  onFilterChange,
  videoCount,
  darkBackground = false,
  className,
  countLabel = 'videos',
}: VideoFilterBarProps) => {
  const handleSelect = (type: 'artist' | 'year' | 'tour') => {
    return (value: string | number) => {
      const newState: FilterState = { ...filterState };

      if (type === 'artist') {
        newState.artists = [...newState.artists, value as string];
      } else if (type === 'year') {
        newState.years = [...newState.years, value as number];
      } else {
        newState.tours = [...newState.tours, value as string];
      }

      onFilterChange(newState);
    };
  };

  const handleDeselect = (type: 'artist' | 'year' | 'tour') => {
    return (value: string | number) => {
      const newState: FilterState = { ...filterState };

      if (type === 'artist') {
        newState.artists = newState.artists.filter((v) => v !== value);
      } else if (type === 'year') {
        newState.years = newState.years.filter((v) => v !== value);
      } else {
        newState.tours = newState.tours.filter((v) => v !== value);
      }

      onFilterChange(newState);
    };
  };

  const handleRemoveBadge = (type: 'artist' | 'year' | 'tour', value: string | number) => {
    handleDeselect(type)(value);
  };

  const handleClearAll = () => {
    onFilterChange(EMPTY_FILTER_STATE);
  };

  const filtersActive = hasVideoBarActiveFilters(filterState);

  return (
    <div className={cn('w-full py-4 space-y-4', className)}>
      <div className="flex flex-wrap items-center gap-2 md:gap-3">
        <motion.button
          type="button"
          onClick={handleClearAll}
          className={cn(
            'px-2 py-1 text-[11px] md:text-xs font-bold uppercase tracking-wider transition-all duration-200 border-2 min-h-[32px] md:min-h-[36px] flex items-center justify-center focus:outline-none focus:ring-2 focus:ring-white/40',
            !filtersActive
              ? 'bg-white text-black border-white'
              : 'bg-transparent text-white border-white/30 hover:border-white/60'
          )}
          whileHover={{ scale: 1.03 }}
          whileTap={{ scale: 0.97 }}
        >
          ALL
        </motion.button>

        {filterOptions.artists.length > 0 && (
          <FilterDropdown
            label="ARTIST"
            options={filterOptions.artists}
            selected={filterState.artists}
            onSelect={handleSelect('artist')}
            onDeselect={handleDeselect('artist')}
            type="artist"
            darkBackground={darkBackground}
            photosStyle
          />
        )}

        {filterOptions.years.length > 0 && (
          <FilterDropdown
            label="YEAR"
            options={filterOptions.years}
            selected={filterState.years}
            onSelect={handleSelect('year')}
            onDeselect={handleDeselect('year')}
            type="year"
            darkBackground={darkBackground}
            photosStyle
          />
        )}

        {filterOptions.tours.length > 0 && (
          <FilterDropdown
            label="TOUR"
            options={filterOptions.tours}
            selected={filterState.tours}
            onSelect={handleSelect('tour')}
            onDeselect={handleDeselect('tour')}
            type="tour"
            darkBackground={darkBackground}
            photosStyle
          />
        )}
      </div>

      {(filtersActive || videoCount > 0) && (
        <div className="flex flex-wrap items-center gap-2">
          {filterState.artists.map((artist) => (
            <FilterBadge
              key={`artist-${artist}`}
              label="Artist"
              value={artist}
              onRemove={() => handleRemoveBadge('artist', artist)}
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

          <div
            className={cn(
              'ml-auto text-xs uppercase tracking-wider',
              darkBackground ? 'text-zinc-50' : 'text-zinc-400'
            )}
          >
            {videoCount} {videoCount === 1 ? countLabel.replace(/s$/, '') : countLabel}
          </div>
        </div>
      )}
    </div>
  );
};
