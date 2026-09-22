import { ReconstructionResult, DocumentItem, IngestResponse } from './types';

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

export function getDocumentFileUrl(documentId: string): string {
  return `${API_BASE}/api/documents/${documentId}/file`;
}

export async function getDocumentDetails(documentId: string): Promise<DocumentItem> {
  const res = await fetch(`${API_BASE}/api/documents/${documentId}`, { cache: 'no-store' });
  if (!res.ok) throw new Error(`Failed to fetch document: ${res.statusText}`);
  return res.json();
}

export async function checkHealth() {
  const res = await fetch(`${API_BASE}/api/health`, { cache: 'no-store' });
  if (!res.ok) throw new Error(`Health check failed: ${res.statusText}`);
  return res.json();
}

export async function ingestText(title: string, text: string, sourceType: 'text' | 'url' = 'text'): Promise<IngestResponse> {
  const res = await fetch(`${API_BASE}/api/ingest/text`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ title, text, source_type: sourceType }),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ detail: res.statusText }));
    throw new Error(err.detail || 'Failed to ingest text');
  }
  return res.json();
}

export async function ingestUrl(url: string, title?: string): Promise<IngestResponse> {
  const res = await fetch(`${API_BASE}/api/ingest/url`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ url, title }),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ detail: res.statusText }));
    throw new Error(err.detail || 'Failed to ingest URL');
  }
  return res.json();
}

export async function ingestFile(file: File): Promise<IngestResponse> {
  const formData = new FormData();
  formData.append('file', file);
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

export async function queryReconstruction(query: string): Promise<ReconstructionResult> {
  const res = await fetch(`${API_BASE}/api/query`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ query }),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ detail: res.statusText }));
    throw new Error(err.detail || 'Query failed');
  }
  return res.json();
}

export async function listDocuments(): Promise<DocumentItem[]> {
  const res = await fetch(`${API_BASE}/api/context/documents`, { cache: 'no-store' });
  if (!res.ok) throw new Error('Failed to fetch documents');
  const data = await res.json();
  return data.documents || [];
}

export async function seedSampleData(): Promise<{ success: boolean; message: string }> {
  const res = await fetch(`${API_BASE}/api/context/seed`, {
    method: 'POST',
  });
  if (!res.ok) throw new Error('Failed to seed sample project data');
  return res.json();
}
