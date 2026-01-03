#!/bin/bash
# Comprehensive LFS cleanup script

set -e

echo "🧹 Cleaning up Git LFS storage..."
echo ""

export PATH="$HOME/.local/bin:$PATH"

# Check current LFS files
echo "📊 Current LFS files:"
git lfs ls-files 2>/dev/null | wc -l | xargs echo "   Total files tracked:"

echo ""
echo "🔍 Checking for .mov files in Git history..."
MOV_IN_HISTORY=$(git log --all --full-history --name-only --pretty=format: -- public/videos/*.mov 2>/dev/null | sort -u | wc -l | tr -d ' ')
echo "   Found .mov files in $MOV_IN_HISTORY commits"

if [ "$MOV_IN_HISTORY" -gt 0 ]; then
    echo ""
    echo "⚠️  .mov files still exist in Git history"
    echo "   This is why LFS storage isn't freed up"
    echo ""
    echo "🔄 Removing .mov files from ALL Git history..."
    echo "   This will rewrite history - make sure you're okay with this!"
    echo ""
    
    read -p "Continue? (y/n) " -n 1 -r
    echo
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        # Remove .mov from all history
        git lfs migrate export --include="*.mov" --everything --verbose
        
        echo ""
        echo "✅ Removed .mov files from Git history"
        echo ""
        echo "📝 Next steps:"
        echo "1. Force push: git push --force origin main"
        echo "2. Check GitHub LFS usage: https://github.com/settings/billing"
        echo "3. Storage should free up after force push"
    else
        echo "Cancelled"
        exit 0
    fi
else
    echo "✅ No .mov files found in Git history"
fi

echo ""
echo "🧹 Cleaning local LFS cache..."
git lfs prune --force 2>/dev/null || echo "   (No local cache to clean)"

echo ""
echo "✅ Cleanup complete!"


