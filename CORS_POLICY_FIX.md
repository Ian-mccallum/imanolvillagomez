# CORS Policy Fix for Cloudflare R2

## The Problem
Videos are being blocked by CORS because the R2 bucket isn't sending the required headers.

## The Solution

### Step 1: Go to Cloudflare R2 Dashboard
1. Go to https://dash.cloudflare.com
2. Navigate to **R2** → Your bucket (`imanol`)
3. Click **Settings** tab
4. Scroll to **CORS Policy**
5. Click **Edit CORS Policy** or **Add CORS policy**

### Step 2: Copy This EXACT JSON (No Trailing Slashes!)

```json
[
  {
    "AllowedOrigins": [
      "https://www.imanolvillagomez.com",
      "https://imanolvillagomez.com",
      "http://localhost:5173",
      "http://localhost:5174",
      "http://localhost:5175",
      "http://localhost:3000",
      "http://127.0.0.1:5173",
      "http://127.0.0.1:5174",
      "http://127.0.0.1:5175",
      "http://127.0.0.1:3000"
    ],
    "AllowedMethods": ["GET", "HEAD"],
    "AllowedHeaders": ["*"],
    "ExposeHeaders": ["ETag", "Content-Length", "Content-Type", "Accept-Ranges", "Content-Range"],
    "MaxAgeSeconds": 3600
  }
]
```

### Step 3: Important Notes

**CRITICAL**: 
- ✅ NO trailing slashes: `https://www.imanolvillagomez.com` (NOT `https://www.imanolvillagomez.com/`)
- ✅ NO paths: Only `scheme://host[:port]` format
- ✅ Exact match: Origins must match exactly (case-sensitive)
- ✅ No OPTIONS: Browsers handle preflight automatically

**Valid Origins:**
- ✅ `https://www.imanolvillagomez.com`
- ✅ `https://imanolvillagomez.com`
- ✅ `http://localhost:5173`
- ✅ `http://localhost:3000`

**Invalid Origins:**
- ❌ `https://www.imanolvillagomez.com/` (trailing slash)
- ❌ `https://www.imanolvillagomez.com/videos` (has path)
- ❌ `www.imanolvillagomez.com` (missing scheme)

### Step 4: Save and Wait
1. Click **Save**
2. Wait 30 seconds for propagation
3. Purge Cloudflare cache:
   - Go to **Caching** → **Purge Cache**
   - Enter: `videos.imanolvillagomez.com/*`
   - Click **Purge Everything**

### Step 5: Verify
1. Open browser DevTools → Network tab
2. Load a video from your site
3. Check the response headers for:
   - `Access-Control-Allow-Origin: https://www.imanolvillagomez.com`
   - `Access-Control-Allow-Methods: GET, HEAD`
   - `Access-Control-Expose-Headers: ETag, Content-Length, Content-Type, Accept-Ranges, Content-Range`

## Code Changes Made

I've added `crossOrigin="anonymous"` to all video elements that load from R2:
- ✅ VideoCard.tsx
- ✅ MasonryVideoCard.tsx  
- ✅ VideoCard3D.tsx
- ✅ PaperCutoutCard.tsx
- ✅ VideoPlayer.tsx (already had it)
- ✅ VideoModal.tsx (already had it)

This ensures all videos properly request CORS headers from R2.

## Why This Matters

When a video element has `crossOrigin="anonymous"`, the browser requires CORS headers. Without them, the browser blocks the request for security reasons. The CORS policy tells R2 to send these headers, allowing your site to load videos from the custom domain.

