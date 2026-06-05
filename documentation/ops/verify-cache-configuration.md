# Verify Cloudflare Cache Configuration

## Step-by-Step Verification Guide

### 1. Check Cache Rules in Cloudflare Dashboard

1. **Go to Cloudflare Dashboard**
   - Visit: https://dash.cloudflare.com
   - Login to your account

2. **Navigate to Caching → Rules**
   - Click **Caching** in the left sidebar
   - Click **Rules** tab

3. **Check for Video Caching Rule**
   Look for a rule that matches:
   - **Name:** Something like "R2 Video Caching" or "Video Cache"
   - **If:** `Hostname` `is` `videos.imanolvillagomez.com`
   - **Then:** 
     - Cache Level: `Cache Everything`
     - Edge Cache TTL: `1 month` (or similar)
     - Browser Cache TTL: `Respect Existing Headers` or `1 month`

### 2. If Cache Rule Doesn't Exist - Create It

**Create New Cache Rule:**

1. Click **Create Rule** button
2. **Rule Name:** `R2 Video Caching`
3. **If:** 
   - Field: `Hostname`
   - Operator: `is`
   - Value: `videos.imanolvillagomez.com`
4. **Then:**
   - **Cache Level:** `Cache Everything`
   - **Edge Cache TTL:** `1 month` (2592000 seconds)
   - **Browser Cache TTL:** `Respect Existing Headers`
5. Click **Deploy**

### 3. Verify CORS Configuration

1. **Go to R2 Dashboard**
   - Click **R2** in left sidebar
   - Click your bucket: `imanol`

2. **Check CORS Policy**
   - Click **Settings** tab
   - Scroll to **CORS Policy**
   - Click **Edit CORS Policy**

3. **Verify CORS Configuration**
   Should include:
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

### 4. Test Cache is Working

**Method 1: Browser DevTools**
1. Open your site in browser
2. Open DevTools → **Network** tab
3. Filter by **Media**
4. Load a video
5. Check the response headers:
   - Look for `CF-Cache-Status: HIT` (cached) or `MISS` (not cached)
   - Look for `Cache-Control` header
   - Look for `Age` header (shows how long cached)

**Method 2: curl Command**
```bash
# First request (should be MISS)
curl -I "https://videos.imanolvillagomez.com/videos/osamasonpreview.mp4"

# Check response headers:
# CF-Cache-Status: MISS (first time)
# Cache-Control: public, max-age=31536000

# Second request (should be HIT if cache is working)
curl -I "https://videos.imanolvillagomez.com/videos/osamasonpreview.mp4"

# Should show:
# CF-Cache-Status: HIT
# Age: [some number]
```

### 5. Common Issues

**Issue: CF-Cache-Status: BYPASS**
- **Cause:** Cache rule not matching correctly
- **Fix:** Check hostname in cache rule matches exactly

**Issue: CF-Cache-Status: DYNAMIC**
- **Cause:** Cloudflare thinks content is dynamic
- **Fix:** Ensure cache level is set to "Cache Everything"

**Issue: No CF-Cache-Status header**
- **Cause:** Not going through Cloudflare
- **Fix:** Verify DNS is pointing to Cloudflare

**Issue: Videos still slow**
- **Cause:** Cache not configured or videos not optimized
- **Fix:** 
  1. Verify cache rules are deployed
  2. Check videos have faststart flag
  3. Clear Cloudflare cache: **Caching** → **Purge Cache** → Enter `videos.imanolvillagomez.com/*`

## Quick Checklist

- [ ] Cache rule exists for `videos.imanolvillagomez.com`
- [ ] Cache level is set to "Cache Everything"
- [ ] Edge Cache TTL is set (1 month recommended)
- [ ] CORS is configured correctly
- [ ] Test shows `CF-Cache-Status: HIT` on second request
- [ ] Videos have faststart flag (run check script)

## Need Help?

If cache isn't working:
1. Check cache rule is deployed (not just saved)
2. Verify hostname matches exactly
3. Purge cache after making changes
4. Wait 30 seconds for changes to propagate
5. Test with curl to see headers

