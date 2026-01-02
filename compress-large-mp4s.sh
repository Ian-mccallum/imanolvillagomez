#!/bin/bash
# Compress large MP4 videos to get under 100MB GitHub limit

set -e

echo "🎬 Compressing large MP4 videos to under 100MB..."
echo ""

if ! command -v ffmpeg &> /dev/null; then
    echo "❌ ffmpeg not found. Install with: brew install ffmpeg"
    exit 1
fi

# Videos over 100MB
LARGE_VIDEOS=(
    "public/videos/che.mp4"
    "public/videos/2hollisLOLLA.mp4"
)

# Videos over 50MB (recommended limit) - compress these too
MEDIUM_VIDEOS=(
    "public/videos/charlixcxSWEAT.mp4"
    "public/videos/hellp2.mp4"
    "public/videos/osamasonPSYKOTIC.mp4"
)

ALL_VIDEOS=("${LARGE_VIDEOS[@]}" "${MEDIUM_VIDEOS[@]}")

for video in "${ALL_VIDEOS[@]}"; do
    if [ ! -f "$video" ]; then
        echo "⚠️  Skipping $video (not found)"
        continue
    fi
    
    filename=$(basename "$video" .mp4)
    compressed="${video%.mp4}_compressed.mp4"
    original_size=$(du -h "$video" | cut -f1)
    original_bytes=$(stat -f%z "$video" 2>/dev/null || stat -c%s "$video" 2>/dev/null)
    original_mb=$((original_bytes / 1024 / 1024))
    
    echo "🔄 Compressing: $filename.mp4 ($original_size, ${original_mb}MB)"
    
    # More aggressive compression for large files
    # -crf 28: Lower quality but smaller file (23 is high quality, 28 is medium)
    # -preset slow: Better compression
    # -profile:v baseline: Maximum compatibility
    # -pix_fmt yuv420p: Required for web
    ffmpeg -i "$video" \
        -c:v libx264 \
        -profile:v baseline \
        -level 3.0 \
        -pix_fmt yuv420p \
        -preset slow \
        -crf 28 \
        -c:a aac \
        -b:a 96k \
        -movflags +faststart \
        -movflags +frag_keyframe \
        -y \
        "$compressed" 2>&1 | grep -E "(error|Error|ERROR)" > /dev/null && echo "   ❌ Failed" || echo "   ✅ Compressed"
    
    compressed_size=$(du -h "$compressed" | cut -f1)
    compressed_bytes=$(stat -f%z "$compressed" 2>/dev/null || stat -c%s "$compressed" 2>/dev/null)
    compressed_mb=$((compressed_bytes / 1024 / 1024))
    
    echo "   New size: $compressed_size (${compressed_mb}MB)"
    
    # Check if under 100MB
    if [ "$compressed_mb" -lt 100 ]; then
        echo "   ✅ Under 100MB - replacing original"
        mv "$compressed" "$video"
    else
        echo "   ⚠️  Still over 100MB (${compressed_mb}MB) - trying more aggressive compression..."
        # Try even more aggressive compression
        ffmpeg -i "$video" \
            -c:v libx264 \
            -profile:v baseline \
            -level 3.0 \
            -pix_fmt yuv420p \
            -preset slow \
            -crf 30 \
            -c:a aac \
            -b:a 64k \
            -movflags +faststart \
            -movflags +frag_keyframe \
            -y \
            "$compressed" 2>&1 | grep -E "(error|Error|ERROR)" > /dev/null && echo "   ❌ Failed" || echo "   ✅ Re-compressed"
        
        final_bytes=$(stat -f%z "$compressed" 2>/dev/null || stat -c%s "$compressed" 2>/dev/null)
        final_mb=$((final_bytes / 1024 / 1024))
        
        if [ "$final_mb" -lt 100 ]; then
            echo "   ✅ Under 100MB after aggressive compression (${final_mb}MB)"
            mv "$compressed" "$video"
        else
            echo "   ❌ Still over 100MB (${final_mb}MB) - may need to split or use external hosting"
            rm "$compressed"
        fi
    fi
    echo ""
done

echo "✅ Compression complete!"
echo ""
echo "📝 Next steps:"
echo "   1. Test videos locally"
echo "   2. Commit: git add public/videos/*.mp4"
echo "   3. Push: git push origin main"
echo ""

