#!/bin/bash
# Re-encode MP4 videos for maximum web browser compatibility
# Uses H.264 baseline profile with yuv420p pixel format

set -e

echo "🎬 Re-encoding videos for web compatibility..."
echo ""

# Check if ffmpeg is installed
if ! command -v ffmpeg &> /dev/null; then
    echo "❌ ffmpeg is not installed"
    echo "Install with: brew install ffmpeg"
    exit 1
fi

# Directory with videos
VIDEO_DIR="public/videos"

# Count .mp4 files
MP4_COUNT=$(find "$VIDEO_DIR" -name "*.mp4" -type f | wc -l | tr -d ' ')
echo "📹 Found $MP4_COUNT MP4 files to re-encode"
echo ""

# Web-compatible encoding settings:
# -c:v libx264: H.264 video codec
# -profile:v baseline: Baseline profile (maximum compatibility)
# -level 3.0: H.264 level (good for web)
# -pix_fmt yuv420p: Pixel format (required for web compatibility)
# -preset medium: Encoding speed
# -crf 23: Quality (23 is high quality)
# -c:a aac: AAC audio codec
# -b:a 128k: Audio bitrate
# -movflags +faststart: Enables streaming (metadata at beginning)
# -movflags +frag_keyframe: Better for streaming
# -movflags +empty_moov: Better for streaming

CONVERTED=0
FAILED=0

for mp4_file in "$VIDEO_DIR"/*.mp4; do
    if [ ! -f "$mp4_file" ]; then
        continue
    fi
    
    filename=$(basename "$mp4_file" .mp4)
    temp_file="$VIDEO_DIR/${filename}_temp.mp4"
    
    echo "🔄 Re-encoding: $filename.mp4"
    echo "   Input size: $(du -h "$mp4_file" | cut -f1)"
    
    # Re-encode with web-compatible settings
    if ffmpeg -i "$mp4_file" \
        -c:v libx264 \
        -profile:v baseline \
        -level 3.0 \
        -pix_fmt yuv420p \
        -preset medium \
        -crf 23 \
        -c:a aac \
        -b:a 128k \
        -movflags +faststart \
        -movflags +frag_keyframe \
        -movflags +empty_moov \
        -y \
        "$temp_file" 2>&1 | tee /tmp/ffmpeg_output.log | grep -E "(error|Error|ERROR)" > /dev/null; then
        echo "   ❌ Re-encoding failed"
        cat /tmp/ffmpeg_output.log | tail -5
        rm -f "$temp_file"
        FAILED=$((FAILED + 1))
    else
        # Replace original with re-encoded version
        mv "$temp_file" "$mp4_file"
        echo "   ✅ Re-encoded: $filename.mp4"
        echo "   Output size: $(du -h "$mp4_file" | cut -f1)"
        CONVERTED=$((CONVERTED + 1))
    fi
    echo ""
done

echo "=========================================="
echo "✅ Re-encoding complete!"
echo "   Re-encoded: $CONVERTED files"
echo "   Failed: $FAILED files"
echo ""
echo "📝 Next steps:"
echo "   1. Test locally: Open a video in browser"
echo "   2. If it works, commit: git add public/videos/*.mp4"
echo "   3. Push: git push"
echo ""

