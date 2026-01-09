# Fix 404 Error on Route Refresh

## 🚨 The Problem

**Issue:** After refreshing `/work/videos` (or any route), you get a 404 error.

**Why:** Vercel is trying to find a file at `/work/videos`, but since this is a client-side route (SPA), it doesn't exist on the server.

---

## ✅ The Fix

I've updated your `vercel.json` to properly handle SPA routing.

### What Changed

**Before:**
```json
"rewrites": [
  {
    "source": "/(.*)",
    "destination": "/index.html",
    "has": [
      {
        "type": "header",
        "key": "accept",
        "value": "text/html"
      }
    ]
  }
]
```

**After:**
```json
"rewrites": [
  {
    "source": "/((?!api|_next|.*\\..*|videos|images).*)",
    "destination": "/index.html"
  }
]
```

### What This Does

- ✅ **Routes all requests** to `/index.html` (except static files)
- ✅ **Excludes static assets:** Files with extensions (`.mp4`, `.jpg`, `.css`, `.js`, etc.)
- ✅ **Excludes special paths:** `api`, `_next`, `videos`, `images` directories
- ✅ **Works on refresh:** All routes now work when refreshed

---

## 🔍 How It Works

The regex pattern `/((?!api|_next|.*\\..*|videos|images).*)` means:
- `(?!...)` = Negative lookahead (exclude these)
- `api` = Exclude `/api/*` routes
- `_next` = Exclude Next.js internal routes
- `.*\\..*` = Exclude files with extensions (`.mp4`, `.jpg`, etc.)
- `videos` = Exclude `/videos/*` directory (for local video fallback)
- `images` = Exclude `/images/*` directory

**Result:** All other routes → `/index.html` (React Router handles the rest)

---

## 🚀 Deploy and Test

1. **Commit the changes:**
   ```bash
   git add vercel.json
   git commit -m "Fix SPA routing for Vercel"
   git push
   ```

2. **Wait for Vercel to deploy** (automatic)

3. **Test:**
   - Go to `https://imanolvillagomez.com/work/videos`
   - **Refresh the page** (Cmd+R or Ctrl+R)
   - Should load correctly (no 404!)

---

## ✅ Test These Routes

After deploying, test refreshing these routes:
- ✅ `/work/videos` - Should work
- ✅ `/work/photos` - Should work
- ✅ `/other` - Should work
- ✅ `/contact` - Should work
- ✅ `/about` - Should work
- ✅ Any other route - Should work

---

## 🔍 Why This Happens

**Single Page Applications (SPAs)** use client-side routing:
- Routes like `/work/videos` exist only in JavaScript
- When you refresh, the browser asks the server for `/work/videos`
- Server doesn't have that file → 404 error
- **Solution:** Tell server to serve `index.html` for all routes (except static files)

**Vercel needs a rewrite rule** to handle this, which we've now fixed!

---

## 📝 Alternative Solution (If Above Doesn't Work)

If the regex pattern causes issues, use this simpler version:

```json
"rewrites": [
  {
    "source": "/(.*)",
    "destination": "/index.html"
  }
]
```

**Note:** This is simpler but might interfere with static files. The regex version is better.

---

## ✅ Verification

After deploying:
1. Visit any route (e.g., `/work/videos`)
2. **Refresh the page** (Cmd+R / Ctrl+R)
3. Should load correctly (no 404)
4. All routes should work on refresh

**The fix is in `vercel.json` - just deploy and test!** 🚀

