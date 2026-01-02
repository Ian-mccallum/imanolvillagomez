#!/bin/bash
# Setup the Git LFS you already downloaded

set -e

echo "🔧 Setting up your downloaded Git LFS..."

# Find the git-lfs binary
LFS_BINARY=""
if [ -f "/Users/ianmccallum/Downloads/git-lfs-3.7.1 2/git-lfs" ]; then
    LFS_BINARY="/Users/ianmccallum/Downloads/git-lfs-3.7.1 2/git-lfs"
elif [ -f "/Users/ianmccallum/Downloads/git-lfs-3.7.1/git-lfs" ]; then
    LFS_BINARY="/Users/ianmccallum/Downloads/git-lfs-3.7.1/git-lfs"
else
    echo "❌ Could not find git-lfs in Downloads"
    exit 1
fi

echo "✅ Found Git LFS at: $LFS_BINARY"

# Create local bin directory
INSTALL_DIR="$HOME/.local/bin"
mkdir -p "$INSTALL_DIR"

# Copy to local bin
echo "📁 Copying to $INSTALL_DIR..."
cp "$LFS_BINARY" "$INSTALL_DIR/git-lfs"
chmod +x "$INSTALL_DIR/git-lfs"

# Add to PATH in .zshrc
SHELL_CONFIG="$HOME/.zshrc"
if [ ! -f "$SHELL_CONFIG" ]; then
    touch "$SHELL_CONFIG"
fi

# Check if already in PATH
if ! grep -q "$INSTALL_DIR" "$SHELL_CONFIG" 2>/dev/null; then
    echo "" >> "$SHELL_CONFIG"
    echo "# Git LFS" >> "$SHELL_CONFIG"
    echo "export PATH=\"$INSTALL_DIR:\$PATH\"" >> "$SHELL_CONFIG"
    echo "✅ Added to $SHELL_CONFIG"
else
    echo "✅ Already in $SHELL_CONFIG"
fi

# Add to current session PATH
export PATH="$INSTALL_DIR:$PATH"

# Initialize Git LFS
echo "🔧 Initializing Git LFS..."
cd /Users/ianmccallum/Desktop/Coding/nol
"$INSTALL_DIR/git-lfs" install

# Verify
echo ""
echo "✅ Verification:"
"$INSTALL_DIR/git-lfs" version

echo ""
echo "✅ Git LFS is now set up!"
echo ""
echo "📝 Next steps:"
echo "1. Run: source ~/.zshrc"
echo "2. Or close and reopen your terminal"
echo "3. Verify: git lfs version"
echo "4. Then push: git push origin main"

