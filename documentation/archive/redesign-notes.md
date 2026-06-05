# UI Redesign - Pinterest Mood Board Style

## Overview

Complete redesign of the video portfolio to match a Pinterest mood board aesthetic with heavy grungy, collage-style elements. The design now features varying video card sizes, torn edges, enhanced glitch effects, and a raw, experimental aesthetic. **Items never overlap** - proper spacing calculations ensure clean layout.

## Key Changes

### 1. Wide Pinterest-Style Masonry Layout

**New Component: `WideMasonryGrid`**
- Wide grid that fills 98vw (almost full width)
- Varying card sizes (like Pinterest mood board)
- Cards have random widths/heights (2x2 to 6x3 units)
- Featured videos get larger sizes automatically
- Cards have slight rotations (-3° to 3°) for collage effect
- **No overlapping** - spacing calculations account for rotations
- Groups wide videos together (at least 2)
- Groups tall videos together (at least 3)

**New Component: `PaperCutoutCard`**
- Individual cards with customizable sizes
- Torn edge effects (paper cutout aesthetic)
- Multiple texture overlays (grain, scan lines, glitch)
- Handwritten text overlays (randomly placed)
- Hover effects with enhanced glitch
- **Automatic margin calculation** to prevent overlap when rotated

### 2. Enhanced Glitch Effects

**Updated: `GlitchText`**
- Color channel separation (RGB glitch effect)
- Three-layer glitch (red, green, cyan channels)
- Configurable triggers: always, hover, random
- More dramatic and intentional glitches

**New Component: `GlitchOverlay`**
- Intentional glitch overlays for video cards
- Multiple trigger modes (hover, always, random)
- Color channel separation effects
- Mix-blend-mode for authentic glitch look

**New Component: `ScanLines`**
- CRT monitor scan line effect
- Configurable intensity and speed
- Used in video modal and cards

### 3. Grungy Textures & Effects

**New Component: `TornEdge`**
- Torn paper edge effect using clip-path
- Configurable intensity (subtle, medium, strong)
- Applied to video cards for collage aesthetic

**Enhanced: `GrainTexture`**
- Grain overlay for indie sleaze aesthetic
- Applied to all video cards

**New Component: `HandwrittenText`**
- Handwritten-style text overlays
- Random rotations and colors
- Used for year tags and annotations on video cards

### 4. Updated Video Modal

- Added scan lines overlay
- Added random glitch effects
- Enhanced close button animation
- Better visual hierarchy

### 5. Global Styles

**Updated: `index.css`**
- Added scan line animation keyframes
- Added distressed texture utilities
- Enhanced torn edge effects
- Custom scrollbar styling (white scrollbar, 12px width)
  - White scrollbar thumb (#ffffff) on dark track (#18181b)
  - Hover state: Light gray (#f5f5f5)
  - Width: 12px (wider than standard)
  - Homepage has special off-white scrollbar styling

## Design Philosophy

### Carson (Experimental Typography)
- ✅ Broken grid with varying sizes
- ✅ Overlapping elements with z-index
- ✅ Random rotations for collage effect
- ✅ Handwritten text overlays

### Oliver (Dark Beauty)
- ✅ Distressed textures everywhere
- ✅ Torn edges and paper effects
- ✅ Dark backgrounds with videos as light
- ✅ Grain and noise overlays

### Strauss (Viral-Worthy)
- ✅ Bold, memorable layout
- ✅ Iconic green color accents
- ✅ Shareable, screenshot-worthy moments
- ✅ High contrast elements

### Weirdcore (Glitch as Art)
- ✅ Intentional glitch effects
- ✅ Color channel separation
- ✅ Scan lines and digital artifacts
- ✅ Random glitch triggers

## Component Structure

```
src/components/
├── video/
│   ├── MasonryGrid.tsx          # Pinterest-style layout
│   ├── MasonryVideoCard.tsx     # Individual mood board cards
│   ├── VideoGrid.tsx            # Updated to use masonry by default
│   ├── VideoCard.tsx            # Original card (still available)
│   └── VideoModal.tsx            # Enhanced with glitch effects
└── ui/
    ├── GlitchText.tsx           # Enhanced RGB glitch text
    ├── GlitchOverlay.tsx        # New: Glitch overlay component
    ├── ScanLines.tsx            # New: CRT scan lines
    ├── TornEdge.tsx             # New: Torn paper edges
    ├── HandwrittenText.tsx      # New: Handwritten overlays
    └── GrainTexture.tsx         # Existing grain texture
```

## Usage

The masonry layout is now the default for both HomePage and PortfolioPage:

```tsx
<VideoGrid
  videos={videos}
  layout="masonry"  // Default
  featuredFirst={true}
  onVideoSelect={handleVideoSelect}
/>
```

## Visual Hierarchy

1. **Videos (80%)**: Varying sizes, overlapping, with textures
2. **Metadata (15%)**: Titles, client names, years
3. **Navigation (5%)**: Minimal, unobtrusive

## Aesthetic Elements

- **Torn Edges**: Every video card has torn paper effect
- **Grain Texture**: Subtle noise overlay on all cards
- **Scan Lines**: CRT monitor effect in modal
- **Glitch Effects**: RGB channel separation on hover/random
- **Handwritten Text**: Random year tags on some cards
- **Random Rotations**: Slight tilts for collage effect (-3° to 3°)
- **Varying Sizes**: Cards range from 2x2 to 6x3 units
- **No Overlapping**: Proper spacing calculations prevent overlap even with rotations
- **Grouped Layout**: Wide videos grouped together (2+), tall videos grouped together (3+)

## Contact Page Redesign

### Dark Aesthetic with Grain Texture
- **Background**: Black with intense grain texture (3 layers matching Photos and Lost Files pages)
- **Text**: White text on dark background for high contrast
- **Form Layout**: Experimental layout with Name and Email side by side on desktop (Carson-inspired grid breaking)
- **Form Submission**: FormSubmit integration with CAPTCHA protection, redirects to thank you page
- **Email**: `imanolV20@icloud.com`
- **Thank You Page**: Dedicated thank you page with navigation options (back to home, view work)
- **Form Inputs**: Black inputs with white text and white borders (20% opacity, full white on focus)
- **Glitch Effects**: Subtle glitch overlay on form field focus (Weirdcore-inspired)
- **Typography**: Large "CONTACT" heading with glitch text effect, bold uppercase labels
- **Animations**: Sequential fade-in animations for form fields using Framer Motion
- **Contact Info**: Updated Instagram handle to @imanol.villagomez, clickable links
- **Style**: Dark, gothic beauty (Oliver) + Experimental typography (Carson) + Minimal perfectionism (West) + Glitch effects (Weirdcore)

## Next Steps

1. Fine-tune card size distributions
2. Add more handwritten text variations
3. Experiment with more glitch patterns
4. Consider adding paper texture backgrounds
5. Add more distressed overlay variations

## Browser Compatibility

- Modern browsers (Chrome, Firefox, Safari, Edge)
- CSS clip-path for torn edges
- CSS animations for glitch effects
- Framer Motion for interactions

