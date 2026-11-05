import test from 'node:test';
import assert from 'node:assert/strict';
import { preparePreview } from './preview-state.mjs';

const branch = 'art/20261105-abcdef';
const sha = 'a'.repeat(40);
const deployment = (state, commit = sha, url = 'preview.vercel.app') => ({
  state,
  url,
  meta: { githubCommitRef: branch, githubCommitSha: commit },
});
const options = (pages) => {
  let calls = 0;
  return {
    branch,
    sha,
    token: 'test-token',
    attempts: pages.length,
    sleep: async () => {},
    fetchImpl: async (url) => {
      const query = new URL(url).searchParams;
      assert.equal(query.get('meta-githubCommitRef'), branch);
      assert.equal(query.get('meta-githubCommitSha'), sha);
      const page = pages[calls++];
      return { ok: true, json: async () => ({ deployments: page }) };
    },
  };
};

test('old READY and failed commits cannot select or reject the current preview', async () => {
  const request = { status: 'working', previewUrl: 'https://stale.vercel.app' };
  const error = await preparePreview(
    request,
    options([
      [deployment('READY', 'old'), deployment('ERROR', 'older')],
      [deployment('BUILDING')],
      [deployment('READY')],
    ])
  );
  assert.equal(error, null);
  assert.equal(request.status, 'preview');
  assert.equal(request.previewSha, sha);
  assert.equal(request.previewUrl, 'https://preview.vercel.app');
});

test('exhausted lookup fails with retry guidance and clears stale preview URL', async () => {
  const request = { status: 'working', previewUrl: 'https://stale.vercel.app' };
  assert.match(await preparePreview(request, options([[], []])), /No deployment/);
  assert.equal(request.status, 'failed');
  assert.equal(request.previewUrl, undefined);
  assert.match(request.error, /Retry this drop/);
});

test('READY without a URL cannot expose a ready preview', async () => {
  const request = { status: 'working' };
  assert.match(
    await preparePreview(request, options([[{ ...deployment('READY'), url: undefined }]])),
    /without a URL/
  );
  assert.equal(request.status, 'failed');
  assert.equal(request.previewUrl, undefined);
});

test('only ERROR or CANCELED on the pushed commit fails immediately', async () => {
  for (const state of ['ERROR', 'CANCELED']) {
    const request = { status: 'working' };
    assert.match(await preparePreview(request, options([[deployment(state)]])), new RegExp(state));
    assert.equal(request.status, 'failed');
    assert.equal(request.previewUrl, undefined);
  }
});

test('missing token and failed HTTP lookup fail safely; transient errors retry', async () => {
  const missing = { status: 'working' };
  assert.match(
    await preparePreview(missing, { ...options([[]]), token: undefined }),
    /VERCEL_TOKEN/
  );
  assert.equal(missing.status, 'failed');
  const http = { status: 'working' };
  assert.match(
    await preparePreview(http, {
      ...options([[]]),
      fetchImpl: async () => ({ ok: false, status: 403 }),
    }),
    /HTTP 403/
  );
  assert.equal(http.status, 'failed');
  const recovered = { status: 'working' };
  const config = options([[], [deployment('READY')]]);
  const fetchPage = config.fetchImpl;
  let count = 0;
  config.fetchImpl = async (...args) => {
    if (!count++) {
      await fetchPage(...args);
      throw new Error('temporary network failure');
    }
    return fetchPage(...args);
  };
  assert.equal(await preparePreview(recovered, config), null);
  assert.equal(recovered.status, 'preview');
});
