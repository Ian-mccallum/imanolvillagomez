#!/usr/bin/env node
/**
 * Writes src/constants/data/photo-dimensions.json: { "/images/x.jpg": [width, height] }.
 *
 * The Photos grid needs each image's shape before it downloads. Without it every
 * tile is 0px tall until its file arrives, so the browser decides they're all on
 * screen and loading="lazy" fetches the whole library at once.
 *
 * Runs on every build (see package.json / vercel-build.sh), so newly added photos
 * are covered without a manual step. Reads only file headers; no dependencies.
 * Width/height are as displayed, i.e. after the EXIF orientation is applied.
 */
import { readdirSync, readFileSync, writeFileSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const imagesDir = join(root, 'public/images');
const outFile = join(root, 'src/constants/data/photo-dimensions.json');

/** EXIF orientation from an APP1 segment; 1 when absent. Orientations 5–8 are rotated 90°. */
function exifOrientation(buf, start, end) {
  if (buf.toString('latin1', start, start + 6) !== 'Exif\0\0') return 1;
  const tiff = start + 6;
  const le = buf.toString('latin1', tiff, tiff + 2) === 'II';
  const u16 = (o) => (le ? buf.readUInt16LE(o) : buf.readUInt16BE(o));
  const u32 = (o) => (le ? buf.readUInt32LE(o) : buf.readUInt32BE(o));
  const ifd = tiff + u32(tiff + 4);
  if (ifd + 2 > end) return 1;
  const count = u16(ifd);
  for (let i = 0; i < count; i++) {
    const entry = ifd + 2 + i * 12;
    if (entry + 12 > end) break;
    if (u16(entry) === 0x0112) return u16(entry + 8);
  }
  return 1;
}

function jpegSize(buf) {
  let orientation = 1;
  let i = 2;
  while (i + 4 < buf.length) {
    if (buf[i] !== 0xff) {
      i++;
      continue;
    }
    const marker = buf[i + 1];
    if (marker === 0xff) {
      i++;
      continue;
    }
    const len = buf.readUInt16BE(i + 2);
    if (marker === 0xe1) orientation = exifOrientation(buf, i + 4, i + 2 + len);
    // SOF0–SOF15, excluding DHT (C4), JPG (C8) and DAC (CC)
    if (marker >= 0xc0 && marker <= 0xcf && ![0xc4, 0xc8, 0xcc].includes(marker)) {
      const h = buf.readUInt16BE(i + 5);
      const w = buf.readUInt16BE(i + 7);
      return orientation >= 5 ? [h, w] : [w, h];
    }
    i += 2 + len;
  }
  return null;
}

function imageSize(buf) {
  if (buf[0] === 0xff && buf[1] === 0xd8) return jpegSize(buf);
  if (buf.toString('latin1', 1, 4) === 'PNG') return [buf.readUInt32BE(16), buf.readUInt32BE(20)];
  return null;
}

const dims = {};
for (const name of readdirSync(imagesDir).sort()) {
  if (!/\.(jpe?g|png)$/i.test(name)) continue;
  const size = imageSize(readFileSync(join(imagesDir, name)));
  if (size) dims[`/images/${name}`] = size;
  else console.warn(`photo-dimensions: could not read size of ${name}`);
}
writeFileSync(outFile, JSON.stringify(dims, null, 0).replace(/\],/g, '],\n') + '\n');
console.log(`photo-dimensions: ${Object.keys(dims).length} photos → ${outFile.slice(root.length + 1)}`);
