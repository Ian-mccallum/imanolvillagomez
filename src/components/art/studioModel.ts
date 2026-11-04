import type { ArtRequest, ArtStatus } from './artApi';

export const MAX_FILES = 200;
export const MAX_FILE_BYTES = 5 * 1024 ** 3;
export const STUDIO_HOST = 'studio.imanolvillagomez.com';

export interface WorkerHeartbeat {
  updatedAt: string;
  state: 'idle' | 'working' | 'error';
}

export function workerOnline(worker: WorkerHeartbeat | null, now = Date.now()) {
  if (!worker || worker.state === 'error') return false;
  const age = now - Date.parse(worker.updatedAt);
  return (
    Number.isFinite(age) &&
    age >= -60_000 &&
    age < (worker.state === 'working' ? 4 * 3600_000 : 6 * 60_000)
  );
}

export function fileProblem(files: { name: string; size: number }[], existing = 0) {
  if (files.length + existing > MAX_FILES)
    return `A drop can hold up to ${MAX_FILES} files. Split these into smaller drops.`;
  const large = files.find((f) => f.size > MAX_FILE_BYTES);
  if (large) return `${large.name} is over 5 GB. Choose a smaller export.`;
  const empty = files.find((f) => !Number.isFinite(f.size) || f.size <= 0);
  if (empty) return `${empty.name} is empty or unreadable. Choose the original file again.`;
  return '';
}

export const needsAttention = (status: ArtStatus) =>
  ['question', 'preview', 'failed'].includes(status);
export const inProgress = (status: ArtStatus) =>
  ['pending', 'working', 'approved'].includes(status);

export function requestTitle(r: ArtRequest) {
  return (
    r.title ||
    r.groups
      ?.map((g) => g.name)
      .filter(Boolean)
      .join(', ') ||
    r.files[0]?.name ||
    'Untitled drop'
  );
}

export function formatBytes(bytes: number) {
  if (bytes >= 1024 ** 3) return `${(bytes / 1024 ** 3).toFixed(1)} GB`;
  if (bytes >= 1024 ** 2) return `${(bytes / 1024 ** 2).toFixed(1)} MB`;
  return `${Math.max(1, Math.ceil(bytes / 1024))} KB`;
}

/** Keep preview feedback separate from the original delivery instructions. */
export function queueAgain<
  T extends { status: string; error?: string; revisions?: { at: string; text: string }[] },
>(request: T, action: 'revise' | 'retry', text: string, now = new Date().toISOString()) {
  if (action === 'retry' && request.status !== 'failed')
    throw new Error('Only a failed drop can be retried.');
  if (action === 'revise' && request.status !== 'preview')
    throw new Error('This drop is no longer waiting for preview feedback.');
  if (action === 'revise' && !text.trim()) throw new Error('Describe what you would like changed.');
  return {
    ...request,
    status: 'pending' as const,
    error: undefined,
    ...(action === 'revise'
      ? { revisions: [...(request.revisions ?? []), { at: now, text: text.trim().slice(0, 4000) }] }
      : {}),
  };
}
