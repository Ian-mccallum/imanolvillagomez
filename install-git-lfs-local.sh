#!/bin/bash
# Install Git LFS locally and add to PATH

set -e

echo "🔧 Installing Git LFS locally..."

# Detect architecture
ARCH=$(uname -m)
if [ "$ARCH" = "arm64" ] || [ "$ARCH" = "aarch64" ]; then
    LFS_ARCH="arm64"
    INSTALL_DIR="$HOME/.local/bin"
else
    LFS_ARCH="amd64"
    INSTALL_DIR="$HOME/.local/bin"
fi

# Create local bin directory if it doesn't exist
mkdir -p "$INSTALL_DIR"

# Download Git LFS
LFS_VERSION="v3.7.1"
echo "📥 Downloading Git LFS ${LFS_VERSION}..."
cd /tmp
curl -L "https://github.com/git-lfs/git-lfs/releases/download/${LFS_VERSION}/git-lfs-darwin-${LFS_ARCH}-${LFS_VERSION}.tar.gz" -o git-lfs.tar.gz

# Extract
echo "📦 Extracting..."
tar -xzf git-lfs.tar.gz

# Install to local directory
echo "📁 Installing to $INSTALL_DIR..."
cp git-lfs "$INSTALL_DIR/"
chmod +x "$INSTALL_DIR/git-lfs"

# Clean up
rm -f git-lfs.tar.gz
rm -rf git-lfs

# Add to PATH in shell config
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
echo "✅ Git LFS installed to: $INSTALL_DIR"
echo ""
echo "📝 Next steps:"
echo "1. Run: source ~/.zshrc"
echo "2. Or close and reopen your terminal"
echo "3. Verify: git lfs version"
echo "4. Then push: git push origin main"

