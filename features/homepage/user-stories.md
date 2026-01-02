# User Stories

**Feature Name:** Immersive Homepage Redesign  
**Version:** 1.0  
**Date:** 2024-12-19  
**Author:** Product Team  
**Status:** Draft  
**Related PRD:** `/features/homepage/prd.md`

---

## 1. Overview

### 1.1 Purpose
This document contains user stories that describe the immersive homepage redesign from the user's perspective.

### 1.2 User Story Format
We use the standard format:
- **As a** [type of user]
- **I want** [goal/desire]
- **So that** [benefit/value]

---

## 2. Epic: Immersive Homepage Experience

### 2.1 Epic Description
Redesign the homepage to create an immersive, full-screen experience with video background, organically scattered photos, and bold centered navigation.

### 2.2 Epic Goals
- Create memorable first impression
- Showcase video work prominently
- Provide intuitive navigation
- Maintain creative brand identity

### 2.3 User Stories

#### US-001: Full-Screen Video Background
- **As a** visitor to the website
- **I want** to see a full-screen video background when I first load the homepage
- **So that** I immediately experience the creative work and get a strong first impression

**Priority:** P0  
**Story Points:** 5  
**Status:** Backlog

**Acceptance Criteria:**
- [ ] Osamason video plays automatically when page loads
- [ ] Video covers entire viewport (100vw x 100vh)
- [ ] Video is muted and loops continuously
- [ ] Video starts playing within 2 seconds of page load
- [ ] Video maintains aspect ratio appropriately
- [ ] Video has fallback if loading fails

**User Flow:**
1. User navigates to homepage
2. Page begins loading
3. Osamason video starts playing automatically
4. Video loops continuously in background
5. User can see video while interacting with page

**Technical Notes:**
- Use HTML5 video element
- Autoplay, loop, muted attributes
- Preload metadata for faster start
- Implement error handling for load failures
- Consider video compression for performance

**Dependencies:**
- Osamason video file must be available
- Video file must be optimized

**Related Requirements:**
- FR-1: Full-screen osamason video background

**Design References:**
- Design Document: `/features/homepage/design-document.md`
- Video file: `/public/videos/osamason3.mov` or similar

**Test Scenarios:**
- Video loads and plays automatically
- Video loops correctly
- Video handles slow connection gracefully
- Video fallback displays on error

---

#### US-002: Organic Photo Scattering Layout
- **As a** visitor to the website
- **I want** to see photos scattered organically across the homepage
- **So that** the layout feels creative and intentional, not rigid or grid-based

**Priority:** P0  
**Story Points:** 8  
**Status:** Backlog

**Acceptance Criteria:**
- [x] Photos are positioned organically (not in grid) - **15 photos displayed**
- [x] Photos have random rotation (-15° to 15°)
- [x] Photos have varied scale (0.8x to 1.2x)
- [x] Photos do not overlap navigation text
- [x] Photos stay within viewport bounds
- [x] Photos do not overlap footer (150px buffer)
- [x] Photos are clickable/interactive
- [x] Photos have hover effects
- [x] Photos cycle independently at random intervals (3-20 seconds)
- [x] Photos change position when cycling (0.9 second transition)
- [x] Minimal overlap allowed for organic layering
- [x] Layout feels intentional, not random

**User Flow:**
1. User loads homepage
2. 15 photos appear scattered across screen
3. Photos have organic positioning with minimal overlap
4. Photos cycle independently, changing position and photo
5. User can hover over photos for effects
6. User can click photos to view in modal

**Technical Notes:**
- Implement positioning algorithm for 15 photos
- Use absolute positioning with independent timers
- Calculate positions to avoid navigation area and footer (150px buffer)
- Allow minimal overlap (maxSize * 1.2 spacing)
- Apply random rotation (-15° to 15°) and scale (0.8x to 1.2x)
- Implement collision detection
- Independent cycle timers (3-20 seconds per photo)
- Position changes on cycle with 0.9 second transition delay
- Add hover effects (scale, brightness)
- Photo sizes: 120-200px (mobile), 180-280px (desktop)

**Dependencies:**
- US-001: Video background (for positioning context)
- US-003: Navigation (for avoiding overlap)
- Photo data from constants

**Related Requirements:**
- FR-2: Organic photo scattering layout

**Design References:**
- Design Document: Photo positioning algorithm
- Photo data: `/src/constants/photos.ts`

**Test Scenarios:**
- 15 photos positioned organically
- No overlap with navigation center area
- No overlap with footer (150px buffer verified)
- Photos stay in viewport bounds
- Photos cycle independently without synchronization
- Position changes work correctly on cycle
- Hover effects work correctly
- Click handlers function properly
- Performance remains smooth with 15 photos and independent timers

---

#### US-003: Centered Bold Navigation
- **As a** visitor to the website
- **I want** to see bold, centered navigation text on the homepage
- **So that** I can easily navigate to Videos, Photos, Other, and Contact sections

**Priority:** P0  
**Story Points:** 5  
**Status:** Backlog

**Acceptance Criteria:**
- [ ] Navigation text is centered on page
- [ ] Navigation text is large and bold (4xl-6xl)
- [ ] Navigation includes: Videos, Photos, Other, Contact
- [ ] Navigation is clearly visible over video background
- [ ] Navigation has hover effects
- [ ] Navigation links work correctly
- [ ] No traditional header/nav bar on homepage

**User Flow:**
1. User loads homepage
2. Bold centered navigation text is visible
3. User hovers over navigation item
4. Navigation item has hover effect
5. User clicks navigation item
6. User navigates to selected page

**Technical Notes:**
- Center navigation using flexbox or absolute positioning
- Use large font size (4xl-6xl responsive)
- Use bold font weight (900)
- Add text shadow for visibility over video
- Implement hover effects (scale, color change)
- Use React Router for navigation

**Dependencies:**
- Route definitions must exist
- React Router must be configured

**Related Requirements:**
- FR-3: Centered bold navigation

**Design References:**
- Design Document: Navigation specifications
- Routes: `/src/constants/routes.ts`

**Test Scenarios:**
- Navigation is centered
- Navigation is visible over video
- Hover effects work
- Links navigate correctly
- Navigation is accessible

---

#### US-004: Background Color Update
- **As a** visitor to the website
- **I want** to see a consistent, updated background color across all pages
- **So that** the site has a cohesive, modern appearance

**Priority:** P0  
**Story Points:** 2  
**Status:** Backlog

**Acceptance Criteria:**
- [ ] Background color updated to #F2F0EF globally
- [ ] Color applied to all pages consistently
- [ ] Color works with existing text colors
- [ ] Color maintains proper contrast
- [ ] Color is defined in Tailwind config

**User Flow:**
1. User navigates to any page
2. Background color is #F2F0EF
3. Color is consistent across all pages

**Technical Notes:**
- Update Tailwind config with new color
- Apply to Layout component
- Update all page components
- Ensure contrast ratios meet accessibility

**Dependencies:**
- None

**Related Requirements:**
- FR-4: Background color update

**Design References:**
- Color system: `/features/redesign2/color-system.md`
- Tailwind config: `/tailwind.config.js`

**Test Scenarios:**
- Background color is #F2F0EF
- Color is consistent across pages
- Contrast ratios are acceptable
- Color works with all text

---

#### US-005: Responsive Design
- **As a** visitor using a mobile device
- **I want** the homepage to work well on my device
- **So that** I can have a good experience regardless of screen size

**Priority:** P1  
**Story Points:** 8  
**Status:** Backlog

**Acceptance Criteria:**
- [ ] Homepage works on mobile (< 768px)
- [ ] Homepage works on tablet (768px - 1024px)
- [ ] Homepage works on desktop (> 1024px)
- [ ] Video scales appropriately
- [ ] Photos resize appropriately
- [ ] Navigation scales appropriately
- [ ] Layout remains usable on all sizes

**User Flow:**
1. User loads homepage on mobile device
2. Video background adapts to screen size
3. Photos resize and reposition appropriately
4. Navigation text scales appropriately
5. User can interact with all elements

**Technical Notes:**
- Use responsive Tailwind classes
- Implement mobile-specific layouts
- Adjust photo sizes for mobile
- Scale navigation text appropriately
- Test on multiple devices

**Dependencies:**
- US-001: Video background
- US-002: Photo layout
- US-003: Navigation

**Related Requirements:**
- FR-5: Responsive design

**Design References:**
- Design Document: Responsive specifications

**Test Scenarios:**
- Mobile layout works correctly
- Tablet layout works correctly
- Desktop layout works correctly
- All elements are accessible on all sizes

---

## 3. Epic: Photo Interaction

### 3.1 Epic Description
Enable interaction with scattered photos on the homepage.

### 3.2 User Stories

#### US-006: Photo Hover Effects
- **As a** visitor to the website
- **I want** photos to respond when I hover over them
- **So that** I know they are interactive and can engage with the content

**Priority:** P1  
**Story Points:** 3  
**Status:** Backlog

**Acceptance Criteria:**
- [ ] Photos scale up on hover (1.05x - 1.1x)
- [ ] Photos have brightness/contrast change on hover
- [ ] Hover effects are smooth (transition)
- [ ] Hover effects work on all devices
- [ ] Cursor changes to pointer on hover

**User Flow:**
1. User hovers over photo
2. Photo scales up slightly
3. Photo brightness/contrast changes
4. Cursor changes to pointer
5. User can see photo is interactive

**Technical Notes:**
- Use CSS transitions or Framer Motion
- Implement scale transform
- Adjust brightness/contrast
- Use pointer cursor
- Ensure smooth animations

**Dependencies:**
- US-002: Photo layout

**Related Requirements:**
- Part of FR-2

**Test Scenarios:**
- Hover effects work correctly
- Animations are smooth
- Effects work on all devices
- Cursor changes appropriately

---

## 4. User Story Map

### 4.1 User Journey
```
User Journey: Homepage Experience
├── Initial Load
│   ├── US-001: Full-Screen Video Background
│   ├── US-002: Organic Photo Scattering Layout
│   ├── US-003: Centered Bold Navigation
│   └── US-004: Background Color Update
├── Interaction
│   ├── US-006: Photo Hover Effects
│   └── US-003: Navigation Click
└── Responsive Experience
    └── US-005: Responsive Design
```

### 4.2 Story Dependencies
```
US-004 (Background Color)
  └── Independent

US-001 (Video Background)
  └── Independent

US-003 (Navigation)
  └── Independent

US-002 (Photo Layout)
  ├── US-001 (for positioning context)
  └── US-003 (to avoid overlap)

US-006 (Photo Hover)
  └── US-002 (requires photo layout)

US-005 (Responsive)
  ├── US-001
  ├── US-002
  └── US-003
```

---

## 5. Personas

### 5.1 Primary Persona: Creative Director
- **Role:** Creative Director at agency
- **Demographics:** 35-45, urban, high visual literacy
- **Goals:** Discover unique video work, evaluate creative style
- **Pain Points:** Wants immediate visual impact, not menu navigation
- **Tech Savviness:** High
- **Related Stories:** US-001, US-002, US-003

### 5.2 Secondary Persona: Potential Client
- **Role:** Marketing Director seeking video production
- **Demographics:** 30-50, business-focused
- **Goals:** Evaluate portfolio quality quickly
- **Pain Points:** Needs easy access to work samples
- **Tech Savviness:** Medium
- **Related Stories:** US-001, US-003, US-005

---

## 6. Story Prioritization

### 6.1 Priority Matrix
| Story ID | Priority | Business Value | Effort | Risk |
|----------|----------|----------------|--------|------|
| US-001 | P0 | High | Medium | Low |
| US-002 | P0 | High | High | Medium |
| US-003 | P0 | High | Medium | Low |
| US-004 | P0 | Medium | Low | Low |
| US-005 | P1 | High | High | Medium |
| US-006 | P1 | Medium | Low | Low |

### 6.2 Release Planning
- **Release 1.0 (MVP):**
  - US-001: Full-Screen Video Background
  - US-002: Organic Photo Scattering Layout
  - US-003: Centered Bold Navigation
  - US-004: Background Color Update
  
- **Release 1.1:**
  - US-005: Responsive Design
  - US-006: Photo Hover Effects

---

## 7. Edge Cases and Error Scenarios

### 7.1 Edge Cases
| Story ID | Edge Case | Handling |
|----------|-----------|----------|
| US-001 | Video fails to load | Show fallback gradient/image |
| US-001 | Slow connection | Progressive loading, show loading state |
| US-002 | No photos available | Show navigation only |
| US-002 | Too many photos | Limit number displayed, prioritize featured |
| US-003 | Navigation text too long | Truncate or wrap appropriately |
| US-005 | Very small screen | Stack navigation, reduce photo count |

### 7.2 Error Scenarios
| Story ID | Error Scenario | User Experience |
|----------|----------------|-----------------|
| US-001 | Video load error | Show fallback, continue with layout |
| US-002 | Photo load error | Skip failed photos, continue with others |
| US-003 | Route not found | Show 404 page, maintain navigation |
| US-005 | Layout breaks on device | Graceful degradation, maintain functionality |

---

## 8. Definition of Done

### 8.1 Story Completion Criteria
- [ ] Code implemented and reviewed
- [ ] Unit tests written and passing
- [ ] Integration tests written and passing
- [ ] Acceptance criteria met
- [ ] Design review completed
- [ ] Documentation updated
- [ ] QA testing passed
- [ ] Product owner approval
- [ ] Performance targets met
- [ ] Accessibility requirements met

---

## 9. Story Status Tracking

| Story ID | Status | Assigned To | Sprint | Completion Date |
|----------|--------|-------------|--------|----------------|
| US-001 | Backlog | - | - | - |
| US-002 | Backlog | - | - | - |
| US-003 | Backlog | - | - | - |
| US-004 | Backlog | - | - | - |
| US-005 | Backlog | - | - | - |
| US-006 | Backlog | - | - | - |

---

## 10. Open Questions

- [ ] Exact number of photos to display on homepage? - Owner: Design Team
- [ ] Should photos be clickable or just decorative? - Owner: Product Team
- [ ] Exact positioning algorithm parameters? - Owner: Engineering Team
- [ ] Should video have overlay effects? - Owner: Design Team
- [ ] Animation timing and easing preferences? - Owner: Design Team

---

## 11. References

- PRD: `/features/homepage/prd.md`
- Design Document: `/features/homepage/design-document.md`
- Current Homepage: `/src/pages/HomePage.tsx`
- Photo Data: `/src/constants/photos.ts`
- Video Data: `/src/constants/videos.ts`

---

## 12. Change Log

| Date | Story ID | Change | Author |
|------|----------|--------|--------|
| 2024-12-19 | - | Initial creation | Product Team |

