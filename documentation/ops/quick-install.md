# 🚀 Quick Git LFS Install - Do This Now

## The Problem

You've tried installing Git LFS multiple times, but `git lfs version` still doesn't work. The issue is likely:
1. Git LFS binary not in your PATH
2. Not properly initialized after installation
3. Shell config not reloaded

## ✅ The Fix (Copy & Paste These Commands)

**Run these commands in order:**

```bash
# 1. Navigate to your project
cd /Users/ianmccallum/Desktop/Coding/nol

# 2. Run the installation script I created
./install-git-lfs-properly.sh
```

**If that doesn't work, try this manual approach:**

```bash
# Option A: Using Homebrew (if you have it)
brew install git-lfs
export PATH="/usr/local/bin:/opt/homebrew/bin:$PATH"
git lfs install

# Option B: Manual installation
cd /tmp
curl -L https://github.com/git-lfs/git-lfs/releases/download/v3.5.1/git-lfs-darwin-amd64-v3.5.1.tar.gz -o git-lfs.tar.gz
tar -xzf git-lfs.tar.gz
sudo ./install.sh
cd /Users/ianmccallum/Desktop/Coding/nol
export PATH="/usr/local/bin:$PATH"
git lfs install
```

## 🔍 Verify It Works

After installation, test it:

```bash
# This should show a version number
git lfs version

# This should show LFS config
git lfs env
```

## ⚠️ If Still Not Working

**The binary might be installed but not in PATH. Try:**

```bash
# Find where git-lfs is
find /usr/local /opt /usr -name git-lfs 2>/dev/null

# Use the full path
/usr/local/bin/git-lfs version
# or
/opt/homebrew/bin/git-lfs version

# Then add to PATH permanently
echo 'export PATH="/usr/local/bin:/opt/homebrew/bin:$PATH"' >> ~/.zshrc
source ~/.zshrc
```

## 🎯 After Git LFS Works

Once `git lfs version` works:

```bash
# 1. Initialize (if not done)
git lfs install

# 2. Track your videos
git lfs track "*.mov"
git lfs track "*.mp4"
git add .gitattributes

# 3. Migrate existing videos
git lfs migrate import --include="*.mov,*.mp4" --everything

# 4. Verify
git lfs ls-files

# 5. Push to GitHub
git push origin main
```

## 💡 Why This Keeps Failing

The most common issue is that Git LFS gets installed, but:
1. The binary isn't in your PATH
2. You need to restart your terminal or source your shell config
3. The `git lfs install` command wasn't run after installation

**The script I created (`install-git-lfs-properly.sh`) fixes all of these automatically!**

## 🆘 Still Stuck?

1. **Check if it's actually installed:**
   ```bash
   which git-lfs
   find /usr -name git-lfs 2>/dev/null
   ```

2. **Check your shell:**
   ```bash
   echo $SHELL
   # Make sure you're editing the right config file (.zshrc for zsh, .bash_profile for bash)
   ```

3. **Try a fresh terminal:**
   - Close your current terminal
   - Open a new one
   - Run `git lfs version`

4. **Use the full path:**
   ```bash
   /usr/local/bin/git-lfs version
   ```

