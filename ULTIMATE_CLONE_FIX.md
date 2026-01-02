# 🎯 ULTIMATE FIX: Vercel Clone Hang (Comprehensive Solution)

## Why Previous Fixes Didn't Work

You've already tried disabling Git LFS in Vercel settings, but it still hangs. Here's why:

**The Real Problem**: Even with LFS disabled in Vercel, **Git itself** still tries to process LFS files during clone because:
1. Your `.gitattributes` file tells Git to use LFS filters
2. Git tries to run the LFS smudge filter during checkout
3. If LFS isn't installed or configured, Git waits/hangs trying to process LFS files

## ✅ Complete Solution (Do ALL Steps)

### Step 1: Add Environment Variable in Vercel Dashboard

**This is the KEY fix that prevents Git from trying to process LFS during clone.**

1. Go to **Vercel Dashboard** → Your Project → **Settings** → **Environment Variables**
2. Click **"Add New"**
3. Add:
   - **Name**: `GIT_LFS_SKIP_SMUDGE`
   - **Value**: `1`
   - **Environments**: Select **all** (Production, Preview, Development)
4. Click **"Save"**

### Step 2: Verify vercel.json Has the Environment Variable

I've already added this to your `vercel.json`:

```json
"env": {
  "GIT_LFS_SKIP_SMUDGE": "1"
}
```

This ensures the environment variable is set even if you forget to set it in the dashboard.

### Step 3: Disable Git LFS in Vercel Settings (If Not Already Done)

1. Go to **Settings** → **Git**
2. Find **"Git Large File Storage (LFS)"**
3. Make sure it's **DISABLED** (turned OFF)
4. **Save**

### Step 4: Commit and Push

```bash
git add vercel.json
git commit -m "Add GIT_LFS_SKIP_SMUDGE to prevent clone hang"
git push origin main
```

### Step 5: Redeploy

The push will trigger a new deployment. Or manually redeploy from Vercel dashboard.

## How This Fixes the Hang

**Before**:
1. Vercel starts cloning repository
2. Git sees `.gitattributes` with LFS filters
3. Git tries to run LFS smudge filter during checkout
4. LFS isn't available or configured → Git hangs waiting

**After**:
1. `GIT_LFS_SKIP_SMUDGE=1` tells Git to skip LFS smudge
2. Git clones repository without processing LFS files
3. Clone completes quickly (just downloads LFS pointers)
4. Build script runs and handles LFS pull manually with timeout

## What Happens During Build

1. ✅ Clone completes quickly (no hang!)
2. ✅ Build script runs
3. ✅ Build script installs Git LFS if needed
4. ✅ Build script pulls LFS files manually (with 5-minute timeout)
5. ✅ Build continues even if LFS pull fails
6. ✅ Videos work if LFS pull succeeds

## Verification

After deploying, check the build logs:

**Look for:**
- ✅ "Cloning repository..." completes quickly (< 30 seconds)
- ✅ Build script starts running
- ✅ "Setting up Git LFS for Vercel..." appears
- ✅ LFS pull happens during build (not during clone)

**If clone still hangs:**
- Double-check environment variable is set in Vercel dashboard
- Verify `vercel.json` has the env variable
- Check build logs for any error messages

## Alternative: Skip LFS Entirely

If you don't need videos to work on the deployed site:

1. Add environment variable: `SKIP_LFS=true`
2. This tells the build script to skip LFS entirely
3. Videos won't work, but site will deploy

## Troubleshooting

### Clone Still Hangs

1. **Check environment variables in Vercel dashboard**
   - Make sure `GIT_LFS_SKIP_SMUDGE=1` is set
   - Make sure it's set for all environments

2. **Check vercel.json**
   - Verify `"env": { "GIT_LFS_SKIP_SMUDGE": "1" }` exists

3. **Check build logs**
   - Look for where it hangs
   - Look for any error messages

4. **Try setting both environment variables**:
   - `GIT_LFS_SKIP_SMUDGE=1`
   - `SKIP_LFS=true` (this skips LFS entirely)

### Videos Don't Work After Deployment

This is expected if LFS pull fails. Check build logs for:
- "LFS pull timed out" → LFS pull took too long
- "Git LFS not available" → LFS installation failed
- "LFS pointer" warnings → LFS files weren't pulled

**Solutions:**
- Enable Git LFS in Vercel settings (if you have GitHub Pro)
- Check GitHub LFS quota
- Host videos externally (S3, Cloudinary)

## Summary

**The fix**: Set `GIT_LFS_SKIP_SMUDGE=1` to prevent Git from processing LFS during clone.

**Why it works**: This environment variable tells Git to skip the LFS smudge filter, so Git doesn't try to download LFS files during clone.

**Result**: Clone completes quickly, build script handles LFS manually with timeout protection.

---

**Last Updated**: After identifying that Git itself processes LFS even when disabled in Vercel

