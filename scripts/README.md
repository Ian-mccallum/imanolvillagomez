# Scripts Directory

This directory contains utility scripts for the project.

## Active Scripts

### `upload-to-r2.js`
**Purpose**: Upload videos to Cloudflare R2 storage

**Usage**:
```bash
# Set environment variables in .env file
node scripts/upload-to-r2.js
```

**What it does**:
- Uploads all MP4 files from `public/videos/` to Cloudflare R2
- Sets proper cache headers for video files
- Displays upload progress and final URLs

**Requirements**:
- Environment variables set in `.env`:
  - `R2_ACCOUNT_ID`
  - `R2_ACCESS_KEY_ID`
  - `R2_SECRET_ACCESS_KEY`
  - `R2_BUCKET_NAME`
  - `R2_PUBLIC_URL`

## Video Processing Scripts

These scripts are useful for processing videos locally before uploading to R2.

### `compress-large-videos.sh`
**Purpose**: Compress large videos to reduce file size

**Usage**:
```bash
./scripts/compress-large-videos.sh
```

**What it does**:
- Compresses videos over 100MB
- Uses ffmpeg with optimized settings
- Preserves quality while reducing size

**Requirements**: `ffmpeg` installed (`brew install ffmpeg`)

### `compress-large-mp4s.sh`
**Purpose**: Compress large MP4 files specifically

**Usage**:
```bash
./scripts/compress-large-mp4s.sh
```

**What it does**:
- Targets specific large MP4 files
- Reduces file size for easier handling

**Requirements**: `ffmpeg` installed

### `convert-videos-to-mp4.sh`
**Purpose**: Convert .mov files to web-compatible MP4 format

**Usage**:
```bash
./scripts/convert-videos-to-mp4.sh
```

**What it does**:
- Converts all .mov files in `public/videos/` to MP4
- Uses H.264 video codec and AAC audio codec
- Optimized for web browser compatibility

**Requirements**: `ffmpeg` installed

### `re-encode-videos-web.sh`
**Purpose**: Re-encode MP4 videos for maximum web browser compatibility

**Usage**:
```bash
./scripts/re-encode-videos-web.sh
```

**What it does**:
- Re-encodes existing MP4 files with web-optimized settings
- Uses H.264 baseline profile for maximum compatibility
- Ensures proper pixel format for web playback

**Requirements**: `ffmpeg` installed

## Build Scripts

### `../vercel-build.sh`
**Purpose**: Vercel build script (simplified, no Git LFS needed)

**Usage**: Automatically called by Vercel during deployment

**What it does**:
- Runs TypeScript compilation
- Runs Vite build
- No Git LFS handling needed (videos on R2)

## Utility Scripts

### `../install-homebrew.sh`
**Purpose**: Install Homebrew package manager on macOS

**Usage**:
```bash
./install-homebrew.sh
```

**What it does**:
- Checks if Homebrew is already installed
- Installs Homebrew if needed
- Configures PATH for Apple Silicon Macs

## Notes

- All video processing scripts require `ffmpeg` to be installed
- Videos are now hosted on Cloudflare R2, not in git
- Git LFS is no longer used or needed
- Scripts are organized here for easy access and maintenance

