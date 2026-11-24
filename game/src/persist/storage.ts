// Save slot: IndexedDB first, localStorage as a fallback (and mirror, so a save is never lost).
const DB = "parable";
const STORE = "saves";
const KEY = "m1-slot";

function openDb(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const req = indexedDB.open(DB, 1);
    req.onupgradeneeded = () => req.result.createObjectStore(STORE);
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error);
  });
}

export async function writeSave(text: string): Promise<void> {
  try {
    localStorage.setItem(`parable.${KEY}`, text);
  } catch {
    /* storage full or disabled: IndexedDB below still holds it */
  }
  try {
    const db = await openDb();
    await new Promise<void>((resolve, reject) => {
      const tx = db.transaction(STORE, "readwrite");
      tx.objectStore(STORE).put(text, KEY);
      tx.oncomplete = () => resolve();
      tx.onerror = () => reject(tx.error);
    });
    db.close();
  } catch {
    /* IndexedDB unavailable: localStorage copy is the save */
  }
}

export async function readSave(): Promise<string | null> {
  try {
    const db = await openDb();
    const text = await new Promise<string | null>((resolve, reject) => {
      const tx = db.transaction(STORE, "readonly");
      const req = tx.objectStore(STORE).get(KEY);
      req.onsuccess = () => resolve((req.result as string | undefined) ?? null);
      req.onerror = () => reject(req.error);
    });
    db.close();
    if (text) return text;
  } catch {
    /* fall through */
  }
  return localStorage.getItem(`parable.${KEY}`);
}
