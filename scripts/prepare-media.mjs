#!/usr/bin/env node
/**
 * Runs before every build (package.json "build", vercel-build.sh). Makes sure every photo and
 * video on the site has the small files the grids load, so nobody has to remember a step when
 * new work is published (the /studio runner's build gets this for free).
 *
 * Photos — for each image in public/images/:
 *   public/images/sized/<name>-<hash>-<width>.webp at 960 / 1600 / 2560 px wide (never wider
 *   than the original). The grid picks 960 or 1600, the full-screen viewer 2560 (it zooms to 2x).
 *   src/constants/data/photo-meta.json records each photo's displayed size (so tiles reserve
 *   their shape before loading), its average colour (the placeholder while it loads), the
 *   widths that exist, and the content hash. <hash> is part of the file name, so a replaced
 *   photo gets new URLs and the copies can be cached for a year. Work already done is skipped.
 *
 * Video stills — for each video in src/constants/videos.ts without src/assets/posters/<Name>.jpg,
 *   runs scripts/make-poster.sh when ffmpeg and the local copy in public/videos/ are available,
 *   otherwise warns (that tile falls back to loading the video itself).
 *
 * Commit what it writes: public/images/sized/, src/constants/data/photo-meta.json,
 * src/assets/posters/. If a copy wasn't committed, the deploy build regenerates it anyway.
 */
import { createHash } from 'node:crypto';
import { execFileSync, spawnSync } from 'node:child_process';
import { existsSync, mkdirSync, readFileSync, readdirSync, rmSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import sharp from 'sharp';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const imagesDir = join(root, 'public/images');
const sizedDir = join(imagesDir, 'sized');
const metaFile = join(root, 'src/constants/data/photo-meta.json');
const WIDTHS = [960, 1600, 2560];
const QUALITY = 78;

const t0 = Date.now();
mkdirSync(sizedDir, { recursive: true });
const previous = existsSync(metaFile) ? JSON.parse(readFileSync(metaFile, 'utf8')) : {};
const meta = {};
const keep = new Set();
let made = 0;

/** The standard widths below the original, plus the largest one (or the original, if smaller). */
const widthsFor = (w) => {
  const largest = Math.min(w, WIDTHS[WIDTHS.length - 1]);
  return [...WIDTHS.filter((x) => x < largest), largest];
};
const sizedName = (base, hash, width) => `${base}-${hash}-${width}.webp`;

for (const name of readdirSync(imagesDir).sort()) {
  if (!/\.(jpe?g|png)$/i.test(name)) continue;
  const file = join(imagesDir, name);
  const url = `/images/${name}`;
  const base = name.replace(/\.[^.]+$/, '');
  try {
    const hash = createHash('sha1').update(readFileSync(file)).digest('hex').slice(0, 8);
    const prev = previous[url];
    let entry = prev && prev.hash === hash ? prev : null;
    if (!entry) {
      const m = await sharp(file).metadata();
      const [w, h] = (m.orientation ?? 1) >= 5 ? [m.height, m.width] : [m.width, m.height];
      entry = { w, h, hash, widths: widthsFor(w) };
    }
    const missing = entry.widths.filter((width) => !existsSync(join(sizedDir, sizedName(base, hash, width))));
    if (missing.length || !entry.color) {
      // Decode once (EXIF orientation applied, converted to sRGB), then derive every size from it.
      const { data, info } = await sharp(file)
        .rotate()
        .resize({ width: entry.widths[entry.widths.length - 1], withoutEnlargement: true })
        .toColourspace('srgb')
        .raw()
        .toBuffer({ resolveWithObject: true });
      const raw = { raw: { width: info.width, height: info.height, channels: info.channels } };
      for (const width of missing) {
        await sharp(data, raw).resize({ width }).webp({ quality: QUALITY }).toFile(join(sizedDir, sizedName(base, hash, width)));
        made++;
      }
      const { channels } = await sharp(data, raw).stats();
      entry.color = '#' + channels.slice(0, 3).map((c) => Math.round(c.mean).toString(16).padStart(2, '0')).join('');
    }
    for (const width of entry.widths) keep.add(sizedName(base, hash, width));
    meta[url] = entry;
  } catch (e) {
    // An unreadable file must not break the deploy; the grid falls back to the original.
    console.warn(`prepare-media: skipped ${name}: ${e.message}`);
  }
}

// Copies of photos that were replaced or removed.
let removed = 0;
for (const f of readdirSync(sizedDir)) {
  if (!keep.has(f)) { rmSync(join(sizedDir, f)); removed++; }
}
writeFileSync(metaFile, '{\n' + Object.entries(meta).map(([k, v]) => `  ${JSON.stringify(k)}: ${JSON.stringify(v)}`).join(',\n') + '\n}\n');
console.log(`prepare-media: ${Object.keys(meta).length} photos (${made} copies made, ${removed} stale removed)`);

// ── Video stills ────────────────────────────────────────────────────────────
const videosTs = readFileSync(join(root, 'src/constants/videos.ts'), 'utf8');
const hasFfmpeg = spawnSync('ffmpeg', ['-version'], { stdio: 'ignore' }).status === 0;
const missingStills = [];
for (const block of videosTs.split(/\n\s*\{/)) {
  const file = block.match(/videoUrl:\s*getVideoUrl\('([^']+)'\)/)?.[1];
  if (!file) continue;
  const poster = join(root, 'src/assets/posters', file.replace(/\.mp4$/i, '.jpg'));
  if (existsSync(poster)) continue;
  const local = join(root, 'public/videos', file);
  const time = block.match(/thumbnailTime:\s*([\d.]+)/)?.[1] ?? '1';
  if (hasFfmpeg && existsSync(local)) {
    execFileSync(join(root, 'scripts/make-poster.sh'), [local, time], { stdio: 'inherit' });
  } else {
    missingStills.push(file);
  }
}
if (missingStills.length) {
  console.warn(
    `prepare-media: no grid still for ${missingStills.join(', ')}` +
      ` (${hasFfmpeg ? 'no local copy in public/videos/' : 'ffmpeg not installed'}); those tiles load the video itself`
  );
}
console.log(`prepare-media: done in ${((Date.now() - t0) / 1000).toFixed(1)}s`);
