#!/bin/bash
# Git LFS Setup and Migration Script
# Run this after installing Git LFS

set -e

echo "🔧 Setting up Git LFS..."

# Initialize Git LFS
git lfs install

# Track video files
echo "📹 Tracking video files with Git LFS..."
git lfs track "*.mov"
git lfs track "*.mp4"

# Add .gitattributes (created by git lfs track)
git add .gitattributes

# Since files are already in history, we need to migrate them
echo "🔄 Migrating existing video files to Git LFS..."
git lfs migrate import --include="*.mov,*.mp4" --everything

echo "✅ Git LFS setup complete!"
echo ""
echo "Next steps:"
echo "1. Review the changes: git status"
echo "2. Commit if needed: git commit -m 'Migrate videos to Git LFS'"
echo "3. Push to GitHub: git push -u origin main"

