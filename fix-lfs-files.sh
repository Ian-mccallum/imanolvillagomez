#!/bin/bash
# Fix LFS files that Git thinks are missing

set -e

echo "🔧 Fixing LFS files..."

# The file exists locally, but LFS doesn't recognize it
# We need to re-add it to LFS

echo "📝 Re-adding files to LFS tracking..."

# Remove from Git cache and re-add
git rm --cached public/videos/hellp2.mp4 2>/dev/null || true

# Make sure it's tracked by LFS
git lfs track "*.mp4" 2>/dev/null || true
git lfs track "*.mov" 2>/dev/null || true

# Add the file back
git add public/videos/hellp2.mp4

# Check if there are other missing files
echo ""
echo "🔍 Checking for other missing LFS files..."

MISSING_COUNT=0
if command -v git-lfs >/dev/null 2>&1 || git lfs version >/dev/null 2>&1; then
    git lfs ls-files 2>/dev/null | while read line; do
        if [ -n "$line" ]; then
            file=$(echo "$line" | awk '{print $3}')
            if [ -n "$file" ] && [ ! -f "$file" ]; then
                echo "⚠️  Missing: $file"
                MISSING_COUNT=$((MISSING_COUNT + 1))
            fi
        fi
    done
fi

echo ""
echo "✅ Fixed hellp2.mp4"
echo ""
echo "📋 Next steps:"
echo "   1. Review changes: git status"
echo "   2. Commit: git commit -m 'Fix LFS tracking for hellp2.mp4'"
echo "   3. Push LFS files: git lfs push --all origin main"
echo "   4. Push commits: git push origin main"

