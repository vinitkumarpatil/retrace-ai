'use client';

import React, { useState } from 'react';
import { FileText, Quote, Layers, Copy, Check, ExternalLink, Search } from 'lucide-react';
import { Citation } from '@/lib/types';

interface EvidencePanelProps {
  citations: Citation[];
  selectedEntityId?: string | null;
}

export default function EvidencePanel({ citations, selectedEntityId }: EvidencePanelProps) {
  const [copiedIdx, setCopiedIdx] = useState<number | null>(null);
  const [searchFilter, setSearchFilter] = useState('');

  if (!citations || citations.length === 0) {
    return null;
  }

  const handleCopyQuote = (quote: string, idx: number) => {
    navigator.clipboard.writeText(quote);
    setCopiedIdx(idx);
    setTimeout(() => setCopiedIdx(null), 2000);
  };

  const getSourceBadge = (type: string) => {
    switch (type.toLowerCase()) {
      case 'pdf':
        return 'bg-rose-50 dark:bg-rose-950/60 text-rose-700 dark:text-rose-300 border-rose-200 dark:border-rose-800';
      case 'image':
        return 'bg-purple-50 dark:bg-purple-950/60 text-purple-700 dark:text-purple-300 border-purple-200 dark:border-purple-800';
      case 'url':
        return 'bg-sky-50 dark:bg-sky-950/60 text-sky-700 dark:text-sky-300 border-sky-200 dark:border-sky-800';
      default:
        return 'bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 border-indigo-200 dark:border-indigo-800';
    }
  };

  const filteredCitations = citations.filter(c => {
    if (!searchFilter.trim()) return true;
    const q = searchFilter.toLowerCase();
    return (
      c.document_title.toLowerCase().includes(q) ||
      c.quote.toLowerCase().includes(q) ||
      c.relevance.toLowerCase().includes(q)
    );
  });

  return (
    <div className="surface-card rounded-xl border border-slate-200 dark:border-slate-800 p-6 shadow-sm transition-colors">
      
      {/* Header Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 pb-4 mb-4 border-b border-slate-100 dark:border-slate-800">
        <div className="flex items-center space-x-3">
          <div className="p-2 bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 rounded-lg">
            <Layers className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-sm font-semibold text-slate-900 dark:text-white tracking-tight">
              Primary Evidence & Source Citations
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Direct verbatim quotes backing each reconstructed conclusion
            </p>
          </div>
        </div>

        <span className="text-xs font-medium px-2.5 py-1 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700">
          {citations.length} Verified Sources
        </span>
      </div>

      {/* Citations List */}
      <div className="space-y-3.5">
        {filteredCitations.map((citation, idx) => {
          const badgeClass = getSourceBadge(citation.source_type);
          const isMatched = selectedEntityId
            ? citation.document_title.toLowerCase().includes(selectedEntityId.toLowerCase()) ||
              citation.quote.toLowerCase().includes(selectedEntityId.toLowerCase()) ||
              citation.relevance.toLowerCase().includes(selectedEntityId.toLowerCase())
            : false;

          return (
            <div
              key={idx}
              className={`p-4 rounded-xl transition-all ${
                isMatched
                  ? 'bg-indigo-50/40 dark:bg-indigo-950/20 border-2 border-indigo-400 dark:border-indigo-600 shadow-2xs'
                  : 'bg-white dark:bg-[#0B0F19] border border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 shadow-2xs'
              }`}
            >
              <div className="flex items-center justify-between gap-2 mb-2">
                <div className="flex items-center space-x-2">
                  <FileText className="w-4 h-4 text-slate-400 dark:text-slate-500 shrink-0" />
                  <span className="text-xs font-semibold text-slate-900 dark:text-white">
                    {citation.document_title}
                  </span>
                </div>
                <div className="flex items-center space-x-2">
                  <span className={`text-[10px] font-semibold uppercase px-2 py-0.5 rounded-full border ${badgeClass}`}>
                    {citation.source_type}
                  </span>
                  <button
                    onClick={() => handleCopyQuote(citation.quote, idx)}
                    className="p-1.5 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 rounded-md transition-colors"
                    title="Copy quotation"
                  >
                    {copiedIdx === idx ? (
                      <Check className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                    ) : (
                      <Copy className="w-3.5 h-3.5" />
                    )}
                  </button>
                </div>
              </div>

              {/* Relevance Annotation */}
              {citation.relevance && (
                <p className="text-xs text-slate-500 dark:text-slate-400 mb-2.5">
                  <span className="font-medium text-slate-700 dark:text-slate-300">Context:</span> {citation.relevance}
                </p>
              )}

              {/* Verbatim Quote Box */}
              <div className="bg-slate-50 dark:bg-[#090D16] p-3 rounded-lg border border-slate-200/80 dark:border-slate-800/80 text-xs text-slate-700 dark:text-slate-300 font-sans italic flex items-start space-x-2">
                <Quote className="w-4 h-4 text-indigo-500 dark:text-indigo-400 shrink-0 mt-0.5 not-italic" />
                <span className="leading-relaxed not-italic text-slate-800 dark:text-slate-200">
                  "{citation.quote}"
                </span>
              </div>
            </div>
          );
        })}
      </div>

    </div>
  );
}
