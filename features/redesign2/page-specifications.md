# Redesign 2 - Page Specifications

## 1. Home Page

### Purpose
Landing page that immediately shows video content on the new off-white background.

### Layout
- **Background**: Off-white (#C9C8C7)
- **Content**: Video grid starts immediately (no hero section)
- **Text**: Dark text (black/dark gray) on light background
- **Navigation**: MinimalNav at top (unchanged styling)

### Components
- VideoGrid with masonry layout
- Standard video card sizing
- Dark video thumbnails on light background
- Minimal metadata (dark text)

### Visual Hierarchy
- Videos: 80% visual weight
- Metadata: 15% visual weight
- Navigation: 5% visual weight

## 2. Work Page (Hub)

### Purpose
Central hub that allows users to choose between Videos and Photos.

### Layout
- **Background**: Off-white (#C9C8C7)
- **Structure**: Two large clickable sections or cards
- **Navigation**: Arrow indicators pointing to Videos/Photos
- **Choice Interface**: Clear visual separation between options

### Design Options
**Option A: Side-by-Side Cards**
- Two large cards side by side
- "VIDEOS" on left, "PHOTOS" on right
- Arrow indicators
- Hover effects

**Option B: Stacked Cards**
- Two large cards stacked vertically
- "VIDEOS" on top, "PHOTOS" below
- Arrow indicators
- Full-width cards

**Option C: Split Screen**
- Split screen design
- Left: Videos, Right: Photos
- Arrow indicators in center
- Click either side to navigate

### Visual Elements
- Bold typography for "VIDEOS" and "PHOTOS"
- Arrow icons (→) pointing to each option
- Hover states with scale/glow effects
- Dark text on light background

## 3. Videos Page

### Purpose
Dedicated page for video portfolio content.

### Layout
- **Background**: Off-white (#C9C8C7)
- **Content**: Video grid (masonry layout)
- **Header**: Minimal header with "VIDEOS" title
- **Text**: Dark text on light background

### Components
- VideoGrid component
- Standard video cards
- Dark thumbnails on light background
- Video modal for full-screen playback

### Styling
- Maintain video-first approach
- Dark videos pop on light background
- Glitch effects on hover
- Grain textures for indie sleaze aesthetic

## 4. Photos Page

### Purpose
Dedicated page for photo portfolio content with artist organization and filtering.

### Layout
- **Background**: Black with intense grain texture (multiple layers)
- **Content**: Photo grid (Pinterest/masonry layout)
- **Header**: Minimal header with "PHOTOS" title and artist filter buttons
- **Text**: White text on dark background

### Components
- Photo grid with masonry layout (columns-based)
- Photo cards with thumbnails
- Artist filter buttons (ALL + individual artists)
- Image modal for full-screen viewing
- Dark photos on dark background with grain overlay

### Features
- **Artist Sorting**: Photos automatically sorted by artist (client field)
- **Artist Filtering**: Filter buttons to show all photos or filter by specific artist
- **Masonry Layout**: Pinterest-style column layout with organic flow
- **Grain Texture**: Intense multi-layer grain overlay on black background
- **Glitch Effects**: Subtle glitch effects on photo hover
- **Responsive**: Works on mobile, tablet, and desktop

### Styling
- Black background with very intense grain texture
- White text for captions and metadata
- Minimal, bold design (West-inspired)
- Experimental typography (Carson-inspired)
- Dark, gothic beauty (Oliver-inspired)
- Glitch effects on hover (Weirdcore-inspired)

## 5. Other Page (LOST FILES)

### Purpose
Striking statement page with glitchy "LOST FILES" hero and organized archived video content.

### Layout
- **Background**: Black with intense grain texture (multiple layers)
- **Hero**: Massive "LOST FILES" text with background image and subheading
- **Content**: Archived videos organized in 2-column grid layout

### Hero Section (CRITICAL)
- **Text**: "LOST FILES" in massive, bold typography (stacked 3 times with offsets)
- **Subheading**: "edits, archived content, and whatever the fuck else" positioned at bottom
- **Background**: Image background (osamason-1.jpeg) with dark overlay
- **Grain Texture**: Heavy animated grain overlay (indie sleaze aesthetic)
- **Flash Effects**: Subtle flash photography effects
- **Size**: Text should be 8xl-9xl, dominating the viewport
- **Animation**: Sequential fade-in animations for each layer
- **Style**: Weirdcore aesthetic, intentional digital corruption

### Video Organization
- **Layout**: 2 videos per row (much bigger than standard)
- **Sorting**: Hellp videos first, then Osamason videos, then others
- **Filtering**: "Che" video excluded from display
- **Sizing**: Large videos with reduced gaps for maximum presence
- **Styling**: White text captions on dark background
- **Hover**: Zoom-in cursor (no play button)

### Content Below Hero
- **Section Header**: "ARCHIVED WORK" with video count
- **Video Grid**: 2-column responsive grid
- **Video Cards**: Large video cards with white text metadata
- **Dark Background**: Black with intense grain texture matching hero

## 6. Contact Page

### Purpose
Contact form for inquiries with experimental design and dark aesthetic.

### Layout
- **Background**: Black with intense grain texture (3 layers matching Photos and Lost Files pages)
- **Content**: Contact form with experimental layout
- **Text**: White text on dark background
- **Form**: Dark inputs (black) with white text and white borders

### Features
- **Experimental Layout**: Name and Email fields side by side on desktop (Carson-inspired grid breaking)
- **Grain Texture**: Intense multi-layer grain overlay matching Photos and Lost Files pages
- **Glitch Effects**: Subtle glitch overlay on form field focus (Weirdcore-inspired)
- **Bold Typography**: Large "CONTACT" heading with glitch text effect (Carson + West)
- **Smooth Animations**: Sequential fade-in animations for form fields (Framer Motion)
- **Dark Aesthetic**: Black background with white text for high contrast (Oliver-inspired)
- **Minimal Design**: Clean, bold design with minimal elements (West-inspired)

### Form Structure
- **Name Field**: Text input (required)
- **Email Field**: Email input (required)
- **Subject Field**: Text input (optional)
- **Message Field**: Textarea (required)
- **Submit Button**: Bold white button with black text (West's minimal CTA)

### Styling
- Black form inputs with white text
- White borders (20% opacity, full white on focus)
- Placeholder text in muted gray (zinc-500)
- Glitch overlay on focused fields
- Bold, uppercase labels
- Minimal, impactful design

### Form Submission
- **FormSubmit Integration**: Form submits to `imanolV20@icloud.com` via FormSubmit service
- **CAPTCHA Protection**: reCAPTCHA enabled to prevent bot submissions
- **Thank You Page**: Redirects to `/thank-you` page after successful submission
- **Thank You Page Features**:
  - Same dark aesthetic with grain texture
  - "THANK YOU" heading with glitch text effect
  - Navigation buttons: "BACK TO HOME" and "VIEW WORK"
  - Smooth animations matching contact page theme

### Contact Information
- Email: `imanolV20@icloud.com` (displayed in Privacy Policy only)
- Instagram: @imanol.villagomez

## Navigation Flow

```
Home
  ↓
Work (Hub)
  ├─→ Videos
  └─→ Photos
  ↓
Other (LOST FILES)
  ↓
Contact
```

## Route Structure

```typescript
/                    → Home
/work                → Work Hub
/work/videos         → Videos Page
/work/photos         → Photos Page
/other               → Other Page (LOST FILES)
/contact             → Contact Page
```

