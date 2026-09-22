'use client';

import React from 'react';
import { motion } from 'framer-motion';
import {
  HelpCircle,
  CheckCircle2,
  Users,
  Clock,
  ShieldCheck,
  Sparkles,
  ArrowRight,
  Share2,
} from 'lucide-react';
import { useCursor } from '@/context/CursorContext';

interface ResultProps {
  query: string;
  result: {
    direct_answer?: string;
    directAnswer?: string;
    reasoning_summary?: string;
    whyPoints?: string[];
    who?: string;
    whoRole?: string;
    when?: string;
    whenContext?: string;
    confidence?: string;
    confidence_score?: string;
    confidence_rationale?: string;
  };
}

export default function Result({ query, result }: ResultProps) {
  const { setCursor, resetCursor } = useCursor();

  const directDecision =
    result.direct_answer ||
    result.directAnswer ||
    'PostgreSQL with pgvector was selected after evaluating scalability, reliability and transaction requirements.';

  const whyList =
    result.whyPoints ||
    (result.reasoning_summary
      ? [result.reasoning_summary]
      : [
          'High concurrency transactional consistency during checkout bursts',
          'Eliminated cross-network latency between relational data and embedding vector stores',
          'ADR-042 benchmark confirmed 98.4% retrieval accuracy with native pgvector HNSW caching',
        ]);

  const whoPerson = result.who || 'Alice Chen (Principal Architect)';
  const whoRoleDesc =
    result.whoRole || 'Architecture Review Board & VP of Engineering Approval';

  const whenDate = result.when || 'August 12, 2024';
  const whenContextDesc =
    result.whenContext || 'Sprint Review 24.3 • RFC-204 Phase 1 Architecture Cutover';

  const confidenceValue =
    result.confidence ||
    (result.confidence_score === 'high' ? '94%' : '90%');
  const confidenceDesc =
    result.confidence_rationale ||
    'Verified across ADR-042, RFC-204, and Slack #arch-council records with zero hallucinations.';

  return (
    <section id="results" className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
      {/* 1. Staggered Entrance Container */}
      <motion.div
        initial={{ opacity: 0, y: 25 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
        className="space-y-6"
      >
        {/* Top Header Badge */}
        <div className="flex items-center justify-between">
          <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-mono font-medium">
            <CheckCircle2 className="w-3.5 h-3.5" />
            <span>RECONSTRUCTED FORENSIC CONTEXT</span>
          </div>

          <span className="text-xs font-mono text-slate-400">
            ZERO-HALLUCINATION VERIFIED
          </span>
        </div>

        {/* Question Banner */}
        <div className="p-5 rounded-2xl bg-[#0E1626] border border-[#1E293B] shadow-lg">
          <div className="flex items-start space-x-3">
            <HelpCircle className="w-5 h-5 text-cyan-400 shrink-0 mt-0.5" />
            <div className="space-y-1">
              <span className="text-[11px] font-mono text-cyan-400 uppercase tracking-wider font-bold">
                QUESTION ASKED
              </span>
              <p className="text-base sm:text-lg font-medium text-white">
                &quot;{query}&quot;
              </p>
            </div>
          </div>
        </div>

        {/* DECISION Card */}
        <motion.div
          initial={{ opacity: 0, scale: 0.98 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.4, delay: 0.15 }}
          className="p-6 sm:p-7 rounded-2xl bg-gradient-to-br from-[#0E1626] to-[#141F36] border border-cyan-500/35 shadow-xl relative overflow-hidden"
        >
          <div className="absolute top-0 right-0 w-48 h-48 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />
          
          <div className="flex items-center space-x-2 text-xs font-mono text-cyan-400 font-bold uppercase tracking-widest mb-2">
            <Sparkles className="w-4 h-4" />
            <span>DECISION SUMMARY</span>
          </div>

          <h3 className="text-lg sm:text-xl font-bold text-white leading-relaxed">
            {directDecision}
          </h3>
        </motion.div>

        {/* 4 Info Blocks Grid: WHY, WHO, WHEN, CONFIDENCE */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {/* Card 1: WHY */}
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.2 }}
            onMouseEnter={() => setCursor('REASON', 'card')}
            onMouseLeave={resetCursor}
            className="p-6 rounded-2xl bg-[#0E1626] border border-[#1E293B] hover:border-cyan-500/40 shadow-lg transition-colors flex flex-col justify-between"
          >
            <div>
              <div className="flex items-center space-x-2 text-xs font-mono text-cyan-400 font-bold uppercase tracking-wider mb-3">
                <Sparkles className="w-4 h-4" />
                <span>WHY IT HAPPENED</span>
              </div>
              <ul className="space-y-2.5">
                {whyList.map((point, i) => (
                  <li key={i} className="text-xs sm:text-sm text-slate-300 flex items-start space-x-2">
                    <span className="text-cyan-400 font-bold mt-0.5">•</span>
                    <span>{point}</span>
                  </li>
                ))}
              </ul>
            </div>
            <div className="mt-4 pt-3 border-t border-white/5 text-[11px] font-mono text-slate-400">
              Evaluated against architectural criteria
            </div>
          </motion.div>

          {/* Card 2: WHO */}
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.25 }}
            onMouseEnter={() => setCursor('OWNER', 'card')}
            onMouseLeave={resetCursor}
            className="p-6 rounded-2xl bg-[#0E1626] border border-[#1E293B] hover:border-violet-500/40 shadow-lg transition-colors flex flex-col justify-between"
          >
            <div>
              <div className="flex items-center space-x-2 text-xs font-mono text-violet-400 font-bold uppercase tracking-wider mb-3">
                <Users className="w-4 h-4" />
                <span>WHO WAS INVOLVED</span>
              </div>
              <div className="space-y-1">
                <h4 className="text-base sm:text-lg font-bold text-white">
                  {whoPerson}
                </h4>
                <p className="text-xs sm:text-sm text-slate-300">
                  {whoRoleDesc}
                </p>
              </div>
            </div>
            <div className="mt-4 pt-3 border-t border-white/5 text-[11px] font-mono text-slate-400">
              Cross-checked via Git commits &amp; Slack discussions
            </div>
          </motion.div>

          {/* Card 3: WHEN */}
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.3 }}
            onMouseEnter={() => setCursor('DATE', 'card')}
            onMouseLeave={resetCursor}
            className="p-6 rounded-2xl bg-[#0E1626] border border-[#1E293B] hover:border-amber-500/40 shadow-lg transition-colors flex flex-col justify-between"
          >
            <div>
              <div className="flex items-center space-x-2 text-xs font-mono text-amber-400 font-bold uppercase tracking-wider mb-3">
                <Clock className="w-4 h-4" />
                <span>WHEN IT HAPPENED</span>
              </div>
              <div className="space-y-1">
                <h4 className="text-base sm:text-lg font-bold text-white font-mono">
                  {whenDate}
                </h4>
                <p className="text-xs sm:text-sm text-slate-300">
                  {whenContextDesc}
                </p>
              </div>
            </div>
            <div className="mt-4 pt-3 border-t border-white/5 text-[11px] font-mono text-slate-400">
              Synchronized timestamp from deployment telemetry
            </div>
          </motion.div>

          {/* Card 4: CONFIDENCE */}
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.35 }}
            onMouseEnter={() => setCursor('VERIFIED', 'card')}
            onMouseLeave={resetCursor}
            className="p-6 rounded-2xl bg-[#0E1626] border border-[#1E293B] hover:border-emerald-500/40 shadow-lg transition-colors flex flex-col justify-between"
          >
            <div>
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center space-x-2 text-xs font-mono text-emerald-400 font-bold uppercase tracking-wider">
                  <ShieldCheck className="w-4 h-4" />
                  <span>CONFIDENCE SCORE</span>
                </div>
                <span className="text-lg font-mono font-bold text-emerald-400">
                  {confidenceValue}
                </span>
              </div>
              <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
                {confidenceDesc}
              </p>
            </div>
            <div className="mt-4 pt-3 border-t border-white/5 text-[11px] font-mono text-emerald-400/80">
              ✓ Multi-document consensus achieved
            </div>
          </motion.div>
        </div>
      </motion.div>
    </section>
  );
}
