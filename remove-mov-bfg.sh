#!/bin/bash
# Remove .mov files using BFG Repo-Cleaner (doesn't need LFS access)

set -e

echo "🧹 Removing .mov files with BFG Repo-Cleaner..."
echo ""

# Check if BFG is installed
if ! command -v bfg &> /dev/null; then
    echo "📥 BFG Repo-Cleaner not found"
    echo "Install with: brew install bfg"
    echo "Or download from: https://rtyley.github.io/bfg-repo-cleaner/"
    exit 1
fi

# Create a file list of .mov files to delete
echo "📝 Creating list of .mov files to remove..."
find public/videos -name "*.mov" -type f > /tmp/mov-files.txt

echo "🗑️  Removing .mov files from Git history..."
bfg --delete-files "*.mov"

echo ""
echo "🧹 Cleaning up..."
git reflog expire --expire=now --all
git gc --prune=now --aggressive

echo ""
echo "✅ Removed .mov files from Git history"
echo ""
echo "📝 Next steps:"
echo "1. Review: git log --oneline -5"
echo "2. Force push: git push --force origin main"
echo "3. Check LFS storage: https://github.com/settings/billing"
echo ""

