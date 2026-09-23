import { LocalFileEntry, searchLocalFiles, getAllIndexedFiles, getFilesBySource, getAllSources } from './local-storage';

export interface LocalSearchResult {
  file: LocalFileEntry;
  score: number;
  matchedChunks: string[];
}

export async function localSearch(
  query: string,
  sourceIds?: string[],
  maxResults: number = 20
): Promise<LocalSearchResult[]> {
  const terms = query.toLowerCase().split(/\s+/).filter(Boolean);
  if (terms.length === 0) return [];

  const allFiles = sourceIds && sourceIds.length > 0
    ? await Promise.all(sourceIds.map(id => getFilesBySource(id)))
    .then(arrays => arrays.flat())
    : await getAllIndexedFiles();

  const indexed = allFiles.filter(f => f.status === 'indexed');
  const results: LocalSearchResult[] = [];

  for (const file of indexed) {
    const fileNameLower = file.fileName.toLowerCase();
    const pathLower = file.relativePath.toLowerCase();
    const contentLower = file.rawContent.toLowerCase();

    let score = 0;
    const matchedChunks: string[] = [];

    for (const term of terms) {
      if (fileNameLower.includes(term)) score += 10;
      if (pathLower.includes(term)) score += 5;

      for (const chunk of file.chunks) {
        if (chunk.chunkText.toLowerCase().includes(term)) {
          score += 2;
          if (!matchedChunks.includes(chunk.chunkText.slice(0, 200))) {
            matchedChunks.push(chunk.chunkText.slice(0, 200));
          }
        }
      }
    }

    if (score > 0) {
      results.push({ file, score, matchedChunks });
    }
  }

  results.sort((a, b) => b.score - a.score);
  return results.slice(0, maxResults);
}

export async function getLocalDocumentList(sourceIds?: string[]): Promise<LocalFileEntry[]> {
  if (sourceIds && sourceIds.length > 0) {
    const arrays = await Promise.all(sourceIds.map(id => getFilesBySource(id)));
    return arrays.flat().filter(f => f.status === 'indexed');
  }
  return getAllIndexedFiles();
}

export async function getLocalSourceSummary() {
  const sources = await getAllSources();
  const summaries = await Promise.all(
    sources.map(async (source) => {
      const files = await getFilesBySource(source.id);
      const indexed = files.filter(f => f.status === 'indexed').length;
      const failed = files.filter(f => f.status === 'failed').length;
      return {
        ...source,
        indexedCount: indexed,
        failedCount: failed,
        totalFiles: files.length,
      };
    })
  );
  return summaries;
}
