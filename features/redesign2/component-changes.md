# Redesign 2 - Component Changes

## Components to Modify

### 1. Layout Components

#### Layout.tsx
- **Change**: Background from black to off-white (#C9C8C7)
- **Text**: Invert text colors (dark on light)
- **Keep**: MinimalNav styling (unchanged)

#### MinimalNav.tsx
- **Keep**: Exact styling (as requested)
- **Update**: Text colors if needed for light background
- **Maintain**: All current functionality

### 2. Page Components

#### HomePage.tsx
- **Background**: Change to off-white (#C9C8C7)
- **Text**: Dark text on light background
- **VideoGrid**: Dark videos on light background
- **Keep**: Video-first approach

#### WorkPage.tsx (NEW - Hub)
- **Create**: New hub page component
- **Layout**: Two large clickable sections (Videos/Photos)
- **Arrows**: Arrow indicators for navigation
- **Hover**: Interactive hover states
- **Background**: Off-white (#C9C8C7)

#### VideosPage.tsx (NEW)
- **Create**: Dedicated videos page
- **Layout**: Video grid with masonry layout
- **Header**: Minimal "VIDEOS" header
- **Background**: Off-white (#C9C8C7)

#### PhotosPage.tsx
- **Layout**: Photo grid with Pinterest/masonry layout
- **Header**: Minimal "PHOTOS" header with artist filter buttons
- **Background**: Black with intense grain texture (multiple layers)
- **Features**: 
  - Artist sorting (photos sorted by client field)
  - Artist filtering (ALL button + individual artist buttons)
  - White text on dark background
  - Glitch effects on photo hover
  - Responsive masonry layout

#### OtherPage.tsx
- **Hero**: Massive "LOST FILES" text (stacked 3 times) with subheading
- **Subheading**: "edits, archived content, and whatever the fuck else" at bottom
- **Background**: Black with intense grain texture (multiple layers)
- **Video Organization**:
  - 2 videos per row (much bigger than standard)
  - Hellp videos first, then Osamason, then others
  - "Che" video excluded
  - Large sizing with reduced gaps
- **Styling**: White text captions, zoom-in cursor on hover (no play button)
- **Style**: Weirdcore aesthetic with dark, gothic beauty

#### ContactPage.tsx
- **Background**: Black with intense grain texture (3 layers matching Photos and Lost Files pages)
- **Text**: White text on dark background for high contrast
- **Form Layout**: Experimental layout with Name and Email side by side on desktop (Carson-inspired)
- **Form Inputs**: Black inputs with white text and white borders (20% opacity, full white on focus)
- **Glitch Effects**: Subtle glitch overlay on form field focus (Weirdcore-inspired)
- **Typography**: Large "CONTACT" heading with glitch text effect, bold uppercase labels
- **Animations**: Sequential fade-in animations for form fields using Framer Motion
- **Contact Info**: Updated Instagram handle to @imanol.villagomez, clickable links
- **Style**: Dark, gothic beauty (Oliver) + Experimental typography (Carson) + Minimal perfectionism (West) + Glitch effects (Weirdcore)

### 3. Video Components

#### VideoCard.tsx
- **Background**: Light background instead of dark
- **Text**: Dark text instead of white
- **Thumbnails**: Dark videos on light background
- **Effects**: Maintain glitch effects, adjust for light background
- **Hover**: Update hover states for light background

#### VideoGrid.tsx
- **Background**: Light background
- **Layout**: Maintain masonry layout
- **Spacing**: Adjust for light background
- **Keep**: Video-first approach

#### VideoModal.tsx
- **Background**: Could stay dark for contrast
- **Or**: Light background with dark video
- **Update**: Close button styling if needed

### 4. UI Components

#### PhotoScatter.tsx
- **Count**: 15 photos displayed simultaneously
- **Size**: 120-200px (mobile), 180-280px (desktop) - responsive
- **Positioning**: Organic scattering with minimal overlap (maxSize * 1.2 spacing)
- **Cycling**: Each photo cycles independently at random intervals (3-20 seconds)
- **Position Changes**: Photos change position when cycling (0.9 second transition delay)
- **Footer Avoidance**: 150px buffer from bottom to avoid footer text
- **Spacing**: Spread across viewport, avoiding navigation center and footer
- **Rotation**: Random -15° to 15°
- **Scale**: Random 0.8 to 1.2
- **Performance**: Independent timers prevent synchronized updates

#### GlitchText.tsx
- **Update**: Glitch effects for light background
- **Colors**: Adjust glitch channel colors
- **Enhance**: For "LOST FILES" hero (more intense)

#### GrainTexture.tsx
- **Update**: Grain opacity for light background
- **Adjust**: Visibility on light background

#### FlashOverlay.tsx
- **Update**: Flash effect for light background
- **Adjust**: Brightness/contrast

#### GlitchOverlay.tsx
- **Update**: Glitch effects for light background
- **Maintain**: Intentional glitch aesthetic

### 5. Navigation Components

#### WorkHubNavigation.tsx (NEW)
- **Create**: Navigation component for Work hub
- **Layout**: Two large clickable cards
- **Arrows**: Arrow indicators
- **Hover**: Interactive states
- **Routing**: Links to /work/videos and /work/photos

## New Components Needed

### 1. WorkHub.tsx
- Main hub component
- Two clickable sections
- Arrow navigation
- Hover effects

### 2. LostFilesHero.tsx
- Massive "LOST FILES" text
- Glitch effects
- Continuous animations
- Weirdcore aesthetic

### 3. PhotoGrid.tsx
- Similar to VideoGrid but for photos
- Masonry layout
- Photo cards

### 4. PhotoCard.tsx
- Similar to VideoCard but for photos
- Photo thumbnails
- Hover effects

## Color Updates

### Global Styles
- **Scrollbar**: White scrollbar (12px width) on dark track (#18181b)
  - Thumb: #ffffff (white)
  - Hover: #f5f5f5 (light gray)
  - Homepage has special off-white scrollbar styling
- **Grain Textures**: Intense multi-layer grain overlays for dark pages (Photos, Lost Files)
- **Color System**: Black backgrounds with white text for Photos and Lost Files pages
- Update Tailwind config with off-white colors
- Add dark text colors
- Update component defaults

### Component-Specific
- Each component needs color inversion
- Dark text on light background
- Maintain accent colors (red/green/pink)

## Animation Updates

### Glitch Effects
- Enhance for "LOST FILES" hero
- Adjust for light background
- Maintain intentional aesthetic

### Hover States
- Update for light background
- Maintain interactivity
- Adjust shadows/glows

## Route Updates

### App.tsx
- Add new routes:
  - /work (hub)
  - /work/videos
  - /work/photos
  - /other
- Update existing routes

### Routes.ts
- Add new route constants
- Update navigation structure

