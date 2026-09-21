'use client';

import React, { useState, useMemo } from 'react';
import { FileText, ExternalLink, Quote, Layers, Check, Copy, Filter, Sparkles } from 'lucide-react';
import { Citation } from '@/lib/types';

interface EvidencePanelProps {
  citations: Citation[];
}

export default function EvidencePanel({ citations }: EvidencePanelProps) {
  const [copiedIdx, setCopiedIdx] = useState<number | null>(null);
  const [sourceFilter, setSourceFilter] = useState<string>('all');

  if (!citations || citations.length === 0) {
    return null;
  }

  const getSourceBadge = (type: string) => {
    switch (type.toLowerCase()) {
      case 'pdf':
        return 'bg-pink-500/15 text-pink-300 border-pink-500/40';
      case 'image':
        return 'bg-violet-500/15 text-violet-300 border-violet-500/40';
      case 'url':
        return 'bg-cyan-500/15 text-cyan-300 border-cyan-500/40';
      default:
        return 'bg-amber-500/15 text-amber-300 border-amber-500/40';
    }
  };

  const handleCopyQuote = (quote: string, idx: number) => {
    navigator.clipboard.writeText(quote);
    setCopiedIdx(idx);
    setTimeout(() => setCopiedIdx(null), 2000);
  };

  const filteredCitations = useMemo(() => {
    if (sourceFilter === 'all') return citations;
    return citations.filter((c) => c.source_type.toLowerCase() === sourceFilter.toLowerCase());
  }, [citations, sourceFilter]);

  const uniqueSources = Array.from(new Set(citations.map((c) => c.source_type.toLowerCase())));

  return (
    <div className="forensic-card rounded-xl p-6 relative corner-ticks shadow-2xl">
      
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-3 pb-4 mb-4 border-b border-[#1E2C54]">
        <div className="flex items-center space-x-3">
          <div className="p-2 bg-gradient-to-br from-cyan-500/20 to-violet-600/20 rounded-lg text-cyan-300 border border-cyan-500/40 shadow-md shadow-cyan-500/10">
            <Layers className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-xs font-mono font-bold text-white uppercase tracking-wider flex items-center space-x-2">
              <span>PRIMARY EVIDENCE & VERBATIM CITATIONS</span>
              <Sparkles className="w-3.5 h-3.5 text-cyan-300 animate-pulse" />
            </h3>
            <p className="text-[11px] font-mono text-slate-400">
              ORIGINAL DOCUMENTS & TRANSCRIPTS BACKING EVERY CLAIM
            </p>
          </div>
        </div>

        <span className="text-xs font-mono px-3 py-0.5 rounded-full bg-[#0A0F24] text-cyan-300 border border-cyan-500/30 font-bold">
          {citations.length} SOURCE RECORD{citations.length > 1 ? 'S' : ''}
        </span>
      </div>

      {/* Source Filter Pills */}
      {uniqueSources.length > 1 && (
        <div className="flex items-center gap-1.5 mb-4 text-xs font-mono">
          <span className="text-[10px] uppercase text-slate-500 mr-1">Filter:</span>
          <button
            onClick={() => setSourceFilter('all')}
            className={`px-2.5 py-0.5 rounded-md text-[11px] uppercase transition-all active:scale-95 ${
              sourceFilter === 'all'
                ? 'bg-gradient-to-r from-cyan-400 to-violet-500 text-slate-950 font-bold shadow-md shadow-cyan-500/20'
                : 'bg-[#0A0F24] text-slate-400 hover:text-slate-200 border border-[#1E2C54]'
            }`}
          >
            All ({citations.length})
          </button>
          {uniqueSources.map((st) => (
            <button
              key={st}
              onClick={() => setSourceFilter(st)}
              className={`px-2.5 py-0.5 rounded-md text-[11px] uppercase transition-all active:scale-95 ${
                sourceFilter === st
                  ? 'bg-cyan-400 text-slate-950 font-bold'
                  : 'bg-[#0A0F24] text-slate-400 hover:text-slate-200 border border-[#1E2C54]'
              }`}
            >
              {st}
            </button>
          ))}
        </div>
      )}

      {/* Citations List */}
      <div className="space-y-3.5">
        {filteredCitations.map((citation, idx) => {
          const badgeClass = getSourceBadge(citation.source_type);
          const isCopied = copiedIdx === idx;

          return (
            <div
              key={idx}
              className="p-4.5 rounded-xl bg-[#0A0F24] border border-[#1E2C54] hover:border-cyan-500/50 transition-all duration-300 shadow-md hover:shadow-lg hover:shadow-cyan-500/5 hover:-translate-y-0.5"
            >
              <div className="flex items-center justify-between gap-2 mb-2">
                <div className="flex items-center space-x-2">
                  <FileText className="w-4 h-4 text-cyan-400 shrink-0" />
                  <span className="text-xs font-bold text-white font-mono">
                    {citation.document_title}
                  </span>
                </div>

                <div className="flex items-center space-x-2">
                  <span
                    className={`text-[10px] font-mono uppercase px-2.5 py-0.5 rounded border font-bold ${badgeClass}`}
                  >
                    {citation.source_type}
                  </span>
                  <button
                    onClick={() => handleCopyQuote(citation.quote, idx)}
                    className="text-slate-400 hover:text-cyan-300 p-1 rounded hover:bg-white/5 transition-colors active:scale-90"
                    title="Copy verbatim quote"
                  >
                    {isCopied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                  </button>
                </div>
              </div>

              {/* Relevance Note */}
              {citation.relevance && (
                <p className="text-[11px] font-mono text-cyan-300 mb-2.5 bg-cyan-950/40 px-3 py-1.5 rounded-lg border border-cyan-800/40 leading-relaxed">
                  RELEVANCE CONTEXT: {citation.relevance}
                </p>
              )}

              {/* Exact Verbatim Quote */}
              <div className="bg-[#040714] p-3.5 rounded-lg border border-[#1E2C54] text-xs text-slate-200 font-sans italic flex items-start space-x-2.5">
                <Quote className="w-4 h-4 text-cyan-400 shrink-0 mt-0.5 not-italic" />
                <span className="leading-relaxed">&ldquo;{citation.quote}&rdquo;</span>
              </div>
            </div>
          );
        })}
      </div>

    </div>
  );
}
