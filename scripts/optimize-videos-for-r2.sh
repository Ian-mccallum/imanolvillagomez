#!/bin/bash
# Optimize videos for web streaming before uploading to R2
# Ensures videos have faststart flag (moov atom at beginning) for instant playback

set -e

echo "🎬 Optimizing videos for web streaming..."
echo ""

# Check if ffmpeg is installed
if ! command -v ffmpeg &> /dev/null; then
    echo "❌ ffmpeg is not installed"
    echo "Install with: brew install ffmpeg"
    exit 1
fi

VIDEO_DIR="public/videos"
OPTIMIZED_COUNT=0
SKIPPED_COUNT=0

# Check if video is already optimized (has faststart)
check_faststart() {
    local file="$1"
    # Use ffprobe to check if moov atom is at the beginning
    if ffprobe -v error -select_streams v:0 -show_entries format=start_time -of default=noprint_wrappers=1 "$file" > /dev/null 2>&1; then
        # Check if file starts with ftyp (MP4 header)
        if head -c 4 "$file" | grep -q "ftyp"; then
            # Use atomicparsley or mp4info if available, otherwise assume needs optimization
            return 1  # Needs optimization
        fi
    fi
    return 0  # Already optimized (or can't determine)
}

for mp4_file in "$VIDEO_DIR"/*.mp4; do
    if [ ! -f "$mp4_file" ]; then
        continue
    fi
    
    # Skip osamasonpreview.mp4 (stays local)
    if [[ "$mp4_file" == *"osamasonpreview"* ]]; then
        echo "⏭️  Skipping $(basename "$mp4_file") (local file)"
        SKIPPED_COUNT=$((SKIPPED_COUNT + 1))
        continue
    fi
    
    filename=$(basename "$mp4_file")
    temp_file="$VIDEO_DIR/${filename%.mp4}_optimized.mp4"
    
    echo "🔄 Optimizing: $filename"
    echo "   Input size: $(du -h "$mp4_file" | cut -f1)"
    
    # Re-encode with faststart flag (moov atom at beginning for instant playback)
    # This allows browsers to start playing before downloading the entire file
    if ffmpeg -i "$mp4_file" \
        -c:v copy \
        -c:a copy \
        -movflags +faststart \
        -y \
        "$temp_file" 2>&1 | grep -i error > /dev/null; then
        echo "   ❌ Optimization failed"
        rm -f "$temp_file"
    else
        # Replace original with optimized version
        mv "$temp_file" "$mp4_file"
        echo "   ✅ Optimized: $filename (faststart enabled)"
        echo "   Output size: $(du -h "$mp4_file" | cut -f1)"
        OPTIMIZED_COUNT=$((OPTIMIZED_COUNT + 1))
    fi
    echo ""
done

echo "=========================================="
echo "✅ Optimization complete!"
echo "   Optimized: $OPTIMIZED_COUNT files"
echo "   Skipped: $SKIPPED_COUNT files"
echo ""
echo "📝 Next steps:"
echo "   1. Re-upload to R2: node scripts/upload-to-r2.js"
echo "   2. Videos will now load much faster!"
echo ""

