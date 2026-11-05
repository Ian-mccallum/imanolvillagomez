import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import ts from 'typescript';

const src = readFileSync(new URL('../src/utils/analyticsFilter.ts', import.meta.url), 'utf8');
const js = ts.transpileModule(src, { compilerOptions: { module: ts.ModuleKind.ESNext, target: ts.ScriptTarget.ES2022 } }).outputText;
const { reportableUrl } = await import(`data:text/javascript,${encodeURIComponent(js)}`);

const none = {};
const cases = [
  ['https://www.imanolvillagomez.com/work/photos', none, 'https://www.imanolvillagomez.com/work/photos'],
  ['https://imanolvillagomez.com/', none, 'https://imanolvillagomez.com/'],
  ['https://www.imanolvillagomez.com/work?utm_source=ig&fbclid=x&email=a@b.c#top', none, 'https://www.imanolvillagomez.com/work?utm_source=ig'],
  ['https://www.imanolvillagomez.com/studio', none, null],
  ['https://www.imanolvillagomez.com/studio/anything', none, null],
  ['https://www.imanolvillagomez.com/art', none, null],
  ['https://studio.imanolvillagomez.com/', none, null],
  ['https://imanolvillagomez-abc123.vercel.app/', none, null],
  ['http://localhost:5173/', none, null],
  ['https://www.imanolvillagomez.com/', { globalPrivacyControl: true }, null],
  ['https://www.imanolvillagomez.com/', { doNotTrack: '1' }, null],
  ['https://www.imanolvillagomez.com/', { doNotTrack: '0', globalPrivacyControl: false }, 'https://www.imanolvillagomez.com/'],
  ['https://www.imanolvillagomez.com/artist-page', none, 'https://www.imanolvillagomez.com/artist-page'],
  ['not a url', none, null],
];
for (const [url, signals, want] of cases) assert.equal(reportableUrl(url, signals), want, `${url} ${JSON.stringify(signals)}`);
console.log(`PASS analytics filter: ${cases.length} cases (hosts, private paths, DNT/GPC, query stripping)`);
