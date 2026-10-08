import photoMeta from '@/constants/data/photo-meta.json';

/**
 * Small copies of each photo, made by scripts/prepare-media.mjs at build time:
 * /images/sized/<name>-<hash>-<width>.webp. Grids load a 960/1600 copy and the viewer the
 * largest (2560), instead of the camera original (often 5–17 MB). A photo with no entry
 * (prepare-media couldn't read it) falls back to the original and a 4:5 placeholder shape.
 */
interface PhotoMeta {
  w: number;
  h: number;
  hash: string;
  widths: number[];
  color: string;
}

const META: Record<string, PhotoMeta | undefined> = photoMeta;

const sizedUrl = (imageUrl: string, m: PhotoMeta, width: number) => {
  const name = imageUrl.slice(imageUrl.lastIndexOf('/') + 1).replace(/\.[^.]+$/, '');
  return `/images/sized/${name}-${m.hash}-${width}.webp`;
};

export interface PhotoSources {
  src: string;
  srcSet?: string;
  width: number;
  height: number;
  /** Average colour, shown while the photo loads */
  color?: string;
}

/** For a grid tile: smallest copy as src, all copies in srcSet (pair with a `sizes` attribute). */
export function getPhotoSources(imageUrl: string): PhotoSources {
  const m = META[imageUrl];
  if (!m) return { src: imageUrl, width: 4, height: 5 };
  return {
    src: sizedUrl(imageUrl, m, m.widths[0]),
    srcSet: m.widths.map((w) => `${sizedUrl(imageUrl, m, w)} ${w}w`).join(', '),
    width: m.w,
    height: m.h,
    color: m.color,
  };
}

/** For the full-screen viewer: the largest copy (enough for its 2x zoom). */
export function getPhotoFullUrl(imageUrl: string): string {
  const m = META[imageUrl];
  return m ? sizedUrl(imageUrl, m, m.widths[m.widths.length - 1]) : imageUrl;
}
