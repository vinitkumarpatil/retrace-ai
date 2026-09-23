'use client';

import React, { useState } from 'react';
import { FileText, ExternalLink, Quote, Layers, FolderOpen, Globe, Copy, Check, Image as ImageIcon } from 'lucide-react';
import { Citation } from '@/lib/types';

interface EvidencePanelProps {
  citations: Citation[];
  backendOnly?: boolean;
}

// Detect if running on Android
function isAndroid(): boolean {
  if (typeof navigator === 'undefined') return false;
  return /Android/i.test(navigator.userAgent);
}

// Detect if this file type can be opened in browser via file:// url
function canOpenInBrowser(path: string): boolean {
  const ext = path.split('.').pop()?.toLowerCase() || '';
  return ['pdf', 'html', 'htm', 'txt', 'md', 'png', 'jpg', 'jpeg', 'gif', 'webp', 'svg', 'mp4', 'webm', 'mp3', 'wav'].includes(ext);
}

// Detect if it's an image
function isImageFile(path: string): boolean {
  const ext = path.split('.').pop()?.toLowerCase() || '';
  return ['png', 'jpg', 'jpeg', 'gif', 'webp', 'svg', 'bmp', 'ico'].includes(ext);
}

// Build a file:// URL from a path (Windows or Unix)
function toFileUrl(path: string): string {
  // Normalize backslashes to forward slashes
  const normalized = path.replace(/\\/g, '/');
  // Add leading slash if Windows absolute path (e.g. C:/...)
  if (/^[A-Za-z]:\//.test(normalized)) {
    return `file:///${normalized}`;
  }
  return `file://${normalized}`;
}

function CopyPathButton({ path }: { path: string }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(path);
      setCopied(true);
      setTimeout(() => setCopied(false), 1800);
    } catch {
      // Fallback: create a temporary textarea
      const el = document.createElement('textarea');
      el.value = path;
      document.body.appendChild(el);
      el.select();
      document.execCommand('copy');
      document.body.removeChild(el);
      setCopied(true);
      setTimeout(() => setCopied(false), 1800);
    }
  };

  return (
    <button
      onClick={handleCopy}
      className="path-copy-btn group"
      title={`Copy path: ${path}`}
    >
      <span className="truncate max-w-[220px] sm:max-w-[300px]">{path}</span>
      {copied ? (
        <Check className="w-3 h-3 text-emerald-500 shrink-0" />
      ) : (
        <Copy className="w-3 h-3 shrink-0 opacity-60 group-hover:opacity-100" />
      )}
    </button>
  );
}

export default function EvidencePanel({ citations, backendOnly }: EvidencePanelProps) {
  const android = isAndroid();

  if (!citations || citations.length === 0) {
    return null;
  }

  const getSourceBadge = (type: string) => {
    switch (type.toLowerCase()) {
      case 'pdf':   return 'bg-rose-50 text-rose-700 border-rose-200';
      case 'image': return 'bg-purple-50 text-purple-700 border-purple-200';
      case 'url':   return 'bg-sky-50 text-sky-700 border-sky-200';
      case 'local': return 'bg-emerald-50 text-emerald-700 border-emerald-200';
      default:      return 'bg-amber-50 text-amber-700 border-amber-200';
    }
  };

  return (
    <div className="drafting-card rounded-md border p-6 relative corner-ticks shadow-xs" style={{ backgroundColor: 'var(--card-bg)', borderColor: 'var(--border-blueprint)' }}>

      {/* Header */}
      <div className="flex items-center justify-between pb-4 mb-4 border-b" style={{ borderColor: 'var(--border-blueprint)' }}>
        <div className="flex items-center space-x-2">
          <div className="p-1.5 rounded" style={{ backgroundColor: 'var(--input-bg)' }}>
            <Layers className="w-4 h-4" style={{ color: 'var(--ink-primary)' }} />
          </div>
          <div>
            <h3 className="text-xs font-mono font-bold uppercase tracking-wider" style={{ color: 'var(--ink-primary)' }}>
              PRIMARY EVIDENCE &amp; SOURCE CITATIONS
            </h3>
            <p className="text-[11px] font-mono" style={{ color: 'var(--ink-secondary)' }}>
              ORIGINAL DOCUMENTS BACKING EVERY EXTRACTED CLAIM
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {backendOnly !== undefined && (
            <span className={`text-[10px] font-mono px-2 py-0.5 rounded border font-semibold ${
              backendOnly
                ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                : 'bg-violet-50 text-violet-700 border-violet-200'
            }`}>
              {backendOnly ? 'LOCAL SEARCH' : 'AI REASONING'}
            </span>
          )}
          <span className="text-xs font-mono px-2 py-0.5 rounded border" style={{ backgroundColor: 'var(--input-bg)', borderColor: 'var(--border-blueprint)', color: 'var(--ink-primary)' }}>
            {citations.length} SOURCE RECORD{citations.length > 1 ? 'S' : ''}
          </span>
        </div>
      </div>

      {/* Citations List */}
      <div className="space-y-3">
        {citations.map((citation, idx) => {
          const badgeClass = getSourceBadge(citation.source_type);
          // Prefer absolutePath, fall back to path
          const filePath = citation.absolutePath || citation.path;
          const fileUrl = filePath ? toFileUrl(filePath) : null;
          const showFileLink = !android && filePath && canOpenInBrowser(filePath);
          const showImage = filePath && isImageFile(filePath);

          return (
            <div
              key={idx}
              className="p-3.5 rounded border transition-colors"
              style={{ backgroundColor: 'var(--input-bg)', borderColor: 'var(--border-blueprint)' }}
            >
              {/* Title row */}
              <div className="flex items-center justify-between gap-2 mb-2">
                <div className="flex items-center space-x-2 min-w-0">
                  {showImage ? (
                    <ImageIcon className="w-4 h-4 text-purple-500 shrink-0" />
                  ) : (
                    <FileText className="w-4 h-4 shrink-0" style={{ color: 'var(--ink-secondary)' }} />
                  )}
                  {/* Clickable file title if openable */}
                  {showFileLink && fileUrl ? (
                    <a
                      href={fileUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-xs font-bold font-mono truncate text-sky-600 hover:text-sky-800 hover:underline flex items-center gap-1"
                      title={`Open: ${filePath}`}
                    >
                      {citation.document_title}
                      <ExternalLink className="w-3 h-3 shrink-0" />
                    </a>
                  ) : (
                    <span className="text-xs font-bold font-mono truncate" style={{ color: 'var(--ink-primary)' }}>
                      {citation.document_title}
                    </span>
                  )}
                </div>
                <span className={`text-[10px] font-mono uppercase px-2 py-0.5 rounded border font-semibold shrink-0 ${badgeClass}`}>
                  {citation.source_type}
                </span>
              </div>

              {/* Image preview */}
              {showImage && filePath && (
                <div className="mb-2 rounded overflow-hidden border" style={{ borderColor: 'var(--border-blueprint)' }}>
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={toFileUrl(filePath)}
                    alt={citation.document_title}
                    className="max-h-48 w-auto object-contain bg-stone-50"
                    onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }}
                  />
                </div>
              )}

              {/* Path / URL row */}
              {(filePath || citation.url) && (
                <div className="flex flex-wrap items-center gap-2 mb-2">
                  {/* Copy-pasteable path */}
                  {filePath && (
                    <div className="flex items-center gap-1.5 min-w-0">
                      <FolderOpen className="w-3 h-3 shrink-0" style={{ color: 'var(--ink-secondary)' }} />
                      <CopyPathButton path={filePath} />
                    </div>
                  )}

                  {/* Open in browser link (PC only) */}
                  {showFileLink && fileUrl && (
                    <a
                      href={fileUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-mono border text-sky-600 border-sky-200 bg-sky-50 hover:bg-sky-100 transition-colors"
                      title="Open file in browser"
                    >
                      <ExternalLink className="w-2.5 h-2.5" />
                      Open File
                    </a>
                  )}

                  {/* URL link */}
                  {citation.url && (
                    <a
                      href={citation.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-1 text-[11px] font-mono text-sky-600 hover:text-sky-800 hover:underline"
                    >
                      <Globe className="w-3 h-3" />
                      <span className="truncate max-w-[200px]">{citation.url}</span>
                      <ExternalLink className="w-2.5 h-2.5" />
                    </a>
                  )}

                  {/* Score */}
                  {citation.score !== undefined && (
                    <span className="ml-auto text-[10px] font-mono" style={{ color: 'var(--ink-secondary)' }}>
                      Score: {citation.score.toFixed(3)}
                    </span>
                  )}
                </div>
              )}

              {/* Android note for file paths */}
              {android && filePath && (
                <p className="text-[10px] font-mono text-amber-600 mb-1">
                  📱 Tap copy to get the path — direct file open is not supported on Android browsers.
                </p>
              )}

              {/* Relevance note */}
              {citation.relevance && (
                <p className="text-[11px] font-mono mb-2" style={{ color: 'var(--ink-secondary)' }}>
                  CITATION NOTE: {citation.relevance}
                </p>
              )}

              {/* Verbatim quote */}
              <div className="p-2.5 rounded border text-xs font-sans italic flex items-start space-x-2" style={{ backgroundColor: 'var(--card-bg)', borderColor: 'var(--border-blueprint)', color: 'var(--ink-primary)' }}>
                <Quote className="w-3.5 h-3.5 text-amber-500 shrink-0 mt-0.5 not-italic" />
                <span className="leading-relaxed">&quot;{citation.quote}&quot;</span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
