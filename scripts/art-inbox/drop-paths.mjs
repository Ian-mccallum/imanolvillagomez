// What a drop may change. Also what counts as the site's content moving under a preview.
export const ALLOWED = [
  /^public\/images\/(?:[^/]+\/)*[^/]+\.(?:jpe?g|png|webp|avif)$/i, // photos and their small copies
  /^src\/constants\/data\/[\w-]+\.json$/, // per-shoot photo data, photo-meta.json
  /^src\/constants\/(?:videos|photos)\.ts$/, // entries, tour tags, pins
  /^src\/assets\/posters\/[^/]+\.jpg$/, // video grid stills
  /^CHANGELOG\.md$/, // drops note themselves here
];

export const isDropPath = (path) => ALLOWED.some((re) => re.test(path));

/**
 * Site content `main` changed since `branch` forked from it. Non-empty means the preview
 * was built on an older site (another drop went live) and no longer shows what would ship.
 */
export function contentMovedSince(git, branch, main = 'origin/main') {
  const base = git('merge-base', branch, main);
  return git('diff', '--name-only', '-z', base, main).split('\0').filter((p) => p && isDropPath(p));
}
