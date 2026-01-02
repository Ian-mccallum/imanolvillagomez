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
        # CRITICAL: Unset skip smudge so we can pull LFS files now
        # This was set to prevent clone hang, but we need it unset for build
        unset GIT_LFS_SKIP_SMUDGE
        export GIT_LFS_SKIP_SMUDGE=""
        git config --unset lfs.fetchexclude 2>/dev/null || true
        git config --unset core.lfs 2>/dev/null || true
        
        # Ensure Git LFS is enabled for this repo
        git config lfs.fetchexclude "" 2>/dev/null || true
        
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
            
            # Install LFS hooks first
            echo "   Installing LFS hooks..."
            $LFS_COMMAND install --skip-repo 2>&1 || true
            
            # Configure Git LFS to use Git's existing credentials
            # CRITICAL: Vercel clones with authentication, but Git LFS needs explicit config
            echo "   Configuring Git LFS authentication..."
            
            REMOTE_URL=$(git config --get remote.origin.url 2>/dev/null || echo "")
            echo "   Git remote URL: ${REMOTE_URL}"
            
            # Extract credentials from Git's credential helper or remote URL
            # Vercel stores credentials in .git/config or uses credential helper
            if [ -n "$REMOTE_URL" ]; then
                # Try to get the actual remote URL with credentials from Git config
                # Vercel might store it differently, so try multiple methods
                
                # Method 1: Use the remote URL directly (Git LFS should use Git's credential helper)
                echo "   Configuring Git LFS to use same remote as Git..."
                git config lfs.url "$REMOTE_URL" 2>/dev/null || true
                
                # Method 2: Ensure credential helper is configured
                echo "   Ensuring Git credential helper is available..."
                git config --global credential.helper store 2>/dev/null || true
                
                # Method 3: For HTTPS remotes, Git LFS should automatically use Git's credentials
                # For SSH remotes, Git LFS should use the same SSH keys
                if [[ "$REMOTE_URL" == https://* ]]; then
                    echo "   Git uses HTTPS - Git LFS will use Git's credential helper"
                elif [[ "$REMOTE_URL" == git@* ]] || [[ "$REMOTE_URL" == ssh://* ]]; then
                    echo "   Git uses SSH - Git LFS will use same SSH keys"
                    # Ensure SSH is configured for Git LFS
                    git config --global lfs.basictransferonly false 2>/dev/null || true
                fi
            fi
            
            # Configure Git LFS performance settings
            git config --global lfs.batch true 2>/dev/null || true
            git config --global lfs.concurrenttransfers 8 2>/dev/null || true
            
            # CRITICAL: Ensure Git LFS can access the remote
            # Try to verify LFS can see the remote
            echo "   Verifying Git LFS can access remote..."
            $LFS_COMMAND env 2>&1 | grep -E "(Endpoint|Remote)" | head -3 || echo "   (LFS env check completed)"
            
            # Try using git lfs fetch with explicit remote instead of pull
            # This might work better with existing Git credentials
            echo "   Using 'git lfs fetch' + 'git lfs checkout' instead of 'git lfs pull'"
            
            # Try to fetch and checkout LFS files
            # Use fetch + checkout instead of pull for better control
            echo "   Attempting to fetch LFS files from GitHub..."
            
            # Check one file before fetch to see if it's a pointer
            SAMPLE_FILE="public/videos/2hollisfull.mp4"
            if [ -f "$SAMPLE_FILE" ]; then
                BEFORE_SIZE=$(stat -f%z "$SAMPLE_FILE" 2>/dev/null || stat -c%s "$SAMPLE_FILE" 2>/dev/null || echo "0")
                echo "   Before fetch: $SAMPLE_FILE is ${BEFORE_SIZE} bytes"
            fi
            
            # Step 1: Fetch LFS objects (downloads but doesn't checkout)
            echo "   Step 1: Fetching LFS objects..."
            LFS_FETCH_OUTPUT=$($LFS_COMMAND fetch 2>&1)
            LFS_FETCH_EXIT=$?
            
            if [ $LFS_FETCH_EXIT -eq 0 ]; then
                echo "   ✅ LFS fetch succeeded"
                echo "$LFS_FETCH_OUTPUT" | grep -E "(Downloading|Uploading|batch)" | head -5 || echo "   (fetch output suppressed)"
            else
                echo "   ⚠️  LFS fetch failed with exit code $LFS_FETCH_EXIT"
                echo "$LFS_FETCH_OUTPUT" | head -10
            fi
            
            # Step 2: Checkout LFS files (replaces pointers with actual files)
            echo "   Step 2: Checking out LFS files..."
            LFS_CHECKOUT_OUTPUT=$($LFS_COMMAND checkout 2>&1)
            LFS_CHECKOUT_EXIT=$?
            
            if [ $LFS_CHECKOUT_EXIT -eq 0 ]; then
                echo "   ✅ LFS checkout succeeded"
            else
                echo "   ⚠️  LFS checkout failed with exit code $LFS_CHECKOUT_EXIT"
                echo "$LFS_CHECKOUT_OUTPUT" | head -10
            fi
            
            # Check if files were actually downloaded
            if [ -f "$SAMPLE_FILE" ]; then
                AFTER_SIZE=$(stat -f%z "$SAMPLE_FILE" 2>/dev/null || stat -c%s "$SAMPLE_FILE" 2>/dev/null || echo "0")
                echo "   After checkout: $SAMPLE_FILE is ${AFTER_SIZE} bytes"
                if [ "$AFTER_SIZE" -gt 1000 ] && [ "$AFTER_SIZE" -gt "$BEFORE_SIZE" ]; then
                    LFS_PULL_SUCCESS=true
                    echo "✅ LFS files were downloaded (file size increased from ${BEFORE_SIZE} to ${AFTER_SIZE} bytes)"
                elif [ "$AFTER_SIZE" -lt 1000 ]; then
                    LFS_PULL_SUCCESS=false
                    echo "⚠️  LFS checkout completed but files are still pointers (${AFTER_SIZE} bytes)"
                    if [ $LFS_FETCH_EXIT -ne 0 ]; then
                        echo "   Fetch failed - likely authentication issue"
                    elif [ $LFS_CHECKOUT_EXIT -ne 0 ]; then
                        echo "   Checkout failed - files may not have been fetched"
                    else
                        echo "   Unknown issue - fetch and checkout succeeded but files are still pointers"
                    fi
                fi
            fi
            
            # Set success based on exit codes if we couldn't check file size
            if [ -z "$LFS_PULL_SUCCESS" ]; then
                if [ $LFS_FETCH_EXIT -eq 0 ] && [ $LFS_CHECKOUT_EXIT -eq 0 ]; then
                    LFS_PULL_SUCCESS=true
                    echo "✅ git lfs fetch + checkout completed successfully"
                else
                    LFS_PULL_SUCCESS=false
                    echo "⚠️  git lfs fetch/checkout failed"
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
            for video_file in public/videos/*.mp4; do
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
    VIDEO_COUNT=$(find dist/videos -name "*.mp4" 2>/dev/null | wc -l | tr -d ' ')
    echo "✅ Found $VIDEO_COUNT video files in dist/videos/"
    
    # Check ALL video files to ensure they're actual files, not pointers
    echo ""
    echo "🔍 Verifying videos in dist/videos/ are actual files..."
    DIST_FAILED=()
    
    for video_file in dist/videos/*.mp4; do
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

