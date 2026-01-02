# 🚨 CRITICAL FIX: Vercel Clone Hang

## The Problem

Your Vercel deployments are **hanging during the clone phase** from GitHub. This happens BEFORE the build script runs, so the build never starts.

## Root Cause

Even with LFS disabled in Vercel settings, Git itself might still try to process LFS files during clone because:
- `.gitattributes` tells Git to use LFS filters
- Git tries to run the LFS smudge filter even if LFS isn't installed
- This causes the clone to hang waiting for LFS files

## ✅ COMPREHENSIVE FIX (Do All Steps!)

### Step 1: Set Environment Variable in Vercel

**CRITICAL**: This tells Git to skip LFS smudge during clone.

1. Go to **Vercel Dashboard**: https://vercel.com/dashboard
2. Select your project
3. Go to **Settings** → **Environment Variables**
4. Click **"Add New"**
5. Add:
   - **Name**: `GIT_LFS_SKIP_SMUDGE`
   - **Value**: `1`
   - **Environment**: Production, Preview, Development (select all)
6. **Save**

### Step 2: Disable Git LFS in Vercel Settings

1. Still in **Settings** → **Git**
2. Find **"Git Large File Storage (LFS)"**
3. **TURN IT OFF** (disable it) - if not already disabled
4. **Save** settings

### Step 3: Update vercel.json (Already Done!)

I've added `GIT_LFS_SKIP_SMUDGE=1` to your `vercel.json` file. This ensures Git skips LFS during clone.

### Step 4: Commit and Push Changes

```bash
git add vercel.json
git commit -m "Add GIT_LFS_SKIP_SMUDGE to prevent clone hang"
git push origin main
```

### Step 5: Redeploy

1. Go to **Deployments** tab
2. Click **"Redeploy"** on the latest deployment
3. Or the push from Step 4 will trigger a new deployment

### Step 6: Verify

- Clone should complete quickly (no hang)
- Build script will run
- Build script will handle LFS pull manually (with timeout protection)

## Why This Works

**The Key**: `GIT_LFS_SKIP_SMUDGE=1` tells Git to skip LFS processing during clone.

- **Before**: Git tries to process LFS files during clone → Hangs waiting for LFS
- **After**: Git skips LFS smudge → Clone completes quickly → Build script handles LFS

The build script (`vercel-build.sh`) is already configured to:
- Install Git LFS if needed
- Pull LFS files manually during build (not during clone)
- Timeout after 5 minutes (won't hang)
- Continue build even if LFS fails

## Why Previous Fix Didn't Work

If you already disabled LFS in Vercel settings but it still hangs, it's because:
- Git itself still tries to process LFS files due to `.gitattributes`
- The LFS smudge filter gets called even if LFS isn't installed
- Setting `GIT_LFS_SKIP_SMUDGE=1` prevents Git from calling the filter

## Alternative: Skip LFS Entirely

If you don't need videos to work:

1. Go to **Vercel Dashboard** → Your Project → **Settings** → **Environment Variables**
2. Add: `SKIP_LFS=true`
3. Redeploy

This will skip LFS entirely (videos won't work, but site will deploy).

## After Fixing

Once clone completes successfully, you can:
- Keep LFS disabled in Vercel (recommended - build script handles it)
- Or re-enable LFS in Vercel (only if you have GitHub Pro and verified LFS works)

## Need Help?

Check the build logs in Vercel Dashboard → Deployments → Latest → Build Logs

Look for:
- ✅ "Cloning repository..." completes quickly
- ✅ Build script runs
- ✅ LFS pull happens during build (not during clone)

---

**Last Updated**: After identifying clone hang issue

