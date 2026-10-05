/**
 * Still images for the video grid, keyed by video file basename:
 * src/assets/posters/PROBLEMA.jpg is the poster for PROBLEMA.mp4.
 *
 * The grid shows these instead of loading each video file just to display one
 * frame (a 4K clip buffers several MB per tile). Vite fingerprints them, so they
 * cache like the rest of /assets. A video without a poster falls back to the old
 * behaviour, so a new upload still shows up before its poster is made.
 *
 * Make one with scripts/make-poster.sh (same frame the grid used to seek to: 1s, or the
 * video's thumbnailTime; handles HDR clips).
 */
const posters = import.meta.glob<string>('../assets/posters/*.jpg', {
  eager: true,
  query: '?url',
  import: 'default',
});

const byName: Record<string, string> = {};
for (const [path, url] of Object.entries(posters)) {
  byName[path.slice(path.lastIndexOf('/') + 1, -'.jpg'.length)] = url;
}

export function getVideoPoster(videoUrl: string): string | undefined {
  const file = videoUrl.slice(videoUrl.lastIndexOf('/') + 1);
  return byName[file.replace(/\.mp4$/i, '')];
}
