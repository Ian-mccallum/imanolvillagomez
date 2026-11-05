/** Find JPEG previews embedded in camera RAW containers without decoding sensor data. */
export async function embeddedJpegs(file: Blob): Promise<Blob[]> {
  const candidates: { start: number; end: number }[] = [];
  const starts: number[] = [];
  const chunkSize = 1024 * 1024;
  const limit = Math.min(file.size, 192 * 1024 * 1024);
  // Three-byte overlap catches markers split across chunk boundaries.
  for (let offset = 0; offset < limit; offset += chunkSize) {
    const bytes = new Uint8Array(
      await file.slice(offset, Math.min(offset + chunkSize + 3, limit)).arrayBuffer()
    );
    const count = Math.min(chunkSize, limit - offset);
    for (let i = 0; i < count && i + 1 < bytes.length; i++) {
      if (bytes[i] !== 0xff) continue;
      if (
        bytes[i + 1] === 0xd8 &&
        bytes[i + 2] === 0xff &&
        bytes[i + 3] >= 0xc0 &&
        bytes[i + 3] <= 0xfe
      ) {
        if (starts.length < 16) starts.push(offset + i);
      } else if (bytes[i + 1] === 0xd9 && starts.length) {
        const start = starts.pop()!;
        const end = offset + i + 2;
        if (end - start >= 128 && end - start <= 32 * 1024 * 1024) {
          candidates.push({ start, end });
          candidates.sort((a, b) => b.end - b.start - (a.end - a.start));
          candidates.length = Math.min(candidates.length, 4);
        }
      }
    }
  }
  return candidates
    .sort((a, b) => b.end - b.start - (a.end - a.start))
    .slice(0, 4)
    .map(({ start, end }) => file.slice(start, end, 'image/jpeg'));
}
