/**
 * Turns whatever Imanol drops or picks into files tagged with the folder they
 * came from. A dropped folder (or one picked with the folder button) becomes a
 * group named after the folder each file sits in; loose files get no folder.
 */

export interface Incoming {
  file: File;
  /** name of the folder the file sat in, '' for loose files */
  folder: string;
}

const junk = (name: string) =>
  name.startsWith('.') || name === 'Thumbs.db' || name === 'desktop.ini';

const parentOf = (path: string) => {
  const parts = path.split('/').filter(Boolean);
  return parts.length > 1 ? parts[parts.length - 2] : '';
};

/** From an <input type=file> — picked folders carry webkitRelativePath. */
export const fromList = (files: FileList | null): Incoming[] =>
  [...(files ?? [])]
    .filter((f) => !junk(f.name))
    .map((file) => ({ file, folder: parentOf(file.webkitRelativePath || '') }));

const readAll = (dir: FileSystemDirectoryEntry) =>
  new Promise<FileSystemEntry[]>((resolve) => {
    const reader = dir.createReader();
    const out: FileSystemEntry[] = [];
    // readEntries hands back batches (~100) until it returns an empty one
    const next = () =>
      reader.readEntries(
        (batch) => {
          if (!batch.length) return resolve(out);
          out.push(...batch);
          next();
        },
        () => resolve(out)
      );
    next();
  });

const fileOf = (e: FileSystemFileEntry) =>
  new Promise<File | null>((res) => e.file(res, () => res(null)));

async function walk(entry: FileSystemEntry, folder: string, out: Incoming[], depth = 0) {
  if (junk(entry.name) || depth > 8) return;
  if (entry.isFile) {
    const file = await fileOf(entry as FileSystemFileEntry);
    if (file) out.push({ file, folder });
  } else if (entry.isDirectory) {
    for (const child of await readAll(entry as FileSystemDirectoryEntry))
      await walk(child, entry.name, out, depth + 1);
  }
}

/**
 * From a drop. Entries must be pulled off the DataTransfer synchronously —
 * it's emptied as soon as the event handler returns — then walked async.
 */
export function fromDrop(dt: DataTransfer | null): Promise<Incoming[]> {
  if (!dt) return Promise.resolve([]);
  const entries = [...dt.items]
    .filter((i) => i.kind === 'file')
    .map((i) => i.webkitGetAsEntry?.() ?? null);
  // no entry API (or nothing came back) → plain files, no folders
  if (!entries.length || entries.some((e) => !e)) return Promise.resolve(fromList(dt.files));
  return (async () => {
    const out: Incoming[] = [];
    for (const e of entries) await walk(e!, '', out); // in order, so the grid matches the folder
    // folders in the order they were found, files by name inside each (IMG_2 before IMG_10)
    const rank = new Map<string, number>();
    out.forEach((i) => rank.has(i.folder) || rank.set(i.folder, rank.size));
    return out.sort(
      (a, b) =>
        rank.get(a.folder)! - rank.get(b.folder)! ||
        a.file.name.localeCompare(b.file.name, undefined, { numeric: true })
    );
  })();
}
