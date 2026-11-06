#!/usr/bin/env node
// Writes dist/site-manifest.json: every photo and video the site shows, in site order.
// Studio's Library reads it (from production) to know which files are in use.
import { createServer } from 'vite';
import { mkdirSync, readdirSync, readFileSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const out = process.argv[2] ?? join(root, 'dist/site-manifest.json');

/** Video files referenced straight from code (the home page background, etc.). */
function codeVideoFiles(dir = join(root, 'src')) {
  const found = new Set();
  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    const path = join(dir, entry.name);
    if (entry.isDirectory()) codeVideoFiles(path).forEach((f) => found.add(f));
    else if (/\.(tsx?|css)$/.test(entry.name))
      for (const m of readFileSync(path, 'utf8').matchAll(/\/videos\/([\w.-]+\.mp4)/g)) found.add(m[1]);
  }
  return [...found];
}

export async function buildManifest() {
  // configFile: false — the project config's dev plugins (fixture mode) call back into this
  const server = await createServer({
    root,
    configFile: false,
    resolve: { alias: { '@': join(root, 'src') } },
    optimizeDeps: { noDiscovery: true, include: [] },
    logLevel: 'error',
    server: { middlewareMode: true, hmr: false, ws: false },
    appType: 'custom',
  });
  try {
    const { videos, lostFilesVideos } = await server.ssrLoadModule('/src/constants/videos.ts');
    const { photos } = await server.ssrLoadModule('/src/constants/photos.ts');
    const meta = (await server.ssrLoadModule('/src/constants/data/photo-meta.json')).default ?? {};
    const file = (url) => decodeURIComponent(String(url ?? '').split('/').pop() ?? '');
    const video = (v, order, page) => ({
      id: v.id,
      title: v.title,
      artist: v.artist ?? v.client,
      song: v.song,
      location: v.location,
      year: v.year,
      tour: v.tour,
      featured: !!v.featured,
      file: file(v.videoUrl),
      order,
      page,
    });
    return {
      builtAt: new Date().toISOString(),
      commit: process.env.VERCEL_GIT_COMMIT_SHA ?? '',
      videos: [
        ...videos.map((v, i) => video(v, i, '/work/videos')),
        ...lostFilesVideos.map((v, i) => video(v, i, '/other')),
      ],
      alsoUsedVideoFiles: codeVideoFiles(),
      photos: photos.map((p, i) => ({
        id: p.id,
        imageUrl: p.imageUrl,
        client: p.client,
        year: p.year,
        tour: p.tour,
        order: i,
        // the grid's small copy (see src/utils/photoSources.ts)
        thumb: meta[p.imageUrl]
          ? `/images/sized/${p.imageUrl.split('/').pop().replace(/\.[^.]+$/, '')}-${meta[p.imageUrl].hash}-${meta[p.imageUrl].widths[0]}.webp`
          : p.imageUrl,
        w: meta[p.imageUrl]?.w,
        h: meta[p.imageUrl]?.h,
        color: meta[p.imageUrl]?.color,
      })),
    };
  } finally {
    await server.close();
  }
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  const manifest = await buildManifest();
  mkdirSync(dirname(out), { recursive: true });
  writeFileSync(out, JSON.stringify(manifest));
  console.log(`site manifest: ${manifest.videos.length} videos, ${manifest.photos.length} photos → ${out}`);
}
