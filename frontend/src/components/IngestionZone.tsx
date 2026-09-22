'use client';

import React, { useState, useEffect } from 'react';
import {
  X,
  Upload,
  FileText,
  Globe,
  CheckCircle2,
  AlertCircle,
  Loader2,
  FileCheck,
} from 'lucide-react';
import { ingestFile, ingestText, ingestUrl } from '@/lib/api';

interface IngestionZoneProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export default function IngestionZone({ isOpen, onClose, onSuccess }: IngestionZoneProps) {
  const [tab, setTab] = useState<'file' | 'text' | 'url'>('file');
  const [file, setFile] = useState<File | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [textTitle, setTextTitle] = useState('');
  const [textContent, setTextContent] = useState('');
  const [urlInput, setUrlInput] = useState('');
  const [urlTitle, setUrlTitle] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [statusMessage, setStatusMessage] = useState<{ text: string; isError?: boolean } | null>(null);

  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const handleFileUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file) return;
    setIsLoading(true);
    setStatusMessage(null);
    try {
      const res = await ingestFile(file);
      setStatusMessage({ text: res.message });
      setFile(null);
      setTimeout(() => { onSuccess(); onClose(); }, 1200);
    } catch (err: any) {
      setStatusMessage({ text: err.message || "Couldn't add that file. Check the backend is running.", isError: true });
    } finally { setIsLoading(false); }
  };

  const handleTextUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!textTitle.trim() || !textContent.trim()) return;
    setIsLoading(true);
    setStatusMessage(null);
    try {
      const res = await ingestText(textTitle.trim(), textContent.trim());
      setStatusMessage({ text: res.message });
      setTextTitle(''); setTextContent('');
      setTimeout(() => { onSuccess(); onClose(); }, 1200);
    } catch (err: any) {
      setStatusMessage({ text: err.message || "Couldn't add those notes.", isError: true });
    } finally { setIsLoading(false); }
  };

  const handleUrlUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!urlInput.trim()) return;
    setIsLoading(true);
    setStatusMessage(null);
    try {
      const res = await ingestUrl(urlInput.trim(), urlTitle.trim() || undefined);
      setStatusMessage({ text: res.message });
      setUrlInput(''); setUrlTitle('');
      setTimeout(() => { onSuccess(); onClose(); }, 1200);
    } catch (err: any) {
      setStatusMessage({ text: err.message || "Couldn't fetch that URL.", isError: true });
    } finally { setIsLoading(false); }
  };

  const tabBtn = (active: boolean) =>
    `flex-1 py-3 px-4 flex items-center justify-center gap-2 text-[13px] transition-colors ${
      active
        ? 'bg-sheet text-ink font-semibold border-b-2 border-stamp'
        : 'text-ink-faint hover:text-ink border-b-2 border-transparent'
    }`;

  const inputCls =
    'w-full px-3.5 py-2.5 bg-paper border border-rule rounded-sheet text-[13.5px] text-ink placeholder:text-ink-faint focus:outline-none focus:border-stamp/60 transition-colors';

  const submitCls =
    'w-full py-3 bg-ink hover:bg-ink/85 disabled:bg-rule-strong disabled:text-paper text-paper rounded-sheet text-[13px] font-semibold flex items-center justify-center gap-2 transition-colors';

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-ink/40 backdrop-blur-[2px]"
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
      role="dialog" aria-modal="true" aria-labelledby="ingest-title"
    >
      <div className="w-full max-w-xl bg-sheet border border-rule-strong rounded-card shadow-modal overflow-hidden">
        <div className="flex items-center justify-between px-5 py-4 border-b border-rule bg-paper/50">
          <div>
            <div className="field-label mb-0.5">Add to the archive</div>
            <h2 id="ingest-title" className="font-serif text-[17px] font-semibold text-ink">Index a document</h2>
          </div>
          <button onClick={onClose} className="p-1.5 text-ink-faint hover:text-ink rounded-sheet hover:bg-sheet transition-colors" aria-label="Close">
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="flex border-b border-rule bg-paper/50">
          <button onClick={() => setTab('file')} className={tabBtn(tab === 'file')}>
            <Upload className="w-4 h-4" /> File or image
          </button>
          <button onClick={() => setTab('text')} className={tabBtn(tab === 'text')}>
            <FileText className="w-4 h-4" /> Paste notes
          </button>
          <button onClick={() => setTab('url')} className={tabBtn(tab === 'url')}>
            <Globe className="w-4 h-4" /> From a URL
          </button>
        </div>

        <div className="p-6">
          {tab === 'file' && (
            <form onSubmit={handleFileUpload} className="space-y-4">
              <div
                onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
                onDragLeave={() => setIsDragging(false)}
                onDrop={(e) => { e.preventDefault(); setIsDragging(false); if (e.dataTransfer.files?.[0]) setFile(e.dataTransfer.files[0]); }}
                className={`border border-dashed rounded-card p-8 text-center transition-colors cursor-pointer relative ${
                  isDragging ? 'border-stamp bg-stamp/[0.04]'
                    : file ? 'border-verified bg-verified/[0.05]'
                    : 'border-rule-strong hover:border-stamp/60 bg-paper/50'
                }`}
              >
                <input
                  type="file"
                  accept=".pdf,.png,.jpg,.jpeg,.webp,.txt,.md"
                  onChange={(e) => setFile(e.target.files?.[0] || null)}
                  className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
                />
                {file ? (
                  <div className="flex flex-col items-center">
                    <FileCheck className="w-9 h-9 text-verified mb-2" />
                    <p className="text-[14px] font-semibold text-ink truncate max-w-sm">{file.name}</p>
                    <p className="catalog mt-1">{(file.size / 1024).toFixed(1)} KB · drop another to replace</p>
                  </div>
                ) : (
                  <div className="flex flex-col items-center">
                    <Upload className="w-9 h-9 text-ink-faint mb-2" />
                    <p className="text-[14px] font-medium text-ink">Drop a PDF, screenshot, or diagram</p>
                    <p className="catalog mt-1">PDFs are read as text; images are read with vision OCR</p>
                  </div>
                )}
              </div>
              <button type="submit" disabled={!file || isLoading} className={submitCls}>
                {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Upload className="w-4 h-4" />}
                <span>{isLoading ? 'Reading and indexing…' : 'Add to archive'}</span>
              </button>
            </form>
          )}

          {tab === 'text' && (
            <form onSubmit={handleTextUpload} className="space-y-4">
              <div>
                <label className="field-label block mb-1.5">Title</label>
                <input type="text" value={textTitle} onChange={(e) => setTextTitle(e.target.value)}
                  placeholder="e.g. ADR-014 PostgreSQL migration, or #deploy incident log" required className={inputCls} />
              </div>
              <div>
                <label className="field-label block mb-1.5">Content</label>
                <textarea rows={6} value={textContent} onChange={(e) => setTextContent(e.target.value)}
                  placeholder="Paste meeting decisions, a Slack transcript, review notes, or RFC text…" required className={inputCls} />
              </div>
              <button type="submit" disabled={!textTitle.trim() || !textContent.trim() || isLoading} className={submitCls}>
                {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <FileText className="w-4 h-4" />}
                <span>{isLoading ? 'Reading and indexing…' : 'Add to archive'}</span>
              </button>
            </form>
          )}

          {tab === 'url' && (
            <form onSubmit={handleUrlUpload} className="space-y-4">
              <div>
                <label className="field-label block mb-1.5">Page URL</label>
                <input type="url" value={urlInput} onChange={(e) => setUrlInput(e.target.value)}
                  placeholder="https://docs.company.internal/architecture/database-redesign" required className={inputCls} />
              </div>
              <div>
                <label className="field-label block mb-1.5">Title (optional)</label>
                <input type="text" value={urlTitle} onChange={(e) => setUrlTitle(e.target.value)}
                  placeholder="Leave blank to use the page's own title" className={inputCls} />
              </div>
              <button type="submit" disabled={!urlInput.trim() || isLoading} className={submitCls}>
                {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Globe className="w-4 h-4" />}
                <span>{isLoading ? 'Fetching and indexing…' : 'Fetch and add'}</span>
              </button>
            </form>
          )}

          {statusMessage && (
            <div className={`mt-4 p-3.5 rounded-sheet text-[13px] flex items-center gap-2.5 border ${
              statusMessage.isError
                ? 'bg-stamp/[0.06] text-stamp border-stamp/30'
                : 'bg-verified/[0.08] text-ink border-verified/30'
            }`}>
              {statusMessage.isError
                ? <AlertCircle className="w-4 h-4 text-stamp shrink-0" />
                : <CheckCircle2 className="w-4 h-4 text-verified shrink-0" />}
              <span className="font-medium">{statusMessage.text}</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
