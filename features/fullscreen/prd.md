# Product Requirements Document (PRD): Fullscreen Modal System

**Feature Name:** Fullscreen Modal System  
**Version:** 1.0  
**Date:** 2024-01-XX  
**Author:** Development Team  
**Status:** Draft  
**Related Documents:** [Design Document](./design-document.md), [User Stories](./user-stories.md), [Use Cases](./use-cases.md)

---

## 1. Executive Summary

### 1.1 Overview
The Fullscreen Modal System provides a unified, platform-optimized solution for displaying videos and photos in immersive fullscreen experiences. This system replaces the current separate VideoModal and ImageModal components with a single, feature-rich modal that works seamlessly across web browsers, iOS, and Android devices.

### 1.2 Business Objectives
- **Enhance User Experience**: Provide immersive, distraction-free viewing of portfolio content
- **Improve Mobile Engagement**: Optimize video and photo viewing for mobile devices (iOS/Android)
- **Increase Accessibility**: Make content accessible to all users through proper ARIA labels, keyboard navigation, and screen reader support
- **Maintain Creative Aesthetic**: Preserve the portfolio's unique visual identity (Carson-Oliver-West-Weirdcore design philosophy)
- **Reduce Friction**: Enable seamless navigation between media items without closing/reopening modals

### 1.3 Success Metrics
| Metric | Target | Measurement Method |
|--------|--------|-------------------|
| Modal Open Time | < 300ms | Performance API timing |
| Video Start Time | < 1s (desktop), < 2s (mobile) | Video element events |
| Mobile Video Playback Success Rate | > 95% | Analytics tracking |
| Accessibility Score | WCAG 2.1 AA compliance | Automated testing tools |
| User Engagement | 30% increase in average viewing time | Analytics tracking |
| Gallery Navigation Usage | 40% of users navigate between items | User interaction tracking |

---

## 2. Problem Statement

### 2.1 Current State
The portfolio currently uses two separate modal components:
- **VideoModal**: Displays videos at 95vw/95vh with basic controls, zoom-in animation, and metadata overlay
- **ImageModal**: Displays images at 90vw/90vh with zoom-in animation and metadata overlay

Both modals have limitations:
- Inconsistent sizing (95% vs 90%)
- Limited mobile optimization (iOS video playback issues)
- No gallery/carousel navigation
- Limited touch gesture support
- Accessibility gaps (keyboard navigation, screen readers)
- No native fullscreen API integration
- Suboptimal performance on mobile devices

### 2.2 User Pain Points
1. **Mobile Video Playback Issues**: Videos may not play correctly on iOS Safari or Android browsers
2. **No Gallery Navigation**: Users must close and reopen modals to view next/previous item
3. **Limited Touch Interactions**: No swipe gestures, pinch-to-zoom, or pull-to-close on mobile
4. **Accessibility Barriers**: Difficult to navigate with keyboard or screen readers
5. **Inconsistent Experience**: Different behaviors between video and image modals
6. **Suboptimal Sizing**: Not truly fullscreen, especially on mobile devices
7. **Performance**: Slow loading, especially on mobile networks

### 2.3 Business Impact
- **Lost Engagement**: Users may leave if videos don't play correctly on mobile
- **Reduced Accessibility**: Excludes users who rely on assistive technologies
- **Poor Mobile Experience**: Mobile users (majority of traffic) have suboptimal experience
- **Inconsistent Brand**: Different modal behaviors undermine the cohesive brand experience
- **Lower Conversion**: Friction in viewing content may reduce portfolio effectiveness

---

## 3. Target Users

### 3.1 Primary Users
- **Portfolio Viewers (Web)**: Desktop and laptop users browsing the portfolio
  - Demographics: Creative professionals, potential clients, fans
  - Goals: View videos and photos in high quality, immersive experience
  - Pain Points: Current modal limitations, inconsistent sizing
  
- **Mobile Users (iOS/Android)**: Smartphone and tablet users
  - Demographics: On-the-go viewers, mobile-first users
  - Goals: Watch videos and view photos seamlessly on mobile devices
  - Pain Points: Video playback issues, lack of touch gestures, suboptimal controls

- **Accessibility Users**: Users relying on assistive technologies
  - Demographics: Users with visual, motor, or cognitive disabilities
  - Goals: Access and navigate content with keyboard, screen readers, or other assistive tools
  - Pain Points: Limited keyboard navigation, missing ARIA labels, poor focus management

### 3.2 Secondary Users
- **Content Creators**: The videographer themselves (admin/internal use)
- **Developers**: Future maintainers of the codebase

---

## 4. Feature Description

### 4.1 Feature Overview
The Fullscreen Modal System is a unified modal component that displays videos and photos in truly fullscreen mode (100vw/100vh with safe area handling) with advanced features:

- **Platform Optimization**: Different strategies for web, iOS, and Android
- **Gallery Navigation**: Swipe or arrow keys to navigate between items
- **Touch Gestures**: Swipe, pinch-to-zoom, double-tap, pull-to-close
- **Native Fullscreen**: Leverages browser/device native fullscreen APIs
- **Accessibility**: Full keyboard navigation, ARIA labels, screen reader support
- **Performance**: Lazy loading, adaptive quality, intersection observer
- **Unified API**: Single component interface for videos and photos

### 4.2 Key Capabilities
1. **True Fullscreen Display**: 100vw/100vh with safe area insets for notched devices
2. **Gallery/Carousel Navigation**: Navigate between items without closing modal
3. **Touch Gesture Support**: Swipe, pinch-to-zoom, double-tap, pull-to-close
4. **Native Fullscreen API**: Browser/device native fullscreen for optimal video playback
5. **Platform-Specific Optimization**: iOS and Android specific handling
6. **Accessibility**: Keyboard navigation, ARIA labels, focus management, screen reader support
7. **Performance Optimization**: Lazy loading, adaptive quality, preloading next item
8. **Unified Interface**: Single component for videos and photos with consistent behavior

### 4.3 User Value Proposition
- **Immersive Experience**: Truly fullscreen viewing with no distractions
- **Seamless Navigation**: Browse through portfolio items without interruption
- **Mobile-First**: Optimized for the majority of users on mobile devices
- **Accessible**: Available to all users regardless of abilities or devices
- **Fast & Smooth**: Optimized performance for quick loading and smooth interactions
- **Consistent**: Unified experience across all media types

---

## 5. Functional Requirements

### 5.1 Core Features

#### FR-1: Unified Fullscreen Modal Component
- **Priority:** P0 (Critical)
- **Dependencies:** None
- **Description:** Single component that handles both videos and photos with consistent API
- **Acceptance Criteria:**
  - Component accepts either video or photo data
  - Displays content in true fullscreen (100vw/100vh with safe area insets)
  - Maintains creative aesthetic (Carson-Oliver-West-Weirdcore design)
  - Works on web, iOS, and Android
  - Smooth zoom-in/out animations from clicked position

#### FR-2: True Fullscreen Display
- **Priority:** P0 (Critical)
- **Dependencies:** FR-1
- **Description:** Display content at 100vw/100vh with proper safe area handling
- **Acceptance Criteria:**
  - Uses 100vw/100vh dimensions
  - Handles safe area insets for notched devices (iOS)
  - Proper padding to avoid UI elements (status bar, home indicator)
  - Dark backdrop (95% opacity black)
  - Content centered and properly scaled

#### FR-3: Gallery/Carousel Navigation
- **Priority:** P1 (High)
- **Dependencies:** FR-1
- **Description:** Navigate between items within the modal without closing
- **Acceptance Criteria:**
  - Arrow buttons (left/right) visible on hover (desktop) or tap (mobile)
  - Keyboard arrow keys navigate between items
  - Swipe gestures navigate on touch devices
  - Smooth transitions between items
  - Loop navigation (last → first, first → last)
  - Preload next/previous item for smooth transitions

#### FR-4: Touch Gesture Support
- **Priority:** P1 (High)
- **Dependencies:** FR-1
- **Description:** Full touch gesture support for mobile devices
- **Acceptance Criteria:**
  - Swipe left/right navigates between items
  - Pinch-to-zoom for images (2x max zoom)
  - Double-tap to toggle zoom/restore for images
  - Pull down to close modal (mobile)
  - Swipe up to close modal (mobile alternative)
  - Gesture feedback (visual indicators)

#### FR-5: Native Fullscreen API Integration
- **Priority:** P1 (High)
- **Dependencies:** FR-1, FR-2
- **Description:** Leverage browser/device native fullscreen for optimal video playback
- **Acceptance Criteria:**
  - Detect native fullscreen API availability
  - Toggle native fullscreen for videos (button or double-tap)
  - Handle fullscreen state changes (enter/exit events)
  - Fallback gracefully if native fullscreen not available
  - Works on iOS Safari, Android Chrome, desktop browsers

#### FR-6: Platform-Specific Optimization
- **Priority:** P1 (High)
- **Dependencies:** FR-1
- **Description:** Optimize behavior for iOS, Android, and web platforms
- **Acceptance Criteria:**
  - iOS: PlaysInline attribute, safe area handling, native controls option
  - Android: WebView compatibility, gesture support, native fullscreen
  - Web: Standard fullscreen API, mouse interactions, keyboard navigation
  - Platform detection and appropriate feature flags
  - Graceful degradation for unsupported features

#### FR-7: Accessibility Features
- **Priority:** P1 (High)
- **Dependencies:** FR-1
- **Description:** Full accessibility support (WCAG 2.1 AA)
- **Acceptance Criteria:**
  - Keyboard navigation (Tab, Enter, Escape, Arrow keys)
  - ARIA labels and roles for all interactive elements
  - Focus management (trap focus, restore on close)
  - Screen reader announcements for state changes
  - High contrast mode support
  - Reduced motion support (respect prefers-reduced-motion)

#### FR-8: Video Playback Features
- **Priority:** P0 (Critical)
- **Dependencies:** FR-1
- **Description:** Advanced video playback controls and features
- **Acceptance Criteria:**
  - Autoplay when modal opens (with sound policy handling)
  - Standard video controls (play, pause, volume, progress, fullscreen)
  - Custom controls overlay (optional, matches design aesthetic)
  - Video rotation support (270deg rotation if needed)
  - Loading states and error handling
  - Preload next video for gallery navigation

#### FR-9: Image Display Features
- **Priority:** P0 (Critical)
- **Dependencies:** FR-1, FR-4
- **Description:** Advanced image display with zoom and pan
- **Acceptance Criteria:**
  - Display images at full resolution
  - Pinch-to-zoom (2x max zoom)
  - Pan/drag when zoomed
  - Double-tap to toggle zoom
  - Smooth zoom animations
  - Progressive image loading

#### FR-10: Metadata Display
- **Priority:** P2 (Medium)
- **Dependencies:** FR-1
- **Description:** Display media metadata in overlay
- **Acceptance Criteria:**
  - Video metadata: Artist / Song / Tour and Date (matching legend format)
  - Photo metadata: Title, Client, Year
  - Bottom overlay with gradient (black/transparent)
  - Hide/show on tap/interaction
  - Accessible (ARIA labels, screen reader support)

### 5.2 User Flows

#### Primary Flow: Open Video in Fullscreen
1. User clicks video card in grid
2. Modal opens with zoom-in animation from clicked position
3. Video starts loading and playing automatically
4. User watches video with controls
5. User navigates to next video (arrow key, swipe, or button)
6. Next video loads and plays
7. User closes modal (Escape, close button, or swipe down)
8. Modal closes with zoom-out animation back to grid

#### Primary Flow: Open Photo in Fullscreen
1. User clicks photo card in grid
2. Modal opens with zoom-in animation from clicked position
3. Image loads and displays at full resolution
4. User zooms in with pinch gesture or double-tap
5. User pans image when zoomed
6. User navigates to next photo (arrow key, swipe, or button)
7. Next photo loads and displays
8. User closes modal (Escape, close button, or swipe down)

#### Mobile Flow: Native Fullscreen Video
1. User opens video in modal
2. User double-taps video or taps fullscreen button
3. Video enters native fullscreen mode
4. User watches video in native fullscreen
5. User exits native fullscreen (device gesture or button)
6. Returns to modal view
7. User closes modal

### 5.3 Edge Cases
- **No media data**: Show error state with message
- **Failed to load media**: Show error state with retry option
- **Single item in gallery**: Hide navigation arrows/controls
- **Very large images**: Progressive loading, placeholder while loading
- **Very long videos**: Show loading progress, allow seeking
- **Network failure**: Show offline message, retry option
- **Autoplay blocked**: Show play button overlay, manual play required
- **Orientation change**: Handle rotation, maintain state
- **Keyboard not available (mobile)**: Touch-only interactions
- **Screen reader active**: Enhanced announcements, simplified controls

---

## 6. Non-Functional Requirements

### 6.1 Performance
- **Modal Open Time**: < 300ms from click to modal visible
- **Video Start Time**: < 1s on desktop, < 2s on mobile (after modal opens)
- **Image Load Time**: < 500ms for initial display (progressive loading)
- **Gallery Navigation**: < 200ms transition between items
- **FPS**: 60fps for all animations and transitions
- **Memory Usage**: Efficient cleanup, no memory leaks

### 6.2 Scalability
- **Large Galleries**: Support 100+ items without performance degradation
- **High Resolution**: Support 4K images and videos
- **Multiple Modals**: Prevent multiple modals from opening simultaneously

### 6.3 Reliability
- **Error Handling**: Graceful degradation for all error scenarios
- **Fallbacks**: Fallback UI if features not supported
- **Testing**: 90%+ code coverage, E2E tests for critical flows

### 6.4 Usability
- **Learnability**: Intuitive interactions, no tutorial needed
- **Efficiency**: Quick access to all features (keyboard shortcuts, gestures)
- **Satisfaction**: Smooth, polished experience matching creative aesthetic
- **Error Recovery**: Clear error messages, easy recovery paths

### 6.5 Accessibility
- **WCAG 2.1 AA Compliance**: All criteria met
- **Keyboard Navigation**: Full functionality without mouse
- **Screen Reader Support**: Proper ARIA labels, announcements
- **Focus Management**: Logical focus order, visible focus indicators
- **Color Contrast**: 4.5:1 ratio for all text (WCAG AA)

### 6.6 Compatibility
- **Browsers**: Chrome, Firefox, Safari, Edge (latest 2 versions)
- **iOS**: iOS 13+ (Safari)
- **Android**: Android 8+ (Chrome, Samsung Internet)
- **Responsive**: Works on screens from 320px to 4K

---

## 7. Out of Scope

- **Video editing features**: No trimming, filters, or editing within modal
- **Social sharing**: No share buttons or social media integration
- **Comments/annotations**: No commenting or annotation features
- **Download functionality**: No download buttons or save-to-device features
- **Playlists**: No playlist creation or management
- **Analytics integration**: Analytics handled separately (may integrate later)
- **Multi-select**: No selecting multiple items at once
- **Background playback**: Videos pause when modal closes (no background audio)

---

## 8. Dependencies

### 8.1 Technical Dependencies
- **React**: Current framework (React 18+)
- **Framer Motion**: Animation library (existing dependency)
- **TypeScript**: Type safety (existing)
- **Tailwind CSS**: Styling (existing)

### 8.2 External Dependencies
- **Browser APIs**: Fullscreen API, Intersection Observer API, Pointer Events API
- **Device APIs**: Safe Area API (iOS), Viewport API

### 8.3 Blocking Dependencies
- None (can be implemented incrementally)

---

## 9. Assumptions

- Users have JavaScript enabled (required for React app)
- Modern browsers with ES6+ support
- Touch devices support standard touch events
- Video codecs are supported by browsers (H.264, WebM)
- Images are in web-compatible formats (JPEG, PNG, WebP)
- Network connectivity is available (with offline handling)

---

## 10. Risks and Mitigations

| Risk | Impact | Probability | Mitigation Strategy |
|------|--------|-------------|---------------------|
| iOS video playback issues | High | Medium | Use playsInline, native fullscreen API, extensive testing on iOS devices |
| Performance on low-end devices | Medium | Medium | Progressive loading, adaptive quality, performance budgets |
| Browser compatibility issues | Medium | Low | Feature detection, polyfills, graceful degradation |
| Accessibility compliance gaps | High | Low | Automated testing, manual testing with screen readers, WCAG audit |
| Complex gesture handling | Medium | Medium | Use established gesture libraries, extensive testing, fallback to buttons |
| Native fullscreen API inconsistencies | Medium | Medium | Platform-specific handling, fallback to CSS fullscreen |

---

## 11. Timeline and Milestones

### 11.1 Phases
- **Phase 1: Core Modal (MVP)** - 2 weeks
  - Unified modal component
  - Basic video/image display
  - Zoom-in/out animations
  - Close functionality
  
- **Phase 2: Gallery Navigation** - 1 week
  - Arrow navigation
  - Keyboard navigation
  - Swipe gestures
  - Preloading
  
- **Phase 3: Platform Optimization** - 2 weeks
  - iOS optimization
  - Android optimization
  - Native fullscreen API
  - Touch gestures
  
- **Phase 4: Accessibility & Polish** - 1 week
  - ARIA labels
  - Keyboard navigation
  - Screen reader support
  - Performance optimization

### 11.2 Key Milestones
- **Milestone 1**: Core modal working on web - Week 2
- **Milestone 2**: Gallery navigation functional - Week 3
- **Milestone 3**: Mobile optimization complete - Week 5
- **Milestone 4**: Accessibility compliant - Week 6
- **Milestone 5**: Production ready - Week 6

---

## 12. Success Criteria

### 12.1 Launch Criteria
- [ ] All P0 requirements implemented and tested
- [ ] WCAG 2.1 AA compliance verified
- [ ] Performance targets met (modal open < 300ms, video start < 2s)
- [ ] Works on iOS Safari, Android Chrome, desktop browsers
- [ ] No critical bugs or accessibility issues
- [ ] Code reviewed and approved
- [ ] Documentation complete

### 12.2 Post-Launch Validation
- Monitor analytics for modal open time, video start time
- Track user engagement (viewing time, gallery navigation usage)
- Collect user feedback on mobile experience
- Monitor error rates and performance metrics
- Accessibility audit with real users

---

## 13. Open Questions

- [ ] Should we support background audio playback when modal closes?
- [ ] Should we add video playback speed controls?
- [ ] Should we support picture-in-picture mode for videos?
- [ ] Should we add image filters/effects within the modal?
- [ ] What is the maximum number of items to preload in gallery?

---

## 14. References

- [Current VideoModal Component](../../src/components/video/VideoModal.tsx)
- [Current ImageModal Component](../../src/components/video/ImageModal.tsx)
- [Design System Documentation](../redesign2/README.md)
- [WCAG 2.1 Guidelines](https://www.w3.org/WAI/WCAG21/quickref/)
- [MDN Fullscreen API](https://developer.mozilla.org/en-US/docs/Web/API/Fullscreen_API)
- [iOS Safari Video Best Practices](https://webkit.org/blog/6784/new-video-policies-for-ios/)

---

## 15. Approval

| Role | Name | Date | Signature |
|------|------|------|-----------|
| Product Manager | | | |
| Engineering Lead | | | |
| Design Lead | | | |
| Accessibility Lead | | | |

