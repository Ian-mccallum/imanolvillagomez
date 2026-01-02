# Product Requirements Document (PRD)

**Feature Name:** UI Redesign - Imanol Villagomez Videography Portfolio  
**Version:** 1.0  
**Date:** 2024-12-28  
**Author:** Creative Director (Carson-Oliver-West-Weirdcore Collaboration)  
**Status:** Draft  
**Related Documents:** 
- Design Document: `features/redesign.md`
- User Stories: `features/ui-redesign-user-stories.md`
- Use Cases: `features/ui-redesign-use-cases.md`

---

## 1. Executive Summary

### 1.1 Overview

This PRD outlines the comprehensive UI redesign of Imanol Villagomez's videography portfolio website. The redesign transforms the interface into an unforgettable, culturally impactful experience that embodies experimental design philosophy (Carson-Oliver-West-Weirdcore methodology) while maintaining existing navigation styling and font system. The core principle is video-first: videos must dominate through quantity and presence, not individual size, creating a Pinterest/scrapbook moodboard aesthetic.

### 1.2 Business Objectives

- **Create Cultural Impact**: Design that's memorable, shareable, and screenshot-worthy
- **Showcase Video Work**: Videos are the main event, dominating 80% of visual weight
- **Establish Brand Identity**: Experimental, bold design that reflects Imanol's unique creative vision
- **Improve User Experience**: Intuitive browsing through many videos in scrapbook/moodboard style
- **Maintain Performance**: Fast, responsive interface despite visual richness

### 1.3 Success Metrics

| Metric | Target | Measurement Method |
|--------|--------|-------------------|
| Video Visibility | 3-4 videos per row on desktop | Visual inspection, layout testing |
| Visual Weight Distribution | Videos 80%, Metadata 15%, Nav 5% | Design review, visual analysis |
| Page Load Time | < 3 seconds on 3G | Lighthouse performance testing |
| User Engagement | Increased video click-through rate | Analytics tracking |
| Design Memorable Factor | Shareable, screenshot-worthy | User feedback, social sharing |

---

## 2. Problem Statement

### 2.1 Current State

The current portfolio website has a solid foundation with dark theme, paper cutout cards, and glitch effects. However, it suffers from:

- **Layout Constraints**: 2-per-row layout feels constrained, not truly scrapbook-like
- **Video Sizing**: Videos are too large individually, preventing many from being visible
- **Missing Aesthetic Elements**: Underutilized indie sleaze and gore core elements
- **Limited Visual Interest**: Cards need more personality while being appropriately sized
- **Typography Limitations**: Need more experimental variation while maintaining readability

### 2.2 User Pain Points

- **Difficult to Browse**: Too few videos visible at once, requires excessive scrolling
- **No Visual Flow**: Current layout doesn't feel like browsing a moodboard/scrapbook
- **Lacks Personality**: Design doesn't fully embody experimental, bold aesthetic
- **Missing Aesthetic Cohesion**: Elements exist but don't come together cohesively

### 2.3 Business Impact

Without this redesign, the portfolio fails to:
- Stand out in a competitive creative industry
- Properly showcase the volume and variety of video work
- Create the memorable, shareable experience needed for viral potential
- Establish Imanol's unique creative brand identity

---

## 3. Target Users

### 3.1 Primary Users

- **Potential Clients (Music Artists, Labels, Brands)**
  - Demographics: Ages 18-45, creative industry professionals
  - Goals: Quickly browse video portfolio, assess style and quality
  - Pain Points: Need to see variety quickly, want to understand creative vision
  - Tech Savviness: High (familiar with modern web experiences)

- **Industry Peers (Other Videographers, Directors)**
  - Demographics: Ages 20-50, creative professionals
  - Goals: See innovative design, get inspired, understand trends
  - Pain Points: Want to see experimental design done well
  - Tech Savviness: High

- **Fans/Viewers (Casual Browsers)**
  - Demographics: Ages 16-40, music/art enthusiasts
  - Goals: Discover interesting videos, enjoy visual experience
  - Pain Points: Want engaging, memorable browsing experience
  - Tech Savviness: Medium to High

### 3.2 Secondary Users

- Social media users discovering portfolio through shares
- Press/media looking for portfolio screenshots
- Students/educators studying creative portfolio design

---

## 4. Feature Description

### 4.1 Feature Overview

The UI redesign transforms the portfolio into a Pinterest/scrapbook-style moodboard where many appropriately-sized videos (300-500px width) fill the entire page. The design embodies four creative philosophies:

1. **Carson (Experimental Typography)**: Break typography rules, asymmetrical layouts, overlapping elements
2. **Oliver (Dark Beauty)**: Pure black backgrounds, distressed textures, videos as light
3. **West (Minimalist Perfectionism)**: Reduce to essentials, bold statements, iconic design
4. **Weirdcore (Glitch as Art)**: Intentional digital artifacts, RGB channel separation, scan lines

### 4.2 Key Capabilities

1. **True Masonry Layout**: 3-4 columns on desktop, many videos visible simultaneously
2. **Standard Video Sizing**: 300-500px width cards, allowing quantity over individual size
3. **Experimental Typography**: Overlapping text, rotations, extreme sizes, handwritten elements
4. **Enhanced Visual Effects**: Indie sleaze grain, flash photography effects, gore core accents
5. **Intentional Glitch System**: RGB channel separation, scan lines, purposeful digital artifacts
6. **Asymmetrical Page Layouts**: Break centered conventions, create dynamic compositions

### 4.3 User Value Proposition

Users get an unforgettable browsing experience that:
- Showcases the full breadth of video work through quantity
- Creates a memorable, shareable design that stands out
- Makes browsing feel like exploring a visual diary/moodboard
- Embodies experimental design while remaining functional
- Establishes Imanol's unique creative brand identity

---

## 5. Functional Requirements

### 5.1 Core Features

- **FR-1: Masonry Video Grid Layout**
  - Priority: P0 (Critical)
  - Dependencies: None
  - Description: Implement true Pinterest-style masonry layout with 3-4 columns on desktop, many videos filling the page
  - Acceptance Criteria:
    - Videos flow in columns naturally (CSS columns or grid)
    - 3-4 videos per row on desktop (standard sizing)
    - Videos appropriately sized (300-500px width)
    - Layout responsive across all breakpoints

- **FR-2: Standard Video Card Sizing**
  - Priority: P0 (Critical)
  - Dependencies: FR-1
  - Description: Redesign video cards to standard sizing (300-500px width) allowing many videos per screen
  - Acceptance Criteria:
    - Video cards are 300-500px width on desktop
    - Cards maintain aspect ratio (16:9 or variable)
    - Many videos visible simultaneously
    - Cards are substantial but not individually dominant

- **FR-3: Experimental Typography System**
  - Priority: P1 (High)
  - Dependencies: None
  - Description: Implement experimental typography overlays, rotations, handwritten elements
  - Acceptance Criteria:
    - Page titles can be rotated slightly (-0.5deg to -2deg)
    - Handwritten-style text overlays on video cards
    - Overlapping text elements where appropriate
    - Typography serves videos, doesn't compete

- **FR-4: Enhanced Visual Effects**
  - Priority: P1 (High)
  - Dependencies: FR-2
  - Description: Add indie sleaze grain, flash photography effects, gore core accents
  - Acceptance Criteria:
    - Grain texture overlay on all video cards
    - Flash photography effect on hover (overexposed)
    - Red accent borders for featured videos (gore core)
    - Distressed textures applied appropriately

- **FR-5: Intentional Glitch System**
  - Priority: P1 (High)
  - Dependencies: FR-2
  - Description: Implement RGB channel separation, scan lines, purposeful glitch effects
  - Acceptance Criteria:
    - RGB channel separation on text glitches
    - Scan lines overlay in video modal
    - Glitch effects triggered on hover (intentional, not random)
    - Effects enhance videos, don't distract

- **FR-6: Asymmetrical Page Layouts**
  - Priority: P2 (Medium)
  - Dependencies: FR-3
  - Description: Break centered conventions, create dynamic compositions on About and Contact pages
  - Acceptance Criteria:
    - About page uses asymmetrical layout
    - Contact page uses experimental form layout
    - Pages feel dynamic, not static
    - Maintains readability despite asymmetry

### 5.2 User Flows

**Primary Flow: Browse Video Portfolio**
1. User lands on homepage/work page
2. Immediately sees many videos in masonry layout (no hero section)
3. Scrolls through video grid, many videos visible at once
4. Clicks on video card
5. Video modal opens with zoom-in animation from clicked position
6. User watches video in full-screen modal
7. Closes modal, returns to grid
8. Continues browsing through many more videos

**Secondary Flow: Explore About Page**
1. User clicks "ABOUT" in navigation
2. Sees asymmetrical layout with experimental typography
3. Reads about Imanol with visual interest (grain, glitch effects)
4. Clicks "LET'S WORK" CTA
5. Redirected to contact page

### 5.3 Edge Cases

- **Empty State**: No videos available - show creative empty state message
- **Single Video**: Layout gracefully handles single video
- **Very Long Titles**: Text truncation with ellipsis
- **Missing Thumbnails**: Fallback placeholder with video icon
- **Slow Network**: Lazy loading, progressive image loading
- **Small Screen**: Responsive breakpoints ensure usability on mobile
- **Keyboard Navigation**: All interactive elements keyboard accessible

---

## 6. Non-Functional Requirements

### 6.1 Performance

- **Page Load Time**: < 3 seconds on 3G connection (Lighthouse score > 90)
- **Video Thumbnail Loading**: Lazy load images below fold
- **Animation Performance**: 60fps animations using GPU-accelerated properties
- **Bundle Size**: Minimal JavaScript bundle, code-split heavy components

### 6.2 Scalability

- **Video Count**: Layout handles 10-100+ videos efficiently
- **Grid Performance**: CSS columns (native) or lightweight masonry library
- **Image Optimization**: Responsive images, WebP format where supported

### 6.3 Reliability

- **Error Handling**: Graceful fallbacks for missing thumbnails, broken videos
- **Browser Compatibility**: Works on modern browsers (Chrome, Firefox, Safari, Edge)
- **Progressive Enhancement**: Core functionality works without JavaScript

### 6.4 Usability

- **Video-First Hierarchy**: Videos 80%, Metadata 15%, Nav 5% visual weight
- **Intuitive Browsing**: Clear that videos are clickable, easy to browse
- **Fast Interaction**: Hover states respond immediately (< 100ms)
- **Clear Visual Feedback**: Hover effects, loading states, transitions

### 6.5 Accessibility

- **Keyboard Navigation**: All interactive elements keyboard accessible
- **Screen Reader Support**: Proper ARIA labels, semantic HTML
- **Color Contrast**: WCAG AA minimum (4.5:1 for text)
- **Focus Indicators**: Clear focus states for keyboard navigation
- **Alt Text**: Descriptive alt text for video thumbnails

---

## 7. Out of Scope

- **Navigation Bar Styling**: Navigation bar styling to remain unchanged (preserved)
- **Font System Changes**: Current system font stack to remain unchanged (preserved)
- **Backend/API Changes**: No changes to backend, APIs, or data structure
- **Video Content Changes**: No changes to actual video files or content
- **Authentication/Admin Features**: No admin panel or authentication features
- **Video Upload Functionality**: No video upload/management features
- **Search/Filter Functionality**: Out of scope for initial redesign (future enhancement)
- **Video Analytics**: No analytics tracking in this phase
- **Social Sharing**: No social sharing buttons (future enhancement)

---

## 8. Dependencies

### 8.1 Technical Dependencies

- **Framer Motion**: Already in use for animations
- **Tailwind CSS**: Already configured, may need extensions
- **React**: Current framework, no changes needed
- **Video Files**: Existing video assets in `/public/videos/`

### 8.2 External Dependencies

- **Modern Browser Support**: CSS columns, CSS Grid, modern JavaScript features
- **Image Optimization**: May need image optimization service (optional)

### 8.3 Blocking Dependencies

- None - all dependencies already in place

---

## 9. Assumptions

- Users have modern browsers with CSS Grid/Columns support
- Video files are already optimized and hosted
- Design system (colors, typography) can be extended in Tailwind config
- Existing component structure can be refactored without breaking changes
- Navigation and font systems remain unchanged as specified

---

## 10. Risks and Mitigations

| Risk | Impact | Probability | Mitigation Strategy |
|------|--------|-------------|---------------------|
| Masonry layout performance with many videos | High | Medium | Use CSS columns (native, performant) or lightweight JS library; implement virtualization if needed |
| Experimental design too unconventional | Medium | Medium | Balance experimentation with usability; user test early; provide fallbacks |
| Typography too experimental (readability) | Medium | Low | Test readability; ensure WCAG AA contrast; provide readable fallbacks |
| Glitch effects affecting performance | Low | Low | Use CSS transforms (GPU-accelerated); avoid expensive filters; test on lower-end devices |
| Dark theme accessibility issues | Medium | Low | Ensure sufficient contrast ratios (WCAG AA minimum); test with screen readers |

---

## 11. Timeline and Milestones

### 11.1 Phases

- **Phase 1: Foundation (Week 1)** - Color system, typography, spacing, animation presets
- **Phase 2: Video Grid Redesign (Week 2)** - Masonry layout, video card redesign, overlays
- **Phase 3: Page Redesigns (Week 3)** - Work page, About page, Contact page, modals
- **Phase 4: Polish & Refinement (Week 4)** - Animations, responsive testing, accessibility, performance

### 11.2 Key Milestones

- **M1: Foundation Complete** - Week 1 end (design tokens ready)
- **M2: Video Grid Functional** - Week 2 end (masonry layout working)
- **M3: All Pages Redesigned** - Week 3 end (all pages updated)
- **M4: Production Ready** - Week 4 end (polished, tested, deployed)

---

## 12. Success Criteria

### 12.1 Launch Criteria

- [ ] Masonry layout displays 3-4 videos per row on desktop
- [ ] Videos are appropriately sized (300-500px width)
- [ ] Visual weight distribution: Videos 80%, Metadata 15%, Nav 5%
- [ ] Page load time < 3 seconds on 3G
- [ ] All pages redesigned with experimental aesthetic
- [ ] Accessibility requirements met (WCAG AA)
- [ ] Cross-browser testing passed
- [ ] Performance benchmarks met (Lighthouse score > 90)

### 12.2 Post-Launch Validation

- **Analytics**: Track video click-through rate, time on page, scroll depth
- **User Feedback**: Collect feedback on design memorability and usability
- **Social Sharing**: Monitor screenshots/shares of design
- **Performance Monitoring**: Track page load times, animation performance

---

## 13. Open Questions

- [ ] **Masonry Implementation**: CSS Columns vs CSS Grid vs JavaScript library? (Decision needed: Week 1)
- [ ] **Section Organization**: Keep sections (Edits/Artists) or fully organic flow? (Decision needed: Week 1)
- [ ] **Featured Videos**: How to distinguish featured videos (size, badge, border)? (Decision needed: Week 2)
- [ ] **Color Accent**: Primary accent color (green Brat vs red Gore Core)? (Decision needed: Week 1)
- [ ] **Typography Rotation**: How much rotation is too much for readability? (Decision needed: Week 1)

---

## 14. References

- Design Document: `features/redesign.md`
- User Stories: `features/ui-redesign-user-stories.md`
- Use Cases: `features/ui-redesign-use-cases.md`
- Requirements Mapping: `features/ui-redesign-requirements-mapping.md`
- Current Codebase: `src/components/`, `src/pages/`
- Design System: `tailwind.config.js`, `src/index.css`

---

## 15. Approval

| Role | Name | Date | Signature |
|------|------|------|-----------|
| Product Owner (Imanol Villagomez) | | | |
| Creative Director | AI (Carson-Oliver-West-Weirdcore) | 2024-12-28 | |
| Engineering Lead | | | |
| Design Lead | | | |

---

> "Videos first. Everything else is secondary." — Video-First Philosophy

