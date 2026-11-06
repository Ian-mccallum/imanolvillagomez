// Where each file of a drop went, as the AI reported it, kept only where the branch's own
// diff backs it up. The AI's words never reach Imanol's page unchecked.
const SITE = 'https://www.imanolvillagomez.com';
const PAGE = { photo: `${SITE}/work/photos`, video: `${SITE}/work/videos` };
const str = (v, max) => (typeof v === 'string' ? v.slice(0, max).trim() : '');

/**
 * @param files  the drop's file names
 * @param reported  result.json `placements`
 * @param added  text of the lines the branch added (photos.ts, videos.ts, data json)
 * @param uploaded  video file names the runner uploaded for this drop
 */
export function checkPlacements(files, reported, added, uploaded = []) {
  const byFile = new Map();
  for (const p of Array.isArray(reported) ? reported : []) {
    const file = str(p?.file, 400);
    if (!files.includes(file) || byFile.has(file)) continue;
    const kind = ['photo', 'video', 'unused'].includes(p.kind) ? p.kind : null;
    if (!kind) continue;
    if (kind === 'unused') {
      byFile.set(file, { file, kind, reason: str(p.reason, 200) || undefined });
      continue;
    }
    const siteId = str(p.siteId, 120);
    const proven =
      (siteId && added.includes(siteId)) ||
      (kind === 'video' && uploaded.some((v) => added.includes(v) && str(p.siteUrl, 300).includes(v)));
    byFile.set(
      file,
      proven
        ? { file, kind, siteId: siteId || undefined, siteUrl: PAGE[kind] }
        : { file, kind: 'unused', reason: 'Not found in the published changes' }
    );
  }
  return files.map((file) => byFile.get(file) ?? { file, kind: 'unused', reason: 'Not reported' });
}
