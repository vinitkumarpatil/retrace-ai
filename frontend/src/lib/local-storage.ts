const DB_NAME = 'retrace-local';
const DB_VERSION = 1;

export interface LocalFileEntry {
  id: string;
  sourceId: string;
  fileName: string;
  relativePath: string;
  extension: string;
  mimeType: string;
  sizeBytes: number;
  lastModified: number;
  contentHash: string;
  status: 'discovered' | 'indexing' | 'indexed' | 'changed' | 'failed' | 'unsupported';
  rawContent: string;
  chunks: { chunkIndex: number; chunkText: string }[];
  indexedAt: string;
  error?: string;
}

export interface LocalSource {
  id: string;
  name: string;
  rootPath: string;
  fileCount: number;
  indexedCount: number;
  lastIndexed: string;
  connectedAt: string;
  permissionGranted: boolean;
}

function openDB(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const req = indexedDB.open(DB_NAME, DB_VERSION);
    req.onupgradeneeded = () => {
      const db = req.result;
      if (!db.objectStoreNames.contains('sources')) {
        db.createObjectStore('sources', { keyPath: 'id' });
      }
      if (!db.objectStoreNames.contains('files')) {
        const store = db.createObjectStore('files', { keyPath: 'id' });
        store.createIndex('sourceId', 'sourceId', { unique: false });
        store.createIndex('contentHash', 'contentHash', { unique: false });
        store.createIndex('relativePath', 'relativePath', { unique: false });
      }
    };
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error);
  });
}

// --- Sources ---

export async function getAllSources(): Promise<LocalSource[]> {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction('sources', 'readonly');
    const store = tx.objectStore('sources');
    const req = store.getAll();
    req.onsuccess = () => resolve(req.result as LocalSource[]);
    req.onerror = () => reject(req.error);
  });
}

export async function getSource(id: string): Promise<LocalSource | undefined> {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction('sources', 'readonly');
    const req = tx.objectStore('sources').get(id);
    req.onsuccess = () => resolve(req.result as LocalSource | undefined);
    req.onerror = () => reject(req.error);
  });
}

export async function saveSource(source: LocalSource): Promise<void> {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction('sources', 'readwrite');
    tx.objectStore('sources').put(source);
    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error);
  });
}

export async function deleteSource(id: string): Promise<void> {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(['sources', 'files'], 'readwrite');
    tx.objectStore('sources').delete(id);
    const filesStore = tx.objectStore('files');
    const idx = filesStore.index('sourceId');
    const req = idx.openCursor(IDBKeyRange.only(id));
    req.onsuccess = () => {
      const cursor = req.result;
      if (cursor) {
        cursor.delete();
        cursor.continue();
      }
    };
    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error);
  });
}

// --- Files ---

export async function getFilesBySource(sourceId: string): Promise<LocalFileEntry[]> {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction('files', 'readonly');
    const idx = tx.objectStore('files').index('sourceId');
    const req = idx.getAll(sourceId);
    req.onsuccess = () => resolve(req.result as LocalFileEntry[]);
    req.onerror = () => reject(req.error);
  });
}

export async function getFile(id: string): Promise<LocalFileEntry | undefined> {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction('files', 'readonly');
    const req = tx.objectStore('files').get(id);
    req.onsuccess = () => resolve(req.result as LocalFileEntry | undefined);
    req.onerror = () => reject(req.error);
  });
}

export async function getFileByHash(contentHash: string): Promise<LocalFileEntry | undefined> {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction('files', 'readonly');
    const idx = tx.objectStore('files').index('contentHash');
    const req = idx.get(contentHash);
    req.onsuccess = () => resolve(req.result as LocalFileEntry | undefined);
    req.onerror = () => reject(req.error);
  });
}

export async function saveFile(entry: LocalFileEntry): Promise<void> {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction('files', 'readwrite');
    tx.objectStore('files').put(entry);
    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error);
  });
}

export async function saveFiles(entries: LocalFileEntry[]): Promise<void> {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction('files', 'readwrite');
    const store = tx.objectStore('files');
    for (const entry of entries) {
      store.put(entry);
    }
    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error);
  });
}

export async function deleteFilesBySource(sourceId: string): Promise<void> {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction('files', 'readwrite');
    const idx = tx.objectStore('files').index('sourceId');
    const req = idx.openCursor(IDBKeyRange.only(sourceId));
    req.onsuccess = () => {
      const cursor = req.result;
      if (cursor) {
        cursor.delete();
        cursor.continue();
      }
    };
    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error);
  });
}

export async function getAllIndexedFiles(): Promise<LocalFileEntry[]> {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction('files', 'readonly');
    const req = tx.objectStore('files').getAll();
    req.onsuccess = () => {
      const all = req.result as LocalFileEntry[];
      resolve(all.filter(f => f.status === 'indexed' || f.status === 'changed'));
    };
    req.onerror = () => reject(req.error);
  });
}

export async function searchLocalFiles(query: string, sourceIds?: string[]): Promise<LocalFileEntry[]> {
  const allFiles = await getAllIndexedFiles();
  const filtered = sourceIds && sourceIds.length > 0
    ? allFiles.filter(f => sourceIds.includes(f.sourceId))
    : allFiles;

  if (!query.trim()) return filtered;

  const terms = query.toLowerCase().split(/\s+/).filter(Boolean);
  return filtered.filter(f => {
    const haystack = `${f.fileName} ${f.relativePath} ${f.rawContent}`.toLowerCase();
    return terms.every(t => haystack.includes(t));
  });
}

export async function getStorageStats(): Promise<{ sources: number; files: number; indexed: number; totalSize: number }> {
  const sources = await getAllSources();
  const allFiles = await getAllIndexedFiles();
  const totalSize = allFiles.reduce((sum, f) => sum + f.sizeBytes, 0);
  return {
    sources: sources.length,
    files: allFiles.length,
    indexed: allFiles.filter(f => f.status === 'indexed').length,
    totalSize,
  };
}
