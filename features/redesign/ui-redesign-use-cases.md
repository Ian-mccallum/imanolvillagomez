# Use Cases

**Feature Name:** UI Redesign - Imanol Villagomez Videography Portfolio  
**Version:** 1.0  
**Date:** 2024-12-28  
**Author:** Creative Director (Carson-Oliver-West-Weirdcore Collaboration)  
**Status:** Draft  
**Related PRD:** `features/ui-redesign-prd.md`  
**Related User Stories:** `features/ui-redesign-user-stories.md`

---

## 1. Overview

### 1.1 Purpose

This document provides detailed use cases describing how users interact with the redesigned portfolio website to achieve specific goals.

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
[User]
  ├── Browse Video Portfolio (UC-001)
  ├── View Video in Modal (UC-002)
  ├── Explore About Page (UC-003)
  └── Submit Contact Form (UC-004)
```

---

## 3. Actors

### 3.1 Primary Actors

- **User:** Website visitor browsing the portfolio
  - Role: Potential client, industry peer, fan/viewer
  - Goals: Browse videos, learn about Imanol, contact videographer

### 3.2 Secondary Actors

- **System:** Website, video player, form submission handler

---

## 4. Use Cases

### UC-001: Browse Video Portfolio

**Use Case ID:** UC-001  
**Use Case Name:** Browse Video Portfolio in Masonry Layout  
**Version:** 1.0  
**Date:** 2024-12-28  
**Author:** Creative Director

#### 4.1.1 Brief Description

User browses Imanol's video portfolio in a Pinterest-style masonry layout, seeing many appropriately-sized videos simultaneously.

#### 4.1.2 Actors

- **Primary:** User
- **Secondary:** System (website, video grid)

#### 4.1.3 Preconditions

- User has loaded the homepage/work page
- Videos are available in the system
- Browser supports CSS Grid/Columns

#### 4.1.4 Postconditions

- **Success:** User has viewed the video grid, scrolled through videos
- **Failure:** Empty state shown if no videos available

#### 4.1.5 Main Flow

1. User navigates to homepage/work page
2. System displays masonry grid layout with many videos (3-4 columns on desktop)
3. User sees videos appropriately sized (300-500px width)
4. User scrolls down to see more videos
5. Videos flow naturally in columns (Pinterest-style)
6. User sees experimental visual effects (grain, glitch, textures) on cards
7. User continues browsing through video grid
8. Use case ends successfully

#### 4.1.6 Alternative Flows

**Alternative Flow 1: Click Video Card**
- At step 7 of main flow
- User clicks on a video card
- System opens video modal (UC-002)
- Continue at step 8 of main flow

**Alternative Flow 2: Navigate to About Page**
- At step 7 of main flow
- User clicks "ABOUT" in navigation
- System navigates to About page (UC-003)
- Use case ends

**Alternative Flow 3: Navigate to Contact Page**
- At step 7 of main flow
- User clicks "CONTACT" in navigation
- System navigates to Contact page (UC-004)
- Use case ends

#### 4.1.7 Exception Flows

**Exception Flow 1: No Videos Available**
- At step 2 of main flow
- System detects no videos available
- System displays creative empty state message ("NO WORK", "Check back soon")
- Use case ends

**Exception Flow 2: Slow Network Connection**
- At step 2 of main flow
- System detects slow network
- System displays loading skeletons
- System lazy loads images below fold
- Continue at step 3 of main flow

**Exception Flow 3: Browser Doesn't Support Layout**
- At step 2 of main flow
- Browser doesn't support CSS Grid/Columns
- System falls back to standard grid layout
- Continue at step 3 of main flow

#### 4.1.8 Business Rules

- Videos must be appropriately sized (300-500px width)
- 3-4 videos per row on desktop
- Videos dominate 80% of visual weight
- Layout must be responsive

#### 4.1.9 Special Requirements

- **Performance:** Page load time < 3 seconds
- **Usability:** Intuitive browsing, clear video cards
- **Accessibility:** Keyboard navigation, screen reader support

#### 4.1.10 Assumptions

- Videos are pre-loaded and available
- Browser supports modern CSS features

#### 4.1.11 Related Use Cases

- **Includes:** None
- **Extends:** UC-002 (View Video in Modal)
- **Related:** UC-003, UC-004

#### 4.1.12 Related User Stories

- US-001: View Many Videos in Masonry Layout
- US-003: See Video Cards with Enhanced Visual Effects

#### 4.1.13 Related Requirements

- FR-1: Masonry Video Grid Layout
- FR-2: Standard Video Card Sizing
- FR-4: Enhanced Visual Effects

---

### UC-002: View Video in Modal

**Use Case ID:** UC-002  
**Use Case Name:** View Video in Full-Screen Modal  
**Version:** 1.0  
**Date:** 2024-12-28

#### 4.2.1 Brief Description

User clicks a video card to view the video in a full-screen modal with zoom-in animation.

#### 4.2.2 Actors

- **Primary:** User
- **Secondary:** System (video player, modal)

#### 4.2.3 Preconditions

- User is viewing video grid (UC-001)
- Video card is visible and clickable

#### 4.2.4 Postconditions

- **Success:** Video modal closes, user returns to grid
- **Failure:** Error message shown if video fails to load

#### 4.2.5 Main Flow

1. User clicks on video card
2. System calculates clicked position (x, y, width, height)
3. System opens modal with zoom-in animation from clicked position
4. System loads video file
5. Video autoplays when ready
6. System displays video player with controls
7. System shows video metadata (title, client, year) at bottom
8. System shows close button (X) in top right
9. User watches video
10. User clicks close button (X) or clicks backdrop
11. System closes modal with zoom-out animation
12. User returns to video grid
13. Use case ends successfully

#### 4.2.6 Alternative Flows

**Alternative Flow 1: Press ESC Key**
- At step 9 of main flow
- User presses ESC key
- Continue at step 11 of main flow

**Alternative Flow 2: Video Controls**
- At step 9 of main flow
- User uses video player controls (play, pause, volume, fullscreen)
- System responds to controls
- Continue at step 9 of main flow

#### 4.2.7 Exception Flows

**Exception Flow 1: Video Fails to Load**
- At step 4 of main flow
- Video file fails to load
- System displays error message ("Failed to load video")
- System shows close button
- User clicks close button
- Continue at step 11 of main flow

**Exception Flow 2: Autoplay Blocked**
- At step 5 of main flow
- Browser blocks autoplay
- System shows play button
- User clicks play button
- Video starts playing
- Continue at step 9 of main flow

#### 4.2.8 Business Rules

- Modal must animate smoothly (zoom-in from clicked position)
- Video must autoplay when possible
- Modal must be closeable via multiple methods (X button, backdrop, ESC)

#### 4.2.9 Special Requirements

- **Performance:** Smooth 60fps animations
- **Usability:** Clear close button, intuitive controls
- **Accessibility:** Keyboard navigation (ESC), ARIA labels

#### 4.2.10 Assumptions

- Video files are accessible and valid
- Browser supports video playback

#### 4.2.11 Related Use Cases

- **Includes:** None
- **Extends:** UC-001 (Browse Video Portfolio)
- **Related:** None

#### 4.2.12 Related User Stories

- US-002: Click Video to View in Full Screen Modal

#### 4.2.13 Related Requirements

- FR-2: Standard Video Card Sizing
- TR-002: Video Modal Implementation

---

### UC-003: Explore About Page

**Use Case ID:** UC-003  
**Use Case Name:** Explore About Page  
**Version:** 1.0  
**Date:** 2024-12-28

#### 4.3.1 Brief Description

User explores the About page to learn about Imanol Villagomez through an experimental, asymmetrical layout.

#### 4.3.2 Actors

- **Primary:** User
- **Secondary:** System (website)

#### 4.3.3 Preconditions

- User is on any page of the website
- Navigation is accessible

#### 4.3.4 Postconditions

- **Success:** User has read about Imanol, understands creative vision
- **Failure:** Page loads with fallback layout if errors occur

#### 4.3.5 Main Flow

1. User clicks "ABOUT" in navigation
2. System navigates to About page
3. System displays asymmetrical layout
4. System shows large "IMANOL VILLAGOMEZ" headline with glitch effect
5. User reads about Imanol (videographer description)
6. User sees experimental sections (rotated text, red accent borders)
7. User views work highlights section
8. User clicks "LET'S WORK" CTA button
9. System navigates to Contact page (UC-004)
10. Use case ends successfully

#### 4.3.6 Alternative Flows

**Alternative Flow 1: Navigate to Contact Page Directly**
- At step 8 of main flow
- User clicks "CONTACT" in navigation instead
- System navigates to Contact page (UC-004)
- Use case ends

**Alternative Flow 2: Navigate Back to Work**
- At step 7 of main flow
- User clicks "WORK" in navigation
- System navigates to Work page (UC-001)
- Use case ends

#### 4.3.7 Exception Flows

**Exception Flow 1: Page Fails to Load**
- At step 2 of main flow
- Page fails to load
- System shows error message
- User can navigate away
- Use case ends

#### 4.3.8 Business Rules

- Layout must be asymmetrical (not centered)
- Typography must be experimental but readable
- Glitch effects must be intentional

#### 4.3.9 Special Requirements

- **Performance:** Page load time < 3 seconds
- **Usability:** Readable despite experimental layout
- **Accessibility:** Screen reader support, keyboard navigation

#### 4.3.10 Assumptions

- Content is available and loaded
- Browser supports CSS transforms for rotations

#### 4.3.11 Related Use Cases

- **Includes:** None
- **Extends:** None
- **Related:** UC-001, UC-004

#### 4.3.12 Related User Stories

- US-005: Read About Imanol on Asymmetrical Page

#### 4.3.13 Related Requirements

- FR-6: Asymmetrical Page Layouts
- FR-3: Experimental Typography System

---

### UC-004: Submit Contact Form

**Use Case ID:** UC-004  
**Use Case Name:** Submit Contact Form  
**Version:** 1.0  
**Date:** 2024-12-28

#### 4.4.1 Brief Description

User submits a contact form with experimental design to contact Imanol Villagomez.

#### 4.4.2 Actors

- **Primary:** User
- **Secondary:** System (form handler, backend API)

#### 4.4.3 Preconditions

- User is on Contact page
- Form is loaded and functional

#### 4.4.4 Postconditions

- **Success:** Form submitted, success message shown
- **Failure:** Validation errors shown, form remains filled

#### 4.4.5 Main Flow

1. User navigates to Contact page
2. System displays experimental form layout
3. User sees form fields (name, email, subject, message)
4. User fills out name field
5. System validates name field (required)
6. User fills out email field
7. System validates email field (required, valid email format)
8. User fills out subject field (optional)
9. User fills out message field
10. System validates message field (required)
11. User clicks submit button
12. System validates all fields
13. System submits form to backend
14. System shows success message
15. System clears form
16. Use case ends successfully

#### 4.4.6 Alternative Flows

**Alternative Flow 1: Fill Fields with Focus States**
- At step 4-9 of main flow
- User focuses on each field
- System shows bold focus state (red/green accent border)
- User sees grain texture overlay
- Continue at next step of main flow

**Alternative Flow 2: Navigate Away**
- At step 4-10 of main flow
- User navigates to another page
- Form data is lost (no persistence)
- Use case ends

#### 4.4.7 Exception Flows

**Exception Flow 1: Validation Error**
- At step 12 of main flow
- System detects validation error (e.g., invalid email)
- System shows inline error message
- System highlights error field
- User corrects error
- Continue at step 11 of main flow

**Exception Flow 2: Form Submission Fails**
- At step 13 of main flow
- Backend API fails or network error
- System shows error message ("Failed to submit. Please try again.")
- Form data is preserved
- User can retry submission
- Continue at step 11 of main flow

#### 4.4.8 Business Rules

- Name, email, and message are required
- Email must be valid format
- Subject is optional
- Form must validate before submission

#### 4.4.9 Special Requirements

- **Performance:** Form submission < 2 seconds
- **Usability:** Clear validation messages, intuitive layout
- **Accessibility:** Keyboard navigation, screen reader support

#### 4.4.10 Assumptions

- Backend API endpoint exists
- Form submission handler is available

#### 4.4.11 Related Use Cases

- **Includes:** None
- **Extends:** UC-003 (Explore About Page)
- **Related:** None

#### 4.4.12 Related User Stories

- US-006: Submit Contact Form with Experimental Design

#### 4.4.13 Related Requirements

- FR-6: Asymmetrical Page Layouts
- TR-006: Contact Form Implementation

---

## 5. Use Case Relationships

### 5.1 Include Relationships

- None

### 5.2 Extend Relationships

- UC-002 **extends** UC-001 (View Video Modal extends Browse Portfolio)
- UC-004 **extends** UC-003 (Contact Form extends About Page navigation)

### 5.3 Generalization

- None

---

## 6. Activity Diagrams

### 6.1 UC-001 Activity Flow

```
[Start] -> [Load Homepage] -> [Display Masonry Grid] -> [User Scrolls] 
-> [See More Videos] -> [Click Video?] -> [Yes: UC-002] -> [No: Continue Browsing] 
-> [Navigate Away?] -> [Yes: End] -> [No: Continue Browsing] -> [End]
```

---

## 7. Sequence Diagrams

### 7.1 UC-002 Sequence

```
User -> System: Click video card
System -> System: Calculate click position
System -> User: Open modal (zoom-in animation)
System -> System: Load video file
System -> User: Display video player
System -> User: Autoplay video
User -> System: Watch video
User -> System: Click close button
System -> User: Close modal (zoom-out animation)
User -> System: Return to grid
```

---

## 8. Edge Cases and Error Handling

### 8.1 Edge Cases by Use Case

| Use Case | Edge Case | Handling |
|----------|-----------|----------|
| UC-001 | No videos available | Show creative empty state |
| UC-001 | Single video | Layout handles gracefully |
| UC-001 | 100+ videos | Lazy loading, virtualization if needed |
| UC-002 | Video file missing | Show error, allow close |
| UC-002 | Autoplay blocked | Show play button |
| UC-004 | Form submission fails | Show error, preserve data, allow retry |

### 8.2 Error Scenarios

| Use Case | Error | User Experience | System Response |
|----------|-------|-----------------|-----------------|
| UC-001 | Slow network | Loading skeletons, lazy load | Progressive loading |
| UC-002 | Video fails to load | Error message, close button | Graceful error handling |
| UC-004 | Validation error | Inline error message | Highlight error field |

---

## 9. Use Case Prioritization

| Use Case ID | Priority | Business Value | Complexity | Dependencies |
|-------------|----------|----------------|------------|--------------|
| UC-001 | P0 | High | High | None |
| UC-002 | P0 | High | Medium | UC-001 |
| UC-003 | P1 | Medium | Medium | None |
| UC-004 | P1 | Medium | Low | UC-003 |

---

## 10. Test Scenarios

### 10.1 UC-001 Test Scenarios

- **TC-UC-001-001:** Happy path - Browse video grid with many videos
- **TC-UC-001-002:** Edge case - No videos available (empty state)
- **TC-UC-001-003:** Edge case - Single video
- **TC-UC-001-004:** Performance - 100+ videos
- **TC-UC-001-005:** Responsive - Mobile layout (1 column)

### 10.2 UC-002 Test Scenarios

- **TC-UC-002-001:** Happy path - Click video, watch in modal, close
- **TC-UC-002-002:** Alternative - Press ESC to close
- **TC-UC-002-003:** Exception - Video fails to load
- **TC-UC-002-004:** Exception - Autoplay blocked

---

## 11. Use Case Coverage Matrix

| Use Case | User Story | Requirement | Test Case | Status |
|----------|------------|-------------|-----------|--------|
| UC-001 | US-001, US-003 | FR-1, FR-2, FR-4 | TC-UC-001-001 | Backlog |
| UC-002 | US-002 | FR-2 | TC-UC-002-001 | Backlog |
| UC-003 | US-005 | FR-6, FR-3 | TC-UC-003-001 | Backlog |
| UC-004 | US-006 | FR-6 | TC-UC-004-001 | Backlog |

---

## 12. Assumptions and Constraints

### 12.1 Assumptions

- Videos are pre-loaded and available
- Browser supports modern CSS features (Grid, Columns, Transforms)
- Backend API exists for form submission
- Video files are optimized and accessible

### 12.2 Constraints

- Navigation bar styling must remain unchanged
- Font system must remain unchanged
- Must work on modern browsers (Chrome, Firefox, Safari, Edge)
- Must meet WCAG AA accessibility standards

---

## 13. Open Questions

- [ ] **Form Submission**: Backend API endpoint needed? - Owner: Product Owner
- [ ] **Video Count**: How many videos to show initially? - Owner: Product Owner
- [ ] **Error Handling**: Detailed error messages needed? - Owner: Product Owner

---

## 14. References

- PRD: `features/ui-redesign-prd.md`
- User Stories: `features/ui-redesign-user-stories.md`
- Design Document: `features/redesign.md`
- Requirements Mapping: `features/ui-redesign-requirements-mapping.md`

---

## 15. Change Log

| Date | Use Case ID | Change | Author |
|------|-------------|--------|--------|
| 2024-12-28 | All | Initial creation | Creative Director |

---

> "Videos first. Everything else is secondary." — Video-First Philosophy

