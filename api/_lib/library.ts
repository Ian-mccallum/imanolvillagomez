import { randomBytes } from 'node:crypto';
import {
  CopyObjectCommand,
  DeleteObjectCommand,
  HeadObjectCommand,
  ListObjectsV2Command,
} from '@aws-sdk/client-s3';
import { Bucket, INBOX, getJson, putJson, readReq, s3, signGet, signPut } from './storage.js';
import { isReadableKey, isTrashKey, isVideoKey, isVideoName, originalOf, trashKeyFor } from './keys.js';
import type {
  LibraryActivity,
  LibraryFile,
  LibrarySiteItem,
  SiteManifest,
} from '../../src/components/art/library/model.js';

const TRASH_DAYS = 30;
const ORIGIN = () => process.env.SITE_ORIGIN || 'https://www.imanolvillagomez.com';

export class LibraryError extends Error {
  constructor(
    message: string,
    public status = 409
  ) {
    super(message);
  }
}

/** What the live site shows. Mutations refuse to run without it. */
export async function manifest(): Promise<SiteManifest> {
  try {
    const res = await fetch(`${ORIGIN()}/site-manifest.json`, { signal: AbortSignal.timeout(5000) });
    if (!res.ok) throw new Error(String(res.status));
    return (await res.json()) as SiteManifest;
  } catch {
    throw new LibraryError("Can't check what's on your site right now. Try again in a minute.", 503);
  }
}

async function listAll(Prefix: string) {
  const out: { Key: string; Size: number; LastModified?: Date }[] = [];
  for (let token: string | undefined; ; ) {
    const r = await s3.send(new ListObjectsV2Command({ Bucket, Prefix, ContinuationToken: token }));
    for (const o of r.Contents ?? []) out.push({ Key: o.Key!, Size: o.Size ?? 0, LastModified: o.LastModified });
    if (!r.IsTruncated) return out;
    token = r.NextContinuationToken;
  }
}

/** Video file name → what uses it: the live site, or a drop still waiting to publish it. */
async function usage(m: SiteManifest) {
  const used = new Map<string, string>();
  for (const v of m.videos) used.set(v.file, v.title || v.file);
  for (const f of m.alsoUsedVideoFiles ?? []) if (!used.has(f)) used.set(f, 'Your home page');
  const drops = await s3.send(new ListObjectsV2Command({ Bucket, Prefix: INBOX, Delimiter: '/' }));
  const reqs = await Promise.all(
    (drops.CommonPrefixes ?? []).map((p) => readReq(p.Prefix!.slice(INBOX.length, -1)))
  );
  for (const r of reqs)
    if (r && r.status !== 'removed' && r.status !== 'live')
      for (const f of (r as { uploaded?: string[] }).uploaded ?? [])
        if (!used.has(f)) used.set(f, `Drop “${r.title || r.id}” (not published yet)`);
  return used;
}

const fileOf = (key: string) => key.split('/').pop()!;

async function audit(event: Omit<LibraryActivity, 'at'>) {
  const at = new Date().toISOString();
  await putJson(`audit/${at.slice(0, 7)}/${at}-${randomBytes(3).toString('hex')}.json`, { at, ...event });
}

async function exists(Key: string) {
  try {
    await s3.send(new HeadObjectCommand({ Bucket, Key }));
    return true;
  } catch {
    return false;
  }
}

async function move(from: string, to: string) {
  await s3.send(
    new CopyObjectCommand({ Bucket, Key: to, CopySource: encodeURI(`${Bucket}/${from}`) })
  );
  await s3.send(new DeleteObjectCommand({ Bucket, Key: from }));
}

export async function siteItems(): Promise<LibrarySiteItem[]> {
  const m = await manifest();
  const sizes = new Map((await listAll('videos/')).map((o) => [fileOf(o.Key), o.Size]));
  const origin = ORIGIN();
  return [
    ...m.videos.map((v) => ({
      kind: 'video' as const,
      id: v.id,
      title: v.title,
      artist: v.artist,
      page: v.page,
      order: v.order,
      path: `videos/${v.file}`,
      size: sizes.get(v.file),
      missing: !sizes.has(v.file),
    })),
    ...m.photos.map((p) => ({
      kind: 'photo' as const,
      id: p.id,
      title: p.client ?? '',
      artist: p.client,
      page: '/work/photos',
      order: p.order,
      url: `${origin}${p.imageUrl}`,
      thumb: `${origin}${p.thumb ?? p.imageUrl}`,
      w: p.w,
      h: p.h,
      color: p.color,
    })),
  ];
}

export async function videoFiles(): Promise<LibraryFile[]> {
  const [objects, used] = await Promise.all([listAll('videos/'), manifest().then(usage)]);
  return objects
    .filter((o) => isVideoKey(o.Key))
    .map((o) => ({
      path: o.Key,
      name: fileOf(o.Key),
      size: o.Size,
      uploadedAt: o.LastModified?.toISOString(),
      usedBy: used.get(fileOf(o.Key)) ?? null,
    }))
    .sort((a, b) => (b.uploadedAt ?? '').localeCompare(a.uploadedAt ?? ''));
}

export async function trashFiles(now = Date.now()): Promise<LibraryFile[]> {
  return (await listAll('trash/'))
    .filter((o) => isTrashKey(o.Key))
    .map((o) => {
      const day = o.Key.split('/')[1];
      const since = Date.parse(`${day.slice(0, 4)}-${day.slice(4, 6)}-${day.slice(6, 8)}T00:00:00Z`);
      return {
        path: o.Key,
        name: fileOf(o.Key),
        size: o.Size,
        uploadedAt: o.LastModified?.toISOString(),
        usedBy: null,
        daysLeft: Math.max(0, TRASH_DAYS - Math.floor((now - since) / 86400e3)),
      };
    })
    .sort((a, b) => b.path.localeCompare(a.path));
}

export async function readUrl(path: string, download?: boolean) {
  if (!isReadableKey(path)) throw new LibraryError('That file is not available here.', 404);
  return signGet(path, download ? fileOf(path) : undefined);
}

async function assertUnused(paths: string[]) {
  const used = await usage(await manifest());
  for (const p of paths) {
    if (!isVideoKey(p)) throw new LibraryError('Only video files can be changed here.', 400);
    const by = used.get(fileOf(p));
    if (by) throw new LibraryError(`${fileOf(p)} is in use (${by}). Change it through a drop instead.`);
  }
}

export async function rename(path: string, toName: string) {
  if (!isVideoName(toName)) throw new LibraryError('Use letters, numbers, dots, dashes or underscores, ending in .mp4.', 400);
  const to = `videos/${toName}`;
  if (to === path) return { path };
  await assertUnused([path]);
  if (!(await exists(path))) throw new LibraryError('That file no longer exists.', 404);
  if (await exists(to)) throw new LibraryError(`There is already a file called ${toName}.`);
  await move(path, to);
  await audit({ action: 'rename', from: path, to });
  return { path: to };
}

export async function trash(paths: string[]) {
  const list = paths.slice(0, 50);
  await assertUnused(list);
  const moved: { from: string; to: string }[] = [];
  for (const from of list) {
    if (!(await exists(from))) continue;
    const to = trashKeyFor(from);
    await move(from, to);
    moved.push({ from, to });
    await audit({ action: 'trash', from, to });
  }
  return { moved };
}

export async function restore(trashPath: string, asCopy = false) {
  if (!isTrashKey(trashPath)) throw new LibraryError('That file is not in the trash.', 404);
  let to = originalOf(trashPath);
  if (await exists(to)) {
    if (!asCopy) throw new LibraryError(`${fileOf(to)} already exists. Restore it as a copy instead.`);
    to = to.replace(/\.mp4$/, `-restored-${randomBytes(2).toString('hex')}.mp4`);
  }
  await move(trashPath, to);
  await audit({ action: 'restore', from: trashPath, to });
  return { path: to };
}

export async function emptyTrash(confirm: number) {
  const files = await trashFiles();
  if (confirm !== files.length) throw new LibraryError('The trash changed. Check it and try again.');
  for (const f of files) await s3.send(new DeleteObjectCommand({ Bucket, Key: f.path }));
  await audit({ action: 'empty-trash', count: files.length });
  return { deleted: files.length };
}

export async function uploadUrl(name: string, size: number) {
  if (!isVideoName(name)) throw new LibraryError('Use letters, numbers, dots, dashes or underscores, ending in .mp4.', 400);
  if (!(size > 0) || size > 5 * 1024 ** 3) throw new LibraryError('Videos must be under 5 GB.', 400);
  const path = `videos/${name}`;
  if (await exists(path)) throw new LibraryError(`There is already a file called ${name}.`);
  await audit({ action: 'upload', to: path, bytes: size });
  return { path, url: await signPut(path, 'video/mp4') };
}

export async function activity(): Promise<LibraryActivity[]> {
  const keys = (await listAll('audit/')).map((o) => o.Key).sort().reverse().slice(0, 50);
  return (await Promise.all(keys.map((k) => getJson<LibraryActivity>(k)))).filter(Boolean) as LibraryActivity[];
}
