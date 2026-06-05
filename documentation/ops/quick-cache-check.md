# Quick Cache Configuration Check

## ✅ Good News: Videos Are Optimized!

**Faststart Status:**
- ✅ **14 out of 16 videos** already have faststart flag (including `osamasonpreview.mp4`!)
- ⚠️ Only 2 videos need optimization (not critical):
  - `Animated_Background_Video_Generation copy.mp4`
  - `osamasonoutro.mp4`

**Your background video (`osamasonpreview.mp4`) is already optimized!** ✅

---

## 🔍 How to Check Your Cache Configuration

### Step 1: Check Cache Rules (2 minutes)

1. **Go to Cloudflare Dashboard:**
   - Visit: https://dash.cloudflare.com
   - Login

2. **Navigate to Caching:**
   - Click **Caching** in left sidebar
   - Click **Rules** tab

3. **Look for a rule matching:**
   - **Name:** Something like "R2 Video Caching" or "Video Cache"
   - **If:** `Hostname` `is` `videos.imanolvillagomez.com`
   - **Then:** Cache Level = `Cache Everything`

### Step 2: If Rule Doesn't Exist - Create It

**Click "Create Rule" and configure:**

```
Rule Name: R2 Video Caching

IF:
  Field: Hostname
  Operator: is
  Value: videos.imanolvillagomez.com

THEN:
  Cache Level: Cache Everything
  Edge Cache TTL: 1 month (2592000 seconds)
  Browser Cache TTL: Respect Existing Headers
```

**Click "Deploy"** (important - must deploy, not just save!)

### Step 3: Test Cache is Working

**Quick Test:**

1. Open browser DevTools (F12)
2. Go to **Network** tab
3. Filter by **Media**
4. Load your site and play a video
5. Look at the response headers for the video:
   - Find `CF-Cache-Status` header
   - Should show: `HIT` (cached) or `MISS` (first time)

**What to look for:**
- ✅ `CF-Cache-Status: HIT` = Cache is working!
- ⚠️ `CF-Cache-Status: MISS` = First request (normal)
- ❌ `CF-Cache-Status: BYPASS` = Cache rule not working
- ❌ No `CF-Cache-Status` header = Not going through Cloudflare

### Step 4: Verify CORS (Quick Check)

1. **Go to R2 Dashboard:**
   - Click **R2** → Your bucket (`imanol`)
   - Click **Settings** tab
   - Scroll to **CORS Policy**

2. **Should include your domain:**
   ```json
   {
     "AllowedOrigins": [
       "https://www.imanolvillagomez.com",
       "https://imanolvillagomez.com"
     ],
     "AllowedMethods": ["GET", "HEAD"]
   }
   ```

---

## 🚨 Common Issues & Fixes

### Issue: "CF-Cache-Status: BYPASS"
**Fix:** 
- Check cache rule hostname matches exactly: `videos.imanolvillagomez.com`
- Make sure rule is **Deployed** (not just saved)
- Wait 30 seconds after deploying

### Issue: "CF-Cache-Status: DYNAMIC"
**Fix:**
- Change Cache Level to **"Cache Everything"** (not "Standard")

### Issue: Videos Still Slow
**Possible causes:**
1. Cache not configured → Follow Step 2 above
2. First visit (cache miss is normal) → Second visit should be fast
3. Cache needs purging → Go to **Caching** → **Purge Cache** → Enter `videos.imanolvillagomez.com/*`

---

## ✅ Quick Checklist

- [ ] Cache rule exists for `videos.imanolvillagomez.com`
- [ ] Cache Level = "Cache Everything"
- [ ] Rule is **Deployed** (not just saved)
- [ ] CORS includes your domain
- [ ] Test shows `CF-Cache-Status: HIT` on second video load

---

## 📊 Expected Results

**After cache is configured:**
- **First video load:** `CF-Cache-Status: MISS` (normal, ~2-3 seconds)
- **Second video load:** `CF-Cache-Status: HIT` (cached, <1 second)
- **Background video:** Should load in <2 seconds (with cache)

**If you see `HIT` on second load, cache is working perfectly!** ✅

---

## Need Help?

**If cache isn't working:**
1. Double-check hostname matches exactly
2. Make sure rule is **Deployed** (not just saved)
3. Purge cache after changes: **Caching** → **Purge Cache** → `videos.imanolvillagomez.com/*`
4. Wait 30 seconds for propagation
5. Test again

**Your videos are already optimized with faststart, so once cache is configured, they'll load super fast!** 🚀

