# Use Cases: Fullscreen Modal System

**Feature Name:** Fullscreen Modal System  
**Version:** 1.0  
**Date:** 2024-01-XX  
**Author:** Development Team  
**Status:** Draft  
**Related PRD:** [PRD](./prd.md)  
**Related User Stories:** [User Stories](./user-stories.md)

---

## 1. Overview

### 1.1 Purpose
This document provides detailed use cases describing how users interact with the Fullscreen Modal System to achieve specific goals. Each use case includes actors, preconditions, main flow, alternative flows, exception flows, and postconditions.

### 1.2 Use Case Format
Each use case includes:
- Use Case ID and Name
- Actors
- Preconditions
- Main Flow
- Alternative Flows
- Exception Flows
- Postconditions

---

## 2. Use Case Diagram

```
┌─────────────┐
│   User      │
└──────┬──────┘
       │
       │ Uses
       │
┌──────▼──────────────────────────────────────┐
│         Fullscreen Modal System             │
├─────────────────────────────────────────────┤
│  UC-001: Open Video in Fullscreen           │
│  UC-002: Open Photo in Fullscreen           │
│  UC-003: Close Modal                        │
│  UC-004: Navigate Gallery (Next/Previous)   │
│  UC-005: View Video in Native Fullscreen    │
│  UC-006: Zoom Image                         │
│  UC-007: Navigate with Keyboard             │
│  UC-008: Handle Media Load Errors           │
└─────────────────────────────────────────────┘
```

---

## 3. Actors

### 3.1 Primary Actors
- **Portfolio Viewer**: User browsing the portfolio website
  - Role: View videos and photos in fullscreen
  - Goals: Immersive viewing experience, easy navigation
  - Tech Level: General user

- **Mobile User**: User on iOS or Android device
  - Role: View content on mobile device
  - Goals: Touch-friendly interactions, native fullscreen
  - Tech Level: General user

- **Accessibility User**: User relying on assistive technologies
  - Role: Access content with keyboard/screen reader
  - Goals: Full functionality without mouse
  - Tech Level: Varies

### 3.2 Secondary Actors
- **Browser**: Web browser (Chrome, Safari, Firefox, Edge)
- **Device**: Mobile device (iOS, Android)

---

## 4. Use Cases

### UC-001: Open Video in Fullscreen Modal

**Use Case ID:** UC-001  
**Use Case Name:** Open Video in Fullscreen Modal  
**Version:** 1.0  
**Date:** 2024-01-XX  
**Author:** Development Team

#### 4.1.1 Brief Description
User clicks on a video card in the portfolio grid to view the video in a fullscreen modal with smooth zoom-in animation.

#### 4.1.2 Actors
- **Primary:** Portfolio Viewer
- **Secondary:** Browser

#### 4.1.3 Preconditions
- User is viewing a page with video grid (VideosPage, PortfolioPage, WorkPage)
- Video cards are visible and loaded
- User has JavaScript enabled
- Browser supports required APIs (Fullscreen API, etc.)

#### 4.1.4 Postconditions
- **Success:** Modal is open, video is loading/playing, user can watch video
- **Failure:** Modal does not open, error message displayed, user remains on grid

#### 4.1.5 Main Flow
1. User views video grid on portfolio page
2. User clicks/taps on a video card
3. System captures click position (x, y, width, height)
4. System calculates zoom-in animation values from click position
5. System opens modal with dark backdrop (95% black opacity)
6. System animates modal content with zoom-in from click position to center
7. System loads video element with video URL
8. System sets video attributes (autoplay, playsInline, controls)
9. System begins video loading
10. System shows loading indicator
11. Video loads and can start playing
12. System hides loading indicator
13. Video starts playing automatically (if autoplay allowed)
14. System displays video metadata overlay (bottom)
15. Use case ends successfully

#### 4.1.6 Alternative Flows

**Alternative Flow 1: Autoplay Blocked**
- At step 13 of main flow
- Browser blocks autoplay (policy restriction)
- System shows play button overlay
- User clicks play button
- Video starts playing
- Continue at step 14 of main flow

**Alternative Flow 2: Video Already Playing (Gallery Navigation)**
- At step 2 of main flow
- User navigates from another video in gallery (modal already open)
- System stops previous video
- System loads new video
- Continue at step 7 of main flow

**Alternative Flow 3: Mobile Device**
- At step 2 of main flow
- User is on mobile device (iOS/Android)
- System detects platform
- System applies mobile-specific optimizations (safe area insets, touch handling)
- Continue at step 3 of main flow

#### 4.1.7 Exception Flows

**Exception Flow 1: Video Load Failure**
- At step 11 of main flow
- Video fails to load (network error, invalid URL, codec unsupported)
- System detects error
- System hides loading indicator
- System shows error state with message: "Failed to load video"
- System displays retry button
- User clicks retry button
- System retries video load
- If retry succeeds, continue at step 12 of main flow
- If retry fails, use case ends with error state

**Exception Flow 2: Click Position Not Available**
- At step 4 of main flow
- Click position not provided (programmatic open)
- System uses default animation (center, scale from 0.3)
- Continue at step 6 of main flow

**Exception Flow 3: Browser Doesn't Support Required APIs**
- At step 5 of main flow
- Browser doesn't support Fullscreen API or other required APIs
- System uses fallback implementation (CSS fullscreen)
- Continue at step 6 of main flow

#### 4.1.8 Business Rules
- Videos must autoplay when modal opens (if policy allows)
- Video must respect browser autoplay policies
- Modal must prevent body scroll when open
- Video playback must stop when modal closes

#### 4.1.9 Special Requirements
- **Performance:** Modal open animation should complete in < 300ms
- **Performance:** Video should start playing in < 2s on mobile
- **Usability:** Smooth 60fps animations
- **Accessibility:** Keyboard navigation support

#### 4.1.10 Assumptions
- Video URLs are valid and accessible
- User has network connectivity
- Browser supports HTML5 video

#### 4.1.11 Related Use Cases
- **Includes:** UC-003 (Close Modal)
- **Extends:** UC-004 (Gallery Navigation)
- **Related:** UC-005 (Native Fullscreen), UC-007 (Keyboard Navigation)

#### 4.1.12 Related User Stories
- US-001: Open Video in Fullscreen Modal

#### 4.1.13 Related Requirements
- FR-1: Unified Fullscreen Modal Component
- FR-2: True Fullscreen Display
- FR-8: Video Playback Features

---

### UC-002: Open Photo in Fullscreen Modal

**Use Case ID:** UC-002  
**Use Case Name:** Open Photo in Fullscreen Modal  
**Version:** 1.0  
**Date:** 2024-01-XX  
**Author:** Development Team

#### 4.2.1 Brief Description
User clicks on a photo card in the portfolio grid to view the photo in a fullscreen modal with smooth zoom-in animation.

#### 4.2.2 Actors
- **Primary:** Portfolio Viewer
- **Secondary:** Browser

#### 4.2.3 Preconditions
- User is viewing a page with photo grid (PhotosPage)
- Photo cards are visible and loaded
- User has JavaScript enabled

#### 4.2.4 Postconditions
- **Success:** Modal is open, image is loaded and displayed, user can view photo
- **Failure:** Modal does not open, error message displayed, user remains on grid

#### 4.2.5 Main Flow
1. User views photo grid on portfolio page
2. User clicks/taps on a photo card
3. System captures click position (x, y, width, height)
4. System calculates zoom-in animation values from click position
5. System opens modal with dark backdrop (95% black opacity)
6. System animates modal content with zoom-in from click position to center
7. System loads image element with image URL
8. System begins image loading (progressive: placeholder → low-res → high-res)
9. System shows loading indicator
10. Image loads and displays
11. System hides loading indicator
12. System displays image at full resolution
13. System displays photo metadata overlay (bottom)
14. Use case ends successfully

#### 4.2.6 Alternative Flows

**Alternative Flow 1: Progressive Image Loading**
- At step 8 of main flow
- System loads low-resolution placeholder first
- System displays placeholder image
- System loads full-resolution image in background
- Full-resolution image loads
- System replaces placeholder with full-resolution image
- Continue at step 12 of main flow

**Alternative Flow 2: Mobile Device**
- At step 2 of main flow
- User is on mobile device
- System detects platform
- System applies mobile-specific optimizations (safe area insets, touch gestures)
- System enables pinch-to-zoom and pan gestures
- Continue at step 3 of main flow

#### 4.2.7 Exception Flows

**Exception Flow 1: Image Load Failure**
- At step 10 of main flow
- Image fails to load (network error, invalid URL, 404)
- System detects error
- System hides loading indicator
- System shows error state with message: "Failed to load image"
- System displays retry button
- User clicks retry button
- System retries image load
- If retry succeeds, continue at step 11 of main flow
- If retry fails, use case ends with error state

**Exception Flow 2: Very Large Image**
- At step 12 of main flow
- Image is very large (> 10MB)
- System shows loading progress
- System loads image progressively
- Image eventually loads and displays
- Continue at step 13 of main flow

#### 4.2.8 Business Rules
- Images must display at full resolution
- Modal must prevent body scroll when open
- Images must maintain aspect ratio

#### 4.2.9 Special Requirements
- **Performance:** Image should display initial view in < 500ms
- **Performance:** Progressive loading for large images
- **Usability:** Smooth 60fps animations

#### 4.2.10 Assumptions
- Image URLs are valid and accessible
- User has network connectivity

#### 4.2.11 Related Use Cases
- **Includes:** UC-003 (Close Modal), UC-006 (Zoom Image)
- **Extends:** UC-004 (Gallery Navigation)
- **Related:** UC-007 (Keyboard Navigation)

#### 4.2.12 Related User Stories
- US-002: Open Photo in Fullscreen Modal

#### 4.2.13 Related Requirements
- FR-1: Unified Fullscreen Modal Component
- FR-2: True Fullscreen Display
- FR-9: Image Display Features

---

### UC-003: Close Modal

**Use Case ID:** UC-003  
**Use Case Name:** Close Modal  
**Version:** 1.0  
**Date:** 2024-01-XX  
**Author:** Development Team

#### 4.3.1 Brief Description
User closes the fullscreen modal using various methods (close button, backdrop, keyboard, gesture) and returns to the portfolio grid.

#### 4.3.2 Actors
- **Primary:** Portfolio Viewer

#### 4.3.3 Preconditions
- Modal is currently open
- Video or image is displayed in modal

#### 4.3.4 Postconditions
- **Success:** Modal is closed, user returns to grid, video playback stopped (if applicable), resources cleaned up
- **Failure:** Modal remains open (should not happen)

#### 4.3.5 Main Flow
1. User wants to close modal
2. User clicks close button (X) OR clicks backdrop OR presses ESC key OR swipes down (mobile)
3. System detects close action
4. System stops video playback (if video was playing)
5. System calculates zoom-out animation values (back to original position)
6. System animates modal content with zoom-out animation
7. System fades out backdrop
8. System cleans up resources (event listeners, video element, etc.)
9. System restores body scroll
10. System restores focus to original element (video/photo card)
11. System closes modal (sets isOpen to false)
12. Use case ends successfully

#### 4.3.6 Alternative Flows

**Alternative Flow 1: Close via Close Button**
- At step 2 of main flow
- User clicks close button (X) in top-right corner
- System triggers close flow
- Continue at step 3 of main flow

**Alternative Flow 2: Close via Backdrop**
- At step 2 of main flow
- User clicks on dark backdrop (outside modal content)
- System triggers close flow
- Continue at step 3 of main flow

**Alternative Flow 3: Close via ESC Key**
- At step 2 of main flow
- User presses ESC key on keyboard
- System triggers close flow
- Continue at step 3 of main flow

**Alternative Flow 4: Close via Swipe Down (Mobile)**
- At step 2 of main flow
- User swipes down on mobile device
- System detects swipe gesture
- System triggers close flow
- Continue at step 3 of main flow

#### 4.3.7 Exception Flows

**Exception Flow 1: Video in Native Fullscreen**
- At step 4 of main flow
- Video is in native fullscreen mode
- System exits native fullscreen first
- System waits for fullscreen exit
- Continue at step 5 of main flow

**Exception Flow 2: Image is Zoomed**
- At step 4 of main flow
- Image is zoomed in (> 1x scale)
- System resets zoom to 1x
- System then continues close flow
- Continue at step 5 of main flow

#### 4.3.8 Business Rules
- Video playback must stop when modal closes
- Resources must be cleaned up to prevent memory leaks
- Focus must be restored to maintain accessibility

#### 4.3.9 Special Requirements
- **Performance:** Close animation should complete in < 300ms
- **Usability:** Smooth zoom-out animation
- **Accessibility:** Focus restoration

#### 4.3.10 Assumptions
- User can perform close action (click, keyboard, gesture)

#### 4.3.11 Related Use Cases
- **Included by:** UC-001, UC-002, UC-004, UC-005, UC-006
- **Related:** All use cases that open modal

#### 4.3.12 Related User Stories
- US-003: Close Fullscreen Modal

#### 4.3.13 Related Requirements
- FR-1: Unified Fullscreen Modal Component

---

### UC-004: Navigate Gallery (Next/Previous)

**Use Case ID:** UC-004  
**Use Case Name:** Navigate Gallery (Next/Previous)  
**Version:** 1.0  
**Date:** 2024-01-XX  
**Author:** Development Team

#### 4.4.1 Brief Description
User navigates to the next or previous item in the gallery without closing the modal, using arrow buttons, keyboard, or swipe gestures.

#### 4.4.2 Actors
- **Primary:** Portfolio Viewer

#### 4.4.3 Preconditions
- Modal is open
- Gallery has multiple items (more than one)
- Current item is displayed

#### 4.4.4 Postconditions
- **Success:** Next or previous item is displayed, user continues viewing
- **Failure:** Navigation fails, current item remains displayed

#### 4.4.5 Main Flow
1. User wants to view next/previous item
2. User clicks next button (→) OR clicks previous button (←) OR presses right arrow key OR presses left arrow key OR swipes left (next) OR swipes right (previous)
3. System detects navigation action
4. System determines target item (next or previous)
5. System preloads target item in background (if not already loaded)
6. System starts transition animation (fade out current, fade in target)
7. System stops current item (video playback, if applicable)
8. System loads target item (video or image)
9. System displays target item with smooth transition
10. System updates metadata overlay with new item info
11. System updates gallery indicators (dots/counter)
12. If target is video, system starts playback (autoplay)
13. Use case ends successfully

#### 4.4.6 Alternative Flows

**Alternative Flow 1: Loop Navigation (Last to First)**
- At step 4 of main flow
- User navigates next from last item
- System wraps to first item
- Continue at step 5 of main flow

**Alternative Flow 2: Loop Navigation (First to Last)**
- At step 4 of main flow
- User navigates previous from first item
- System wraps to last item
- Continue at step 5 of main flow

**Alternative Flow 3: Swipe Gesture (Mobile)**
- At step 2 of main flow
- User swipes left/right on mobile device
- System detects swipe direction and velocity
- System validates swipe meets threshold (50px distance, 0.3 velocity)
- System triggers navigation
- Continue at step 4 of main flow

#### 4.4.7 Exception Flows

**Exception Flow 1: Target Item Load Failure**
- At step 8 of main flow
- Target item fails to load (network error, invalid URL)
- System shows error state for target item
- System displays retry button
- User clicks retry
- System retries loading target item
- If retry succeeds, continue at step 9 of main flow
- If retry fails, use case ends with error, previous item remains

**Exception Flow 2: Single Item in Gallery**
- At step 1 of main flow
- Gallery has only one item
- System hides navigation buttons/controls
- Use case does not proceed (no navigation possible)

**Exception Flow 3: Swipe During Video Playback**
- At step 2 of main flow
- User swipes while video controls are visible/active
- System detects touch is on video controls area
- System ignores swipe gesture (does not navigate)
- Use case does not proceed

#### 4.4.8 Business Rules
- Navigation must loop (last → first, first → last)
- Previous item must stop playing when navigating away
- Next/previous item should preload for smooth transitions

#### 4.4.9 Special Requirements
- **Performance:** Navigation transition should complete in < 200ms
- **Usability:** Smooth fade transition between items
- **Performance:** Preload next/previous item for instant navigation

#### 4.4.10 Assumptions
- Gallery has multiple items
- Items are accessible (valid URLs)

#### 4.4.11 Related Use Cases
- **Extends:** UC-001 (Open Video), UC-002 (Open Photo)
- **Includes:** UC-003 (Close Modal)

#### 4.4.12 Related User Stories
- US-004: Navigate with Arrow Buttons
- US-005: Navigate with Keyboard
- US-006: Navigate with Swipe Gestures

#### 4.4.13 Related Requirements
- FR-3: Gallery/Carousel Navigation

---

### UC-005: View Video in Native Fullscreen

**Use Case ID:** UC-005  
**Use Case Name:** View Video in Native Fullscreen  
**Version:** 1.0  
**Date:** 2024-01-XX  
**Author:** Development Team

#### 4.5.1 Brief Description
User enters native fullscreen mode for video playback on mobile device, providing optimal playback experience with device native controls.

#### 4.5.2 Actors
- **Primary:** Mobile User
- **Secondary:** Device (iOS/Android)

#### 4.5.3 Preconditions
- Modal is open
- Video is displayed and playing
- User is on mobile device (iOS/Android)
- Browser/device supports native fullscreen API

#### 4.5.4 Postconditions
- **Success:** Video is in native fullscreen mode, user can watch with optimal controls
- **Failure:** Native fullscreen fails, video remains in modal view

#### 4.5.5 Main Flow
1. User is watching video in modal
2. User double-taps video OR taps fullscreen button
3. System detects fullscreen request
4. System requests native fullscreen for video element
5. Device enters native fullscreen mode
6. System hides modal UI (close button, metadata, etc.)
7. Video displays in native fullscreen with device controls
8. User watches video with native controls
9. User exits native fullscreen (device gesture or button)
10. Device exits native fullscreen
11. System shows modal UI again
12. Video returns to modal view
13. Use case ends successfully

#### 4.5.6 Alternative Flows

**Alternative Flow 1: iOS Safari Specific**
- At step 4 of main flow
- User is on iOS Safari
- System uses webkitEnterFullscreen() method (iOS specific)
- Continue at step 5 of main flow

**Alternative Flow 2: Android Chrome**
- At step 4 of main flow
- User is on Android Chrome
- System uses standard requestFullscreen() API
- Continue at step 5 of main flow

#### 4.5.7 Exception Flows

**Exception Flow 1: Native Fullscreen Not Supported**
- At step 4 of main flow
- Browser/device doesn't support native fullscreen API
- System shows message: "Native fullscreen not available"
- System falls back to CSS fullscreen (modal fills viewport)
- Use case continues with fallback

**Exception Flow 2: Fullscreen Request Rejected**
- At step 5 of main flow
- User or browser rejects fullscreen request
- System shows message: "Fullscreen blocked"
- Video remains in modal view
- Use case ends, user continues in modal

**Exception Flow 3: Orientation Change in Fullscreen**
- At step 8 of main flow
- User rotates device while in fullscreen
- System handles orientation change
- Video adjusts to new orientation
- Continue at step 9 of main flow

#### 4.5.8 Business Rules
- Native fullscreen is optional (fallback to modal view)
- Video playback continues when entering/exiting fullscreen
- Modal state is preserved when entering/exiting fullscreen

#### 4.5.9 Special Requirements
- **Performance:** Fullscreen transition should be smooth
- **Usability:** Native controls should be accessible

#### 4.5.10 Assumptions
- Device supports native fullscreen
- Video element can enter fullscreen

#### 4.5.11 Related Use Cases
- **Extends:** UC-001 (Open Video)
- **Includes:** UC-003 (Close Modal)

#### 4.5.12 Related User Stories
- US-007: View Video in Native Fullscreen on Mobile

#### 4.5.13 Related Requirements
- FR-5: Native Fullscreen API Integration
- FR-6: Platform-Specific Optimization

---

### UC-006: Zoom Image

**Use Case ID:** UC-006  
**Use Case Name:** Zoom Image  
**Version:** 1.0  
**Date:** 2024-01-XX  
**Author:** Development Team

#### 4.6.1 Brief Description
User zooms in on an image using pinch gesture or double-tap, then pans to view different areas of the zoomed image.

#### 4.6.2 Actors
- **Primary:** Mobile User, Portfolio Viewer

#### 4.6.3 Preconditions
- Modal is open
- Image is displayed
- User is on device with touch support (mobile/tablet) OR desktop with mouse

#### 4.6.4 Postconditions
- **Success:** Image is zoomed, user can view details, user can pan zoomed image
- **Failure:** Zoom fails, image remains at normal scale

#### 4.6.5 Main Flow
1. User views image in modal
2. User pinches image with two fingers (mobile) OR double-taps image (mobile/desktop)
3. System detects zoom gesture
4. System calculates zoom scale (1x to 2x max)
5. System centers zoom on pinch point (or tap point for double-tap)
6. System applies zoom transform to image
7. Image zooms in smoothly
8. User pans image to view different areas (if zoomed > 1x)
9. User pinches out OR double-taps again to zoom out
10. System resets zoom to 1x
11. Image returns to normal scale
12. Use case ends successfully

#### 4.6.6 Alternative Flows

**Alternative Flow 1: Pinch to Zoom**
- At step 2 of main flow
- User pinches with two fingers
- System detects pinch scale from touch points
- System calculates zoom scale from pinch
- Continue at step 4 of main flow

**Alternative Flow 2: Double-Tap to Zoom**
- At step 2 of main flow
- User double-taps image
- System detects double-tap
- System toggles between 1x and 2x zoom
- If currently 1x, zoom to 2x
- If currently 2x, zoom to 1x
- Continue at step 6 of main flow

**Alternative Flow 3: Pan When Zoomed**
- At step 8 of main flow
- User drags image while zoomed
- System detects drag gesture
- System calculates pan offset
- System applies translate transform
- System constrains pan to image boundaries
- Image moves following finger/cursor
- Continue at step 9 of main flow

#### 4.6.7 Exception Flows

**Exception Flow 1: Zoom Limit Reached**
- At step 4 of main flow
- User tries to zoom beyond 2x maximum
- System clamps zoom to 2x maximum
- Continue at step 6 of main flow

**Exception Flow 2: Swipe Conflict**
- At step 8 of main flow
- User tries to swipe to navigate while image is zoomed
- System detects image is zoomed (> 1x)
- System disables swipe navigation
- System handles as pan gesture instead
- Continue at step 8 of main flow

#### 4.6.8 Business Rules
- Maximum zoom is 2x (200%)
- Minimum zoom is 1x (100%)
- Pan is only enabled when zoomed > 1x
- Swipe navigation is disabled when zoomed

#### 4.6.9 Special Requirements
- **Performance:** Zoom/pan should be smooth (60fps)
- **Usability:** Intuitive pinch and double-tap gestures

#### 4.6.10 Assumptions
- Device supports multi-touch (for pinch)
- Image is loaded and displayed

#### 4.6.11 Related Use Cases
- **Extends:** UC-002 (Open Photo)
- **Related:** UC-004 (Gallery Navigation - swipe conflict)

#### 4.6.12 Related User Stories
- US-008: Pinch to Zoom on Images

#### 4.6.13 Related Requirements
- FR-4: Touch Gesture Support
- FR-9: Image Display Features

---

### UC-007: Navigate with Keyboard

**Use Case ID:** UC-007  
**Use Case Name:** Navigate with Keyboard  
**Version:** 1.0  
**Date:** 2024-01-XX  
**Author:** Development Team

#### 4.7.1 Brief Description
User navigates and controls the modal using only keyboard, including opening, closing, and gallery navigation.

#### 4.7.2 Actors
- **Primary:** Accessibility User, Portfolio Viewer

#### 4.7.3 Preconditions
- User has keyboard available
- Modal can be opened (via keyboard navigation to video/photo card)

#### 4.7.4 Postconditions
- **Success:** User can fully navigate and control modal with keyboard
- **Failure:** Keyboard navigation doesn't work, user cannot access features

#### 4.7.5 Main Flow
1. User navigates to video/photo card using Tab key
2. User presses Enter/Space to open modal
3. System opens modal (see UC-001 or UC-002)
4. System traps focus within modal
5. User presses Tab to navigate between interactive elements (close button, nav buttons)
6. User presses Enter/Space to activate focused element
7. User presses Left/Right arrow keys to navigate gallery
8. User presses ESC to close modal
9. System closes modal (see UC-003)
10. System restores focus to original card
11. Use case ends successfully

#### 4.7.6 Alternative Flows

**Alternative Flow 1: Focus Trap**
- At step 4 of main flow
- System prevents Tab from leaving modal
- When focus reaches last element, Tab wraps to first element
- When focus reaches first element, Shift+Tab wraps to last element
- Continue at step 5 of main flow

#### 4.7.7 Exception Flows

**Exception Flow 1: Video Controls Keyboard Navigation**
- At step 5 of main flow
- User is navigating within video controls (native controls)
- System allows video controls to handle keyboard events
- System doesn't intercept keyboard events for video controls
- After video controls, focus returns to modal elements

#### 4.7.8 Business Rules
- All interactive elements must be keyboard accessible
- Focus must be trapped within modal when open
- Focus must be restored when modal closes
- Arrow keys navigate gallery, not focus

#### 4.7.9 Special Requirements
- **Accessibility:** WCAG 2.1 AA compliance
- **Usability:** Logical tab order
- **Accessibility:** Visible focus indicators

#### 4.7.10 Assumptions
- User has keyboard
- Browser supports keyboard events

#### 4.7.11 Related Use Cases
- **Includes:** UC-001, UC-002, UC-003, UC-004
- **Related:** UC-008 (Screen Reader Support)

#### 4.7.12 Related User Stories
- US-009: Navigate Modal with Keyboard

#### 4.7.13 Related Requirements
- FR-7: Accessibility Features

---

### UC-008: Handle Media Load Errors

**Use Case ID:** UC-008  
**Use Case Name:** Handle Media Load Errors  
**Version:** 1.0  
**Date:** 2024-01-XX  
**Author:** Development Team

#### 4.8.1 Brief Description
System handles errors when loading videos or images, displaying error states and providing retry options.

#### 4.8.2 Actors
- **Primary:** Portfolio Viewer
- **Secondary:** Browser, Network

#### 4.8.3 Preconditions
- Modal is open
- System is attempting to load video or image

#### 4.8.4 Postconditions
- **Success:** Error is handled gracefully, user can retry or close modal
- **Failure:** Error state persists, user cannot view media

#### 4.8.5 Main Flow
1. System attempts to load media (video or image)
2. Media load fails (network error, 404, invalid format, codec unsupported)
3. System detects error
4. System hides loading indicator
5. System displays error state:
   - Error message: "Failed to load [video/image]"
   - Media title/identifier (if available)
   - Retry button
   - Close button (still accessible)
6. User sees error state
7. User clicks retry button OR closes modal
8. If user clicks retry:
   - System retries loading media
   - If retry succeeds, media loads and displays
   - If retry fails, error state remains
9. If user closes modal:
   - System closes modal (see UC-003)
10. Use case ends

#### 4.8.6 Alternative Flows

**Alternative Flow 1: Retry Success**
- At step 8 of main flow
- User clicks retry
- System retries loading
- Media loads successfully
- System hides error state
- System displays media
- Use case ends successfully

**Alternative Flow 2: Multiple Retries**
- At step 8 of main flow
- User clicks retry multiple times
- System retries up to 3 times
- After 3 failures, system shows permanent error state
- System disables retry button or shows "Max retries reached"

#### 4.8.7 Exception Flows

**Exception Flow 1: Network Offline**
- At step 2 of main flow
- User is offline (no network connectivity)
- System detects offline state
- System shows error message: "No internet connection"
- System enables retry when online (listens for online event)

#### 4.8.8 Business Rules
- Errors must be handled gracefully (no crashes)
- User must be able to close modal even in error state
- Retry should be available (up to reasonable limit)

#### 4.8.9 Special Requirements
- **Usability:** Clear error messages
- **Usability:** Easy retry mechanism
- **Reliability:** No crashes on errors

#### 4.8.10 Assumptions
- Errors can occur (network, invalid URLs, etc.)

#### 4.8.11 Related Use Cases
- **Included in:** UC-001, UC-002, UC-004
- **Related:** All use cases that load media

#### 4.8.12 Related User Stories
- (Error handling covered in multiple stories)

#### 4.8.13 Related Requirements
- Error Handling (non-functional requirement)

---

## 5. Use Case Relationships

### 5.1 Include Relationships
- UC-001 **includes** UC-003 (Close Modal)
- UC-002 **includes** UC-003 (Close Modal)
- UC-004 **includes** UC-003 (Close Modal)
- UC-005 **includes** UC-003 (Close Modal)
- UC-006 **includes** UC-003 (Close Modal)
- UC-007 **includes** UC-001, UC-002, UC-003, UC-004 (Keyboard navigation covers all)

### 5.2 Extend Relationships
- UC-004 **extends** UC-001, UC-002 (Gallery navigation extends open modal)
- UC-005 **extends** UC-001 (Native fullscreen extends video modal)
- UC-006 **extends** UC-002 (Zoom extends photo modal)
- UC-007 **extends** UC-001, UC-002, UC-003, UC-004 (Keyboard navigation extends all)

---

## 6. Use Case Prioritization

| Use Case ID | Priority | Business Value | Complexity | Dependencies |
|-------------|----------|----------------|------------|--------------|
| UC-001 | P0 | High | High | None |
| UC-002 | P0 | High | Medium | None |
| UC-003 | P0 | High | Low | UC-001, UC-002 |
| UC-004 | P1 | High | High | UC-001, UC-002 |
| UC-005 | P1 | High | High | UC-001 |
| UC-006 | P1 | Medium | High | UC-002 |
| UC-007 | P1 | High | Medium | UC-001, UC-002, UC-004 |
| UC-008 | P1 | High | Medium | UC-001, UC-002 |

---

## 7. References

- [PRD](./prd.md)
- [Design Document](./design-document.md)
- [User Stories](./user-stories.md)
- [Requirements Mapping](./requirements-mapping.md)

---

## 8. Change Log

| Date | Use Case ID | Change | Author |
|------|-------------|--------|--------|
| 2024-01-XX | - | Initial draft | Development Team |


