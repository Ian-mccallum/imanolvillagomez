import test, { after } from 'node:test';
import assert from 'node:assert/strict';
import { S3Client } from '@aws-sdk/client-s3';
import { createServer } from 'vite';
import ts from 'typescript';
import { readFileSync, mkdtempSync, mkdirSync, writeFileSync, symlinkSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join, dirname } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import {
  appendEvent,
  fileProblem,
  MAX_FILE_BYTES,
  queueAgain,
  timelineFor,
  workerOnline,
} from '../../src/components/art/studioModel.ts';
import { aggregate, change, sourceName, sources } from '../../src/components/art/insights/model.ts';
import { formatRoute, parseRoute } from '../../src/components/art/route.ts';

test('drop history skips exact repeats and caps its length', () => {
  const r = {};
  appendEvent(r, { type: 'working', by: 'studio', at: '2026-11-05T10:00:00Z' });
  appendEvent(r, { type: 'working', by: 'studio', at: '2026-11-05T10:02:00Z' });
  appendEvent(r, { type: 'preview', by: 'studio', previewUrl: 'https://a' });
  appendEvent(r, { type: 'preview', by: 'studio', previewUrl: 'https://b' });
  assert.deepEqual(r.history.map((e) => e.type), ['working', 'preview', 'preview']);
  for (let i = 0; i < 250; i++) appendEvent(r, { type: 'answer', by: 'imanol', text: String(i) });
  assert.equal(r.history.length, 200);
  assert.equal(r.history.at(-1).text, '249');
});

test('older drops without history get a timeline rebuilt from their fields', () => {
  const events = timelineFor({
    createdAt: '2026-11-01T10:00:00Z',
    updatedAt: '2026-11-01T12:00:00Z',
    status: 'preview',
    previewUrl: 'https://p',
    revisions: [{ at: '2026-11-01T11:00:00Z', text: 'swap 1 and 2' }],
    files: [],
  });
  assert.deepEqual(events.map((e) => e.type), ['sent', 'revision', 'preview']);
  assert.equal(events[2].previewUrl, 'https://p');
  const own = [{ at: 'x', type: 'live', by: 'studio' }];
  assert.equal(timelineFor({ history: own }), own);
});

test('studio routes round-trip through the URL hash', () => {
  for (const r of [{ view: 'upload' }, { view: 'drops' }, { view: 'drops', drop: '20261105-abcdef' }, { view: 'insights', arg: '7d' }, { view: 'library', arg: 'videos/A B.mp4' }])
    assert.deepEqual(parseRoute(formatRoute(r)), r);
  assert.deepEqual(parseRoute('#nonsense'), { view: 'upload' });
});

test('insights add up a range, compare with the period before, and fill empty days', () => {
  const t = (visitors, views, extra = {}) => ({ visitors, views, pages: [{ key: '/', visitors, views }], referrers: [], countries: [], devices: [], ...extra });
  const summary = {
    updatedAt: '',
    sources: {},
    days: [
      { date: '2026-10-20', traffic: t(1, 1) },
      { date: '2026-10-25', traffic: t(4, 8) },
      { date: '2026-11-01', traffic: t(5, 10) },
      { date: '2026-11-03', traffic: t(3, 6, { referrers: [{ key: 'l.instagram.com', visitors: 2, views: 2 }, { key: 'instagram.com', visitors: 1, views: 1 }] }) },
    ],
  };
  const a = aggregate(summary, '7d', '2026-11-03');
  assert.equal(a.visitors, 8);
  assert.equal(a.views, 16);
  assert.equal(a.previousVisitors, 4);
  assert.equal(a.series.length, 7);
  assert.equal(a.series.at(-1).visitors, 3);
  assert.equal(a.series.at(-2).visitors, 0);
  assert.equal(a.pages[0].views, 16);
  assert.equal(change(8, 4), 100);
  assert.equal(change(8, null), null);
  assert.equal(sourceName(''), 'Direct or unknown');
  assert.deepEqual(sources(a.referrers).map((r) => [r.key, r.visitors]), [['Instagram', 3]]);
  assert.equal(aggregate(summary, '30d', '2026-11-03').collectingSince, '2026-10-20');
  assert.equal(aggregate(summary, '30d', '2026-11-03').previousVisitors, null);
});

test('upload limits reject an entire oversized selection instead of silently dropping files', () => {
  const file = { name: 'photo.jpg', size: 100 };
  assert.equal(fileProblem(Array(200).fill(file)), '');
  assert.match(fileProblem(Array(201).fill(file)), /200 files/);
  assert.match(fileProblem([file], 200), /200 files/);
  assert.equal(fileProblem([{ name: 'video.mp4', size: MAX_FILE_BYTES }]), '');
  assert.match(fileProblem([{ name: 'video.mp4', size: MAX_FILE_BYTES + 1 }]), /over 5 GB/);
  assert.match(fileProblem([{ name: 'empty.jpg', size: 0 }]), /empty or unreadable/);
});

test('worker availability distinguishes long active jobs from a stale idle heartbeat', () => {
  const now = Date.now();
  const ago = (ms) => new Date(now - ms).toISOString();
  assert.equal(workerOnline(null, now), false);
  assert.equal(workerOnline({ state: 'idle', updatedAt: ago(120_000) }, now), true);
  assert.equal(workerOnline({ state: 'idle', updatedAt: ago(7 * 60_000) }, now), false);
  assert.equal(workerOnline({ state: 'working', updatedAt: ago(2 * 3600_000) }, now), true);
  assert.equal(workerOnline({ state: 'working', updatedAt: ago(5 * 3600_000) }, now), false);
  assert.equal(workerOnline({ state: 'error', updatedAt: ago(0) }, now), false);
  assert.equal(workerOnline({ state: 'idle', updatedAt: 'invalid' }, now), false);
});

test('preview revisions preserve original instructions and cannot publish or retry live work', () => {
  const original = {
    status: 'preview',
    note: 'Keep the original title',
    previewSha: 'reviewed-commit',
  };
  const revised = queueAgain(original, 'revise', '  Put photo 2 first  ', '2026-11-04T18:00:00Z');
  assert.equal(original.status, 'preview');
  assert.equal(revised.status, 'pending');
  assert.equal(revised.note, original.note);
  assert.equal(revised.revisions[0].text, 'Put photo 2 first');
  assert.throws(() => queueAgain(original, 'revise', '  '), /Describe/);
  assert.throws(() => queueAgain({ status: 'live' }, 'revise', 'Change it'), /no longer/);
  assert.throws(() => queueAgain({ status: 'live' }, 'retry', ''), /Only a failed/);
});

// Run the real API handler with an in-memory S3 transport and fake credentials.
// No client objects or live service credentials are used by these checks.
const server = await createServer({
  server: { middlewareMode: true, hmr: false, ws: false },
  appType: 'custom',
});
const envKeys = [
  'ART_KEY',
  'R2_ACCOUNT_ID',
  'R2_ACCESS_KEY_ID',
  'R2_SECRET_ACCESS_KEY',
  'R2_BUCKET_NAME',
];
const priorEnv = Object.fromEntries(envKeys.map((key) => [key, process.env[key]]));
Object.assign(process.env, {
  ART_KEY: 'fixture-password',
  R2_ACCOUNT_ID: 'fixture',
  R2_ACCESS_KEY_ID: 'fixture',
  R2_SECRET_ACCESS_KEY: 'fixture',
  R2_BUCKET_NAME: 'fixture',
});
const objects = new Map();
const oldSend = S3Client.prototype.send;
S3Client.prototype.send = async function (command) {
  const { Key, Body } = command.input;
  switch (command.constructor.name) {
    case 'GetObjectCommand': {
      if (!objects.has(Key)) throw new Error('NoSuchKey');
      return { Body: { transformToString: async () => objects.get(Key) } };
    }
    case 'PutObjectCommand':
      objects.set(Key, Body);
      return {};
    case 'HeadObjectCommand':
      if (!objects.has(Key)) throw new Error('NotFound');
      return {};
    case 'DeleteObjectCommand':
      objects.delete(Key);
      return {};
    case 'CopyObjectCommand': {
      const from = decodeURI(command.input.CopySource).split('/').slice(1).join('/');
      if (!objects.has(from)) throw new Error('NoSuchKey');
      objects.set(Key, objects.get(from));
      return {};
    }
    case 'ListObjectsV2Command':
      if (command.input.Delimiter)
        return {
          CommonPrefixes: [...objects.keys()]
            .filter((key) => key.endsWith('/request.json'))
            .map((key) => ({ Prefix: key.slice(0, -'request.json'.length) })),
        };
      return {
        Contents: [...objects.keys()]
          .filter((k) => k.startsWith(command.input.Prefix))
          .map((Key) => ({ Key, Size: String(objects.get(Key)).length, LastModified: new Date() })),
      };
    default:
      throw new Error(`Unexpected command ${command.constructor.name}`);
  }
};
const { default: handler } = await server.ssrLoadModule('/api/art.ts');
async function call(action, body, token = '') {
  let status = 200;
  let data;
  const res = {
    setHeader() {},
    status(value) {
      status = value;
      return this;
    },
    json(value) {
      data = value;
      return this;
    },
  };
  await handler(
    {
      query: { action },
      method: body === undefined ? 'GET' : 'POST',
      body,
      headers: { authorization: `Bearer ${token}` },
    },
    res
  );
  return { status, data };
}
const { data: auth } = await call('unlock', { key: 'fixture-password' });
assert.ok(auth.token);
const id = '20261104-abcdef';
const key = `inbox/${id}/request.json`;
function seed(status) {
  objects.set(
    key,
    JSON.stringify({
      id,
      status,
      createdAt: '2026-11-04T18:00:00Z',
      updatedAt: '2026-11-04T18:00:00Z',
      title: 'Fixture',
      note: 'Keep title',
      files: [
        { name: 'test.jpg', key: `inbox/${id}/files/test.jpg`, size: 100, type: 'image/jpeg' },
      ],
    })
  );
}

test('API requires authentication for revisions, retries and worker health', async () => {
  seed('preview');
  for (const action of ['revise', 'retry'])
    assert.equal((await call(action, { id, text: 'Change order' })).status, 401);
  assert.equal((await call('list')).status, 401);
  assert.equal(JSON.parse(objects.get(key)).status, 'preview');
});

test('API revision and retry use state guards and retain the approved-preview gate', async () => {
  seed('preview');
  assert.equal((await call('revise', { id, text: '' }, auth.token)).status, 409);
  const result = await call('revise', { id, text: 'Put photo 2 first' }, auth.token);
  assert.equal(result.status, 200);
  assert.equal(result.data.request.status, 'pending');
  assert.equal(result.data.request.revisions[0].text, 'Put photo 2 first');
  assert.equal((await call('approve', { id }, auth.token)).status, 409);
  seed('live');
  assert.equal((await call('retry', { id }, auth.token)).status, 409);
  seed('failed');
  assert.equal((await call('retry', { id }, auth.token)).data.request.status, 'pending');
});

test('API rejects 201-file starts and empty replies without modifying a drop', async () => {
  const result = await call(
    'start',
    { files: Array(201).fill({ name: 'x.jpg', size: 10, type: 'image/jpeg' }) },
    auth.token
  );
  assert.equal(result.status, 400);
  assert.match(result.data.error, /200 files/);
  seed('question');
  assert.equal((await call('reply', { id, text: '  ' }, auth.token)).status, 400);
  assert.equal(JSON.parse(objects.get(key)).status, 'question');
});

test('API supplies actual worker heartbeat alongside the queue', async () => {
  objects.set(
    'queue/nol-heartbeat.json',
    JSON.stringify({ state: 'idle', updatedAt: '2026-11-04T18:00:00Z' })
  );
  const result = await call('list', undefined, auth.token);
  assert.equal(result.status, 200);
  assert.equal(result.data.worker.state, 'idle');
  assert.equal(result.data.requests.length, 1);
});

test('drops page, open in full, and only sign links to their own files', async () => {
  for (let i = 0; i < 45; i++) {
    const did = `20261001-${String(i).padStart(6, '0')}`;
    objects.set(
      `inbox/${did}/request.json`,
      JSON.stringify({ id: did, status: 'live', createdAt: `2026-10-01T${String(i % 24).padStart(2, '0')}:${String(i).padStart(2, '0')}:00Z`, updatedAt: '', files: [] })
    );
  }
  seed('live');
  const first = await call('list', undefined, auth.token);
  assert.equal(first.data.requests.length, 40);
  assert.ok(first.data.next);
  const secondRes = await (async () => {
    let status = 200;
    let data;
    await handler(
      { query: { action: 'list', before: first.data.next }, method: 'GET', body: undefined, headers: { authorization: `Bearer ${auth.token}` } },
      { setHeader() {}, status(v) { status = v; return this; }, json(v) { data = v; return this; } }
    );
    return { status, data };
  })();
  assert.equal(secondRes.data.requests.length, 6);
  assert.equal(secondRes.data.next, undefined);
  for (const k of [...objects.keys()]) if (k.startsWith('inbox/20261001-')) objects.delete(k);

  const got = await call('get', { id }, auth.token);
  assert.equal(got.data.request.id, id);
  assert.equal((await call('get', { id: '../auth' }, auth.token)).status, 404);
  const own = await call('urls', { id, names: ['test.jpg', '../../auth/passkeys.json'], kind: 'original', download: true }, auth.token);
  assert.deepEqual(Object.keys(own.data.urls), ['test.jpg']);
  assert.match(own.data.urls['test.jpg'], /inbox%2F20261104-abcdef%2Ffiles%2Ftest\.jpg|inbox\/20261104-abcdef\/files\/test\.jpg/);
  assert.match(own.data.urls['test.jpg'], /attachment/);
  const none = await call('urls', { id, names: ['test.jpg'], kind: 'thumb' }, auth.token);
  assert.deepEqual(none.data.urls, {});
});

test('a new drop records its thumbnails (only its own) and a sent event; actions add history', async () => {
  const started = await call('start', { files: [{ name: 'a.jpg', size: 10, type: 'image/jpeg' }] }, auth.token);
  assert.equal(started.status, 200);
  const up = started.data.uploads[0];
  assert.match(up.thumbKey, /^inbox\/\d{8}-[0-9a-f]{6}\/thumbs\/0\.webp$/);
  assert.ok(up.thumbUrl);
  const sent = await call(
    'submit',
    {
      id: started.data.id,
      title: 'T',
      files: [{ name: up.name, key: up.key, size: 10, type: 'image/jpeg' }],
      thumbs: { [up.name]: up.thumbKey, 'other.jpg': up.thumbKey },
    },
    auth.token
  );
  assert.deepEqual(sent.data.request.thumbs, { [up.name]: up.thumbKey });
  assert.equal(sent.data.request.history[0].type, 'sent');
  const forged = await call('submit', { id: '20261104-ffffff', files: [], thumbs: { x: 'inbox/20261104-abcdef/thumbs/0.webp' } }, auth.token);
  assert.equal(forged.data.request.thumbs, undefined);
  seed('preview');
  await call('revise', { id, text: 'swap' }, auth.token);
  const h = JSON.parse(objects.get(key)).history;
  assert.equal(h.at(-1).type, 'revision');
  assert.equal(h.at(-1).text, 'swap');
});

test('a drop can be deleted unless the studio is working on or publishing it', async () => {
  for (const status of ['pending', 'question', 'preview', 'failed', 'live']) {
    seed(status);
    assert.equal((await call('remove', { id }, auth.token)).data.request.status, 'removed', status);
  }
  for (const status of ['working', 'approved']) {
    seed(status);
    assert.equal((await call('remove', { id }, auth.token)).status, 409, status);
  }
});

test('insights need a session or the cron secret, and stay "not connected" without a token', async () => {
  assert.equal((await call('insights')).status, 401);
  const res = await call('insights', undefined, auth.token);
  assert.equal(res.status, 200);
  assert.equal(res.data.connected.vercel, false);
  let status = 200;
  const res2 = { setHeader() {}, status(v) { status = v; return this; }, json() { return this; } };
  await handler({ query: { action: 'insights-collect' }, method: 'GET', headers: { authorization: 'Bearer wrong' } }, res2);
  assert.equal(status, 401);
  process.env.CRON_SECRET = 'cron-fixture';
  status = 200;
  await handler({ query: { action: 'insights-collect' }, method: 'GET', headers: { authorization: 'Bearer cron-fixture' } }, res2);
  assert.equal(status, 200);
  delete process.env.CRON_SECRET;
  const summary = JSON.parse(objects.get('analytics/summary.json'));
  assert.equal(summary.sources.vercel.connected, false);
  const again = await call('insights-collect', {}, auth.token);
  assert.equal(again.status, 200);
  assert.equal((await call('insights-collect', {}, auth.token)).status, 409);
});

test('Search Console: a verifiable RS256 assertion, weighted search totals, plain-language index health', async () => {
  const { generateKeyPairSync, createVerify } = await import('node:crypto');
  const { privateKey, publicKey } = generateKeyPairSync('rsa', { modulusLength: 2048 });
  const { assertion } = await server.ssrLoadModule('/api/_lib/gsc.ts');
  const jwt = assertion({ client_email: 'sa@x.iam.gserviceaccount.com', private_key: privateKey.export({ type: 'pkcs8', format: 'pem' }) }, 1_800_000_000);
  const [h, c, sig] = jwt.split('.');
  assert.ok(createVerify('RSA-SHA256').update(`${h}.${c}`).verify(publicKey, Buffer.from(sig, 'base64url')));
  const claims = JSON.parse(Buffer.from(c, 'base64url'));
  assert.equal(claims.scope, 'https://www.googleapis.com/auth/webmasters.readonly');
  assert.equal(claims.exp - claims.iat, 3600);
  const { aggregateSearch, indexHealth } = await server.ssrLoadModule('/src/components/art/insights/model.ts');
  const day = (date, clicks, impressions, position) => ({ date, search: { clicks, impressions, position, queries: [{ key: 'imanol villagomez', clicks, impressions, position }], pages: [] } });
  const s = aggregateSearch({ days: [day('2026-11-01', 2, 10, 2), day('2026-11-02', 0, 30, 10)] }, '7d', '2026-11-03');
  assert.equal(s.clicks, 2);
  assert.equal(s.impressions, 40);
  assert.equal(s.position, 8);
  assert.equal(s.queries[0].position, 8);
  assert.equal(aggregateSearch({ days: [] }, '7d', '2026-11-03'), null);
  const health = indexHealth({ pages: { a: { verdict: 'PASS', coverage: 'Submitted and indexed' }, b: { verdict: 'NEUTRAL', coverage: 'Crawled - currently not indexed' } } });
  assert.deepEqual([health.checked, health.indexed], [2, 1]);
  assert.match(health.issues[0].why, /chose not to list/);
});

test('the library allowlist only admits site videos, trash and drop originals', async () => {
  const { isReadableKey, isVideoKey, isTrashKey } = await server.ssrLoadModule('/api/_lib/keys.ts');
  for (const ok of ['videos/PROBLEMA.mp4', 'videos/a_b-c.1.mp4', 'trash/20261105/videos/x.mp4', 'inbox/20261105-abcdef/files/A B/photo 1.jpg', 'inbox/20261105-abcdef/files/x.jpg'])
    assert.ok(isReadableKey(ok), ok);
  const bad = ['auth/passkeys.json', 'queue/nol-heartbeat.json', 'analytics/summary.json', 'audit/2026-11/x.json', 'inbox/20261105-abcdef/request.json', 'videos/../auth/passkeys.json', 'videos/.hidden.mp4', 'videos/a/b.mp4', '/videos/x.mp4', 'videos/x.mp4/', 'videos/x.MP4.txt', 'videos/%2e%2e/x.mp4', 'videos\\x.mp4', 'trash/2026/videos/x.mp4', 'inbox/20261105-abcdef/files/../../auth/passkeys.json', 'inbox/x/files/a.jpg', ''];
  for (let i = 0; i < 200; i++) bad.push(`${['auth', 'queue', 'analytics', 'audit', 'inbox/x', 'videos/..', '..'][i % 7]}/${'.'.repeat(i % 3)}${i}\x00.mp4`);
  for (const b of bad) assert.ok(!isReadableKey(b) && !isVideoKey(b) && !isTrashKey(b), b);
});

test('library changes only touch unused videos, keep an audit trail, and fail closed without the manifest', async () => {
  const realFetch = globalThis.fetch;
  let manifestUp = true;
  globalThis.fetch = async (url, init) =>
    String(url).endsWith('/site-manifest.json')
      ? manifestUp
        ? new Response(JSON.stringify({ videos: [{ id: 'v', title: 'Live one', file: 'LIVE.mp4', order: 0, page: '/work/videos' }], alsoUsedVideoFiles: ['HOME.mp4'], photos: [] }))
        : new Response('down', { status: 500 })
      : realFetch(url, init);
  try {
    for (const f of ['LIVE.mp4', 'HOME.mp4', 'OLD.mp4', 'TAKEN.mp4']) objects.set(`videos/${f}`, 'x');
    const files = (await call('library', { tab: 'files' }, auth.token)).data.files;
    assert.deepEqual(Object.fromEntries(files.map((f) => [f.name, f.usedBy])), { 'LIVE.mp4': 'Live one', 'HOME.mp4': 'Your home page', 'OLD.mp4': null, 'TAKEN.mp4': null });
    assert.equal((await call('library-trash', { paths: ['videos/LIVE.mp4'] }, auth.token)).status, 409);
    assert.equal((await call('library-rename', { path: 'videos/HOME.mp4', to: 'X.mp4' }, auth.token)).status, 409);
    assert.equal((await call('library-rename', { path: 'videos/OLD.mp4', to: 'TAKEN.mp4' }, auth.token)).status, 409);
    assert.equal((await call('library-rename', { path: 'videos/OLD.mp4', to: '../x.mp4' }, auth.token)).status, 400);
    assert.equal((await call('library-url', { path: 'auth/passkeys.json' }, auth.token)).status, 404);
    const renamed = await call('library-rename', { path: 'videos/OLD.mp4', to: 'NEW.mp4' }, auth.token);
    assert.equal(renamed.data.path, 'videos/NEW.mp4');
    const trashed = await call('library-trash', { paths: ['videos/NEW.mp4'] }, auth.token);
    const inTrash = trashed.data.moved[0].to;
    assert.match(inTrash, /^trash\/\d{8}\/videos\/NEW\.mp4$/);
    assert.equal(objects.has('videos/NEW.mp4'), false);
    const trashList = (await call('library', { tab: 'trash' }, auth.token)).data.files;
    assert.equal(trashList[0].daysLeft, 30);
    assert.equal((await call('library-restore', { path: inTrash }, auth.token)).data.path, 'videos/NEW.mp4');
    assert.equal((await call('library-upload', { name: 'LIVE.mp4', size: 10 }, auth.token)).status, 409);
    assert.ok((await call('library-upload', { name: 'FRESH.mp4', size: 10 }, auth.token)).data.url);
    const log = (await call('library', { tab: 'activity' }, auth.token)).data.activity.map((a) => a.action);
    assert.deepEqual(log.sort(), ['rename', 'restore', 'trash', 'upload']);
    manifestUp = false;
    assert.equal((await call('library-trash', { paths: ['videos/TAKEN.mp4'] }, auth.token)).status, 503);
    assert.ok(objects.has('videos/TAKEN.mp4'));
  } finally {
    globalThis.fetch = realFetch;
  }
});

test('edit requests are checked against the site and verified by reading the result', async () => {
  const { validateOps, describeOps, verifyOps } = await server.ssrLoadModule('/api/_lib/edit.ts');
  const m = { videos: [{ id: 'v1', title: 'Problema', file: 'PROBLEMA.mp4' }, { id: 'v2', title: 'Viking', file: 'VIKING.mp4' }], photos: [{ id: 'photo-1', client: 'NATION' }], alsoUsedVideoFiles: [] };
  assert.match(validateOps([], m), /at least one/);
  assert.match(validateOps([{ op: 'remove', target: { kind: 'photo', id: 'nope' } }], m), /no longer on your site/);
  assert.match(validateOps([{ op: 'remove', target: { kind: 'video', id: 'v1' } }, { op: 'move', target: { kind: 'video', id: 'v1' }, to: { position: 'top' } }], m), /conflict/);
  assert.match(validateOps([{ op: 'update', target: { kind: 'photo', id: 'photo-1' }, set: { title: 'x' } }], m), /Photos can change/);
  assert.match(validateOps([{ op: 'replace', target: { kind: 'video', id: 'v1' }, file: 'new.mp4' }], m, []), /replacement file first/);
  assert.match(validateOps([{ op: 'update', target: { kind: 'video', id: 'v1' }, set: { year: 1900 } }], m), /2000 and 2100/);
  const ops = validateOps(
    [
      { op: 'update', target: { kind: 'video', id: 'v1' }, set: { title: '  New title  ', evil: 'x' } },
      { op: 'move', target: { kind: 'video', id: 'v1' }, to: { before: 'v2' } },
      { op: 'remove', target: { kind: 'photo', id: 'photo-1' } },
    ],
    m
  );
  assert.deepEqual(ops[0].set, { title: 'New title' });
  assert.deepEqual(describeOps(ops, m), ['Change video “Problema”: title → New title', 'Move video “Problema” before v2', 'Remove photo “NATION” from the site']);
  assert.deepEqual(verifyOps(ops, `{"id": "photo-2"}`, `+ title: 'New title',`), []);
  assert.deepEqual(verifyOps(ops, `{"id": "photo-1"}`, ''), ['v1: New title not applied', 'photo-1 is still on the site']);
});

test('edit drops and resends go into the normal queue; resend copies files inside storage', async () => {
  const realFetch = globalThis.fetch;
  globalThis.fetch = async (url, init) =>
    String(url).endsWith('/site-manifest.json')
      ? new Response(JSON.stringify({ videos: [{ id: 'v1', title: 'Problema', file: 'PROBLEMA.mp4' }], photos: [], alsoUsedVideoFiles: [] }))
      : realFetch(url, init);
  try {
    const edit = await call('edit-submit', { ops: [{ op: 'update', target: { kind: 'video', id: 'v1' }, set: { title: 'Problema (live)' } }] }, auth.token);
    assert.equal(edit.status, 200);
    assert.equal(edit.data.request.kind, 'edit');
    assert.equal(edit.data.request.status, 'pending');
    assert.match(edit.data.request.title, /Problema/);
    assert.equal((await call('edit-submit', { ops: [{ op: 'remove', target: { kind: 'video', id: 'gone' } }] }, auth.token)).status, 400);
    const forged = await call('edit-submit', { id: '20261104-abcdef', ops: [{ op: 'replace', target: { kind: 'video', id: 'v1' }, file: 'x.mp4' }], files: [{ name: 'x.mp4', key: 'inbox/20261104-abcdef/files/x.mp4' }] }, auth.token);
    assert.equal(forged.status, 200);
    assert.equal(forged.data.request.ops[0].previousFile, 'PROBLEMA.mp4');
  } finally {
    globalThis.fetch = realFetch;
  }
  seed('live');
  objects.set(`inbox/${id}/files/test.jpg`, 'jpg-bytes');
  const again = await call('resend', { id, names: ['test.jpg', 'missing.jpg'], note: 'second round' }, auth.token);
  assert.equal(again.status, 200);
  const r = again.data.request;
  assert.notEqual(r.id, id);
  assert.equal(r.files.length, 1);
  assert.equal(objects.get(r.files[0].key), 'jpg-bytes');
  assert.equal(r.note, 'second round');
  assert.equal((await call('resend', { id, names: [] }, auth.token)).status, 400);
});

test('Cloudflare video loads group by file and ignore non-video paths; ranges add up', async () => {
  const realFetch = globalThis.fetch;
  globalThis.fetch = async () =>
    new Response(JSON.stringify({ data: { viewer: { zones: [{ httpRequestsAdaptiveGroups: [
      { count: 5, sum: { edgeResponseBytes: 500 }, dimensions: { clientRequestPath: '/videos/PROBLEMA.mp4' } },
      { count: 2, sum: { edgeResponseBytes: 50 }, dimensions: { clientRequestPath: '/videos/PROBLEMA.mp4' } },
      { count: 9, sum: { edgeResponseBytes: 9 }, dimensions: { clientRequestPath: '/favicon.ico' } },
      { count: 1, sum: { edgeResponseBytes: 10 }, dimensions: { clientRequestPath: '/videos/VIKING.mp4' } },
    ] }] } } }));
  try {
    const { videoLoads } = await server.ssrLoadModule('/api/_lib/cloudflare.ts');
    assert.deepEqual(await videoLoads('2026-11-05'), [{ file: 'PROBLEMA.mp4', loads: 7, bytes: 550 }, { file: 'VIKING.mp4', loads: 1, bytes: 10 }]);
    globalThis.fetch = async () => new Response(JSON.stringify({ errors: [{ message: 'unknown field clientRequestPath' }] }));
    await assert.rejects(videoLoads('2026-11-05'), /unknown field/);
  } finally {
    globalThis.fetch = realFetch;
  }
  const { aggregateVideos } = await server.ssrLoadModule('/src/components/art/insights/model.ts');
  const v = aggregateVideos({ days: [{ date: '2026-11-02', videos: [{ file: 'A.mp4', loads: 3 }] }, { date: '2026-11-03', videos: [{ file: 'A.mp4', loads: 2 }, { file: 'B.mp4', loads: 9 }] }] }, '7d', '2026-11-03');
  assert.deepEqual(v, [{ file: 'B.mp4', loads: 9 }, { file: 'A.mp4', loads: 5 }]);
  assert.equal(aggregateVideos({ days: [] }, '7d', '2026-11-03'), null);
});

test('deployed API imports resolve under native Node ESM without Vite', async () => {
  const root = mkdtempSync(join(tmpdir(), 'nol-esm-'));
  const repo = fileURLToPath(new URL('../../', import.meta.url));
  try {
    writeFileSync(join(root, 'package.json'), '{"type":"module"}');
    symlinkSync(join(repo, 'node_modules'), join(root, 'node_modules'));
    for (const file of ['api/art.ts', 'api/_lib/storage.ts', 'api/_lib/insights.ts', 'api/_lib/keys.ts', 'api/_lib/library.ts', 'api/_lib/gsc.ts', 'api/_lib/edit.ts', 'api/_lib/cloudflare.ts', 'src/components/art/studioModel.ts']) {
      const destination = join(root, file.replace(/\.ts$/, '.js'));
      mkdirSync(dirname(destination), { recursive: true });
      writeFileSync(destination, ts.transpileModule(readFileSync(join(repo, file), 'utf8'), {
        compilerOptions: { module: ts.ModuleKind.ESNext, target: ts.ScriptTarget.ES2022 },
      }).outputText);
    }
    const api = await import(pathToFileURL(join(root, 'api/art.js')));
    assert.equal(typeof api.default, 'function');
  } finally {
    rmSync(root, { recursive: true, force: true });
  }
});

after(async () => {
  S3Client.prototype.send = oldSend;
  for (const key of envKeys)
    priorEnv[key] === undefined ? delete process.env[key] : (process.env[key] = priorEnv[key]);
  await server.close();
});
