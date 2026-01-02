#!/bin/bash
# Remove .mov files from Git history (doesn't need LFS access)

set -e

echo "🗑️  Removing .mov files from Git history..."
echo "⚠️  This rewrites Git history!"
echo ""

# Suppress filter-branch warning
export FILTER_BRANCH_SQUELCH_WARNING=1

# Check if .mov files exist in history
MOV_COUNT=$(git log --all --full-history --name-only --pretty=format: -- public/videos/*.mov 2>/dev/null | sort -u | wc -l | tr -d ' ')

if [ "$MOV_COUNT" -eq 0 ]; then
    echo "✅ No .mov files in Git history"
    exit 0
fi

echo "📊 Found $MOV_COUNT .mov files in Git history"
echo ""

# Try git-filter-repo first (better tool)
if command -v git-filter-repo &> /dev/null; then
    echo "🔄 Using git-filter-repo (recommended)..."
    git filter-repo --path-glob 'public/videos/*.mov' --invert-paths --force
else
    echo "🔄 Using git filter-branch..."
    # Remove .mov files from all commits using filter-branch
    git filter-branch --force --index-filter \
        "git rm --cached --ignore-unmatch public/videos/*.mov" \
        --prune-empty --tag-name-filter cat -- --all
    
    echo ""
    echo "🧹 Cleaning up..."
    git for-each-ref --format="%(refname)" refs/original/ | xargs -n 1 git update-ref -d 2>/dev/null || true
fi

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
echo "⚠️  WARNING: Force push rewrites history!"
echo "   Only do this if you're the only one working on this repo"
echo ""

