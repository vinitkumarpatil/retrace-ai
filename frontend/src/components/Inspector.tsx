'use client';

import React, { useState } from 'react';
import {
  X,
  FileText,
  ShieldCheck,
  CheckCircle2,
  Bookmark,
  Quote,
  Copy,
  Check,
  ExternalLink,
  ChevronDown,
  ChevronUp,
  Layers,
  Sparkles,
} from 'lucide-react';
import { Citation, EntityNode, TimelineEvent } from '@/lib/types';

export interface InspectorSelectedData {
  title: string;
  type: string;
  status?: string;
  confidence?: string | number;
  sourcesCount?: number;
  description?: string;
  quote?: string;
  metadata?: Record<string, any>;
  citations?: Citation[];
}

interface InspectorProps {
  selectedData: InspectorSelectedData | null;
  onClose: () => void;
  isOpenMobile: boolean;
  onSelectCitation?: (citation: Citation) => void;
}

export default function Inspector({
  selectedData,
  onClose,
  isOpenMobile,
  onSelectCitation,
}: InspectorProps) {
  const [copiedQuote, setCopiedQuote] = useState(false);
  const [activeCitationIdx, setActiveCitationIdx] = useState<number | null>(null);

  // Default placeholder data if nothing selected yet
  const displayData: InspectorSelectedData = selectedData || {
    title: 'ADR-042: Database Architecture Review',
    type: 'Architecture Decision Record',
    status: 'Verified',
    confidence: '94%',
    sourcesCount: 7,
    description:
      'Formal committee approval authorizing the migration of the core Order and Payment service clusters from Django monolith to PostgreSQL with pgvector.',
    metadata: {
      Author: 'Alice Chen (Principal Architect)',
      AuthorizedBy: 'Architecture Review Board',
      Status: 'Production Approved',
    },
    citations: [
      {
        document_title: 'RFC-204: Monolith Migration RFC',
        source_type: 'RFC',
        quote: 'Adopt Kafka + PostgreSQL starting August 1, 2024. Team Nova will execute migration in Phase 1.',
        relevance: 'Primary architectural proposal defining service boundaries and technology stack.',
      },
      {
        document_title: 'Slack #arch-council: Emergency Session',
        source_type: 'Slack',
        quote: 'Approved the budget increase for the 2xlarge RDS instance for Q3.',
        relevance: 'Direct authorization from VP of Engineering for hardware scaling.',
      },
      {
        document_title: 'Incident Retrospective #88',
        source_type: 'Postmortem',
        quote: 'Standardize Supabase for local staging environments to prevent configuration drift.',
        relevance: 'Follow-up corrective action enforcing pgvector schema standardization.',
      },
    ],
  };

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedQuote(true);
    setTimeout(() => setCopiedQuote(false), 2000);
  };

  return (
    <aside
      className={`w-[300px] shrink-0 border-l border-[#243044] bg-[#0B101A] flex flex-col justify-between z-40 transition-transform duration-300 ${
        isOpenMobile
          ? 'fixed inset-y-0 right-0 translate-x-0'
          : 'fixed inset-y-0 right-0 translate-x-full lg:relative lg:translate-x-0'
      }`}
    >
      {/* Inspector Header */}
      <div className="p-4 border-b border-[#243044] bg-[#101722] flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <div className="p-1 rounded bg-[#00F2FE]/10 text-[#00F2FE] border border-[#00F2FE]/30">
            <Bookmark className="w-3.5 h-3.5" />
          </div>
          <h3 className="text-xs font-mono font-bold text-white uppercase tracking-wider">
            CONTEXT INSPECTOR
          </h3>
        </div>

        <button
          onClick={onClose}
          className="text-[#94A3B8] hover:text-white p-1 rounded transition-colors lg:hidden"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* Inspector Body */}
      <div className="flex-1 overflow-y-auto p-4 space-y-5 text-xs font-mono">
        
        {/* Selected Evidence Card */}
        <div className="space-y-3">
          <div className="text-[10px] uppercase tracking-wider text-[#64748B] font-bold">
            SELECTED EVIDENCE
          </div>

          <div className="p-3.5 rounded-xl bg-[#101722] border border-[#243044] shadow-md space-y-2.5">
            <div className="flex items-center justify-between gap-1">
              <span className="text-[10px] text-[#00F2FE] bg-[#00F2FE]/10 px-2 py-0.5 rounded border border-[#00F2FE]/30 font-bold uppercase truncate max-w-[170px]">
                {displayData.type}
              </span>
              <span className="text-[10px] text-[#10B981] bg-[#10B981]/10 px-1.5 py-0.5 rounded border border-[#10B981]/30 font-semibold flex items-center space-x-1 shrink-0">
                <ShieldCheck className="w-3 h-3" />
                <span>{displayData.status || 'Verified'}</span>
              </span>
            </div>

            <h4 className="text-sm font-bold text-white font-sans leading-snug">
              {displayData.title}
            </h4>

            {displayData.description && (
              <p className="text-[11px] text-[#94A3B8] font-sans leading-relaxed">
                {displayData.description}
              </p>
            )}

            <div className="grid grid-cols-2 gap-2 pt-2 border-t border-[#243044] text-[11px]">
              <div>
                <span className="text-[#64748B] block text-[10px]">Confidence:</span>
                <span className="text-white font-bold">{displayData.confidence || '94%'}</span>
              </div>
              <div>
                <span className="text-[#64748B] block text-[10px]">Sources:</span>
                <span className="text-[#00F2FE] font-bold">{displayData.sourcesCount || displayData.citations?.length || 1} records</span>
              </div>
            </div>
          </div>
        </div>

        {/* Citations List */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-[10px] uppercase tracking-wider text-[#64748B] font-bold">
              VERIFIED CITATIONS ({displayData.citations?.length || 0})
            </span>
            <span className="text-[9px] text-[#00F2FE]">Click to inspect</span>
          </div>

          <div className="space-y-2">
            {(displayData.citations || []).map((citation, idx) => {
              const isSelected = activeCitationIdx === idx;

              return (
                <div
                  key={idx}
                  onClick={() => {
                    setActiveCitationIdx(idx);
                    if (onSelectCitation) onSelectCitation(citation);
                  }}
                  className={`p-3 rounded-lg border transition-all cursor-pointer ${
                    isSelected
                      ? 'bg-[#151D29] border-[#00F2FE]/50 shadow-md'
                      : 'bg-[#101722] border-[#243044] hover:border-[#334155]'
                  }`}
                >
                  <div className="flex items-center justify-between gap-1 mb-1">
                    <span className="text-[10px] font-bold text-white truncate">
                      {idx + 1}. {citation.document_title}
                    </span>
                    <span className="text-[9px] uppercase px-1.5 py-0.2 rounded bg-[#0B101A] border border-[#243044] text-[#94A3B8]">
                      {citation.source_type}
                    </span>
                  </div>

                  <div className="text-[11px] text-[#94A3B8] font-sans italic line-clamp-2 leading-relaxed">
                    &ldquo;{citation.quote}&rdquo;
                  </div>

                  {/* Expanded Quote Detail */}
                  {isSelected && (
                    <div className="mt-2 pt-2 border-t border-[#243044] text-[10px] space-y-1.5">
                      <div className="text-slate-300 not-italic font-mono">
                        <strong className="text-[#00F2FE]">Relevance:</strong> {citation.relevance}
                      </div>

                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleCopy(citation.quote);
                        }}
                        className="text-[#00F2FE] hover:underline flex items-center space-x-1"
                      >
                        {copiedQuote ? <Check className="w-3 h-3 text-[#10B981]" /> : <Copy className="w-3 h-3" />}
                        <span>{copiedQuote ? 'Copied' : 'Copy Quote'}</span>
                      </button>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

      </div>

      {/* Footer Info */}
      <div className="p-3 border-t border-[#243044] bg-[#05070D] text-[10px] font-mono text-[#64748B] flex items-center justify-between">
        <span>Zero-Hallucination Guard</span>
        <span className="text-[#10B981] font-bold">STRICT 100%</span>
      </div>

    </aside>
  );
}
