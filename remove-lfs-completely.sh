#!/bin/bash
# Remove LFS completely - compress videos and commit normally

set -e

echo "🎬 Step 1: Compressing large videos to under 100MB..."
echo ""

# First compress the 3 large videos
if [ -f "./compress-large-videos.sh" ]; then
    ./compress-large-videos.sh
else
    echo "⚠️  compress-large-videos.sh not found, skipping compression"
fi

echo ""
echo "📊 Checking video sizes..."
find public/videos -name "*.mp4" -exec ls -lh {} \; | awk '{print $5, $9}' | sort -h

echo ""
echo "🔍 Checking for videos over 100MB..."
OVER_100MB=$(find public/videos -name "*.mp4" -size +100M | wc -l | tr -d ' ')

if [ "$OVER_100MB" -gt 0 ]; then
    echo "⚠️  WARNING: Still have $OVER_100MB videos over 100MB!"
    echo "   These will need LFS or external hosting"
    find public/videos -name "*.mp4" -size +100M -exec ls -lh {} \;
    echo ""
    read -p "Continue anyway? (y/N) " -n 1 -r
    echo
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        exit 1
    fi
fi

echo ""
echo "🗑️  Step 2: Removing LFS tracking from .mp4 files..."
git lfs untrack "*.mp4" || echo "⚠️  Already untracked or LFS not initialized"

echo ""
echo "📝 Step 3: Updating .gitattributes..."
cat > .gitattributes << 'EOF'
# No LFS tracking - all files committed normally
EOF

git add .gitattributes

echo ""
echo "✅ Ready to commit!"
echo ""
echo "📝 Next steps:"
echo "1. Add videos: git add public/videos/*.mp4"
echo "2. Commit: git commit -m 'Add MP4 videos (no LFS)'"
echo "3. Push: git push"
echo ""
echo "⚠️  Note: If you still have videos over 100MB, GitHub will reject them"
echo "   You'll need to compress them more or use external hosting"
echo ""

