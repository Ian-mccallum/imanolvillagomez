/** Browser file pickers sometimes omit MIME types, especially for folders and camera exports. */
const MIME: Record<string, string> = {
  jpg: 'image/jpeg',
  jpeg: 'image/jpeg',
  jpe: 'image/jpeg',
  png: 'image/png',
  gif: 'image/gif',
  webp: 'image/webp',
  avif: 'image/avif',
  bmp: 'image/bmp',
  svg: 'image/svg+xml',
  heic: 'image/heic',
  heif: 'image/heif',
  hif: 'image/heif',
  tif: 'image/tiff',
  tiff: 'image/tiff',
  mp4: 'video/mp4',
  m4v: 'video/mp4',
  mov: 'video/quicktime',
  webm: 'video/webm',
};
export function mediaType(file: { name: string; type: string }) {
  if (/^(image|video)\//i.test(file.type)) return file.type.toLowerCase();
  return (
    MIME[file.name.split('.').pop()?.toLowerCase() ?? ''] ??
    (isCameraRaw(file) ? 'image/x-camera-raw' : file.type)
  );
}
export function mediaKind(file: { name: string; type: string }) {
  const type = mediaType(file);
  return type.startsWith('image/') ? 'image' : type.startsWith('video/') ? 'video' : 'other';
}
/** Correct only the preview blob's metadata; the original File stays untouched for upload. */
export function previewBlob(file: File): Blob {
  const type = mediaType(file);
  return type && type !== file.type ? file.slice(0, file.size, type) : file;
}

export const CAMERA_RAW =
  /\.(arw|sr2|srf|cr2|cr3|crw|nef|nrw|raf|dng|orf|rw2|pef|srw|raw|3fr|fff|iiq|rwl|x3f)$/i;
export function isCameraRaw(file: { name: string; type: string }) {
  return CAMERA_RAW.test(file.name) || /raw|x-canon|x-nikon|x-sony|x-fuji/i.test(file.type);
}
