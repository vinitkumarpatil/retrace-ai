import { ReconstructionResult, DocumentItem, IngestResponse } from './types';

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

export async function checkHealth() {
  const res = await fetch(`${API_BASE}/api/health`, { cache: 'no-store' });
  if (!res.ok) throw new Error(`Health check failed: ${res.statusText}`);
  return res.json();
}

export async function ingestText(title: string, text: string, sourceType: 'text' | 'url' = 'text', project?: string): Promise<IngestResponse> {
  const res = await fetch(`${API_BASE}/api/ingest/text`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ title, text, source_type: sourceType, project }),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ detail: res.statusText }));
    throw new Error(err.detail || 'Failed to ingest text');
  }
  return res.json();
}

export async function ingestUrl(url: string, title?: string, project?: string): Promise<IngestResponse> {
  const res = await fetch(`${API_BASE}/api/ingest/url`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ url, title, project }),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ detail: res.statusText }));
    throw new Error(err.detail || 'Failed to ingest URL');
  }
  return res.json();
}

export async function ingestFile(file: File, project?: string, relativePath?: string): Promise<IngestResponse> {
  const formData = new FormData();
  formData.append('file', file);
  if (project) {
    formData.append('project', project);
  }
  if (relativePath) {
    formData.append('relative_path', relativePath);
  }
  const res = await fetch(`${API_BASE}/api/ingest/file`, {
    method: 'POST',
    body: formData,
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ detail: res.statusText }));
    throw new Error(err.detail || 'Failed to ingest file');
  }
  return res.json();
}

export async function ingestAudio(file: File, project?: string, customTitle?: string): Promise<IngestResponse> {
  const formData = new FormData();
  formData.append('file', file);
  if (project) {
    formData.append('project', project);
  }
  if (customTitle) {
    formData.append('custom_title', customTitle);
  }
  const res = await fetch(`${API_BASE}/api/ingest/audio`, {
    method: 'POST',
    body: formData,
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ detail: res.statusText }));
    throw new Error(err.detail || 'Failed to ingest audio');
  }
  return res.json();
}

export async function queryReconstruction(query: string, project?: string, selectedPaths?: string[]): Promise<ReconstructionResult> {
  const payload: Record<string, any> = { query };
  if (project) payload.project = project;
  if (selectedPaths && selectedPaths.length > 0) payload.selected_paths = selectedPaths;

  const res = await fetch(`${API_BASE}/api/query`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ detail: res.statusText }));
    throw new Error(err.detail || 'Query failed');
  }
  return res.json();
}

export async function listDocuments(project?: string): Promise<DocumentItem[]> {
  const url = project
    ? `${API_BASE}/api/context/documents?project=${encodeURIComponent(project)}`
    : `${API_BASE}/api/context/documents`;
  const res = await fetch(url, { cache: 'no-store' });
  if (!res.ok) throw new Error('Failed to fetch documents');
  const data = await res.json();
  return data.documents || [];
}

export async function searchDocuments(query: string, topK: number = 5, selectedPaths?: string[]): Promise<any> {
  const params = new URLSearchParams();
  params.append('q', query);
  params.append('top_k', topK.toString());
  if (selectedPaths && selectedPaths.length > 0) {
    selectedPaths.forEach(p => params.append('selected_paths', p));
  }
  const res = await fetch(`${API_BASE}/api/search?${params.toString()}`, { cache: 'no-store' });
  if (!res.ok) throw new Error('Search failed');
  return res.json();
}

export async function ingestFolder(rootPath: string, project?: string): Promise<any> {
  const res = await fetch(`${API_BASE}/api/ingest/folder`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ root_path: rootPath, project }),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ detail: res.statusText }));
    throw new Error(err.detail || 'Failed to ingest folder');
  }
  return res.json();
}

export async function seedSampleData(): Promise<{ success: boolean; message: string }> {
  const res = await fetch(`${API_BASE}/api/context/seed`, {
    method: 'POST',
  });
  if (!res.ok) throw new Error('Failed to seed sample project data');
  return res.json();
}
