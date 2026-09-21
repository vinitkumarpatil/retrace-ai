'use client';

import React from 'react';
import { FileText, ExternalLink, Quote, Layers, CheckCircle } from 'lucide-react';
import { Citation } from '@/lib/types';

interface EvidencePanelProps {
  citations: Citation[];
}

export default function EvidencePanel({ citations }: EvidencePanelProps) {
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

        <span className="text-xs font-mono px-2 py-0.5 rounded bg-stone-100 text-stone-800 border border-stone-200">
          {citations.length} SOURCE RECORD{citations.length > 1 ? 'S' : ''}
        </span>
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

              {/* Relevance Note */}
              {citation.relevance && (
                <p className="text-[11px] font-mono text-stone-500 mb-2">
                  CITATION NOTE: {citation.relevance}
                </p>
              )}

              {/* Exact Verbatim Quote */}
              <div className="bg-white p-2.5 rounded border border-[#E2DDD5] text-xs text-stone-700 font-sans italic flex items-start space-x-2">
                <Quote className="w-3.5 h-3.5 text-amber-500 shrink-0 mt-0.5 not-italic" />
                <span className="leading-relaxed">"{citation.quote}"</span>
              </div>
            </div>
          );
        })}
      </div>

    </div>
  );
}
