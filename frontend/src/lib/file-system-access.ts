const SUPPORTED_TEXT_EXTENSIONS = new Set([
  '.pdf', '.txt', '.md', '.json', '.csv',
  '.py', '.js', '.ts', '.jsx', '.tsx', '.html', '.css', '.xml',
  '.yml', '.yaml', '.toml', '.cfg', '.ini', '.env',
  '.sql', '.sh', '.bash', '.zsh',
  '.rst', '.adoc', '.docx',
  '.mp3', '.wav', '.m4a', '.ogg', '.webm', '.flac',
]);

const AUDIO_EXTENSIONS = new Set(['.mp3', '.wav', '.m4a', '.ogg', '.webm', '.flac', '.aac', '.wma', '.opus']);

export function isSupportedFile(name: string): boolean {
  const ext = '.' + name.split('.').pop()?.toLowerCase();
  return SUPPORTED_TEXT_EXTENSIONS.has(ext);
}

export function isAudioFile(name: string): boolean {
  const ext = '.' + name.split('.').pop()?.toLowerCase();
  return AUDIO_EXTENSIONS.has(ext);
}

export function getFileExtension(name: string): string {
  return name.includes('.') ? name.split('.').pop()?.toLowerCase() || '' : '';
}

export async function sha256Hash(data: ArrayBuffer): Promise<string> {
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
}

export interface DirEntry {
  handle: FileSystemDirectoryHandle;
  name: string;
  path: string;
}

export interface FileEntry {
  handle: FileSystemFileHandle;
  name: string;
  path: string;
  relativePath: string;
  extension: string;
  size: number;
  lastModified: number;
}

export async function selectDirectory(): Promise<{ handle: FileSystemDirectoryHandle; name: string } | null> {
  if (!('showDirectoryPicker' in window)) {
    throw new Error('File System Access API not supported in this browser. Use Chrome, Edge, or Opera.');
  }
  try {
    const handle = await (window as any).showDirectoryPicker({ mode: 'read' });
    return { handle, name: handle.name };
  } catch (e: any) {
    if (e.name === 'AbortError') return null;
    throw e;
  }
}

export async function selectFiles(): Promise<File[]> {
  return new Promise((resolve, reject) => {
    const input = document.createElement('input');
    input.type = 'file';
    input.multiple = true;
    input.accept = Array.from(SUPPORTED_TEXT_EXTENSIONS).join(',');
    input.onchange = () => resolve(Array.from(input.files || []));
    input.oncancel = () => resolve([]);
    input.click();
  });
}

export async function* traverseDirectory(
  dirHandle: FileSystemDirectoryHandle,
  basePath: string = '',
  maxDepth: number = 10
): AsyncGenerator<FileEntry, void, unknown> {
  for await (const [name, handle] of dirHandle.entries()) {
    if (name.startsWith('.')) continue;
    const currentPath = basePath ? `${basePath}/${name}` : name;

    if (handle.kind === 'directory') {
      if (maxDepth > 0) {
        yield* traverseDirectory(handle as FileSystemDirectoryHandle, currentPath, maxDepth - 1);
      }
    } else if (handle.kind === 'file') {
      const ext = getFileExtension(name);
      const extWithDot = ext ? `.${ext}` : '';
      if (SUPPORTED_TEXT_EXTENSIONS.has(extWithDot)) {
        try {
          const fileHandle = handle as FileSystemFileHandle;
          const file = await fileHandle.getFile();
          yield {
            handle: fileHandle,
            name,
            path: currentPath,
            relativePath: currentPath,
            extension: extWithDot,
            size: file.size,
            lastModified: file.lastModified,
          };
        } catch {
          // Skip files that can't be read
        }
      }
    }
  }
}

export async function readFileAsArrayBuffer(handle: FileSystemFileHandle): Promise<ArrayBuffer> {
  const file = await handle.getFile();
  return file.arrayBuffer();
}

export async function readFileAsText(handle: FileSystemFileHandle): Promise<string> {
  const file = await handle.getFile();
  return file.text();
}

export async function readPdfAsText(buffer: ArrayBuffer): Promise<string> {
  try {
    const pdfjsLib = await (Function('return import("pdfjs-dist")')() as Promise<any>);
    if (pdfjsLib?.GlobalWorkerOptions) {
      pdfjsLib.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.js`;
    }
    const pdf = await pdfjsLib.getDocument({ data: buffer }).promise;
    const textParts: string[] = [];
    for (let i = 1; i <= pdf.numPages; i++) {
      const page = await pdf.getPage(i);
      const content = await page.getTextContent();
      const pageText = content.items.map((item: any) => item.str).join(' ');
      if (pageText.trim()) textParts.push(`--- Page ${i} ---\n${pageText.trim()}`);
    }
    return textParts.join('\n\n');
  } catch {
    return '[PDF content could not be extracted locally. Use backend for full PDF support.]';
  }
}

export async function readFileContent(handle: FileSystemFileHandle, extension: string): Promise<string> {
  const buffer = await readFileAsArrayBuffer(handle);

  if (extension === '.pdf') {
    return readPdfAsText(buffer);
  }

  if (extension === '.docx') {
    try {
      const text = await readFileAsText(handle);
      return text || '[DOCX content requires backend processing]';
    } catch {
      return '[DOCX content could not be extracted]';
    }
  }

  try {
    return new TextDecoder('utf-8', { fatal: true }).decode(buffer);
  } catch {
    try {
      return new TextDecoder('latin-1').decode(buffer);
    } catch {
      return '[Could not decode file content]';
    }
  }
}

export function chunkText(text: string, chunkSize: number = 1000, overlap: number = 200): { chunkIndex: number; chunkText: string }[] {
  const cleaned = text.replace(/\r\n/g, '\n').trim();
  if (!cleaned) return [];

  const paragraphs = cleaned.split('\n\n').filter(p => p.trim());
  const chunks: { chunkIndex: number; chunkText: string }[] = [];
  let current = '';
  let index = 0;

  for (const para of paragraphs) {
    if (current.length + para.length + 2 <= chunkSize) {
      current = `${current}\n\n${para}`.trim();
    } else {
      if (current) {
        chunks.push({ chunkIndex: index++, chunkText: current });
        const overlapText = current.length > overlap ? current.slice(-overlap) : current;
        current = `${overlapText}\n\n${para}`.trim();
      } else {
        const sentences = para.split(/(?<=[.!?])\s+/);
        let sub = '';
        for (const sent of sentences) {
          if (sub.length + sent.length + 1 <= chunkSize) {
            sub = `${sub} ${sent}`.trim();
          } else {
            if (sub) chunks.push({ chunkIndex: index++, chunkText: sub });
            sub = sent;
          }
        }
        if (sub) current = sub;
      }
    }
  }

  if (current) {
    chunks.push({ chunkIndex: index, chunkText: current });
  }

  return chunks;
}

export function getSourcePermissionStatus(): boolean {
  try {
    return localStorage.getItem('retrace-local-permission') === 'granted';
  } catch {
    return false;
  }
}

export function setSourcePermissionStatus(granted: boolean): void {
  try {
    localStorage.setItem('retrace-local-permission', granted ? 'granted' : 'denied');
  } catch {
    // Ignore
  }
}
