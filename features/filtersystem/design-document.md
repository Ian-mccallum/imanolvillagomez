# Design Document

**Feature Name:** Video Filter System  
**Version:** 1.0  
**Date:** 2025-01-27  
**Implementation Date:** 2025-01-27  
**Author:** Planning Team  
**Status:** ✅ Implemented  
**Related PRD:** `features/filtersystem/prd.md`

---

## 1. Overview

### 1.1 Purpose
This design document outlines the technical architecture, UI/UX design, and implementation approach for the Video Filter System. The design maintains the video-first aesthetic while providing powerful, experimental filtering capabilities.

### 1.2 Scope
This design covers:
- Filter UI component architecture and design
- Filter state management
- Filter logic implementation
- URL state management
- Integration with existing VideoGrid component
- Empty state handling
- Animation and transition design

Out of scope:
- Search functionality
- Sorting capabilities
- Filter presets/history

### 1.3 Design Goals
- Maintain video-first principle (5% visual weight for filter UI)
- Align with Carson-Oliver-West-Weirdcore aesthetic (experimental, dark, minimal, glitch-inspired)
- Provide intuitive filtering with minimal cognitive load
- Ensure performant filtering even with 100+ videos
- Create shareable filter states via URL parameters

---

## 2. System Architecture

### 2.1 High-Level Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                      VideosPage Component                    │
│                                                               │
│  ┌──────────────────────────────────────────────────────┐  │
│  │              VideoFilterBar Component                 │  │
│  │  (5% visual weight, experimental, minimal)           │  │
│  │                                                       │  │
│  │  [FilterDropdown: Artist] [FilterDropdown: Location] │  │
│  │  [FilterDropdown: Year] [FilterDropdown: Tour]       │  │
│  │  [Toggle: Featured] [Clear All]                      │  │
│  │                                                       │  │
│  │  Active Filters: [Artist: Osamason ×] [Year: 2025 ×]│  │
│  │  Video Count: "12 videos"                            │  │
│  └──────────────────────────────────────────────────────┘  │
│                                                               │
│  ┌──────────────────────────────────────────────────────┐  │
│  │              Filtered Video Data                      │  │
│  │  (useMemo hook: filters videos based on filter state)│  │
│  └──────────────────────────────────────────────────────┘  │
│                           ↓                                  │
│  ┌──────────────────────────────────────────────────────┐  │
│  │              VideoGrid Component                      │  │
│  │  (80% visual weight, existing component)             │  │
│  │  Receives filtered videos array                      │  │
│  └──────────────────────────────────────────────────────┘  │
│                                                               │
│  URL State: ?artist=Osamason&year=2025&location=CHICAGO     │
└─────────────────────────────────────────────────────────────┘
```

### 2.2 Component Diagram

```
VideosPage
├── VideoFilterBar (NEW)
│   ├── FilterDropdown (NEW)
│   │   ├── FilterButton (NEW)
│   │   └── FilterMenu (NEW)
│   │       └── FilterOption (NEW)
│   ├── FeaturedToggle (NEW)
│   ├── ActiveFilterBadges (NEW)
│   │   └── FilterBadge (NEW)
│   ├── ClearAllButton (NEW)
│   └── VideoCountDisplay (NEW)
├── VideoGrid (EXISTING)
│   └── MasonryGrid (EXISTING)
│       └── VideoCard (EXISTING)
└── VideoModal (EXISTING)
```

### 2.3 Technology Stack
| Layer | Technology | Rationale |
|-------|-----------|----------|
| Frontend Framework | React + TypeScript | Existing stack, type-safe filtering |
| State Management | React useState, useMemo | Simple state management, no need for external library |
| URL State | URLSearchParams / React Router | Shareable filter states, browser navigation support |
| Animations | Framer Motion | Already in use, smooth filter transitions |
| Styling | Tailwind CSS | Existing stack, consistent with design system |
| Filter Logic | JavaScript array methods | Efficient, readable filter implementation |

---

## 3. Data Model

### 3.1 Filter State Data Structure

```typescript
interface FilterState {
  artists: string[];        // Array of selected artist/client names
  locations: string[];      // Array of selected locations
  years: number[];          // Array of selected years
  tours: string[];          // Array of selected tour names
  categories: string[];     // Array of selected categories
  featured: boolean | null; // true = only featured, false = only non-featured, null = both
}

interface FilterOptions {
  artists: string[];        // All available artists (unique, sorted)
  locations: string[];      // All available locations (unique, sorted)
  years: number[];          // All available years (unique, sorted desc)
  tours: string[];          // All available tours (unique, sorted)
  categories: string[];     // All available categories (unique, sorted)
}
```

### 3.2 URL Query Parameter Structure

```
/videos?artist=Osamason&year=2025&location=CHICAGO&featured=true
```

Mapping:
- `artist` → FilterState.artists (can be multiple: `?artist=Osamason&artist=Carti`)
- `location` → FilterState.locations
- `year` → FilterState.years (numeric: `?year=2025`)
- `tour` → FilterState.tours
- `category` → FilterState.categories
- `featured` → FilterState.featured (boolean: `?featured=true`)

### 3.3 Data Flow

```
1. VideosPage mounts
   ↓
2. Extract filter state from URL (if present)
   ↓
3. Generate FilterOptions from all videos (useMemo)
   ↓
4. Apply filters to videos (useMemo)
   ↓
5. Render VideoFilterBar with FilterOptions and FilterState
   ↓
6. Render VideoGrid with filtered videos
   ↓
7. User interacts with filter
   ↓
8. Update FilterState
   ↓
9. Update URL query parameters
   ↓
10. Re-apply filters (useMemo triggers)
    ↓
11. VideoGrid re-renders with new filtered videos
```

---

## 4. API Design

### 4.1 Component Props

```typescript
// VideoFilterBar Component
interface VideoFilterBarProps {
  videos: Video[];
  filterState: FilterState;
  filterOptions: FilterOptions;
  onFilterChange: (newState: FilterState) => void;
  videoCount: number;
  className?: string;
}

// FilterDropdown Component
interface FilterDropdownProps {
  label: string;
  options: string[] | number[];
  selected: string[] | number[];
  onSelect: (value: string | number) => void;
  onDeselect: (value: string | number) => void;
  type: 'artist' | 'location' | 'year' | 'tour' | 'category';
  darkBackground?: boolean;
}

// FeaturedToggle Component
interface FeaturedToggleProps {
  value: boolean | null;
  onChange: (value: boolean | null) => void;
  darkBackground?: boolean;
}
```

### 4.2 Filter Logic Functions

```typescript
// Generate filter options from videos
function generateFilterOptions(videos: Video[]): FilterOptions {
  // Extract unique values for each filter category
  // Sort appropriately (alphabetically for strings, desc for years)
  return {
    artists: [...new Set(videos.map(v => v.artist).filter(Boolean))].sort(),
    locations: [...new Set(videos.map(v => v.location).filter(Boolean))].sort(),
    years: [...new Set(videos.map(v => v.year).filter(Boolean))].sort((a, b) => b - a),
    tours: [...new Set(videos.map(v => v.tour).filter(Boolean))].sort(),
    categories: [...new Set(videos.map(v => v.category).filter(Boolean))].sort(),
  };
}

// Apply filters to videos (AND logic - all filters must match)
function applyFilters(videos: Video[], filters: FilterState): Video[] {
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

// Convert FilterState to URL query string
function filterStateToQueryString(state: FilterState): string {
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

// Parse URL query string to FilterState
function queryStringToFilterState(search: string): FilterState {
  const params = new URLSearchParams(search);
  
  return {
    artists: params.getAll('artist'),
    locations: params.getAll('location'),
    years: params.getAll('year').map(y => parseInt(y, 10)).filter(y => !isNaN(y)),
    tours: params.getAll('tour'),
    categories: params.getAll('category'),
    featured: params.get('featured') === 'true' ? true : params.get('featured') === 'false' ? false : null,
  };
}
```

---

## 5. User Interface Design

### 5.1 UI/UX Principles

**Video-First Principle (NON-NEGOTIABLE):**
- Filter UI must not exceed 5% of visual weight
- Filter UI should be minimal, unobtrusive
- Filter UI should not compete with videos for attention
- Videos remain the primary focus (80% visual weight)

**Carson-Oliver-West-Weirdcore Aesthetic:**
- **Carson:** Experimental typography, break the grid, asymmetrical layouts
- **Oliver:** Dark aesthetic, videos as light, distressed textures
- **West:** Minimal design, bold statements, clean aesthetics
- **Weirdcore:** Subtle glitch effects on filter interactions

**Design Principles:**
- Minimal footprint but maximum functionality
- Experimental but usable
- Dark, bold, memorable
- Smooth animations that feel intentional

### 5.2 Filter UI Layout

```
┌────────────────────────────────────────────────────────────┐
│  VIDEOS                    [FORMAT LEGEND]                 │
│  12 PROJECTS                                                │
├────────────────────────────────────────────────────────────┤
│  FILTER UI (5% visual weight)                              │
│  ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐    │
│  │ ARTIST ▼ │ │ LOCATION▼│ │ YEAR ▼   │ │ TOUR ▼   │    │
│  └──────────┘ └──────────┘ └──────────┘ └──────────┘    │
│  ┌──────────┐                                             │
│  │ FEATURED │ [Active Filters: Artist: Osamason ×]       │
│  └──────────┘ [Year: 2025 ×] [Clear All]                 │
│                                                             │
│  12 videos                                                  │
├────────────────────────────────────────────────────────────┤
│  VIDEO GRID (80% visual weight)                            │
│  [Video] [Video] [Video]                                   │
│  [Video] [Video] [Video]                                   │
│  ...                                                       │
└────────────────────────────────────────────────────────────┘
```

### 5.3 Filter UI Component Design

**Filter Bar Container:**
- Positioned between header and video grid
- Minimal padding, compact height
- Dark background (black or zinc-900)
- Subtle border or divider (zinc-800)

**Filter Dropdown Buttons:**
- Minimal button style (Carson: experimental typography, West: minimal)
- Uppercase text, tracking-wider
- Small font size (text-xs or text-sm)
- Dark background (zinc-900), white text
- Hover: subtle glitch effect (Weirdcore)
- Active state: bold border or accent color (red-600 for gore core)

**Filter Dropdown Menu:**
- Dropdown appears on click
- Dark background (black or zinc-900)
- Scrollable list if many options
- Checkbox or radio-style selection indicators
- Close on outside click or ESC key

**Active Filter Badges:**
- Display active filters as removable badges
- Minimal design (West), bold typography (Carson)
- "×" button to remove individual filter
- Subtle hover effects

**Featured Toggle:**
- Minimal toggle switch or button
- Active state: red-600 or white accent (gore core/indie sleaze)

**Clear All Button:**
- Minimal button, subtle styling
- Only visible when filters are active
- Hover: subtle glitch (Weirdcore)

**Video Count:**
- Small text (text-xs)
- Zinc-400 color (muted)
- Positioned near active filters

### 5.4 Design Mockups (Text Description)

**Default State (No Filters):**
- Filter dropdowns visible, no active filters
- Video count shows total: "12 videos"
- Clear All button hidden

**Active Filters State:**
- Filter dropdowns show active selections
- Active filter badges displayed below dropdowns
- Video count updates: "5 videos" (if filtered)
- Clear All button visible

**Empty State (No Videos Match):**
- Video grid shows empty state message
- "No videos found matching your filters"
- "Clear Filters" button prominent
- Filter UI remains visible for adjustment

### 5.5 Responsive Design

**Mobile (sm):**
- Filter dropdowns stack vertically or use horizontal scroll
- Active filter badges wrap
- Compact spacing

**Tablet (md):**
- Filter dropdowns in 2 rows
- Active filter badges wrap

**Desktop (lg+):**
- Filter dropdowns in single row (horizontal)
- Active filter badges in single row

### 5.6 Color Palette

Following existing design system:

```typescript
// Filter UI Colors (aligned with Carson-Oliver-West-Weirdcore)
{
  background: 'bg-black',           // Oliver: dark canvas
  border: 'border-zinc-800',        // Subtle borders
  text: 'text-white',               // West: high contrast
  textMuted: 'text-zinc-400',       // Muted text for counts
  accent: 'text-red-600',           // Gore core accent
  hover: 'bg-zinc-900',             // Hover states
  active: 'border-red-600',         // Active filter indicator (gore core)
  badgeBg: 'bg-zinc-800',           // Active filter badge background
}
```

---

## 6. Security Design

### 6.1 Input Validation
- URL query parameters are validated when parsed
- Invalid filter values are ignored (graceful degradation)
- Type validation for numeric filters (year)
- No XSS vulnerabilities (React handles escaping)

### 6.2 Data Protection
- Filter state is client-side only
- No sensitive data in URL parameters (only public video metadata)
- URL length limits handled (browser default ~2000 chars)

---

## 7. Performance Considerations

### 7.1 Performance Targets
- Filter application: < 100ms
- Filter UI render: < 50ms
- URL update: < 50ms
- Total filter interaction: < 200ms

### 7.2 Optimization Strategies

**Memoization:**
- `filterOptions` generated with `useMemo` (only recompute when videos change)
- `filteredVideos` computed with `useMemo` (only recompute when videos or filterState change)
- Filter dropdown menus memoized to prevent unnecessary re-renders

**Efficient Filtering:**
- Single pass through videos array
- Early returns in filter function (fail fast)
- No unnecessary array operations

**React Optimization:**
- Filter components memoized with `React.memo` where appropriate
- Callback functions wrapped with `useCallback`
- Avoid unnecessary re-renders of VideoGrid

### 7.3 Caching Strategy
- Filter options cached in component state (regenerated only when videos change)
- Filtered results cached with useMemo (dependency: videos + filterState)

---

## 8. Scalability Design

### 8.1 Horizontal Scaling
- Filter logic is client-side, no server scaling needed
- Performance should scale linearly with video count up to ~500 videos

### 8.2 Database Scaling
- N/A (client-side filtering of static data)

### 8.3 Load Distribution
- N/A (client-side feature)

---

## 9. Error Handling & Resilience

### 9.1 Error Handling Strategy

**Invalid URL Parameters:**
- Gracefully ignore invalid values
- Log warning in development
- Default to empty filter state if URL completely invalid

**Missing Video Metadata:**
- Videos without metadata are excluded from that filter option
- Videos still appear in unfiltered view
- No errors thrown, graceful degradation

**Empty Filter Results:**
- Show empty state with helpful message
- Provide "Clear Filters" action
- Filter UI remains functional for adjustment

### 9.2 Retry Logic
- N/A (client-side only)

### 9.3 Fallback Mechanisms
- If filter logic fails, fall back to showing all videos
- Filter UI disabled if error state detected

---

## 10. Monitoring & Observability

### 10.1 Metrics
- Filter interaction events (which filters used most)
- Filter application time (performance monitoring)
- Empty state frequency (how often no results)

### 10.2 Logging
- Development: Log filter state changes
- Production: Minimal logging (errors only)

### 10.3 Alerting
- N/A (client-side feature)

---

## 11. Testing Strategy

### 11.1 Unit Testing
- Filter logic functions (generateFilterOptions, applyFilters)
- URL parsing functions (queryStringToFilterState, filterStateToQueryString)
- Filter state management (useState hooks)

### 11.2 Integration Testing
- Filter UI component integration with VideosPage
- URL state synchronization
- Filter application to video grid

### 11.3 End-to-End Testing
- Complete filter workflows (select filter, see results, clear filters)
- URL sharing (set filters, share URL, verify filters applied)
- Browser navigation (back/forward with filters)

### 11.4 Performance Testing
- Filter performance with 100+ videos
- Filter UI render performance
- Memory usage with large filter states

---

## 12. Deployment Strategy

### 12.1 Deployment Architecture
- Client-side feature, deployed with main application
- No backend changes required
- No database migrations

### 12.2 Rollout Plan
- **Phase 1:** Deploy to staging, internal testing
- **Phase 2:** Deploy to production, monitor metrics
- **Phase 3:** Gather user feedback, iterate if needed

### 12.3 Rollback Plan
- Feature can be disabled via feature flag (if implemented)
- Or revert code deployment
- No data migration required

---

## 13. Migration Plan

### 13.1 Data Migration
- N/A (no data migration needed)

### 13.2 Feature Flags
- Optional: Add feature flag to enable/disable filter system
- Allows gradual rollout or quick disable if issues

### 13.3 Backward Compatibility
- Existing VideosPage functionality preserved
- Filter system is additive, doesn't break existing behavior
- Old URLs without filters still work (show all videos)

---

## 14. Alternative Approaches Considered

### 14.1 Approach A: Sidebar Filter Panel
- **Pros:** More space for filter options, familiar pattern
- **Cons:** Takes more visual weight, competes with videos, not video-first
- **Why Not Chosen:** Violates 5% visual weight principle, sidebar would be 20-30% of screen

### 14.2 Approach B: Search-Based Filtering
- **Pros:** Very flexible, handles complex queries
- **Cons:** Requires search implementation, less visual, harder to discover options
- **Why Not Chosen:** Out of scope for v1, less intuitive for categorical filtering

### 14.3 Approach C: Tag-Based Filtering
- **Pros:** Flexible, user-friendly
- **Cons:** Videos don't consistently have tags, would require data work
- **Why Not Chosen:** Not all videos have tags populated, inconsistent metadata

### 14.4 Approach D: Accordion/Collapsible Filter UI
- **Pros:** Saves space when collapsed
- **Cons:** Less discoverable, adds interaction friction
- **Why Not Chosen:** Reduces discoverability, want filters visible but minimal

---

## 15. Open Questions & Risks

### 15.1 Open Questions
- [ ] Should filter dropdowns be multi-select by default or require checkbox selection?
- [ ] Should filter options show counts (e.g., "Osamason (5)")?
- [ ] Should filters be collapsible/expandable to save space?
- [ ] Should filter state persist in localStorage in addition to URL?
- [ ] Should there be keyboard shortcuts for common filters?

### 15.2 Technical Risks
| Risk | Impact | Mitigation |
|------|--------|------------|
| Filter UI too complex for 5% visual weight | High | Strict design constraints, iterative design review |
| Performance with 500+ videos | Medium | Optimization strategies, performance testing |
| Filter state URL getting too long | Low | Limit number of filters, or use localStorage as fallback |

---

## 16. Implementation Phases

### Phase 1: Filter UI Component (Week 1-2)
- Design and implement FilterDropdown component
- Design and implement FeaturedToggle component
- Design and implement ActiveFilterBadges component
- Design and implement VideoFilterBar container
- Style according to Carson-Oliver-West-Weirdcore aesthetic
- Ensure 5% visual weight constraint

### Phase 2: Core Filtering Logic (Week 2-3)
- Implement generateFilterOptions function
- Implement applyFilters function
- Integrate filter logic with VideosPage
- Test with various filter combinations
- Optimize with useMemo

### Phase 3: Additional Features (Week 3-4)
- Implement URL state management (queryStringToFilterState, filterStateToQueryString)
- Implement browser navigation support (back/forward)
- Implement empty state handling
- Implement video count display
- Add keyboard navigation support

### Phase 4: Polish & Testing (Week 4)
- Animation polish (smooth transitions)
- Performance optimization
- Accessibility improvements
- User testing
- Bug fixes and refinements

---

## 17. Dependencies

### 17.1 External Dependencies
- React (existing)
- TypeScript (existing)
- Framer Motion (existing)
- Tailwind CSS (existing)
- URLSearchParams (native browser API)

### 17.2 Internal Dependencies
- Video type definition (`src/types/index.ts`)
- Video data (`src/constants/videos.ts`)
- VideosPage component (`src/pages/VideosPage.tsx`)
- VideoGrid component (`src/components/video/VideoGrid.tsx`)
- Utility functions (`src/utils/index.ts`)

---

## 18. References

- PRD: `features/filtersystem/prd.md`
- User Stories: `features/filtersystem/user-stories.md`
- Use Cases: `features/filtersystem/use-cases.md`
- Video Type: `src/types/index.ts`
- Videos Page: `src/pages/VideosPage.tsx`
- UI Design Guidelines: `.cursor/commands/skill-ui.md`
- Template: `template/design-document-template.md`

---

## 19. Approval

| Role | Name | Date | Signature |
|------|------|------|-----------|
| Engineering Lead | | | |
| Architect | | | |
| Security Review | | | |
| DevOps Lead | | | |

