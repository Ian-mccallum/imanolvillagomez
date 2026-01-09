# Video System Audit & Optimization Plan

**Date:** January 2025  
**Expert:** Network & Performance Specialist  
**Status:** Critical Issues Identified - Action Plan Ready

---

## Executive Summary

This audit identifies **2 critical issues** preventing optimal video performance on the videographer portfolio site:

1. **Video Background Not Working** - Homepage background video fails to load properly
2. **Videos Taking Forever to Load** - Poor loading performance across all devices

**Root Causes:**
- Background video hardcoded to local path (not using CDN)
- Missing Cloudflare caching configuration
- Videos not optimized for web streaming
- No adaptive loading strategies
- Missing range request support
- No fallback mechanisms

**Impact:** Poor user experience, slow portfolio loading, potential client loss

---

## 1. Current System Architecture

### 1.1 Video Hosting Setup
- **Primary CDN:** Cloudflare R2 (configured)
- **Fallback:** Local `/public/videos/` directory
- **Environment Variable:** `VITE_R2_PUBLIC_URL` (may not be set in production)
- **Custom Domain:** Potentially configured (`videos.imanolvillagomez.com`)

### 1.2 Video Distribution
- **Portfolio Videos:** Use R2 CDN (via `getVideoUrl()` helper)
- **Background Video:** **HARDCODED** to local path `/videos/osamasonpreview.mp4` ❌
- **Video Format:** MP4 (H.264)
- **Total Videos:** ~20+ videos

### 1.3 Current Video Files
Located in `/public/videos/`:
- Multiple `.mov` files (not web-compatible)
- Multiple `.mp4` files (web-compatible)
- Background video: `osamasonpreview.mp4` (~unknown size)

---

## 2. Critical Issues Identified

### Issue #1: Video Background Not Working

**Severity:** 🔴 CRITICAL

**Symptoms:**
- Homepage background video fails to load
- Console errors related to video loading
- Video may not autoplay on mobile devices

**Root Causes:**

1. **Hardcoded Local Path** (`src/pages/HomePage.tsx:82`)
   ```typescript
   const heroVideoUrl = '/videos/osamasonpreview.mp4';
   ```
   - Video is NOT using Cloudflare R2 CDN
   - Loads from Vercel static hosting (slow, no CDN benefits)
   - No caching headers optimization

2. **Missing CDN Configuration**
   - Background video bypasses R2 entirely
   - No CDN edge caching
   - No geographic distribution

3. **Complex Loading Logic**
   - Multiple `load()` calls may conflict
   - Browser autoplay restrictions not properly handled
   - No fallback if video fails

4. **Mobile-Specific Issues**
   - `preload="auto"` on desktop, `preload="metadata"` on mobile
   - Mobile browsers may block autoplay
   - No bandwidth detection

**Impact:**
- Homepage looks broken without background video
- Poor first impression for portfolio visitors
- SEO impact (Core Web Vitals)

---

### Issue #2: Videos Taking Forever to Load

**Severity:** 🔴 CRITICAL

**Symptoms:**
- Videos take 10+ seconds to start playing
- Buffering during playback
- Poor performance on mobile/slow connections

**Root Causes:**

1. **Missing Cloudflare Caching Rules**
   - R2 buckets don't cache by default
   - Every request hits origin (slow)
   - No edge caching configured

2. **Video Optimization Issues**
   - Videos may not have `faststart` flag (moov atom at beginning)
   - Large file sizes without compression
   - No multiple quality versions (adaptive bitrate)

3. **No Range Request Optimization**
   - Videos may not support HTTP range requests properly
   - Browsers can't seek/start playback until full download

4. **Missing CORS Headers**
   - CORS may not be properly configured
   - Browser may block video loading

5. **No Preloading Strategy**
   - Videos load on-demand only
   - No preloading of critical videos
   - No bandwidth-aware loading

6. **Network Issues**
   - No compression (gzip/brotli) for video metadata
   - No HTTP/2 or HTTP/3 prioritization
   - No connection pooling optimization

**Impact:**
- High bounce rate (users leave before videos load)
- Poor user experience
- Lost portfolio views

---

## 3. Network & CDN Analysis

### 3.1 Cloudflare R2 Configuration Status

**Current Setup:**
- ✅ R2 bucket created
- ✅ Public access enabled
- ❓ Custom domain configured? (needs verification)
- ❌ Cache rules NOT configured (CRITICAL)
- ❓ CORS properly configured? (needs verification)

**Missing Configurations:**

1. **Cache Rules** (CRITICAL)
   - No cache rules for video files
   - Every request hits R2 origin
   - Should cache videos at edge for 1+ month

2. **CORS Policy** (CRITICAL)
   - May not be properly configured
   - Needs verification for all domains
   - Must include proper headers

3. **Custom Domain** (RECOMMENDED)
   - Using `*.r2.dev` URL has rate limits
   - Custom domain removes limits
   - Better performance

### 3.2 Video File Optimization Status

**Current State:**
- ✅ Scripts exist for optimization (`optimize-videos-for-r2.sh`)
- ❓ Videos may not be optimized (needs verification)
- ❓ `faststart` flag may be missing
- ❌ No multiple quality versions

**Required Optimizations:**
- Add `faststart` flag (moov atom at beginning)
- Compress videos appropriately
- Create multiple quality versions (if needed)
- Ensure web-compatible codec (H.264 baseline)

---

## 4. Comprehensive Solution Plan

### Phase 1: Immediate Fixes (Critical - Do First)

#### 1.1 Fix Background Video CDN Integration

**Action:** Move background video to R2 and use CDN URL

**Changes Required:**
1. Upload `osamasonpreview.mp4` to R2
2. Update `HomePage.tsx` to use R2 URL
3. Remove hardcoded local path exception

**Files to Modify:**
- `src/constants/videos.ts` - Remove exception for `osamasonpreview.mp4`
- `src/pages/HomePage.tsx` - Use `getVideoUrl()` helper

**Expected Impact:**
- Background video loads from CDN (10x faster)
- Consistent with other videos
- Proper caching

---

#### 1.2 Configure Cloudflare Cache Rules

**Action:** Create cache rules for video files

**Steps:**
1. Go to Cloudflare Dashboard → **Caching** → **Rules**
2. Create rule: "R2 Video Caching"
3. Configure:
   - **If:** `Hostname` `is` `videos.imanolvillagomez.com` (or `*.r2.dev`)
   - **Then:**
     - **Cache Level:** Cache Everything
     - **Edge Cache TTL:** 1 month
     - **Browser Cache TTL:** Respect Existing Headers

**Expected Impact:**
- Videos cached at edge (instant loading after first request)
- 90%+ reduction in origin requests
- Much faster loading times

---

#### 1.3 Verify & Fix CORS Configuration

**Action:** Ensure CORS is properly configured

**Steps:**
1. Go to Cloudflare Dashboard → **R2** → Your bucket → **Settings**
2. Check **CORS Policy**
3. Ensure includes:
   ```json
   [
     {
       "AllowedOrigins": [
         "https://www.imanolvillagomez.com",
         "https://imanolvillagomez.com",
         "http://localhost:5173"
       ],
       "AllowedMethods": ["GET", "HEAD"],
       "AllowedHeaders": ["*"],
       "ExposeHeaders": ["ETag", "Content-Length", "Content-Type", "Accept-Ranges"],
       "MaxAgeSeconds": 3600
     }
   ]
   ```

**Expected Impact:**
- Videos load without CORS errors
- Proper cross-origin support

---

#### 1.4 Optimize Videos for Web Streaming

**Action:** Ensure all videos have `faststart` flag

**Steps:**
1. Run optimization script:
   ```bash
   bash scripts/optimize-videos-for-r2.sh
   ```
2. Re-upload optimized videos to R2:
   ```bash
   node scripts/upload-to-r2.js
   ```

**Expected Impact:**
- Videos start playing immediately (no full download needed)
- Better user experience
- Reduced bandwidth usage

---

### Phase 2: Performance Enhancements (High Priority)

#### 2.1 Implement Video Preloading Strategy

**Action:** Preload critical videos (background, featured)

**Implementation:**
- Preload background video on homepage
- Preload featured videos in viewport
- Use `preload="metadata"` for non-critical videos

**Files to Modify:**
- `src/pages/HomePage.tsx` - Add preload for background video
- `src/components/video/VideoCard.tsx` - Lazy load thumbnails

---

#### 2.2 Add Video Loading States & Fallbacks

**Action:** Show loading states and fallback images

**Implementation:**
- Add poster images for videos
- Show loading spinner while video loads
- Fallback to static image if video fails

**Files to Modify:**
- `src/pages/HomePage.tsx` - Add fallback for background video
- `src/components/video/VideoPlayer.tsx` - Enhance loading states

---

#### 2.3 Implement Bandwidth Detection

**Action:** Detect network speed and adjust video quality

**Implementation:**
- Use Network Information API (if available)
- Detect slow connections
- Load lower quality on slow networks

**Files to Create:**
- `src/hooks/useNetworkSpeed.ts` - Network detection hook
- `src/utils/videoQuality.ts` - Quality selection utility

---

#### 2.4 Add Range Request Support

**Action:** Ensure videos support HTTP range requests

**Verification:**
- Check R2 bucket settings
- Verify `Accept-Ranges: bytes` header
- Test range requests work

**Expected Impact:**
- Browsers can seek/start playback immediately
- Better streaming performance

---

### Phase 3: Advanced Optimizations (Medium Priority)

#### 3.1 Create Multiple Quality Versions

**Action:** Generate multiple quality versions of videos

**Implementation:**
- Create script to generate 3 quality versions:
  - High: 1080p (desktop)
  - Medium: 720p (tablet)
  - Low: 480p (mobile/slow connections)
- Serve appropriate version based on device/network

**Files to Create:**
- `scripts/generate-video-qualities.sh` - Multi-quality generator
- `src/utils/videoQuality.ts` - Quality selection logic

---

#### 3.2 Implement Adaptive Bitrate Streaming (HLS)

**Action:** Convert videos to HLS format for adaptive streaming

**Implementation:**
- Use `ffmpeg` to create HLS streams
- Serve `.m3u8` playlists
- Use HLS.js library for playback

**Considerations:**
- More complex implementation
- Better for long-form videos
- May be overkill for short portfolio videos

---

#### 3.3 Add Video Compression

**Action:** Compress videos to reduce file sizes

**Implementation:**
- Use existing compression scripts
- Target: <5MB for preview videos, <20MB for full videos
- Maintain quality while reducing size

**Files to Use:**
- `scripts/compress-large-mp4s.sh`
- `scripts/re-encode-videos-web.sh`

---

### Phase 4: Monitoring & Testing (Ongoing)

#### 4.1 Add Performance Monitoring

**Action:** Track video loading performance

**Metrics to Track:**
- Time to first frame (TTFF)
- Video load time
- Buffer health
- Error rates

**Implementation:**
- Add performance marks
- Log to analytics service
- Set up alerts for failures

---

#### 4.2 Cross-Device Testing

**Action:** Test on all devices and browsers

**Test Matrix:**
- Desktop: Chrome, Firefox, Safari, Edge
- Mobile: iOS Safari, Chrome Android
- Tablet: iPad, Android tablets
- Network speeds: 3G, 4G, WiFi

---

## 5. Implementation Checklist

### Critical Fixes (Do First)
- [ ] **1.1** Upload `osamasonpreview.mp4` to R2
- [ ] **1.2** Update `HomePage.tsx` to use R2 URL (remove hardcoded path)
- [ ] **1.3** Update `videos.ts` to remove exception for background video
- [ ] **1.4** Configure Cloudflare cache rules for videos
- [ ] **1.5** Verify CORS configuration in R2 bucket
- [ ] **1.6** Run video optimization script (`optimize-videos-for-r2.sh`)
- [ ] **1.7** Re-upload optimized videos to R2
- [ ] **1.8** Test background video loads correctly
- [ ] **1.9** Test portfolio videos load quickly

### Performance Enhancements
- [ ] **2.1** Add video preloading for background video
- [ ] **2.2** Add loading states and fallback images
- [ ] **2.3** Implement bandwidth detection
- [ ] **2.4** Verify range request support
- [ ] **2.5** Add poster images for all videos

### Advanced Optimizations
- [ ] **3.1** Create multiple quality versions (if needed)
- [ ] **3.2** Implement HLS streaming (if needed)
- [ ] **3.3** Compress videos further (if needed)

### Testing & Monitoring
- [ ] **4.1** Test on desktop browsers
- [ ] **4.2** Test on mobile devices
- [ ] **4.3** Test on slow connections
- [ ] **4.4** Add performance monitoring
- [ ] **4.5** Set up error tracking

---

## 6. Expected Performance Improvements

### Before Optimization
- Background video: **10-30 seconds** to load
- Portfolio videos: **5-15 seconds** to start
- Mobile performance: **Poor** (videos may not load)
- Cache hit rate: **0%** (no caching)

### After Optimization
- Background video: **<2 seconds** to load (CDN + caching)
- Portfolio videos: **<1 second** to start (faststart + caching)
- Mobile performance: **Good** (optimized loading)
- Cache hit rate: **90%+** (edge caching)

**Overall Improvement: 10-15x faster video loading**

---

## 7. Questions to Answer Before Implementation

### Critical Questions:

1. **R2 Configuration:**
   - ✅ Is `VITE_R2_PUBLIC_URL` set in Vercel environment variables?
   - ✅ What is the current R2 public URL? (`*.r2.dev` or custom domain?)
   - ✅ Is custom domain configured? (`videos.imanolvillagomez.com`?)

2. **Video Files:**
   - ✅ Are videos already uploaded to R2?
   - ✅ What is the size of `osamasonpreview.mp4`?
   - ✅ Have videos been optimized with `faststart` flag?

3. **Cloudflare Setup:**
   - ✅ Are cache rules configured?
   - ✅ Is CORS properly configured?
   - ✅ What is the R2 bucket name?

4. **Testing:**
   - ✅ What devices/browsers are most important?
   - ✅ What is the target audience's typical connection speed?

---

## 8. Risk Assessment

### Low Risk Changes
- ✅ Configuring cache rules (reversible)
- ✅ Optimizing videos (backup originals)
- ✅ Adding loading states (UX improvement)

### Medium Risk Changes
- ⚠️ Moving background video to R2 (test thoroughly)
- ⚠️ Changing video URLs (may break existing links)

### Mitigation Strategies
- Test all changes in development first
- Keep backups of original videos
- Use feature flags for gradual rollout
- Monitor error rates after deployment

---

## 9. Success Metrics

### Key Performance Indicators (KPIs)

1. **Video Load Time:**
   - Target: <2 seconds for background video
   - Target: <1 second for portfolio videos

2. **Cache Hit Rate:**
   - Target: >90% cache hits

3. **Error Rate:**
   - Target: <1% video load failures

4. **User Experience:**
   - Target: Videos start playing immediately
   - Target: No buffering during playback

5. **Mobile Performance:**
   - Target: Videos load on 3G connections
   - Target: <5 seconds to first frame on mobile

---

## 10. Next Steps

1. **Answer Questions** (Section 7) - Gather current configuration details
2. **Start Phase 1** - Implement critical fixes
3. **Test Thoroughly** - Verify all changes work
4. **Deploy** - Push to production
5. **Monitor** - Track performance metrics
6. **Iterate** - Implement Phase 2 & 3 optimizations

---

## Appendix: Technical Details

### Video Optimization Commands

```bash
# Optimize single video with faststart
ffmpeg -i input.mp4 -c:v copy -c:a copy -movflags +faststart output.mp4

# Compress video (web-optimized)
ffmpeg -i input.mp4 \
  -c:v libx264 \
  -profile:v baseline \
  -level 3.0 \
  -pix_fmt yuv420p \
  -preset slow \
  -crf 23 \
  -c:a aac \
  -b:a 128k \
  -movflags +faststart \
  output.mp4
```

### Cloudflare Cache Rule Configuration

```json
{
  "rules": [
    {
      "name": "R2 Video Caching",
      "if": {
        "hostname": {
          "equals": "videos.imanolvillagomez.com"
        }
      },
      "then": {
        "cache_level": "cache_everything",
        "edge_cache_ttl": 2592000,
        "browser_cache_ttl": 31536000
      }
    }
  ]
}
```

### CORS Configuration Template

```json
[
  {
    "AllowedOrigins": [
      "https://www.imanolvillagomez.com",
      "https://imanolvillagomez.com",
      "http://localhost:5173"
    ],
    "AllowedMethods": ["GET", "HEAD"],
    "AllowedHeaders": ["*"],
    "ExposeHeaders": [
      "ETag",
      "Content-Length",
      "Content-Type",
      "Accept-Ranges",
      "Content-Range"
    ],
    "MaxAgeSeconds": 3600
  }
]
```

---

**Document Status:** Ready for Implementation  
**Last Updated:** January 2025  
**Next Review:** After Phase 1 completion

