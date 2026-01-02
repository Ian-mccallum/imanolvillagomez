#!/bin/bash
# Vercel build script with Git LFS support

set -e

echo "🔧 Setting up Git LFS for Vercel build..."

# Try to use git lfs if available
if command -v git-lfs >/dev/null 2>&1; then
    echo "✅ Git LFS found"
    git lfs install
    git lfs pull
elif command -v git >/dev/null 2>&1 && git lfs version >/dev/null 2>&1; then
    echo "✅ Git LFS available via git"
    git lfs install
    git lfs pull
else
    echo "⚠️  Git LFS not found, attempting to install..."
    # Try to install Git LFS (Vercel uses Ubuntu-based images)
    if command -v apt-get >/dev/null 2>&1; then
        curl -s https://packagecloud.io/install/repositories/github/git-lfs/script.deb.sh | sudo bash
        sudo apt-get install -y git-lfs
        git lfs install
        git lfs pull
    else
        echo "❌ Could not install Git LFS automatically"
        echo "⚠️  Continuing build without LFS pull - videos may not be available"
    fi
fi

echo "✅ Building application..."
tsc && vite build

echo "✅ Build complete!"

