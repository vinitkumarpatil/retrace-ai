'use client';

import React, { useState, useRef, useCallback } from 'react';
import { X, Upload, FileText, Globe, Music, CheckCircle2, AlertCircle, Loader2, Mic } from 'lucide-react';
import { ingestFile, ingestText, ingestUrl, ingestAudio } from '@/lib/api';

interface IngestionZoneProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

type TabType = 'file' | 'audio' | 'text' | 'url';

export default function IngestionZone({ isOpen, onClose, onSuccess }: IngestionZoneProps) {
  const [tab, setTab] = useState<TabType>('file');
  const [file, setFile] = useState<File | null>(null);
  const [audioFile, setAudioFile] = useState<File | null>(null);
  const [audioTitle, setAudioTitle] = useState('');
  const [textTitle, setTextTitle] = useState('');
  const [textContent, setTextContent] = useState('');
  const [urlInput, setUrlInput] = useState('');
  const [urlTitle, setUrlTitle] = useState('');
  const [project, setProject] = useState('Phoenix');
  const [isLoading, setIsLoading] = useState(false);
  const [statusMessage, setStatusMessage] = useState<{ text: string; isError?: boolean } | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const audioInputRef = useRef<HTMLInputElement>(null);

  const [isDragOver, setIsDragOver] = useState(false);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(false);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(false);

    const droppedFiles = e.dataTransfer.files;
    if (droppedFiles.length === 0) return;

    const droppedFile = droppedFiles[0];
    const ext = '.' + droppedFile.name.split('.').pop()?.toLowerCase();

    const audioExts = ['.mp3', '.wav', '.m4a', '.ogg', '.webm', '.flac', '.aac', '.wma', '.opus'];
    if (audioExts.includes(ext)) {
      setAudioFile(droppedFile);
      setTab('audio');
    } else {
      setFile(droppedFile);
      setTab('file');
    }
  }, []);

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

  const handleAudioUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!audioFile) return;
    setIsLoading(true);
    setStatusMessage(null);
    try {
      const res = await ingestAudio(audioFile, project, audioTitle.trim() || undefined);
      setStatusMessage({ text: res.message });
      setAudioFile(null);
      setAudioTitle('');
      setTimeout(() => {
        onSuccess();
        onClose();
      }, 1200);
    } catch (err: any) {
      setStatusMessage({ text: err.message || 'Audio ingestion failed', isError: true });
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

  const tabs: { id: TabType; label: string; icon: React.ReactNode }[] = [
    { id: 'file', label: 'Upload File', icon: <Upload className="w-3.5 h-3.5" /> },
    { id: 'audio', label: 'Audio / Voice', icon: <Music className="w-3.5 h-3.5" /> },
    { id: 'text', label: 'Notes / RFC', icon: <FileText className="w-3.5 h-3.5" /> },
    { id: 'url', label: 'Web URL', icon: <Globe className="w-3.5 h-3.5" /> },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-900/50 backdrop-blur-xs">
      <div
        className="w-full max-w-xl bg-white border border-[#E2DDD5] rounded-md shadow-xl overflow-hidden relative corner-ticks"
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
      >
        
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
          {tabs.map((t, i) => (
            <button
              key={t.id}
              onClick={() => setTab(t.id)}
              className={`flex-1 py-2.5 px-3 text-center flex items-center justify-center space-x-1.5 transition-colors ${
                i < tabs.length - 1 ? 'border-r border-[#E2DDD5]' : ''
              } ${
                tab === t.id ? 'bg-white font-bold text-stone-900 border-b-2 border-b-amber-500' : 'text-stone-500 hover:text-stone-900'
              }`}
            >
              {t.icon}
              <span>{t.label}</span>
            </button>
          ))}
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
                  ref={fileInputRef}
                  type="file"
                  accept=".pdf,.png,.jpg,.jpeg,.webp,.txt,.md,.json,.csv,.doc,.docx,.py,.js,.ts,.html,.css,.xml,.yml,.yaml"
                  onChange={(e) => setFile(e.target.files?.[0] || null)}
                  className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
                />
                <Upload className="w-8 h-8 text-stone-400 mx-auto mb-2" />
                <p className="text-xs font-mono font-medium text-stone-700">
                  {file ? file.name : "Click or drag PDF, screenshot, code, or document"}
                </p>
                <p className="text-[11px] font-mono text-stone-400 mt-1">
                  PDF text extraction, Gemini Vision OCR, text/code parsing
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

          {/* Audio Tab */}
          {tab === 'audio' && (
            <form onSubmit={handleAudioUpload} className="space-y-4">
              <div className="border-2 border-dashed border-[#E2DDD5] hover:border-amber-400 rounded-md p-8 text-center bg-[#FAF8F5] transition-colors cursor-pointer relative">
                <input
                  ref={audioInputRef}
                  type="file"
                  accept=".mp3,.wav,.m4a,.ogg,.webm,.flac,.aac,.wma,.opus,audio/*"
                  onChange={(e) => {
                    const f = e.target.files?.[0] || null;
                    setAudioFile(f);
                  }}
                  className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
                />
                <Mic className="w-8 h-8 text-stone-400 mx-auto mb-2" />
                <p className="text-xs font-mono font-medium text-stone-700">
                  {audioFile ? audioFile.name : "Click or drag an audio file here"}
                </p>
                <p className="text-[11px] font-mono text-stone-400 mt-1">
                  MP3, WAV, M4A, OGG, WebM, FLAC — AI transcription + entity extraction
                </p>
                {audioFile && (
                  <p className="text-[10px] font-mono text-stone-500 mt-2">
                    {(audioFile.size / (1024 * 1024)).toFixed(1)} MB — {audioFile.type || 'audio'}
                  </p>
                )}
              </div>

              <div>
                <label className="block text-[11px] font-mono uppercase text-stone-500 mb-1">
                  Optional Title (auto-generated if empty)
                </label>
                <input
                  type="text"
                  value={audioTitle}
                  onChange={(e) => setAudioTitle(e.target.value)}
                  placeholder="e.g. Sprint Planning Meeting, Architecture Review"
                  className="w-full px-3 py-2 bg-[#FAF8F5] border border-[#E2DDD5] rounded text-xs font-mono text-stone-900 focus:outline-none focus:border-amber-500"
                />
              </div>

              <button
                type="submit"
                disabled={!audioFile || isLoading}
                className="w-full py-2.5 bg-[#1E293B] hover:bg-stone-800 disabled:bg-stone-300 text-white rounded text-xs font-mono font-semibold flex items-center justify-center space-x-2 transition-all shadow-xs"
              >
                {isLoading ? <Loader2 className="w-4 h-4 animate-spin text-amber-300" /> : <Music className="w-4 h-4 text-amber-300" />}
                <span>{isLoading ? "Transcribing & Extracting Intelligence..." : "Transcribe & Ingest Audio"}</span>
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

          {/* Drag-Drop Overlay */}
          {isDragOver && (
            <div className="absolute inset-0 bg-amber-50/90 border-2 border-dashed border-amber-400 flex items-center justify-center z-50 pointer-events-none">
              <div className="text-center">
                <Upload className="w-12 h-12 text-amber-600 mx-auto mb-2 animate-bounce" />
                <p className="text-sm font-mono font-bold text-amber-800">DROP FILE OR AUDIO HERE</p>
              </div>
            </div>
          )}

        </div>

      </div>
    </div>
  );
}
