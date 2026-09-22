'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  HelpCircle,
  CheckCircle2,
  ChevronDown,
  ChevronUp,
  ShieldCheck,
  Calendar,
  User,
  ExternalLink,
  Layers,
  Clock,
  Sparkles,
  Quote,
} from 'lucide-react';
import { ForensicScenario, CitationRecord, ReasoningStage } from '@/data/demoData';
import { useCursor } from '@/context/CursorContext';

interface DecisionStoryProps {
  scenario: ForensicScenario;
  onInspectCitation: (citation: CitationRecord) => void;
}

export default function DecisionStory({
  scenario,
  onInspectCitation,
}: DecisionStoryProps) {
  const [expandedStage, setExpandedStage] = useState<number | null>(0);
  const { setCursor, resetCursor } = useCursor();

  const isHigh = scenario.confidenceScore === 'high';
  const confidenceColor = isHigh
    ? 'text-emerald-400 border-emerald-400/40 bg-emerald-500/10'
    : 'text-amber-400 border-amber-400/40 bg-amber-500/10';

  const toggleStage = (idx: number) => {
    setExpandedStage(expandedStage === idx ? null : idx);
  };

  return (
    <section id="results" className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
      
      {/* 1. Header & Target Inquiry */}
      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center space-x-2">
            <span className="stamp-badge text-sky-400 border-sky-400/30">
              RECONSTRUCTED CONTEXT &amp; REASONING
            </span>
            <span className="text-xs font-mono dark:text-slate-400 text-slate-500">
              ID: MERIDIAN-REC
            </span>
          </div>

          {/* Confidence Indicator with Explanation */}
          <div className="flex items-center space-x-2">
            <span className={`stamp-badge ${confidenceColor}`}>
              <ShieldCheck className="w-3.5 h-3.5 mr-1" />
              {scenario.confidenceScore.toUpperCase()} CONFIDENCE ({scenario.confidencePercentage}%)
            </span>
          </div>
        </div>

        {/* Target Inquiry Box */}
        <div className="p-5 rounded-xl dark:bg-[#0E1626]/90 bg-white/90 dark:border-[#1B2945] border-slate-200 backdrop-blur-md shadow-sm">
          <div className="flex items-start space-x-3">
            <HelpCircle className="w-5 h-5 text-sky-400 shrink-0 mt-0.5" />
            <div className="space-y-1">
              <span className="text-[10px] font-mono dark:text-slate-400 text-slate-500 uppercase tracking-wider font-bold">
                TARGET INQUIRY
              </span>
              <p className="text-base sm:text-lg font-bold dark:text-white text-slate-900">
                &ldquo;{scenario.targetInquiry}&rdquo;
              </p>
              <p className="text-xs font-mono dark:text-slate-400 text-slate-600">
                {scenario.confidenceRationale}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* 2. Executive Direct Answer */}
      <div className="p-7 sm:p-8 rounded-2xl dark:bg-[#0E1626]/90 bg-white/90 dark:border-[#2A3B5C] border-slate-200/90 shadow-xl space-y-6 relative overflow-hidden backdrop-blur-md">
        <div className="flex items-center justify-between border-b dark:border-[#1B2945] border-slate-200 pb-3">
          <div className="flex items-center space-x-2 text-sky-500 dark:text-sky-400 text-xs font-mono font-bold tracking-wider">
            <CheckCircle2 className="w-4 h-4 text-emerald-500 dark:text-emerald-400" />
            <span>EXECUTIVE DIRECT ANSWER</span>
          </div>
          <span className="text-xs font-mono text-emerald-600 dark:text-emerald-400 font-bold">
            ✓ ZERO-HALLUCINATION VERIFIED
          </span>
        </div>

        {/* Core Direct Answer Text */}
        <p className="text-base sm:text-lg dark:text-slate-100 text-slate-800 font-medium leading-relaxed">
          {scenario.directAnswer}
        </p>

        {/* Highlighted Facts Strip: Decision, Why, Who, When, Impact */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3 pt-3 border-t dark:border-[#1B2945] border-slate-200">
          <div className="p-3 rounded-lg dark:bg-[#070B14] bg-slate-50/90 dark:border-[#1B2945] border-slate-200">
            <span className="text-[9px] font-mono dark:text-slate-400 text-slate-500 uppercase block">Decision</span>
            <p className="text-xs font-bold dark:text-white text-slate-900 mt-0.5 leading-snug line-clamp-2">
              {scenario.keyFacts.decision}
            </p>
          </div>

          <div className="p-3 rounded-lg dark:bg-[#070B14] bg-slate-50/90 dark:border-[#1B2945] border-slate-200">
            <span className="text-[9px] font-mono dark:text-slate-400 text-slate-500 uppercase block">Why</span>
            <p className="text-xs font-bold dark:text-sky-300 text-sky-700 mt-0.5 leading-snug line-clamp-2">
              {scenario.keyFacts.why}
            </p>
          </div>

          <div className="p-3 rounded-lg dark:bg-[#070B14] bg-slate-50/90 dark:border-[#1B2945] border-slate-200">
            <span className="text-[9px] font-mono dark:text-slate-400 text-slate-500 uppercase block">Who Approved</span>
            <p className="text-xs font-bold dark:text-slate-200 text-slate-800 mt-0.5 leading-snug line-clamp-2">
              {scenario.keyFacts.who}
            </p>
          </div>

          <div className="p-3 rounded-lg dark:bg-[#070B14] bg-slate-50/90 dark:border-[#1B2945] border-slate-200">
            <span className="text-[9px] font-mono dark:text-slate-400 text-slate-500 uppercase block">When / Date</span>
            <p className="text-xs font-bold dark:text-amber-300 text-amber-700 mt-0.5 leading-snug font-mono">
              {scenario.keyFacts.when}
            </p>
          </div>
        </div>
      </div>

      {/* 3. Forensic Reasoning Trail & Analysis (Interactive Stages) */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <span className="stamp-badge text-sky-400 border-sky-400/30">
              AUDIT BREAKDOWN
            </span>
            <h3 className="text-xl sm:text-2xl font-bold dark:text-white text-slate-900">
              Forensic Reasoning Trail &amp; Analysis
            </h3>
            <p className="text-xs font-mono dark:text-slate-400 text-slate-500">
              Click any stage below to expand the evidence trail.
            </p>
          </div>
        </div>

        <div className="space-y-2.5">
          {scenario.reasoningTrail.map((item, idx) => {
            const isExpanded = expandedStage === idx;
            return (
              <div
                key={item.stage}
                className="rounded-xl dark:bg-[#0E1626]/80 bg-white/80 dark:border-[#1B2945] border-slate-200 dark:hover:border-[#2A3B5C] hover:border-sky-400/50 transition-colors overflow-hidden backdrop-blur-md"
              >
                <button
                  onClick={() => toggleStage(idx)}
                  onMouseEnter={() => setCursor('VIEW', 'button')}
                  onMouseLeave={resetCursor}
                  className="w-full p-4 flex items-center justify-between text-left cursor-pointer transition-colors dark:hover:bg-[#141F36]/50 hover:bg-slate-50/80"
                >
                  <div className="flex items-center space-x-3.5 min-w-0">
                    <span className="stamp-badge text-sky-400 border-sky-400/30 w-32 shrink-0 justify-center">
                      {item.stage}
                    </span>
                    <div className="min-w-0">
                      <h4 className="text-xs sm:text-sm font-bold dark:text-white text-slate-900 truncate">
                        {item.title}
                      </h4>
                      <p className="text-xs font-mono dark:text-slate-400 text-slate-500 truncate mt-0.5">
                        {item.summary}
                      </p>
                    </div>
                  </div>

                  <div className="p-1 rounded dark:bg-[#070B14] bg-slate-100 dark:text-slate-400 text-slate-600 shrink-0 ml-3">
                    {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                  </div>
                </button>

                <AnimatePresence>
                  {isExpanded && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.2 }}
                      className="px-4 pb-4 pt-1 border-t dark:border-[#1B2945] border-slate-200 dark:bg-[#070B14]/60 bg-slate-50/70 space-y-3"
                    >
                      <p className="text-xs sm:text-sm dark:text-slate-200 text-slate-700 leading-relaxed font-normal">
                        {item.detail}
                      </p>
                      <div className="p-2.5 rounded dark:bg-[#0A0F1D] bg-white border dark:border-[#1B2945] border-slate-200 flex items-center justify-between text-[11px] font-mono dark:text-slate-400 text-slate-600">
                        <span className="dark:text-sky-300 text-sky-700">
                          Primary Source Citation: {item.evidenceRef}
                        </span>
                        <span className="text-emerald-500 dark:text-emerald-400 font-bold">
                          ✓ Verified
                        </span>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            );
          })}
        </div>
      </div>

      {/* 4. Evidence Basis Section */}
      <div className="space-y-4 pt-4 border-t dark:border-[#1B2945] border-slate-200">
        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <span className="stamp-badge text-emerald-400 border-emerald-400/30">
              EVIDENCE BASIS
            </span>
            <h3 className="text-xl sm:text-2xl font-bold dark:text-white text-slate-900">
              Primary Supporting Documents
            </h3>
          </div>
          <span className="text-xs font-mono dark:text-slate-400 text-slate-500">
            {scenario.citations.length} Verified Sources
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {scenario.citations.map((c) => (
            <div
              key={c.documentId}
              onClick={() => onInspectCitation(c)}
              onMouseEnter={() => setCursor('VIEW', 'card')}
              onMouseLeave={resetCursor}
              className="doc-sheet doc-fold p-4 rounded-xl cursor-pointer flex flex-col justify-between space-y-4 group"
            >
              <div className="space-y-2.5">
                <div className="flex items-center justify-between border-b dark:border-[#1E2D4A] border-slate-200 pb-1.5">
                  <span className="stamp-badge text-sky-400 border-sky-400/30">
                    {c.code}
                  </span>
                  <span className="text-[10px] font-mono dark:text-slate-400 text-slate-500">{c.date}</span>
                </div>

                <h4 className="text-xs sm:text-sm font-bold dark:text-white text-slate-900 dark:group-hover:text-sky-300 group-hover:text-sky-600 transition-colors line-clamp-1">
                  {c.title}
                </h4>

                <p className="text-xs font-mono dark:text-slate-400 text-slate-600 line-clamp-2 leading-relaxed">
                  {c.summary}
                </p>

                <div className="p-2.5 rounded dark:bg-[#070B14] bg-slate-100 dark:border-[#1B2945] border-slate-200 text-xs dark:text-slate-300 text-slate-700 italic line-clamp-2">
                  &ldquo;{c.quote}&rdquo;
                </div>
              </div>

              <div className="pt-2 border-t dark:border-[#1E2D4A] border-slate-200 flex items-center justify-between text-[10px] font-mono dark:text-slate-400 text-slate-500">
                <span className="text-emerald-500 dark:text-emerald-400 font-bold">✓ VERIFIED</span>
                <span className="text-sky-500 dark:text-sky-400 flex items-center space-x-1 group-hover:translate-x-0.5 transition-transform font-bold">
                  <span>INSPECT</span>
                  <ExternalLink className="w-3 h-3 ml-0.5" />
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

    </section>
  );
}
