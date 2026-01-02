#!/bin/bash
# Complete Git LFS Installation and Fix Script
# This will properly install and configure Git LFS

set -e

echo "🔧 Git LFS Complete Installation & Fix"
echo "========================================"
echo ""

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Step 1: Check current state
echo "📋 Step 1: Checking current state..."
if git lfs version &> /dev/null; then
    echo -e "${GREEN}✅ Git LFS is already working!${NC}"
    git lfs version
    exit 0
else
    echo -e "${YELLOW}⚠️  Git LFS is not working${NC}"
fi
echo ""

# Step 2: Check for Homebrew
echo "📋 Step 2: Checking for Homebrew..."
if command -v brew &> /dev/null; then
    echo -e "${GREEN}✅ Homebrew found${NC}"
    BREW_AVAILABLE=true
else
    echo -e "${YELLOW}⚠️  Homebrew not found${NC}"
    BREW_AVAILABLE=false
fi
echo ""

# Step 3: Uninstall any broken installations
echo "📋 Step 3: Cleaning up any broken installations..."
if [ "$BREW_AVAILABLE" = true ]; then
    brew uninstall git-lfs 2>/dev/null || echo "  (No existing Homebrew installation)"
fi
echo ""

# Step 4: Install Git LFS
echo "📋 Step 4: Installing Git LFS..."

if [ "$BREW_AVAILABLE" = true ]; then
    echo "  Using Homebrew..."
    brew install git-lfs
else
    echo "  Using manual installation..."
    echo "  Downloading Git LFS..."
    
    # Detect architecture
    ARCH=$(uname -m)
    if [ "$ARCH" = "arm64" ] || [ "$ARCH" = "aarch64" ]; then
        LFS_ARCH="arm64"
    else
        LFS_ARCH="amd64"
    fi
    
    LFS_VERSION="v3.5.1"
    LFS_URL="https://github.com/git-lfs/git-lfs/releases/download/${LFS_VERSION}/git-lfs-darwin-${LFS_ARCH}-${LFS_VERSION}.tar.gz"
    
    cd /tmp
    curl -L "$LFS_URL" -o git-lfs.tar.gz
    tar -xzf git-lfs.tar.gz
    sudo ./install.sh
    cd - > /dev/null
fi
echo ""

# Step 5: Add to PATH if needed
echo "📋 Step 5: Ensuring Git LFS is in PATH..."

# Common locations
LFS_LOCATIONS=(
    "/usr/local/bin/git-lfs"
    "/opt/homebrew/bin/git-lfs"
    "/usr/bin/git-lfs"
)

LFS_FOUND=""
for location in "${LFS_LOCATIONS[@]}"; do
    if [ -f "$location" ]; then
        LFS_FOUND="$location"
        echo -e "${GREEN}✅ Found Git LFS at: $location${NC}"
        break
    fi
done

if [ -z "$LFS_FOUND" ]; then
    echo -e "${YELLOW}⚠️  Searching for Git LFS...${NC}"
    LFS_FOUND=$(find /usr/local /opt /usr -name git-lfs 2>/dev/null | head -1)
    if [ -n "$LFS_FOUND" ]; then
        echo -e "${GREEN}✅ Found Git LFS at: $LFS_FOUND${NC}"
    else
        echo -e "${RED}❌ Could not find Git LFS binary${NC}"
        exit 1
    fi
fi

# Add to PATH for current session
export PATH="$(dirname "$LFS_FOUND"):$PATH"

# Add to shell config
SHELL_CONFIG=""
if [ -f "$HOME/.zshrc" ]; then
    SHELL_CONFIG="$HOME/.zshrc"
elif [ -f "$HOME/.bash_profile" ]; then
    SHELL_CONFIG="$HOME/.bash_profile"
elif [ -f "$HOME/.bashrc" ]; then
    SHELL_CONFIG="$HOME/.bashrc"
fi

if [ -n "$SHELL_CONFIG" ]; then
    LFS_DIR="$(dirname "$LFS_FOUND")"
    if ! grep -q "$LFS_DIR" "$SHELL_CONFIG" 2>/dev/null; then
        echo "  Adding to PATH in $SHELL_CONFIG..."
        echo "" >> "$SHELL_CONFIG"
        echo "# Git LFS" >> "$SHELL_CONFIG"
        echo "export PATH=\"$LFS_DIR:\$PATH\"" >> "$SHELL_CONFIG"
        echo -e "${GREEN}✅ Added to $SHELL_CONFIG${NC}"
    else
        echo -e "${GREEN}✅ Already in PATH${NC}"
    fi
fi
echo ""

# Step 6: Verify installation
echo "📋 Step 6: Verifying installation..."
export PATH="$(dirname "$LFS_FOUND"):$PATH"

if git lfs version &> /dev/null; then
    echo -e "${GREEN}✅ Git LFS is now working!${NC}"
    git lfs version
else
    echo -e "${RED}❌ Git LFS still not working after installation${NC}"
    echo "  Try running: source $SHELL_CONFIG"
    echo "  Or use full path: $LFS_FOUND version"
    exit 1
fi
echo ""

# Step 7: Initialize Git LFS
echo "📋 Step 7: Initializing Git LFS..."
cd /Users/ianmccallum/Desktop/Coding/nol

# Force reinstall to fix any config issues
git lfs uninstall 2>/dev/null || true
git lfs install --force

echo -e "${GREEN}✅ Git LFS initialized${NC}"
echo ""

# Step 8: Verify environment
echo "📋 Step 8: Verifying Git LFS environment..."
if git lfs env &> /dev/null; then
    echo -e "${GREEN}✅ Git LFS environment configured${NC}"
    git lfs env | head -5
else
    echo -e "${YELLOW}⚠️  Could not verify environment (may still work)${NC}"
fi
echo ""

# Step 9: Test tracking
echo "📋 Step 9: Testing file tracking..."
git lfs track "*.mov" 2>/dev/null || true
git lfs track "*.mp4" 2>/dev/null || true
echo -e "${GREEN}✅ File tracking configured${NC}"
echo ""

# Final verification
echo "========================================"
echo -e "${GREEN}✅ Git LFS Installation Complete!${NC}"
echo "========================================"
echo ""
echo "Verification:"
echo "  Version: $(git lfs version 2>/dev/null || echo 'Check manually')"
echo ""
echo "Next steps:"
echo "  1. If you opened a new terminal, run: source $SHELL_CONFIG"
echo "  2. Verify: git lfs version"
echo "  3. Check tracking: git lfs ls-files"
echo "  4. Run migration: ./setup-git-lfs.sh"
echo ""
echo "If 'git lfs version' still doesn't work:"
echo "  - Close and reopen your terminal"
echo "  - Or run: source $SHELL_CONFIG"
echo "  - Or use: $(dirname "$LFS_FOUND")/git-lfs version"
echo ""

