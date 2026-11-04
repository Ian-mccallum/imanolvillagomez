import test, { after } from 'node:test';
import assert from 'node:assert/strict';
import { S3Client } from '@aws-sdk/client-s3';
import { createServer } from 'vite';
import {
  fileProblem,
  MAX_FILE_BYTES,
  queueAgain,
  workerOnline,
} from '../../src/components/art/studioModel.ts';

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
      return {
        CommonPrefixes: [...objects.keys()]
          .filter((key) => key.endsWith('/request.json'))
          .map((key) => ({ Prefix: key.slice(0, -'request.json'.length) })),
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

after(async () => {
  S3Client.prototype.send = oldSend;
  for (const key of envKeys)
    priorEnv[key] === undefined ? delete process.env[key] : (process.env[key] = priorEnv[key]);
  await server.close();
});
