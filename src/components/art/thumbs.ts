import { mediaKind, previewBlob } from './mediaPreview';
import { recoverImagePreview } from './imageDecoders';

const EDGE = 480;

async function draw(source: CanvasImageSource, w: number, h: number): Promise<Blob | null> {
  const scale = Math.min(1, EDGE / Math.max(w, h));
  const canvas = document.createElement('canvas');
  canvas.width = Math.max(1, Math.round(w * scale));
  canvas.height = Math.max(1, Math.round(h * scale));
  canvas.getContext('2d')?.drawImage(source, 0, 0, canvas.width, canvas.height);
  return new Promise((resolve) => canvas.toBlob(resolve, 'image/webp', 0.78));
}

async function fromImage(blob: Blob) {
  const bitmap = await createImageBitmap(blob);
  try {
    return await draw(bitmap, bitmap.width, bitmap.height);
  } finally {
    bitmap.close();
  }
}

function fromVideo(file: File): Promise<Blob | null> {
  return new Promise((resolve) => {
    const url = URL.createObjectURL(previewBlob(file));
    const video = document.createElement('video');
    const done = (b: Blob | null) => {
      URL.revokeObjectURL(url);
      resolve(b);
    };
    const timer = setTimeout(() => done(null), 15_000);
    video.muted = true;
    video.playsInline = true;
    video.preload = 'auto';
    video.onloadedmetadata = () => {
      video.currentTime = Math.min(1, (video.duration || 2) / 2);
    };
    video.onseeked = async () => {
      clearTimeout(timer);
      done(await draw(video, video.videoWidth, video.videoHeight).catch(() => null));
    };
    video.onerror = () => {
      clearTimeout(timer);
      done(null);
    };
    video.src = url;
  });
}

/** A small WebP for Studio's drop views; null when this browser can't decode the file. */
export async function makeThumb(file: File): Promise<Blob | null> {
  try {
    const kind = mediaKind(file);
    if (kind === 'video') return await fromVideo(file);
    if (kind !== 'image') return null;
    try {
      return await fromImage(previewBlob(file));
    } catch {
      const recovered = await recoverImagePreview(file);
      return recovered ? await fromImage(recovered) : null;
    }
  } catch {
    return null;
  }
}
