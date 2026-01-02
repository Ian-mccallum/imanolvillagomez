# Setup Instructions

## Installation

1. Install dependencies (including framer-motion):
```bash
npm install
```

## Video Thumbnails

The video data in `src/constants/videos.ts` references thumbnail images that need to be created. You have two options:

### Option 1: Generate Thumbnails
Generate thumbnail images from your video files and place them in `/public/images/` with matching names (e.g., `osamason3.jpeg`).

### Option 2: Use Placeholder Images
The VideoCard component has a fallback that will display a placeholder if thumbnails are missing. You can also update the video data to use existing images from `/public/images/`.

## Video Format

The videos are currently in `.mov` format. For better web compatibility, consider converting to `.mp4` format:

```bash
# Example using ffmpeg
ffmpeg -i input.mov -c:v libx264 -c:a aac -b:a 192k output.mp4
```

Update the video URLs in `src/constants/videos.ts` after conversion.

## Running the Development Server

```bash
npm run dev
```

## Key Features Implemented

✅ Video-first design (videos are 80% visual weight)
✅ Minimal navigation (5% visual weight)
✅ Experimental typography and layouts
✅ Glitch effects and grain textures
✅ Dark, cinematic aesthetic
✅ Full-screen video modal with zoom-in animation
✅ Wide Pinterest-style masonry grid (98vw width)
✅ Paper cutout aesthetic with torn edges
✅ Video background (osamason preview)
✅ Videos and photos separated (videos first, then photos)
✅ Grouped by aspect ratio (wide videos together, tall videos together)
✅ **No overlapping items** - proper spacing prevents overlap
✅ Custom video rotations (270° for specific videos)
✅ Responsive design

## Design System

- **Colors**: Green (primary), Red (gore core), Pink/Purple (indie sleaze)
- **Typography**: Bold, experimental, oversized headlines
- **Effects**: Glitch animations, grain textures, dark backgrounds
- **Layout**: Asymmetrical grids, overlapping elements

## Next Steps

1. Generate or add video thumbnails
2. Convert videos to web-friendly format (MP4)
3. Update video metadata in `src/constants/videos.ts`
4. Test on various devices and browsers

## Contact Form

✅ **Implemented**: Contact form with FormSubmit integration
- Form submission handled by FormSubmit (formsubmit.co)
- CAPTCHA protection enabled to prevent bot submissions
- Email: `imanolV20@icloud.com`
- Thank you page at `/thank-you` route
- Form redirects to thank you page after successful submission

