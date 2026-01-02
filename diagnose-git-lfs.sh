#!/bin/bash
# Git LFS Diagnostic Script
# This script checks the current state of Git LFS setup

echo "🔍 Git LFS Diagnostic Tool"
echo "=========================="
echo ""

# Check if Git LFS is installed
echo "1. Checking Git LFS installation..."
if command -v git-lfs &> /dev/null || git lfs version &> /dev/null; then
    echo "   ✅ Git LFS is installed"
    git lfs version
else
    echo "   ❌ Git LFS is NOT installed"
    echo "   Install with: brew install git-lfs"
fi
echo ""

# Check if LFS is initialized
echo "2. Checking Git LFS initialization..."
if git lfs env &> /dev/null; then
    echo "   ✅ Git LFS is initialized"
    git lfs env | grep -E "(Git LFS:|Local)";
else
    echo "   ❌ Git LFS is not initialized"
    echo "   Initialize with: git lfs install"
fi
echo ""

# Check .gitattributes
echo "3. Checking .gitattributes configuration..."
if [ -f .gitattributes ]; then
    echo "   ✅ .gitattributes exists"
    echo "   Contents:"
    cat .gitattributes | sed 's/^/      /'
else
    echo "   ❌ .gitattributes not found"
fi
echo ""

# Check if videos are tracked by LFS
echo "4. Checking if videos are tracked by Git LFS..."
if git lfs ls-files &> /dev/null 2>&1; then
    LFS_FILES=$(git lfs ls-files | wc -l | tr -d ' ')
    if [ "$LFS_FILES" -gt 0 ]; then
        echo "   ✅ $LFS_FILES files tracked by LFS"
        echo "   Sample files:"
        git lfs ls-files | head -5 | sed 's/^/      /'
    else
        echo "   ⚠️  No files tracked by LFS yet"
    fi
else
    echo "   ❌ Cannot check LFS files (LFS may not be installed)"
fi
echo ""

# Check video files in repository
echo "5. Checking video files in repository..."
VIDEO_FILES=$(find public/videos -name "*.mov" -o -name "*.mp4" 2>/dev/null | wc -l | tr -d ' ')
if [ "$VIDEO_FILES" -gt 0 ]; then
    echo "   ✅ Found $VIDEO_FILES video files locally"
    echo "   Total size:"
    du -sh public/videos/ 2>/dev/null | sed 's/^/      /'
    echo ""
    echo "   Largest files:"
    ls -lhS public/videos/*.mov public/videos/*.mp4 2>/dev/null | head -5 | awk '{print "      " $9 " (" $5 ")"}'
else
    echo "   ⚠️  No video files found in public/videos/"
fi
echo ""

# Check if videos are in Git
echo "6. Checking if videos are tracked by Git..."
GIT_VIDEOS=$(git ls-files public/videos/*.mov public/videos/*.mp4 2>/dev/null | wc -l | tr -d ' ')
if [ "$GIT_VIDEOS" -gt 0 ]; then
    echo "   ✅ $GIT_VIDEOS video files tracked by Git"
    echo "   Sample files:"
    git ls-files public/videos/*.mov public/videos/*.mp4 2>/dev/null | head -5 | sed 's/^/      /'
else
    echo "   ⚠️  No video files tracked by Git"
fi
echo ""

# Check GitHub LFS storage (if we can determine)
echo "7. Checking GitHub repository..."
REMOTE_URL=$(git remote get-url origin 2>/dev/null)
if [ -n "$REMOTE_URL" ]; then
    echo "   Repository: $REMOTE_URL"
    echo "   ⚠️  Check LFS usage at: https://github.com/settings/billing"
    echo "   Free tier: 1GB storage, 1GB bandwidth/month"
    echo "   Your videos: 1.5GB (exceeds free tier)"
else
    echo "   ⚠️  No remote repository configured"
fi
echo ""

# Check Vercel build configuration
echo "8. Checking Vercel build configuration..."
if [ -f package.json ]; then
    if grep -q "git lfs pull" package.json; then
        echo "   ✅ Build script includes 'git lfs pull'"
        echo "   Build command:"
        grep -A 1 '"vercel-build"' package.json | sed 's/^/      /'
    else
        echo "   ⚠️  Build script does not include 'git lfs pull'"
    fi
else
    echo "   ⚠️  package.json not found"
fi
echo ""

# Summary and recommendations
echo "=========================="
echo "📋 Summary & Recommendations"
echo "=========================="
echo ""

if ! command -v git-lfs &> /dev/null && ! git lfs version &> /dev/null; then
    echo "❌ CRITICAL: Git LFS is not installed"
    echo "   → Install: brew install git-lfs"
    echo "   → Then run: git lfs install"
    echo ""
fi

if [ "$VIDEO_FILES" -gt 0 ] && [ "$GIT_VIDEOS" -eq 0 ]; then
    echo "⚠️  Videos exist locally but are not tracked by Git"
    echo "   → Add them: git add public/videos/*.mov public/videos/*.mp4"
    echo ""
fi

if [ "$VIDEO_FILES" -gt 0 ] && [ "$LFS_FILES" -eq 0 ] 2>/dev/null; then
    echo "⚠️  Videos are in Git but not tracked by LFS"
    echo "   → Migrate: git lfs migrate import --include=\"*.mov,*.mp4\" --everything"
    echo "   → Or run: ./setup-git-lfs.sh"
    echo ""
fi

echo "📊 Video Storage:"
du -sh public/videos/ 2>/dev/null | awk '{print "   Total: " $1}'
echo "   GitHub Free LFS: 1GB (you have 1.5GB)"
echo "   → Consider: Upgrade to GitHub Pro ($4/month) for 50GB"
echo ""

echo "✅ Next Steps:"
echo "   1. Install Git LFS: brew install git-lfs"
echo "   2. Initialize: git lfs install"
echo "   3. Upgrade GitHub to Pro (if using LFS): https://github.com/settings/billing"
echo "   4. Run setup: ./setup-git-lfs.sh"
echo "   5. Push to GitHub: git push origin main"
echo ""

