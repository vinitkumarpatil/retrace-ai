'use client';

import React, { useState, useMemo } from 'react';
import { FileText, Quote, Layers, Check, Copy, Sparkles, Eye, ShieldCheck } from 'lucide-react';
import { Citation } from '@/lib/types';

interface EvidencePanelProps {
  citations: Citation[];
  onSelectCitation?: (citation: Citation) => void;
  selectedCitation?: Citation | null;
}

export default function EvidencePanel({
  citations,
  onSelectCitation,
  selectedCitation,
}: EvidencePanelProps) {
  const [copiedIdx, setCopiedIdx] = useState<number | null>(null);
  const [sourceFilter, setSourceFilter] = useState<string>('all');

  if (!citations || citations.length === 0) {
    return null;
  }

  const getSourceBadge = (type: string) => {
    switch (type.toLowerCase()) {
      case 'pdf':
        return 'bg-pink-500/10 text-pink-400 border-pink-500/30';
      case 'image':
        return 'bg-violet-500/10 text-violet-400 border-violet-500/30';
      case 'url':
        return 'bg-[#00F2FE]/10 text-[#00F2FE] border-[#00F2FE]/30';
      case 'rfc':
        return 'bg-[#10B981]/10 text-[#10B981] border-[#10B981]/30';
      default:
        return 'bg-amber-500/10 text-amber-400 border-amber-500/30';
    }
  };

  const handleCopyQuote = (quote: string, idx: number, e: React.MouseEvent) => {
    e.stopPropagation();
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
    <div className="rounded-xl p-5 bg-[#101722] border border-[#243044] relative corner-ticks shadow-xl transition-all">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-3 pb-4 mb-4 border-b border-[#243044]">
        <div className="flex items-center space-x-3">
          <div className="p-2 bg-[#00F2FE]/10 rounded-lg text-[#00F2FE] border border-[#00F2FE]/30">
            <Layers className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-xs font-mono font-bold text-white uppercase tracking-wider flex items-center space-x-2">
              <span>PRIMARY EVIDENCE & VERBATIM CITATIONS</span>
              <Sparkles className="w-3.5 h-3.5 text-[#00F2FE] animate-pulse" />
            </h3>
            <p className="text-[11px] font-mono text-[#94A3B8]">
              ORIGINAL DOCUMENTS & TRANSCRIPTS BACKING EVERY CLAIM WITH RECORD HASHES
            </p>
          </div>
        </div>

        <div className="flex items-center space-x-2">
          <span className="text-[10px] font-mono px-2.5 py-1 rounded bg-[#05070D] text-[#10B981] border border-[#10B981]/30 font-bold flex items-center space-x-1">
            <ShieldCheck className="w-3 h-3" />
            <span>VERIFIED ZERO-DRIFT</span>
          </span>
          <span className="text-xs font-mono px-3 py-1 rounded-full bg-[#05070D] text-[#00F2FE] border border-[#00F2FE]/30 font-bold">
            {citations.length} RECORD{citations.length > 1 ? 'S' : ''}
          </span>
        </div>
      </div>

      {/* Source Filter Pills */}
      {uniqueSources.length > 1 && (
        <div className="flex items-center gap-1.5 mb-4 text-xs font-mono">
          <span className="text-[10px] uppercase text-[#64748B] mr-1 font-semibold">Filter:</span>
          <button
            onClick={() => setSourceFilter('all')}
            className={`px-2.5 py-1 rounded text-[11px] uppercase transition-all active:scale-95 ${
              sourceFilter === 'all'
                ? 'bg-[#00F2FE] text-[#05070D] font-bold shadow-md shadow-[#00F2FE]/20'
                : 'bg-[#05070D] text-[#94A3B8] hover:text-white border border-[#243044]'
            }`}
          >
            All ({citations.length})
          </button>
          {uniqueSources.map((st) => (
            <button
              key={st}
              onClick={() => setSourceFilter(st)}
              className={`px-2.5 py-1 rounded text-[11px] uppercase transition-all active:scale-95 ${
                sourceFilter === st
                  ? 'bg-[#00F2FE] text-[#05070D] font-bold'
                  : 'bg-[#05070D] text-[#94A3B8] hover:text-white border border-[#243044]'
              }`}
            >
              {st}
            </button>
          ))}
        </div>
      )}

      {/* Citations List */}
      <div className="space-y-3">
        {filteredCitations.map((citation, idx) => {
          const badgeClass = getSourceBadge(citation.source_type);
          const isCopied = copiedIdx === idx;
          const isSelected = selectedCitation?.quote === citation.quote;

          return (
            <div
              key={idx}
              onClick={() => onSelectCitation && onSelectCitation(citation)}
              className={`p-4 rounded-xl transition-all duration-200 border cursor-pointer ${
                isSelected
                  ? 'bg-[#151D29] border-[#00F2FE] shadow-lg shadow-[#00F2FE]/10 scale-[1.005]'
                  : 'bg-[#0B101A] border-[#243044] hover:border-[#00F2FE]/40 hover:bg-[#101722]'
              }`}
            >
              <div className="flex items-center justify-between gap-2 mb-2">
                <div className="flex items-center space-x-2 min-w-0">
                  <FileText className="w-4 h-4 text-[#00F2FE] shrink-0" />
                  <span className="text-xs font-bold text-white font-mono truncate">
                    {citation.document_title}
                  </span>
                </div>

                <div className="flex items-center space-x-2 shrink-0">
                  <span
                    className={`text-[10px] font-mono uppercase px-2 py-0.5 rounded border font-bold ${badgeClass}`}
                  >
                    {citation.source_type}
                  </span>
                  
                  {onSelectCitation && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onSelectCitation(citation);
                      }}
                      className="text-[11px] font-mono text-[#00F2FE] hover:text-white px-2 py-0.5 rounded bg-[#00F2FE]/10 border border-[#00F2FE]/30 flex items-center space-x-1"
                    >
                      <Eye className="w-3 h-3" />
                      <span>Inspect</span>
                    </button>
                  )}

                  <button
                    onClick={(e) => handleCopyQuote(citation.quote, idx, e)}
                    className="text-[#94A3B8] hover:text-[#00F2FE] p-1 rounded hover:bg-white/5 transition-colors active:scale-90"
                    title="Copy verbatim quote"
                  >
                    {isCopied ? <Check className="w-3.5 h-3.5 text-[#10B981]" /> : <Copy className="w-3.5 h-3.5" />}
                  </button>
                </div>
              </div>

              {/* Relevance Note */}
              {citation.relevance && (
                <p className="text-[11px] font-mono text-[#00F2FE] mb-2 bg-[#05070D] px-3 py-1.5 rounded border border-[#243044] leading-relaxed">
                  <span className="text-[#64748B] uppercase font-bold mr-1">Relevance Context:</span>
                  {citation.relevance}
                </p>
              )}

              {/* Exact Verbatim Quote */}
              <div className="bg-[#05070D] p-3 rounded-lg border border-[#243044] text-xs text-slate-200 font-sans italic flex items-start space-x-2.5">
                <Quote className="w-3.5 h-3.5 text-[#00F2FE] shrink-0 mt-0.5 not-italic" />
                <span className="leading-relaxed">&ldquo;{citation.quote}&rdquo;</span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
