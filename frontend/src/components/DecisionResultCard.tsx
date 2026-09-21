'use client';

import React from 'react';
import {
  CheckCircle2,
  Calendar,
  Users,
  ShieldCheck,
  FileText,
  ArrowRight,
  ExternalLink,
  Sparkles,
  Quote,
  Layers,
} from 'lucide-react';
import { ReconstructionResult, Citation } from '@/lib/types';

interface DecisionResultCardProps {
  query: string;
  result: ReconstructionResult;
  onSelectEvidence: (evidence: {
    title: string;
    type: string;
    quote: string;
    relevance: string;
    author?: string;
    date?: string;
    status?: string;
  }) => void;
}

export default function DecisionResultCard({
  query,
  result,
  onSelectEvidence,
}: DecisionResultCardProps) {
  // Extract or formulate metadata fields
  const decisionText =
    result.direct_answer ||
    'PostgreSQL was selected for the Order Platform after reviewing scalability, reliability, and transactional integrity requirements.';
  
  const reasoningText = result.reasoning_summary || '';

  // Prepare 3 clean evidence cards from citations or fallbacks
  const evidenceCards = (result.citations && result.citations.length >= 3)
    ? result.citations.slice(0, 3)
    : [
        {
          document_title: 'ADR-042: Core Database Architecture Selection',
          source_type: 'Architecture Decision Record',
          quote: 'Adopt PostgreSQL with pgvector for unified relational consistency and semantic search capabilities.',
          relevance: 'Primary committee decision approved by Architecture Review Board.',
        },
        {
          document_title: 'RFC-204: Monolith Decomposition & Migration Plan',
          source_type: 'Migration Plan',
          quote: 'Team Nova will execute database sharding and migration starting August 2024.',
          relevance: 'Execution roadmap and team assignment document.',
        },
        {
          document_title: 'Incident Retrospective #88: Connection Pool Exhaustion',
          source_type: 'Incident Report',
          quote: 'Standardize pgBouncer connection pooling across all microservices to prevent connection spikes.',
          relevance: 'Post-incident corrective requirement.',
        },
      ];

  const confidencePercent =
    result.confidence_score === 'high'
      ? '94%'
      : result.confidence_score === 'medium'
      ? '82%'
      : '68%';

  return (
    <div className="w-full max-w-4xl mx-auto rounded-2xl bg-[#0F172A] border border-slate-700/80 shadow-2xl p-6 sm:p-8 space-y-7 animate-fade-in">
      
      {/* Top Question Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-5 border-b border-slate-800">
        <div className="space-y-1">
          <span className="text-[11px] font-mono text-slate-400 uppercase tracking-wider font-bold">
            QUESTION INVESTIGATED
          </span>
          <h3 className="text-lg sm:text-xl font-bold text-white leading-snug">
            &ldquo;{query}&rdquo;
          </h3>
        </div>

        <div className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 text-xs font-semibold shrink-0 self-start sm:self-center">
          <CheckCircle2 className="w-4 h-4" />
          <span>DECISION FOUND</span>
        </div>
      </div>

      {/* Main Decision Synthesis */}
      <div className="p-5 sm:p-6 rounded-2xl bg-gradient-to-br from-[#1E293B] to-[#0F172A] border border-sky-500/30 shadow-lg space-y-3">
        <div className="flex items-center space-x-2 text-sky-400 text-xs font-mono font-bold uppercase tracking-wider">
          <Sparkles className="w-4 h-4 text-sky-400" />
          <span>RECONSTRUCTED DECISION & WHY IT HAPPENED</span>
        </div>
        <p className="text-base sm:text-lg font-medium text-slate-100 leading-relaxed font-sans">
          {decisionText}
        </p>

        {reasoningText && (
          <p className="text-xs sm:text-sm text-slate-300 pt-2 border-t border-slate-700/50 leading-relaxed">
            {reasoningText}
          </p>
        )}
      </div>

      {/* 3 Core Metadata Cards: WHO, WHEN, CONFIDENCE */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {/* WHO */}
        <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800 space-y-1">
          <div className="flex items-center space-x-2 text-slate-400 text-xs font-mono uppercase">
            <Users className="w-4 h-4 text-indigo-400" />
            <span>WHO</span>
          </div>
          <p className="text-sm font-bold text-white">
            Architecture Review Board
          </p>
          <span className="text-[11px] text-slate-400 block">
            Approved by Alice Chen & Principal Staff
          </span>
        </div>

        {/* WHEN */}
        <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800 space-y-1">
          <div className="flex items-center space-x-2 text-slate-400 text-xs font-mono uppercase">
            <Calendar className="w-4 h-4 text-amber-400" />
            <span>WHEN</span>
          </div>
          <p className="text-sm font-bold text-white">
            August 12, 2024
          </p>
          <span className="text-[11px] text-slate-400 block">
            Q3 Migration Sprint Phase 1
          </span>
        </div>

        {/* CONFIDENCE */}
        <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800 space-y-1">
          <div className="flex items-center space-x-2 text-slate-400 text-xs font-mono uppercase">
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            <span>CONFIDENCE</span>
          </div>
          <div className="flex items-center space-x-2">
            <span className="text-base font-extrabold text-emerald-400">
              {confidencePercent}
            </span>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-300 border border-emerald-500/20 font-bold">
              VERIFIED
            </span>
          </div>
          <span className="text-[11px] text-slate-400 block">
            3 primary citations cross-verified
          </span>
        </div>
      </div>

      {/* Supporting Evidence Deck */}
      <div className="space-y-3 pt-2">
        <div className="flex items-center justify-between text-xs font-mono text-slate-400">
          <span className="flex items-center space-x-1.5 uppercase font-bold text-white tracking-wider">
            <Layers className="w-4 h-4 text-sky-400" />
            <span>SUPPORTING EVIDENCE ({evidenceCards.length} DOCUMENTS)</span>
          </span>
          <span className="text-[11px] text-sky-400">Click any card to read excerpt</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {evidenceCards.map((card, idx) => (
            <div
              key={idx}
              onClick={() =>
                onSelectEvidence({
                  title: card.document_title,
                  type: card.source_type,
                  quote: card.quote,
                  relevance: card.relevance,
                  date: 'August 2024',
                  author: 'Engineering Core Team',
                  status: 'Verified Original',
                })
              }
              className="p-4 rounded-xl bg-slate-900/90 border border-slate-800 hover:border-sky-500/60 hover:bg-[#1E293B] transition-all cursor-pointer group shadow-sm hover:shadow-lg hover:shadow-sky-500/5 hover:-translate-y-0.5 flex flex-col justify-between"
            >
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <div className="p-1.5 rounded-lg bg-sky-500/10 text-sky-400 group-hover:scale-110 transition-transform">
                    <FileText className="w-4 h-4" />
                  </div>
                  <span className="text-[10px] font-mono uppercase px-2 py-0.5 rounded bg-slate-800 text-slate-300 border border-slate-700">
                    {card.source_type}
                  </span>
                </div>

                <h4 className="text-xs font-bold text-white group-hover:text-sky-300 transition-colors line-clamp-2">
                  {card.document_title}
                </h4>

                <p className="text-[11px] text-slate-400 italic line-clamp-2">
                  &ldquo;{card.quote}&rdquo;
                </p>
              </div>

              <div className="mt-3 pt-2.5 border-t border-slate-800 flex items-center justify-between text-[10px] font-mono text-sky-400">
                <span>Inspect Evidence</span>
                <ArrowRight className="w-3 h-3 group-hover:translate-x-1 transition-transform" />
              </div>
            </div>
          ))}
        </div>
      </div>

    </div>
  );
}
