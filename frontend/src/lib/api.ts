import {
  ReconstructionResult,
  DocumentItem,
  IngestResponse,
  GlobalGraphResponse,
} from "./types";

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

/** Wraps fetch so a network-level failure gives an actionable message
 *  (the raw "Failed to fetch" almost always means the backend is unreachable). */
async function apiFetch(path: string, init?: RequestInit): Promise<Response> {
  try {
    return await fetch(`${API_BASE}${path}`, init);
  } catch (e: any) {
    throw new Error(
      `Can't reach the Retrace backend at ${API_BASE}. ` +
        `Make sure it's running (python run.py) and that this app's origin is allowed in CORS_ORIGINS. ` +
        `(${e?.message || "network error"})`
    );
  }
}

async function parseError(res: Response, fallback: string): Promise<string> {
  const err = await res.json().catch(() => ({ detail: res.statusText }));
  return err.detail || fallback;
}

export function getApiBase() {
  return API_BASE;
}

export async function checkHealth() {
  const res = await apiFetch("/api/health", { cache: "no-store" });
  if (!res.ok) throw new Error(`Health check failed: ${res.statusText}`);
  return res.json();
}

export async function ingestText(
  title: string,
  text: string,
  sourceType: "text" | "url" = "text"
): Promise<IngestResponse> {
  const res = await apiFetch("/api/ingest/text", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ title, text, source_type: sourceType }),
  });
  if (!res.ok) throw new Error(await parseError(res, "Failed to ingest text"));
  return res.json();
}

export async function ingestUrl(url: string, title?: string): Promise<IngestResponse> {
  const res = await apiFetch("/api/ingest/url", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ url, title }),
  });
  if (!res.ok) throw new Error(await parseError(res, "Failed to ingest URL"));
  return res.json();
}

export async function ingestFile(file: File): Promise<IngestResponse> {
  const formData = new FormData();
  formData.append("file", file);
  const res = await apiFetch("/api/ingest/file", {
    method: "POST",
    body: formData,
  });
  if (!res.ok) throw new Error(await parseError(res, "Failed to ingest file"));
  return res.json();
}

export async function queryReconstruction(query: string): Promise<ReconstructionResult> {
  const res = await apiFetch("/api/query", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ query }),
  });
  if (!res.ok) throw new Error(await parseError(res, "Query failed"));
  return res.json();
}

export interface StreamStage {
  index: number;
  label: string;
}

/**
 * Streamed reconstruction via Server-Sent Events (POST /api/query/stream).
 * Calls `onStage` as each real pipeline stage begins and resolves with the
 * final result. Throws if the stream errors or never yields a result — callers
 * can then fall back to the non-streaming queryReconstruction().
 */
export async function streamReconstruction(
  query: string,
  opts: { onStage?: (stage: StreamStage) => void; signal?: AbortSignal } = {}
): Promise<ReconstructionResult> {
  const res = await apiFetch("/api/query/stream", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ query }),
    signal: opts.signal,
  });
  if (!res.ok || !res.body) {
    throw new Error(await parseError(res, "Streaming query failed"));
  }

  const reader = res.body.getReader();
  const decoder = new TextDecoder();
  let buffer = "";
  let result: ReconstructionResult | null = null;

  const handleEvent = (raw: string) => {
    const dataLines = raw
      .split("\n")
      .filter((l) => l.startsWith("data:"))
      .map((l) => l.slice(5).trim());
    if (dataLines.length === 0) return;
    let payload: any;
    try {
      payload = JSON.parse(dataLines.join(""));
    } catch {
      return;
    }
    if (payload.type === "stage") {
      opts.onStage?.({ index: payload.index, label: payload.label });
    } else if (payload.type === "result") {
      result = payload.result as ReconstructionResult;
    } else if (payload.type === "error") {
      throw new Error(payload.message || "Streaming reconstruction failed");
    }
  };

  // eslint-disable-next-line no-constant-condition
  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    buffer += decoder.decode(value, { stream: true });
    let sep: number;
    while ((sep = buffer.indexOf("\n\n")) !== -1) {
      const chunk = buffer.slice(0, sep);
      buffer = buffer.slice(sep + 2);
      handleEvent(chunk);
    }
  }
  if (buffer.trim()) handleEvent(buffer);

  if (!result) throw new Error("Stream ended without a result");
  return result;
}

export async function listDocuments(): Promise<DocumentItem[]> {
  const res = await apiFetch("/api/context/documents", { cache: "no-store" });
  if (!res.ok) throw new Error("Failed to fetch documents");
  const data = await res.json();
  return data.documents || [];
}

/** Global entity relationship graph (backend: GET /api/context/graph). */
export async function getGlobalGraph(): Promise<GlobalGraphResponse> {
  const res = await apiFetch("/api/context/graph", { cache: "no-store" });
  if (!res.ok) throw new Error("Failed to fetch knowledge graph");
  const data = await res.json();
  return { nodes: data.nodes || [], links: data.links || [] };
}

export async function seedSampleData(): Promise<{ success: boolean; message: string }> {
  const res = await apiFetch("/api/context/seed", { method: "POST" });
  if (!res.ok) throw new Error("Failed to seed sample project data");
  return res.json();
}
