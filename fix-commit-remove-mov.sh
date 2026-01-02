#!/bin/bash
# Remove .mov files from the last commit and recommit with only MP4s

set -e

echo "🔧 Fixing commit - removing .mov files..."
echo ""

# Reset the last commit but keep changes staged
echo "📝 Resetting last commit (keeping changes)..."
git reset --soft HEAD~1

# Unstage .mov files
echo "🗑️  Removing .mov files from staging..."
git reset HEAD public/videos/*.mov 2>/dev/null || echo "   (some may already be unstaged)"

# Check what's staged now
echo ""
echo "📊 Files still staged:"
git diff --cached --name-only | head -10

# Recommit without .mov files
echo ""
echo "✅ Recommitting without .mov files..."
git commit -m "Add MP4 videos only (no LFS, no .mov files)"

echo ""
echo "✅ Fixed! Now try: git push"
echo ""

