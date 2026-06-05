# Git LFS Fix Guide - Complete Solution

## 🔍 Current Issues Identified

1. **Git LFS is NOT installed** - `git lfs` command fails
2. **Videos exceed GitHub free LFS storage** - 1.5GB videos vs 1GB free limit
3. **Vercel build includes `git lfs pull`** but LFS isn't configured
4. **Videos may not be tracked by LFS** - Need to verify and migrate

## 📊 Current State

- **Total video size**: 1.5GB
- **Largest file**: 223MB (`2hollisLOLLA.mov`)
- **GitHub free LFS limit**: 1GB storage, 1GB bandwidth/month
- **Repository**: `https://github.com/Ian-mccallum/imanolvillagomez.git`
- **Vercel build command**: `git lfs pull && tsc && vite build`

## ✅ Solution Options

### Option 1: GitHub Pro (Recommended - Easiest)

**Pros:**
- ✅ Zero code changes needed
- ✅ 50GB LFS storage (plenty for 1.5GB)
- ✅ Simple upgrade ($4/month)
- ✅ Works with existing setup

**Cons:**
- ❌ $4/month recurring cost
- ⚠️ Git LFS may still be slower than CDN

**Steps:**
1. Upgrade to GitHub Pro: https://github.com/settings/billing
2. Install Git LFS: `brew install git-lfs`
3. Run setup: `./setup-git-lfs.sh`
4. Push to GitHub
5. Vercel will automatically pull LFS files during build

---

### Option 2: AWS S3 + CloudFront (Best Value)

**Pros:**
- ✅ Cheapest option (~$1-2/month)
- ✅ Better performance (CDN)
- ✅ Scales easily
- ✅ No file size limits

**Cons:**
- ⚠️ Requires code changes (update video URLs)
- ⚠️ More complex setup (1-2 hours)

**Steps:**
1. Create AWS S3 bucket
2. Upload videos to S3
3. Update `src/constants/videos.ts` to use S3 URLs
4. Remove videos from Git repository
5. Optionally set up CloudFront CDN

---

### Option 3: Cloudinary (Professional)

**Pros:**
- ✅ Built-in video optimization
- ✅ Global CDN
- ✅ Automatic format conversion

**Cons:**
- ❌ Expensive ($89/month for Plus plan)
- ❌ Free tier doesn't work (1GB limit, 100MB max file)
- ⚠️ Code changes needed

---

## 🚀 Quick Fix: GitHub Pro Setup

If you choose GitHub Pro (recommended for simplicity):

### Step 1: Install Git LFS

```bash
# macOS (using Homebrew)
brew install git-lfs

# Verify installation
git lfs version
```

### Step 2: Initialize Git LFS

```bash
cd /Users/ianmccallum/Desktop/Coding/nol
git lfs install
```

### Step 3: Verify .gitattributes

Your `.gitattributes` should already be configured:
```
*.mov filter=lfs diff=lfs merge=lfs -text
*.mp4 filter=lfs diff=lfs merge=lfs -text
```

### Step 4: Check if videos are already in Git

```bash
# Check if videos are tracked by Git
git ls-files public/videos/*.mov

# Check if they're tracked by LFS (will fail if LFS not installed)
git lfs ls-files
```

### Step 5: Migrate Existing Videos to LFS

**If videos are already committed to Git:**

```bash
# This rewrites Git history - safe if not pushed yet
git lfs migrate import --include="*.mov,*.mp4" --everything

# Or use the setup script
./setup-git-lfs.sh
```

**If videos are NOT yet committed:**

```bash
# Just add them normally - LFS will track automatically
git add public/videos/*.mov public/videos/*.mp4
git add .gitattributes
git commit -m "Add videos with Git LFS tracking"
```

### Step 6: Verify LFS Tracking

```bash
# Should show all .mov and .mp4 files
git lfs ls-files

# Check file sizes (LFS files show as pointers)
git ls-files -s public/videos/*.mov | head -5
```

### Step 7: Push to GitHub

```bash
# First push may take longer (uploading 1.5GB)
git push origin main
```

### Step 8: Verify Vercel Build

Vercel should automatically:
1. Clone repository with Git LFS
2. Run `git lfs pull` (from your build command)
3. Build the site with videos available

---

## 🔧 Troubleshooting

### Issue: `git: 'lfs' is not a git command`

**Solution:**
```bash
brew install git-lfs
git lfs install
```

### Issue: GitHub LFS storage limit exceeded

**Solutions:**
1. Upgrade to GitHub Pro ($4/month) - 50GB storage
2. Compress videos to reduce size
3. Use external hosting (AWS S3, Cloudinary)

### Issue: Vercel build fails with "git lfs pull" error

**Possible causes:**
1. Git LFS not installed on Vercel (should be automatic)
2. LFS files not properly tracked
3. GitHub LFS quota exceeded

**Fix:**
- Ensure videos are tracked: `git lfs ls-files`
- Check GitHub LFS usage: https://github.com/settings/billing
- Verify `.gitattributes` is committed

### Issue: Videos not loading on deployed site

**Check:**
1. Videos exist in `dist/videos/` after build
2. Video URLs are correct (`/videos/filename.mov`)
3. Vercel build logs show LFS files being pulled
4. Browser console for 404 errors

**Debug:**
```bash
# Check if videos are in dist after build
npm run build
ls -lh dist/videos/

# Check Vercel build logs
# Go to Vercel dashboard > Deployments > Latest > Build Logs
```

---

## 📝 Vercel Configuration

Your current `vercel.json` and `package.json` are correctly configured:

**package.json:**
```json
"vercel-build": "git lfs pull && tsc && vite build"
```

**vercel.json:**
- Build command uses `vercel-build` script
- Output directory is `dist`
- Headers configured for video caching

**Vercel automatically:**
- Installs Git LFS during build
- Clones repository with LFS support
- Runs your build command which includes `git lfs pull`

---

## 🎯 Recommended Action Plan

### Immediate Steps (Choose One):

**A. GitHub Pro Route (Easiest):**
1. ✅ Upgrade to GitHub Pro ($4/month)
2. ✅ Install Git LFS: `brew install git-lfs`
3. ✅ Run: `git lfs install`
4. ✅ Run: `./setup-git-lfs.sh` (migrates existing videos)
5. ✅ Commit and push: `git push origin main`
6. ✅ Verify Vercel deployment

**B. AWS S3 Route (Cheapest):**
1. Create AWS account
2. Set up S3 bucket
3. Upload videos to S3
4. Update code to use S3 URLs
5. Remove videos from Git
6. Deploy

---

## 📊 Cost Comparison

| Solution | Setup Time | Monthly Cost | Annual Cost | Code Changes |
|----------|-----------|--------------|-------------|--------------|
| **GitHub Pro** | 5 min | $4 | $48 | None |
| **AWS S3** | 1-2 hours | ~$1 | ~$12 | Minimal (URLs) |
| Cloudinary Plus | 30-60 min | $89 | $1,068 | Minimal |

---

## ✅ Verification Checklist

After setup, verify:

- [ ] Git LFS installed: `git lfs version`
- [ ] LFS initialized: `git lfs install`
- [ ] Videos tracked: `git lfs ls-files` shows all videos
- [ ] .gitattributes committed: `git ls-files .gitattributes`
- [ ] GitHub Pro active (if using): Check billing page
- [ ] Videos pushed to GitHub: Check repository
- [ ] Vercel build succeeds: Check deployment logs
- [ ] Videos load on site: Test deployed site

---

## 🆘 Still Having Issues?

1. **Check Vercel build logs** - Look for LFS errors
2. **Verify GitHub LFS usage** - https://github.com/settings/billing
3. **Test locally**: `npm run build` and check `dist/videos/`
4. **Check browser console** - Look for 404 errors on video files

---

## 📚 Additional Resources

- Git LFS Documentation: https://git-lfs.github.com/
- GitHub LFS Limits: https://docs.github.com/en/repositories/working-with-files/managing-large-files/about-git-large-file-storage
- Vercel Git LFS: https://vercel.com/docs/concepts/git/git-lfs
- AWS S3 Setup Guide: (see AWS_S3_SETUP.md if created)

