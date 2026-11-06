import { mkdtempSync, mkdirSync, writeFileSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { execFileSync } from 'node:child_process';
import assert from 'node:assert/strict';
import { contentMovedSince, isDropPath } from './drop-paths.mjs';

assert.ok(isDropPath('src/constants/photos.ts'));
assert.ok(isDropPath('public/images/sized/a-960.webp'));
assert.ok(!isDropPath('src/App.tsx'));
assert.ok(!isDropPath('scripts/art-inbox/run.mjs'));

const repo = mkdtempSync(join(tmpdir(), 'nol-paths-'));
const git = (...args) =>
  execFileSync('git', ['-c', 'user.name=t', '-c', 'user.email=t@t', '-c', 'core.hooksPath=/dev/null', ...args], {
    cwd: repo,
    encoding: 'utf8',
  }).trim();
const write = (path, text) => {
  mkdirSync(join(repo, path, '..'), { recursive: true });
  writeFileSync(join(repo, path), text);
};
try {
  git('init', '-q', '-b', 'main');
  write('src/constants/photos.ts', 'export const photos = [];\n');
  write('src/App.tsx', 'export {};\n');
  git('add', '-A');
  git('commit', '-q', '-m', 'base');
  git('switch', '-q', '-c', 'art/drop-b');
  write('src/constants/photos.ts', 'export const photos = ["b"];\n');
  git('commit', '-qam', 'drop b');
  git('switch', '-q', 'main');

  write('src/App.tsx', 'export const x = 1;\n');
  git('commit', '-qam', 'code only');
  assert.deepEqual(contentMovedSince(git, 'art/drop-b', 'main'), []);
  console.log('PASS code-only change on main keeps the preview valid');

  write('src/constants/photos.ts', 'export const photos = ["a"];\n');
  write('public/images/a.jpg', 'jpg');
  git('add', '-A');
  git('commit', '-q', '-m', 'drop a went live');
  assert.deepEqual(contentMovedSince(git, 'art/drop-b', 'main').sort(), ['public/images/a.jpg', 'src/constants/photos.ts']);
  console.log('PASS another drop going live makes the preview stale');
} finally {
  rmSync(repo, { recursive: true, force: true });
}
