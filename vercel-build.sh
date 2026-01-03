#!/bin/bash
# Vercel build script
# Videos are now hosted on Cloudflare R2, so no Git LFS needed

set -e

echo "🔨 Building application..."

# TypeScript compilation
echo "📝 Running TypeScript compiler..."
tsc

# Vite build
echo "⚡ Running Vite build..."
vite build

echo "✅ Build complete!"
