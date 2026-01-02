#!/bin/bash
# Vercel build script with Git LFS support
# CRITICAL: This script is designed to NEVER hang, even if Git LFS fails

# IMPORTANT: Do NOT use 'set -e' here - we want to continue even if LFS fails
# Only exit on critical build failures (TypeScript/Vite), not LFS issues

echo "🔧 Setting up Git LFS for Vercel..."
echo "   DEBUG: SKIP_LFS=${SKIP_LFS:-not set}"
echo "   DEBUG: GIT_LFS_SKIP_SMUDGE=${GIT_LFS_SKIP_SMUDGE:-not set}"

# Allow skipping LFS entirely via environment variable
if [ "$SKIP_LFS" = "true" ]; then
    echo "⏭️  Skipping Git LFS (SKIP_LFS=true)"
else
    # Check if we're in a git repo
    if [ ! -d .git ]; then
        echo "⚠️  Not in a git repository, skipping LFS pull"
    else
        # Re-enable LFS fetch and unset skip smudge so we can pull LFS files now
        git config --unset lfs.fetchexclude 2>/dev/null || true
        unset GIT_LFS_SKIP_SMUDGE
        unset GIT_LFS_SKIP_PUSH
        # Configure Git to skip LFS during fetch/clone but allow manual pull
        git config lfs.fetchexclude '*' 2>/dev/null || true
        git config --unset lfs.fetchexclude 2>/dev/null || true
        
        # Try to pull LFS files
        echo "📥 Pulling Git LFS files..."
        echo "🔍 Checking for Git LFS installation..."
        
        LFS_PULL_SUCCESS=false
        LFS_COMMAND=""
        
        # Check if Git LFS is available
        if command -v git-lfs >/dev/null 2>&1; then
            LFS_COMMAND="git-lfs"
            echo "✅ Found git-lfs command"
            git-lfs version || true
        elif git lfs version >/dev/null 2>&1 2>&1; then
            LFS_COMMAND="git lfs"
            echo "✅ Found git lfs via git"
            git lfs version || true
        else
            echo "⚠️  Git LFS not found, attempting to install..."
            echo "   Checking for apt-get..."
            if command -v apt-get >/dev/null 2>&1; then
                echo "📦 Installing Git LFS (this may take a minute)..."
                # Install without sudo (Vercel builds don't have sudo)
                curl -s https://packagecloud.io/install/repositories/github/git-lfs/script.deb.sh | bash 2>&1 || true
                apt-get update -qq 2>&1 || true
                apt-get install -y git-lfs 2>&1 || {
                    echo "⚠️  apt-get install failed, trying alternative method..."
                    # Alternative: download and install manually
                    curl -L https://github.com/git-lfs/git-lfs/releases/download/v3.5.1/git-lfs-linux-amd64-v3.5.1.tar.gz -o /tmp/git-lfs.tar.gz 2>&1 || true
                    tar -xzf /tmp/git-lfs.tar.gz -C /tmp 2>&1 || true
                    /tmp/git-lfs install --skip-repo 2>&1 || true
                    export PATH="/tmp:$PATH"
                    LFS_COMMAND="/tmp/git-lfs"
                }
                # Verify installation worked
                if command -v git-lfs >/dev/null 2>&1; then
                    LFS_COMMAND="git-lfs"
                elif git lfs version >/dev/null 2>&1; then
                    LFS_COMMAND="git lfs"
                fi
                echo "✅ Git LFS installation complete"
            else
                echo "❌ Cannot install Git LFS - apt-get not available"
                echo "   DEBUG: Checking what package manager is available..."
                command -v yum >/dev/null 2>&1 && echo "   Found: yum" || true
                command -v apk >/dev/null 2>&1 && echo "   Found: apk" || true
                echo "   This means Git LFS cannot be installed automatically"
            fi
        fi
        
        echo "   DEBUG: After installation check, LFS_COMMAND='$LFS_COMMAND'"
        
        # Try to pull LFS files with proper timeout and hang detection
        if [ -n "$LFS_COMMAND" ]; then
            echo "📥 Starting LFS pull (~835MB, max 10 minutes)..."
            echo "   Using command: $LFS_COMMAND"
            echo "   This will timeout after 10 minutes to prevent hangs"
            
            # Make sure skip smudge is unset for LFS pull
            unset GIT_LFS_SKIP_SMUDGE
            git config --unset lfs.fetchexclude 2>/dev/null || true
            echo "   GIT_LFS_SKIP_SMUDGE unset, ready to pull LFS files"
            
            # Use a background process with timeout to prevent hangs
            # This ensures the script never hangs, even if git lfs pull hangs
            (
                $LFS_COMMAND install --skip-repo 2>&1 || true
                echo "   Installing LFS hooks..."
                # Try to pull with explicit remote URL in case auth is needed
                echo "   Attempting to pull LFS files from GitHub..."
                $LFS_COMMAND pull origin main --verbose 2>&1 | tee /tmp/lfs-pull.log || {
                    echo "   Pull from origin/main failed, trying without remote..."
                    $LFS_COMMAND pull --verbose 2>&1 | tee -a /tmp/lfs-pull.log
                }
            ) &
            LFS_PID=$!
            
            # Wait with timeout (10 minutes = 600 seconds - increased for large files)
            TIMEOUT=600
            ELAPSED=0
            INTERVAL=5
            
            while kill -0 $LFS_PID 2>/dev/null; do
                if [ $ELAPSED -ge $TIMEOUT ]; then
                    echo "⏱️  LFS pull timed out after ${TIMEOUT} seconds - killing process"
                    kill -9 $LFS_PID 2>/dev/null || true
                    wait $LFS_PID 2>/dev/null || true
                    LFS_PULL_SUCCESS=false
                    echo "   Check /tmp/lfs-pull.log for details"
                    break
                fi
                sleep $INTERVAL
                ELAPSED=$((ELAPSED + INTERVAL))
                # Show progress every 30 seconds
                if [ $((ELAPSED % 30)) -eq 0 ]; then
                    echo "   Still downloading... (${ELAPSED}s elapsed)"
                fi
            done
            
            # Check if it succeeded (only if we didn't timeout)
            if [ $ELAPSED -lt $TIMEOUT ]; then
                wait $LFS_PID
                LFS_EXIT_CODE=$?
                if [ $LFS_EXIT_CODE -eq 0 ]; then
                    LFS_PULL_SUCCESS=true
                    echo "✅ git lfs pull succeeded"
                else
                    echo "⚠️  git lfs pull failed with exit code $LFS_EXIT_CODE"
                    echo "   Check /tmp/lfs-pull.log for error details"
                    # Try to show last few lines of log
                    if [ -f /tmp/lfs-pull.log ]; then
                        echo "   Last 10 lines of LFS pull log:"
                        tail -10 /tmp/lfs-pull.log | sed 's/^/   /'
                    fi
                fi
            fi
        else
            echo "⚠️  Git LFS not available, skipping LFS pull"
            echo "   DEBUG: LFS_COMMAND is empty, Git LFS installation failed"
            echo "   This means videos will be LFS pointers, not actual files"
        fi
        
        # CRITICAL: Verify videos were pulled (check if they're actual files, not pointers)
        echo ""
        echo "🔍 Verifying LFS files were pulled..."
        FAILED_FILES=()
        CHECKED_COUNT=0
        
        # Check if videos directory exists
        if [ -d "public/videos" ]; then
            for video_file in public/videos/*.mp4 public/videos/*.mov; do
                # Skip if glob didn't match (no files)
                [ ! -f "$video_file" ] && continue
                if [ -f "$video_file" ]; then
                    CHECKED_COUNT=$((CHECKED_COUNT + 1))
                    FILE_SIZE=$(stat -f%z "$video_file" 2>/dev/null || stat -c%s "$video_file" 2>/dev/null || echo "0")
                    FILE_NAME=$(basename "$video_file")
                    
                    if [ "$FILE_SIZE" -lt 1000 ]; then
                        echo "❌ ERROR: $FILE_NAME is LFS pointer (${FILE_SIZE} bytes), not actual file!"
                        FAILED_FILES+=("$FILE_NAME")
                    elif [ $CHECKED_COUNT -le 3 ]; then
                        # Only show first 3 files to avoid spam
                        FILE_SIZE_MB=$((FILE_SIZE / 1024 / 1024))
                        echo "✅ $FILE_NAME: ${FILE_SIZE_MB}MB (actual file)"
                    fi
                fi
            done
            
            if [ $CHECKED_COUNT -gt 3 ]; then
                echo "✅ ... and $((CHECKED_COUNT - 3)) more files verified"
            fi
            
            if [ ${#FAILED_FILES[@]} -gt 0 ]; then
                echo ""
                echo "⚠️  WARNING: ${#FAILED_FILES[@]} video files are still LFS pointers!"
                echo "   Failed files: ${FAILED_FILES[*]}"
                echo "   This means git lfs pull did not work properly"
                echo ""
                echo "   Build will continue, but videos may not work on Vercel"
                echo "   Solutions:"
                echo "   1. Enable Git LFS in Vercel: Settings → Git → Enable 'Git Large File Storage (LFS)'"
                echo "   2. Check GitHub LFS quota: https://github.com/settings/billing"
                echo "   3. Set SKIP_LFS=true to skip LFS entirely (videos won't work)"
                echo ""
            else
                echo ""
                echo "✅ All video files are actual files (not LFS pointers)"
            fi
        else
            echo "⚠️  public/videos directory not found"
        fi
    fi
fi

echo ""
echo "🔨 Building application..."

# TypeScript compilation - THIS IS CRITICAL, exit on failure
echo "📝 Running TypeScript compiler..."
if ! tsc; then
    echo "❌ TypeScript compilation failed!"
    exit 1
fi

# Vite build - THIS IS CRITICAL, exit on failure
echo "⚡ Running Vite build..."
if ! vite build; then
    echo "❌ Vite build failed!"
    exit 1
fi

echo "✅ Build steps completed successfully"

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
        echo "⚠️  WARNING: ${#DIST_FAILED[@]} videos in dist are LFS pointers!"
        echo "   Files: ${DIST_FAILED[*]}"
        echo "   Videos will not work on Vercel"
        echo ""
        echo "   This means git lfs pull did not work during build."
        echo "   Check Vercel settings: Settings → Git → Enable 'Git Large File Storage (LFS)'"
        echo ""
        echo "   Build will continue, but videos will not be available."
        # Don't exit - let build complete, videos just won't work
    fi
else
    echo "⚠️  WARNING: dist/videos directory not found!"
fi

echo "✅ Build complete!"

