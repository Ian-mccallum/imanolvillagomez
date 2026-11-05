import test from 'node:test';
import assert from 'node:assert/strict';
import { File } from 'node:buffer';
import { readFile, writeFile, mkdir } from 'node:fs/promises';
import ts from 'typescript';
import sharp from 'sharp';

// Transpile the actual browser helpers without a browser or a development server.
async function loadHelper(name) {
  const source = await readFile(
    new URL(`../../src/components/art/${name}.ts`, import.meta.url),
    'utf8'
  );
  const { outputText } = ts.transpileModule(source, {
    compilerOptions: { target: ts.ScriptTarget.ES2022, module: ts.ModuleKind.ESNext },
  });
  return import(`data:text/javascript;base64,${Buffer.from(outputText).toString('base64')}`);
}
const { mediaType, mediaKind, previewBlob, isCameraRaw } = await loadHelper('mediaPreview');
const { embeddedJpegs } = await loadHelper('cameraJpeg');
const directory = '/tmp/nol-preview-test-assets';
await mkdir(directory, { recursive: true });
const pixels = sharp({ create: { width: 48, height: 32, channels: 3, background: '#e94f29' } });
const jpeg = await pixels.clone().jpeg().toBuffer();
const png = await pixels.clone().png().toBuffer();
const tiff = await pixels.clone().tiff().toBuffer();
const raw = Buffer.concat([Buffer.from('Synthetic RAW container\0'), jpeg, Buffer.alloc(73)]);
await Promise.all(
  [
    ['sample.jpg', jpeg],
    ['sample.png', png],
    ['sample.tiff', tiff],
    ['embedded-preview.nef', raw],
    ['unsupported.xyz', Buffer.from('Unsupported preview fixture\n')],
  ].map(([name, bytes]) => writeFile(`${directory}/${name}`, bytes))
);

test('missing and generic MIME types infer image, movie, and camera RAW types from extensions', () => {
  for (const type of ['', 'application/octet-stream']) {
    for (const [name, expected, kind] of [
      ['PHOTO.JPG', 'image/jpeg', 'image'],
      ['scan.tIfF', 'image/tiff', 'image'],
      ['phone.HEIC', 'image/heic', 'image'],
      ['phone.heif', 'image/heif', 'image'],
      ['clip.MOV', 'video/quicktime', 'video'],
      ['clip.mp4', 'video/mp4', 'video'],
      ['camera.NEF', 'image/x-camera-raw', 'image'],
      ['camera.cr3', 'image/x-camera-raw', 'image'],
    ]) {
      assert.equal(mediaType({ name, type }), expected, `${name}: ${type}`);
      assert.equal(mediaKind({ name, type }), kind);
    }
    assert.equal(mediaKind({ name: 'unsupported.xyz', type }), 'other');
  }
  assert.equal(mediaType({ name: 'photo.jpg', type: 'IMAGE/PNG' }), 'image/png');
  assert.equal(isCameraRaw({ name: 'camera.ARW', type: '' }), true);
  assert.equal(isCameraRaw({ name: 'camera', type: 'image/x-nikon-nef' }), true);
  assert.equal(isCameraRaw({ name: 'photo.jpg', type: 'image/jpeg' }), false);
});

test('preview MIME corrections preserve every original upload byte and File metadata', async () => {
  for (const [name, bytes, expected] of [
    ['sample.jpg', jpeg, 'image/jpeg'],
    ['sample.png', png, 'image/png'],
    ['sample.tiff', tiff, 'image/tiff'],
    ['camera.nef', raw, 'image/x-camera-raw'],
  ]) {
    for (const type of ['', 'application/octet-stream']) {
      const original = new File([bytes], name, { type, lastModified: 123456789 });
      const preview = previewBlob(original);
      assert.equal(preview.type, expected);
      assert.equal(original.type, type);
      assert.equal(original.name, name);
      assert.equal(original.lastModified, 123456789);
      assert.deepEqual(Buffer.from(await preview.arrayBuffer()), bytes);
      assert.deepEqual(Buffer.from(await original.arrayBuffer()), bytes);
    }
  }
  const recognized = new File([jpeg], 'sample.jpg', { type: 'image/jpeg' });
  assert.equal(previewBlob(recognized), recognized);
});

test('embedded JPEG survives all SOI marker splits and an EOI split at the 1 MiB chunk boundary', async () => {
  const chunk = 1024 * 1024;
  for (const start of [chunk - 3, chunk - 2, chunk - 1, chunk + 1, chunk - jpeg.length + 1]) {
    const container = new Blob([Buffer.alloc(start), jpeg, Buffer.alloc(11)]);
    const candidates = await embeddedJpegs(container);
    assert.equal(candidates.length, 1, `JPEG starts at ${start}`);
    assert.equal(candidates[0].type, 'image/jpeg');
    assert.deepEqual(Buffer.from(await candidates[0].arrayBuffer()), jpeg);
    assert.equal(
      (await sharp(Buffer.from(await candidates[0].arrayBuffer())).metadata()).width,
      48
    );
  }
});

test('nested JPEG thumbnail does not truncate the enclosing full preview', async () => {
  // A legal APP1 segment models an EXIF thumbnail inside a larger JPEG.
  const appPayload = Buffer.concat([Buffer.from('Exif\0\0'), jpeg]);
  const appHeader = Buffer.from([0xff, 0xe1, 0, 0]);
  appHeader.writeUInt16BE(appPayload.length + 2, 2);
  const outer = Buffer.concat([jpeg.subarray(0, 2), appHeader, appPayload, jpeg.subarray(2)]);
  const candidates = await embeddedJpegs(new Blob([Buffer.alloc(23), outer]));
  assert.equal(candidates.length, 2);
  assert.deepEqual(Buffer.from(await candidates[0].arrayBuffer()), outer);
  assert.deepEqual(Buffer.from(await candidates[1].arrayBuffer()), jpeg);
  assert.equal((await sharp(Buffer.from(await candidates[0].arrayBuffer())).metadata()).width, 48);
});

test('corrupt larger JPEG leaves a valid smaller fallback candidate available', async () => {
  const corrupt = Buffer.concat([
    Buffer.from([0xff, 0xd8, 0xff, 0xe1]),
    Buffer.alloc(jpeg.length + 100),
    Buffer.from([0xff, 0xd9]),
  ]);
  const candidates = await embeddedJpegs(new Blob([corrupt, Buffer.alloc(20), jpeg]));
  assert.equal(candidates.length, 2);
  await assert.rejects(sharp(Buffer.from(await candidates[0].arrayBuffer())).metadata());
  assert.deepEqual(Buffer.from(await candidates[1].arrayBuffer()), jpeg);
  assert.equal((await sharp(Buffer.from(await candidates[1].arrayBuffer())).metadata()).width, 48);
});

test('unsupported, truncated, and false-positive markers yield no preview', async () => {
  for (const bytes of [
    Buffer.from('Not an image'),
    jpeg.subarray(0, -2),
    Buffer.from([0xff, 0xd8, 0xff, 0xe1, 0xff, 0xd9]),
  ]) {
    assert.deepEqual(await embeddedJpegs(new Blob([bytes])), []);
  }
});

test('candidate output is largest first and capped at four previews', async () => {
  const images = Array.from({ length: 6 }, (_, index) =>
    Buffer.concat([jpeg.subarray(0, -2), Buffer.alloc(index * 20), jpeg.subarray(-2)])
  );
  const candidates = await embeddedJpegs(new Blob(images));
  assert.deepEqual(
    candidates.map((candidate) => candidate.size),
    images
      .slice(2)
      .reverse()
      .map((bytes) => bytes.length)
  );
});
