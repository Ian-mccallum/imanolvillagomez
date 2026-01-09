# Fix CORS for Localhost Development

## 🚨 Critical Issue: CORS Blocking Localhost

**Error:** `Access to video at 'https://videos.imanolvillagomez.com/videos/...' from origin 'http://localhost:5175' has been blocked by CORS policy`

**Root Cause:** R2 CORS policy doesn't include your localhost port.

---

## ✅ Quick Fix (5 minutes)

### Step 1: Go to Cloudflare R2 Dashboard

1. Visit: https://dash.cloudflare.com
2. Click **R2** in left sidebar
3. Click your bucket: **`imanol`**
4. Click **Settings** tab
5. Scroll to **CORS Policy**
6. Click **Edit CORS Policy**

### Step 2: Update CORS Configuration

**Replace the current CORS policy with this:**

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

### Step 3: Save and Wait

1. Click **Save**
2. **Wait 30 seconds** for CORS policy to propagate
3. Refresh your localhost page
4. Videos should now load!

---

## 🔍 Why This Happens

**CORS (Cross-Origin Resource Sharing)** requires:
- The server (R2) to explicitly allow your origin (localhost)
- Each port is considered a different origin
- `localhost:5173` ≠ `localhost:5175` ≠ `localhost:3000`

**Vite uses different ports:**
- Default: `5173`
- If port in use: `5174`, `5175`, etc.
- We need to include all common ports

---

## ✅ Verification

After updating CORS:

1. **Clear browser cache** (important!)
2. **Refresh localhost page**
3. **Open DevTools → Console**
4. **Check for errors:**
   - ✅ No CORS errors = Fixed!
   - ❌ Still CORS errors = Wait 30 more seconds, then check again

---

## 🚨 Important Notes

### CORS Propagation Time
- **Can take up to 30 seconds** to propagate
- If it doesn't work immediately, wait and try again

### Browser Cache
- **Clear browser cache** after updating CORS
- Or use **Incognito/Private mode** for testing

### Port Numbers
- Vite uses **dynamic ports** if default is busy
- Check your terminal to see which port Vite is using
- Add that port to CORS if not already included

---

## 🔧 Alternative: Use Local Videos for Development

If you want to avoid CORS issues entirely during development:

**Option 1: Use local videos (fallback)**
- Videos already fall back to `/videos/` if R2 URL not set
- Set `VITE_R2_PUBLIC_URL=""` in `.env.local` for local dev

**Option 2: Keep R2 but fix CORS** (recommended)
- Fix CORS as above
- Test with real CDN URLs
- Better matches production environment

---

## 📋 CORS Configuration Checklist

- [ ] CORS policy includes `http://localhost:5173`
- [ ] CORS policy includes `http://localhost:5174`
- [ ] CORS policy includes `http://localhost:5175`
- [ ] CORS policy includes `http://localhost:3000`
- [ ] CORS policy includes production domains
- [ ] CORS policy saved in R2 dashboard
- [ ] Waited 30 seconds for propagation
- [ ] Cleared browser cache
- [ ] Tested video loading

---

## 🎯 Expected Result

After fixing CORS:
- ✅ Videos load in localhost
- ✅ No CORS errors in console
- ✅ Videos play correctly
- ✅ Works in production (already configured)

**This is a one-time fix - once CORS is updated, it works for all developers!**

