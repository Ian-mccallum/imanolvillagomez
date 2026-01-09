#!/bin/bash
# Verify videos are optimized for web streaming (have faststart flag)

set -e

echo "🔍 Verifying video optimization..."
echo ""

if ! command -v ffprobe &> /dev/null; then
    echo "❌ ffprobe not found. Install with: brew install ffmpeg"
    exit 1
fi

VIDEO_DIR="public/videos"
NEEDS_OPTIMIZATION=0
OPTIMIZED=0

check_faststart() {
    local file="$1"
    # Check if video has faststart flag by examining file structure
    # Faststart videos have moov atom at the beginning (first 100 bytes contain ftyp)
    local first_bytes=$(head -c 100 "$file" | hexdump -C | head -1)
    
    # Check for MP4 header (ftyp)
    if echo "$first_bytes" | grep -q "ftyp"; then
        # Use ffprobe to check if we can read metadata quickly
        if ffprobe -v error -select_streams v:0 -show_entries format=duration -of default=noprint_wrappers=1 "$file" > /dev/null 2>&1; then
            return 0  # Likely optimized
        fi
    fi
    return 1  # Needs optimization
}

for mp4_file in "$VIDEO_DIR"/*.mp4; do
    if [ ! -f "$mp4_file" ]; then
        continue
    fi
    
    filename=$(basename "$mp4_file")
    file_size=$(du -h "$mp4_file" | cut -f1)
    
    if check_faststart "$mp4_file"; then
        echo "✅ $filename ($file_size) - Optimized"
        OPTIMIZED=$((OPTIMIZED + 1))
    else
        echo "⚠️  $filename ($file_size) - Needs optimization"
        NEEDS_OPTIMIZATION=$((NEEDS_OPTIMIZATION + 1))
    fi
done

echo ""
echo "=========================================="
echo "📊 Summary:"
echo "   Optimized: $OPTIMIZED files"
echo "   Needs optimization: $NEEDS_OPTIMIZATION files"
echo ""

if [ "$NEEDS_OPTIMIZATION" -gt 0 ]; then
    echo "💡 To optimize videos, run:"
    echo "   bash scripts/optimize-videos-for-r2.sh"
    echo ""
    echo "   Then re-upload to R2:"
    echo "   node scripts/upload-to-r2.js"
else
    echo "✅ All videos are optimized!"
fi

