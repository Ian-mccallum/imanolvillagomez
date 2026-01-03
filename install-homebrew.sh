#!/bin/bash
# Install Homebrew on macOS

echo "🍺 Installing Homebrew..."
echo ""

# Check if Homebrew is already installed
if command -v brew &> /dev/null; then
    echo "✅ Homebrew is already installed!"
    brew --version
    exit 0
fi

# Install Homebrew
echo "📥 Downloading and installing Homebrew..."
/bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"

# Add Homebrew to PATH (for Apple Silicon Macs)
if [ -f "/opt/homebrew/bin/brew" ]; then
    echo ""
    echo "📝 Adding Homebrew to PATH..."
    echo 'eval "$(/opt/homebrew/bin/brew shellenv)"' >> ~/.zshrc
    eval "$(/opt/homebrew/bin/brew shellenv)"
    echo "✅ Added to ~/.zshrc"
fi

# Verify installation
echo ""
echo "✅ Homebrew installation complete!"
echo ""
echo "📝 Next steps:"
echo "1. Close and reopen your terminal, or run: source ~/.zshrc"
echo "2. Verify: brew --version"
echo "3. Install ffmpeg: brew install ffmpeg"
echo ""


