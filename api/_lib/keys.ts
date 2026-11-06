// Which R2 paths the Library may touch. Everything else (auth/, queue/, analytics/, audit/,
// drops' request.json) is invisible to it. Same video name rule as the runner's uploads.
const NAME = '[A-Za-z0-9][A-Za-z0-9._-]{0,159}';
const VIDEO = new RegExp(`^videos/${NAME}\\.mp4$`);
const TRASH = new RegExp(`^trash/\\d{8}/videos/${NAME}\\.mp4$`);
const ORIGINAL = /^inbox\/\d{8}-[0-9a-f]{6}\/files\/(?:[\w.\- ]{1,80}\/)?[\w.\- ]{1,160}$/;

const clean = (key: unknown) => {
  const k = String(key ?? '');
  // eslint-disable-next-line no-control-regex -- rejecting control characters is the point
  return k.length <= 300 && !/(^|\/)\.\.?(\/|$)|\\|%|[\x00-\x1f\x7f]/.test(k) ? k : '';
};

export const isVideoKey = (key: unknown) => VIDEO.test(clean(key));
export const isTrashKey = (key: unknown) => TRASH.test(clean(key));
/** Readable through the Library: site videos, trash and drop originals. */
export const isReadableKey = (key: unknown) => {
  const k = clean(key);
  return VIDEO.test(k) || TRASH.test(k) || ORIGINAL.test(k);
};
export const isVideoName = (name: unknown) => new RegExp(`^${NAME}\\.mp4$`).test(String(name ?? ''));

export const trashKeyFor = (key: string, now = new Date()) =>
  `trash/${now.toISOString().slice(0, 10).replace(/-/g, '')}/${key}`;
/** trash/<yyyymmdd>/videos/x.mp4 → videos/x.mp4 */
export const originalOf = (trashKey: string) => trashKey.split('/').slice(2).join('/');
