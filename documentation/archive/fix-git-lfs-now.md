# 🔧 Fix Git LFS Installation - Step by Step

## The Problem

You've tried installing Git LFS multiple times, but it's **still not working**. Here's how to fix it properly.

## ✅ Proper Installation Steps

### Step 1: Check Current State

First, let's see what's actually installed:

```bash
# Check if Git LFS binary exists
which git-lfs

# Check if Git recognizes LFS
git lfs version

# Check if it's in your PATH
echo $PATH | grep -i lfs
```

### Step 2: Install Git LFS (Multiple Methods)

**Method A: Homebrew (Recommended for macOS)**

```bash
# Install Homebrew if you don't have it
/bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"

# Install Git LFS
brew install git-lfs

# Verify installation
git lfs version
```

**Method B: Direct Download (If Homebrew doesn't work)**

```bash
# Download and install Git LFS manually
cd /tmp
curl -L https://github.com/git-lfs/git-lfs/releases/download/v3.5.1/git-lfs-darwin-amd64-v3.5.1.tar.gz -o git-lfs.tar.gz
tar -xzf git-lfs.tar.gz
sudo ./install.sh

# Verify
git lfs version
```

**Method C: Using the Installer Script**

```bash
# Download the installer
curl -s https://packagecloud.io/install/repositories/github/git-lfs/script.deb.sh | sudo bash

# Or for macOS, use the installer directly
# Download from: https://git-lfs.github.com/
```

### Step 3: Initialize Git LFS (CRITICAL STEP)

**This is often missed!** Installing isn't enough - you must initialize:

```bash
# Navigate to your project
cd /Users/ianmccallum/Desktop/Coding/nol

# Initialize Git LFS globally (for all repos)
git lfs install

# OR initialize just for this repo
git lfs install --local
```

**Verify it worked:**
```bash
git lfs env
```

You should see output showing LFS is active.

### Step 4: Verify Installation

Run these checks:

```bash
# 1. Check LFS version
git lfs version
# Should show: git-lfs/3.x.x (GitHub; ...)

# 2. Check LFS environment
git lfs env
# Should show: filter.lfs.clean, filter.lfs.smudge, etc.

# 3. Check if LFS is in Git config
git config --list | grep lfs
# Should show LFS-related config

# 4. Test LFS tracking
git lfs track "*.mov"
git lfs track "*.mp4"
```

### Step 5: Fix PATH Issues (If Still Not Working)

If `git lfs` still doesn't work after installation:

**Check where Git LFS was installed:**
```bash
# Find the binary
find /usr/local -name git-lfs 2>/dev/null
find /opt -name git-lfs 2>/dev/null
find ~ -name git-lfs 2>/dev/null

# Add to PATH if needed
export PATH="/usr/local/bin:$PATH"
# Add this to your ~/.zshrc or ~/.bash_profile
```

**For zsh (default on macOS):**
```bash
echo 'export PATH="/usr/local/bin:$PATH"' >> ~/.zshrc
source ~/.zshrc
```

**For bash:**
```bash
echo 'export PATH="/usr/local/bin:$PATH"' >> ~/.bash_profile
source ~/.bash_profile
```

## 🐛 Common Issues & Fixes

### Issue 1: "git: 'lfs' is not a git command"

**Causes:**
- Git LFS not installed
- Not in PATH
- Not initialized

**Fix:**
```bash
# Reinstall
brew uninstall git-lfs
brew install git-lfs

# Initialize
git lfs install

# Verify
git lfs version
```

### Issue 2: "Command not found: brew"

**Fix:**
Install Homebrew first:
```bash
/bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"
```

Or use manual installation (Method B above).

### Issue 3: "Git LFS installed but git lfs doesn't work"

**This usually means:**
1. Not initialized: Run `git lfs install`
2. PATH issue: Add to PATH (see Step 5)
3. Wrong Git: Make sure you're using system Git, not a different version

**Fix:**
```bash
# Check which Git you're using
which git

# Check Git version
git --version

# Reinstall Git LFS and initialize
brew reinstall git-lfs
git lfs install --force
```

### Issue 4: "Git LFS works in terminal but not in IDE"

**Fix:**
- Restart your IDE/editor
- Make sure IDE uses the same shell/PATH as terminal
- Check IDE's terminal settings

## 🔍 Diagnostic Commands

Run these to see what's wrong:

```bash
# 1. Check if installed
which git-lfs
git lfs version

# 2. Check if initialized
git lfs env

# 3. Check Git config
git config --list | grep lfs

# 4. Check PATH
echo $PATH

# 5. Check Homebrew (if using)
brew list git-lfs
brew info git-lfs
```

## ✅ Complete Installation Script

Here's a complete script that does everything:

```bash
#!/bin/bash
set -e

echo "🔧 Installing Git LFS..."

# Check if Homebrew is installed
if command -v brew &> /dev/null; then
    echo "✅ Homebrew found"
    brew install git-lfs
else
    echo "⚠️  Homebrew not found, installing manually..."
    # Manual installation steps here
    curl -L https://github.com/git-lfs/git-lfs/releases/download/v3.5.1/git-lfs-darwin-amd64-v3.5.1.tar.gz -o /tmp/git-lfs.tar.gz
    cd /tmp
    tar -xzf git-lfs.tar.gz
    sudo ./install.sh
fi

# Initialize Git LFS
echo "🔧 Initializing Git LFS..."
git lfs install

# Verify
echo "✅ Verifying installation..."
if git lfs version &> /dev/null; then
    echo "✅ Git LFS is working!"
    git lfs version
else
    echo "❌ Git LFS still not working"
    echo "Check PATH and try manual installation"
    exit 1
fi

echo "✅ Done! Git LFS is installed and initialized"
```

## 🎯 Quick Fix Right Now

**Try this exact sequence:**

```bash
# 1. Uninstall any existing (broken) installation
brew uninstall git-lfs 2>/dev/null || true

# 2. Install fresh
brew install git-lfs

# 3. Make sure it's in PATH
export PATH="/usr/local/bin:/opt/homebrew/bin:$PATH"

# 4. Initialize (THIS IS CRITICAL!)
git lfs install

# 5. Verify
git lfs version
git lfs env

# 6. If still not working, try force reinstall
git lfs uninstall
git lfs install --force
```

## 📝 After Installation Works

Once `git lfs version` works:

1. **Track your video files:**
   ```bash
   cd /Users/ianmccallum/Desktop/Coding/nol
   git lfs track "*.mov"
   git lfs track "*.mp4"
   git add .gitattributes
   ```

2. **Migrate existing videos:**
   ```bash
   git lfs migrate import --include="*.mov,*.mp4" --everything
   ```

3. **Verify tracking:**
   ```bash
   git lfs ls-files
   ```

4. **Push to GitHub:**
   ```bash
   git push origin main
   ```

## 🆘 Still Not Working?

If Git LFS still doesn't work after all this:

1. **Check your shell:**
   ```bash
   echo $SHELL
   # Make sure PATH is set in the right config file
   ```

2. **Try a new terminal window** - Sometimes PATH changes need a fresh shell

3. **Check for multiple Git installations:**
   ```bash
   which -a git
   which -a git-lfs
   ```

4. **Manual PATH fix:**
   ```bash
   # Find where git-lfs actually is
   find /usr -name git-lfs 2>/dev/null
   find /opt -name git-lfs 2>/dev/null
   find /Applications -name git-lfs 2>/dev/null
   
   # Then add that directory to PATH
   ```

5. **Last resort - Use full path:**
   ```bash
   /usr/local/bin/git-lfs install
   /usr/local/bin/git-lfs version
   ```

## ✅ Success Checklist

You'll know it's working when:

- [ ] `git lfs version` shows version number
- [ ] `git lfs env` shows LFS configuration
- [ ] `git lfs track "*.mov"` works without errors
- [ ] `git lfs ls-files` works (even if empty)

Once all these work, you're ready to migrate your videos!

