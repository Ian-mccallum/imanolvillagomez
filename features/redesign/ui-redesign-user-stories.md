# User Stories

**Feature Name:** UI Redesign - Imanol Villagomez Videography Portfolio  
**Version:** 1.0  
**Date:** 2024-12-28  
**Author:** Creative Director (Carson-Oliver-West-Weirdcore Collaboration)  
**Status:** Draft  
**Related PRD:** `features/ui-redesign-prd.md`  
**Related Design Document:** `features/redesign.md`

---

## 1. Overview

### 1.1 Purpose

This document contains user stories that describe the UI redesign from the user's perspective, organized into epics that align with the video-first, experimental design philosophy.

### 1.2 User Story Format

We use the standard format:
- **As a** [type of user]
- **I want** [goal/desire]
- **So that** [benefit/value]

---

## 2. Epic: Browse Video Portfolio

### 2.1 Epic Description

Users should be able to browse Imanol's video portfolio in a Pinterest/scrapbook style layout, with many appropriately-sized videos visible simultaneously, creating an immersive visual diary experience.

### 2.2 Epic Goals

- Many videos visible at once (3-4 per row on desktop)
- Videos appropriately sized (300-500px width)
- Scrapbook/moodboard aesthetic
- Videos dominate visual weight (80%)

### 2.3 User Stories

#### US-001: View Many Videos in Masonry Layout

- **As a** potential client browsing the portfolio
- **I want** to see many videos in a Pinterest-style masonry layout
- **So that** I can quickly browse the full breadth of work without excessive scrolling

**Priority:** P0 (Critical)  
**Story Points:** 8  
**Status:** Backlog

**Acceptance Criteria:**
- [ ] Videos display in 3-4 columns on desktop
- [ ] Videos are appropriately sized (300-500px width)
- [ ] Layout uses CSS columns or CSS Grid masonry
- [ ] Many videos visible simultaneously (10+ on desktop viewport)
- [ ] Layout is responsive (1 column mobile, 2 tablet, 3-4 desktop)
- [ ] Videos flow naturally in columns
- [ ] No excessive white space between videos

**User Flow:**
1. User lands on homepage/work page
2. Immediately sees masonry grid with many videos
3. Scrolls to see more videos flowing in columns
4. Videos are appropriately sized, easy to browse

**Technical Notes:**
- Use CSS columns (native, performant) or CSS Grid
- Ensure proper break-inside-avoid for video cards
- Test with 10, 50, 100+ videos

**Dependencies:**
- None

**Related Requirements:**
- FR-1 (Masonry Video Grid Layout)
- TR-001

**Design References:**
- Design Document Section 5.1 (Home/Work Page Redesign)
- Design Document Section 6.1 (Masonry Grid System)

**Test Scenarios:**
- Test with 10 videos
- Test with 50 videos
- Test with 100+ videos
- Test responsive breakpoints
- Test on different screen sizes

---

#### US-002: Click Video to View in Full Screen Modal

- **As a** user browsing videos
- **I want** to click a video card to view it in a full-screen modal
- **So that** I can watch the video without leaving the portfolio page

**Priority:** P0 (Critical)  
**Story Points:** 5  
**Status:** Backlog

**Acceptance Criteria:**
- [ ] Clicking video card opens modal with zoom-in animation
- [ ] Modal shows video player with controls
- [ ] Modal has close button (X) in top right
- [ ] Clicking backdrop closes modal
- [ ] ESC key closes modal
- [ ] Video autoplays when modal opens
- [ ] Modal displays video metadata (title, client, year)
- [ ] Smooth zoom-in animation from clicked position

**User Flow:**
1. User clicks on video card
2. Modal opens with zoom-in animation from clicked position
3. Video starts playing automatically
4. User watches video
5. User clicks X or backdrop to close
6. Modal closes with zoom-out animation
7. User returns to video grid

**Technical Notes:**
- Use Framer Motion for animations
- Calculate zoom-in position from click event
- Preserve video rotation if needed (270deg)
- Handle video loading states

**Dependencies:**
- US-001

**Related Requirements:**
- FR-2 (Standard Video Card Sizing)
- TR-002

**Design References:**
- Design Document Section 5.5 (Video Modal Redesign)

**Test Scenarios:**
- Click video in top left of screen
- Click video in bottom right of screen
- Test keyboard navigation (ESC)
- Test video playback controls
- Test modal close animations

---

#### US-003: See Video Cards with Enhanced Visual Effects

- **As a** user browsing videos
- **I want** to see video cards with experimental visual effects (grain, glitch, textures)
- **So that** the portfolio feels unique, memorable, and artistically interesting

**Priority:** P1 (High)  
**Story Points:** 8  
**Status:** Backlog

**Acceptance Criteria:**
- [ ] Video cards have grain texture overlay
- [ ] Video cards have torn edge effect (paper cutout aesthetic)
- [ ] Glitch effects appear on hover (intentional, not random)
- [ ] Flash photography effect on hover (indie sleaze)
- [ ] Scan lines overlay (subtle CRT effect)
- [ ] Featured videos have red border accent (gore core)
- [ ] Effects enhance videos, don't distract
- [ ] All effects performant (60fps)

**User Flow:**
1. User hovers over video card
2. Grain texture visible
3. Glitch effect triggers (RGB channel separation)
4. Flash photography effect (overexposed)
5. Card scales slightly (1.02x)
6. User moves mouse away
7. Effects return to normal

**Technical Notes:**
- Use CSS for grain texture (SVG filter)
- Use CSS transforms for glitch (GPU-accelerated)
- Use Framer Motion for hover animations
- Ensure effects don't impact performance

**Dependencies:**
- US-001, US-002

**Related Requirements:**
- FR-4 (Enhanced Visual Effects)
- TR-003

**Design References:**
- Design Document Section 8.1 (Video Card Enhancements)
- Design Document Section 9 (Indie Sleaze Aesthetic Integration)

**Test Scenarios:**
- Hover over standard video card
- Hover over featured video card (red border)
- Test performance with many cards
- Test on lower-end devices
- Test glitch effects (intentional, not random)

---

#### US-004: See Experimental Typography Overlays

- **As a** user browsing videos
- **I want** to see experimental typography overlays (handwritten tags, rotated text)
- **So that** the design feels unique and artistically experimental

**Priority:** P2 (Medium)  
**Story Points:** 5  
**Status:** Backlog

**Acceptance Criteria:**
- [ ] Handwritten-style year tags on some video cards
- [ ] Tags are rotated slightly (-5deg to 5deg)
- [ ] Tags use pink, white, or green colors
- [ ] Page titles can be rotated slightly (-0.5deg to -2deg)
- [ ] Typography overlays don't compete with videos
- [ ] Text is readable despite experimental styling

**User Flow:**
1. User views video grid
2. Sees handwritten year tags on some cards (e.g., "2024")
3. Tags are rotated, colored (pink/green/white)
4. Tags positioned randomly but strategically
5. User reads page title (slightly rotated)
6. Typography feels experimental but readable

**Technical Notes:**
- Use CSS transforms for rotation
- Use cursive font for handwritten style
- Ensure text shadow for readability
- Limit rotation amounts for readability

**Dependencies:**
- US-001

**Related Requirements:**
- FR-3 (Experimental Typography System)
- TR-004

**Design References:**
- Design Document Section 8.3 (Typography Overlays)
- Design Document Section 9.3 (Handwritten Text Overlays)

**Test Scenarios:**
- View cards with handwritten tags
- Test readability of rotated text
- Test typography on different backgrounds
- Test accessibility (screen readers)

---

## 3. Epic: Explore About Page

### 3.1 Epic Description

Users should be able to learn about Imanol Villagomez through an experimental, asymmetrical page layout that embodies the creative aesthetic.

### 3.2 Epic Goals

- Asymmetrical, dynamic layout
- Experimental typography
- Visual interest with grain and glitch
- Clear information about Imanol's work

### 3.3 User Stories

#### US-005: Read About Imanol on Asymmetrical Page

- **As a** potential client
- **I want** to read about Imanol on a page with experimental, asymmetrical layout
- **So that** I can learn about the videographer while experiencing the creative aesthetic

**Priority:** P1 (High)  
**Story Points:** 8  
**Status:** Backlog

**Acceptance Criteria:**
- [ ] Page uses asymmetrical layout (not centered)
- [ ] Large "IMANOL VILLAGOMEZ" headline with glitch effect
- [ ] Typography is rotated slightly (-0.5deg to -2deg)
- [ ] Content sections have red accent borders (gore core)
- [ ] Grain texture overlay on page
- [ ] Layout feels dynamic, not static
- [ ] Text is readable despite experimental layout

**User Flow:**
1. User clicks "ABOUT" in navigation
2. Sees asymmetrical layout with large headline
3. Reads about Imanol with visual interest
4. Sees experimental typography (rotated, glitched)
5. Views work highlights section
6. Clicks "LET'S WORK" CTA to contact

**Technical Notes:**
- Break centered container convention
- Use CSS Grid or Flexbox for asymmetrical layout
- Apply grain texture globally
- Use GlitchText component for name

**Dependencies:**
- None

**Related Requirements:**
- FR-6 (Asymmetrical Page Layouts)
- TR-005

**Design References:**
- Design Document Section 5.3 (About Page Redesign)

**Test Scenarios:**
- View page on desktop
- View page on mobile (responsive)
- Test readability of rotated text
- Test glitch effects on name
- Test CTA button functionality

---

## 4. Epic: Contact Imanol

### 4.1 Epic Description

Users should be able to contact Imanol through an experimental contact form that maintains functionality while embodying the creative aesthetic.

### 4.2 Epic Goals

- Experimental form layout
- Bold typography
- Visual interest (grain, glitch)
- Functional form submission

### 4.3 User Stories

#### US-006: Submit Contact Form with Experimental Design

- **As a** potential client
- **I want** to submit a contact form with experimental design
- **So that** I can contact Imanol while experiencing the creative aesthetic

**Priority:** P1 (High)  
**Story Points:** 5  
**Status:** Backlog

**Acceptance Criteria:**
- [ ] Form uses experimental layout (not standard centered)
- [ ] Labels are large, bold, all caps
- [ ] Input fields have dark backgrounds, white borders
- [ ] Focus states have red or green accent (gore core/Brat green)
- [ ] Form has grain texture overlay
- [ ] Submit button is bold (white background, black text)
- [ ] Form is functional (can submit)
- [ ] Form validation works properly

**User Flow:**
1. User clicks "CONTACT" in navigation
2. Sees experimental form layout
3. Fills out form fields (name, email, subject, message)
4. Sees bold focus states (red/green accent)
5. Clicks submit button
6. Form submits (or shows success message)

**Technical Notes:**
- Break standard form layout conventions
- Use bold typography for labels
- Implement focus states with accent colors
- Handle form submission (may need backend)

**Dependencies:**
- None

**Related Requirements:**
- FR-6 (Asymmetrical Page Layouts)
- TR-006

**Design References:**
- Design Document Section 5.4 (Contact Page Redesign)

**Test Scenarios:**
- Fill out form fields
- Test focus states
- Test form validation
- Test form submission
- Test on mobile (responsive)

---

## 5. User Story Map

### 5.1 User Journey

```
User Journey: Browse Portfolio and Contact
├── Discovery
│   ├── US-001: View Many Videos in Masonry Layout
│   └── US-003: See Video Cards with Enhanced Visual Effects
├── Engagement
│   ├── US-002: Click Video to View in Full Screen Modal
│   └── US-004: See Experimental Typography Overlays
├── Exploration
│   └── US-005: Read About Imanol on Asymmetrical Page
└── Action
    └── US-006: Submit Contact Form with Experimental Design
```

### 5.2 Story Dependencies

```
US-001 (Masonry Layout)
  ├── US-002 (Video Modal)
  ├── US-003 (Visual Effects)
  └── US-004 (Typography Overlays)

US-005 (About Page)
  └── US-006 (Contact Form)

US-006 (Contact Form)
  └── (No dependencies)
```

---

## 6. Personas

### 6.1 Primary Persona: Potential Client (Music Artist/Label)

- **Role:** Music artist, label A&R, brand creative director
- **Demographics:** Ages 18-45, creative industry professionals
- **Goals:** Quickly browse video portfolio, assess style and quality, contact videographer
- **Pain Points:** Need to see variety quickly, want to understand creative vision
- **Tech Savviness:** High (familiar with modern web experiences)
- **Related Stories:** US-001, US-002, US-003, US-005, US-006

### 6.2 Secondary Persona: Industry Peer (Videographer/Director)

- **Role:** Other videographer, director, creative professional
- **Demographics:** Ages 20-50, creative professionals
- **Goals:** See innovative design, get inspired, understand trends
- **Pain Points:** Want to see experimental design done well
- **Tech Savviness:** High
- **Related Stories:** US-001, US-003, US-004, US-005

### 6.3 Tertiary Persona: Fan/Viewer (Casual Browser)

- **Role:** Music/art enthusiast, casual browser
- **Demographics:** Ages 16-40, music/art enthusiasts
- **Goals:** Discover interesting videos, enjoy visual experience
- **Pain Points:** Want engaging, memorable browsing experience
- **Tech Savviness:** Medium to High
- **Related Stories:** US-001, US-002, US-003, US-004

---

## 7. Story Prioritization

### 7.1 Priority Matrix

| Story ID | Priority | Business Value | Effort | Risk |
|----------|----------|----------------|--------|------|
| US-001 | P0 | High | High | Medium |
| US-002 | P0 | High | Medium | Low |
| US-003 | P1 | High | High | Medium |
| US-004 | P2 | Medium | Medium | Low |
| US-005 | P1 | Medium | Medium | Low |
| US-006 | P1 | Medium | Low | Low |

### 7.2 Release Planning

- **Release 1.0 (MVP):**
  - US-001: View Many Videos in Masonry Layout
  - US-002: Click Video to View in Full Screen Modal
  - US-005: Read About Imanol on Asymmetrical Page
  - US-006: Submit Contact Form with Experimental Design
  
- **Release 1.1 (Enhancements):**
  - US-003: See Video Cards with Enhanced Visual Effects
  - US-004: See Experimental Typography Overlays

---

## 8. Edge Cases and Error Scenarios

### 8.1 Edge Cases

| Story ID | Edge Case | Handling |
|----------|-----------|----------|
| US-001 | No videos available | Show creative empty state message |
| US-001 | Single video | Layout gracefully handles single video |
| US-001 | 100+ videos | Virtualization or pagination if needed |
| US-002 | Video fails to load | Show error message, allow retry |
| US-002 | Missing video file | Show placeholder, disable playback |
| US-003 | Low-end device | Reduce effect intensity, ensure performance |
| US-006 | Form submission fails | Show error message, allow retry |

### 8.2 Error Scenarios

| Story ID | Error Scenario | User Experience |
|----------|----------------|-----------------|
| US-001 | Slow network connection | Show loading skeletons, lazy load images |
| US-002 | Video autoplay blocked | Show play button, user clicks to play |
| US-002 | Browser doesn't support video | Show error message with fallback |
| US-006 | Form validation error | Show inline error messages, highlight fields |

---

## 9. Definition of Done

### 9.1 Story Completion Criteria

- [ ] Code implemented and reviewed
- [ ] Unit tests written and passing
- [ ] Integration tests written and passing
- [ ] Acceptance criteria met
- [ ] Design review completed (matches Design Document)
- [ ] Documentation updated
- [ ] QA testing passed
- [ ] Performance benchmarks met (60fps animations, < 3s load time)
- [ ] Accessibility requirements met (WCAG AA)
- [ ] Cross-browser testing passed
- [ ] Product owner approval

---

## 10. Story Status Tracking

| Story ID | Status | Assigned To | Sprint | Completion Date |
|----------|--------|-------------|--------|----------------|
| US-001 | Backlog | - | - | - |
| US-002 | Backlog | - | - | - |
| US-003 | Backlog | - | - | - |
| US-004 | Backlog | - | - | - |
| US-005 | Backlog | - | - | - |
| US-006 | Backlog | - | - | - |

---

## 11. Open Questions

- [ ] **Masonry Implementation**: CSS Columns vs CSS Grid vs JavaScript library? - Owner: Engineering Lead
- [ ] **Form Submission**: Backend API endpoint needed? - Owner: Product Owner
- [ ] **Video Count**: How many videos to show initially vs lazy load? - Owner: Product Owner
- [ ] **Glitch Intensity**: How intense should glitch effects be? - Owner: Creative Director

---

## 12. References

- PRD: `features/ui-redesign-prd.md`
- Design Document: `features/redesign.md`
- Use Cases: `features/ui-redesign-use-cases.md`
- Requirements Mapping: `features/ui-redesign-requirements-mapping.md`

---

## 13. Change Log

| Date | Story ID | Change | Author |
|------|----------|--------|--------|
| 2024-12-28 | All | Initial creation | Creative Director |

---

> "Videos first. Everything else is secondary." — Video-First Philosophy

