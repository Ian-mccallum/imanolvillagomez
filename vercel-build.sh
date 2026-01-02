#!/bin/bash
# Vercel build script with Git LFS support

set -e

echo "🔧 Setting up Git LFS for Vercel..."

# Check if we're in a git repo
if [ ! -d .git ]; then
    echo "⚠️  Not in a git repository, skipping LFS pull"
else
    # Try to pull LFS files
    echo "📥 Pulling Git LFS files..."
    
    # Method 1: Try git lfs directly
    if command -v git-lfs >/dev/null 2>&1; then
        echo "✅ Found git-lfs command"
        git-lfs install --skip-repo || true
        git-lfs pull || echo "⚠️  git-lfs pull failed"
    # Method 2: Try via git lfs
    elif git lfs version >/dev/null 2>&1; then
        echo "✅ Found git lfs via git"
        git lfs install --skip-repo || true
        git lfs pull || echo "⚠️  git lfs pull failed"
    # Method 3: Install Git LFS
    else
        echo "⚠️  Git LFS not found, attempting to install..."
        if command -v apt-get >/dev/null 2>&1; then
            curl -s https://packagecloud.io/install/repositories/github/git-lfs/script.deb.sh | sudo bash
            sudo apt-get install -y git-lfs
            git lfs install --skip-repo || true
            git lfs pull || echo "⚠️  git lfs pull failed"
        else
            echo "❌ Could not install Git LFS"
        fi
    fi
    
    # Verify videos were pulled (check if they're actual files, not pointers)
    if [ -f "public/videos/2hollisLOLLA.mov" ]; then
        FILE_SIZE=$(stat -f%z "public/videos/2hollisLOLLA.mov" 2>/dev/null || stat -c%s "public/videos/2hollisLOLLA.mov" 2>/dev/null || echo "0")
        if [ "$FILE_SIZE" -lt 1000 ]; then
            echo "⚠️  WARNING: Video file appears to be LFS pointer (${FILE_SIZE} bytes), not actual file"
        else
            echo "✅ Video files appear to be pulled (sample file: ${FILE_SIZE} bytes)"
        fi
    fi
fi

echo "🔨 Building application..."
tsc && vite build

# Verify videos are in dist
if [ -d "dist/videos" ]; then
    VIDEO_COUNT=$(find dist/videos -name "*.mov" -o -name "*.mp4" 2>/dev/null | wc -l | tr -d ' ')
    echo "✅ Found $VIDEO_COUNT video files in dist/videos/"
else
    echo "⚠️  WARNING: dist/videos directory not found!"
fi

echo "✅ Build complete!"

