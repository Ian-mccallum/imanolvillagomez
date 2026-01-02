#!/bin/bash
# Remove .mov files from ALL Git history to free up LFS storage

set -e

echo "🗑️  Removing .mov files from ALL Git history..."
echo "⚠️  This will rewrite Git history!"
echo ""

export PATH="$HOME/.local/bin:$PATH"

# Check if git-lfs is available
if ! command -v git-lfs >/dev/null 2>&1 && [ ! -f "$HOME/.local/bin/git-lfs" ]; then
    echo "❌ Git LFS not found. Please install it first."
    exit 1
fi

# Use full path if needed
GIT_LFS_CMD="git-lfs"
if [ -f "$HOME/.local/bin/git-lfs" ]; then
    GIT_LFS_CMD="$HOME/.local/bin/git-lfs"
    export PATH="$HOME/.local/bin:$PATH"
fi

echo "📊 Checking current state..."
MOV_IN_HISTORY=$(git log --all --full-history --name-only --pretty=format: -- public/videos/*.mov 2>/dev/null | sort -u | wc -l | tr -d ' ')
echo "   Found .mov files in history: $MOV_IN_HISTORY unique files"

if [ "$MOV_IN_HISTORY" -eq 0 ]; then
    echo "✅ No .mov files in Git history"
    exit 0
fi

echo ""
echo "🔄 Removing .mov files from ALL commits..."
echo "   This uses: git lfs migrate export --include='*.mov' --everything"
echo ""

# Remove .mov from all history
$GIT_LFS_CMD migrate export --include="*.mov" --everything --verbose

echo ""
echo "✅ Removed .mov files from Git history"
echo ""
echo "📝 Next steps (REQUIRED):"
echo "1. Review changes: git log --oneline -5"
echo "2. Force push to GitHub: git push --force origin main"
echo "3. Check LFS storage: https://github.com/settings/billing"
echo ""
echo "⚠️  WARNING: Force push rewrites history!"
echo "   Only do this if you're the only one working on this repo"
echo ""

