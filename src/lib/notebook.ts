export type ReadingPosition = {
  id: 'reading:current';
  kind: 'position';
  bookFile: string;
  bookCode: string;
  bookName: string;
  chapter: number;
  verse?: number;
  updatedAt: string;
};

export type NotebookEntry = {
  id: string;
  kind: 'bookmark' | 'note' | 'question' | 'highlight';
  bookFile: string;
  bookCode: string;
  bookName: string;
  chapter: number;
  startVerse?: number;
  endVerse?: number;
  text?: string;
  note?: string;
  createdAt: string;
  updatedAt: string;
};

export type LocalRecord = ReadingPosition | NotebookEntry;

export type NotebookBackup = {
  schemaVersion: 1;
  exportedAt: string;
  records: LocalRecord[];
};

const DB_NAME = 'nestlume-local';
const DB_VERSION = 1;
const STORE = 'records';

function openDb(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);
    request.onupgradeneeded = () => {
      const db = request.result;
      if (!db.objectStoreNames.contains(STORE)) db.createObjectStore(STORE, { keyPath: 'id' });
    };
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error ?? new Error('Falha ao abrir armazenamento local.'));
  });
}

async function withStore<T>(mode: IDBTransactionMode, fn: (store: IDBObjectStore) => IDBRequest<T>): Promise<T> {
  const db = await openDb();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE, mode);
    const request = fn(tx.objectStore(STORE));
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error ?? new Error('Falha no armazenamento local.'));
    tx.oncomplete = () => db.close();
    tx.onerror = () => {
      db.close();
      reject(tx.error ?? new Error('Falha no armazenamento local.'));
    };
  });
}

function allRecords(): Promise<LocalRecord[]> {
  return withStore<LocalRecord[]>('readonly', store => store.getAll());
}

export async function saveReadingPosition(position: Omit<ReadingPosition, 'id' | 'kind' | 'updatedAt'>): Promise<ReadingPosition> {
  const record: ReadingPosition = { ...position, id: 'reading:current', kind: 'position', updatedAt: new Date().toISOString() };
  await withStore<IDBValidKey>('readwrite', store => store.put(record));
  return record;
}

export async function getReadingPosition(): Promise<ReadingPosition | null> {
  return (await withStore<ReadingPosition | undefined>('readonly', store => store.get('reading:current'))) ?? null;
}

export async function saveEntry(entry: Omit<NotebookEntry, 'id' | 'createdAt' | 'updatedAt'> & { id?: string }): Promise<NotebookEntry> {
  const now = new Date().toISOString();
  const record: NotebookEntry = {
    ...entry,
    id: entry.id ?? `${entry.kind}:${entry.bookCode}:${entry.chapter}:${entry.startVerse ?? 0}:${Date.now()}`,
    createdAt: now,
    updatedAt: now,
  };
  await withStore<IDBValidKey>('readwrite', store => store.put(record));
  return record;
}

export async function listEntries(): Promise<NotebookEntry[]> {
  return (await allRecords())
    .filter((record): record is NotebookEntry => record.kind !== 'position')
    .sort((a, b) => b.updatedAt.localeCompare(a.updatedAt));
}

export async function deleteEntry(id: string): Promise<void> {
  await withStore<undefined>('readwrite', store => store.delete(id));
}

export async function clearPersonalData(): Promise<void> {
  await withStore<undefined>('readwrite', store => store.clear());
}

export async function exportBackup(): Promise<NotebookBackup> {
  return { schemaVersion: 1, exportedAt: new Date().toISOString(), records: await allRecords() };
}

export function validateBackup(value: unknown): { ok: true; backup: NotebookBackup } | { ok: false; reason: string } {
  if (!value || typeof value !== 'object') return { ok: false, reason: 'Arquivo não contém um objeto de backup.' };
  const candidate = value as Partial<NotebookBackup>;
  if (candidate.schemaVersion !== 1) return { ok: false, reason: 'Versão de backup não suportada.' };
  if (!Array.isArray(candidate.records)) return { ok: false, reason: 'Lista de registros ausente.' };
  for (const record of candidate.records) {
    if (!record || typeof record !== 'object' || typeof (record as LocalRecord).id !== 'string' || typeof (record as LocalRecord).kind !== 'string') {
      return { ok: false, reason: 'Backup contém registro inválido.' };
    }
  }
  return { ok: true, backup: candidate as NotebookBackup };
}

export async function importBackup(backup: NotebookBackup, strategy: 'merge' | 'replace'): Promise<{ imported: number; replaced: boolean }> {
  const valid = validateBackup(backup);
  if (!valid.ok) throw new Error(valid.reason);
  const db = await openDb();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE, 'readwrite');
    const store = tx.objectStore(STORE);
    if (strategy === 'replace') store.clear();
    for (const record of backup.records) store.put(record);
    tx.oncomplete = () => {
      db.close();
      resolve({ imported: backup.records.length, replaced: strategy === 'replace' });
    };
    tx.onerror = () => {
      db.close();
      reject(tx.error ?? new Error('Falha ao importar backup.'));
    };
  });
}
