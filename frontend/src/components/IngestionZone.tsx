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
  const [project, setProject] = useState('Phoenix');
  const [isLoading, setIsLoading] = useState(false);
  const [statusMessage, setStatusMessage] = useState<{ text: string; isError?: boolean } | null>(null);

  if (!isOpen) return null;

  const handleFileUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file) return;
    setIsLoading(true);
    setStatusMessage(null);
    try {
      const res = await ingestFile(file, project);
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
      const res = await ingestText(textTitle.trim(), textContent.trim(), 'text', project);
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
      const res = await ingestUrl(urlInput.trim(), urlTitle.trim() || undefined, project);
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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-900/50 backdrop-blur-xs">
      <div className="w-full max-w-xl bg-white border border-[#E2DDD5] rounded-md shadow-xl overflow-hidden relative corner-ticks">
        
        {/* Modal Header */}
        <div className="flex items-center justify-between p-4 border-b border-[#E2DDD5] bg-[#FAF8F5]">
          <div className="flex items-center space-x-2">
            <span className="w-2 h-2 rounded-full bg-amber-500"></span>
            <h2 className="text-xs font-mono font-bold text-stone-900 uppercase tracking-wider">
              INGEST HISTORICAL ARTIFACT // RECOVERY STUDIO
            </h2>
          </div>
          <button
            onClick={onClose}
            className="text-stone-400 hover:text-stone-700 p-1 rounded"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Tab Selection */}
        <div className="flex border-b border-[#E2DDD5] bg-stone-50 text-xs font-mono">
          <button
            onClick={() => setTab('file')}
            className={`flex-1 py-2.5 px-4 text-center border-r border-[#E2DDD5] flex items-center justify-center space-x-1.5 transition-colors ${
              tab === 'file' ? 'bg-white font-bold text-stone-900 border-b-2 border-b-amber-500' : 'text-stone-500 hover:text-stone-900'
            }`}
          >
            <Upload className="w-3.5 h-3.5" />
            <span>Upload PDF / Image</span>
          </button>
          <button
            onClick={() => setTab('text')}
            className={`flex-1 py-2.5 px-4 text-center border-r border-[#E2DDD5] flex items-center justify-center space-x-1.5 transition-colors ${
              tab === 'text' ? 'bg-white font-bold text-stone-900 border-b-2 border-b-amber-500' : 'text-stone-500 hover:text-stone-900'
            }`}
          >
            <FileText className="w-3.5 h-3.5" />
            <span>Notes / Slack / RFC</span>
          </button>
          <button
            onClick={() => setTab('url')}
            className={`flex-1 py-2.5 px-4 text-center flex items-center justify-center space-x-1.5 transition-colors ${
              tab === 'url' ? 'bg-white font-bold text-stone-900 border-b-2 border-b-amber-500' : 'text-stone-500 hover:text-stone-900'
            }`}
          >
            <Globe className="w-3.5 h-3.5" />
            <span>Web Documentation</span>
          </button>
        </div>

        {/* Body Content */}
        <div className="p-6">
          
          {/* Project Selector */}
          <div className="mb-4">
            <label className="block text-[10px] font-mono uppercase text-stone-500 font-bold tracking-wider mb-1.5">
              PROJECT
            </label>
            <select
              value={project}
              onChange={(e) => setProject(e.target.value)}
              className="w-full px-3 py-2 bg-[#FAF8F5] border border-[#E2DDD5] rounded text-xs font-mono text-stone-900 focus:outline-none focus:border-amber-400"
            >
              <option value="Phoenix">Project Phoenix</option>
              <option value="default">General</option>
            </select>
          </div>
          
          {/* File Tab */}
          {tab === 'file' && (
            <form onSubmit={handleFileUpload} className="space-y-4">
              <div className="border-2 border-dashed border-[#E2DDD5] hover:border-amber-400 rounded-md p-8 text-center bg-[#FAF8F5] transition-colors cursor-pointer relative">
                <input
                  type="file"
                  accept=".pdf,.png,.jpg,.jpeg,.webp,.txt,.md,.json,.csv,.doc,.docx"
                  onChange={(e) => setFile(e.target.files?.[0] || null)}
                  className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
                />
                <Upload className="w-8 h-8 text-stone-400 mx-auto mb-2" />
                <p className="text-xs font-mono font-medium text-stone-700">
                  {file ? file.name : "Click or drag PDF, screenshot, or architecture diagram"}
                </p>
                <p className="text-[11px] font-mono text-stone-400 mt-1">
                  Supports PDF text extraction & Gemini Vision OCR
                </p>
              </div>

              <button
                type="submit"
                disabled={!file || isLoading}
                className="w-full py-2.5 bg-[#1E293B] hover:bg-stone-800 disabled:bg-stone-300 text-white rounded text-xs font-mono font-semibold flex items-center justify-center space-x-2 transition-all shadow-xs"
              >
                {isLoading ? <Loader2 className="w-4 h-4 animate-spin text-amber-300" /> : <Upload className="w-4 h-4 text-amber-300" />}
                <span>{isLoading ? "Ingesting & Extracting Intelligence..." : "Process & Index File"}</span>
              </button>
            </form>
          )}

          {/* Text Tab */}
          {tab === 'text' && (
            <form onSubmit={handleTextUpload} className="space-y-4">
              <div>
                <label className="block text-[11px] font-mono uppercase text-stone-500 mb-1">
                  Document Title / Identifier
                </label>
                <input
                  type="text"
                  value={textTitle}
                  onChange={(e) => setTextTitle(e.target.value)}
                  placeholder="e.g. Architecture Decision Record #14, Slack #deploy log"
                  required
                  className="w-full px-3 py-2 bg-[#FAF8F5] border border-[#E2DDD5] rounded text-xs font-mono text-stone-900 focus:outline-none focus:border-amber-500"
                />
              </div>

              <div>
                <label className="block text-[11px] font-mono uppercase text-stone-500 mb-1">
                  Raw Content / Markdown Notes
                </label>
                <textarea
                  rows={6}
                  value={textContent}
                  onChange={(e) => setTextContent(e.target.value)}
                  placeholder="Paste meeting notes, decision logs, pull request review discussions, or RFC text here..."
                  required
                  className="w-full px-3 py-2 bg-[#FAF8F5] border border-[#E2DDD5] rounded text-xs font-mono text-stone-900 focus:outline-none focus:border-amber-500"
                />
              </div>

              <button
                type="submit"
                disabled={!textTitle.trim() || !textContent.trim() || isLoading}
                className="w-full py-2.5 bg-[#1E293B] hover:bg-stone-800 disabled:bg-stone-300 text-white rounded text-xs font-mono font-semibold flex items-center justify-center space-x-2 transition-all shadow-xs"
              >
                {isLoading ? <Loader2 className="w-4 h-4 animate-spin text-amber-300" /> : <FileText className="w-4 h-4 text-amber-300" />}
                <span>{isLoading ? "Extracting Entities & Milestones..." : "Ingest & Index Note"}</span>
              </button>
            </form>
          )}

          {/* URL Tab */}
          {tab === 'url' && (
            <form onSubmit={handleUrlUpload} className="space-y-4">
              <div>
                <label className="block text-[11px] font-mono uppercase text-stone-500 mb-1">
                  Target Documentation URL
                </label>
                <input
                  type="url"
                  value={urlInput}
                  onChange={(e) => setUrlInput(e.target.value)}
                  placeholder="https://wiki.internal.company.com/architecture/rfc-42"
                  required
                  className="w-full px-3 py-2 bg-[#FAF8F5] border border-[#E2DDD5] rounded text-xs font-mono text-stone-900 focus:outline-none focus:border-amber-500"
                />
              </div>

              <div>
                <label className="block text-[11px] font-mono uppercase text-stone-500 mb-1">
                  Optional Custom Title
                </label>
                <input
                  type="text"
                  value={urlTitle}
                  onChange={(e) => setUrlTitle(e.target.value)}
                  placeholder="Override page title"
                  className="w-full px-3 py-2 bg-[#FAF8F5] border border-[#E2DDD5] rounded text-xs font-mono text-stone-900 focus:outline-none focus:border-amber-500"
                />
              </div>

              <button
                type="submit"
                disabled={!urlInput.trim() || isLoading}
                className="w-full py-2.5 bg-[#1E293B] hover:bg-stone-800 disabled:bg-stone-300 text-white rounded text-xs font-mono font-semibold flex items-center justify-center space-x-2 transition-all shadow-xs"
              >
                {isLoading ? <Loader2 className="w-4 h-4 animate-spin text-amber-300" /> : <Globe className="w-4 h-4 text-amber-300" />}
                <span>{isLoading ? "Fetching & Parsing Web Content..." : "Scrape & Ingest URL"}</span>
              </button>
            </form>
          )}

          {/* Status Message */}
          {statusMessage && (
            <div className={`mt-4 p-3 rounded text-xs font-mono flex items-center space-x-2 ${
              statusMessage.isError ? 'bg-rose-50 text-rose-800 border border-rose-200' : 'bg-emerald-50 text-emerald-800 border border-emerald-200'
            }`}>
              {statusMessage.isError ? <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" /> : <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />}
              <span>{statusMessage.text}</span>
            </div>
          )}

        </div>

      </div>
    </div>
  );
}
