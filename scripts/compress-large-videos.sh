#!/bin/bash
# Compress large MP4 videos to get under 100MB GitHub limit

set -e

echo "🎬 Compressing large videos to under 100MB..."
echo ""

if ! command -v ffmpeg &> /dev/null; then
    echo "❌ ffmpeg not found. Install with: brew install ffmpeg"
    exit 1
fi

# Videos over 100MB
LARGE_VIDEOS=(
    "public/videos/hellp2.mp4"
    "public/videos/2hollisLOLLA.mp4"
    "public/videos/che.mp4"
)

for video in "${LARGE_VIDEOS[@]}"; do
    if [ ! -f "$video" ]; then
        echo "⚠️  Skipping $video (not found)"
        continue
    fi
    
    filename=$(basename "$video" .mp4)
    compressed="${video%.mp4}_compressed.mp4"
    original_size=$(du -h "$video" | cut -f1)
    
    echo "🔄 Compressing: $filename.mp4 ($original_size)"
    
    # More aggressive compression to get under 100MB
    # -crf 28: Lower quality but smaller file (23 is high quality, 28 is medium)
    # -preset slow: Better compression
    ffmpeg -i "$video" \
        -c:v libx264 \
        -preset slow \
        -crf 28 \
        -c:a aac \
        -b:a 96k \
        -movflags +faststart \
        -y \
        "$compressed" 2>&1 | grep -E "(error|Error|ERROR)" > /dev/null && echo "   ❌ Failed" || echo "   ✅ Compressed"
    
    compressed_size=$(du -h "$compressed" | cut -f1)
    echo "   New size: $compressed_size"
    
    # Check if under 100MB
    size_bytes=$(stat -f%z "$compressed" 2>/dev/null || stat -c%s "$compressed" 2>/dev/null)
    size_mb=$((size_bytes / 1024 / 1024))
    
    if [ "$size_mb" -lt 100 ]; then
        echo "   ✅ Under 100MB - replacing original"
        mv "$compressed" "$video"
    else
        echo "   ⚠️  Still over 100MB ($size_mb MB) - try more compression"
        rm "$compressed"
    fi
    echo ""
done

echo "✅ Compression complete!"


