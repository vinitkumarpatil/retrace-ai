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

export async function ingestFile(file: File, project?: string): Promise<IngestResponse> {
  const formData = new FormData();
  formData.append('file', file);
  if (project) {
    formData.append('project', project);
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

export async function queryReconstruction(query: string, project?: string): Promise<ReconstructionResult> {
  const res = await fetch(`${API_BASE}/api/query`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ query, project }),
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

export async function searchDocuments(query: string, topK: number = 5): Promise<any> {
  const res = await fetch(`${API_BASE}/api/search?q=${encodeURIComponent(query)}&top_k=${topK}`, { cache: 'no-store' });
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
