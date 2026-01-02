# Vercel Deployment Hang Fix - Git LFS Issues

## 🔍 Root Cause Analysis

**CRITICAL: Your deployments are hanging during the CLONE phase, not the build phase!**

Vercel clones your repository BEFORE executing `vercel-build.sh`. If Git LFS is enabled in Vercel settings, it tries to download LFS files (~835MB) during clone, which hangs indefinitely.

### Primary Issues Identified

1. **Vercel Clones BEFORE Build Script Runs** ⚠️ **THIS IS YOUR ISSUE**
   - Vercel clones your repository BEFORE executing `vercel-build.sh`
   - If Git LFS is enabled in Vercel settings, it tries to download LFS files during clone
   - With ~835MB of videos, this can hang indefinitely if:
     - Network is slow
     - GitHub LFS quota is exceeded
     - Git LFS isn't properly configured
     - LFS files aren't properly pushed
   - **The clone never completes, so the build script never runs**

2. **Build Script Had `set -e` (CRITICAL BUG)**
   - The script had `set -e` which exits on ANY error
   - If `git lfs pull` hangs (doesn't error, just hangs), the script waits forever
   - **FIXED**: Removed `set -e` and added proper timeout handling

3. **Timeout Command Issues**
   - The `timeout` command might not work properly with pipes in Vercel's environment
   - Complex pipe logic with `PIPESTATUS` was unreliable
   - **FIXED**: Implemented background process with kill-based timeout

4. **Sudo Usage (Won't Work on Vercel)**
   - Method 3 tried to use `sudo` which doesn't exist in Vercel builds
   - **FIXED**: Removed all sudo usage

5. **No Hang Detection**
   - If `git lfs pull` hangs, there was no way to detect and skip it
   - **FIXED**: Added background process monitoring with 5-minute timeout

## ✅ Solutions Implemented

### 1. Fixed `vercel-build.sh` Script

**Key Changes:**
- ✅ Removed `set -e` (critical - was causing hangs)
- ✅ Added `SKIP_LFS` environment variable option
- ✅ Implemented proper timeout mechanism (5 minutes max)
- ✅ Removed all `sudo` usage
- ✅ Added progress indicators
- ✅ Script continues even if LFS fails (only exits on TypeScript/Vite failures)

**How It Works Now:**
1. Checks if Git LFS is available
2. If not, attempts to install (without sudo)
3. Runs `git lfs pull` in background with 5-minute timeout
4. Kills the process if it hangs
5. Continues build even if LFS fails
6. Only exits on critical build failures (TypeScript/Vite)

### 2. Updated `.gitattributes`

- Fixed misleading comment
- Added `.mov` file tracking (was missing)

## 🚀 IMMEDIATE FIX (Required to Stop Hanging)

### ⚠️ CRITICAL: Disable Git LFS in Vercel Settings

**This is REQUIRED to fix the clone hang:**

1. Go to **Vercel Dashboard** → Your Project → **Settings** → **Git**
2. **DISABLE** "Git Large File Storage (LFS)" (turn it OFF)
3. **Save** settings
4. **Redeploy** your project

**Why this fixes it:**
- Vercel will clone without trying to download LFS files
- Clone will complete quickly (just downloads LFS pointers, not actual files)
- Build script will then handle LFS pull manually with timeout protection
- No more hanging during clone!

---

## 🚀 Deployment Options (After Fixing Clone Hang)

### Option A: Enable Git LFS in Vercel (Only if you have GitHub Pro)

**⚠️ WARNING: Only use this if you have GitHub Pro and LFS is properly configured!**

**Steps:**
1. Go to Vercel Dashboard → Your Project → Settings → Git
2. Enable "Git Large File Storage (LFS)"
3. Redeploy

**Pros:**
- Vercel handles LFS automatically during clone
- No code changes needed
- Works seamlessly

**Cons:**
- Requires GitHub Pro ($4/month) if you exceed 1GB LFS storage
- First deployment may take longer (downloading 835MB)
- **Will hang if LFS quota exceeded or network issues**

**When to Use:**
- You have GitHub Pro
- You're under 1GB LFS quota
- You've verified LFS files are properly pushed to GitHub

---

### Option B: Disable Git LFS in Vercel, Let Build Script Handle It ✅ **RECOMMENDED**

**Steps:**
1. Go to Vercel Dashboard → Your Project → Settings → Git
2. **Disable** "Git Large File Storage (LFS)" ✅ **DO THIS FIRST**
3. The build script will install Git LFS and pull files manually
4. Redeploy

**Pros:**
- ✅ **Prevents clone hang** (most important!)
- Works even without GitHub Pro
- Build script has timeout protection (won't hang)
- More control over the process
- Clone completes quickly

**Cons:**
- Build takes longer (installing Git LFS + downloading files)
- Videos won't work if LFS pull fails

**When to Use:**
- ✅ **Use this if clone is hanging** (your current situation)
- You don't have GitHub Pro
- You want more control over the LFS process
- You're okay with longer build times

---

### Option C: Skip LFS Entirely (Videos Won't Work)

**Steps:**
1. Go to Vercel Dashboard → Your Project → Settings → Environment Variables
2. Add: `SKIP_LFS=true`
3. Redeploy

**Pros:**
- Fastest builds
- No LFS-related issues
- Site will deploy successfully

**Cons:**
- Videos won't work (they'll be LFS pointers, not actual files)
- Only use if you're hosting videos elsewhere

**When to Use:**
- You're hosting videos on external CDN (S3, Cloudinary, etc.)
- You just want the site to deploy without videos

---

### Option D: Host Videos Externally (Best Long-Term Solution)

**Steps:**
1. Upload videos to AWS S3, Cloudinary, or similar CDN
2. Update your code to use CDN URLs instead of local paths
3. Remove videos from Git repository
4. Deploy without LFS

**Pros:**
- Fastest deployments
- Better performance (CDN)
- No LFS quota limits
- Scales better

**Cons:**
- Requires code changes
- Additional setup time
- May have hosting costs

**When to Use:**
- Production site with many videos
- You want best performance
- You're okay with external hosting costs

## 🔧 Troubleshooting

### Issue: Deployment Still Hangs

**Check:**
1. Is Git LFS enabled in Vercel? (Settings → Git)
2. Check Vercel build logs - where does it hang?
   - During clone? → Disable LFS in Vercel settings
   - During build script? → Check logs for timeout messages
3. Check GitHub LFS quota: https://github.com/settings/billing

**Solution:**
- If hanging during clone: Disable LFS in Vercel, use Option B
- If hanging during build: Check logs, may need to increase timeout or use Option C

---

### Issue: Videos Don't Work After Deployment

**Check:**
1. Are videos LFS pointers? (Check build logs for "LFS pointer" warnings)
2. Did `git lfs pull` succeed? (Check build logs)
3. Are videos in `dist/videos/` after build?

**Solution:**
- Enable Git LFS in Vercel (Option A)
- Or ensure LFS pull succeeds (Option B)
- Or host videos externally (Option D)

---

### Issue: Build Fails with "git lfs pull" Error

**Check:**
1. Are LFS files pushed to GitHub? Run: `git lfs push --all`
2. Is GitHub LFS quota exceeded?
3. Are videos properly tracked? Run: `git lfs ls-files`

**Solution:**
- Push LFS files: `git lfs push --all origin main`
- Check GitHub LFS usage
- Verify `.gitattributes` is committed

---

### Issue: "Git LFS not found" in Build Logs

**This is OK!** The build script will attempt to install Git LFS automatically. If installation fails, the build will continue (videos just won't work).

**Solution:**
- Enable Git LFS in Vercel settings (Option A) - Vercel handles installation
- Or ensure apt-get is available (should be automatic on Vercel)

## 📊 Current Status

**Your Repository:**
- ✅ `.gitattributes` configured for `.mp4` and `.mov`
- ✅ Git LFS filters configured in Git config
- ❌ Git LFS not installed locally (but that's OK for Vercel)
- ⚠️ ~835MB of videos (may exceed GitHub free LFS quota)

**Vercel Configuration:**
- ✅ `vercel-build.sh` script fixed (won't hang)
- ✅ `vercel.json` configured correctly
- ⚠️ Need to decide: Enable or disable LFS in Vercel settings?

## 🎯 Recommended Next Steps

### Step 1: Fix Clone Hang (REQUIRED - Do This First!)

1. **Go to Vercel Dashboard** → Your Project → **Settings** → **Git**
2. **DISABLE** "Git Large File Storage (LFS)" (turn it OFF)
3. **Save** settings
4. **Redeploy** your project

This will fix the clone hang immediately. The clone will complete quickly, and the build script will handle LFS.

### Step 2: Verify the Fix

1. Push the updated `vercel-build.sh` script (already done)
2. Redeploy on Vercel
3. Check build logs:
   - Clone should complete quickly (no hang)
   - Build script should run
   - LFS pull should happen during build (with timeout protection)
   - Build should complete in < 10 minutes
4. Verify videos work (if LFS pull succeeded)

### Step 3: Long-Term (Optional)

- **Option A**: If you have GitHub Pro, you can re-enable LFS in Vercel after verifying everything works
- **Option B**: Keep LFS disabled in Vercel (current setup) - build script handles it
- **Option C**: Host videos externally (S3, Cloudinary) - best for production

3. **Long-Term (Optional):**
   - Consider Option D (external video hosting) for better performance
   - Or upgrade to GitHub Pro if you want to keep using LFS

## 📝 Environment Variables

You can set these in Vercel Dashboard → Settings → Environment Variables:

- `SKIP_LFS=true` - Skip Git LFS entirely (videos won't work)

## 🔗 Useful Links

- Vercel Git LFS Docs: https://vercel.com/docs/concepts/git/git-lfs
- GitHub LFS Limits: https://docs.github.com/en/repositories/working-with-files/managing-large-files/about-git-large-file-storage
- Vercel Build Logs: Dashboard → Deployments → Latest → Build Logs
- GitHub LFS Usage: https://github.com/settings/billing

## ✅ Success Checklist

After deploying, verify:
- [ ] Build completes successfully (doesn't hang)
- [ ] Build logs show LFS pull attempt (or skip if `SKIP_LFS=true`)
- [ ] Build completes in reasonable time (< 10 minutes)
- [ ] Videos work on deployed site (if LFS succeeded)
- [ ] No "LFS pointer" warnings in build logs (if LFS succeeded)

---

**Last Updated:** After fixing `vercel-build.sh` script to prevent hangs

