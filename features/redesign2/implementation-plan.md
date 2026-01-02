# Redesign 2 - Implementation Plan

## Phase 1: Planning & Setup

### Step 1.1: Create Planning Documents ✅
- [x] Create redesign2 folder in features/
- [x] Create README.md
- [x] Create design-brief.md
- [x] Create color-system.md
- [x] Create page-specifications.md
- [x] Create component-changes.md
- [x] Create implementation-plan.md

### Step 1.2: Update Tailwind Config
- [ ] Add off-white background colors
- [ ] Add dark text colors
- [ ] Update color system
- [ ] Test color combinations

### Step 1.3: Update Route Structure
- [ ] Add /work route (hub)
- [ ] Add /work/videos route
- [ ] Add /work/photos route
- [ ] Add /other route
- [ ] Update route constants

## Phase 2: Core Layout Changes

### Step 2.1: Update Layout Component
- [ ] Change background to off-white (#C9C8C7)
- [ ] Invert text colors (dark on light)
- [ ] Test contrast and readability
- [ ] Ensure MinimalNav remains unchanged

### Step 2.2: Update Global Styles
- [ ] Update CSS variables if used
- [ ] Update default text colors
- [ ] Update background colors
- [ ] Test across all pages

## Phase 3: Page Implementations

### Step 3.1: Home Page
- [ ] Update background to off-white
- [ ] Invert text colors
- [ ] Update VideoCard colors
- [ ] Test video grid on light background
- [ ] Adjust glitch effects for light background

### Step 3.2: Work Hub Page (NEW)
- [ ] Create WorkPage.tsx component
- [ ] Design two clickable sections (Videos/Photos)
- [ ] Add arrow indicators
- [ ] Implement hover effects
- [ ] Add routing to Videos/Photos pages
- [ ] Test navigation flow

### Step 3.3: Videos Page (NEW)
- [ ] Create VideosPage.tsx component
- [ ] Implement video grid
- [ ] Add minimal header
- [ ] Update VideoCard for light background
- [ ] Test video modal
- [ ] Ensure video-first approach

### Step 3.4: Photos Page (NEW)
- [ ] Create PhotosPage.tsx component
- [ ] Create PhotoGrid component
- [ ] Create PhotoCard component
- [ ] Implement photo grid
- [ ] Add minimal header
- [ ] Test photo modal

### Step 3.5: Other Page - LOST FILES (NEW)
- [ ] Create OtherPage.tsx component
- [ ] Create LostFilesHero component
- [ ] Implement massive "LOST FILES" text
- [ ] Add glitch effects (continuous)
- [ ] Implement color channel separation
- [ ] Add position glitches
- [ ] Add opacity flickers
- [ ] Add scan lines
- [ ] Test glitch animations
- [ ] Ensure striking visual impact

### Step 3.6: Contact Page
- [x] Update background to black with intense grain texture (3 layers)
- [x] Update text to white on dark background
- [x] Update form inputs (black with white text and white borders)
- [x] Add glitch effects on form field focus
- [x] Implement experimental layout (name/email side by side on desktop)
- [x] Add sequential fade-in animations
- [x] Update Instagram handle to @imanol.villagomez
- [x] Add clickable email and Instagram links
- [ ] Test form functionality

## Phase 4: Component Updates

### Step 4.1: Video Components
- [ ] Update VideoCard for light background
- [ ] Update VideoGrid for light background
- [ ] Update VideoModal (decide on background)
- [ ] Adjust glitch effects
- [ ] Update hover states
- [ ] Test all video interactions

### Step 4.2: UI Components
- [ ] Update GlitchText for light background
- [ ] Enhance GlitchText for "LOST FILES"
- [ ] Update GrainTexture opacity
- [ ] Update FlashOverlay
- [ ] Update GlitchOverlay
- [ ] Test all effects on light background

### Step 4.3: Navigation
- [ ] Ensure MinimalNav unchanged (as requested)
- [ ] Test navigation flow
- [ ] Verify Work hub navigation
- [ ] Test arrow indicators
- [ ] Test all route transitions

## Phase 5: Polish & Testing

### Step 5.1: Visual Polish
- [ ] Review all pages for consistency
- [ ] Check contrast ratios (WCAG AA)
- [ ] Adjust spacing for light background
- [ ] Test glitch effects intensity
- [ ] Ensure "LOST FILES" is striking

### Step 5.2: Functionality Testing
- [ ] Test all navigation flows
- [ ] Test Work hub → Videos/Photos
- [ ] Test video modal
- [ ] Test photo modal
- [ ] Test contact form
- [ ] Test responsive design

### Step 5.3: Performance
- [ ] Optimize glitch animations
- [ ] Test page load times
- [ ] Optimize image/video loading
- [ ] Test on different devices

## Phase 6: Documentation

### Step 6.1: Update Documentation
- [ ] Document new page structure
- [ ] Document color system changes
- [ ] Document component changes
- [ ] Update README if needed

### Step 6.2: Code Review
- [ ] Review all changes
- [ ] Ensure code quality
- [ ] Check for unused code
- [ ] Optimize imports

## Implementation Order

1. **Setup** (Phase 1)
   - Tailwind config
   - Route structure
   - Planning docs

2. **Foundation** (Phase 2)
   - Layout component
   - Global styles
   - Color system

3. **Pages** (Phase 3)
   - Home (update)
   - Work Hub (new)
   - Videos (new)
   - Photos (new)
   - Other/LOST FILES (new)
   - Contact (update)

4. **Components** (Phase 4)
   - Video components
   - UI components
   - Navigation

5. **Polish** (Phase 5)
   - Visual polish
   - Testing
   - Performance

6. **Documentation** (Phase 6)
   - Documentation
   - Code review

## Success Criteria

- [ ] Off-white background (#C9C8C7) implemented across all pages
- [ ] Dark text on light background (readable, high contrast)
- [ ] Work hub page with Videos/Photos navigation
- [ ] Arrow indicators for navigation
- [ ] "LOST FILES" hero is striking and glitchy
- [ ] MinimalNav styling unchanged
- [ ] All pages functional and tested
- [ ] Video-first approach maintained
- [ ] Experimental aesthetic preserved
- [ ] Responsive design works

## Notes

- Keep MinimalNav exactly as is (user request)
- "LOST FILES" should be unforgettable
- Work hub should be intuitive
- Maintain video-first philosophy
- Preserve experimental aesthetic
- Ensure accessibility (contrast ratios)

