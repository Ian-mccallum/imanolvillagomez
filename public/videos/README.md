# Videos Directory

This directory contains video assets that are served directly from the public folder.

## Usage

Videos in this directory can be referenced directly in your code:

```tsx
// In HTML/JSX
<video src="/videos/example.mp4" controls>
  Your browser does not support the video tag.
</video>

// Or as a poster/thumbnail
<video 
  src="/videos/showreel.mp4" 
  poster="/images/video-thumbnails/showreel.jpg"
  controls
>
```

## Recommended Organization

Consider organizing videos by purpose:

- `videos/portfolio/` - Portfolio/work videos
- `videos/showreel/` - Showreel/main videos
- `videos/testimonials/` - Client testimonials
- `videos/behind-the-scenes/` - BTS content

## Video Best Practices

- Provide multiple formats for better browser support (MP4, WebM)
- Use appropriate compression to balance quality and file size
- Include poster images for better UX
- Consider using video hosting services (YouTube, Vimeo) for large files
- Add captions/subtitles for accessibility
- Optimize video dimensions for web playback
