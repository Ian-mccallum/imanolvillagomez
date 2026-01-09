# 🚨 URGENT: Fix CORS for Localhost (5 minutes)

## The Problem
**Error:** `Access to video at 'https://videos.imanolvillagomez.com/...' from origin 'http://localhost:5175' has been blocked by CORS policy`

**Why:** Your R2 CORS policy doesn't include `localhost:5175` (Vite is using port 5175)

---

## ✅ Quick Fix (Do This Now)

### Step 1: Update CORS in Cloudflare

1. **Go to:** https://dash.cloudflare.com
2. **Click:** R2 → Your bucket (`imanol`) → **Settings** tab
3. **Scroll to:** **CORS Policy** → Click **Edit CORS Policy**
4. **Replace** the current policy with this (includes port 5175):

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

5. **Click Save**
6. **Wait 30 seconds** (CORS takes time to propagate)

### Step 2: Test

1. **Clear browser cache** (Cmd+Shift+R or Ctrl+Shift+R)
2. **Refresh localhost page**
3. **Check console** - CORS errors should be gone!

---

## 🔄 Temporary Workaround (If You Can't Fix CORS Right Now)

If you need to work immediately, you can use local videos:

**Option 1: Unset R2 URL for local dev**

Create `.env.local` file:
```bash
# Empty R2 URL = use local videos
VITE_R2_PUBLIC_URL=
```

Then restart your dev server.

**Option 2: Keep R2 but fix CORS** (recommended)
- Fix CORS as above (5 minutes)
- Better matches production environment
- Tests with real CDN URLs

---

## ✅ Verification

After fixing CORS:
- ✅ No CORS errors in console
- ✅ Videos load and play
- ✅ Works in localhost

**This is a one-time fix - once updated, it works for all developers!**

