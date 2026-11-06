import {
  S3Client,
  PutObjectCommand,
  GetObjectCommand,
} from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import type { ArtRequest } from '../../src/components/art/studioModel.js';

export const INBOX = 'inbox/';
export const ID = /^\d{8}-[0-9a-f]{6}$/;

// R2_ENDPOINT only exists for local fixture mode (vite.config.ts), which serves presigned URLs itself.
export const s3 = new S3Client({
  region: 'auto',
  endpoint: process.env.R2_ENDPOINT || `https://${process.env.R2_ACCOUNT_ID}.r2.cloudflarestorage.com`,
  forcePathStyle: !!process.env.R2_ENDPOINT,
  credentials: {
    accessKeyId: process.env.R2_ACCESS_KEY_ID ?? '',
    secretAccessKey: process.env.R2_SECRET_ACCESS_KEY ?? '',
  },
});
export const Bucket = process.env.R2_BUCKET_NAME ?? '';

export async function getJson<T>(Key: string): Promise<T | null> {
  try {
    const r = await s3.send(new GetObjectCommand({ Bucket, Key }));
    return JSON.parse(await r.Body!.transformToString());
  } catch {
    return null;
  }
}

export const putJson = (Key: string, v: unknown) =>
  s3.send(
    new PutObjectCommand({
      Bucket,
      Key,
      Body: JSON.stringify(v, null, 2),
      ContentType: 'application/json',
    })
  );

export const readReq = (id: string) =>
  ID.test(id) ? getJson<ArtRequest>(`${INBOX}${id}/request.json`) : Promise.resolve(null);

export async function writeReq(r: ArtRequest) {
  r.updatedAt = new Date().toISOString();
  await putJson(`${INBOX}${r.id}/request.json`, r);
}

export const signPut = (Key: string, ContentType: string, expiresIn = 60 * 60 * 6) =>
  getSignedUrl(s3, new PutObjectCommand({ Bucket, Key, ContentType }), { expiresIn });

/** Short-lived read link; `download` names the saved file. */
export const signGet = (Key: string, download?: string) =>
  getSignedUrl(
    s3,
    new GetObjectCommand({
      Bucket,
      Key,
      ...(download
        ? {
            ResponseContentDisposition: `attachment; filename*=UTF-8''${encodeURIComponent(download)}`,
          }
        : {}),
    }),
    { expiresIn: 600 }
  );

export const clean = (s: unknown, max = 2000) =>
  String(s ?? '')
    .slice(0, max)
    .trim();
export const safeName = (n: string) =>
  n
    .normalize('NFKD')
    .replace(/[^\w.\- ]+/g, '')
    .replace(/\s+/g, ' ')
    .trim()
    .slice(0, 160) || 'file';
/** One folder level: same alphabet as file names, never leading dots (no `..`). */
export const safeFolder = (f: unknown) =>
  clean(f, 200)
    .normalize('NFKD')
    .replace(/[^\w.\- ]+/g, '')
    .replace(/\s+/g, ' ')
    .replace(/^[.\s]+/, '')
    .trim()
    .slice(0, 80);
