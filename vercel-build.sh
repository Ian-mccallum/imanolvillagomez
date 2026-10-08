#!/bin/bash
# Vercel build script
# Videos are now hosted on Cloudflare R2, so no Git LFS needed

set -e

echo "🔨 Building application..."

# Grid-size photo copies, photo sizes/colours and video stills; only does what's missing
echo "📐 Preparing media..."
node scripts/prepare-media.mjs

# TypeScript compilation
echo "📝 Running TypeScript compiler..."
tsc

# Vite build
echo "⚡ Running Vite build..."
vite build

echo "✅ Build complete!"
