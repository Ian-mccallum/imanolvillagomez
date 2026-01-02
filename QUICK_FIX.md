# 🚀 Quick Fix Guide - Get Videos Working on Vercel

## The Problem

Your videos (1.5GB) aren't working on the deployed site because:
1. ❌ Git LFS is not installed locally
2. ❌ Videos exceed GitHub free LFS storage (1GB limit)
3. ❌ Videos may not be properly tracked by LFS

## ⚡ Fastest Solution: GitHub Pro

### Step 1: Upgrade GitHub (2 minutes)
1. Go to: https://github.com/settings/billing
2. Click "Upgrade to Pro" ($4/month)
3. You now have 50GB LFS storage (plenty for 1.5GB)

### Step 2: Install Git LFS (1 minute)
```bash
brew install git-lfs
git lfs install
```

### Step 3: Run Setup (2 minutes)
```bash
cd /Users/ianmccallum/Desktop/Coding/nol
./setup-git-lfs.sh
```

This will:
- Initialize LFS
- Track .mov and .mp4 files
- Migrate existing videos to LFS

### Step 4: Commit and Push (5-10 minutes)
```bash
# Review changes
git status

# Commit if needed
git commit -m "Migrate videos to Git LFS"

# Push to GitHub (first push may take 10-15 minutes for 1.5GB)
git push origin main
```

### Step 5: Verify Vercel Deployment
1. Go to Vercel dashboard
2. Check latest deployment
3. Videos should now load!

**Total time: ~15-20 minutes**

---

## 🔍 Diagnose Current State

Run the diagnostic script:
```bash
./diagnose-git-lfs.sh
```

This will show you:
- ✅/❌ Git LFS installation status
- ✅/❌ LFS initialization status
- ✅/❌ Video tracking status
- 📊 Storage usage
- 🎯 Next steps

---

## ⚠️ Alternative: If You Don't Want to Pay

### Option: AWS S3 (Cheaper but More Work)

**Cost:** ~$1-2/month vs $4/month for GitHub Pro

**Steps:**
1. Create AWS S3 bucket
2. Upload videos to S3
3. Make bucket public (or use signed URLs)
4. Update `src/constants/videos.ts` to use S3 URLs
5. Remove videos from Git
6. Deploy

**Time:** 1-2 hours of setup

---

## 🐛 Troubleshooting

### "git: 'lfs' is not a git command"
```bash
brew install git-lfs
git lfs install
```

### "LFS storage limit exceeded"
- Upgrade to GitHub Pro ($4/month)
- Or use AWS S3

### "Videos not loading on Vercel"
1. Check Vercel build logs for errors
2. Verify videos are in `dist/videos/` after build
3. Check browser console for 404 errors
4. Ensure `git lfs pull` runs successfully in build

### "Build fails on Vercel"
- Check that `.gitattributes` is committed
- Verify videos are tracked: `git lfs ls-files`
- Check GitHub LFS usage hasn't exceeded quota

---

## ✅ Verification Checklist

After setup:
- [ ] `git lfs version` works
- [ ] `git lfs ls-files` shows all videos
- [ ] GitHub Pro is active (if using)
- [ ] `git push` succeeds
- [ ] Vercel build succeeds
- [ ] Videos load on deployed site

---

## 📞 Need Help?

1. Run diagnostic: `./diagnose-git-lfs.sh`
2. Check full guide: `GIT_LFS_FIX_GUIDE.md`
3. Review Vercel build logs
4. Check GitHub LFS usage: https://github.com/settings/billing

