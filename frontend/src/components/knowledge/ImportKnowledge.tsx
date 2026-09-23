"use client";

import React, { useCallback, useEffect, useRef, useState } from "react";
import {
  Check,
  FileUp,
  FolderUp,
  Globe,
  Loader2,
  PencilLine,
  UploadCloud,
  X,
} from "lucide-react";
import { ingestFile, ingestText, ingestUrl } from "@/lib/api";
import { IngestResponse } from "@/lib/types";
import { Dialog, Button } from "@/components/ui";
import { cn } from "@/lib/utils";

type Mode = "choose" | "file" | "text" | "url";

const SUPPORTED = [".pdf", ".png", ".jpg", ".jpeg", ".webp", ".txt", ".md"];
const isSupported = (name: string) =>
  SUPPORTED.some((ext) => name.toLowerCase().endsWith(ext));

interface BatchState {
  total: number;
  done: number;
  current: string;
  ok: number;
  errors: { name: string; error: string }[];
  finished: boolean;
}

const OPTIONS: {
  mode: Exclude<Mode, "choose">;
  title: string;
  hint: string;
  icon: React.ReactNode;
}[] = [
  { mode: "file", title: "Files", hint: "PDF, images, TXT, MD", icon: <FileUp className="w-5 h-5" /> },
  { mode: "text", title: "Text", hint: "Notes, RFCs, transcripts", icon: <PencilLine className="w-5 h-5" /> },
  { mode: "url", title: "Web", hint: "URL, wiki, docs", icon: <Globe className="w-5 h-5" /> },
];

export function ImportKnowledge({
  open,
  onClose,
  onSuccess,
}: {
  open: boolean;
  onClose: () => void;
  onSuccess: () => void;
}) {
  const [mode, setMode] = useState<Mode>("choose");
  const [files, setFiles] = useState<File[]>([]);
  const [dragOver, setDragOver] = useState(false);
  const [title, setTitle] = useState("");
  const [text, setText] = useState("");
  const [url, setUrl] = useState("");
  const [processing, setProcessing] = useState(false);
  const [result, setResult] = useState<IngestResponse | null>(null);
  const [batch, setBatch] = useState<BatchState | null>(null);
  const [error, setError] = useState<string | null>(null);

  const folderRef = useRef<HTMLInputElement>(null);

  // Enable folder selection on the hidden input (non-standard attributes).
  useEffect(() => {
    if (mode === "file" && folderRef.current) {
      folderRef.current.setAttribute("webkitdirectory", "");
      folderRef.current.setAttribute("directory", "");
    }
  }, [mode]);

  const reset = useCallback(() => {
    setMode("choose");
    setFiles([]);
    setTitle("");
    setText("");
    setUrl("");
    setProcessing(false);
    setResult(null);
    setBatch(null);
    setError(null);
  }, []);

  const handleClose = () => {
    reset();
    onClose();
  };

  const addFiles = (incoming: FileList | File[]) => {
    const list = Array.from(incoming).filter((f) => isSupported(f.name));
    if (list.length === 0) return;
    setFiles((prev) => {
      const seen = new Set(prev.map((f) => `${f.name}:${f.size}`));
      const merged = [...prev];
      for (const f of list) {
        const key = `${f.name}:${f.size}`;
        if (!seen.has(key)) {
          seen.add(key);
          merged.push(f);
        }
      }
      return merged;
    });
  };

  // Single-shot ingest (text / url tabs)
  const runSingle = async (fn: () => Promise<IngestResponse>) => {
    setProcessing(true);
    setError(null);
    setResult(null);
    try {
      const res = await fn();
      setResult(res);
      onSuccess();
    } catch (e: any) {
      setError(e.message || "Ingestion failed");
    } finally {
      setProcessing(false);
    }
  };

  // Sequential batch ingest (files tab — handles many files / a folder)
  const runBatch = async () => {
    if (files.length === 0) return;
    setError(null);
    const state: BatchState = {
      total: files.length,
      done: 0,
      current: "",
      ok: 0,
      errors: [],
      finished: false,
    };
    setBatch({ ...state });

    for (const file of files) {
      state.current = file.name;
      setBatch({ ...state });
      try {
        await ingestFile(file);
        state.ok += 1;
      } catch (e: any) {
        state.errors.push({ name: file.name, error: e.message || "failed" });
      }
      state.done += 1;
      setBatch({ ...state });
    }

    state.finished = true;
    state.current = "";
    setBatch({ ...state });
    onSuccess();
  };

  const inputCls =
    "w-full px-3 py-2.5 bg-surface-2 border border-line rounded-lg text-sm text-ink-1 placeholder:text-ink-4 outline-none focus-ring transition-colors";

  const showProcessing = processing || result || batch;

  return (
    <Dialog
      open={open}
      onClose={handleClose}
      title="Add knowledge"
      description={mode === "choose" ? "What would you like to import?" : undefined}
      className="max-w-lg"
    >
      <div className="p-5">
        {showProcessing ? (
          batch ? (
            <BatchProcessingState batch={batch} onDone={handleClose} />
          ) : (
            <ProcessingState processing={processing} result={result} onDone={handleClose} />
          )
        ) : (
          <>
            {mode === "choose" && (
              <div className="grid grid-cols-3 gap-3">
                {OPTIONS.map((o) => (
                  <button
                    key={o.mode}
                    onClick={() => setMode(o.mode)}
                    className="surface-inset interactive card-accent p-4 flex flex-col items-center text-center gap-2 focus-ring"
                  >
                    <span className="grid place-items-center w-11 h-11 rounded-xl bg-iris/10 border border-iris/20 text-iris">
                      {o.icon}
                    </span>
                    <span className="text-sm font-medium text-ink-1">{o.title}</span>
                    <span className="text-2xs text-ink-4">{o.hint}</span>
                  </button>
                ))}
              </div>
            )}

            {mode === "file" && (
              <div className="space-y-4">
                <label
                  onDragOver={(e) => {
                    e.preventDefault();
                    setDragOver(true);
                  }}
                  onDragLeave={() => setDragOver(false)}
                  onDrop={(e) => {
                    e.preventDefault();
                    setDragOver(false);
                    if (e.dataTransfer.files?.length) addFiles(e.dataTransfer.files);
                  }}
                  className={cn(
                    "block border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-colors",
                    dragOver
                      ? "border-iris bg-iris/5"
                      : "border-line hover:border-line-strong bg-surface-2"
                  )}
                >
                  <input
                    type="file"
                    multiple
                    accept={SUPPORTED.join(",")}
                    onChange={(e) => e.target.files && addFiles(e.target.files)}
                    className="sr-only"
                  />
                  <UploadCloud className="w-8 h-8 text-ink-4 mx-auto mb-2" />
                  <p className="text-sm text-ink-2">
                    Drop files here, or click to browse
                  </p>
                  <p className="text-2xs text-ink-4 mt-1 font-mono">
                    PDF · PNG · JPG · TXT · MD · multiple allowed
                  </p>
                </label>

                {/* Folder picker (whole directory) */}
                <div className="flex items-center gap-2">
                  <div className="h-px flex-1 bg-line" />
                  <span className="text-2xs text-ink-4">or</span>
                  <div className="h-px flex-1 bg-line" />
                </div>
                <label className="flex items-center justify-center gap-2 h-10 rounded-lg bg-surface-2 border border-line hover:border-line-strong text-sm text-ink-2 cursor-pointer transition-colors">
                  <FolderUp className="w-4 h-4" />
                  Select a whole folder
                  <input
                    ref={folderRef}
                    type="file"
                    multiple
                    onChange={(e) => e.target.files && addFiles(e.target.files)}
                    className="sr-only"
                  />
                </label>

                {/* Selected files */}
                {files.length > 0 && (
                  <div className="surface-inset p-2 max-h-44 overflow-y-auto space-y-1">
                    <div className="flex items-center justify-between px-1 pb-1">
                      <span className="text-2xs text-ink-4">
                        {files.length} file{files.length === 1 ? "" : "s"} ready
                      </span>
                      <button
                        onClick={() => setFiles([])}
                        className="text-2xs text-ink-4 hover:text-ink-1 focus-ring rounded"
                      >
                        Clear all
                      </button>
                    </div>
                    {files.map((f, i) => (
                      <div
                        key={`${f.name}-${i}`}
                        className="flex items-center gap-2 px-2 py-1.5 rounded-md hover:bg-surface-3 group"
                      >
                        <FileUp className="w-3.5 h-3.5 text-ink-4 shrink-0" />
                        <span className="text-xs text-ink-2 truncate flex-1">{f.name}</span>
                        <button
                          onClick={() =>
                            setFiles((prev) => prev.filter((_, idx) => idx !== i))
                          }
                          aria-label={`Remove ${f.name}`}
                          className="text-ink-4 hover:text-rose opacity-0 group-hover:opacity-100 transition-opacity focus-ring rounded"
                        >
                          <X className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}

                <div className="flex items-center justify-between gap-3 pt-1">
                  <Button variant="ghost" size="sm" onClick={() => setMode("choose")}>
                    Back
                  </Button>
                  <Button
                    variant="primary"
                    size="sm"
                    onClick={runBatch}
                    disabled={files.length === 0}
                  >
                    {files.length > 1
                      ? `Process ${files.length} files`
                      : "Process & index"}
                  </Button>
                </div>
              </div>
            )}

            {mode === "text" && (
              <div className="space-y-3">
                <input
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Title — e.g. ADR #14, Slack #architecture"
                  className={inputCls}
                />
                <textarea
                  rows={6}
                  value={text}
                  onChange={(e) => setText(e.target.value)}
                  placeholder="Paste notes, decision logs, RFCs, or meeting transcripts…"
                  className={inputCls}
                />
                <div className="flex items-center justify-between gap-3 pt-1">
                  <Button variant="ghost" size="sm" onClick={() => setMode("choose")}>
                    Back
                  </Button>
                  <Button
                    variant="primary"
                    size="sm"
                    onClick={() => runSingle(() => ingestText(title.trim(), text.trim()))}
                    disabled={!title.trim() || !text.trim()}
                  >
                    Ingest & index
                  </Button>
                </div>
              </div>
            )}

            {mode === "url" && (
              <div className="space-y-3">
                <input
                  type="url"
                  value={url}
                  onChange={(e) => setUrl(e.target.value)}
                  placeholder="https://wiki.internal/architecture/rfc-42"
                  className={inputCls}
                />
                <input
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Optional title"
                  className={inputCls}
                />
                <div className="flex items-center justify-between gap-3 pt-1">
                  <Button variant="ghost" size="sm" onClick={() => setMode("choose")}>
                    Back
                  </Button>
                  <Button
                    variant="primary"
                    size="sm"
                    onClick={() => runSingle(() => ingestUrl(url.trim(), title.trim() || undefined))}
                    disabled={!url.trim()}
                  >
                    Scrape & ingest
                  </Button>
                </div>
              </div>
            )}

            {error && (
              <p className="mt-4 text-sm text-rose bg-rose/10 border border-rose/25 rounded-lg px-3 py-2">
                {error}
              </p>
            )}
          </>
        )}
      </div>
    </Dialog>
  );
}

function ProcessingState({
  processing,
  result,
  onDone,
}: {
  processing: boolean;
  result: IngestResponse | null;
  onDone: () => void;
}) {
  const steps = [
    { label: "Document parsed", done: !!result },
    {
      label: `Entities extracted${result ? ` (${result.extracted_entities_count})` : ""}`,
      done: !!result,
    },
    {
      label: `Timeline events found${result ? ` (${result.extracted_events_count})` : ""}`,
      done: !!result,
    },
    { label: "Relationships & embeddings built", done: !!result },
  ];

  return (
    <div className="py-2">
      <div className="flex items-center gap-3 mb-5">
        <span className="grid place-items-center w-9 h-9 rounded-xl bg-iris/12 border border-iris/25 text-iris">
          {result ? <Check className="w-4 h-4" /> : <Loader2 className="w-4 h-4 animate-spin" />}
        </span>
        <div>
          <div className="text-sm font-semibold text-ink-1">
            {result ? "Knowledge added" : "Processing knowledge…"}
          </div>
          {result && (
            <div className="text-2xs text-ink-4 truncate max-w-xs">{result.title}</div>
          )}
        </div>
      </div>

      <ul className="space-y-2">
        {steps.map((s, i) => (
          <li key={i} className="flex items-center gap-2.5 text-sm">
            <span
              className={cn(
                "grid place-items-center w-5 h-5 rounded-full border shrink-0",
                s.done
                  ? "bg-emerald/15 border-emerald/40 text-emerald"
                  : "border-line text-transparent"
              )}
            >
              {s.done ? <Check className="w-3 h-3" /> : <Loader2 className="w-3 h-3 animate-spin text-iris" />}
            </span>
            <span className={s.done ? "text-ink-2" : "text-ink-4"}>{s.label}</span>
          </li>
        ))}
      </ul>

      {result && (
        <div className="flex justify-end mt-6">
          <Button variant="primary" size="sm" onClick={onDone}>
            Done
          </Button>
        </div>
      )}
    </div>
  );
}

function BatchProcessingState({
  batch,
  onDone,
}: {
  batch: BatchState;
  onDone: () => void;
}) {
  const pct = batch.total ? Math.round((batch.done / batch.total) * 100) : 0;
  return (
    <div className="py-2">
      <div className="flex items-center gap-3 mb-5">
        <span className="grid place-items-center w-9 h-9 rounded-xl bg-iris/12 border border-iris/25 text-iris">
          {batch.finished ? <Check className="w-4 h-4" /> : <Loader2 className="w-4 h-4 animate-spin" />}
        </span>
        <div className="min-w-0">
          <div className="text-sm font-semibold text-ink-1">
            {batch.finished
              ? "Import complete"
              : `Processing ${batch.done + 1} of ${batch.total}…`}
          </div>
          <div className="text-2xs text-ink-4 truncate max-w-xs">
            {batch.finished
              ? `${batch.ok} added${batch.errors.length ? `, ${batch.errors.length} failed` : ""}`
              : batch.current}
          </div>
        </div>
      </div>

      <div className="coverage-track mb-2">
        <div className="coverage-fill" style={{ width: `${pct}%` }} />
      </div>
      <div className="flex justify-between text-2xs text-ink-4">
        <span>
          {batch.done} / {batch.total}
        </span>
        <span className="tabular">{pct}%</span>
      </div>

      {batch.finished && batch.errors.length > 0 && (
        <div className="surface-inset p-3 mt-4 max-h-32 overflow-y-auto space-y-1">
          <div className="text-2xs font-semibold uppercase tracking-[0.14em] text-amber mb-1">
            {batch.errors.length} could not be processed
          </div>
          {batch.errors.map((e, i) => (
            <div key={i} className="text-2xs text-ink-4">
              <span className="text-ink-2">{e.name}</span> — {e.error}
            </div>
          ))}
        </div>
      )}

      {batch.finished && (
        <div className="flex justify-end mt-6">
          <Button variant="primary" size="sm" onClick={onDone}>
            Done
          </Button>
        </div>
      )}
    </div>
  );
}
