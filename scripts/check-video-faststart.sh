#!/bin/bash
# Check if videos have faststart flag (moov atom at beginning)

set -e

echo "🔍 Checking videos for faststart optimization..."
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
    
    # Method 1: Check if moov atom is at the beginning by examining file structure
    # Faststart videos have moov atom before mdat atom
    # We can check this by looking at the atom order
    
    # Use atomicparsley if available (more accurate)
    if command -v atomicparsley &> /dev/null; then
        # atomicparsley can show atom order
        local atom_order=$(atomicparsley "$file" -T 2>&1 | head -20)
        if echo "$atom_order" | grep -q "moov"; then
            # Check if moov comes before mdat in the first few atoms
            local first_atoms=$(echo "$atom_order" | head -5)
            if echo "$first_atoms" | grep -q "moov" && ! echo "$first_atoms" | grep -q "mdat"; then
                return 0  # Optimized (moov before mdat)
            fi
        fi
    fi
    
    # Method 2: Use ffprobe to check if we can read metadata quickly
    # This is less accurate but works without atomicparsley
    local probe_output=$(ffprobe -v error -select_streams v:0 -show_entries format=duration -of default=noprint_wrappers=1 "$file" 2>&1)
    
    if [ $? -eq 0 ]; then
        # Check file size - if it's large and we can read metadata quickly, likely optimized
        local file_size=$(stat -f%z "$file" 2>/dev/null || stat -c%s "$file" 2>/dev/null)
        
        # For files > 10MB, if we can read metadata instantly, likely has faststart
        if [ "$file_size" -gt 10485760 ]; then
            # Try to read just the first few KB to check atom order
            local first_kb=$(head -c 4096 "$file" | hexdump -C | head -10)
            
            # Look for moov atom signature (moov is 4 bytes: 6D 6F 6F 76)
            if echo "$first_kb" | grep -q "6d 6f 6f 76"; then
                return 0  # Likely optimized
            fi
        fi
    fi
    
    return 1  # Needs optimization
}

echo "Checking videos in $VIDEO_DIR..."
echo ""

for mp4_file in "$VIDEO_DIR"/*.mp4; do
    if [ ! -f "$mp4_file" ]; then
        continue
    fi
    
    filename=$(basename "$mp4_file")
    file_size_bytes=$(stat -f%z "$mp4_file" 2>/dev/null || stat -c%s "$mp4_file" 2>/dev/null)
    file_size_mb=$(echo "scale=2; $file_size_bytes / 1048576" | bc)
    
    echo -n "Checking $filename (${file_size_mb}MB)... "
    
    if check_faststart "$mp4_file"; then
        echo "✅ Optimized (has faststart)"
        OPTIMIZED=$((OPTIMIZED + 1))
    else
        echo "⚠️  Needs optimization (no faststart)"
        NEEDS_OPTIMIZATION=$((NEEDS_OPTIMIZATION + 1))
    fi
done

echo ""
echo "=========================================="
echo "📊 Summary:"
echo "   ✅ Optimized: $OPTIMIZED files"
echo "   ⚠️  Needs optimization: $NEEDS_OPTIMIZATION files"
echo ""

if [ "$NEEDS_OPTIMIZATION" -gt 0 ]; then
    echo "💡 To optimize videos with faststart flag:"
    echo "   1. Run: bash scripts/optimize-videos-for-r2.sh"
    echo "   2. Re-upload to R2: node scripts/upload-to-r2.js"
    echo ""
    echo "   This will allow videos to start playing before fully downloading!"
else
    echo "✅ All videos are optimized with faststart flag!"
fi

