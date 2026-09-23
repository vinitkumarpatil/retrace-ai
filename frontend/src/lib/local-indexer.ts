import {
  LocalFileEntry,
  LocalSource,
  saveSource,
  saveFile,
  getFilesBySource,
  deleteFilesBySource,
  getSource,
  getAllSources,
} from './local-storage';
import {
  traverseDirectory,
  readFileContent,
  sha256Hash,
  chunkText,
  isSupportedFile,
  getFileExtension,
  FileEntry,
} from './file-system-access';

export interface IndexProgress {
  total: number;
  processed: number;
  skipped: number;
  failed: number;
  unsupported: number;
  currentFile: string;
  status: 'scanning' | 'indexing' | 'completed' | 'error';
}

export type ProgressCallback = (progress: IndexProgress) => void;

function generateId(): string {
  return `local_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`;
}

function getSourceNameFromPath(path: string): string {
  const parts = path.split('/').filter(Boolean);
  return parts[0] || path;
}

export async function indexConnectedFolder(
  dirHandle: FileSystemDirectoryHandle,
  sourceName?: string,
  onProgress?: ProgressCallback,
  existingSourceId?: string
): Promise<LocalSource> {
  const rootName = sourceName || dirHandle.name;
  const sourceId = existingSourceId || generateId();

  onProgress?.({
    total: 0,
    processed: 0,
    skipped: 0,
    failed: 0,
    unsupported: 0,
    currentFile: '',
    status: 'scanning',
  });

  // Scan directory
  const fileEntries: FileEntry[] = [];
  for await (const entry of traverseDirectory(dirHandle)) {
    fileEntries.push(entry);
  }

  // Get existing files for change detection
  const existingFiles = existingSourceId ? await getFilesBySource(existingSourceId) : [];
  const existingMap = new Map(existingFiles.map(f => [f.relativePath, f]));

  const progress: IndexProgress = {
    total: fileEntries.length,
    processed: 0,
    skipped: 0,
    failed: 0,
    unsupported: 0,
    currentFile: '',
    status: 'indexing',
  };

  onProgress?.(progress);

  const newFiles: LocalFileEntry[] = [];

  for (const fileEntry of fileEntries) {
    progress.currentFile = fileEntry.relativePath;
    onProgress?.(progress);

    const ext = fileEntry.extension;
    if (!isSupportedFile(fileEntry.name)) {
      progress.unsupported++;
      continue;
    }

    try {
      // Read file content
      const rawContent = await readFileContent(fileEntry.handle, ext);

      // Compute content hash
      const encoder = new TextEncoder();
      const hashBuffer = await crypto.subtle.digest('SHA-256', encoder.encode(rawContent));
      const contentHash = Array.from(new Uint8Array(hashBuffer))
        .map(b => b.toString(16).padStart(2, '0'))
        .join('');

      // Check if unchanged
      const existing = existingMap.get(fileEntry.relativePath);
      if (existing && existing.contentHash === contentHash && existing.status === 'indexed') {
        newFiles.push(existing);
        progress.skipped++;
        progress.processed++;
        continue;
      }

      // Chunk content
      const chunks = ext === '.pdf' || ext === '.docx'
        ? [{ chunkIndex: 0, chunkText: rawContent }]
        : chunkText(rawContent);

      const entry: LocalFileEntry = {
        id: existing?.id || generateId(),
        sourceId,
        fileName: fileEntry.name,
        relativePath: fileEntry.relativePath,
        extension: ext,
        mimeType: getMimeType(ext),
        sizeBytes: fileEntry.size,
        lastModified: fileEntry.lastModified,
        contentHash,
        status: 'indexed',
        rawContent: rawContent.slice(0, 50000), // Limit stored content
        chunks,
        indexedAt: new Date().toISOString(),
      };

      newFiles.push(entry);
      progress.processed++;
    } catch (e: any) {
      const existing = existingMap.get(fileEntry.relativePath);
      const failedEntry: LocalFileEntry = {
        id: existing?.id || generateId(),
        sourceId,
        fileName: fileEntry.name,
        relativePath: fileEntry.relativePath,
        extension: ext,
        mimeType: getMimeType(ext),
        sizeBytes: fileEntry.size,
        lastModified: fileEntry.lastModified,
        contentHash: '',
        status: 'failed',
        rawContent: '',
        chunks: [],
        indexedAt: new Date().toISOString(),
        error: e.message,
      };
      newFiles.push(failedEntry);
      progress.failed++;
      progress.processed++;
    }
  }

  // Save all files
  await saveFiles(newFiles);

  // Count actual indexed (not failed/unsupported)
  const indexedCount = newFiles.filter(f => f.status === 'indexed').length;

  // Create/update source
  const source: LocalSource = {
    id: sourceId,
    name: rootName,
    rootPath: dirHandle.name,
    fileCount: newFiles.filter(f => f.status !== 'unsupported').length,
    indexedCount,
    lastIndexed: new Date().toISOString(),
    connectedAt: existingSourceId
      ? (await getSource(sourceId))?.connectedAt || new Date().toISOString()
      : new Date().toISOString(),
    permissionGranted: true,
  };

  await saveSource(source);

  progress.status = 'completed';
  onProgress?.(progress);

  return source;
}

async function saveFiles(entries: LocalFileEntry[]): Promise<void> {
  const { saveFiles: save } = await import('./local-storage');
  await save(entries);
}

export async function reindexSource(
  sourceId: string,
  dirHandle: FileSystemDirectoryHandle,
  onProgress?: ProgressCallback
): Promise<LocalSource> {
  // Clear old files
  await deleteFilesBySource(sourceId);
  return indexConnectedFolder(dirHandle, undefined, onProgress, sourceId);
}

export async function removeSource(sourceId: string): Promise<void> {
  const { deleteSource, deleteFilesBySource: del } = await import('./local-storage');
  await del(sourceId);
  await deleteSource(sourceId);
}

export async function getSourceFileCount(sourceId: string): Promise<number> {
  const files = await getFilesBySource(sourceId);
  return files.filter(f => f.status === 'indexed').length;
}

export async function detectDeletedFiles(sourceId: string): Promise<string[]> {
  const files = await getFilesBySource(sourceId);
  return files.filter(f => f.status === 'indexed').map(f => f.relativePath);
}

function getMimeType(ext: string): string {
  const map: Record<string, string> = {
    '.pdf': 'application/pdf',
    '.txt': 'text/plain',
    '.md': 'text/markdown',
    '.json': 'application/json',
    '.csv': 'text/csv',
    '.py': 'text/x-python',
    '.js': 'text/javascript',
    '.ts': 'text/typescript',
    '.jsx': 'text/javascript',
    '.tsx': 'text/typescript',
    '.html': 'text/html',
    '.css': 'text/css',
    '.xml': 'application/xml',
    '.yml': 'text/yaml',
    '.yaml': 'text/yaml',
    '.toml': 'text/plain',
    '.sql': 'text/plain',
    '.sh': 'text/plain',
    '.docx': 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    '.mp3': 'audio/mpeg',
    '.wav': 'audio/wav',
    '.m4a': 'audio/mp4',
    '.ogg': 'audio/ogg',
    '.webm': 'audio/webm',
    '.flac': 'audio/flac',
  };
  return map[ext] || 'application/octet-stream';
}
