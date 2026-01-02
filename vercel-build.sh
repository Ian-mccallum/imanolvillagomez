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
    
    LFS_PULL_SUCCESS=false
    
    # Method 1: Try git lfs directly
    if command -v git-lfs >/dev/null 2>&1; then
        echo "✅ Found git-lfs command"
        git-lfs install --skip-repo || true
        if git-lfs pull; then
            LFS_PULL_SUCCESS=true
            echo "✅ git-lfs pull succeeded"
        else
            echo "⚠️  git-lfs pull failed, trying alternative..."
        fi
    fi
    
    # Method 2: Try via git lfs (if Method 1 didn't work)
    if [ "$LFS_PULL_SUCCESS" = false ] && git lfs version >/dev/null 2>&1; then
        echo "✅ Found git lfs via git"
        git lfs install --skip-repo || true
        if git lfs pull; then
            LFS_PULL_SUCCESS=true
            echo "✅ git lfs pull succeeded"
        else
            echo "⚠️  git lfs pull failed"
        fi
    fi
    
    # Method 3: Install Git LFS (if Methods 1 & 2 didn't work)
    if [ "$LFS_PULL_SUCCESS" = false ]; then
        echo "⚠️  Git LFS not found, attempting to install..."
        if command -v apt-get >/dev/null 2>&1; then
            curl -s https://packagecloud.io/install/repositories/github/git-lfs/script.deb.sh | sudo bash
            sudo apt-get install -y git-lfs
            git lfs install --skip-repo || true
            if git lfs pull; then
                LFS_PULL_SUCCESS=true
                echo "✅ git lfs pull succeeded after install"
            fi
        fi
    fi
    
    # CRITICAL: Verify videos were pulled (check if they're actual files, not pointers)
    echo ""
    echo "🔍 Verifying LFS files were pulled..."
    FAILED_FILES=()
    
    for video_file in public/videos/*.mp4; do
        if [ -f "$video_file" ]; then
            FILE_SIZE=$(stat -f%z "$video_file" 2>/dev/null || stat -c%s "$video_file" 2>/dev/null || echo "0")
            FILE_NAME=$(basename "$video_file")
            
            if [ "$FILE_SIZE" -lt 1000 ]; then
                echo "❌ ERROR: $FILE_NAME is LFS pointer (${FILE_SIZE} bytes), not actual file!"
                FAILED_FILES+=("$FILE_NAME")
            else
                FILE_SIZE_MB=$((FILE_SIZE / 1024 / 1024))
                echo "✅ $FILE_NAME: ${FILE_SIZE_MB}MB (actual file)"
            fi
        fi
    done
    
    if [ ${#FAILED_FILES[@]} -gt 0 ]; then
        echo ""
        echo "❌ CRITICAL: ${#FAILED_FILES[@]} video files are still LFS pointers!"
        echo "   Failed files: ${FAILED_FILES[*]}"
        echo "   This means git lfs pull did not work properly"
        echo ""
        echo "   Attempting to manually pull LFS files..."
        # Try one more time with explicit paths
        git lfs pull --include="*.mp4" || {
            echo ""
            echo "❌ FATAL: Cannot pull LFS files. Build will fail."
            echo "   Make sure Git LFS is enabled in Vercel project settings:"
            echo "   Settings → Git → Enable 'Git Large File Storage (LFS)'"
            echo ""
            exit 1
        }
        
        # Verify again after manual pull
        FAILED_FILES=()
        for video_file in public/videos/*.mp4; do
            if [ -f "$video_file" ]; then
                FILE_SIZE=$(stat -f%z "$video_file" 2>/dev/null || stat -c%s "$video_file" 2>/dev/null || echo "0")
                if [ "$FILE_SIZE" -lt 1000 ]; then
                    FAILED_FILES+=("$(basename "$video_file")")
                fi
            fi
        done
        
        if [ ${#FAILED_FILES[@]} -gt 0 ]; then
            echo ""
            echo "❌ FATAL: Still have ${#FAILED_FILES[@]} LFS pointer files after manual pull"
            echo "   Files: ${FAILED_FILES[*]}"
            echo "   Build cannot continue - videos will not work"
            exit 1
        fi
    else
        echo ""
        echo "✅ All video files are actual files (not LFS pointers)"
    fi
fi

echo ""
echo "🔨 Building application..."
tsc && vite build

# Verify videos are in dist and are actual files (not LFS pointers)
if [ -d "dist/videos" ]; then
    VIDEO_COUNT=$(find dist/videos -name "*.mov" -o -name "*.mp4" 2>/dev/null | wc -l | tr -d ' ')
    echo "✅ Found $VIDEO_COUNT video files in dist/videos/"
    
    # Check ALL video files to ensure they're actual files, not pointers
    echo ""
    echo "🔍 Verifying videos in dist/videos/ are actual files..."
    DIST_FAILED=()
    
    for video_file in dist/videos/*.mp4 dist/videos/*.mov; do
        if [ -f "$video_file" ]; then
            FILE_SIZE=$(stat -f%z "$video_file" 2>/dev/null || stat -c%s "$video_file" 2>/dev/null || echo "0")
            FILE_NAME=$(basename "$video_file")
            
            if [ "$FILE_SIZE" -lt 1000 ]; then
                echo "❌ ERROR: $FILE_NAME in dist is LFS pointer (${FILE_SIZE} bytes)!"
                DIST_FAILED+=("$FILE_NAME")
            else
                FILE_SIZE_MB=$((FILE_SIZE / 1024 / 1024))
                echo "✅ $FILE_NAME: ${FILE_SIZE_MB}MB (actual file)"
            fi
        fi
    done
    
    if [ ${#DIST_FAILED[@]} -gt 0 ]; then
        echo ""
        echo "❌ FATAL: ${#DIST_FAILED[@]} videos in dist are LFS pointers!"
        echo "   Files: ${DIST_FAILED[*]}"
        echo "   Videos will not work on Vercel"
        exit 1
    fi
else
    echo "⚠️  WARNING: dist/videos directory not found!"
fi

echo "✅ Build complete!"

