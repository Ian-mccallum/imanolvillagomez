import { mkdtempSync, mkdirSync, writeFileSync, readFileSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { spawnSync } from 'node:child_process';
import assert from 'node:assert/strict';
const root = mkdtempSync(join(tmpdir(), 'nol-agent-'));
const bin = join(root, 'bin');
const wt = join(root, 'wt', 'drop with spaces');
const extra = join(root, 'req', 'drop with spaces');
mkdirSync(bin, { recursive: true });
mkdirSync(wt, { recursive: true });
mkdirSync(extra, { recursive: true });
const src = readFileSync(new URL('./nolai-run', import.meta.url), 'utf8')
  .replace('__REPO__/.art-inbox/wt', join(root, 'wt'))
  .replace('/etc/nol-studio/nolai.env', join(root, 'env'))
  .replace('PATH=/home/nolai/.local/bin:/usr/local/bin:/usr/bin:/bin', `PATH=${bin}:/usr/bin:/bin`);
const wrapper = join(root, 'wrapper');
writeFileSync(wrapper, src);
for (const name of ['agent', 'codex'])
  writeFileSync(
    join(bin, name),
    `#!/usr/bin/python3
import json,os,sys
a=sys.argv[1:]
print(json.dumps(a))
if os.environ.get('FAKE_RESULT'): open(os.path.join(a[a.index('--add-dir')+1],'result.json'),'w').write('{}')
sys.exit(int(os.environ.get('FAKE_EXIT','0')))
`,
    { mode: 0o755 }
  );
writeFileSync(
  join(bin, 'claude'),
  '#!/usr/bin/python3\nimport json,sys\nprint(json.dumps(sys.argv[1:]))\n',
  { mode: 0o755 }
);
const prompt = '/imanol-publish\nTitle: test $literal `code` "quotes"';
const args = [
  '-p',
  prompt,
  '--permission-mode',
  'acceptEdits',
  '--allowedTools',
  'Bash,Read',
  '--add-dir',
  extra,
];
try {
  for (const provider of ['cursor', 'codex', 'claude']) {
    writeFileSync(join(root, 'env'), `ART_AGENT=${provider}\n`);
    const run = spawnSync('bash', [wrapper, wt, 'claude', ...args], { encoding: 'utf8' });
    assert.equal(run.status, 0, run.stderr);
    const out = JSON.parse(run.stdout);
    if (provider === 'claude') assert.deepEqual(out, args);
    else {
      assert.ok(out.at(-1).includes(prompt.slice('/imanol-publish'.length)));
      assert.ok(out.at(-1).includes('.claude/skills/imanol-publish/SKILL.md'));
      assert.equal(out[out.indexOf('--add-dir') + 1], extra);
      assert.equal(
        out[out.indexOf('--sandbox') + 1],
        provider === 'cursor' ? 'enabled' : 'workspace-write'
      );
    }
    console.log(`PASS ${provider}: arguments, skill, and sandbox`);
  }
  for (const provider of ['cursor', 'codex']) {
    writeFileSync(join(root, 'env'), `ART_AGENT=${provider}\nCLAUDE_CODE_OAUTH_TOKEN=test\n`);
    const run = (env) => {
      rmSync(join(extra, 'result.json'), { force: true });
      const r = spawnSync('bash', [wrapper, wt, 'claude', ...args], {
        encoding: 'utf8',
        env: { ...process.env, ...env },
      });
      return { ...r, lines: r.stdout.trim().split('\n').map((l) => JSON.parse(l)) };
    };
    const died = run({ FAKE_EXIT: '1' });
    assert.equal(died.status, 0, died.stderr);
    assert.equal(died.lines.length, 2);
    assert.deepEqual(died.lines[1], args);
    assert.match(died.stderr, /running Claude instead/);
    const finished = run({ FAKE_EXIT: '1', FAKE_RESULT: '1' });
    assert.equal(finished.status, 1);
    assert.equal(finished.lines.length, 1);
    console.log(`PASS ${provider}: Claude takes over only when there is no result`);
  }
  writeFileSync(join(root, 'env'), 'ART_AGENT=invalid\n');
  assert.equal(spawnSync('bash', [wrapper, wt, 'claude', ...args]).status, 64);
  console.log('PASS unknown provider rejected');
  assert.equal(spawnSync('bash', [wrapper, root, 'claude', ...args]).status, 64);
  console.log('PASS outside worktree rejected');
} finally {
  rmSync(root, { recursive: true, force: true });
}
