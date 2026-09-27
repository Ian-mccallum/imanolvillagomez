/**
 * The in-progress drop, kept in IndexedDB so a refresh (or a closed tab)
 * doesn't lose picked files, folders, names or instructions. IndexedDB can
 * hold File objects directly; localStorage can't. Best effort: if storage is
 * blocked (private mode), drafts just don't survive.
 */

export interface DraftItem {
  id: string;
  file: File;
  rot: number;
  group: string | null;
  label: string;
  note: string;
}

export interface Draft {
  items: DraftItem[];
  groups: { id: string; name: string; note: string }[];
  title: string;
  city: string;
  placement: 'top' | 'anywhere';
  note: string;
}

const DB = 'art-draft';
const STORE = 'draft';
const KEY = 'current';

function open(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const req = indexedDB.open(DB, 1);
    req.onupgradeneeded = () => req.result.createObjectStore(STORE);
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error);
  });
}

async function run<T>(mode: IDBTransactionMode, fn: (s: IDBObjectStore) => IDBRequest): Promise<T | undefined> {
  try {
    const db = await open();
    return await new Promise<T>((resolve, reject) => {
      const tx = db.transaction(STORE, mode);
      const req = fn(tx.objectStore(STORE));
      tx.oncomplete = () => {
        db.close();
        resolve(req.result as T);
      };
      tx.onerror = () => reject(tx.error);
    });
  } catch {
    return undefined;
  }
}

export const loadDraft = () => run<Draft>('readonly', (s) => s.get(KEY));
export const saveDraft = (d: Draft) => run('readwrite', (s) => s.put(d, KEY));
export const clearDraft = () => run('readwrite', (s) => s.delete(KEY));
