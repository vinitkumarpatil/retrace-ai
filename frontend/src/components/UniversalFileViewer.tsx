'use client';

import React, { useState, useEffect } from 'react';
import { 
  ArrowLeft, 
  Download, 
  X, 
  FileText, 
  Image as ImageIcon, 
  Film, 
  Headphones, 
  Code, 
  ZoomIn, 
  ZoomOut, 
  RotateCcw, 
  Copy, 
  Check, 
  ExternalLink,
  Layers,
  FileQuestion
} from 'lucide-react';
import { SourceType } from '@/lib/types';
import { getDocumentFileUrl } from '@/lib/api';

interface UniversalFileViewerProps {
  documentId?: string;
  title: string;
  sourceType: string;
  fileUrl?: string;
  rawContent?: string;
  quote?: string;
  onClose: () => void;
}

export default function UniversalFileViewer({
  documentId,
  title,
  sourceType,
  fileUrl,
  rawContent,
  quote,
  onClose,
}: UniversalFileViewerProps) {
  const [zoomLevel, setZoomLevel] = useState<number>(1);
  const [copied, setCopied] = useState<boolean>(false);
  const [viewMode, setViewMode] = useState<'preview' | 'text'>('preview');

  // Resolved file streaming URL
  const resolvedUrl = fileUrl || (documentId ? getDocumentFileUrl(documentId) : '');

  // Normalize format
  const normType = sourceType.toLowerCase();

  // Escape key listener for quick back navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  const handleCopyText = () => {
    if (rawContent) {
      navigator.clipboard.writeText(rawContent);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const getFormatBadge = (type: string) => {
    switch (type) {
      case 'pdf': return { label: 'PDF DOCUMENT', color: 'bg-rose-100 text-rose-800 border-rose-300' };
      case 'image': return { label: 'IMAGE ARTIFACT', color: 'bg-purple-100 text-purple-800 border-purple-300' };
      case 'video': return { label: 'VIDEO RECORDING', color: 'bg-sky-100 text-sky-800 border-sky-300' };
      case 'audio': return { label: 'AUDIO RECORDING', color: 'bg-emerald-100 text-emerald-800 border-emerald-300' };
      case 'code':
      case 'json': return { label: 'CODE / DATA', color: 'bg-amber-100 text-amber-800 border-amber-300' };
      default: return { label: 'TEXT ARCHIVE', color: 'bg-stone-100 text-stone-800 border-stone-300' };
    }
  };

  const formatBadge = getFormatBadge(normType);

  return (
    <div className="fixed inset-0 z-50 flex flex-col bg-stone-900/80 backdrop-blur-md">
      
      {/* Top Drafting Control Bar */}
      <header className="h-16 px-4 sm:px-6 bg-[#FAF8F5] border-b border-[#E2DDD5] flex items-center justify-between shadow-xs">
        
        {/* Left: Back Button & Title */}
        <div className="flex items-center space-x-4">
          <button
            onClick={onClose}
            className="px-3.5 py-1.5 bg-[#1E293B] hover:bg-stone-800 text-white rounded text-xs font-mono font-semibold flex items-center space-x-2 transition-all shadow-xs group"
            title="Return to Query Results & Timeline (Esc)"
          >
            <ArrowLeft className="w-4 h-4 text-amber-400 group-hover:-translate-x-0.5 transition-transform" />
            <span>Back to Results</span>
          </button>

          <span className="text-stone-300 hidden sm:inline">|</span>

          <div>
            <div className="flex items-center space-x-2">
              <h2 className="text-sm font-bold text-stone-900 truncate max-w-md font-sans">
                {title}
              </h2>
              <span className={`text-[10px] font-mono uppercase px-2 py-0.5 rounded border font-semibold ${formatBadge.color}`}>
                {formatBadge.label}
              </span>
            </div>
            <p className="text-[11px] font-mono text-stone-500">
              UNIVERSAL EVIDENCE VIEWER // SPEC-VIEW-01
            </p>
          </div>
        </div>

        {/* Right: Controls & Actions */}
        <div className="flex items-center space-x-2">
          {rawContent && normType !== 'text' && normType !== 'code' && normType !== 'json' && (
            <div className="flex items-center bg-stone-100 p-0.5 rounded border border-stone-200 text-xs font-mono mr-2">
              <button
                onClick={() => setViewMode('preview')}
                className={`px-2.5 py-1 rounded transition-colors ${viewMode === 'preview' ? 'bg-white font-bold text-stone-900 shadow-2xs' : 'text-stone-600'}`}
              >
                Media View
              </button>
              <button
                onClick={() => setViewMode('text')}
                className={`px-2.5 py-1 rounded transition-colors ${viewMode === 'text' ? 'bg-white font-bold text-stone-900 shadow-2xs' : 'text-stone-600'}`}
              >
                Extracted Text
              </button>
            </div>
          )}

          {resolvedUrl && (
            <a
              href={resolvedUrl}
              download={title}
              target="_blank"
              rel="noopener noreferrer"
              className="px-3 py-1.5 text-xs font-mono text-stone-700 bg-white hover:bg-stone-50 border border-[#E2DDD5] rounded flex items-center space-x-1.5 transition-colors shadow-2xs"
              title="Download or open original file in new tab"
            >
              <Download className="w-3.5 h-3.5 text-stone-500" />
              <span className="hidden sm:inline">Download</span>
            </a>
          )}

          <button
            onClick={onClose}
            className="p-1.5 text-stone-400 hover:text-stone-700 rounded hover:bg-stone-100"
            title="Close Viewer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

      </header>

      {/* Main Content Area */}
      <main className="flex-1 overflow-auto p-4 sm:p-6 flex items-center justify-center bg-[#FAF8F5]/95">
        <div className="w-full max-w-6xl h-full flex flex-col bg-white rounded-md border border-[#E2DDD5] shadow-xl overflow-hidden relative corner-ticks">
          
          {/* Subheader: Quoted Evidence Excerpt (if opened from citation) */}
          {quote && (
            <div className="p-3 bg-amber-50/80 border-b border-amber-200/80 text-xs font-mono text-stone-700 flex items-start space-x-2">
              <span className="font-bold text-amber-800 uppercase shrink-0 mt-0.5">
                CITED EVIDENCE EXCERPT:
              </span>
              <p className="italic text-stone-800 font-sans">
                "{quote}"
              </p>
            </div>
          )}

          {/* Viewer Container */}
          <div className="flex-1 overflow-auto relative p-4 flex flex-col items-center justify-center">

            {/* Mode 1: Extracted Text View (Available for any file type) */}
            {viewMode === 'text' && rawContent ? (
              <div className="w-full h-full flex flex-col">
                <div className="flex items-center justify-between pb-2 mb-2 border-b border-stone-200 text-xs font-mono text-stone-500">
                  <span>FORENSIC TRANSCRIPTION / EXTRACTED CONTENT</span>
                  <button
                    onClick={handleCopyText}
                    className="flex items-center space-x-1 hover:text-stone-800"
                  >
                    {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{copied ? 'Copied!' : 'Copy Text'}</span>
                  </button>
                </div>
                <pre className="flex-1 overflow-auto p-4 bg-[#FAF8F5] rounded border border-stone-200 text-xs font-mono text-stone-800 whitespace-pre-wrap leading-relaxed select-text">
                  {rawContent}
                </pre>
              </div>
            ) : (

              /* Mode 2: Media-Specific Viewer */
              <>
                {/* --- 1. PDF Viewer --- */}
                {normType === 'pdf' && (
                  <div className="w-full h-full flex flex-col">
                    <iframe
                      src={resolvedUrl}
                      title={title}
                      className="w-full flex-1 rounded border border-[#E2DDD5] bg-stone-100"
                    />
                  </div>
                )}

                {/* --- 2. Image Viewer with Zoom --- */}
                {normType === 'image' && (
                  <div className="w-full h-full flex flex-col items-center justify-center overflow-auto relative">
                    {/* Zoom Toolbar */}
                    <div className="absolute top-3 right-3 z-10 flex items-center space-x-1 bg-white/90 backdrop-blur p-1 rounded border border-stone-200 shadow-sm text-xs font-mono">
                      <button
                        onClick={() => setZoomLevel(prev => Math.min(prev + 0.25, 3))}
                        className="p-1 hover:bg-stone-100 rounded text-stone-700"
                        title="Zoom In"
                      >
                        <ZoomIn className="w-4 h-4" />
                      </button>
                      <span className="px-1 text-[11px] text-stone-600">{Math.round(zoomLevel * 100)}%</span>
                      <button
                        onClick={() => setZoomLevel(prev => Math.max(prev - 0.25, 0.5))}
                        className="p-1 hover:bg-stone-100 rounded text-stone-700"
                        title="Zoom Out"
                      >
                        <ZoomOut className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => setZoomLevel(1)}
                        className="p-1 hover:bg-stone-100 rounded text-stone-700"
                        title="Reset Zoom"
                      >
                        <RotateCcw className="w-4 h-4" />
                      </button>
                    </div>

                    <div className="overflow-auto max-h-[75vh] max-w-full p-4 flex items-center justify-center">
                      <img
                        src={resolvedUrl}
                        alt={title}
                        style={{ transform: `scale(${zoomLevel})`, transformOrigin: 'center center' }}
                        className="max-h-[70vh] object-contain rounded transition-transform duration-150 shadow-md"
                      />
                    </div>
                  </div>
                )}

                {/* --- 3. HTML5 Video Player --- */}
                {normType === 'video' && (
                  <div className="w-full h-full flex flex-col items-center justify-center p-4">
                    <video
                      src={resolvedUrl}
                      controls
                      playsInline
                      className="max-h-[68vh] w-auto max-w-full rounded border border-stone-800 bg-black shadow-lg"
                    >
                      Your browser does not support HTML5 video streaming.
                    </video>
                    <p className="mt-3 text-xs font-mono text-stone-500">
                      HTML5 VIDEO STREAM // CONTROLS & TIMELINE ENABLED
                    </p>
                  </div>
                )}

                {/* --- 4. HTML5 Audio Player --- */}
                {normType === 'audio' && (
                  <div className="w-full max-w-xl my-auto p-8 rounded-lg bg-[#FAF8F5] border border-[#E2DDD5] text-center space-y-4">
                    <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center mx-auto shadow-inner">
                      <Headphones className="w-8 h-8" />
                    </div>
                    <div>
                      <h3 className="text-sm font-bold text-stone-900 font-mono">{title}</h3>
                      <p className="text-xs font-mono text-stone-500 mt-1">Audio Evidence Stream</p>
                    </div>
                    <audio
                      src={resolvedUrl}
                      controls
                      className="w-full mt-4"
                    >
                      Your browser does not support HTML5 audio playback.
                    </audio>
                    {rawContent && (
                      <div className="text-left mt-4 pt-4 border-t border-stone-200">
                        <span className="text-[10px] font-mono uppercase text-stone-400 block mb-1">
                          Audio Description / Context:
                        </span>
                        <p className="text-xs text-stone-700 font-sans leading-relaxed">
                          {rawContent}
                        </p>
                      </div>
                    )}
                  </div>
                )}

                {/* --- 5. Code & Text Viewer with Syntax/Line Numbers --- */}
                {(normType === 'code' || normType === 'json' || normType === 'text') && (
                  <div className="w-full h-full flex flex-col">
                    <div className="flex items-center justify-between pb-2 mb-2 border-b border-stone-200 text-xs font-mono text-stone-500">
                      <span>MONOSPACED CODE / TEXT VIEWER ({normType.toUpperCase()})</span>
                      <button
                        onClick={handleCopyText}
                        className="flex items-center space-x-1 hover:text-stone-800"
                      >
                        {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                        <span>{copied ? 'Copied' : 'Copy'}</span>
                      </button>
                    </div>

                    <div className="flex-1 overflow-auto rounded border border-stone-200 bg-[#1E293B] text-slate-100 p-4 font-mono text-xs leading-relaxed">
                      <table className="w-full border-collapse">
                        <tbody>
                          {(rawContent || '').split('\n').map((line, idx) => (
                            <tr key={idx} className="hover:bg-slate-800/60">
                              <td className="pr-4 text-right select-none text-slate-500 w-10 text-[11px] align-top">
                                {idx + 1}
                              </td>
                              <td className="whitespace-pre-wrap break-all text-slate-200">
                                {line || ' '}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}

                {/* --- 6. Unsupported / Fallback --- */}
                {normType !== 'pdf' && normType !== 'image' && normType !== 'video' && normType !== 'audio' && normType !== 'code' && normType !== 'json' && normType !== 'text' && (
                  <div className="text-center p-8 max-w-md my-auto space-y-3">
                    <div className="w-14 h-14 rounded-full bg-stone-100 text-stone-500 flex items-center justify-center mx-auto">
                      <FileQuestion className="w-8 h-8" />
                    </div>
                    <h3 className="text-sm font-bold text-stone-900 font-mono">{title}</h3>
                    <p className="text-xs font-mono text-stone-500">
                      Inline browser viewer is not supported for this file format ({sourceType}).
                    </p>
                    {resolvedUrl && (
                      <a
                        href={resolvedUrl}
                        download={title}
                        className="inline-flex items-center space-x-2 px-4 py-2 bg-[#1E293B] text-white rounded text-xs font-mono font-semibold hover:bg-stone-800 transition-colors shadow-xs"
                      >
                        <Download className="w-4 h-4 text-amber-300" />
                        <span>Download Original File</span>
                      </a>
                    )}
                  </div>
                )}
              </>
            )}

          </div>

          {/* Footer Back Bar */}
          <div className="p-3 bg-[#FAF8F5] border-t border-[#E2DDD5] flex items-center justify-between text-xs font-mono text-stone-500">
            <button
              onClick={onClose}
              className="text-stone-700 hover:text-stone-900 flex items-center space-x-1 font-semibold"
            >
              <ArrowLeft className="w-3.5 h-3.5 text-amber-500" />
              <span>Back to Query Timeline</span>
            </button>
            <span className="text-[11px] text-stone-400">
              Press [ESC] to return at any time
            </span>
          </div>

        </div>
      </main>

    </div>
  );
}
