export type ArtStatus =
  | 'pending'
  | 'working'
  | 'question'
  | 'preview'
  | 'approved'
  | 'live'
  | 'failed'
  | 'removed';

export interface ArtFile {
  /** path inside the drop — `folder/file.jpg`, or just `file.jpg` when loose */
  name: string;
  key: string;
  size: number;
  type: string;
  /** folder path this file is in, '' when loose */
  folder?: string;
  /** who/what this one is; overrides the folder's name */
  label?: string;
  /** instructions for just this file */
  note?: string;
}

export interface ArtGroup {
  folder: string;
  name: string;
  /** instructions for everything in this folder */
  note: string;
}

export interface DropEvent {
  at: string;
  type:
    | 'sent'
    | 'working'
    | 'question'
    | 'answer'
    | 'revision'
    | 'preview'
    | 'approved'
    | 'live'
    | 'failed'
    | 'retry'
    | 'removed'
    | 'requeued';
  text?: string;
  previewUrl?: string;
  by: 'imanol' | 'studio';
}

/** Where one file of a drop ended up on the site. */
export interface Placement {
  file: string;
  kind: 'photo' | 'video' | 'unused';
  siteId?: string;
  siteUrl?: string;
  reason?: string;
}

export interface ArtRequest {
  id: string;
  createdAt: string;
  updatedAt: string;
  status: ArtStatus;
  title: string;
  city: string;
  placement: 'top' | 'anywhere';
  /** instructions for the whole drop */
  note: string;
  files: ArtFile[];
  /** folders in the drop, in order — each usually one artist/client */
  groups?: ArtGroup[];
  questions?: string[];
  answers?: { at: string; text: string }[];
  revisions?: { at: string; text: string }[];
  previewUrl?: string;
  summary?: string;
  error?: string;
  /** set by the runner when other work went live after this drop's preview */
  siteChanged?: boolean;
  history?: DropEvent[];
  placements?: Placement[];
  /** file name → R2 key of its small WebP thumbnail */
  thumbs?: Record<string, string>;
  liveAt?: string;
}

const HISTORY_MAX = 200;

/** Append to a drop's history, skipping an exact repeat of the last event. */
export function appendEvent<T extends { history?: DropEvent[] }>(
  r: T,
  event: Omit<DropEvent, 'at'> & { at?: string }
): T {
  const e: DropEvent = { ...event, at: event.at ?? new Date().toISOString() };
  const list = r.history ?? [];
  const last = list[list.length - 1];
  if (last && last.type === e.type && last.text === e.text && last.previewUrl === e.previewUrl)
    return r;
  r.history = [...list, e].slice(-HISTORY_MAX);
  return r;
}

/** History for display; drops made before history existed get one rebuilt from their fields. */
export function timelineFor(r: ArtRequest): DropEvent[] {
  if (r.history?.length) return r.history;
  const events: DropEvent[] = [{ at: r.createdAt, type: 'sent', by: 'imanol' }];
  if (r.questions?.length && !r.answers?.length)
    events.push({ at: r.updatedAt, type: 'question', text: r.questions.join('\n'), by: 'studio' });
  for (const a of r.answers ?? []) events.push({ at: a.at, type: 'answer', text: a.text, by: 'imanol' });
  for (const v of r.revisions ?? [])
    events.push({ at: v.at, type: 'revision', text: v.text, by: 'imanol' });
  const end: Partial<Record<ArtStatus, DropEvent['type']>> = {
    preview: 'preview',
    live: 'live',
    failed: 'failed',
    approved: 'approved',
    working: 'working',
  };
  const type = end[r.status];
  if (type)
    events.push({
      at: r.liveAt ?? r.updatedAt,
      type,
      by: type === 'approved' ? 'imanol' : 'studio',
      previewUrl: type === 'preview' ? r.previewUrl : undefined,
    });
  return events.sort((a, b) => a.at.localeCompare(b.at));
}

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
