import { startRegistration, startAuthentication } from '@simplewebauthn/browser';
import type { ArtFile, ArtGroup, ArtRequest, WorkerHeartbeat } from './studioModel';

export type { ArtFile, ArtGroup, ArtRequest, ArtStatus } from './studioModel';

/**
 * Client for /api/art — Imanol's drop box. Files PUT straight to R2 via
 * presigned URLs; everything else is small JSON.
 */

export interface Upload {
  folder?: string;
  name: string;
  key: string;
  size: number;
  type: string;
  url: string;
  thumbKey: string;
  thumbUrl: string;
}

export class Unauthorized extends Error {}
export class Locked extends Error {}

let token = '';
export const setToken = (t: string) => {
  token = t;
};

async function call<T>(action: string, body?: unknown): Promise<T> {
  const res = await fetch(`/api/art?action=${action}`, {
    method: body === undefined ? 'GET' : 'POST',
    headers: { authorization: `Bearer ${token}`, 'content-type': 'application/json' },
    body: body === undefined ? undefined : JSON.stringify(body),
  });
  if (res.status === 401) throw new Unauthorized();
  if (res.status === 429) throw new Locked();
  const json = await res.json().catch(() => null);
  if (!json || !res.ok) throw new Error(json?.error ?? `HTTP ${res.status}`);
  return json as T;
}

/** Password → session token. */
export const unlock = (key: string) =>
  call<{ token: string }>('unlock', { key }).then((r) => {
    setToken(r.token);
    return r.token;
  });

/*
 * Face ID / Touch ID. Safari only lets a page call WebAuthn straight from a tap,
 * so the options (a network round trip) and the library are fetched *before*
 * the tap — `prepare…` — and the tap itself goes directly to the OS prompt.
 * The library is a static import for the same reason: no await before it.
 */

type Prepared = { options: never; challenge: string };

/** Fetch registration options ahead of the tap. Needs a session. */
export async function prepareSave(): Promise<Prepared> {
  return call<Prepared>('passkey-register-options', {});
}

/** Run from the tap handler with options from prepareSave(). Returns the passkey id. */
export async function savePasskey(p: Prepared): Promise<string> {
  const response = await startRegistration({ optionsJSON: p.options });
  return call<{ id: string }>('passkey-register', { response, challenge: p.challenge }).then((r) => r.id);
}

/** Fetch login options ahead of the tap. Null when no passkey is saved on the server. */
export async function prepareUnlock(): Promise<Prepared | null> {
  try {
    return await call<Prepared>('passkey-login-options', {});
  } catch {
    return null;
  }
}

/** Run from the tap handler with options from prepareUnlock(). Returns a session token. */
export async function passkeyUnlock(p: Prepared): Promise<string> {
  const response = await startAuthentication({ optionsJSON: p.options });
  const { token: t } = await call<{ token: string }>('passkey-login', { response, challenge: p.challenge });
  setToken(t);
  return t;
}

/** A short, human reason for a failed passkey attempt. */
export const passkeyError = (e: unknown) => {
  const n = e instanceof Error ? e.name : '';
  if (n === 'NotAllowedError') return 'cancelled';
  if (n === 'InvalidStateError') return 'already saved';
  if (n === 'SecurityError') return 'wrong site';
  return 'didn’t work';
};

export async function canPasskey(): Promise<boolean> {
  try {
    return (
      !!window.PublicKeyCredential &&
      (await PublicKeyCredential.isUserVerifyingPlatformAuthenticatorAvailable())
    );
  } catch {
    return false;
  }
}

/** What to call the biometric on this device. */
export const bioName = () => {
  const ua = navigator.userAgent;
  if (/iPhone|iPad/.test(ua)) return 'face id';
  if (/Macintosh/.test(ua)) return 'touch id';
  if (/Android/.test(ua)) return 'fingerprint';
  return 'passkey';
};

type Desk = { requests: ArtRequest[]; worker?: WorkerHeartbeat | null; next?: string };
export const desk = () => call<Desk>('list');
export const list = () => desk().then((r) => r.requests ?? []);
/** The page of drops sent before `before` (a createdAt). */
export const older = (before: string) => call<Desk>(`list&before=${encodeURIComponent(before)}`);
export const get = (id: string) =>
  call<{ request: ArtRequest }>('get', { id }).then((r) => r.request);
/** 10-minute links to a drop's thumbnails or originals, keyed by file name. */
export const urls = (id: string, names: string[], kind: 'thumb' | 'original', download = false) =>
  call<{ urls: Record<string, string> }>('urls', { id, names, kind, download }).then((r) => r.urls);

export type InsightsResponse = {
  summary: import('./insights/model').InsightsSummary | null;
  connected: { vercel: boolean; gsc?: boolean; cloudflare?: boolean };
};
export const insights = () => call<InsightsResponse>('insights');
export const refreshInsights = () =>
  call<{ summary: import('./insights/model').InsightsSummary }>('insights-collect', {});

/** Reserve a drop and get one presigned PUT per file, in the same order. */
export const start = (files: { file: File; folder: string }[]) =>
  call<{ id: string; uploads: Upload[] }>('start', {
    files: files.map(({ file, folder }) => ({
      name: file.name,
      folder,
      size: file.size,
      type: file.type,
    })),
  });

export const submit = (body: {
  id: string;
  title: string;
  city: string;
  placement: 'top' | 'anywhere';
  note: string;
  files: ArtFile[];
  groups: ArtGroup[];
  /** file name → thumbnail key, for thumbnails that uploaded */
  thumbs?: Record<string, string>;
}) => call<{ request: ArtRequest }>('submit', body).then((r) => r.request);

export const reply = (id: string, text: string) =>
  call<{ request: ArtRequest }>('reply', { id, text }).then((r) => r.request);

export const approve = (id: string) =>
  call<{ request: ArtRequest }>('approve', { id }).then((r) => r.request);

export const revise = (id: string, text: string) =>
  call<{ request: ArtRequest }>('revise', { id, text }).then((r) => r.request);

export const retry = (id: string) =>
  call<{ request: ArtRequest }>('retry', { id }).then((r) => r.request);

/** Clear a question / preview / failed drop from the list; the runner deletes its files. */
export const remove = (id: string) =>
  call<{ request: ArtRequest }>('remove', { id }).then((r) => r.request);

/** PUT a small blob (a thumbnail); false on any failure. */
export const putBlob = (url: string, blob: Blob) =>
  fetch(url, { method: 'PUT', headers: { 'content-type': blob.type }, body: blob }).then(
    (r) => r.ok,
    () => false
  );

/** PUT one file to its presigned URL with byte-level progress. */
export function put(u: Upload, file: File, onProgress: (loaded: number) => void): Promise<void> {
  return new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest();
    xhr.open('PUT', u.url);
    xhr.setRequestHeader('content-type', u.type);
    xhr.upload.onprogress = (e) => onProgress(e.loaded);
    xhr.onload = () =>
      xhr.status < 300 ? (onProgress(file.size), resolve()) : reject(new Error(`${xhr.status}`));
    xhr.onerror = () => reject(new Error('network'));
    xhr.send(file);
  });
}

// ── Library ──
type SiteItem = import('./library/model').LibrarySiteItem;
type LibraryFile = import('./library/model').LibraryFile;
type Activity = import('./library/model').LibraryActivity;
export const librarySite = () => call<{ items: SiteItem[] }>('library', { tab: 'site' }).then((r) => r.items);
export const libraryFiles = () => call<{ files: LibraryFile[] }>('library', { tab: 'files' }).then((r) => r.files);
export const libraryTrash = () => call<{ files: LibraryFile[] }>('library', { tab: 'trash' }).then((r) => r.files);
export const libraryActivity = () =>
  call<{ activity: Activity[] }>('library', { tab: 'activity' }).then((r) => r.activity);
export const libraryUrl = (path: string, download = false) =>
  call<{ url: string }>('library-url', { path, download }).then((r) => r.url);
export const libraryRename = (path: string, to: string) =>
  call<{ path: string }>('library-rename', { path, to }).then((r) => r.path);
export const libraryTrashFiles = (paths: string[]) =>
  call<{ moved: { from: string; to: string }[] }>('library-trash', { paths }).then((r) => r.moved);
export const libraryRestore = (path: string, asCopy = false) =>
  call<{ path: string }>('library-restore', { path, asCopy }).then((r) => r.path);
export const libraryEmptyTrash = (confirm: number) =>
  call<{ deleted: number }>('library-empty-trash', { confirm }).then((r) => r.deleted);
export const libraryUpload = (name: string, size: number) =>
  call<{ path: string; url: string }>('library-upload', { name, size });

/** Changes to work on the site; becomes an edit drop with its own preview. */
export const editSubmit = (body: {
  ops: import('./library/model').EditOp[];
  note?: string;
  title?: string;
  id?: string;
  files?: ArtFile[];
}) => call<{ request: ArtRequest }>('edit-submit', body).then((r) => r.request);

/** A new drop from some of an earlier drop's files, without uploading them again. */
export const resend = (body: { id: string; names: string[]; title?: string; note?: string; city?: string; placement?: 'top' | 'anywhere' }) =>
  call<{ request: ArtRequest }>('resend', body).then((r) => r.request);
