# User Stories: Fullscreen Modal System

**Feature Name:** Fullscreen Modal System  
**Version:** 1.0  
**Date:** 2024-01-XX  
**Author:** Development Team  
**Status:** Draft  
**Related PRD:** [PRD](./prd.md)  
**Related Use Cases:** [Use Cases](./use-cases.md)

---

## 1. Overview

### 1.1 Purpose
This document contains user stories that describe features from the user's perspective, focusing on the value and experience users get from the Fullscreen Modal System.

### 1.2 User Story Format
We use the standard format:
- **As a** [type of user]
- **I want** [goal/desire]
- **So that** [benefit/value]

---

## 2. Epic: Core Fullscreen Modal Experience

### 2.1 Epic Description
The core fullscreen modal experience provides users with an immersive, distraction-free way to view videos and photos from the portfolio. This epic covers the basic modal functionality including opening, displaying, and closing media in fullscreen mode.

### 2.2 Epic Goals
- Provide truly fullscreen viewing experience (100vw/100vh)
- Smooth, animated transitions when opening/closing
- Fast loading and playback
- Works seamlessly on web, iOS, and Android

### 2.3 User Stories

#### US-001: Open Video in Fullscreen Modal

- **As a** portfolio viewer
- **I want** to click on a video card to view it in a fullscreen modal
- **So that** I can watch the video in an immersive, distraction-free environment

**Priority:** P0 (Critical)  
**Story Points:** 8  
**Status:** Backlog

**Acceptance Criteria:**
- [ ] Clicking a video card opens the modal with smooth zoom-in animation
- [ ] Modal displays video in true fullscreen (100vw/100vh with safe area handling)
- [ ] Video starts loading immediately when modal opens
- [ ] Video autoplays when ready (respecting browser autoplay policies)
- [ ] Dark backdrop (95% black opacity) dims the background
- [ ] Smooth animation from clicked position to fullscreen center
- [ ] Modal works on web, iOS, and Android

**User Flow:**
1. User views video grid on portfolio page
2. User clicks/taps on a video card
3. Modal opens with zoom-in animation from clicked position
4. Video begins loading
5. Video starts playing automatically when ready
6. User watches video in fullscreen

**Technical Notes:**
- Use Framer Motion for zoom-in animation
- Calculate animation origin from click position
- Handle iOS autoplay restrictions (playsInline, muted if needed)
- Use 100vw/100vh with safe area insets for notched devices
- Platform detection for iOS/Android/web

**Dependencies:**
- None (foundational story)

**Related Requirements:**
- FR-1 (Unified Fullscreen Modal Component)
- FR-2 (True Fullscreen Display)
- FR-8 (Video Playback Features)

**Design References:**
- Design Document Section 5.2 (Key Screens/Components)
- Design Document Section 5.4 (Responsive Design)

**Test Scenarios:**
- Open video on desktop browser
- Open video on iOS Safari
- Open video on Android Chrome
- Open video on tablet device
- Verify zoom-in animation smoothness
- Verify video autoplay works

---

#### US-002: Open Photo in Fullscreen Modal

- **As a** portfolio viewer
- **I want** to click on a photo to view it in a fullscreen modal
- **So that** I can see the photo in high detail without distractions

**Priority:** P0 (Critical)  
**Story Points:** 5  
**Status:** Backlog

**Acceptance Criteria:**
- [ ] Clicking a photo opens the modal with smooth zoom-in animation
- [ ] Modal displays image in true fullscreen (100vw/100vh with safe area handling)
- [ ] Image loads and displays at full resolution
- [ ] Progressive loading shows low-res first, then high-res
- [ ] Dark backdrop (95% black opacity) dims the background
- [ ] Smooth animation from clicked position to fullscreen center
- [ ] Works on web, iOS, and Android

**User Flow:**
1. User views photo grid on portfolio page
2. User clicks/taps on a photo
3. Modal opens with zoom-in animation from clicked position
4. Image loads (progressive: low-res → high-res)
5. Image displays at full resolution in fullscreen
6. User views photo in detail

**Technical Notes:**
- Use Framer Motion for zoom-in animation
- Calculate animation origin from click position
- Progressive image loading (placeholder → low-res → high-res)
- Handle different image aspect ratios
- Platform detection for safe area handling

**Dependencies:**
- US-001 (can share modal infrastructure)

**Related Requirements:**
- FR-1 (Unified Fullscreen Modal Component)
- FR-2 (True Fullscreen Display)
- FR-9 (Image Display Features)

**Design References:**
- Design Document Section 5.2 (Key Screens/Components)

**Test Scenarios:**
- Open photo on desktop
- Open photo on iOS
- Open photo on Android
- Test with portrait images
- Test with landscape images
- Test with very large images

---

#### US-003: Close Fullscreen Modal

- **As a** portfolio viewer
- **I want** to easily close the fullscreen modal
- **So that** I can return to browsing the portfolio

**Priority:** P0 (Critical)  
**Story Points:** 3  
**Status:** Backlog

**Acceptance Criteria:**
- [ ] Close button (X) is visible in top-right corner
- [ ] Clicking close button closes modal with zoom-out animation
- [ ] Clicking backdrop closes modal
- [ ] ESC key closes modal (desktop)
- [ ] Swipe down closes modal (mobile)
- [ ] Pull down gesture closes modal (mobile)
- [ ] Smooth zoom-out animation back to original position
- [ ] Modal state properly cleaned up (video stops, resources freed)

**User Flow:**
1. User is viewing media in fullscreen modal
2. User wants to close modal
3. User clicks close button, backdrop, presses ESC, or swipes down
4. Modal closes with smooth zoom-out animation
5. User returns to portfolio grid

**Technical Notes:**
- Close button should be prominent but not intrusive
- Handle multiple close methods (button, backdrop, keyboard, gesture)
- Cleanup video playback on close
- Cleanup event listeners
- Restore body scroll
- Restore focus to original element

**Dependencies:**
- US-001, US-002

**Related Requirements:**
- FR-1 (Unified Fullscreen Modal Component)
- FR-4 (Touch Gesture Support)

**Test Scenarios:**
- Close via close button
- Close via backdrop click
- Close via ESC key
- Close via swipe down (mobile)
- Close via pull down (mobile)
- Verify zoom-out animation
- Verify cleanup (video stops, no memory leaks)

---

## 3. Epic: Gallery Navigation

### 3.1 Epic Description
Gallery navigation allows users to browse through multiple videos or photos without closing the modal. This epic covers navigation between items using arrows, keyboard, and swipe gestures.

### 3.2 Epic Goals
- Enable seamless navigation between portfolio items
- Support multiple navigation methods (arrows, keyboard, gestures)
- Smooth transitions between items
- Preload next/previous items for fast navigation

### 3.3 User Stories

#### US-004: Navigate Between Items with Arrow Buttons

- **As a** portfolio viewer
- **I want** to use arrow buttons to navigate to the next or previous item
- **So that** I can browse through the portfolio without closing the modal

**Priority:** P1 (High)  
**Story Points:** 5  
**Status:** Backlog

**Acceptance Criteria:**
- [ ] Previous button (←) appears on left edge of modal
- [ ] Next button (→) appears on right edge of modal
- [ ] Buttons are visible on hover (desktop) or always visible (mobile)
- [ ] Clicking previous button navigates to previous item
- [ ] Clicking next button navigates to next item
- [ ] Navigation loops (last item → first, first item → last)
- [ ] Smooth transition animation between items
- [ ] Next/previous item preloads for fast transition
- [ ] Buttons hide when only one item in gallery

**User Flow:**
1. User opens modal with video/photo
2. User sees arrow buttons on edges
3. User clicks next button (→)
4. Next item loads and displays with smooth transition
5. User continues browsing through items

**Technical Notes:**
- Use Framer Motion for transition animations
- Preload next/previous item in background
- Handle edge cases (first/last item, single item)
- Show/hide buttons based on item count
- Platform-specific visibility (hover on desktop, always on mobile)

**Dependencies:**
- US-001, US-002 (modal must exist)

**Related Requirements:**
- FR-3 (Gallery/Carousel Navigation)

**Design References:**
- Design Document Section 5.2 (Gallery Navigation Component)

**Test Scenarios:**
- Navigate forward through gallery
- Navigate backward through gallery
- Test looping (last → first, first → last)
- Test with single item (buttons hidden)
- Test transition smoothness
- Test preloading performance

---

#### US-005: Navigate Between Items with Keyboard

- **As a** portfolio viewer using a keyboard
- **I want** to use arrow keys to navigate between items
- **So that** I can browse efficiently without using the mouse

**Priority:** P1 (High)  
**Story Points:** 3  
**Status:** Backlog

**Acceptance Criteria:**
- [ ] Left arrow key (←) navigates to previous item
- [ ] Right arrow key (→) navigates to next item
- [ ] Navigation works only when modal is open
- [ ] Smooth transition animation between items
- [ ] Keyboard navigation doesn't interfere with video controls
- [ ] ESC key still closes modal (doesn't conflict)
- [ ] Focus management prevents keyboard navigation conflicts

**User Flow:**
1. User opens modal with video/photo
2. User presses right arrow key (→)
3. Next item loads and displays
4. User continues using arrow keys to navigate
5. User presses ESC to close modal

**Technical Notes:**
- Add keyboard event listeners when modal opens
- Remove listeners when modal closes
- Prevent default behavior for arrow keys
- Handle focus management (don't interfere with video controls)
- Support left/right arrow keys only (not up/down)

**Dependencies:**
- US-001, US-002, US-004

**Related Requirements:**
- FR-3 (Gallery/Carousel Navigation)
- FR-7 (Accessibility Features)

**Test Scenarios:**
- Navigate with left arrow key
- Navigate with right arrow key
- Test that ESC still closes modal
- Test keyboard navigation doesn't interfere with video controls
- Test keyboard navigation on different browsers

---

#### US-006: Navigate Between Items with Swipe Gestures

- **As a** mobile user
- **I want** to swipe left or right to navigate between items
- **So that** I can browse naturally using touch gestures

**Priority:** P1 (High)  
**Story Points:** 8  
**Status:** Backlog

**Acceptance Criteria:**
- [ ] Swipe left navigates to next item
- [ ] Swipe right navigates to previous item
- [ ] Swipe gesture has visual feedback (item follows finger)
- [ ] Smooth animation when swipe completes
- [ ] Swipe threshold prevents accidental navigation
- [ ] Swipe works on images and videos
- [ ] Swipe doesn't interfere with video controls or image zoom
- [ ] Works on iOS and Android devices

**User Flow:**
1. User opens modal on mobile device
2. User swipes left on screen
3. Next item begins sliding in following finger
4. User releases finger
5. Next item completes transition and displays

**Technical Notes:**
- Use Pointer Events API for touch detection
- Calculate swipe velocity and distance
- Threshold: minimum distance (50px) and velocity (0.3)
- Handle swipe conflict with video controls (detect touch target)
- Handle swipe conflict with image zoom (only when not zoomed)
- Smooth animation using Framer Motion

**Dependencies:**
- US-001, US-002, US-004

**Related Requirements:**
- FR-3 (Gallery/Carousel Navigation)
- FR-4 (Touch Gesture Support)

**Design References:**
- Design Document Section 2.2 (Touch Gesture Handler)

**Test Scenarios:**
- Swipe left to navigate next
- Swipe right to navigate previous
- Test swipe threshold (short swipe doesn't navigate)
- Test swipe on videos (doesn't interfere with controls)
- Test swipe on images (doesn't interfere with zoom)
- Test on iOS device
- Test on Android device

---

## 4. Epic: Mobile Optimization

### 4.1 Epic Description
Mobile optimization ensures the fullscreen modal works perfectly on iOS and Android devices with platform-specific features like native fullscreen, touch gestures, and safe area handling.

### 4.2 Epic Goals
- Optimal video playback on mobile devices
- Native fullscreen support for videos
- Proper safe area handling for notched devices
- Smooth touch interactions

### 4.3 User Stories

#### US-007: View Video in Native Fullscreen on Mobile

- **As a** mobile user
- **I want** to enter native fullscreen mode for videos
- **So that** I can watch videos with optimal playback and controls

**Priority:** P1 (High)  
**Story Points:** 8  
**Status:** Backlog

**Acceptance Criteria:**
- [ ] Double-tap video or tap fullscreen button to enter native fullscreen
- [ ] Video enters device native fullscreen mode
- [ ] Native video controls appear (iOS/Android system controls)
- [ ] Video playback is optimal (hardware accelerated)
- [ ] User can exit native fullscreen (device gesture or button)
- [ ] Returns to modal view when exiting native fullscreen
- [ ] Works on iOS Safari and Android Chrome
- [ ] Graceful fallback if native fullscreen not available

**User Flow:**
1. User opens video in modal on mobile device
2. User double-taps video or taps fullscreen button
3. Video enters native fullscreen mode
4. User watches video with native controls
5. User exits native fullscreen (device gesture)
6. Returns to modal view

**Technical Notes:**
- Use Fullscreen API (requestFullscreen)
- Handle iOS-specific requirements (webkitEnterFullscreen for video)
- Handle Android WebView compatibility
- Listen for fullscreen change events
- Fallback to CSS fullscreen if native API not available
- Handle orientation changes in fullscreen

**Dependencies:**
- US-001 (video modal must exist)

**Related Requirements:**
- FR-5 (Native Fullscreen API Integration)
- FR-6 (Platform-Specific Optimization)

**Design References:**
- Design Document Section 2.2 (VideoPlayer Component)

**Test Scenarios:**
- Enter native fullscreen on iOS Safari
- Enter native fullscreen on Android Chrome
- Exit native fullscreen
- Test with different video formats
- Test fallback if native fullscreen not available
- Test orientation changes

---

#### US-008: Pinch to Zoom on Images

- **As a** mobile user
- **I want** to pinch to zoom in on images
- **So that** I can see image details more clearly

**Priority:** P1 (High)  
**Story Points:** 8  
**Status:** Backlog

**Acceptance Criteria:**
- [ ] Pinch gesture zooms image in/out
- [ ] Zoom range: 1x (normal) to 2x (maximum)
- [ ] Smooth zoom animation
- [ ] Image centers on pinch point
- [ ] User can pan image when zoomed
- [ ] Double-tap toggles between 1x and 2x zoom
- [ ] Pinch-out returns to 1x zoom
- [ ] Works on iOS and Android devices

**User Flow:**
1. User opens image in modal
2. User pinches image with two fingers
3. Image zooms in centered on pinch point
4. User pans image to see different areas
5. User pinches out to zoom back to normal

**Technical Notes:**
- Use Pointer Events API for multi-touch detection
- Calculate pinch scale from two touch points
- Clamp zoom between 1x and 2x
- Handle pan when zoomed (translate transform)
- Smooth animations using CSS transforms
- Handle conflict with swipe navigation (disable swipe when zoomed)

**Dependencies:**
- US-002 (image modal must exist)

**Related Requirements:**
- FR-4 (Touch Gesture Support)
- FR-9 (Image Display Features)

**Design References:**
- Design Document Section 2.2 (ImageViewer Component)

**Test Scenarios:**
- Pinch to zoom in
- Pinch to zoom out
- Test zoom limit (2x max)
- Test pan when zoomed
- Test double-tap toggle zoom
- Test on iOS device
- Test on Android device
- Test conflict with swipe navigation

---

## 5. Epic: Accessibility

### 5.1 Epic Description
Accessibility features ensure the fullscreen modal is usable by all users, including those using assistive technologies like screen readers, keyboard navigation, and voice control.

### 5.2 Epic Goals
- WCAG 2.1 AA compliance
- Full keyboard navigation support
- Screen reader compatibility
- Clear focus management

### 5.3 User Stories

#### US-009: Navigate Modal with Keyboard

- **As a** user who relies on keyboard navigation
- **I want** to fully navigate and control the modal using only the keyboard
- **So that** I can access all features without a mouse

**Priority:** P1 (High)  
**Story Points:** 5  
**Status:** Backlog

**Acceptance Criteria:**
- [ ] Tab key moves focus between interactive elements
- [ ] Enter/Space activates focused element
- [ ] ESC key closes modal
- [ ] Arrow keys navigate gallery (left/right)
- [ ] Focus is trapped within modal when open
- [ ] Focus returns to original element when modal closes
- [ ] Visible focus indicators on all interactive elements
- [ ] Logical tab order

**User Flow:**
1. User opens modal (focus moves to modal)
2. User presses Tab to navigate between buttons
3. User presses Enter to activate button (e.g., next item)
4. User presses Arrow keys to navigate gallery
5. User presses ESC to close modal
6. Focus returns to original element

**Technical Notes:**
- Implement focus trap (prevent tab from leaving modal)
- Add keyboard event listeners
- Manage focus programmatically
- Add visible focus styles (outline, ring)
- Maintain logical tab order
- Handle video controls keyboard navigation

**Dependencies:**
- US-001, US-002, US-005

**Related Requirements:**
- FR-7 (Accessibility Features)

**Design References:**
- Design Document Section 5.1 (Accessibility Principles)

**Test Scenarios:**
- Tab through all interactive elements
- Test Enter/Space activation
- Test ESC to close
- Test arrow key navigation
- Test focus trap (can't tab outside modal)
- Test focus restoration on close
- Test with screen reader (NVDA, VoiceOver)

---

#### US-010: Use Modal with Screen Reader

- **As a** user with visual impairment
- **I want** the modal to work with my screen reader
- **So that** I can understand and navigate the modal content

**Priority:** P1 (High)  
**Story Points:** 5  
**Status:** Backlog

**Acceptance Criteria:**
- [ ] Modal has proper ARIA labels and roles
- [ ] Screen reader announces modal open/close
- [ ] Screen reader announces current item information (title, metadata)
- [ ] Interactive elements have descriptive labels
- [ ] Video/Image has alt text or description
- [ ] Navigation buttons have descriptive labels
- [ ] State changes are announced (loading, error, playing)
- [ ] Works with NVDA, JAWS, VoiceOver

**User Flow:**
1. User opens modal (screen reader announces: "Video modal opened, [Video Title]")
2. Screen reader announces video metadata
3. User navigates with screen reader (next/previous buttons announced)
4. User activates play (screen reader announces: "Video playing")
5. User closes modal (screen reader announces: "Modal closed")

**Technical Notes:**
- Add ARIA labels to all interactive elements
- Use ARIA live regions for dynamic announcements
- Add aria-label to modal container
- Add aria-describedby for metadata
- Add role="dialog" to modal
- Add aria-modal="true"
- Test with multiple screen readers

**Dependencies:**
- US-001, US-002

**Related Requirements:**
- FR-7 (Accessibility Features)

**Design References:**
- WCAG 2.1 Guidelines
- ARIA Authoring Practices Guide

**Test Scenarios:**
- Test with NVDA (Windows)
- Test with JAWS (Windows)
- Test with VoiceOver (macOS/iOS)
- Verify all labels are announced
- Verify state changes are announced
- Verify navigation is clear

---

## 6. Story Prioritization

### 6.1 Priority Matrix

| Story ID | Priority | Business Value | Effort | Dependencies |
|----------|----------|----------------|--------|--------------|
| US-001 | P0 | High | High | None |
| US-002 | P0 | High | Medium | None |
| US-003 | P0 | High | Low | US-001, US-002 |
| US-004 | P1 | High | Medium | US-001, US-002 |
| US-005 | P1 | Medium | Low | US-001, US-002, US-004 |
| US-006 | P1 | High | High | US-001, US-002, US-004 |
| US-007 | P1 | High | High | US-001 |
| US-008 | P1 | Medium | High | US-002 |
| US-009 | P1 | High | Medium | US-001, US-002, US-005 |
| US-010 | P1 | High | Medium | US-001, US-002 |

### 6.2 Release Planning

**Release 1.0 (MVP):**
- US-001: Open Video in Fullscreen Modal
- US-002: Open Photo in Fullscreen Modal
- US-003: Close Fullscreen Modal

**Release 1.1 (Gallery Navigation):**
- US-004: Navigate with Arrow Buttons
- US-005: Navigate with Keyboard
- US-006: Navigate with Swipe Gestures

**Release 1.2 (Mobile Optimization):**
- US-007: Native Fullscreen on Mobile
- US-008: Pinch to Zoom on Images

**Release 1.3 (Accessibility):**
- US-009: Keyboard Navigation
- US-010: Screen Reader Support

---

## 7. Edge Cases and Error Scenarios

### 7.1 Edge Cases

| Story ID | Edge Case | Handling |
|----------|-----------|----------|
| US-001 | Video fails to load | Show error state, retry button |
| US-001 | Autoplay blocked | Show play button overlay |
| US-002 | Image very large | Progressive loading, placeholder |
| US-003 | Multiple close attempts | Ignore after first close started |
| US-004 | Single item in gallery | Hide navigation buttons |
| US-006 | Swipe during video playback | Detect if on video controls, don't navigate |
| US-007 | Native fullscreen not supported | Fallback to CSS fullscreen |
| US-008 | Pinch during swipe navigation | Disable swipe when zoomed > 1x |

### 7.2 Error Scenarios

| Story ID | Error Scenario | User Experience |
|----------|----------------|-----------------|
| US-001 | Network error loading video | Show error message, retry button |
| US-002 | Image load timeout | Show error message, retry button |
| US-007 | Native fullscreen fails | Fallback to modal view, show message |
| US-008 | Gesture detection fails | Fallback to button controls |

---

## 8. Definition of Done

### 8.1 Story Completion Criteria
- [ ] Code implemented and reviewed
- [ ] Unit tests written and passing
- [ ] Integration tests written and passing
- [ ] Acceptance criteria met
- [ ] Design review completed
- [ ] Accessibility tested (if applicable)
- [ ] Tested on target platforms (iOS/Android/web)
- [ ] Documentation updated
- [ ] No console errors or warnings
- [ ] Performance targets met

---

## 9. References

- [PRD](./prd.md)
- [Design Document](./design-document.md)
- [Use Cases](./use-cases.md)
- [Requirements Mapping](./requirements-mapping.md)
- [WCAG 2.1 Guidelines](https://www.w3.org/WAI/WCAG21/quickref/)

---

## 10. Change Log

| Date | Story ID | Change | Author |
|------|----------|--------|--------|
| 2024-01-XX | - | Initial draft | Development Team |

