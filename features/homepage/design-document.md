# Design Document

**Feature Name:** Immersive Homepage Redesign  
**Version:** 1.0  
**Date:** 2024-12-19  
**Author:** Engineering Team  
**Status:** Draft  
**Related PRD:** `/features/homepage/prd.md`

---

## 1. Overview

### 1.1 Purpose
This design document outlines the technical architecture and implementation approach for the immersive homepage redesign featuring full-screen video background, organic photo layout, and centered navigation.

### 1.2 Scope
- Homepage component redesign
- Global background color update (#F2F0EF)
- Photo positioning algorithm
- Video background implementation
- Navigation component redesign
- Responsive design considerations

### 1.3 Design Goals
- Create immersive, full-screen video experience
- Implement organic, messy-but-clean photo layout
- Provide bold, centered navigation
- Maintain performance and accessibility
- Ensure responsive design across devices

---

## 2. System Architecture

### 2.1 High-Level Architecture

```
HomePage Component
├── VideoBackground (Full-screen osamason video)
├── PhotoScatterLayout (Organic photo positioning)
├── CenteredNavigation (Bold navigation text)
└── Layout Wrapper (Background color, positioning)
```

### 2.2 Component Diagram

```
HomePage
│
├── VideoBackgroundLayer
│   ├── <video> element (osamason video)
│   ├── Overlay (dark gradient for text contrast)
│   └── GrainTexture (optional aesthetic overlay)
│
├── PhotoScatterContainer
│   ├── PhotoItem[] (dynamically positioned)
│   │   ├── Image element
│   │   ├── Hover effects
│   │   └── Click handlers
│   └── Positioning algorithm
│
└── CenteredNavigation
    ├── NavLink (Videos)
    ├── NavLink (Photos)
    ├── NavLink (Other)
    └── NavLink (Contact)
```

### 2.3 Technology Stack
| Layer | Technology | Rationale |
|-------|-----------|----------|
| Frontend Framework | React + TypeScript | Existing codebase |
| Styling | Tailwind CSS | Existing styling system |
| Animations | Framer Motion | Existing animation library |
| Routing | React Router DOM | Existing routing solution |
| Video | HTML5 Video | Native browser support |

---

## 3. Data Model

### 3.1 Data Structures

```typescript
// Photo positioning data
interface PhotoPosition {
  id: string;
  x: number; // Percentage or pixels
  y: number; // Percentage or pixels
  rotation: number; // Degrees (-15 to 15)
  scale: number; // 0.8 to 1.2
  zIndex: number; // For layering
}

// Photo item with position
interface ScatteredPhoto {
  photo: Photo; // From existing Photo type
  position: PhotoPosition;
}

// Navigation item
interface NavItem {
  label: string;
  path: string;
  position: { x: number; y: number }; // Centered positioning
}
```

### 3.2 Data Flow

1. **Page Load:**
   - Fetch osamason video URL from constants
   - Load photos from constants/photos.ts
   - Calculate photo positions using algorithm
   - Render video background
   - Render scattered photos
   - Render centered navigation

2. **Photo Positioning:**
   - Generate positions for 15 photos
   - Ensure no overlap with navigation area
   - Ensure photos stay within viewport (150px buffer from footer)
   - Allow minimal overlap between photos (maxSize * 1.2 spacing)
   - Apply random rotation and scale
   - Assign z-index for layering
   - Each photo cycles independently with random timing (3-20 seconds)
   - Photos change position when cycling (0.9 second transition delay)

3. **Navigation:**
   - Center navigation text on page
   - Position above/below video center
   - Handle click events
   - Navigate to respective routes

---

## 4. API Design

### 4.1 Component Props

```typescript
// HomePage component
interface HomePageProps {
  // No props - uses data from constants
}

// PhotoScatterLayout component
interface PhotoScatterLayoutProps {
  photos: Photo[];
  navigationBounds: { x: number; y: number; width: number; height: number };
  onPhotoClick?: (photo: Photo) => void;
}

// CenteredNavigation component
interface CenteredNavigationProps {
  items: NavItem[];
  onNavigate: (path: string) => void;
}
```

### 4.2 Internal Functions

```typescript
// Photo positioning algorithm
function calculatePhotoPositions(
  photos: Photo[],
  viewportWidth: number,
  viewportHeight: number,
  navigationBounds: Bounds
): PhotoPosition[] {
  // Algorithm to position photos organically
  // Avoid navigation area
  // Ensure no excessive overlap
  // Return array of positions
}

// Navigation positioning
function calculateNavigationPosition(
  viewportWidth: number,
  viewportHeight: number
): { x: number; y: number } {
  // Center navigation on screen
  // Account for text size
  // Return center coordinates
}
```

---

## 5. User Interface Design

### 5.1 UI/UX Principles
- **Video-First**: Video dominates visual space
- **Organic Layout**: Photos feel naturally placed
- **Bold Typography**: Navigation is prominent and clear
- **Minimal UI**: No traditional header/nav bar
- **Clean Messiness**: Intentional, curated organic feel

### 5.2 Key Components

**VideoBackgroundLayer:**
- Full viewport coverage
- Autoplay, loop, muted
- Dark overlay for text contrast
- Optional grain texture

**PhotoScatterLayout:**
- Organic positioning algorithm
- Random rotation (-15° to 15°)
- Varied scale (0.8x to 1.2x)
- Hover effects (scale, brightness)
- Click handlers for navigation

**CenteredNavigation:**
- Large, bold text (4xl-6xl)
- Centered horizontally and vertically
- Spaced evenly
- Hover effects (scale, color change)
- Clear visual hierarchy

### 5.3 Design Specifications

**Video Background:**
- Position: Fixed, full viewport
- Size: 100vw x 100vh
- Object-fit: Cover
- Z-index: 0 (behind everything)

**Photos:**
- Count: 15 photos displayed simultaneously
- Size: 120-200px (mobile), 180-280px (desktop) - responsive
- Rotation: -15° to 15° randomly
- Scale: 0.8 to 1.2 randomly
- Spacing: Minimal overlap allowed (maxSize * 1.2 minimum distance)
- Z-index: 1-10 (varied for depth)
- Cycling: Each photo cycles independently at random intervals (3-20 seconds)
- Position Changes: Photos change position when they cycle (0.9 second transition delay)
- Footer Avoidance: 150px buffer from bottom to avoid footer text

**Navigation:**
- Font size: 4xl-6xl (responsive)
- Font weight: 900 (black)
- Color: White with text shadow
- Spacing: 2rem between items
- Position: Center of viewport
- Z-index: 20 (above photos)

### 5.4 Responsive Design

**Mobile (< 768px):**
- Video: Full screen, may crop
- Photos: Smaller (120-200px), 15 photos displayed
- Navigation: Smaller text (3xl), stacked vertically
- Spacing: Reduced margins, minimal overlap allowed

**Tablet (768px - 1024px):**
- Video: Full screen
- Photos: Medium size (200-300px)
- Navigation: Medium text (4xl-5xl)
- Layout: Adjusted spacing

**Desktop (> 1024px):**
- Video: Full screen
- Photos: Full size (180-280px), 15 photos displayed
- Navigation: Large text (5xl-6xl)
- Layout: Optimal spacing, minimal overlap, spread across viewport

---

## 6. Security Design

### 6.1 Authentication & Authorization
- No authentication required (public homepage)
- No user data collection

### 6.2 Data Protection
- Video and photos are public assets
- No sensitive data displayed
- Standard CORS policies apply

### 6.3 Input Validation
- Route validation for navigation
- Photo ID validation
- Video URL validation

---

## 7. Performance Considerations

### 7.1 Performance Targets
- **Initial Load:** < 3 seconds
- **Video Start:** < 2 seconds
- **Photo Render:** < 1 second after video
- **FPS:** 60fps for animations
- **Lighthouse Score:** > 90

### 7.2 Optimization Strategies
- **Video Optimization:**
  - Compress video file
  - Use appropriate codec (H.264 or WebM)
  - Preload metadata only
  - Lazy load if possible

- **Photo Optimization:**
  - Lazy load photos
  - Use WebP format
  - Responsive images (srcset)
  - Progressive loading
  - Independent cycle timers to prevent synchronized updates
  - Efficient position recalculation on cycle

- **Code Optimization:**
  - Memoize position calculations
  - Use React.memo for components
  - Debounce resize handlers
  - Code splitting for homepage

### 7.3 Caching Strategy
- Cache video file aggressively
- Cache photo images
- Browser caching for static assets
- Service worker for offline support (future)

---

## 8. Scalability Design

### 8.1 Horizontal Scaling
- Static assets served via CDN
- No server-side rendering needed
- Client-side only implementation

### 8.2 Database Scaling
- No database required
- Data from constants files
- Could move to CMS in future

### 8.3 Load Distribution
- CDN for video and images
- Browser caching
- Progressive loading

---

## 9. Error Handling & Resilience

### 9.1 Error Handling Strategy
- **Video Load Failure:**
  - Show fallback gradient/image
  - Display error message (optional)
  - Continue with photo layout

- **Photo Load Failure:**
  - Skip failed photos
  - Continue with available photos
  - Log error for debugging

- **Navigation Error:**
  - Handle invalid routes
  - Show 404 page
  - Maintain navigation state

### 9.2 Retry Logic
- Video: Retry once on failure
- Photos: No retry (skip if fails)
- Navigation: No retry needed

### 9.3 Fallback Mechanisms
- Video: Gradient background fallback
- Photos: Continue with available photos
- Navigation: Always visible, no fallback needed

---

## 10. Monitoring & Observability

### 10.1 Metrics
- **Page Load Time:** Track initial load
- **Video Load Time:** Track video start
- **Photo Render Time:** Track photo display
- **Navigation Clicks:** Track user navigation
- **Error Rate:** Track failures

### 10.2 Logging
- Log video load failures
- Log photo load failures
- Log navigation errors
- Log performance metrics

### 10.3 Alerting
- Alert on high error rate
- Alert on slow load times
- Alert on video failures

---

## 11. Testing Strategy

### 11.1 Unit Testing
- Photo positioning algorithm
- Navigation positioning
- Component rendering
- Error handling

### 11.2 Integration Testing
- Video loading
- Photo loading
- Navigation routing
- Responsive behavior

### 11.3 End-to-End Testing
- Full page load flow
- Navigation flow
- Photo interaction
- Responsive breakpoints

### 11.4 Performance Testing
- Load time testing
- Video playback testing
- Animation performance
- Memory usage

---

## 12. Deployment Strategy

### 12.1 Deployment Architecture
- Static build deployment
- No server-side changes needed
- CDN for assets

### 12.2 Rollout Plan
- **Phase 1:** Deploy to staging
- **Phase 2:** Test on staging
- **Phase 3:** Deploy to production
- **Phase 4:** Monitor and adjust

### 12.3 Rollback Plan
- Keep previous homepage version
- Feature flag for quick toggle
- Revert deployment if needed

---

## 13. Migration Plan

### 13.1 Data Migration
- No data migration needed
- Update constants if needed
- Update routes if needed

### 13.2 Feature Flags
- Use feature flag for homepage
- Allow A/B testing
- Quick rollback capability

### 13.3 Backward Compatibility
- Maintain existing routes
- Keep other pages unchanged
- Ensure navigation still works

---

## 14. Alternative Approaches Considered

### 14.1 Canvas-Based Photo Layout
- **Pros:** More control, better performance
- **Cons:** More complex, accessibility concerns
- **Why Not Chosen:** CSS/React approach is simpler and more accessible

### 14.2 Grid-Based Photo Layout
- **Pros:** Easier to implement, predictable
- **Cons:** Doesn't match "messy but clean" aesthetic
- **Why Not Chosen:** Doesn't meet design requirements

### 14.3 Video as Overlay
- **Pros:** Easier positioning
- **Cons:** Doesn't create full-screen immersive experience
- **Why Not Chosen:** Doesn't meet design requirements

---

## 15. Open Questions & Risks

### 15.1 Open Questions
- [x] Exact number of photos to display? **15 photos**
- [x] Should photos be clickable or decorative? **Clickable**
- [x] Exact positioning algorithm parameters? **Minimal overlap (maxSize * 1.2), 150px footer buffer**
- [x] Should video have overlay effects? **Dark grainy overlay implemented**
- [x] Animation timing and easing? **Independent 3-20 second cycles, 0.9s transition delay**

### 15.2 Technical Risks
| Risk | Impact | Mitigation |
|------|--------|------------|
| Video file too large | High | Optimize, compress, progressive loading |
| Photo positioning conflicts | Medium | Careful algorithm, collision detection |
| Performance on mobile | High | Responsive design, lazy loading |
| Accessibility concerns | Medium | ARIA labels, keyboard nav, contrast |

---

## 16. Implementation Phases

### Phase 1: Foundation
- Update global background color
- Create VideoBackgroundLayer component
- Set up basic homepage structure

### Phase 2: Photo Layout
- Implement photo positioning algorithm
- Create PhotoScatterLayout component
- Add hover effects and interactions

### Phase 3: Navigation
- Create CenteredNavigation component
- Implement navigation routing
- Add hover effects

### Phase 4: Polish
- Responsive design adjustments
- Performance optimization
- Accessibility improvements
- Testing and refinement

---

## 17. Dependencies

### 17.1 External Dependencies
- React Router DOM (existing)
- Framer Motion (existing)
- Tailwind CSS (existing)
- Browser video support

### 17.2 Internal Dependencies
- Constants: videos.ts, photos.ts
- Routes: routes.ts
- Types: types.ts
- Existing Layout component

---

## 18. References

- PRD: `/features/homepage/prd.md`
- User Stories: `/features/homepage/user-stories.md`
- Current Homepage: `/src/pages/HomePage.tsx`
- Photo Data: `/src/constants/photos.ts`
- Video Data: `/src/constants/videos.ts`
- Design System: `/features/redesign2/`

---

## 19. Approval

| Role | Name | Date | Signature |
|------|------|------|-----------|
| Engineering Lead | | | |
| Architect | | | |
| Security Review | | | |
| DevOps Lead | | | |

