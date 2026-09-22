'use client';

import React, { useState } from 'react';
import { X, Upload, FileText, Globe, CheckCircle2, AlertCircle, Loader2 } from 'lucide-react';
import { ingestFile, ingestText, ingestUrl } from '@/lib/api';

interface IngestionZoneProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export default function IngestionZone({ isOpen, onClose, onSuccess }: IngestionZoneProps) {
  const [tab, setTab] = useState<'file' | 'text' | 'url'>('file');
  const [file, setFile] = useState<File | null>(null);
  const [textTitle, setTextTitle] = useState('');
  const [textContent, setTextContent] = useState('');
  const [urlInput, setUrlInput] = useState('');
  const [urlTitle, setUrlTitle] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [statusMessage, setStatusMessage] = useState<{ text: string; isError?: boolean } | null>(null);

  if (!isOpen) return null;

  const finish = () => setTimeout(() => { onSuccess(); onClose(); }, 1200);

  const handleFileUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file) return;
    setIsLoading(true);
    setStatusMessage(null);
    try {
      const res = await ingestFile(file);
      setStatusMessage({ text: res.message });
      setFile(null);
      finish();
    } catch (err: any) {
      setStatusMessage({ text: err.message || 'File ingestion failed', isError: true });
    } finally {
      setIsLoading(false);
    }
  };

  const handleTextUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!textTitle.trim() || !textContent.trim()) return;
    setIsLoading(true);
    setStatusMessage(null);
    try {
      const res = await ingestText(textTitle.trim(), textContent.trim());
      setStatusMessage({ text: res.message });
      setTextTitle('');
      setTextContent('');
      finish();
    } catch (err: any) {
      setStatusMessage({ text: err.message || 'Text ingestion failed', isError: true });
    } finally {
      setIsLoading(false);
    }
  };

  const handleUrlUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!urlInput.trim()) return;
    setIsLoading(true);
    setStatusMessage(null);
    try {
      const res = await ingestUrl(urlInput.trim(), urlTitle.trim() || undefined);
      setStatusMessage({ text: res.message });
      setUrlInput('');
      setUrlTitle('');
      finish();
    } catch (err: any) {
      setStatusMessage({ text: err.message || 'URL ingestion failed', isError: true });
    } finally {
      setIsLoading(false);
    }
  };

  const tabs: { id: typeof tab; label: string; icon: typeof Upload }[] = [
    { id: 'file', label: 'PDF / Image', icon: Upload },
    { id: 'text', label: 'Notes / RFC', icon: FileText },
    { id: 'url', label: 'Web URL', icon: Globe },
  ];

  const inputCls = "w-full px-3 py-2.5 bg-console-s2 border border-console-border rounded-lg text-sm text-white placeholder:text-console-mute focus-cyan transition-all";
  const submitCls = "w-full py-2.5 bg-console-cyan hover:bg-white disabled:bg-console-s3 disabled:text-console-mute text-console-bg rounded-lg text-xs font-semibold flex items-center justify-center gap-2 transition-all";

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-fade-in">
      <div className="w-full max-w-xl panel brackets overflow-hidden">

        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-console-border">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-console-cyan pulse-dot" />
            <h2 className="text-xs font-mono font-bold text-white uppercase tracking-wider">
              Ingest Artifact
            </h2>
          </div>
          <button onClick={onClose} className="text-console-mute hover:text-white p-1 rounded transition-colors">
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-console-border px-2 pt-2 gap-1">
          {tabs.map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              onClick={() => setTab(id)}
              className={`flex-1 py-2.5 px-3 text-xs font-medium rounded-t-lg flex items-center justify-center gap-1.5 transition-colors ${
                tab === id
                  ? 'text-white bg-console-s2 border-b-2 border-console-cyan'
                  : 'text-console-mute hover:text-console-dim'
              }`}
            >
              <Icon className="w-3.5 h-3.5" />
              {label}
            </button>
          ))}
        </div>

        {/* Body */}
        <div className="p-6">
          {tab === 'file' && (
            <form onSubmit={handleFileUpload} className="space-y-4">
              <div className="border-2 border-dashed border-console-border hover:border-console-cyan/50 rounded-xl p-8 text-center bg-console-s2 transition-colors cursor-pointer relative">
                <input
                  type="file"
                  accept=".pdf,.png,.jpg,.jpeg,.webp,.txt,.md"
                  onChange={(e) => setFile(e.target.files?.[0] || null)}
                  className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
                />
                <Upload className="w-8 h-8 text-console-mute mx-auto mb-2" />
                <p className="text-xs font-medium text-console-dim">
                  {file ? file.name : 'Click or drag a PDF, screenshot, or diagram'}
                </p>
                <p className="text-[11px] font-mono text-console-mute mt-1">
                  PDF text extraction & Gemini Vision OCR
                </p>
              </div>
              <button type="submit" disabled={!file || isLoading} className={submitCls}>
                {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Upload className="w-4 h-4" />}
                <span>{isLoading ? 'Extracting…' : 'Process & Index'}</span>
              </button>
            </form>
          )}

          {tab === 'text' && (
            <form onSubmit={handleTextUpload} className="space-y-4">
              <div>
                <label className="block text-[11px] font-mono uppercase text-console-mute mb-1.5">Title / Identifier</label>
                <input type="text" value={textTitle} onChange={(e) => setTextTitle(e.target.value)}
                  placeholder="e.g. ADR #14, Slack #deploy log" required className={inputCls} />
              </div>
              <div>
                <label className="block text-[11px] font-mono uppercase text-console-mute mb-1.5">Content / Notes</label>
                <textarea rows={6} value={textContent} onChange={(e) => setTextContent(e.target.value)}
                  placeholder="Paste meeting notes, decision logs, PR discussions, or RFC text…" required className={inputCls} />
              </div>
              <button type="submit" disabled={!textTitle.trim() || !textContent.trim() || isLoading} className={submitCls}>
                {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <FileText className="w-4 h-4" />}
                <span>{isLoading ? 'Extracting…' : 'Ingest & Index'}</span>
              </button>
            </form>
          )}

          {tab === 'url' && (
            <form onSubmit={handleUrlUpload} className="space-y-4">
              <div>
                <label className="block text-[11px] font-mono uppercase text-console-mute mb-1.5">Documentation URL</label>
                <input type="url" value={urlInput} onChange={(e) => setUrlInput(e.target.value)}
                  placeholder="https://wiki.internal.company.com/architecture/rfc-42" required className={inputCls} />
              </div>
              <div>
                <label className="block text-[11px] font-mono uppercase text-console-mute mb-1.5">Optional Title</label>
                <input type="text" value={urlTitle} onChange={(e) => setUrlTitle(e.target.value)}
                  placeholder="Override page title" className={inputCls} />
              </div>
              <button type="submit" disabled={!urlInput.trim() || isLoading} className={submitCls}>
                {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Globe className="w-4 h-4" />}
                <span>{isLoading ? 'Fetching…' : 'Scrape & Ingest'}</span>
              </button>
            </form>
          )}

          {statusMessage && (
            <div className={`mt-4 p-3 rounded-lg text-xs font-mono flex items-center gap-2 border ${
              statusMessage.isError
                ? 'bg-console-rose/10 text-console-rose border-console-rose/25'
                : 'bg-console-emerald/10 text-console-emerald border-console-emerald/25'
            }`}>
              {statusMessage.isError ? <AlertCircle className="w-4 h-4 shrink-0" /> : <CheckCircle2 className="w-4 h-4 shrink-0" />}
              <span>{statusMessage.text}</span>
            </div>
          )}
        </div>

      </div>
    </div>
  );
}
