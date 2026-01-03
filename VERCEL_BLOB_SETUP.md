# Vercel Blob Setup Guide

## Why Vercel Blob?
- ✅ Solves your CDN serving issues
- ✅ Designed for large video files (supports files >100MB with multipart uploads)
- ✅ Works with your existing `<video>` elements
- ✅ No component changes needed - just update URLs

## Your Video Sizes
- **2 videos over 100MB**: `2hollisLOLLA.mp4` (141MB), `che.mp4` (123MB)
- **14 videos under 100MB**: Range from 3MB to 89MB
- **Total**: ~2.2GB

**Note**: Vercel Blob automatically uses multipart uploads for files >100MB, so your large videos will upload reliably.

## Setup Steps

### 1. Install Vercel Blob CLI
```bash
npm install -g vercel
vercel login
```

### 2. Create Blob Store
In Vercel Dashboard:
1. Go to your project
2. Settings → Storage → Create Database/Store
3. Select "Blob"
4. Name it (e.g., "videos")
5. Choose region (closest to your users)

### 3. Install Blob SDK
```bash
npm install @vercel/blob
```

### 4. Upload Videos

**Option A: Using Vercel CLI (Easiest)**
```bash
# Upload all videos at once
vercel blob put public/videos/*.mp4 --store videos

# Or upload individually
vercel blob put public/videos/osamasonpreview.mp4 --store videos
vercel blob put public/videos/2hollisLOLLA.mp4 --store videos
# ... etc
```

**Option B: Using Upload Script**
Create `upload-videos-to-blob.js`:
```javascript
import { put } from '@vercel/blob';
import { readdir, readFile } from 'fs/promises';
import { join } from 'path';

const BLOB_STORE_TOKEN = process.env.BLOB_READ_WRITE_TOKEN; // Get from Vercel Dashboard

async function uploadVideos() {
  const videosDir = 'public/videos';
  const files = await readdir(videosDir);
  const mp4Files = files.filter(f => f.endsWith('.mp4'));

  for (const file of mp4Files) {
    const filePath = join(videosDir, file);
    const fileContent = await readFile(filePath);
    
    console.log(`Uploading ${file}...`);
    const blob = await put(`videos/${file}`, fileContent, {
      access: 'public',
      token: BLOB_STORE_TOKEN,
    });
    
    console.log(`✅ ${file}: ${blob.url}`);
  }
}

uploadVideos();
```

### 5. Update Video URLs

After uploading, you'll get URLs like:
```
https://[hash].public.blob.vercel-storage.com/videos/osamasonpreview.mp4
```

Update `src/constants/videos.ts`:
```typescript
// Change from:
videoUrl: '/videos/osamasonpreview.mp4',

// To:
videoUrl: 'https://[hash].public.blob.vercel-storage.com/videos/osamasonpreview.mp4',
```

### 6. Environment Variable (Optional)
If you want to use a base URL:
```typescript
// .env
VITE_BLOB_BASE_URL=https://[hash].public.blob.vercel-storage.com

// src/constants/videos.ts
const BLOB_BASE = import.meta.env.VITE_BLOB_BASE_URL || '';
videoUrl: `${BLOB_BASE}/videos/osamasonpreview.mp4`,
```

## Pricing
- **Storage**: ~$0.15/GB/month (your ~2.2GB = ~$0.33/month)
- **Operations**: 
  - Simple (reads): $0.0001 per 1,000
  - Advanced (uploads): $0.001 per 1,000
- **Data Transfer**: Included in Vercel plan

## Benefits
- ✅ Videos load reliably (no more buffering)
- ✅ Better performance (optimized CDN)
- ✅ No Git LFS issues
- ✅ Scales automatically
- ✅ Your video player works unchanged

## Migration Checklist
- [ ] Install `@vercel/blob`
- [ ] Create Blob store in Vercel
- [ ] Upload all 16 videos
- [ ] Update URLs in `src/constants/videos.ts`
- [ ] Test videos load correctly
- [ ] Remove videos from `public/videos/` (optional, saves Git repo size)
- [ ] Remove Git LFS tracking for videos (optional)

## Notes
- Blob URLs work exactly like regular URLs with `<video>` tag
- Your existing video player components don't need changes
- Videos are cached automatically
- Can set cache duration per blob

