#!/bin/bash
# EMERGENCY FIX: Remove LFS tracking to fix Vercel clone hang

set -e

echo "🚨 EMERGENCY FIX: Removing LFS tracking to fix clone hang"
echo ""

# Check if .gitattributes exists
if [ -f .gitattributes ]; then
    echo "📝 Found .gitattributes - removing LFS tracking..."
    
    # Backup .gitattributes
    cp .gitattributes .gitattributes.backup
    echo "✅ Backed up .gitattributes to .gitattributes.backup"
    
    # Remove LFS tracking lines, keep file if it has other content
    grep -v "filter=lfs" .gitattributes > .gitattributes.tmp || true
    
    if [ -s .gitattributes.tmp ]; then
        mv .gitattributes.tmp .gitattributes
        echo "✅ Removed LFS tracking from .gitattributes"
    else
        # File is empty or only had LFS lines, remove it
        rm .gitattributes.tmp
        git rm .gitattributes
        echo "✅ Removed .gitattributes (only contained LFS tracking)"
    fi
    
    echo ""
    echo "📋 Changes made:"
    echo "   - Removed LFS filter tracking"
    echo "   - Git will no longer try to process LFS files during clone"
    echo ""
    echo "⚠️  IMPORTANT: Videos won't work after this (they'll be LFS pointers)"
    echo "   You'll need to host videos externally (S3, Cloudinary, etc.)"
    echo ""
    echo "✅ Ready to commit and push!"
    echo ""
    echo "Next steps:"
    echo "   git add .gitattributes"
    echo "   git commit -m 'Remove LFS tracking to fix Vercel clone hang'"
    echo "   git push origin main"
    
else
    echo "⚠️  .gitattributes not found - nothing to remove"
fi

