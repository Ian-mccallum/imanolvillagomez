import assert from 'node:assert/strict';
import { checkPlacements } from './placements.mjs';

const files = ['A/1.jpg', 'A/2.jpg', 'B/clip.mov', 'B/3.jpg'];
const added = `{ "id": "photo-2026-140", "imageUrl": "/images/shoot-a-01.jpg" }\n  videoUrl: getVideoUrl('CLIP.mp4'),\n  id: 'artist-clip',`;
const out = checkPlacements(
  files,
  [
    { file: 'A/1.jpg', kind: 'photo', siteId: 'photo-2026-140' },
    { file: 'A/2.jpg', kind: 'photo', siteId: 'photo-2026-999' }, // not in the diff
    { file: 'B/clip.mov', kind: 'video', siteId: 'artist-clip', siteUrl: 'https://videos.example/videos/CLIP.mp4' },
    { file: 'B/3.jpg', kind: 'unused', reason: 'Blurry duplicate'.repeat(30) },
    { file: '../../etc/passwd', kind: 'photo', siteId: 'photo-2026-140' },
    { file: 'A/1.jpg', kind: 'unused' }, // duplicate report ignored
  ],
  added,
  ['CLIP.mp4']
);
assert.deepEqual(out.map((p) => [p.file, p.kind]), [
  ['A/1.jpg', 'photo'],
  ['A/2.jpg', 'unused'],
  ['B/clip.mov', 'video'],
  ['B/3.jpg', 'unused'],
]);
assert.equal(out[0].siteUrl, 'https://www.imanolvillagomez.com/work/photos');
assert.equal(out[1].reason, 'Not found in the published changes');
assert.equal(out[3].reason.length, 200);
assert.deepEqual(checkPlacements(['x.jpg'], 'garbage', '', []), [{ file: 'x.jpg', kind: 'unused', reason: 'Not reported' }]);
console.log('PASS placements: only diff-backed claims survive, every file accounted for');
