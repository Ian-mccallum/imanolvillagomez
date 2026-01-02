# Requirements Mapping Document

**Feature Name:** UI Redesign - Imanol Villagomez Videography Portfolio  
**Version:** 1.0  
**Date:** 2024-12-28  
**Author:** Creative Director (Carson-Oliver-West-Weirdcore Collaboration)  
**Status:** Draft  
**Related PRD:** `features/ui-redesign-prd.md`

---

## 1. Overview

### 1.1 Purpose

This document maps business requirements to technical requirements for the UI redesign, ensuring traceability and completeness.

### 1.2 Scope

This document covers all functional and non-functional requirements for the UI redesign, mapping business needs to technical implementation.

---

## 2. Requirements Traceability Matrix

| Business Requirement ID | Business Requirement Description | Technical Requirement ID | Technical Requirement Description | Design Document Section | Implementation Status | Test Case ID |
|------------------------|----------------------------------|---------------------------|-----------------------------------|-------------------------|----------------------|--------------|
| BR-FR-1 | Masonry video grid layout with many videos | TR-001 | Implement CSS columns/grid masonry layout | Section 6.1 | Backlog | TC-001 |
| BR-FR-2 | Standard video card sizing (300-500px) | TR-002 | Redesign VideoCard component with standard sizing | Section 5.2 | Backlog | TC-002 |
| BR-FR-3 | Experimental typography system | TR-003 | Implement typography overlays, rotations, handwritten elements | Section 8.3 | Backlog | TC-003 |
| BR-FR-4 | Enhanced visual effects (grain, glitch, textures) | TR-004 | Implement grain texture, glitch effects, flash photography | Section 8.1 | Backlog | TC-004 |
| BR-FR-5 | Intentional glitch system | TR-005 | Implement RGB channel separation, scan lines | Section 11 | Backlog | TC-005 |
| BR-FR-6 | Asymmetrical page layouts | TR-006 | Break centered conventions, create dynamic compositions | Section 5.3, 5.4 | Backlog | TC-006 |
| BR-NFR-1 | Page load time < 3 seconds | TR-NFR-001 | Optimize bundle size, lazy loading, image optimization | Section 13.3 | Backlog | TC-007 |
| BR-NFR-2 | 60fps animations | TR-NFR-002 | Use GPU-accelerated CSS properties | Section 7 | Backlog | TC-008 |
| BR-NFR-3 | WCAG AA accessibility | TR-NFR-003 | Ensure contrast ratios, keyboard navigation, ARIA labels | Section 6.5 | Backlog | TC-009 |

---

## 3. Business Requirements

### 3.1 Functional Requirements

#### BR-FR-001: Masonry Video Grid Layout

- **Description:** Implement true Pinterest-style masonry layout with 3-4 columns on desktop, many videos filling the page
- **Priority:** P0 (Critical)
- **Source:** PRD Section 5.1, User Story US-001
- **Acceptance Criteria:**
  - Videos flow in columns naturally (CSS columns or grid)
  - 3-4 videos per row on desktop (standard sizing)
  - Videos appropriately sized (300-500px width)
  - Layout responsive across all breakpoints
- **Mapped Technical Requirements:** TR-001

#### BR-FR-002: Standard Video Card Sizing

- **Description:** Redesign video cards to standard sizing (300-500px width) allowing many videos per screen
- **Priority:** P0 (Critical)
- **Source:** PRD Section 5.1, User Story US-001
- **Acceptance Criteria:**
  - Video cards are 300-500px width on desktop
  - Cards maintain aspect ratio (16:9 or variable)
  - Many videos visible simultaneously
  - Cards are substantial but not individually dominant
- **Mapped Technical Requirements:** TR-002

#### BR-FR-003: Experimental Typography System

- **Description:** Implement experimental typography overlays, rotations, handwritten elements
- **Priority:** P1 (High)
- **Source:** PRD Section 5.1, User Story US-004
- **Acceptance Criteria:**
  - Page titles can be rotated slightly (-0.5deg to -2deg)
  - Handwritten-style text overlays on video cards
  - Overlapping text elements where appropriate
  - Typography serves videos, doesn't compete
- **Mapped Technical Requirements:** TR-003

#### BR-FR-004: Enhanced Visual Effects

- **Description:** Add indie sleaze grain, flash photography effects, gore core accents
- **Priority:** P1 (High)
- **Source:** PRD Section 5.1, User Story US-003
- **Acceptance Criteria:**
  - Grain texture overlay on all video cards
  - Flash photography effect on hover (overexposed)
  - Red accent borders for featured videos (gore core)
  - Distressed textures applied appropriately
- **Mapped Technical Requirements:** TR-004

#### BR-FR-005: Intentional Glitch System

- **Description:** Implement RGB channel separation, scan lines, purposeful glitch effects
- **Priority:** P1 (High)
- **Source:** PRD Section 5.1
- **Acceptance Criteria:**
  - RGB channel separation on text glitches
  - Scan lines overlay in video modal
  - Glitch effects triggered on hover (intentional, not random)
  - Effects enhance videos, don't distract
- **Mapped Technical Requirements:** TR-005

#### BR-FR-006: Asymmetrical Page Layouts

- **Description:** Break centered conventions, create dynamic compositions on About and Contact pages
- **Priority:** P2 (Medium)
- **Source:** PRD Section 5.1, User Story US-005, US-006
- **Acceptance Criteria:**
  - About page uses asymmetrical layout
  - Contact page uses experimental form layout
  - Pages feel dynamic, not static
  - Maintains readability despite asymmetry
- **Mapped Technical Requirements:** TR-006

### 3.2 Non-Functional Requirements

#### BR-NFR-001: Performance - Page Load Time

- **Description:** Page load time must be < 3 seconds on 3G connection
- **Priority:** P0 (Critical)
- **Mapped Technical Requirements:** TR-NFR-001

#### BR-NFR-002: Performance - Animation Frame Rate

- **Description:** All animations must run at 60fps
- **Priority:** P1 (High)
- **Mapped Technical Requirements:** TR-NFR-002

#### BR-NFR-003: Accessibility - WCAG AA

- **Description:** Meet WCAG AA accessibility standards
- **Priority:** P1 (High)
- **Mapped Technical Requirements:** TR-NFR-003

---

## 4. Technical Requirements

### 4.1 Functional Technical Requirements

#### TR-001: Masonry Grid Layout Implementation

- **Description:** Implement CSS columns or CSS Grid masonry layout for video grid
- **Type:** Functional
- **Priority:** P0 (Critical)
- **Maps to Business Requirements:** BR-FR-001
- **Dependencies:** None
- **Implementation Notes:**
  - Use CSS columns (native, performant) as primary approach
  - Fallback to CSS Grid if columns insufficient
  - Ensure proper break-inside-avoid for video cards
  - Responsive breakpoints: 1 column mobile, 2 tablet, 3-4 desktop
- **Design Document Reference:** Section 6.1 (Masonry Grid System)
- **Files:** `src/components/video/MasonryGrid.tsx`

#### TR-002: VideoCard Component Redesign

- **Description:** Redesign VideoCard component with standard sizing (300-500px width)
- **Type:** Functional
- **Priority:** P0 (Critical)
- **Maps to Business Requirements:** BR-FR-002
- **Dependencies:** TR-001
- **Implementation Notes:**
  - Standard sizing: 300-500px width on desktop
  - Maintain aspect ratio (16:9 or variable)
  - Remove massive/large size options
  - Ensure cards are substantial but allow many per screen
- **Design Document Reference:** Section 5.2 (Video Card Component Redesign)
- **Files:** `src/components/video/VideoCard.tsx`, `src/components/video/PaperCutoutCard.tsx`

#### TR-003: Typography System Implementation

- **Description:** Implement experimental typography overlays, rotations, handwritten elements
- **Type:** Functional
- **Priority:** P1 (High)
- **Maps to Business Requirements:** BR-FR-003
- **Dependencies:** None
- **Implementation Notes:**
  - Create HandwrittenText component enhancements
  - Add rotation utilities to Tailwind config
  - Implement typography overlays on video cards
  - Ensure readability despite experimental styling
- **Design Document Reference:** Section 8.3 (Typography Overlays)
- **Files:** `src/components/ui/HandwrittenText.tsx`, `tailwind.config.js`

#### TR-004: Visual Effects Implementation

- **Description:** Implement grain texture, flash photography effects, gore core accents
- **Type:** Functional
- **Priority:** P1 (High)
- **Maps to Business Requirements:** BR-FR-004
- **Dependencies:** TR-002
- **Implementation Notes:**
  - Enhance GrainTexture component (more prominent)
  - Create FlashOverlay component (indie sleaze)
  - Add red accent borders for featured videos
  - Ensure effects performant (CSS-based, GPU-accelerated)
- **Design Document Reference:** Section 8.1 (Video Card Enhancements), Section 9 (Indie Sleaze Integration)
- **Files:** `src/components/ui/GrainTexture.tsx`, `src/components/ui/FlashOverlay.tsx` (new)

#### TR-005: Glitch System Implementation

- **Description:** Implement RGB channel separation, scan lines, purposeful glitch effects
- **Type:** Functional
- **Priority:** P1 (High)
- **Maps to Business Requirements:** BR-FR-005
- **Dependencies:** TR-002
- **Implementation Notes:**
  - Enhance GlitchText component (RGB channel separation)
  - Enhance GlitchOverlay component (more intentional)
  - Enhance ScanLines component (subtle CRT effect)
  - Ensure glitches are intentional, not random
- **Design Document Reference:** Section 11 (Glitch Aesthetic Refinement)
- **Files:** `src/components/ui/GlitchText.tsx`, `src/components/ui/GlitchOverlay.tsx`, `src/components/ui/ScanLines.tsx`

#### TR-006: Asymmetrical Layout Implementation

- **Description:** Break centered conventions, create dynamic compositions on About and Contact pages
- **Type:** Functional
- **Priority:** P2 (Medium)
- **Maps to Business Requirements:** BR-FR-006
- **Dependencies:** TR-003
- **Implementation Notes:**
  - Redesign AboutPage with asymmetrical layout
  - Redesign ContactPage with experimental form layout
  - Use CSS Grid/Flexbox for dynamic compositions
  - Ensure readability despite asymmetry
- **Design Document Reference:** Section 5.3 (About Page Redesign), Section 5.4 (Contact Page Redesign)
- **Files:** `src/pages/AboutPage.tsx`, `src/pages/ContactPage.tsx`

### 4.2 Non-Functional Technical Requirements

#### TR-NFR-001: Performance Optimization

- **Description:** Optimize bundle size, implement lazy loading, optimize images
- **Type:** Non-Functional (Performance)
- **Metric:** Page load time < 3 seconds on 3G, Lighthouse score > 90
- **Maps to Business Requirements:** BR-NFR-001
- **Implementation Notes:**
  - Code-split heavy components
  - Lazy load images below fold
  - Optimize bundle size (tree-shaking, minification)
  - Use WebP images where supported
- **Design Document Reference:** Section 13.3 (Performance Considerations)
- **Files:** `vite.config.ts`, component files

#### TR-NFR-002: Animation Performance

- **Description:** Use GPU-accelerated CSS properties for 60fps animations
- **Type:** Non-Functional (Performance)
- **Metric:** 60fps animations, smooth transitions
- **Maps to Business Requirements:** BR-NFR-002
- **Implementation Notes:**
  - Use CSS transform and opacity (GPU-accelerated)
  - Avoid animating width, height, top, left
  - Use Framer Motion for complex animations
  - Test on lower-end devices
- **Design Document Reference:** Section 7 (Motion & Animation System)
- **Files:** Component files using animations

#### TR-NFR-003: Accessibility Implementation

- **Description:** Ensure WCAG AA accessibility standards
- **Type:** Non-Functional (Accessibility)
- **Metric:** WCAG AA compliance (4.5:1 contrast ratio, keyboard navigation, screen reader support)
- **Maps to Business Requirements:** BR-NFR-003
- **Implementation Notes:**
  - Ensure color contrast ratios (WCAG AA minimum)
  - Implement keyboard navigation
  - Add ARIA labels and semantic HTML
  - Test with screen readers
- **Design Document Reference:** Section 6.5 (Accessibility)
- **Files:** All component files

---

## 5. Requirements Dependencies

### 5.1 Dependency Graph

```
BR-FR-001 (Masonry Layout)
  └── TR-001
      └── TR-002 (Video Card Sizing)
          ├── TR-004 (Visual Effects)
          └── TR-005 (Glitch System)

BR-FR-003 (Typography)
  └── TR-003
      └── TR-006 (Asymmetrical Layouts)

BR-NFR-001 (Performance)
  └── TR-NFR-001

BR-NFR-002 (Animation Performance)
  └── TR-NFR-002

BR-NFR-003 (Accessibility)
  └── TR-NFR-003
```

### 5.2 Critical Path

**Critical Path (P0 Requirements):**
1. TR-001: Masonry Grid Layout Implementation
2. TR-002: VideoCard Component Redesign
3. TR-NFR-001: Performance Optimization
4. TR-NFR-003: Accessibility Implementation

**Secondary Path (P1 Requirements):**
1. TR-003: Typography System Implementation
2. TR-004: Visual Effects Implementation
3. TR-005: Glitch System Implementation
4. TR-NFR-002: Animation Performance

**Tertiary Path (P2 Requirements):**
1. TR-006: Asymmetrical Layout Implementation

---

## 6. Requirements by Component

### 6.1 Frontend Requirements

| Requirement ID | Description | Component | Status |
|----------------|-------------|-----------|--------|
| TR-001 | Masonry grid layout | MasonryGrid.tsx | Backlog |
| TR-002 | Standard video card sizing | VideoCard.tsx, PaperCutoutCard.tsx | Backlog |
| TR-003 | Typography system | HandwrittenText.tsx, tailwind.config.js | Backlog |
| TR-004 | Visual effects | GrainTexture.tsx, FlashOverlay.tsx (new) | Backlog |
| TR-005 | Glitch system | GlitchText.tsx, GlitchOverlay.tsx, ScanLines.tsx | Backlog |
| TR-006 | Asymmetrical layouts | AboutPage.tsx, ContactPage.tsx | Backlog |
| TR-NFR-002 | Animation performance | All animated components | Backlog |
| TR-NFR-003 | Accessibility | All components | Backlog |

### 6.2 Configuration Requirements

| Requirement ID | Description | Configuration File | Status |
|----------------|-------------|-------------------|--------|
| TR-001 | CSS columns/grid configuration | tailwind.config.js, index.css | Backlog |
| TR-003 | Typography utilities | tailwind.config.js | Backlog |
| TR-NFR-001 | Bundle optimization | vite.config.ts | Backlog |

---

## 7. Constraints and Assumptions

### 7.1 Constraints

- **Technical Constraints:**
  - Navigation bar styling must remain unchanged
  - Font system (system fonts stack) must remain unchanged
  - Must work on modern browsers (Chrome, Firefox, Safari, Edge)
  - Must maintain existing React/TypeScript structure

- **Business Constraints:**
  - Must meet WCAG AA accessibility standards
  - Must maintain performance (page load < 3 seconds)
  - Must work with existing video files and structure

- **Regulatory Constraints:**
  - WCAG AA accessibility compliance required

### 7.2 Assumptions

- Videos are pre-loaded and available in `/public/videos/`
- Browser supports CSS Grid, CSS Columns, CSS Transforms
- Framer Motion is available for animations
- Tailwind CSS can be extended with custom utilities
- Backend API exists for form submission (Contact page)

---

## 8. Requirements Validation

### 8.1 Validation Criteria

- [x] All business requirements have at least one technical requirement
- [x] All technical requirements map to at least one business requirement
- [x] All requirements have acceptance criteria
- [x] All requirements have priority assigned
- [x] Dependencies are identified
- [x] Implementation files are identified

### 8.2 Gaps and Issues

| Gap/Issue | Impact | Resolution |
|-----------|--------|------------|
| None identified | - | - |

---

## 9. Requirements Change Log

| Date | Requirement ID | Change Type | Description | Author |
|------|---------------|-------------|-------------|--------|
| 2024-12-28 | All | Added | Initial requirements mapping | Creative Director |

---

## 10. Test Coverage Mapping

| Requirement ID | Test Case ID | Test Type | Status |
|----------------|-------------|-----------|--------|
| TR-001 | TC-001 | Integration | Backlog |
| TR-002 | TC-002 | Component | Backlog |
| TR-003 | TC-003 | Component | Backlog |
| TR-004 | TC-004 | Component | Backlog |
| TR-005 | TC-005 | Component | Backlog |
| TR-006 | TC-006 | Component | Backlog |
| TR-NFR-001 | TC-007 | Performance | Backlog |
| TR-NFR-002 | TC-008 | Performance | Backlog |
| TR-NFR-003 | TC-009 | Accessibility | Backlog |

---

## 11. References

- PRD: `features/ui-redesign-prd.md`
- Design Document: `features/redesign.md`
- User Stories: `features/ui-redesign-user-stories.md`
- Use Cases: `features/ui-redesign-use-cases.md`

---

## 12. Approval

| Role | Name | Date | Signature |
|------|------|------|-----------|
| Product Manager | | | |
| Engineering Lead | | | |
| QA Lead | | | |

---

> "Videos first. Everything else is secondary." — Video-First Philosophy

