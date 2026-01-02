# Images Directory

This directory contains image assets that are served directly from the public folder.

## Usage

Images in this directory can be referenced directly in your code:

```tsx
// In HTML/JSX
<img src="/images/logo.png" alt="Logo" />

// Or with require/import in component code
<img src="/images/hero-image.jpg" alt="Hero" />
```

## Naming Convention

Images are organized by artist/client name with numbered suffixes:

- `{artistname}-{number}.jpeg` - Format: lowercase, no spaces, hyphenated
- Examples:
  - `yunglean-1.jpeg`, `yunglean-2.jpeg`, etc.
  - `osamason-1.jpeg`, `osamason-2.jpeg`, etc.
  - `thehellp-1.jpeg`, `thehellp-2.jpeg`, etc.
  - `frostchildren-1.jpeg`, `frostchildren-2.jpeg`, etc.
  - `2hollis-1.jpeg`, `2hollis-2.jpeg`, etc.
  - `ninevicious-1.jpeg`, `ninevicious-2.jpeg`, etc.

## Current Artists

- **Yung Lean**: `yunglean-1.jpeg` through `yunglean-4.jpeg`
- **Osamason**: `osamason-1.jpeg` through `osamason-3.jpeg`
- **The Hellp**: `thehellp-1.jpeg` through `thehellp-4.jpeg`
- **Frost Children**: `frostchildren-1.jpeg` through `frostchildren-7.jpeg`
- **2hollis**: `2hollis-1.jpeg`, `2hollis-2.jpeg`
- **Nine Vicious**: `ninevicious-1.jpeg`, `ninevicious-2.jpeg`

## Image References

All image references are managed in `src/constants/photos.ts`. Each photo entry includes:
- `id`: Unique identifier
- `imageUrl`: Path to image (e.g., `/images/yunglean-1.jpeg`)
- `client`: Artist/client name
- `year`: Year of the photo

## Image Optimization

- Use appropriate formats (WebP, AVIF for modern browsers)
- Optimize file sizes for web
- Use descriptive filenames following the artist naming convention
- Include alt text for accessibility
