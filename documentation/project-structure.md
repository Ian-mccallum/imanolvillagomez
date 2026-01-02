# Project Structure

This document provides a detailed explanation of the project's directory structure and the purpose of each directory and file.

## Root Directory

```
nol/
├── documentation/      # Project documentation
├── public/            # Static public assets
├── src/               # Source code
├── index.html         # HTML entry point
├── package.json       # Dependencies and scripts
├── tsconfig.json      # TypeScript configuration
├── tsconfig.node.json # TypeScript config for Node files
├── vite.config.ts     # Vite build configuration
├── tailwind.config.js # Tailwind CSS configuration
├── postcss.config.js  # PostCSS configuration
├── .eslintrc.cjs      # ESLint configuration
├── .prettierrc        # Prettier configuration
├── .prettierignore    # Prettier ignore patterns
├── .gitignore         # Git ignore patterns
└── README.md          # Project overview
```

## Source Directory (`src/`)

### Overview

```
src/
├── assets/            # Static assets (images, fonts, etc.)
├── components/        # React components
│   ├── layout/       # Layout components
│   ├── ui/           # Reusable UI components
│   ├── video/        # Video-related components
│   ├── seo/          # SEO components (StructuredData)
│   └── error/        # Error handling components
├── constants/         # Application constants
│   └── seo.ts        # SEO configuration (meta descriptions, keywords)
├── contexts/          # React Context providers
├── hooks/             # Custom React hooks
│   ├── usePageTitle.ts    # Dynamic page title hook
│   └── useMetaTags.ts     # Meta tags management hook
├── pages/             # Page components
├── services/          # API services
├── types/             # TypeScript type definitions
├── utils/             # Utility functions
├── App.tsx            # Main application component
├── main.tsx           # Application entry point
├── index.css          # Global styles (Tailwind imports)
└── vite-env.d.ts      # Vite environment types
```

## Directory Details

### `/src/components`

Reusable React components organized by purpose.

#### `/src/components/layout`

Layout components that define the overall page structure:

- `Layout.tsx` - Main layout wrapper with header and footer
- `Header.tsx` - Navigation header component
- `Footer.tsx` - Footer component with links and copyright

**Usage Pattern:**
```typescript
<Layout>
  <PageContent />
</Layout>
```

#### `/src/components/ui`

Reusable UI components (design system):

- `Button.tsx` - Button component with variants
- `index.ts` - Barrel export for easy imports

**Usage Pattern:**
```typescript
import { Button } from '@/components/ui';
```

#### `/src/components/video`

Video-related components for the video portfolio:

- `VideoCard.tsx` - Individual video card component
- `VideoGrid.tsx` - Video grid layout component
- `VideoModal.tsx` - Full-screen video modal player
- `MasonryGrid.tsx` - Masonry/Pinterest-style grid layout
- `VideoFormatLegend.tsx` - Format legend component
- `VideoFilterBar.tsx` - Filter bar component for video filtering
- `FilterDropdown.tsx` - Dropdown component for filter options
- `FilterBadge.tsx` - Badge component for active filters
- `FeaturedToggle.tsx` - Toggle component for featured filter
- `index.ts` - Barrel export

**Usage Pattern:**
```typescript
import { VideoGrid, VideoModal, VideoFilterBar } from '@/components/video';
```

#### `/src/components/seo`

SEO components for search engine optimization:

- `StructuredData.tsx` - Component for injecting JSON-LD structured data
  - Helper functions: `createPersonSchema`, `createProfessionalServiceSchema`, `createWebSiteSchema`, `createBreadcrumbSchema`, `createVideoObjectSchema`, `createImageObjectSchema`, `createFAQSchema`

**Usage Pattern:**
```typescript
import { StructuredData, createBreadcrumbSchema } from '@/components/seo/StructuredData';

const schema = createBreadcrumbSchema([
  { name: 'Home', url: 'https://nolvideography.com' },
  { name: 'Videos', url: 'https://nolvideography.com/work/videos' },
]);

<StructuredData data={schema} />
```

#### `/src/components/error`

Error handling components:

- `ErrorBoundary.tsx` - React error boundary component

**Usage Pattern:**
```typescript
<ErrorBoundary>
  <App />
</ErrorBoundary>
```

### `/src/pages`

Page-level components that correspond to routes:

- `HomePage.tsx` - Home/landing page
- `VideosPage.tsx` - Videos page with filter system
- `PortfolioPage.tsx` - Portfolio/video gallery page
- `WorkHubPage.tsx` - Work hub/navigation page
- `PhotosPage.tsx` - Photos gallery page
- `OtherPage.tsx` - Other/lost files page
- `AboutPage.tsx` - About page
- `ContactPage.tsx` - Contact page
- `PrivacyPage.tsx` - Privacy policy page

**Convention:**
- One component per route
- Named with `Page` suffix
- Located in `pages/` directory

### `/src/hooks`

Custom React hooks for reusable stateful logic:

- `useLocalStorage.ts` - Hook for localStorage management
- `usePageTitle.ts` - Hook for dynamic page title management
- `useMetaTags.ts` - Hook for comprehensive meta tag management (descriptions, OG tags, Twitter Cards, canonical URLs)
- `index.ts` - Barrel export

**Usage Pattern:**
```typescript
import { useLocalStorage, usePageTitle, useMetaTags } from '@/hooks';

// In a page component:
usePageTitle('Videos');
useMetaTags({
  title: 'IMANOL VILLAGOMEZ | Videos',
  description: 'Music video portfolio...',
  keywords: 'music videographer, concert videography...',
});
```

**Future Hooks:**
- `useApi` - API data fetching
- `useDebounce` - Debounced values
- `useMediaQuery` - Responsive breakpoints

### `/src/services`

API services and external integrations:

- `api.ts` - HTTP client and API service class

**Usage Pattern:**
```typescript
import { apiService } from '@/services/api';

const data = await apiService.get<DataType>('/endpoint');
```

**Responsibilities:**
- HTTP request handling
- Error handling
- Request/response transformation
- Authentication headers (if needed)

### `/src/utils`

Pure utility functions (no side effects):

- `index.ts` - Utility functions

**Functions:**
- `formatDate` - Date formatting
- `truncateText` - Text truncation
- `debounce` - Function debouncing
- `cn` - Class name utility (Tailwind)

**Subdirectories:**
- `filters.ts` - Video filter utility functions (generateFilterOptions, applyFilters, URL helpers)

**Usage Pattern:**
```typescript
import { formatDate, cn } from '@/utils';
import { generateFilterOptions, applyFilters } from '@/utils/filters';
```

### `/src/types`

TypeScript type definitions:

- `index.ts` - Type definitions

**Types Defined:**
- `Video` - Video object structure
- `PortfolioItem` - Portfolio item structure
- `ContactFormData` - Contact form data
- `RouteConfig` - Route configuration
- `LoadingState` - Loading state union type
- `ApiResponse` - API response wrapper

**Subdirectories:**
- `filters.ts` - Filter system types (FilterState, FilterOptions, FilterType)

**Usage Pattern:**
```typescript
import { Video, PortfolioItem } from '@/types';
import { FilterState, FilterOptions } from '@/types/filters';
```

### `/src/constants`

Application-wide constants:

- `routes.ts` - Route paths
- `seo.ts` - SEO configuration (page-specific meta descriptions, keywords, titles)
- `index.ts` - Constants barrel export

**Usage Pattern:**
```typescript
import { ROUTES, APP_NAME, SEO_CONFIG, BASE_URL } from '@/constants';

// Access SEO config for a page:
const seoConfig = SEO_CONFIG.videos;
```

**Benefits:**
- Centralized configuration
- Type-safe constants
- Easy refactoring
- SEO metadata management

### `/src/contexts`

React Context providers (currently empty, ready for future use):

**Potential Use Cases:**
- Theme context
- User authentication context
- Global state management

### `/src/assets`

Static assets:

- Images, fonts, icons
- Video thumbnails
- Other media files

**Usage Pattern:**
```typescript
import logo from '@/assets/logo.png';
```

### Core Files

#### `App.tsx`

Main application component:
- Sets up routing
- Wraps app with error boundary
- Defines route structure

#### `main.tsx`

Application entry point:
- Renders root component
- Sets up React Router
- Initializes the application

#### `index.css`

Global styles:
- Tailwind CSS directives
- Base layer styles
- Global utility classes

#### `vite-env.d.ts`

TypeScript declarations for:
- Vite environment variables
- Vite client types

## Path Aliases

Path aliases are configured for cleaner imports:

```typescript
'@/' → './src'
'@/components' → './src/components'
'@/pages' → './src/pages'
'@/hooks' → './src/hooks'
'@/utils' → './src/utils'
'@/types' → './src/types'
'@/constants' → './src/constants'
'@/services' → './src/services'
'@/contexts' → './src/contexts'
'@/assets' → './src/assets'
```

**Usage:**
```typescript
// Instead of:
import { Button } from '../../../components/ui/Button';

// Use:
import { Button } from '@/components/ui';
```

## Public Directory (`public/`)

Static assets served directly without processing:

- `I.V..png` - Site favicon/logo
- `robots.txt` - Search engine crawler instructions
- `sitemap.xml` - XML sitemap for search engines
- `images/` - Image assets
- `videos/` - Video assets
- Other static files

Files in `public/` are copied to the build output root.

**SEO Files:**
- `robots.txt` - Configures which pages crawlers can access
- `sitemap.xml` - Lists all pages for search engine indexing

## Naming Conventions

### Files

- **Components**: PascalCase (e.g., `Button.tsx`, `HomePage.tsx`)
- **Utilities**: camelCase (e.g., `formatDate.ts`, `api.ts`)
- **Types**: camelCase (e.g., `index.ts` containing types)
- **Constants**: camelCase (e.g., `routes.ts`, `index.ts`)

### Directories

- **All lowercase** with hyphens if needed
- **Clear, descriptive names**
- **Plural for collections** (e.g., `components`, `pages`, `hooks`)

### Components

- **PascalCase** for component names
- **Descriptive names** that indicate purpose
- **Suffixes** for clarity:
  - `Page` for page components
  - `Button`, `Card`, etc. for UI components
  - `Layout`, `Header`, `Footer` for layout components

## Adding New Files

### Adding a New Component

1. Create file in appropriate directory (`components/ui/`, `components/layout/`, etc.)
2. Use PascalCase for filename
3. Export component
4. Add to `index.ts` if creating a new directory

### Adding a New Page

1. Create file in `pages/` directory
2. Name with `Page` suffix (e.g., `ServicesPage.tsx`)
3. Add route in `App.tsx`
4. Add route constant in `constants/routes.ts`

### Adding a New Hook

1. Create file in `hooks/` directory
2. Name with `use` prefix (e.g., `useApi.ts`)
3. Export from `hooks/index.ts`

### Adding a New Type

1. Add type definition to `types/index.ts`
2. Export with other types
3. Use throughout codebase for type safety

## Best Practices

1. **Keep directories focused** - Each directory should have a clear purpose
2. **Use barrel exports** - Export from `index.ts` for cleaner imports
3. **Follow naming conventions** - Consistency makes code easier to navigate
4. **Group related files** - Keep related functionality together
5. **Avoid deep nesting** - Keep directory structure relatively flat
6. **Document complex structures** - Add comments for non-obvious organization
