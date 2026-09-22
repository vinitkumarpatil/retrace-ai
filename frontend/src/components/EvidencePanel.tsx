'use client';

import React from 'react';
import { FileText, ExternalLink, Quote, Layers, CheckCircle, FolderOpen, Globe } from 'lucide-react';
import { Citation } from '@/lib/types';

interface EvidencePanelProps {
  citations: Citation[];
  backendOnly?: boolean;
}

export default function EvidencePanel({ citations, backendOnly }: EvidencePanelProps) {
  if (!citations || citations.length === 0) {
    return null;
  }

  const getSourceBadge = (type: string) => {
    switch (type.toLowerCase()) {
      case 'pdf':
        return 'bg-rose-50 text-rose-700 border-rose-200';
      case 'image':
        return 'bg-purple-50 text-purple-700 border-purple-200';
      case 'url':
        return 'bg-sky-50 text-sky-700 border-sky-200';
      default:
        return 'bg-amber-50 text-amber-700 border-amber-200';
    }
  };

  return (
    <div className="drafting-card rounded-md border border-[#E2DDD5] bg-white p-6 relative corner-ticks shadow-xs">
      
      {/* Header */}
      <div className="flex items-center justify-between pb-4 mb-4 border-b border-[#E2DDD5]">
        <div className="flex items-center space-x-2">
          <div className="p-1.5 bg-stone-100 rounded text-stone-700">
            <Layers className="w-4 h-4 text-stone-700" />
          </div>
          <div>
            <h3 className="text-xs font-mono font-bold text-stone-900 uppercase tracking-wider">
              PRIMARY EVIDENCE & SOURCE CITATIONS
            </h3>
            <p className="text-[11px] font-mono text-stone-500">
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
              {backendOnly ? 'BACKEND SEARCH' : 'AI REASONING'}
            </span>
          )}
          <span className="text-xs font-mono px-2 py-0.5 rounded bg-stone-100 text-stone-800 border border-stone-200">
            {citations.length} SOURCE RECORD{citations.length > 1 ? 'S' : ''}
          </span>
        </div>
      </div>

      {/* Citations List */}
      <div className="space-y-3">
        {citations.map((citation, idx) => {
          const badgeClass = getSourceBadge(citation.source_type);

          return (
            <div
              key={idx}
              className="p-3.5 rounded bg-[#FAF8F5] border border-[#E2DDD5] hover:border-stone-400 transition-colors"
            >
              <div className="flex items-center justify-between gap-2 mb-1.5">
                <div className="flex items-center space-x-2">
                  <FileText className="w-4 h-4 text-stone-500 shrink-0" />
                  <span className="text-xs font-bold text-stone-900 font-mono">
                    {citation.document_title}
                  </span>
                </div>
                <span className={`text-[10px] font-mono uppercase px-2 py-0.5 rounded border font-semibold ${badgeClass}`}>
                  {citation.source_type}
                </span>
              </div>

              {/* Source Path/URL */}
              {(citation.path || citation.url) && (
                <div className="flex items-center gap-2 mb-2 text-[11px] font-mono text-stone-500">
                  {citation.path && (
                    <span className="flex items-center gap-1">
                      <FolderOpen className="w-3 h-3" />
                      <span className="truncate max-w-[200px]">{citation.path}</span>
                    </span>
                  )}
                  {citation.url && (
                    <a
                      href={citation.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-1 text-sky-600 hover:text-sky-800 hover:underline"
                    >
                      <Globe className="w-3 h-3" />
                      <span className="truncate max-w-[200px]">{citation.url}</span>
                      <ExternalLink className="w-2.5 h-2.5" />
                    </a>
                  )}
                  {citation.score !== undefined && (
                    <span className="ml-auto text-stone-400">
                      Score: {citation.score.toFixed(3)}
                    </span>
                  )}
                </div>
              )}

              {/* Relevance Note */}
              {citation.relevance && (
                <p className="text-[11px] font-mono text-stone-500 mb-2">
                  CITATION NOTE: {citation.relevance}
                </p>
              )}

              {/* Exact Verbatim Quote */}
              <div className="bg-white p-2.5 rounded border border-[#E2DDD5] text-xs text-stone-700 font-sans italic flex items-start space-x-2">
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
