#!/bin/bash
# Vercel build script
# Videos are now hosted on Cloudflare R2, so no Git LFS needed

set -e

echo "🔨 Building application..."

# Photo sizes for the grid (so lazy loading works); covers newly added photos
echo "📐 Reading photo dimensions..."
node scripts/photo-dimensions.mjs

# TypeScript compilation
echo "📝 Running TypeScript compiler..."
tsc

# Vite build
echo "⚡ Running Vite build..."
vite build

echo "✅ Build complete!"
