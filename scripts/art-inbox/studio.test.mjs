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
          .map((Key) => ({ Key })),
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

test('deployed API imports resolve under native Node ESM without Vite', async () => {
  const root = mkdtempSync(join(tmpdir(), 'nol-esm-'));
  const repo = fileURLToPath(new URL('../../', import.meta.url));
  try {
    writeFileSync(join(root, 'package.json'), '{"type":"module"}');
    symlinkSync(join(repo, 'node_modules'), join(root, 'node_modules'));
    for (const file of ['api/art.ts', 'api/_lib/storage.ts', 'api/_lib/insights.ts', 'src/components/art/studioModel.ts']) {
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
