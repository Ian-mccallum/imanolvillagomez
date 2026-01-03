# Design Document: Fullscreen Modal System

**Feature Name:** Fullscreen Modal System  
**Version:** 1.0  
**Date:** 2024-01-XX  
**Author:** Development Team  
**Status:** Draft  
**Related PRD:** [PRD](./prd.md)

---

## 1. Overview

### 1.1 Purpose
This design document provides the technical architecture, component design, API specifications, and implementation details for the Fullscreen Modal System. This system replaces the current VideoModal and ImageModal components with a unified, platform-optimized solution.

### 1.2 Scope
This design covers:
- Unified FullscreenModal component architecture
- Platform detection and optimization strategies
- Touch gesture handling system
- Native fullscreen API integration
- Gallery navigation system
- Accessibility implementation
- Performance optimization strategies
- Animation and transition system

### 1.3 Design Goals
- **Unified API**: Single component interface for videos and photos
- **Platform Optimization**: Optimal experience on web, iOS, and Android
- **Performance**: Fast loading, smooth animations, efficient resource usage
- **Accessibility**: WCAG 2.1 AA compliance
- **Maintainability**: Clean, modular, well-documented code
- **Creative Aesthetic**: Maintains Carson-Oliver-West-Weirdcore design philosophy

---

## 2. System Architecture

### 2.1 High-Level Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                    Pages (VideosPage, PhotosPage)            │
│  - Manage modal state                                        │
│  - Pass media items and context                              │
└──────────────────────────┬──────────────────────────────────┘
                           │
                           ▼
┌─────────────────────────────────────────────────────────────┐
│              FullscreenModal (Main Component)                │
│  - Unified interface for videos/photos                       │
│  - Platform detection                                        │
│  - State management                                          │
│  - Animation orchestration                                   │
└──────┬──────────────────────┬──────────────────────┬────────┘
       │                      │                      │
       ▼                      ▼                      ▼
┌──────────────┐    ┌──────────────┐    ┌──────────────┐
│ VideoPlayer  │    │ ImageViewer  │    │ GalleryNav   │
│ Component    │    │ Component    │    │ Component    │
│              │    │              │    │              │
│ - Video      │    │ - Image      │    │ - Arrow      │
│   playback   │    │   display    │    │   buttons    │
│ - Controls   │    │ - Zoom/Pan   │    │ - Indicators │
│ - Native     │    │ - Gestures   │    │ - Preloading │
│   fullscreen │    │              │    │              │
└──────────────┘    ┌──────────────┘    └──────────────┘
                    │
                    ▼
       ┌────────────────────────────┐
       │  Touch Gesture System      │
       │  - Swipe detection         │
       │  - Pinch-to-zoom           │
       │  - Pull-to-close           │
       │  - Platform-specific       │
       └────────────────────────────┘
                    │
                    ▼
       ┌────────────────────────────┐
       │  Platform Detection        │
       │  - iOS/Android/Web         │
       │  - Feature detection       │
       │  - Capability flags        │
       └────────────────────────────┘
```

### 2.2 Component Diagram

```
FullscreenModal (Main Container)
├── ModalBackdrop
│   └── Dark overlay (95% black opacity)
│
├── ModalContent (Animated Container)
│   ├── VideoPlayer (if type === 'video')
│   │   ├── Video Element
│   │   ├── Video Controls (Custom/Native)
│   │   ├── Loading State
│   │   ├── Error State
│   │   └── Native Fullscreen Toggle
│   │
│   ├── ImageViewer (if type === 'image')
│   │   ├── Image Element
│   │   ├── Zoom/Pan Container
│   │   ├── Loading State
│   │   ├── Error State
│   │   └── Zoom Controls (Optional)
│   │
│   ├── Metadata Overlay
│   │   ├── Video Metadata (Artist/Song/Tour + Date)
│   │   └── Photo Metadata (Title/Client/Year)
│   │
│   └── Close Button
│
├── GalleryNavigation
│   ├── Previous Button
│   ├── Next Button
│   ├── Gallery Indicators (dots/counter)
│   └── Keyboard Navigation Handler
│
└── Touch Gesture Handler
    ├── Swipe Detector
    ├── Pinch Detector
    ├── Pull-to-Close Detector
    └── Double-Tap Handler
```

### 2.3 Technology Stack

| Layer | Technology | Rationale |
|-------|-----------|----------|
| Framework | React 18+ | Existing framework, hooks for state management |
| Animation | Framer Motion | Existing library, smooth animations, gesture support |
| Styling | Tailwind CSS | Existing styling system, utility classes |
| Type Safety | TypeScript | Type safety, better DX |
| Gesture Detection | Custom + Pointer Events API | Native browser API, performant |
| Fullscreen API | Native Fullscreen API | Browser/device native support |

---

## 3. Data Model

### 3.1 Type Definitions

```typescript
// Media types
type MediaType = 'video' | 'image';

// Unified media item interface
interface MediaItem {
  id: string;
  type: MediaType;
  
  // Video-specific
  videoUrl?: string;
  thumbnail?: string;
  rotation?: number; // For video rotation (270deg)
  
  // Image-specific
  imageUrl?: string;
  
  // Common metadata
  title?: string;
  artist?: string;
  song?: string;
  tour?: string;
  client?: string;
  date?: string;
  year?: number;
}

// Modal state
interface ModalState {
  isOpen: boolean;
  currentItem: MediaItem | null;
  currentIndex: number;
  items: MediaItem[];
  initialPosition?: { x: number; y: number; width: number; height: number };
  isNativeFullscreen: boolean;
  isLoading: boolean;
  hasError: boolean;
}

// Platform detection
interface PlatformInfo {
  isIOS: boolean;
  isAndroid: boolean;
  isWeb: boolean;
  supportsFullscreenAPI: boolean;
  supportsPointerEvents: boolean;
  safeAreaInsets: {
    top: number;
    bottom: number;
    left: number;
    right: number;
  };
}

// Gesture state
interface GestureState {
  isDragging: boolean;
  startX: number;
  startY: number;
  currentX: number;
  currentY: number;
  deltaX: number;
  deltaY: number;
  velocity: number;
}

// Zoom state (for images)
interface ZoomState {
  scale: number;
  translateX: number;
  translateY: number;
  minScale: number;
  maxScale: number;
}
```

### 3.2 Component Props

```typescript
interface FullscreenModalProps {
  // Core props
  isOpen: boolean;
  onClose: () => void;
  items: MediaItem[];
  initialIndex?: number;
  initialPosition?: { x: number; y: number; width: number; height: number };
  
  // Configuration
  enableGalleryNavigation?: boolean;
  enableNativeFullscreen?: boolean;
  enableTouchGestures?: boolean;
  enableKeyboardNavigation?: boolean;
  
  // Callbacks
  onItemChange?: (item: MediaItem, index: number) => void;
  onVideoPlay?: (item: MediaItem) => void;
  onVideoPause?: (item: MediaItem) => void;
  onImageZoom?: (scale: number) => void;
  
  // Styling
  className?: string;
  theme?: 'dark' | 'light';
}

interface VideoPlayerProps {
  video: MediaItem;
  isPlaying: boolean;
  onPlay: () => void;
  onPause: () => void;
  onEnded: () => void;
  onError: (error: Error) => void;
  enableNativeFullscreen?: boolean;
  rotation?: number;
  className?: string;
}

interface ImageViewerProps {
  image: MediaItem;
  enableZoom?: boolean;
  enablePan?: boolean;
  onZoom?: (scale: number) => void;
  className?: string;
}

interface GalleryNavigationProps {
  currentIndex: number;
  totalItems: number;
  onPrevious: () => void;
  onNext: () => void;
  enableKeyboard?: boolean;
  className?: string;
}
```

### 3.3 Data Flow

```
User Action (Click/Tap)
    │
    ▼
Page Component (VideosPage/PhotosPage)
    │
    ├── Sets modal state (isOpen: true, items, initialIndex)
    │
    ▼
FullscreenModal Component
    │
    ├── Detects platform (iOS/Android/Web)
    ├── Calculates initial animation values from initialPosition
    ├── Loads current item (video/image)
    │
    ├── Video Flow:
    │   ├── VideoPlayer component renders
    │   ├── Video element loads
    │   ├── Autoplay attempts (with policy handling)
    │   └── Controls overlay appears
    │
    └── Image Flow:
        ├── ImageViewer component renders
        ├── Image loads (progressive)
        ├── Zoom/Pan handlers initialize
        └── Gesture handlers attach

Gallery Navigation Flow:
    │
    ├── User swipes/arrows/keys to navigate
    │
    ├── Preload next/previous item
    ├── Animate transition
    ├── Update currentIndex
    ├── Call onItemChange callback
    │
    └── Load new item (video/image)
```

---

## 4. API Design

### 4.1 Component API

#### FullscreenModal

```typescript
<FullscreenModal
  isOpen={isModalOpen}
  onClose={handleClose}
  items={mediaItems}
  initialIndex={selectedIndex}
  initialPosition={clickPosition}
  enableGalleryNavigation={true}
  enableNativeFullscreen={true}
  enableTouchGestures={true}
  enableKeyboardNavigation={true}
  onItemChange={(item, index) => {
    console.log('Item changed:', item, index);
  }}
  onVideoPlay={(item) => {
    // Analytics tracking
  }}
  theme="dark"
/>
```

### 4.2 Hooks API

```typescript
// Platform detection hook
const platformInfo = usePlatformDetection();

// Native fullscreen hook
const {
  isFullscreen,
  enterFullscreen,
  exitFullscreen,
  toggleFullscreen,
} = useNativeFullscreen(videoRef);

// Touch gestures hook
const {
  swipeDirection,
  pinchScale,
  isDragging,
  handlers,
} = useTouchGestures({
  onSwipeLeft: () => navigateNext(),
  onSwipeRight: () => navigatePrevious(),
  onSwipeDown: () => handleClose(),
  onPinch: (scale) => handleZoom(scale),
  onDoubleTap: () => toggleZoom(),
});

// Image zoom/pan hook
const {
  scale,
  translateX,
  translateY,
  zoom,
  reset,
  handlers,
} = useImageZoom({
  minScale: 1,
  maxScale: 2,
  enablePan: true,
});
```

### 4.3 Utility Functions

```typescript
// Platform detection
export function detectPlatform(): PlatformInfo;

// Safe area calculation (iOS)
export function getSafeAreaInsets(): { top, bottom, left, right };

// Animation value calculation
export function calculateAnimationValues(
  initialPosition: { x, y, width, height },
  targetDimensions: { width, height }
): AnimationValues;

// Video preloading
export function preloadVideo(url: string): Promise<void>;

// Image preloading
export function preloadImage(url: string): Promise<HTMLImageElement>;

// Gesture detection
export function detectSwipe(
  startX: number,
  startY: number,
  endX: number,
  endY: number,
  threshold: number
): 'left' | 'right' | 'up' | 'down' | null;
```

---

## 5. User Interface Design

### 5.1 UI/UX Principles

- **Video-First**: Media dominates, everything else is secondary
- **Minimal Interface**: Clean, unobtrusive controls
- **Dark Aesthetic**: Black backdrop (95% opacity), media as light
- **Smooth Animations**: 60fps, hardware-accelerated transitions
- **Touch-Friendly**: Large hit targets, gesture support
- **Accessible**: High contrast, keyboard navigable, screen reader friendly

### 5.2 Key Screens/Components

#### Fullscreen Modal Layout

```
┌─────────────────────────────────────────┐
│                                         │
│         [Dark Backdrop 95% black]       │
│                                         │
│    ┌───────────────────────────────┐   │
│    │                               │   │
│    │    [Media Content Area]       │   │
│    │    (Video or Image)           │   │
│    │                               │   │
│    │                               │   │
│    │                    [X] Close  │   │
│    │                               │   │
│    └───────────────────────────────┘   │
│                                         │
│    [← Prev]          [Next →]          │
│                                         │
│    ┌───────────────────────────────┐   │
│    │ Metadata Overlay (Bottom)     │   │
│    │ Artist / Song / Tour          │   │
│    │ Date                          │   │
│    └───────────────────────────────┘   │
│                                         │
└─────────────────────────────────────────┘
```

#### Desktop Layout
- Close button: Top-right corner, visible on hover
- Navigation arrows: Left/right edges, visible on hover
- Metadata: Bottom overlay, always visible (or hide on interaction)
- Video controls: Native browser controls or custom overlay

#### Mobile Layout
- Close button: Top-right corner, always visible
- Navigation arrows: Hidden (swipe gestures instead)
- Metadata: Bottom overlay, hide on tap
- Video controls: Native controls (iOS/Android optimized)
- Gestures: Swipe to navigate, pinch to zoom (images), pull to close

### 5.3 Design Mockups

**Desktop Fullscreen Video:**
- Video player centered, max 95vw/95vh (safe padding)
- Dark backdrop with subtle grain texture
- Close button (white circle, black X) top-right
- Navigation arrows (white, semi-transparent) on edges
- Metadata overlay (gradient black/transparent) at bottom

**Mobile Fullscreen Video:**
- Video player fills screen (100vw/100vh with safe area insets)
- Native fullscreen toggle available
- Close button smaller, always visible
- Swipe gestures for navigation
- Metadata overlay dismissible (tap to hide/show)

**Desktop Fullscreen Image:**
- Image centered, max 90vw/90vh
- Zoom controls (optional) or double-click to zoom
- Pan when zoomed (mouse drag)
- Close button and navigation as with video

**Mobile Fullscreen Image:**
- Image fills screen
- Pinch-to-zoom (2x max)
- Pan when zoomed (touch drag)
- Double-tap to toggle zoom
- Pull-down to close

### 5.4 Responsive Design

**Breakpoints:**
- Mobile: < 768px (touch interactions, native controls)
- Tablet: 768px - 1024px (hybrid, touch + hover)
- Desktop: > 1024px (hover interactions, custom controls)

**Safe Area Handling (iOS):**
```css
/* Use env() for safe area insets */
.modal-content {
  padding-top: env(safe-area-inset-top);
  padding-bottom: env(safe-area-inset-bottom);
  padding-left: env(safe-area-inset-left);
  padding-right: env(safe-area-inset-right);
}
```

---

## 6. Security Design

### 6.1 Authentication & Authorization
- No authentication required (public portfolio)
- No user-specific data or permissions

### 6.2 Data Protection
- Media URLs are public assets
- No sensitive data in modal
- XSS prevention: React's built-in escaping, no `dangerouslySetInnerHTML`

### 6.3 Input Validation
- Validate media URLs before loading
- Sanitize user input (if any) for metadata
- Validate gesture inputs (prevent injection through gesture data)

---

## 7. Performance Considerations

### 7.1 Performance Targets
- **Modal Open**: < 300ms (click to visible)
- **Video Start**: < 1s (desktop), < 2s (mobile)
- **Image Load**: < 500ms (initial display)
- **Gallery Navigation**: < 200ms (transition)
- **FPS**: 60fps (all animations)
- **Memory**: Efficient cleanup, no leaks

### 7.2 Optimization Strategies

**Lazy Loading:**
- Load current item immediately
- Preload next/previous item in background
- Use Intersection Observer for gallery items outside viewport

**Image Optimization:**
- Progressive image loading (low-res → high-res)
- Responsive images (srcset for different resolutions)
- Lazy load images until modal opens

**Video Optimization:**
- Preload metadata only (preload="metadata")
- Load video on demand (when modal opens)
- Use appropriate video formats (H.264 for compatibility)
- Adaptive bitrate (if using streaming)

**Animation Optimization:**
- Use CSS transforms (GPU-accelerated)
- Use `will-change` for animated properties
- Debounce/throttle gesture handlers
- Use `requestAnimationFrame` for smooth updates

**Memory Management:**
- Cleanup event listeners on unmount
- Dispose video elements properly
- Clear image cache when not needed
- Use WeakMap for references if needed

### 7.3 Caching Strategy
- Browser cache for media assets (standard HTTP caching)
- No custom caching layer needed
- Prefetch next item for smooth navigation

---

## 8. Scalability Design

### 8.1 Horizontal Scaling
- Client-side only, no server scaling needed
- Component is self-contained, multiple instances possible

### 8.2 Gallery Size
- Supports 100+ items without performance issues
- Virtual scrolling not needed (modal shows one item at a time)
- Preload strategy: current, next, previous only

### 8.3 Large Media Files
- Progressive loading for images
- Video streaming for large videos
- Error handling for network issues

---

## 9. Error Handling & Resilience

### 9.1 Error Handling Strategy

**Video Load Errors:**
```typescript
- Detect video load failure
- Show error state with message
- Provide retry button
- Fallback to thumbnail if available
```

**Image Load Errors:**
```typescript
- Detect image load failure
- Show error state with message
- Provide retry button
- Show placeholder image
```

**Network Errors:**
```typescript
- Detect offline state
- Show offline message
- Provide retry when online
- Cache last successfully loaded item
```

**Native Fullscreen Errors:**
```typescript
- Try native fullscreen
- Catch rejection/error
- Fallback to CSS fullscreen
- Graceful degradation
```

### 9.2 Retry Logic
- Automatic retry (1-2 times) for transient errors
- Manual retry button for user-initiated retry
- Exponential backoff for network retries

### 9.3 Fallback Mechanisms
- Native fullscreen → CSS fullscreen → Modal view
- Touch gestures → Button navigation
- Custom controls → Native controls
- High-res image → Low-res image → Placeholder

---

## 10. Monitoring & Observability

### 10.1 Metrics
- Modal open time (Performance API)
- Video start time (video element events)
- Image load time (image load event)
- Gallery navigation time (transition duration)
- Error rates (error events)
- User interactions (clicks, swipes, keyboard)

### 10.2 Logging
- Console warnings for non-critical errors
- Error logging for failures
- Performance logging (dev mode)
- User interaction logging (analytics)

### 10.3 Alerting
- Not applicable (client-side only, no real-time monitoring)

---

## 11. Testing Strategy

### 11.1 Unit Testing
- Component rendering
- State management
- Utility functions (platform detection, gesture detection)
- Hook logic (useNativeFullscreen, useTouchGestures)

### 11.2 Integration Testing
- Modal open/close flow
- Video playback flow
- Image display flow
- Gallery navigation flow
- Gesture interactions

### 11.3 End-to-End Testing
- Full user flows (click → modal → watch → close)
- Mobile gestures (swipe, pinch, pull)
- Keyboard navigation
- Accessibility (screen reader, keyboard)

### 11.4 Performance Testing
- Load time benchmarks
- Animation frame rate (60fps target)
- Memory leak detection
- Large gallery performance (100+ items)

---

## 12. Deployment Strategy

### 12.1 Deployment Architecture
- Client-side component, deployed with main app
- No separate deployment needed
- Feature flag for gradual rollout (optional)

### 12.2 Rollout Plan
- **Phase 1**: Deploy to staging, test on iOS/Android devices
- **Phase 2**: Deploy to production with feature flag (disabled by default)
- **Phase 3**: Enable for small percentage of users (A/B test)
- **Phase 4**: Full rollout if metrics positive

### 12.3 Rollback Plan
- Feature flag to disable new modal
- Revert to old VideoModal/ImageModal components
- No data migration needed

---

## 13. Migration Plan

### 13.1 Component Migration
- Replace VideoModal usage with FullscreenModal
- Replace ImageModal usage with FullscreenModal
- Update prop interfaces
- Test all pages using modals

### 13.2 Feature Flags
- `ENABLE_NEW_FULLSCREEN_MODAL` flag
- Gradual migration (page by page)
- A/B testing option

### 13.3 Backward Compatibility
- Maintain old components during transition
- Support both old and new APIs temporarily
- Remove old components after full migration

---

## 14. Alternative Approaches Considered

### 14.1 Approach A: Keep Separate Components
- **Pros:** Simpler, smaller components, less abstraction
- **Cons:** Code duplication, inconsistent behavior, maintenance burden
- **Why Not Chosen:** Unified approach reduces duplication and ensures consistency

### 14.2 Approach B: Third-Party Library (e.g., react-image-gallery, react-player)
- **Pros:** Pre-built solution, less code to write
- **Cons:** Less control, may not match design aesthetic, bundle size
- **Why Not Chosen:** Need full control for custom design and platform optimization

### 14.3 Approach C: CSS-Only Fullscreen (No Native API)
- **Pros:** Simpler implementation, more control
- **Cons:** Poor mobile video playback, no native controls
- **Why Not Chosen:** Native fullscreen provides better mobile experience

---

## 15. Open Questions & Risks

### 15.1 Open Questions
- [ ] Should we support picture-in-picture mode for videos?
- [ ] Should we add video playback speed controls?
- [ ] Should we support background audio when modal closes?
- [ ] Maximum zoom level for images? (Currently 2x)
- [ ] Should we add image filters/effects?

### 15.2 Technical Risks

| Risk | Impact | Mitigation |
|------|--------|------------|
| iOS video playback issues | High | Extensive testing, playsInline, native fullscreen fallback |
| Gesture conflict with browser | Medium | Prevent default, stop propagation, careful event handling |
| Performance on low-end devices | Medium | Progressive loading, adaptive quality, performance budgets |
| Native fullscreen API inconsistencies | Medium | Feature detection, platform-specific handling, fallbacks |

---

## 16. Implementation Phases

### Phase 1: Core Modal (MVP)
- [ ] Create FullscreenModal component structure
- [ ] Implement basic video display
- [ ] Implement basic image display
- [ ] Add zoom-in/out animations
- [ ] Add close functionality
- [ ] Platform detection utility

### Phase 2: Gallery Navigation
- [ ] Arrow button navigation
- [ ] Keyboard navigation (arrow keys)
- [ ] Swipe gesture navigation
- [ ] Gallery indicators
- [ ] Preloading next/previous items

### Phase 3: Platform Optimization
- [ ] iOS optimization (playsInline, safe area)
- [ ] Android optimization (gestures, native fullscreen)
- [ ] Native fullscreen API integration
- [ ] Touch gesture system (pinch, double-tap, pull)

### Phase 4: Accessibility & Polish
- [ ] ARIA labels and roles
- [ ] Keyboard navigation enhancements
- [ ] Screen reader support
- [ ] Focus management
- [ ] Performance optimization
- [ ] Error handling improvements

---

## 17. Dependencies

### 17.1 External Dependencies
- React 18+ (existing)
- Framer Motion (existing)
- Tailwind CSS (existing)
- TypeScript (existing)

### 17.2 Browser APIs
- Fullscreen API (with polyfill if needed)
- Intersection Observer API
- Pointer Events API
- Safe Area API (iOS)

### 17.3 Internal Dependencies
- Media types (Video, Photo interfaces)
- Design system tokens (colors, spacing)
- UI components (buttons, overlays)

---

## 18. References

- [PRD](./prd.md)
- [User Stories](./user-stories.md)
- [Use Cases](./use-cases.md)
- [Current VideoModal](../../src/components/video/VideoModal.tsx)
- [Current ImageModal](../../src/components/video/ImageModal.tsx)
- [MDN Fullscreen API](https://developer.mozilla.org/en-US/docs/Web/API/Fullscreen_API)
- [WCAG 2.1 Guidelines](https://www.w3.org/WAI/WCAG21/quickref/)
- [iOS Safari Video Best Practices](https://webkit.org/blog/6784/new-video-policies-for-ios/)

---

## 19. Approval

| Role | Name | Date | Signature |
|------|------|------|-----------|
| Engineering Lead | | | |
| Architect | | | |
| Design Lead | | | |
| Accessibility Lead | | | |


