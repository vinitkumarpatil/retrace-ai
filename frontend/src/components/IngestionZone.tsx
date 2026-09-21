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
  FileCode,
  FileCheck
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

  // Handle ESC key to dismiss
  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
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
      setTimeout(() => {
        onSuccess();
        onClose();
      }, 1200);
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
      setTimeout(() => {
        onSuccess();
        onClose();
      }, 1200);
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
      setTimeout(() => {
        onSuccess();
        onClose();
      }, 1200);
    } catch (err: any) {
      setStatusMessage({ text: err.message || 'URL ingestion failed', isError: true });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 dark:bg-black/70 backdrop-blur-xs transition-opacity"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
      role="dialog"
      aria-modal="true"
      aria-labelledby="ingest-dialog-title"
    >
      <div className="w-full max-w-xl bg-white dark:bg-[#0F172A] border border-slate-200 dark:border-slate-800 rounded-2xl shadow-floating overflow-hidden relative transition-all">
        
        {/* Modal Header */}
        <div className="flex items-center justify-between p-5 border-b border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-[#090D16]/50">
          <div>
            <h2 id="ingest-dialog-title" className="text-sm font-semibold text-slate-900 dark:text-white tracking-tight">
              Ingest Context Artifact
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Index PDFs, architectural notes, design decisions, or documentation
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            aria-label="Close dialog"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Tab Selection */}
        <div className="flex border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-[#090D16] text-xs font-medium">
          <button
            onClick={() => setTab('file')}
            className={`flex-1 py-3 px-4 text-center flex items-center justify-center space-x-2 transition-colors ${
              tab === 'file'
                ? 'bg-white dark:bg-[#0F172A] text-indigo-600 dark:text-indigo-400 font-semibold border-b-2 border-b-indigo-600'
                : 'text-slate-500 hover:text-slate-900 dark:hover:text-slate-300'
            }`}
          >
            <Upload className="w-4 h-4" />
            <span>Document / Image</span>
          </button>
          <button
            onClick={() => setTab('text')}
            className={`flex-1 py-3 px-4 text-center flex items-center justify-center space-x-2 transition-colors ${
              tab === 'text'
                ? 'bg-white dark:bg-[#0F172A] text-indigo-600 dark:text-indigo-400 font-semibold border-b-2 border-b-indigo-600'
                : 'text-slate-500 hover:text-slate-900 dark:hover:text-slate-300'
            }`}
          >
            <FileText className="w-4 h-4" />
            <span>Markdown / Notes</span>
          </button>
          <button
            onClick={() => setTab('url')}
            className={`flex-1 py-3 px-4 text-center flex items-center justify-center space-x-2 transition-colors ${
              tab === 'url'
                ? 'bg-white dark:bg-[#0F172A] text-indigo-600 dark:text-indigo-400 font-semibold border-b-2 border-b-indigo-600'
                : 'text-slate-500 hover:text-slate-900 dark:hover:text-slate-300'
            }`}
          >
            <Globe className="w-4 h-4" />
            <span>Web URL</span>
          </button>
        </div>

        {/* Tab Body */}
        <div className="p-6">
          
          {/* File Tab */}
          {tab === 'file' && (
            <form onSubmit={handleFileUpload} className="space-y-4">
              <div 
                onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
                onDragLeave={() => setIsDragging(false)}
                onDrop={(e) => {
                  e.preventDefault();
                  setIsDragging(false);
                  if (e.dataTransfer.files?.[0]) setFile(e.dataTransfer.files[0]);
                }}
                className={`border-2 border-dashed rounded-xl p-8 text-center transition-all cursor-pointer relative ${
                  isDragging 
                    ? 'border-indigo-500 bg-indigo-50/50 dark:bg-indigo-950/20' 
                    : file 
                      ? 'border-emerald-500 bg-emerald-50/30 dark:bg-emerald-950/20'
                      : 'border-slate-200 dark:border-slate-800 hover:border-indigo-400 dark:hover:border-indigo-600 bg-slate-50/50 dark:bg-[#0B0F19]'
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
                    <FileCheck className="w-10 h-10 text-emerald-600 dark:text-emerald-400 mb-2" />
                    <p className="text-sm font-semibold text-slate-900 dark:text-white truncate max-w-sm">
                      {file.name}
                    </p>
                    <p className="text-xs text-slate-500 mt-0.5">
                      {(file.size / 1024).toFixed(1)} KB • Click or drop another to replace
                    </p>
                  </div>
                ) : (
                  <div className="flex flex-col items-center">
                    <Upload className="w-10 h-10 text-slate-400 dark:text-slate-500 mb-2" />
                    <p className="text-sm font-medium text-slate-800 dark:text-slate-200">
                      Drop PDF, architecture screenshot, or diagram here
                    </p>
                    <p className="text-xs text-slate-400 dark:text-slate-500 mt-1">
                      Supports PDF text chunking & Gemini Vision multimodal OCR
                    </p>
                  </div>
                )}
              </div>

              <button
                type="submit"
                disabled={!file || isLoading}
                className="w-full py-3 bg-indigo-600 hover:bg-indigo-500 disabled:bg-slate-200 dark:disabled:bg-slate-800 disabled:text-slate-400 text-white rounded-xl text-xs font-semibold flex items-center justify-center space-x-2 transition-all shadow-xs"
              >
                {isLoading ? <Loader2 className="w-4 h-4 animate-spin text-white" /> : <Upload className="w-4 h-4 text-white" />}
                <span>{isLoading ? "Ingesting & Analyzing Entities..." : "Index Artifact"}</span>
              </button>
            </form>
          )}

          {/* Text Notes Tab */}
          {tab === 'text' && (
            <form onSubmit={handleTextUpload} className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1.5">
                  Document Title or Identifier
                </label>
                <input
                  type="text"
                  value={textTitle}
                  onChange={(e) => setTextTitle(e.target.value)}
                  placeholder="e.g. ADR-014 PostgreSQL Migration Rationale, Slack #deploy incident log"
                  required
                  className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-[#0B0F19] border border-slate-200 dark:border-slate-800 rounded-xl text-xs text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1.5">
                  Content / Markdown Notes
                </label>
                <textarea
                  rows={6}
                  value={textContent}
                  onChange={(e) => setTextContent(e.target.value)}
                  placeholder="Paste meeting decisions, Slack debate transcripts, architecture review notes, or RFC text here..."
                  required
                  className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-[#0B0F19] border border-slate-200 dark:border-slate-800 rounded-xl text-xs text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 font-sans"
                />
              </div>

              <button
                type="submit"
                disabled={!textTitle.trim() || !textContent.trim() || isLoading}
                className="w-full py-3 bg-indigo-600 hover:bg-indigo-500 disabled:bg-slate-200 dark:disabled:bg-slate-800 disabled:text-slate-400 text-white rounded-xl text-xs font-semibold flex items-center justify-center space-x-2 transition-all shadow-xs"
              >
                {isLoading ? <Loader2 className="w-4 h-4 animate-spin text-white" /> : <FileText className="w-4 h-4 text-white" />}
                <span>{isLoading ? "Extracting Entities & Decisions..." : "Index Notes"}</span>
              </button>
            </form>
          )}

          {/* URL Tab */}
          {tab === 'url' && (
            <form onSubmit={handleUrlUpload} className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1.5">
                  Documentation / Wiki URL
                </label>
                <input
                  type="url"
                  value={urlInput}
                  onChange={(e) => setUrlInput(e.target.value)}
                  placeholder="https://docs.company.internal/architecture/database-redesign"
                  required
                  className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-[#0B0F19] border border-slate-200 dark:border-slate-800 rounded-xl text-xs text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1.5">
                  Optional Title Override
                </label>
                <input
                  type="text"
                  value={urlTitle}
                  onChange={(e) => setUrlTitle(e.target.value)}
                  placeholder="Leave empty to use parsed HTML page title"
                  className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-[#0B0F19] border border-slate-200 dark:border-slate-800 rounded-xl text-xs text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                />
              </div>

              <button
                type="submit"
                disabled={!urlInput.trim() || isLoading}
                className="w-full py-3 bg-indigo-600 hover:bg-indigo-500 disabled:bg-slate-200 dark:disabled:bg-slate-800 disabled:text-slate-400 text-white rounded-xl text-xs font-semibold flex items-center justify-center space-x-2 transition-all shadow-xs"
              >
                {isLoading ? <Loader2 className="w-4 h-4 animate-spin text-white" /> : <Globe className="w-4 h-4 text-white" />}
                <span>{isLoading ? "Fetching & Indexing URL Content..." : "Scrape & Index URL"}</span>
              </button>
            </form>
          )}

          {/* Status Message */}
          {statusMessage && (
            <div className={`mt-4 p-3.5 rounded-xl text-xs flex items-center space-x-2.5 ${
              statusMessage.isError
                ? 'bg-rose-50 dark:bg-rose-950/50 text-rose-800 dark:text-rose-300 border border-rose-200 dark:border-rose-900'
                : 'bg-emerald-50 dark:bg-emerald-950/50 text-emerald-800 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-900'
            }`}>
              {statusMessage.isError ? (
                <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
              ) : (
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              )}
              <span className="font-medium">{statusMessage.text}</span>
            </div>
          )}

        </div>

      </div>
    </div>
  );
}
