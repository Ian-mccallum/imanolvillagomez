# Homepage Redesign - Immersive Experience

## Overview

This feature redesigns the homepage to create an immersive, full-screen experience that breaks away from traditional navigation patterns. The homepage will feature a full-screen osamason video background with photos scattered in an organic, messy-but-clean layout, and bold centered navigation text.

## Key Concepts

- **Full-Screen Video Background**: Osamason preview video plays as the entire page background with dark grainy overlay
- **Scattered Photo Layout**: 15 photos positioned organically across the screen in a messy-but-clean aesthetic
  - Photos cycle independently at random intervals (3-20 seconds)
  - Photos change position when cycling (0.9 second transition delay)
  - Minimal overlap allowed for organic layering
  - 150px buffer from footer to avoid text overlap
- **Centered Navigation**: Bold, centered navigation text (Videos, Photos, Other, Contact) - no traditional header
- **Immersive First Load**: Epilepsy warning modal on first visit, then full immersive experience
- **Background Color**: Dark with video overlay (not light background)

## Design Philosophy

- **Video-First**: Video content dominates the visual experience
- **Organic Layout**: Photos scattered naturally, not in rigid grids
- **Bold Typography**: Large, centered navigation text as the primary interface
- **Minimal UI**: No traditional header/nav bar on homepage
- **Clean Messiness**: Intentional organic placement that feels curated, not chaotic

## Planning Documents

1. **PRD** (`prd.md`) - Product requirements and business objectives
2. **Design Document** (`design-document.md`) - Technical architecture and implementation approach
3. **User Stories** (`user-stories.md`) - User-centric feature descriptions
4. **Atomic Steps Checklist** (`atomic-steps-checklist.md`) - Step-by-step implementation guide

## Photo Scatter Implementation

- **Component**: `PhotoScatter.tsx`
- **Photo Count**: 15 photos displayed simultaneously
- **Photo Sizes**: 
  - Mobile: 120-200px
  - Desktop: 180-280px
- **Spacing**: Minimal overlap (maxSize * 1.2 minimum distance)
- **Cycling**: Independent random timing (3-20 seconds per photo)
- **Position Changes**: Photos fade out, wait 0.9 seconds, then appear at new random position
- **Constraints**: 
  - Avoids navigation center area
  - 150px buffer from footer
  - Spread across entire viewport

## Related Features

- This redesign affects the homepage only
- Other pages (Work, Videos, Photos, Other, Contact) maintain their current structure
- Navigation from homepage to other pages will transition appropriately

