import type { EditOp, EditTarget, SiteManifest } from '../../src/components/art/library/model.js';

const FIELDS = ['title', 'artist', 'song', 'location', 'year', 'tour', 'featured'] as const;
const MAX_OPS = 100;

const text = (v: unknown, max: number) => String(v ?? '').trim().slice(0, max);

/**
 * Library change requests, checked against what the site shows. Returns clean ops or an error
 * message Imanol can act on. Anything not listed here can't be asked for this way.
 */
export function validateOps(raw: unknown, m: SiteManifest, files: string[] = []): EditOp[] | string {
  if (!Array.isArray(raw) || !raw.length) return 'Choose at least one change.';
  if (raw.length > MAX_OPS) return `Up to ${MAX_OPS} changes at a time.`;
  const ids = {
    photo: new Set(m.photos.map((p) => p.id)),
    video: new Set(m.videos.map((v) => v.id)),
  };
  const seen = new Map<string, string>();
  const ops: EditOp[] = [];
  for (const o of raw as Record<string, unknown>[]) {
    const t = o?.target as { kind?: string; id?: string } | undefined;
    const kind: EditTarget['kind'] | null = t?.kind === 'photo' || t?.kind === 'video' ? t.kind : null;
    const id = text(t?.id, 120);
    if (!kind || !ids[kind].has(id)) return 'One of these is no longer on your site. Refresh and try again.';
    const target: EditTarget = { kind, id };
    const key = `${kind}:${id}`;
    const op = o.op;
    // one structural change per item; edits to details may stack with a move
    const clash = seen.get(key);
    if (clash === 'remove' || (op === 'remove' && clash) || (op === 'replace' && clash === 'replace'))
      return 'An item has two changes that conflict. Keep one.';
    seen.set(key, String(op));
    if (op === 'remove') ops.push({ op, target });
    else if (op === 'update') {
      const set: Record<string, string | number | boolean> = {};
      const input = (o.set ?? {}) as Record<string, unknown>;
      for (const f of FIELDS) {
        if (!(f in input)) continue;
        if (f === 'year') {
          const y = Number(input.year);
          if (!Number.isInteger(y) || y < 2000 || y > 2100) return 'Years must be between 2000 and 2100.';
          set.year = y;
        } else if (f === 'featured') set.featured = !!input.featured;
        else set[f] = text(input[f], 200);
      }
      if (!Object.keys(set).length) return 'Describe what to change.';
      if (kind === 'photo' && Object.keys(set).some((f) => !['artist', 'year', 'tour'].includes(f)))
        return 'Photos can change artist, year or tour.';
      ops.push({ op, target, set });
    } else if (op === 'move') {
      const to = (o.to ?? {}) as { before?: string; after?: string; position?: string };
      const ref = text(to.before ?? to.after, 120);
      if (to.position === 'top' || to.position === 'bottom') ops.push({ op, target, to: { position: to.position } });
      else if (ref && ids[kind].has(ref) && ref !== id)
        ops.push({ op, target, to: to.before ? { before: ref } : { after: ref } });
      else return 'Choose where to move it.';
    } else if (op === 'replace') {
      const file = text(o.file, 400);
      if (!files.includes(file)) return 'Add the replacement file first.';
      ops.push({ op, target, file });
    } else return 'Unknown change.';
  }
  return ops;
}

const label = (o: EditOp, m: SiteManifest) => {
  const item =
    o.target.kind === 'video'
      ? m.videos.find((v) => v.id === o.target.id)?.title
      : m.photos.find((p) => p.id === o.target.id)?.client;
  return `${o.target.kind} “${item || o.target.id}”`;
};

/** One line per change, for the drop's title and the AI prompt. */
export function describeOps(ops: EditOp[], m: SiteManifest) {
  return ops.map((o) => {
    if (o.op === 'remove') return `Remove ${label(o, m)} from the site`;
    if (o.op === 'update')
      return `Change ${label(o, m)}: ${Object.entries(o.set)
        .map(([k, v]) => `${k} → ${v}`)
        .join(', ')}`;
    if (o.op === 'move')
      return `Move ${label(o, m)} ${
        o.to.position ? `to the ${o.to.position}` : o.to.before ? `before ${o.to.before}` : `after ${o.to.after}`
      }`;
    return `Replace ${label(o, m)} with the uploaded file ${o.file}`;
  });
}

/**
 * What can be checked without running the branch's code: removed ids are gone from the
 * data files, and every new value appears in what the branch added. Order is for the preview.
 */
export function verifyOps(ops: EditOp[], after: string, added: string): string[] {
  const problems: string[] = [];
  for (const o of ops) {
    if (o.op === 'remove' && new RegExp(`['"]${o.target.id.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}['"]`).test(after))
      problems.push(`${o.target.id} is still on the site`);
    if (o.op === 'update')
      for (const v of Object.values(o.set))
        if (typeof v !== 'boolean' && !added.includes(String(v))) problems.push(`${o.target.id}: ${v} not applied`);
  }
  return problems;
}
