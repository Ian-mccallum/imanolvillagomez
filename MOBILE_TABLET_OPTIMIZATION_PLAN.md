# Mobile & Tablet Optimization Plan

## Executive Summary

This document outlines a comprehensive plan to optimize all pages of the IMANOL VILLAGOMEZ portfolio website for mobile and tablet resolutions while preserving the existing desktop/web layout and the experimental Carson-Oliver-West-Weirdcore aesthetic. The optimization focuses on touch interactions, responsive typography, layout adaptations, and performance improvements while maintaining the bold, memorable, viral-worthy design language.

**Key Principles:**
- **Mobile-First Approach**: Optimize for smallest screens first, enhance for larger
- **Preserve Desktop Experience**: Keep all desktop layouts and interactions unchanged
- **Preserve Aesthetic**: Maintain Carson-Oliver-West-Weirdcore experimental design on mobile
- **Video-First Philosophy**: Videos dominate on mobile just as on desktop (80% visual weight)
- **Touch-Optimized**: Ensure all interactive elements meet minimum touch target sizes (44x44px)
- **Performance**: Optimize for mobile data constraints and slower connections without sacrificing aesthetic
- **Accessibility**: Maintain WCAG AA compliance across all breakpoints
- **Experimental Typography**: Maintain bold, rule-breaking typography on mobile (scaled appropriately)
- **Dark Beauty**: Preserve Oliver's dark, gothic, cinematic aesthetic on mobile
- **Glitch as Art**: Keep Weirdcore's intentional glitch effects on mobile (optimized for performance)

---

## 1. Breakpoint Strategy

### Current Breakpoints (Tailwind Default)
- **Mobile**: `< 768px` (sm: 640px, but mobile-first means base styles are mobile)
- **Tablet**: `768px - 1024px` (md: 768px)
- **Desktop**: `> 1024px` (lg: 1024px, xl: 1280px, 2xl: 1536px)

### Recommended Breakpoint Refinements
```typescript
// Add to tailwind.config.js if needed
screens: {
  'xs': '375px',    // Small phones
  'sm': '640px',    // Large phones
  'md': '768px',    // Tablets (portrait)
  'lg': '1024px',   // Tablets (landscape) / Small desktops
  'xl': '1280px',   // Desktops
  '2xl': '1536px',  // Large desktops
}
```

### Device Categories
- **Mobile Phones**: 320px - 767px
  - Small: 320px - 374px
  - Standard: 375px - 479px
  - Large: 480px - 767px
- **Tablets**: 768px - 1023px
  - Portrait: 768px - 1023px
  - Landscape: 1024px+ (treated as desktop)
- **Desktop**: 1024px+ (unchanged)

---

## 2. Typography Optimization (Carson-Oliver-West-Weirdcore)

### Design Philosophy: Maintain Experimental Typography on Mobile

**Carson's Rule**: "Don't mistake legibility for communication." Typography should remain bold and experimental on mobile, just scaled appropriately. Breaking rules creates memorable experiences.

**West's Minimalism**: Bold, unapologetic statements work on mobile. Oversized typography creates impact. Scale down but maintain the boldness.

**Oliver's Dark Beauty**: Typography should remain dramatic and cinematic on mobile. High contrast, bold statements.

**Weirdcore's Glitch**: Glitch text effects should work on mobile (with performance optimization).

### Typography Scale (Responsive - Maintaining Boldness)

#### Headers (H1) - Bold, Unapologetic
```tsx
// Carson: Experimental, West: Bold minimalism
// Mobile: Still bold, just scaled
// Desktop: Unchanged (massive, impactful)

// Hero/Page Titles
className="text-3xl sm:text-4xl md:text-5xl lg:text-7xl xl:text-8xl font-black tracking-tighter uppercase"

// Example: HomePage hero
<h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl xl:text-7xl font-medium uppercase tracking-tighter">
  IMANOL VILLAGOMEZ
</h1>

// Example: Page titles (VIDEOS, PHOTOS, etc.)
<h1 className="text-2xl sm:text-3xl md:text-4xl md:text-5xl lg:text-6xl font-black uppercase tracking-tighter">
  VIDEOS
</h1>
```

#### Subheaders (H2) - Still Bold
```tsx
// Mobile: xl-2xl (20px-24px) - Still bold
// Tablet: 3xl-4xl (30px-36px)
// Desktop: 4xl-6xl (36px-60px) - unchanged

className="text-xl sm:text-2xl md:text-3xl lg:text-4xl font-black uppercase tracking-tighter"
```

#### Body Text - Readable but Bold
```tsx
// Mobile: base (16px) - Minimum for iOS zoom prevention
// Tablet: base-lg (16px-18px)
// Desktop: lg (18px) - unchanged

className="text-base md:text-lg font-medium"
```

#### Navigation Text - Minimal but Bold
```tsx
// Mobile: xs-sm (12px-14px) - Still uppercase, bold
// Tablet: sm-base (14px-16px)
// Desktop: base-lg (16px-18px) - unchanged

className="text-xs sm:text-sm md:text-base uppercase tracking-wider font-medium"
```

#### Experimental Typography (Carson) - Maintain on Mobile
```tsx
// Rotated text, overlapping, experimental layouts
// Scale down but keep the experimental feel

// Rotated headings (maintain rotation on mobile)
className="text-2xl sm:text-3xl md:text-5xl lg:text-7xl transform rotate-neg05 md:rotate-neg05"

// Handwritten text (indie sleaze)
className="font-handwritten text-sm sm:text-base md:text-lg transform rotate-12"

// Glitch text (Weirdcore) - works on mobile with reduced intensity
<GlitchText intensity="subtle" trigger="always">
  <span className="text-2xl sm:text-3xl md:text-5xl lg:text-7xl">LOST FILES</span>
</GlitchText>
```

### Implementation Pattern (Maintaining Aesthetic)
```tsx
// Example: Responsive typography that maintains boldness
<h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-7xl font-black uppercase tracking-tighter">
  IMANOL VILLAGOMEZ
</h1>

// Example: Experimental typography
<h2 className="text-2xl sm:text-3xl md:text-5xl lg:text-7xl font-black uppercase tracking-tighter transform rotate-neg05">
  VIDEOS
</h2>
```

---

## 3. Page-by-Page Optimization Plan

### 3.1 HomePage (`/`)

#### Current State
- Full-screen video background
- Centered hero text "IMANOL VILLAGOMEZ"
- Centered navigation buttons (VIDEOS, PHOTOS, OTHER, CONTACT)
- Fixed footer at bottom
- Heavy grain overlays

#### Mobile Optimizations (< 768px)

**Video Background:**
- ✅ Already uses `object-cover` - good
- ⚠️ **Issue**: Video may be too heavy for mobile data
- **Fix**: Add `poster` attribute with optimized thumbnail
- **Fix**: Consider lower quality video source for mobile (use `srcset` or media queries)
- **Fix**: Ensure video doesn't autoplay on mobile (respects `playsInline` and `muted`)

**Hero Text:**
```tsx
// Current: text-3xl md:text-5xl lg:text-6xl xl:text-7xl
// Mobile: Reduce to text-2xl (24px) for very small screens
<h1 className="text-2xl sm:text-3xl md:text-5xl lg:text-6xl xl:text-7xl">
```

**Navigation Buttons:**
```tsx
// Current: text-2xl md:text-3xl lg:text-4xl
// Mobile: Ensure touch targets are 44x44px minimum
// Fix: Add padding to increase touch area
<div className="flex flex-col md:flex-row gap-3 md:gap-8 lg:gap-12">
  {navItems.map((item) => (
    <Link
      to={item.path}
      className="text-xl sm:text-2xl md:text-3xl lg:text-4xl 
                 px-4 py-3 md:px-0 md:py-0  // Add padding on mobile
                 min-h-[44px] flex items-center justify-center" // Touch target
    >
```

**Layout Adjustments:**
- Reduce vertical spacing on mobile: `mb-4 md:mb-8 lg:mb-12`
- Ensure content fits viewport: `min-h-[calc(100vh-60px)]` (accounting for footer)
- Footer: Reduce height on mobile: `h-[24px] md:h-[30px]`

**Grain Overlays (Oliver's Dark Beauty):**
- **CRITICAL**: Maintain grain texture aesthetic on mobile (it's part of the identity)
- Reduce opacity slightly for performance: `opacity-70 md:opacity-90 lg:opacity-100`
- Reduce number of layers on mobile (from 3 to 1-2 layers)
- Use CSS `will-change: opacity` for better performance
- **Never completely disable** - grain is essential to the aesthetic
- Consider lighter grain on very small screens but keep it present

```tsx
// Mobile: Single grain layer, reduced opacity
// Tablet: 2 layers, medium opacity
// Desktop: 3 layers, full opacity (unchanged)

<div
  className="fixed inset-0 pointer-events-none z-0 opacity-70 md:opacity-90 lg:opacity-100"
  style={{
    backgroundImage: `url("data:image/svg+xml,...")`,
    mixBlendMode: 'overlay',
    willChange: 'opacity', // Performance optimization
  }}
/>
```

#### Tablet Optimizations (768px - 1023px)

**Layout:**
- Navigation buttons: Horizontal layout with adequate spacing
- Hero text: Medium size (4xl-5xl)
- Video: Full quality, full screen
- Maintain desktop-like experience with touch-friendly targets

**Touch Targets:**
- All interactive elements: Minimum 44x44px
- Navigation buttons: Adequate spacing between items
- Footer links: Increase touch area

#### Implementation Checklist
- [ ] Optimize video background for mobile (poster, quality)
- [ ] Reduce hero text size on mobile
- [ ] Add touch-friendly padding to navigation buttons
- [ ] Adjust vertical spacing for mobile viewport
- [ ] Reduce footer height on mobile
- [ ] Test video autoplay behavior on iOS/Android
- [ ] Optimize grain overlay performance
- [ ] Test on various mobile devices (iPhone SE, iPhone 14, Android)

---

### 3.2 WorkHubPage (`/work`)

#### Current State
- Two large clickable sections (VIDEOS/PHOTOS)
- Side-by-side on desktop, stacked on mobile
- Arrow indicators
- Hover effects

#### Mobile Optimizations (< 768px)

**Grid Layout:**
```tsx
// Current: grid-cols-1 md:grid-cols-2
// Mobile: Already stacked - good
// Fix: Ensure cards fill width and have adequate height
<div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-8">
  <Link className="h-[300px] sm:h-[400px] md:h-[500px]">
```

**Typography:**
```tsx
// Current: text-5xl md:text-7xl
// Mobile: Reduce size
<h2 className="text-3xl sm:text-4xl md:text-5xl lg:text-7xl">
```

**Touch Targets:**
- Cards: Full width, minimum 300px height
- Ensure entire card is clickable (not just text)
- Add visual feedback on tap (scale animation)

**Arrow Indicators:**
- Reduce size on mobile: `text-2xl sm:text-3xl md:text-4xl lg:text-6xl`
- Ensure visibility without being overwhelming

#### Tablet Optimizations (768px - 1023px)

**Layout:**
- Side-by-side cards with adequate spacing
- Maintain hover effects (with touch fallback)
- Arrow indicators: Medium size

#### Implementation Checklist
- [ ] Ensure cards are full-width on mobile
- [ ] Add adequate card height for touch targets
- [ ] Reduce typography size on mobile
- [ ] Optimize arrow indicator size
- [ ] Test touch interactions
- [ ] Ensure cards are fully clickable
- [ ] Add tap feedback animations

---

### 3.3 VideosPage (`/work/videos`)

#### Current State
- Dark background with intense grain texture
- Video grid (masonry layout)
- Filter bar at top
- Format legend
- Header with title and project count

#### Mobile Optimizations (< 768px)

**Header:**
```tsx
// Current: text-2xl md:text-4xl lg:text-5xl
// Mobile: Reduce size, stack elements
<header className="px-4 pt-16 md:pt-24 pb-4">
  <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-3 md:gap-6">
    <div>
      <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl">
        VIDEOS
      </h1>
      <p className="mt-2 text-xs sm:text-sm md:text-sm">
        {videos.length} PROJECTS
      </p>
    </div>
    {/* Format legend - below header on mobile */}
    <div className="md:hidden">
      <VideoFormatLegend />
    </div>
  </div>
</header>
```

**Filter Bar:**
```tsx
// Current: flex-wrap with gaps
// Mobile: Stack filters vertically or use horizontal scroll
// Fix: Make filter dropdowns touch-friendly
<div className="flex flex-wrap gap-2 overflow-x-auto md:overflow-visible">
  {/* Filters with min-width for touch */}
  <FilterDropdown className="min-w-[120px] min-h-[44px]" />
</div>
```

**Video Grid:**
```tsx
// Current: grid-cols-1 md:grid-cols-2 lg:grid-cols-3
// Mobile: Single column - good
// Fix: Ensure cards have adequate spacing
<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6 lg:gap-8">
```

**Video Cards:**
- Ensure touch targets are adequate
- Reduce metadata text size: `text-xs sm:text-sm md:text-base`
- Optimize video thumbnail loading (lazy load)

**Grain Overlays (Oliver's Dark Beauty):**
- **CRITICAL**: Maintain grain texture - it's essential to the aesthetic
- Reduce layers on mobile (from 3 to 1-2 layers) but keep grain present
- Reduce opacity slightly: `opacity-60 md:opacity-80 lg:opacity-100`
- Use `will-change: opacity` for performance
- **Never completely disable** - grain is part of the identity

```tsx
// Mobile: 1-2 grain layers, reduced opacity
// Desktop: 3 layers, full opacity (unchanged)
<div
  className="fixed inset-0 pointer-events-none z-0 opacity-60 md:opacity-80 lg:opacity-100"
  style={{
    backgroundImage: `url("data:image/svg+xml,...")`,
    mixBlendMode: 'overlay',
    willChange: 'opacity',
  }}
/>
```

#### Tablet Optimizations (768px - 1023px)

**Layout:**
- 2-column grid for videos
- Filter bar: Horizontal layout with adequate spacing
- Format legend: Side-by-side with header

#### Implementation Checklist
- [ ] Optimize header layout for mobile (stack elements)
- [ ] Make filter bar touch-friendly
- [ ] Ensure video cards are properly sized
- [ ] Optimize grain overlay performance
- [ ] Test filter interactions on touch devices
- [ ] Ensure format legend is visible on mobile
- [ ] Test video grid scrolling performance

---

### 3.4 PhotosPage (`/work/photos`)

#### Current State
- Black background with intense grain texture
- Masonry/Pinterest layout (CSS columns)
- Artist filter buttons
- Photo cards with hover effects

#### Mobile Optimizations (< 768px)

**Header:**
```tsx
// Current: text-3xl md:text-5xl lg:text-6xl
// Mobile: Reduce size, stack elements
<header className="px-4 pt-16 md:pt-24 pb-4">
  <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3 md:gap-6">
    <div>
      <h1 className="text-2xl sm:text-3xl md:text-5xl lg:text-6xl">
        PHOTOS
      </h1>
      <p className="mt-2 text-xs sm:text-sm md:text-base">
        {count} PHOTOS
      </p>
    </div>
    {/* Artist filters - wrap on mobile */}
    <div className="flex flex-wrap gap-2">
      {/* Filter buttons with touch targets */}
    </div>
  </div>
</header>
```

**Masonry Layout:**
```tsx
// Current: columns-1 md:columns-2 lg:columns-3 xl:columns-4
// Mobile: Single column - good
// Fix: Ensure photos load efficiently
<div className="columns-1 md:columns-2 lg:columns-3 xl:columns-4 gap-3 md:gap-4 lg:gap-6">
```

**Photo Cards:**
- Ensure images are optimized (WebP, lazy loading)
- Touch targets: Entire card should be tappable
- Reduce hover effects on mobile (use tap feedback instead)

**Filter Buttons:**
```tsx
// Ensure touch-friendly sizing
<button className="px-4 py-2.5 text-sm md:text-base min-h-[44px]">
  ALL
</button>
```

**Grain Overlays:**
- Reduce intensity on mobile for performance
- Consider disabling on very small screens

#### Tablet Optimizations (768px - 1023px)

**Layout:**
- 2-column masonry layout
- Filter buttons: Horizontal layout
- Maintain hover effects with touch fallback

#### Implementation Checklist
- [ ] Optimize photo loading (lazy load, WebP)
- [ ] Make filter buttons touch-friendly
- [ ] Ensure masonry layout works on mobile
- [ ] Optimize grain overlay performance
- [ ] Test photo modal on touch devices
- [ ] Ensure adequate spacing between photos
- [ ] Test pinch-to-zoom in modal

---

### 3.5 OtherPage (`/other` - LOST FILES)

#### Current State
- Striking "LOST FILES" hero section
- Black background with intense grain
- 2-column video grid
- Instagram CTA section

#### Mobile Optimizations (< 768px)

**Hero Section:**
```tsx
// Current: Massive text, may overflow
// Mobile: Reduce size significantly
<h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl xl:text-8xl">
  LOST FILES
</h1>
```

**Video Grid:**
```tsx
// Current: grid-cols-1 md:grid-cols-2
// Mobile: Single column - good
// Fix: Ensure videos are properly sized
<div className="grid grid-cols-1 md:grid-cols-2 gap-3 md:gap-4 lg:gap-6">
```

**Instagram CTA:**
```tsx
// Current: Large button
// Mobile: Ensure touch-friendly
<a className="px-6 py-4 md:px-12 md:py-6 text-base md:text-xl lg:text-2xl min-h-[44px]">
  @imanol.villagomez
</a>
```

**Background Image:**
- Optimize for mobile (smaller file size)
- Consider different image for mobile if needed

#### Tablet Optimizations (768px - 1023px)

**Layout:**
- 2-column video grid
- Hero text: Medium-large size
- Maintain striking visual impact

#### Implementation Checklist
- [ ] Reduce hero text size on mobile
- [ ] Optimize background image for mobile
- [ ] Ensure video grid is touch-friendly
- [ ] Optimize Instagram CTA button
- [ ] Test hero section on various screen sizes
- [ ] Ensure grain overlays don't impact performance

---

### 3.6 ContactPage (`/contact`)

#### Current State
- Dark background with grain texture
- Contact form with experimental layout
- Name/Email side-by-side on desktop
- Glitch effects on focus

#### Mobile Optimizations (< 768px)

**Form Layout:**
```tsx
// Current: grid-cols-1 md:grid-cols-2 (name/email side-by-side)
// Mobile: Stack all fields vertically - good
// Fix: Ensure form fields are touch-friendly
<div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6 lg:gap-8">
  <input className="w-full px-4 py-4 md:px-6 md:py-4 min-h-[44px] text-base" />
</div>
```

**Form Fields:**
- Minimum height: 44px for touch targets
- Font size: 16px minimum (prevents iOS zoom on focus)
- Adequate padding: `px-4 py-4`
- Labels: Ensure they're readable and properly associated

**Submit Button:**
```tsx
// Ensure touch-friendly
<button className="w-full md:w-auto px-8 py-4 md:px-12 md:py-6 
                   text-base md:text-lg lg:text-xl min-h-[44px]">
  SEND
</button>
```

**Glitch Effects (Weirdcore's Intentional Art):**
- **CRITICAL**: Maintain glitch effects on mobile - they're intentional art, not decoration
- Reduce intensity for performance: Use `intensity="subtle"` on mobile, `"medium"` on tablet, `"strong"` on desktop
- Optimize glitch animations: Use CSS transforms (GPU accelerated)
- Consider reducing animation frequency on mobile but keep effects present
- **Never completely disable** - glitches are part of the aesthetic identity

```tsx
// Mobile: Subtle glitch, less frequent
// Tablet: Medium glitch
// Desktop: Strong glitch (unchanged)

<GlitchText 
  intensity={isMobile ? "subtle" : isTablet ? "medium" : "strong"}
  trigger="always"
>
  {children}
</GlitchText>

// Or use responsive classes
<div className="opacity-50 md:opacity-75 lg:opacity-100">
  <GlitchOverlay intensity="medium" trigger="hover" />
</div>
```

#### Tablet Optimizations (768px - 1023px)

**Layout:**
- Name/Email: Side-by-side layout
- Form fields: Adequate sizing
- Maintain experimental layout feel

#### Implementation Checklist
- [ ] Ensure form fields are touch-friendly (44px min height)
- [ ] Set font size to 16px minimum (prevents iOS zoom)
- [ ] Test form submission on mobile
- [ ] Optimize glitch effects for mobile
- [ ] Ensure labels are properly associated
- [ ] Test keyboard behavior on mobile
- [ ] Ensure form is accessible

---

### 3.7 ThankYouPage (`/thank-you`)

#### Current State
- Dark background with grain texture
- Thank you message
- Navigation buttons

#### Mobile Optimizations (< 768px)

**Layout:**
```tsx
// Current: Centered content
// Mobile: Ensure adequate padding
<div className="px-4 md:px-6 pt-16 md:pt-24 pb-8 md:pb-12">
  <div className="max-w-3xl mx-auto">
    <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-7xl xl:text-8xl">
      THANK YOU
    </h1>
  </div>
</div>
```

**Navigation Buttons:**
```tsx
// Ensure touch-friendly
<div className="flex flex-col sm:flex-row gap-3 md:gap-4">
  <Link className="px-6 py-4 md:px-8 md:py-4 min-h-[44px] text-base md:text-lg">
    BACK TO HOME
  </Link>
</div>
```

#### Implementation Checklist
- [ ] Reduce heading size on mobile
- [ ] Ensure buttons are touch-friendly
- [ ] Test navigation on mobile
- [ ] Optimize grain overlays

---

### 3.8 PrivacyPage (`/privacy`)

#### Current State
- Dark background with grain texture
- Long-form content with sections
- Readable body text

#### Mobile Optimizations (< 768px)

**Typography:**
```tsx
// Headers: Reduce size
<h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-7xl xl:text-8xl">
  PRIVACY
</h1>

<h2 className="text-xl sm:text-2xl md:text-3xl lg:text-4xl">
  {section.title}
</h2>

// Body: Ensure readable
<p className="text-sm sm:text-base md:text-lg leading-relaxed">
  {section.content}
</p>
```

**Layout:**
- Adequate padding: `px-4 md:px-6`
- Line height: `leading-relaxed` for readability
- Section spacing: `space-y-8 md:space-y-12`

**Back Link:**
- Ensure touch-friendly: `min-h-[44px]`

#### Implementation Checklist
- [ ] Optimize typography for mobile readability
- [ ] Ensure adequate line spacing
- [ ] Test scrolling performance
- [ ] Optimize grain overlays

---

## 4. Component-Level Optimizations

### 4.1 MinimalNav

#### Current State
- Fixed top navigation
- Logo and menu items
- Work dropdown
- Contact CTA button

#### Mobile Optimizations

**Layout:**
```tsx
// Current: Already responsive with text-xs md:text-sm
// Mobile: Ensure touch targets
<nav className="fixed top-0 left-0 right-0 z-50 px-4 md:px-6 py-2.5 md:py-2.5">
  <div className="flex items-center justify-between">
    {/* Logo - touch-friendly */}
    <Link className="text-sm md:text-base lg:text-lg min-h-[44px] flex items-center">
      IMANOL VILLAGOMEZ
    </Link>
    
    {/* Menu - ensure spacing */}
    <div className="flex gap-3 md:gap-4 lg:gap-6 items-center">
      {/* Menu items with touch targets */}
      <Link className="text-xs md:text-sm min-h-[44px] flex items-center px-2">
        HOME
      </Link>
    </div>
  </div>
</nav>
```

**Dropdown:**
- Ensure dropdown is touch-friendly
- Test on mobile (may need click instead of hover)
- Ensure dropdown doesn't close immediately on mobile

#### Implementation Checklist
- [ ] Ensure all nav items are touch-friendly
- [ ] Test dropdown on mobile (click behavior)
- [ ] Ensure logo is tappable
- [ ] Test navigation on various devices

---

### 4.2 Footer

#### Current State
- Copyright text
- Privacy Policy link
- Instagram link

#### Mobile Optimizations

**Layout:**
```tsx
// Current: flex-col md:flex-row
// Mobile: Stack vertically - good
// Fix: Ensure links are touch-friendly
<footer className="px-4 md:px-6 py-3 md:py-3">
  <div className="flex flex-col md:flex-row items-center justify-between gap-2 md:gap-4">
    <div className="flex flex-col sm:flex-row items-center gap-2 text-xs md:text-sm">
      <span>© 2026 IMANOL VILLAGOMEZ</span>
      <Link className="min-h-[44px] flex items-center underline">
        Privacy Policy
      </Link>
    </div>
    <a className="min-h-[44px] flex items-center gap-2 text-sm md:text-base">
      @imanol.villagomez
    </a>
  </div>
</footer>
```

#### Implementation Checklist
- [ ] Ensure links are touch-friendly
- [ ] Test footer on mobile
- [ ] Ensure adequate spacing

---

### 4.3 VideoCard (Video-First, Pinterest/Scrapbook Style)

#### Current State
- Video thumbnail (standard size: 300-500px width)
- Metadata (title, date)
- Hover effects (glitch, flash, grain)
- Grain overlays (Oliver)
- Glitch effects (Weirdcore)

#### Mobile Optimizations (Maintaining Aesthetic)

**Video-First Philosophy:**
- **CRITICAL**: Videos must still dominate on mobile (80% visual weight)
- Maintain standard sizing (300-500px width) - allows many videos
- Single column on mobile, but videos should fill the page
- Maintain Pinterest/scrapbook aesthetic on mobile

**Touch Interactions:**
- Replace hover effects with tap feedback (maintain same aesthetic)
- Use `whileTap` from Framer Motion for immediate feedback
- Ensure entire card is tappable
- Maintain glitch effects on tap (Weirdcore)

```tsx
// Mobile: Tap feedback maintains aesthetic
<motion.div
  whileTap={{ scale: 0.98 }} // West's minimal feedback
  className="group relative cursor-pointer"
  onMouseEnter={() => setIsHovered(true)}
  onMouseLeave={() => setIsHovered(false)}
>
  {/* Glitch overlay - works on tap too */}
  <GlitchOverlay 
    intensity={isMobile ? "subtle" : "medium"} 
    trigger="hover" 
  />
  
  {/* Flash overlay - indie sleaze */}
  <FlashOverlay intensity="medium" isActive={isHovered || isTapped} />
</motion.div>
```

**Metadata (Carson's Experimental Typography):**
```tsx
// Mobile: Slightly smaller but maintain boldness
<div className="mt-2 md:mt-3 lg:mt-4">
  <div className="text-xs sm:text-sm md:text-base font-medium">
    {video.artist} / {video.song}
  </div>
  <div className="mt-1 text-xs md:text-sm">
    {video.date}
  </div>
</div>
```

**Video Thumbnail:**
- Optimize loading (lazy load with Intersection Observer)
- Ensure proper aspect ratio (16:9)
- Consider poster image for faster initial load
- Maintain grain overlay (Oliver) - reduced opacity on mobile

**Grain & Glitch Effects:**
- Keep grain overlay present (reduced opacity: `opacity-20 md:opacity-30`)
- Keep glitch effects (reduced intensity: `intensity="subtle"` on mobile)
- Use CSS `will-change` for performance

#### Implementation Checklist
- [ ] Optimize video thumbnail loading (lazy load)
- [ ] Maintain grain overlay on mobile (reduced opacity)
- [ ] Maintain glitch effects on mobile (reduced intensity)
- [ ] Add tap feedback animations (maintain aesthetic)
- [ ] Ensure card is fully tappable
- [ ] Test video modal on mobile
- [ ] Ensure videos still dominate (80% visual weight)
- [ ] Maintain Pinterest/scrapbook aesthetic

---

### 4.4 PhotoCard

#### Current State
- Photo image
- Metadata overlay on hover
- Glitch effects

#### Mobile Optimizations

**Touch Interactions:**
- Show metadata on tap (not hover)
- Ensure entire card is tappable
- Add tap feedback

**Image Loading:**
- Lazy load images
- Use WebP format
- Optimize image sizes for mobile

**Metadata Overlay:**
```tsx
// Show on tap instead of hover
<div className="absolute bottom-0 left-0 right-0 
                bg-gradient-to-t from-black/80 to-transparent p-4
                opacity-0 group-active:opacity-100 md:group-hover:opacity-100
                transition-opacity duration-200">
```

#### Implementation Checklist
- [ ] Optimize image loading
- [ ] Add tap feedback
- [ ] Show metadata on tap
- [ ] Test photo modal on mobile

---

### 4.5 VideoFilterBar

#### Current State
- Multiple filter dropdowns
- Featured toggle
- Active filter badges
- Video count

#### Mobile Optimizations

**Layout:**
```tsx
// Current: flex-wrap
// Mobile: May need horizontal scroll or vertical stack
<div className="flex flex-wrap gap-2 overflow-x-auto md:overflow-visible">
  {/* Filters */}
</div>
```

**Filter Dropdowns:**
- Ensure touch-friendly (44px min height)
- Test dropdown behavior on mobile
- Ensure dropdowns don't overlap

**Active Filter Badges:**
- Ensure badges are tappable
- Adequate spacing between badges

#### Implementation Checklist
- [ ] Make filter dropdowns touch-friendly
- [ ] Test filter interactions on mobile
- [ ] Ensure badges are tappable
- [ ] Test horizontal scroll if needed

---

### 4.6 FullscreenModal

#### Current State
- Full-screen video/image viewer
- Navigation controls
- Metadata overlay
- Touch gestures enabled

#### Mobile Optimizations

**Video Player:**
- Ensure native controls are accessible
- Test fullscreen behavior on iOS/Android
- Ensure video doesn't autoplay (respects user preferences)

**Touch Gestures:**
- Swipe to navigate (already enabled)
- Pinch to zoom (for images)
- Pull down to close

**Controls:**
- Ensure close button is touch-friendly
- Ensure navigation arrows are touch-friendly
- Consider larger touch targets on mobile

#### Implementation Checklist
- [ ] Test video playback on mobile
- [ ] Test image viewing on mobile
- [ ] Ensure touch gestures work
- [ ] Test fullscreen behavior
- [ ] Ensure controls are accessible

---

## 5. Performance Optimizations

### 5.1 Image Optimization

**Current Issues:**
- Large image files may slow mobile loading
- No image format optimization (WebP)
- No lazy loading for below-fold images

**Optimizations:**
```tsx
// Use WebP with fallback
<picture>
  <source srcSet={imageWebP} type="image/webp" />
  <img src={imageJPG} alt={alt} loading="lazy" />
</picture>

// Or use Next.js Image component if available
// Or implement lazy loading with Intersection Observer
```

**Implementation:**
- [ ] Convert images to WebP format
- [ ] Implement lazy loading for images
- [ ] Use responsive image sizes (srcset)
- [ ] Optimize image compression

---

### 5.2 Video Optimization

**Current Issues:**
- Large video files for background
- No video quality selection for mobile
- Videos may autoplay unnecessarily

**Optimizations:**
```tsx
// Use poster image for faster initial load
<video poster={posterImage} preload="metadata">
  <source src={videoWebM} type="video/webm" />
  <source src={videoMP4} type="video/mp4" />
</video>

// Consider lower quality for mobile
// Use media queries or detect device
```

**Implementation:**
- [ ] Add poster images to videos
- [ ] Consider lower quality video for mobile
- [ ] Optimize video compression
- [ ] Test autoplay behavior on mobile

---

### 5.3 Grain Overlay Optimization (Oliver's Dark Beauty)

**Design Philosophy:**
- **CRITICAL**: Grain texture is essential to the aesthetic identity (Oliver's indie sleaze, distressed textures)
- Never completely disable grain - it's part of the brand
- Optimize for performance while maintaining the aesthetic

**Current Issues:**
- Multiple grain overlay layers may impact performance on mobile
- High opacity may cause rendering issues on low-end devices

**Optimizations (Maintaining Aesthetic):**
```tsx
// Mobile: 1-2 layers, reduced opacity (but still present)
// Tablet: 2 layers, medium opacity
// Desktop: 3 layers, full opacity (unchanged)

// Detect mobile device
const isMobile = window.innerWidth < 768;
const isTablet = window.innerWidth >= 768 && window.innerWidth < 1024;

// Conditional rendering based on device
{isMobile ? (
  // Mobile: Single grain layer, reduced opacity
  <div
    className="fixed inset-0 pointer-events-none z-0 opacity-60"
    style={{
      backgroundImage: `url("data:image/svg+xml,...")`,
      mixBlendMode: 'overlay',
      willChange: 'opacity', // Performance optimization
    }}
  />
) : isTablet ? (
  // Tablet: 2 layers
  <>
    <div className="opacity-70" />
    <div className="opacity-50" />
  </>
) : (
  // Desktop: 3 layers, full opacity (unchanged)
  <>
    <div className="opacity-100" />
    <div className="opacity-90" />
    <div className="opacity-70" />
  </>
)}
```

**Performance Techniques:**
- Use CSS `will-change: opacity` for GPU acceleration
- Reduce number of layers on mobile (3 → 1-2)
- Reduce opacity slightly (100% → 60-70% on mobile)
- Use `transform: translateZ(0)` to force GPU acceleration
- Consider using a single, optimized grain texture on mobile

**Implementation:**
- [ ] Reduce grain overlay layers on mobile (3 → 1-2)
- [ ] Reduce opacity slightly on mobile (maintain presence)
- [ ] Use CSS will-change for performance
- [ ] Test performance on low-end devices
- [ ] **Never completely disable** - grain is essential
- [ ] Maintain grain on all pages (HomePage, VideosPage, PhotosPage, etc.)

---

### 5.4 Animation Optimization (Weirdcore's Glitch as Art)

**Design Philosophy:**
- **CRITICAL**: Glitch effects are intentional art, not decoration (Weirdcore)
- Maintain glitch effects on mobile but optimize for performance
- Reduce intensity, not presence

**Current Issues:**
- Heavy animations may cause jank on mobile
- Glitch effects may be too intense for low-end devices

**Optimizations (Maintaining Aesthetic):**
```tsx
// Respect prefers-reduced-motion (accessibility)
const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

// Conditional glitch intensity based on device
const glitchIntensity = prefersReducedMotion 
  ? 'none' 
  : isMobile 
    ? 'subtle' 
    : isTablet 
      ? 'medium' 
      : 'strong';

// Use in components
<GlitchText intensity={glitchIntensity} trigger="always">
  {children}
</GlitchText>

// Or with responsive classes
<div className={cn(
  "animate-glitch",
  prefersReducedMotion && "animate-none",
  isMobile && "opacity-50",
  isTablet && "opacity-75",
  !isMobile && !isTablet && "opacity-100"
)} />
```

**Performance Techniques:**
- Use CSS transforms (GPU accelerated) instead of position changes
- Reduce animation frequency on mobile (less frequent glitches)
- Use `will-change: transform` for animated elements
- Reduce number of glitch layers on mobile (3 → 1-2)
- Use `transform: translateZ(0)` to force GPU acceleration

**Glitch Component Optimization:**
```tsx
// Mobile: Subtle glitch, less frequent
// Desktop: Strong glitch, more frequent (unchanged)

const glitchVariants = {
  glitch: {
    x: [0, -2, 2, -1, 1, 0],
    y: [0, 1, -1, 0.5, -0.5, 0],
    transition: {
      duration: isMobile ? 0.1 : 0.15, // Faster on mobile
      repeat: Infinity,
      repeatDelay: isMobile ? 3 : 2, // Less frequent on mobile
      ease: 'easeInOut',
    },
  },
};
```

**Implementation:**
- [ ] Respect prefers-reduced-motion (accessibility)
- [ ] Reduce glitch intensity on mobile (not presence)
- [ ] Reduce animation frequency on mobile
- [ ] Use CSS transforms (GPU accelerated)
- [ ] Test animations on low-end devices
- [ ] **Never completely disable** - glitches are intentional art
- [ ] Maintain glitch effects on all interactive elements

---

## 6. Touch Interaction Improvements

### 6.1 Touch Target Sizes

**WCAG Guidelines:**
- Minimum touch target: 44x44px (iOS) / 48x48px (Android)
- Adequate spacing between targets (8px minimum)

**Implementation:**
```tsx
// Ensure all interactive elements meet minimum size
<button className="min-h-[44px] min-w-[44px] px-4 py-2">
  Click Me
</button>

// Add spacing between touch targets
<div className="flex gap-3 md:gap-4">
  {/* Touch targets */}
</div>
```

**Checklist:**
- [ ] All buttons: 44x44px minimum
- [ ] All links: 44x44px minimum
- [ ] All form inputs: 44px minimum height
- [ ] Adequate spacing between targets
- [ ] Test on various devices

---

### 6.2 Touch Feedback (Maintaining Aesthetic)

**Design Philosophy:**
- Touch feedback should feel intentional and cinematic (West's minimalism)
- Maintain glitch effects on tap (Weirdcore)
- Keep feedback minimal but impactful (West)

**Current State:**
- Some components use `whileTap` from Framer Motion
- May need additional visual feedback that matches aesthetic

**Improvements (Maintaining Aesthetic):**
```tsx
// West's minimal feedback - subtle but impactful
<motion.button
  whileTap={{ scale: 0.98 }} // Minimal scale
  className="bg-white text-black font-black px-8 py-4"
>
  SEND
</motion.button>

// With glitch effect on tap (Weirdcore)
<motion.div
  whileTap={{ scale: 0.98 }}
  onTapStart={() => setIsTapped(true)}
  onTapEnd={() => setIsTapped(false)}
>
  <VideoCard />
  {isTapped && (
    <GlitchOverlay intensity="subtle" trigger="always" />
  )}
</motion.div>

// Flash effect on tap (Indie sleaze)
<motion.div
  whileTap={{ scale: 0.98 }}
>
  <FlashOverlay intensity="medium" isActive={isTapped} />
</motion.div>

// Active state styling (CSS fallback)
<button className="
  active:scale-98 
  active:opacity-95
  transition-all duration-150
  touch-manipulation
">
  Click Me
</button>
```

**Touch Feedback Patterns:**
- **Video Cards**: Scale 0.98, glitch overlay on tap
- **Buttons**: Scale 0.95-0.98, minimal opacity change
- **Navigation**: Scale 1.05 on tap (slight grow)
- **Filter Dropdowns**: Scale 0.98, border color change

**Checklist:**
- [ ] Add tap feedback to all interactive elements
- [ ] Maintain aesthetic (glitch, flash effects on tap)
- [ ] Ensure feedback is visible and immediate
- [ ] Test on various devices
- [ ] Ensure feedback doesn't interfere with functionality
- [ ] Use `touch-manipulation` CSS for better touch response

---

### 6.3 Gesture Support

**Current State:**
- FullscreenModal has touch gestures enabled
- May need additional gesture support

**Improvements:**
- Swipe to navigate (already implemented)
- Pull to refresh (if applicable)
- Pinch to zoom (for images)
- Double-tap to zoom (for images)

**Checklist:**
- [ ] Test swipe gestures
- [ ] Test pinch-to-zoom
- [ ] Test double-tap to zoom
- [ ] Ensure gestures don't conflict with scrolling

---

## 7. Accessibility Improvements

### 7.1 Screen Reader Support

**Current State:**
- Some components may lack proper ARIA labels
- Images may lack alt text

**Improvements:**
```tsx
// Add ARIA labels
<button aria-label="Close modal">
  <CloseIcon />
</button>

// Ensure images have alt text
<img src={image} alt="Description of image" />

// Add ARIA live regions for dynamic content
<div aria-live="polite" aria-atomic="true">
  {dynamicContent}
</div>
```

**Checklist:**
- [ ] Add ARIA labels to interactive elements
- [ ] Ensure all images have alt text
- [ ] Add ARIA live regions where needed
- [ ] Test with screen readers

---

### 7.2 Keyboard Navigation

**Current State:**
- Most components support keyboard navigation
- May need improvements for mobile keyboard

**Improvements:**
- Ensure all interactive elements are keyboard accessible
- Test form navigation with mobile keyboard
- Ensure focus indicators are visible

**Checklist:**
- [ ] Test keyboard navigation
- [ ] Ensure focus indicators are visible
- [ ] Test form navigation
- [ ] Ensure modals can be closed with keyboard

---

### 7.3 Color Contrast

**Current State:**
- Most text has good contrast
- May need verification on mobile

**Improvements:**
- Verify WCAG AA compliance (4.5:1 for normal text, 3:1 for large text)
- Test on various screen brightnesses
- Ensure contrast works in different lighting conditions

**Checklist:**
- [ ] Verify color contrast ratios
- [ ] Test on various devices
- [ ] Test in different lighting conditions
- [ ] Ensure text is readable on all backgrounds

---

## 8. Testing Strategy

### 8.1 Device Testing

**Priority Devices:**
1. **iPhone SE (375px)** - Smallest common mobile
2. **iPhone 14/15 (390px)** - Standard mobile
3. **iPhone 14 Pro Max (430px)** - Large mobile
4. **iPad (768px)** - Tablet portrait
5. **iPad Pro (1024px)** - Tablet landscape / Small desktop
6. **Desktop (1280px+)** - Verify unchanged

**Testing Tools:**
- Chrome DevTools device emulation
- BrowserStack for real device testing
- Physical devices (if available)

---

### 8.2 Browser Testing

**Priority Browsers:**
1. **Safari iOS** - Most common mobile browser
2. **Chrome Android** - Most common Android browser
3. **Firefox Mobile** - Secondary browser
4. **Samsung Internet** - Popular on Samsung devices

---

### 8.3 Performance Testing

**Metrics to Test:**
- First Contentful Paint (FCP): < 1.8s
- Largest Contentful Paint (LCP): < 2.5s
- Time to Interactive (TTI): < 3.8s
- Cumulative Layout Shift (CLS): < 0.1

**Tools:**
- Lighthouse (mobile mode)
- WebPageTest
- Chrome DevTools Performance tab

---

### 8.4 User Testing

**Scenarios:**
1. Navigate from homepage to videos
2. Filter videos on mobile
3. View fullscreen video
4. Browse photos
5. Submit contact form
6. Navigate to privacy policy

**Metrics:**
- Task completion rate
- Time to complete tasks
- Error rate
- User satisfaction

---

## 9. Implementation Priority

### Phase 1: Critical Mobile Fixes (Week 1)
1. ✅ Typography scaling for mobile
2. ✅ Touch target sizes (44x44px minimum)
3. ✅ Form field optimization (16px font, adequate padding)
4. ✅ Navigation touch targets
5. ✅ Video background optimization

### Phase 2: Layout Optimizations (Week 2)
1. ✅ HomePage mobile layout
2. ✅ VideosPage mobile layout
3. ✅ PhotosPage mobile layout
4. ✅ ContactPage mobile layout
5. ✅ Other pages mobile layout

### Phase 3: Component Optimizations (Week 3)
1. ✅ VideoCard mobile optimizations
2. ✅ PhotoCard mobile optimizations
3. ✅ FilterBar mobile optimizations
4. ✅ Modal mobile optimizations
5. ✅ Navigation mobile optimizations

### Phase 4: Performance (Week 4)
1. ✅ Image optimization (WebP, lazy loading)
2. ✅ Video optimization (poster, quality)
3. ✅ Grain overlay optimization
4. ✅ Animation optimization
5. ✅ Bundle size optimization

### Phase 5: Polish & Testing (Week 5)
1. ✅ Cross-device testing
2. ✅ Browser testing
3. ✅ Performance testing
4. ✅ Accessibility testing
5. ✅ User testing

---

## 10. Success Criteria

### Functional Requirements
- [ ] All pages load and function correctly on mobile (< 768px)
- [ ] All pages load and function correctly on tablet (768px - 1023px)
- [ ] Desktop layout remains unchanged (> 1024px)
- [ ] All interactive elements are touch-friendly (44x44px minimum)
- [ ] All forms are usable on mobile
- [ ] All modals work on mobile
- [ ] Navigation works on mobile

### Performance Requirements
- [ ] Lighthouse mobile score > 90
- [ ] First Contentful Paint < 1.8s
- [ ] Largest Contentful Paint < 2.5s
- [ ] No layout shifts (CLS < 0.1)
- [ ] Smooth scrolling (60fps)

### Accessibility Requirements
- [ ] WCAG AA compliance
- [ ] Color contrast ratios met
- [ ] Keyboard navigation works
- [ ] Screen reader compatible
- [ ] Touch targets meet guidelines

### User Experience Requirements
- [ ] Intuitive navigation on mobile
- [ ] Fast page loads
- [ ] Smooth animations
- [ ] Clear visual feedback
- [ ] No broken layouts

---

## 11. Notes & Considerations

### Design Philosophy (Carson-Oliver-West-Weirdcore)

**Preserve Aesthetic on Mobile:**
- **Carson**: Experimental typography should remain bold and rule-breaking on mobile (just scaled)
- **Oliver**: Dark, gothic beauty and grain textures are essential - maintain on mobile
- **West**: Minimalist perfectionism and bold statements work on mobile - maintain impact
- **Weirdcore**: Glitch effects are intentional art - maintain on mobile (optimized)

**Video-First Philosophy:**
- Videos must still dominate on mobile (80% visual weight)
- Maintain Pinterest/scrapbook aesthetic on mobile
- Many videos, standard sizing (300-500px width)
- Videos start immediately - no hero sections

**Key Principles:**
- **Preserve Desktop Experience**: All desktop layouts and interactions remain unchanged
- **Preserve Aesthetic**: Maintain experimental, bold design on mobile
- **Mobile-First Optimization**: Optimize for mobile, enhance for larger screens
- **Touch-Optimized**: All interactions work well with touch
- **Performance-Conscious**: Optimize for slower connections without sacrificing aesthetic
- **Never Completely Disable**: Grain textures and glitch effects are essential - optimize, don't remove

### Technical Constraints
- **Video Autoplay**: May be restricted on mobile browsers
- **File Sizes**: Mobile data constraints require optimization
- **Performance**: Lower-end devices need consideration
- **Browser Differences**: iOS Safari vs Android Chrome differences

### Future Considerations
- **Progressive Web App (PWA)**: Consider adding PWA features
- **Offline Support**: Consider offline functionality
- **Push Notifications**: If applicable
- **App-like Experience**: Consider app-like navigation patterns

---

## 12. Maintaining Aesthetic on Mobile (Carson-Oliver-West-Weirdcore)

### Critical Aesthetic Elements to Preserve

**Grain Textures (Oliver's Dark Beauty):**
- ✅ **DO**: Reduce layers (3 → 1-2) and opacity (100% → 60-70%) on mobile
- ✅ **DO**: Use `will-change: opacity` for performance
- ❌ **DON'T**: Completely disable grain - it's essential to the aesthetic
- ❌ **DON'T**: Remove grain from any page - it's part of the brand identity

**Glitch Effects (Weirdcore's Intentional Art):**
- ✅ **DO**: Reduce intensity (`strong` → `subtle`) on mobile
- ✅ **DO**: Reduce animation frequency on mobile
- ✅ **DO**: Use GPU-accelerated transforms
- ❌ **DON'T**: Completely disable glitches - they're intentional art
- ❌ **DON'T**: Remove glitch effects from interactive elements

**Experimental Typography (Carson's Rule-Breaking):**
- ✅ **DO**: Scale down font sizes but maintain boldness
- ✅ **DO**: Keep uppercase, tracking, and experimental layouts
- ✅ **DO**: Maintain rotated text and overlapping elements
- ❌ **DON'T**: Make typography "safe" or conventional on mobile
- ❌ **DON'T**: Remove experimental layouts - scale them

**Dark Aesthetic (Oliver's Gothic Beauty):**
- ✅ **DO**: Maintain black backgrounds and high contrast
- ✅ **DO**: Keep dark, cinematic atmosphere
- ✅ **DO**: Preserve distressed textures
- ❌ **DON'T**: Lighten backgrounds for "better mobile UX"
- ❌ **DON'T**: Reduce contrast - maintain dramatic feel

**Bold Minimalism (West's Iconic Statements):**
- ✅ **DO**: Maintain bold, unapologetic typography
- ✅ **DO**: Keep minimal, clean layouts
- ✅ **DO**: Preserve high contrast (black/white)
- ❌ **DON'T**: Add unnecessary elements for "mobile UX"
- ❌ **DON'T**: Reduce boldness - maintain impact

**Video-First Philosophy:**
- ✅ **DO**: Maintain video dominance (80% visual weight)
- ✅ **DO**: Keep Pinterest/scrapbook layout on mobile
- ✅ **DO**: Preserve standard video sizing (300-500px width)
- ❌ **DON'T**: Make videos smaller to "fit mobile better"
- ❌ **DON'T**: Add hero sections before videos

### Performance vs. Aesthetic Balance

**Optimization Strategy:**
1. **Reduce, Don't Remove**: Reduce intensity/frequency, not presence
2. **Layer Management**: Fewer layers on mobile, but keep effects
3. **GPU Acceleration**: Use CSS transforms and `will-change`
4. **Conditional Rendering**: Device-based intensity, not removal
5. **Progressive Enhancement**: Start with essential aesthetic, enhance for desktop

**Example Pattern:**
```tsx
// Detect device
const isMobile = typeof window !== 'undefined' && window.innerWidth < 768;
const isTablet = typeof window !== 'undefined' && window.innerWidth >= 768 && window.innerWidth < 1024;

// Conditional intensity (not removal)
const grainOpacity = isMobile ? 0.6 : isTablet ? 0.8 : 1.0;
const glitchIntensity = isMobile ? 'subtle' : isTablet ? 'medium' : 'strong';
const grainLayers = isMobile ? 1 : isTablet ? 2 : 3;

// Apply with performance optimizations
<div
  style={{
    opacity: grainOpacity,
    willChange: 'opacity',
    transform: 'translateZ(0)', // GPU acceleration
  }}
>
  {/* Grain layers */}
</div>
```

---

## 13. Quick Reference: Common Patterns

### Responsive Typography (Maintaining Boldness)
```tsx
// Header - Bold, unapologetic (West + Carson)
className="text-3xl sm:text-4xl md:text-5xl lg:text-7xl font-black uppercase tracking-tighter"

// Subheader - Still bold
className="text-xl sm:text-2xl md:text-3xl lg:text-4xl font-black uppercase tracking-tighter"

// Body - Readable but bold
className="text-base md:text-lg font-medium"

// Small text - Uppercase, tracking
className="text-xs sm:text-sm md:text-base uppercase tracking-wider"

// Experimental typography (Carson) - Maintain rotation
className="text-2xl sm:text-3xl md:text-5xl lg:text-7xl transform rotate-neg05"
```

### Touch-Friendly Buttons
```tsx
className="min-h-[44px] min-w-[44px] px-4 py-2.5 text-base"
```

### Responsive Spacing
```tsx
className="px-4 md:px-6 lg:px-8"
className="py-3 md:py-4 lg:py-6"
className="gap-3 md:gap-4 lg:gap-6"
```

### Responsive Grid
```tsx
className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6 lg:gap-8"
```

### Responsive Flex
```tsx
className="flex flex-col md:flex-row gap-3 md:gap-4"
```

### Grain Overlay (Oliver - Maintain on Mobile)
```tsx
// Mobile: 1-2 layers, reduced opacity (but present)
// Desktop: 3 layers, full opacity (unchanged)
<div
  className="fixed inset-0 pointer-events-none z-0 opacity-60 md:opacity-80 lg:opacity-100"
  style={{
    backgroundImage: `url("data:image/svg+xml,...")`,
    mixBlendMode: 'overlay',
    willChange: 'opacity',
    transform: 'translateZ(0)', // GPU acceleration
  }}
/>
```

### Glitch Effects (Weirdcore - Maintain on Mobile)
```tsx
// Mobile: Subtle intensity
// Desktop: Strong intensity (unchanged)
<GlitchText 
  intensity={isMobile ? "subtle" : isTablet ? "medium" : "strong"}
  trigger="always"
>
  {children}
</GlitchText>

// Or with responsive classes
<div className="opacity-50 md:opacity-75 lg:opacity-100">
  <GlitchOverlay intensity="medium" trigger="hover" />
</div>
```

### Touch Feedback (Maintaining Aesthetic)
```tsx
// West's minimal feedback with Weirdcore's glitch
<motion.div
  whileTap={{ scale: 0.98 }}
  onTapStart={() => setIsTapped(true)}
>
  <GlitchOverlay intensity="subtle" trigger={isTapped ? "always" : "hover"} />
</motion.div>
```

---

## Conclusion

This optimization plan provides a comprehensive roadmap for making the IMANOL VILLAGOMEZ portfolio website fully optimized for mobile and tablet devices while preserving the desktop experience. The plan is organized by page and component, with clear implementation checklists and success criteria.

**Key Takeaways:**
1. **Typography**: Scale down font sizes for mobile while maintaining boldness and experimental feel (Carson-West)
2. **Touch Targets**: Ensure all interactive elements are 44x44px minimum
3. **Layout**: Stack elements vertically on mobile, horizontal on larger screens
4. **Video-First**: Maintain video dominance on mobile (80% visual weight, Pinterest/scrapbook style)
5. **Aesthetic Preservation**: Maintain grain textures and glitch effects on mobile (optimized, not removed)
6. **Performance**: Optimize images, videos, and animations for mobile without sacrificing aesthetic
7. **Accessibility**: Maintain WCAG AA compliance across all breakpoints
8. **Dark Beauty**: Preserve Oliver's dark, gothic, cinematic aesthetic on mobile
9. **Glitch as Art**: Maintain Weirdcore's intentional glitch effects on mobile (reduced intensity)
10. **Bold Minimalism**: Preserve West's bold, unapologetic statements on mobile

**Next Steps:**
1. Review this plan with the team
2. Prioritize implementation phases
3. Begin Phase 1: Critical Mobile Fixes
4. Test continuously on real devices
5. Iterate based on feedback

---

*Last Updated: [Current Date]*
*Version: 1.0*

