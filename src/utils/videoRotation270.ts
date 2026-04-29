/**
 * 270° clips use object-contain + rotate(); that preserves the full frame but
 * often reads “zoomed out” vs landscape clips. Scale crops letterboxing
 * and fills the frame (Carti Like Weezy, 2hollis Trauma, etc.).
 */
export const ROTATION_270_OBJECT_CONTAIN_ZOOM = 1.84;

export function cssTransformRotation270(
  zoom: number = ROTATION_270_OBJECT_CONTAIN_ZOOM
): string {
  return `rotate(270deg) scale(${zoom})`;
}
