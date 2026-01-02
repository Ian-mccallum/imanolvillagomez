#!/bin/bash
# Convert all .mov files to web-compatible MP4 format
# Uses H.264 video codec and AAC audio codec for maximum browser compatibility

set -e

echo "🎬 Converting videos to web-compatible MP4 format..."
echo ""

# Check if ffmpeg is installed
if ! command -v ffmpeg &> /dev/null; then
    echo "❌ ffmpeg is not installed"
    echo "Install with: brew install ffmpeg"
    exit 1
fi

# Directory with videos
VIDEO_DIR="public/videos"
OUTPUT_DIR="public/videos"

# Count .mov files
MOV_COUNT=$(find "$VIDEO_DIR" -name "*.mov" -type f | wc -l | tr -d ' ')
echo "📹 Found $MOV_COUNT .mov files to convert"
echo ""

# Conversion settings for web compatibility
# -c:v libx264: H.264 video codec (universal browser support)
# -preset medium: Good balance of speed and compression
# -crf 23: High quality (lower = better quality, 18-28 is good range)
# -c:a aac: AAC audio codec (universal browser support)
# -b:a 128k: Audio bitrate
# -movflags +faststart: Enables streaming/partial playback

CONVERTED=0
SKIPPED=0
FAILED=0

for mov_file in "$VIDEO_DIR"/*.mov; do
    if [ ! -f "$mov_file" ]; then
        continue
    fi
    
    # Get filename without extension
    filename=$(basename "$mov_file" .mov)
    mp4_file="$OUTPUT_DIR/${filename}.mp4"
    
    # Skip if MP4 already exists
    if [ -f "$mp4_file" ]; then
        echo "⏭️  Skipping $filename.mov (MP4 already exists)"
        SKIPPED=$((SKIPPED + 1))
        continue
    fi
    
    echo "🔄 Converting: $filename.mov"
    echo "   Input size: $(du -h "$mov_file" | cut -f1)"
    
    # Convert to MP4
    if ffmpeg -i "$mov_file" \
        -c:v libx264 \
        -preset medium \
        -crf 23 \
        -c:a aac \
        -b:a 128k \
        -movflags +faststart \
        -y \
        "$mp4_file" 2>&1 | grep -E "(error|Error|ERROR)" > /dev/null; then
        echo "   ❌ Conversion failed"
        FAILED=$((FAILED + 1))
    else
        echo "   ✅ Converted to: $filename.mp4"
        echo "   Output size: $(du -h "$mp4_file" | cut -f1)"
        CONVERTED=$((CONVERTED + 1))
    fi
    echo ""
done

echo "=========================================="
echo "✅ Conversion complete!"
echo "   Converted: $CONVERTED files"
echo "   Skipped: $SKIPPED files (already exist)"
echo "   Failed: $FAILED files"
echo ""
echo "📝 Next steps:"
echo "   1. Update src/constants/videos.ts to use .mp4 instead of .mov"
echo "   2. Test locally: npm run dev"
echo "   3. Add MP4 files to Git: git add public/videos/*.mp4"
echo "   4. Commit and push"
echo ""

