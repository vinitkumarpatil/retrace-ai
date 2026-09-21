'use client';

import React, { useState } from 'react';
import { FileText, Search, CheckCircle2, Bookmark, ArrowRight, ShieldCheck, Zap, Layers, Sparkles } from 'lucide-react';

export default function InteractivePipelineSection() {
  const [selectedStage, setSelectedStage] = useState<number>(0);

  const stages = [
    {
      id: 0,
      title: 'DOCUMENT',
      subtitle: 'Raw Artifact Ingestion',
      icon: FileText,
      color: 'border-amber-500/40 text-amber-400 bg-amber-500/10',
      activeBorder: 'border-amber-400 ring-2 ring-amber-400/20 shadow-amber-500/15',
      badge: 'INPUT LAYER',
      details: {
        headline: 'Multi-Format Ingestion & Structure Preservation',
        summary:
          'Documents such as ADRs, pull requests, Slack channel transcripts, and postmortems are ingested. ReTrace parses raw text, timestamps, author metadata, and architectural diagrams.',
        metrics: ['Markdown, PDF, DOCX, TXT', 'Author & Date Extractor', 'Content Hash Verification'],
      },
    },
    {
      id: 1,
      title: 'ANALYSIS',
      subtitle: 'Hybrid Correlation',
      icon: Search,
      color: 'border-sky-500/40 text-sky-400 bg-sky-500/10',
      activeBorder: 'border-sky-400 ring-2 ring-sky-400/20 shadow-sky-500/15',
      badge: 'PROCESSING LAYER',
      details: {
        headline: 'Vector Cosine Distance & Causal Graph Traversal',
        summary:
          'Dense 768-dimensional embeddings match semantic meaning, while exact keyword token matching prevents hallucinations. Cross-document links connect people to decisions and outcomes.',
        metrics: ['768-dim Vector Embeddings', 'BM25 Token Matching', 'Causal Entity Linking'],
      },
    },
    {
      id: 2,
      title: 'DECISION',
      subtitle: 'Synthesis & Consensus',
      icon: CheckCircle2,
      color: 'border-emerald-500/40 text-emerald-400 bg-emerald-500/10',
      activeBorder: 'border-emerald-400 ring-2 ring-emerald-400/20 shadow-emerald-500/15',
      badge: 'SYNTHESIS LAYER',
      details: {
        headline: 'Executive Rationale & Stakeholder Sign-Offs',
        summary:
          'The AI synthesizes exactly what choice was adopted, the historical alternative options that were rejected, the authorized engineering committee, and the effective go-live date.',
        metrics: ['Direct Answer Formulation', 'Identified Stakeholders', 'Confidence Scoring'],
      },
    },
    {
      id: 3,
      title: 'EVIDENCE',
      subtitle: 'Verbatim Citations',
      icon: Bookmark,
      color: 'border-indigo-500/40 text-indigo-400 bg-indigo-500/10',
      activeBorder: 'border-indigo-400 ring-2 ring-indigo-400/20 shadow-indigo-500/15',
      badge: 'VERIFICATION LAYER',
      details: {
        headline: 'Audit Proof & Zero-Hallucination Policy',
        summary:
          'Every single claim is paired with verbatim quotes directly extracted from the original source artifacts. Broken decision chains or missing meeting notes are audited and flagged.',
        metrics: ['Verbatim Text Excerpts', 'Zero-Hallucination Guard', 'Source Document Linking'],
      },
    },
  ];

  const current = stages[selectedStage];

  return (
    <section className="py-20 bg-[#080D1A] border-t border-slate-800/80">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
        
        {/* Header */}
        <div className="text-center max-w-2xl mx-auto space-y-3">
          <div className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full bg-sky-500/10 text-sky-400 text-xs font-mono font-medium border border-sky-500/20">
            <Layers className="w-3.5 h-3.5" />
            <span>INTERACTIVE ARCHITECTURE</span>
          </div>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
            The Decision Pipeline
          </h2>
          <p className="text-sm sm:text-base text-slate-400">
            Click any stage in the flow below to see how ReTrace converts raw documents into verified decisions.
          </p>
        </div>

        {/* 4 Clickable Pipeline Nodes in a Row */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 relative">
          {stages.map((st, idx) => {
            const Icon = st.icon;
            const isSelected = selectedStage === st.id;

            return (
              <button
                key={st.id}
                type="button"
                onClick={() => setSelectedStage(st.id)}
                className={`p-5 rounded-2xl border text-left transition-all duration-200 cursor-pointer flex flex-col justify-between group shadow-lg ${
                  isSelected
                    ? `bg-[#1E293B] ${st.activeBorder} scale-105`
                    : 'bg-[#0F172A] border-slate-800 hover:border-slate-700 hover:bg-slate-900'
                }`}
              >
                <div className="flex items-center justify-between mb-4">
                  <div
                    className={`p-2.5 rounded-xl border ${st.color} group-hover:scale-110 transition-transform`}
                  >
                    <Icon className="w-5 h-5" />
                  </div>
                  <span className="text-[10px] font-mono text-slate-400 font-bold uppercase">
                    STAGE 0{idx + 1}
                  </span>
                </div>

                <div className="space-y-1">
                  <h4 className="text-sm sm:text-base font-extrabold text-white tracking-wider font-mono">
                    {st.title}
                  </h4>
                  <p className="text-xs text-slate-400 font-sans">
                    {st.subtitle}
                  </p>
                </div>
              </button>
            );
          })}
        </div>

        {/* Interactive Explanation Panel */}
        <div className="rounded-2xl bg-[#0F172A] border border-slate-700/80 p-6 sm:p-8 shadow-2xl animate-fade-in space-y-5">
          <div className="flex flex-wrap items-center justify-between gap-3 pb-4 border-b border-slate-800">
            <div className="flex items-center space-x-3">
              <span
                className={`text-xs font-mono font-bold px-3 py-1 rounded-full border ${current.color}`}
              >
                {current.badge}
              </span>
              <h3 className="text-lg font-bold text-white">
                {current.details.headline}
              </h3>
            </div>
            <span className="text-xs font-mono text-slate-400">
              CLICK OTHER STAGES TO EXPLORE
            </span>
          </div>

          <p className="text-sm text-slate-300 leading-relaxed font-sans">
            {current.details.summary}
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
            {current.details.metrics.map((m, i) => (
              <div
                key={i}
                className="p-3 rounded-xl bg-slate-900/90 border border-slate-800 text-xs text-slate-300 font-mono flex items-center space-x-2"
              >
                <ShieldCheck className="w-4 h-4 text-sky-400 shrink-0" />
                <span>{m}</span>
              </div>
            ))}
          </div>
        </div>

      </div>
    </section>
  );
}
