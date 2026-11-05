import { embeddedJpegs } from './cameraJpeg';
import { isCameraRaw, mediaType } from './mediaPreview';

// Serialize heavyweight conversions; dozens of camera images must not decode together.
let pending: Promise<unknown> = Promise.resolve();
export function recoverImagePreview(file: File): Promise<Blob | null> {
  const task = pending.then(() => decode(file));
  pending = task.catch(() => null);
  return task;
}
async function usable(blob: Blob) {
  try {
    const bitmap = await createImageBitmap(blob);
    bitmap.close();
    return true;
  } catch {
    return false;
  }
}
async function decode(file: File): Promise<Blob | null> {
  const type = mediaType(file);
  const head = new Uint8Array(await file.slice(0, 64).arrayBuffer());
  const signature = new TextDecoder().decode(head);
  if (
    /hei[cf]/i.test(type) ||
    /\.(heic|heif)$/i.test(file.name) ||
    (signature.includes('ftyp') && /heic|heix|hevc|mif1|msf1/.test(signature))
  ) {
    if (file.size > 64 * 1024 * 1024) return null;
    const { heicTo } = await import('heic-to/csp');
    return heicTo({ blob: file, type: 'image/jpeg', quality: 0.8 });
  }
  const raw = isCameraRaw(file);
  const tiff = /tiff/i.test(type) || /\.tiff?$/i.test(file.name);
  if (!raw && !tiff) return null;
  if (raw) {
    for (const jpeg of await embeddedJpegs(file)) if (await usable(jpeg)) return jpeg;
  }
  if (file.size > 64 * 1024 * 1024) return null;
  const { default: UTIF } = await import('utif');
  const buffer = await file.arrayBuffer();
  const images = UTIF.decode(buffer)
    .filter((image) => {
      const pixels = Number(image.t256?.[0]) * Number(image.t257?.[0]);
      return pixels > 0 && pixels <= 24_000_000 && image.t262?.[0] !== 32803;
    })
    .sort(
      (a, b) =>
        Number(b.t256?.[0]) * Number(b.t257?.[0]) - Number(a.t256?.[0]) * Number(a.t257?.[0])
    );
  if (!images.length) return null;
  const image = images[0];
  UTIF.decodeImage(buffer, image);
  if (!image.width || !image.height) return null;
  const canvas = document.createElement('canvas');
  canvas.width = image.width;
  canvas.height = image.height;
  const context = canvas.getContext('2d');
  if (!context) return null;
  context.putImageData(
    new ImageData(new Uint8ClampedArray(UTIF.toRGBA8(image)), image.width, image.height),
    0,
    0
  );
  const result = await new Promise<Blob | null>((resolve) =>
    canvas.toBlob(resolve, 'image/jpeg', 0.8)
  );
  canvas.width = canvas.height = 1;
  return result;
}
