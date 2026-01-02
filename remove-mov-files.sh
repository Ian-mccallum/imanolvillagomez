#!/bin/bash
# Remove .mov files from Git and Git LFS to free up storage

set -e

echo "🗑️  Removing .mov files from Git and Git LFS..."
echo ""

# Make sure git-lfs is in PATH
export PATH="$HOME/.local/bin:$PATH"

# Check if we have .mov files tracked
MOV_FILES=$(git ls-files public/videos/*.mov 2>/dev/null | wc -l | tr -d ' ')
if [ "$MOV_FILES" -eq 0 ]; then
    echo "✅ No .mov files tracked in Git"
    exit 0
fi

echo "📹 Found $MOV_FILES .mov files in Git"
echo ""

# Remove from Git (but keep local files)
echo "🗑️  Removing .mov files from Git..."
git rm --cached public/videos/*.mov

# Remove from Git LFS (this frees up storage)
echo "🗑️  Removing .mov files from Git LFS..."
git lfs prune --force 2>/dev/null || echo "⚠️  Could not prune LFS (may need to push first)"

# Optionally remove .mov from .gitattributes (since we're not tracking them anymore)
# But we'll keep it in case you add .mov files in the future

echo ""
echo "✅ Removed .mov files from Git"
echo ""
echo "📝 Next steps:"
echo "1. Commit the removal: git commit -m 'Remove .mov files, using MP4 instead'"
echo "2. Push: git push origin main"
echo "3. This will free up GitHub LFS storage"
echo ""
echo "⚠️  Note: Local .mov files are still on your computer (not deleted)"
echo "   If you want to delete them locally too, run: rm public/videos/*.mov"

