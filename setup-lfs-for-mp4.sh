#!/bin/bash
# Set up Git LFS for MP4 files

set -e

echo "🔧 Setting up Git LFS for MP4 files..."
echo ""

# Check if Git LFS is installed
if ! command -v git-lfs &> /dev/null && ! git lfs version &> /dev/null; then
    echo "❌ Git LFS not found"
    echo "Install with: brew install git-lfs"
    exit 1
fi

# Initialize Git LFS if not already done
echo "📦 Initializing Git LFS..."
git lfs install || echo "   (Already initialized)"

# Track MP4 files with LFS
echo ""
echo "📝 Tracking MP4 files with LFS..."
echo "*.mp4 filter=lfs diff=lfs merge=lfs -text" > .gitattributes

# Add .gitattributes
git add .gitattributes

# Migrate existing MP4 files to LFS
echo ""
echo "🔄 Migrating existing MP4 files to LFS..."
git lfs migrate import --include="*.mp4" --everything --yes

echo ""
echo "✅ Git LFS setup complete!"
echo ""
echo "📝 Next steps:"
echo "   1. Check LFS storage: https://github.com/settings/billing"
echo "   2. Add MP4 files: git add public/videos/*.mp4"
echo "   3. Commit: git commit -m 'Add MP4 videos with LFS'"
echo "   4. Push: git push origin main"
echo ""


