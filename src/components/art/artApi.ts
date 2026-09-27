/**
 * Client for /api/art — Imanol's drop box. Files PUT straight to R2 via
 * presigned URLs; everything else is small JSON.
 */

export type ArtStatus = 'pending' | 'working' | 'question' | 'preview' | 'approved' | 'live' | 'failed';

export interface ArtRequest {
  id: string;
  createdAt: string;
  updatedAt: string;
  status: ArtStatus;
  title: string;
  city: string;
  placement: 'top' | 'anywhere';
  note: string;
  files: { name: string; key: string; size: number; type: string }[];
  questions?: string[];
  answers?: { at: string; text: string }[];
  previewUrl?: string;
  summary?: string;
  error?: string;
}

export interface Upload {
  name: string;
  key: string;
  size: number;
  type: string;
  url: string;
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

/** Save this device's Face ID / Touch ID. Needs a session. */
export async function savePasskey(): Promise<string> {
  const { startRegistration } = await import('@simplewebauthn/browser');
  const { options, challenge } = await call<{ options: never; challenge: string }>('passkey-register-options', {});
  const response = await startRegistration({ optionsJSON: options });
  return call<{ id: string }>('passkey-register', { response, challenge }).then((r) => r.id);
}

/** Face ID / Touch ID → session token. */
export async function passkeyUnlock(): Promise<string> {
  const { startAuthentication } = await import('@simplewebauthn/browser');
  const { options, challenge } = await call<{ options: never; challenge: string }>('passkey-login-options', {});
  const response = await startAuthentication({ optionsJSON: options });
  const { token: t } = await call<{ token: string }>('passkey-login', { response, challenge });
  setToken(t);
  return t;
}

export async function canPasskey(): Promise<boolean> {
  try {
    return !!window.PublicKeyCredential && (await PublicKeyCredential.isUserVerifyingPlatformAuthenticatorAvailable());
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

export const list = () => call<{ requests?: ArtRequest[] }>('list').then((r) => r.requests ?? []);

export const start = (files: File[]) =>
  call<{ id: string; uploads: Upload[] }>('start', {
    files: files.map((f) => ({ name: f.name, size: f.size, type: f.type })),
  });

export const submit = (body: {
  id: string;
  title: string;
  city: string;
  placement: 'top' | 'anywhere';
  note: string;
  files: Omit<Upload, 'url'>[];
}) => call<{ request: ArtRequest }>('submit', body).then((r) => r.request);

export const reply = (id: string, text: string) =>
  call<{ request: ArtRequest }>('reply', { id, text }).then((r) => r.request);

export const approve = (id: string) => call<{ request: ArtRequest }>('approve', { id }).then((r) => r.request);

/** PUT one file to its presigned URL with byte-level progress. */
export function put(u: Upload, file: File, onProgress: (loaded: number) => void): Promise<void> {
  return new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest();
    xhr.open('PUT', u.url);
    xhr.setRequestHeader('content-type', u.type);
    xhr.upload.onprogress = (e) => onProgress(e.loaded);
    xhr.onload = () => (xhr.status < 300 ? (onProgress(file.size), resolve()) : reject(new Error(`${xhr.status}`)));
    xhr.onerror = () => reject(new Error('network'));
    xhr.send(file);
  });
}
