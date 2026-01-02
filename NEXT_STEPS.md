# ✅ Next Steps - Git LFS is Working!

Great! Git LFS is now installed and working (version 3.7.1). Here's what to do next:

## ⚠️ CRITICAL: Upgrade GitHub First

**You MUST upgrade to GitHub Pro before pushing** because:
- You have **1.5GB of videos**
- GitHub free tier only allows **1GB LFS storage**
- Push will fail if you exceed the limit

### Upgrade GitHub Pro:
1. Go to: https://github.com/settings/billing
2. Click "Upgrade to Pro" ($4/month)
3. You'll get 50GB LFS storage (plenty for 1.5GB)

**Do this FIRST before the next steps!**

---

## Step-by-Step Setup

### Step 1: Initialize Git LFS (if not already done)

```bash
cd /Users/ianmccallum/Desktop/Coding/nol
git lfs install
```

### Step 2: Verify .gitattributes is correct

Your `.gitattributes` should already have:
```
*.mov filter=lfs diff=lfs merge=lfs -text
*.mp4 filter=lfs diff=lfs merge=lfs -text
```

If it does, skip to Step 3. If not:
```bash
git lfs track "*.mov"
git lfs track "*.mp4"
git add .gitattributes
```

### Step 3: Migrate Existing Videos to LFS

**This rewrites Git history** - but it's safe since you haven't pushed yet:

```bash
# Option A: Use the setup script
./setup-git-lfs.sh

# Option B: Manual migration
git lfs migrate import --include="*.mov,*.mp4" --everything
```

This will:
- Convert all existing .mov and .mp4 files to LFS pointers
- Rewrite Git history to use LFS
- Take a few minutes for 1.5GB of videos

### Step 4: Verify Migration

```bash
# Check that videos are tracked by LFS
git lfs ls-files

# Should show all your video files
# If empty, migration didn't work - check for errors
```

### Step 5: Review Changes

```bash
# See what changed
git status

# Check the log
git log --oneline -5
```

### Step 6: Commit (if needed)

If there are uncommitted changes:
```bash
git add .gitattributes
git commit -m "Configure Git LFS for videos"
```

### Step 7: Push to GitHub

**Make sure you upgraded to GitHub Pro first!**

```bash
# First push may take 10-15 minutes for 1.5GB
git push origin main
```

If you get an error about storage limits:
- You didn't upgrade to GitHub Pro yet
- Go back to Step 1 above

### Step 8: Verify on GitHub

1. Go to your repository: https://github.com/Ian-mccallum/imanolvillagomez
2. Check that videos show as LFS files (they'll have an LFS badge)
3. Check LFS usage: https://github.com/settings/billing

### Step 9: Verify Vercel Deployment

1. Go to Vercel dashboard
2. Check latest deployment
3. Videos should now load on your site!

---

## 🐛 Troubleshooting

### "LFS storage limit exceeded"
- **Fix:** Upgrade to GitHub Pro first!

### "git lfs migrate" fails
- Make sure you're in the project directory
- Check that videos are actually in Git: `git ls-files public/videos/*.mov`

### "No files tracked by LFS" after migration
- Check for errors during migration
- Try: `git lfs migrate import --include="*.mov,*.mp4" --everything --verbose`

### Push fails with "file too large"
- Videos weren't migrated to LFS
- Run migration again: `git lfs migrate import --include="*.mov,*.mp4" --everything`

---

## ✅ Success Checklist

- [ ] GitHub Pro upgraded ($4/month)
- [ ] `git lfs install` completed
- [ ] `.gitattributes` configured
- [ ] Migration completed: `git lfs ls-files` shows videos
- [ ] Push successful: `git push origin main`
- [ ] Videos show as LFS files on GitHub
- [ ] Vercel deployment succeeds
- [ ] Videos load on deployed site

---

## 📊 Expected Results

After migration:
- `git lfs ls-files` should show ~17 video files
- Video files in Git will be small pointers (not full files)
- Push will upload 1.5GB to GitHub LFS storage
- Vercel will pull LFS files during build
- Videos will work on your deployed site!

---

## 🎯 Quick Command Summary

```bash
# 1. Upgrade GitHub Pro (do this first!)
# https://github.com/settings/billing

# 2. Initialize
git lfs install

# 3. Migrate
./setup-git-lfs.sh

# 4. Verify
git lfs ls-files

# 5. Push
git push origin main
```

---

## 💡 Important Notes

1. **Migration rewrites history** - This is safe since you haven't pushed yet
2. **First push takes time** - 1.5GB upload may take 10-15 minutes
3. **GitHub Pro required** - Free tier won't work with 1.5GB
4. **Vercel handles LFS automatically** - Your build command already includes `git lfs pull`

Good luck! Once you upgrade GitHub Pro and run the migration, everything should work! 🚀

