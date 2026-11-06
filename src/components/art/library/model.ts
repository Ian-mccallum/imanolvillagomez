/** dist/site-manifest.json, written by scripts/build-manifest.mjs. */
export interface SiteManifest {
  builtAt: string;
  commit: string;
  videos: {
    id: string;
    title: string;
    artist?: string;
    song?: string;
    location?: string;
    year?: number;
    tour?: string;
    featured: boolean;
    file: string;
    order: number;
    page: string;
  }[];
  alsoUsedVideoFiles?: string[];
  photos: {
    id: string;
    imageUrl: string;
    thumb?: string;
    client?: string;
    year?: number;
    tour?: string;
    order: number;
    w?: number;
    h?: number;
    color?: string;
  }[];
}

/** One photo or video as the site shows it. */
export interface LibrarySiteItem {
  kind: 'photo' | 'video';
  id: string;
  title: string;
  artist?: string;
  page: string;
  order: number;
  /** videos: their R2 path */
  path?: string;
  size?: number;
  /** a video the site lists but whose file is gone */
  missing?: boolean;
  /** photos: full image and grid copy on the site */
  url?: string;
  thumb?: string;
  w?: number;
  h?: number;
  color?: string;
}

/** A file in storage (videos/ or trash/). */
export interface LibraryFile {
  path: string;
  name: string;
  size: number;
  uploadedAt?: string;
  /** what uses it; null when nothing does */
  usedBy: string | null;
  daysLeft?: number;
}

export interface LibraryActivity {
  at: string;
  action: 'rename' | 'trash' | 'restore' | 'upload' | 'empty-trash';
  from?: string;
  to?: string;
  bytes?: number;
  count?: number;
}

export type EditTarget = { kind: 'photo' | 'video'; id: string };
/** A change to the live site, applied by the studio and shown as a preview first. */
export type EditOp =
  | { op: 'remove'; target: EditTarget }
  | {
      op: 'update';
      target: EditTarget;
      set: Partial<Record<'title' | 'artist' | 'song' | 'location' | 'tour', string> & { year: number; featured: boolean }>;
    }
  | { op: 'move'; target: EditTarget; to: { before?: string; after?: string; position?: 'top' | 'bottom' } }
  /** previousFile: the video file being replaced, moved to trash once the change is live */
  | { op: 'replace'; target: EditTarget; file: string; previousFile?: string };
