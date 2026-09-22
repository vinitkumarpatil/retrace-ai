'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import {
  FileText,
  AlertCircle,
  HelpCircle,
  GitBranch,
  CheckCircle2,
  ArrowRight,
  User,
  Search,
  Sparkles,
  RefreshCw,
} from 'lucide-react';
import { useCursor } from '@/context/CursorContext';

export default function HumanStory() {
  const [resolved, setResolved] = useState(false);
  const { setCursor, resetCursor } = useCursor();

  return (
    <section className="py-20 md:py-28 dark:bg-[#0A0F1D]/75 bg-slate-50/70 backdrop-blur-[2px] border-b dark:border-[#1B2945]/70 border-slate-200/80 relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
        
        {/* Section Header */}
        <div className="max-w-2xl mx-auto text-center space-y-3">
          <div className="inline-flex items-center space-x-2 px-3 py-1 rounded border dark:border-[#2A3B5C] border-sky-300/40 dark:bg-[#0E1626] bg-sky-50 dark:text-sky-400 text-sky-700 text-[10px] font-mono uppercase tracking-widest">
            <span>THE HUMAN REALITY</span>
          </div>
          <h2 className="text-3xl sm:text-4xl font-extrabold dark:text-white text-slate-900 tracking-tight">
            The Lost Context Dilemma
          </h2>
          <p className="text-sm sm:text-base dark:text-slate-400 text-slate-600 leading-relaxed font-normal">
            When key engineers leave, systems scale, or teams reorganize, the critical <strong className="dark:text-white text-slate-900 font-semibold">“why”</strong> vanishes into private messages, buried wikis, and forgotten commits.
          </p>
        </div>

        {/* Visual Comparison Stage: Unresolved vs Resolved */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-stretch">
          
          {/* Left: The Frustration & Scattered State */}
          <div className="p-7 sm:p-8 rounded-2xl dark:bg-[#0E1626]/90 bg-white/90 dark:border-[#1B2945] border-slate-200 flex flex-col justify-between space-y-6 shadow-md backdrop-blur-md">
            <div className="space-y-4">
              <div className="flex items-center justify-between border-b dark:border-[#1B2945] border-slate-200 pb-3">
                <div className="flex items-center space-x-2.5 text-rose-500 dark:text-rose-400 text-xs font-mono font-bold">
                  <AlertCircle className="w-4 h-4" />
                  <span>WITHOUT RETRACE • UNRESOLVED UNCERTAINTY</span>
                </div>
                <span className="text-[10px] font-mono dark:text-slate-400 text-slate-500">STATUS: BLOCKED</span>
              </div>

              {/* Engineer Dilemma Persona Graphic */}
              <div className="p-5 rounded-xl dark:bg-[#070B14] bg-slate-50 dark:border-[#1B2945] border-slate-200 space-y-3">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 rounded-full bg-rose-500/10 border border-rose-500/30 flex items-center justify-center text-rose-500 dark:text-rose-400 font-bold text-sm">
                    <User className="w-5 h-5 text-rose-500 dark:text-rose-400" />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold dark:text-white text-slate-900">Staff Engineer Onboarding</h3>
                    <p className="text-[11px] font-mono dark:text-slate-400 text-slate-600">&ldquo;Why did we choose PostgreSQL and not standard Redis for vectors?&rdquo;</p>
                  </div>
                </div>

                <div className="space-y-2 pt-2 border-t dark:border-[#1B2945]/70 border-slate-200 text-xs font-mono dark:text-slate-400 text-slate-600">
                  <div className="flex items-center space-x-2 text-rose-600 dark:text-rose-300">
                    <span>✕</span>
                    <span>ADR-042 author left company 9 months ago</span>
                  </div>
                  <div className="flex items-center space-x-2 text-rose-600 dark:text-rose-300">
                    <span>✕</span>
                    <span>Slack discussion buried across archived channels</span>
                  </div>
                  <div className="flex items-center space-x-2 text-rose-600 dark:text-rose-300">
                    <span>✕</span>
                    <span>PR description only says &ldquo;refactor database layer&rdquo;</span>
                  </div>
                </div>
              </div>

              {/* Scattered Physical Notes */}
              <div className="grid grid-cols-2 gap-3 pt-2">
                <div className="p-3 rounded-lg dark:bg-[#070B14] bg-slate-50 border border-dashed dark:border-[#2A3B5C] border-slate-300 text-[11px] font-mono dark:text-slate-400 text-slate-600">
                  <span className="text-rose-500 dark:text-rose-400 font-bold">#arch-council</span>
                  <p className="mt-1 dark:text-slate-300 text-slate-700 truncate">&ldquo;Can we afford the 2xlarge instance?&rdquo;</p>
                </div>
                <div className="p-3 rounded-lg dark:bg-[#070B14] bg-slate-50 border border-dashed dark:border-[#2A3B5C] border-slate-300 text-[11px] font-mono dark:text-slate-400 text-slate-600">
                  <span className="text-rose-500 dark:text-rose-400 font-bold">Git Commit 8f4a</span>
                  <p className="mt-1 dark:text-slate-300 text-slate-700 truncate">&ldquo;Emergency vector index fix&rdquo;</p>
                </div>
              </div>
            </div>

            <div className="text-xs font-mono dark:text-slate-400 text-slate-500 pt-2 border-t dark:border-[#1B2945] border-slate-200">
              Engineers waste hours searching for historical reasons or inadvertently repeat past mistakes.
            </div>
          </div>

          {/* Right: The ReTrace Solution & Connected State */}
          <div className="p-7 sm:p-8 rounded-2xl dark:bg-[#0E1626]/90 bg-white/90 border dark:border-sky-400/40 border-sky-300 shadow-xl flex flex-col justify-between space-y-6 relative overflow-hidden backdrop-blur-md">
            <div className="space-y-4">
              <div className="flex items-center justify-between border-b dark:border-[#1B2945] border-slate-200 pb-3">
                <div className="flex items-center space-x-2.5 text-sky-500 dark:text-sky-400 text-xs font-mono font-bold">
                  <CheckCircle2 className="w-4 h-4 text-emerald-500 dark:text-emerald-400" />
                  <span>WITH RETRACE • EVIDENCE CONNECTED</span>
                </div>
                <span className="stamp-badge text-emerald-500 dark:text-emerald-400 border-emerald-400/40">
                  CONTEXT CLEAR
                </span>
              </div>

              {/* Verified Reconstructed Narrative */}
              <div className="p-5 rounded-xl dark:bg-[#070B14] bg-sky-50/50 border dark:border-sky-400/30 border-sky-200 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-mono font-bold text-sky-600 dark:text-sky-400 uppercase tracking-widest">
                    RECONSTRUCTED DECISION TRAIL
                  </span>
                  <span className="text-[10px] font-mono text-emerald-600 dark:text-emerald-400 font-bold">
                    94% VERIFIED
                  </span>
                </div>

                <p className="text-xs sm:text-sm font-medium dark:text-white text-slate-900 leading-relaxed">
                  PostgreSQL with pgvector was selected in ADR-042 to satisfy PCI-DSS ledger requirements and avoid cross-network vector latency. Sizing was upgraded to db.r6g.2xlarge after memory locks occurred in Incident #88.
                </p>

                <div className="grid grid-cols-3 gap-2 pt-2 border-t dark:border-[#1B2945] border-slate-200 text-[10px] font-mono dark:text-slate-300 text-slate-700">
                  <div className="p-2 rounded dark:bg-[#0E1626] bg-white border dark:border-[#1B2945] border-slate-200 shadow-sm">
                    <span className="dark:text-slate-400 text-slate-500 block text-[8px]">WHO</span>
                    <span className="dark:text-sky-300 text-sky-700 font-bold truncate block">Alice Chen</span>
                  </div>
                  <div className="p-2 rounded dark:bg-[#0E1626] bg-white border dark:border-[#1B2945] border-slate-200 shadow-sm">
                    <span className="dark:text-slate-400 text-slate-500 block text-[8px]">WHEN</span>
                    <span className="dark:text-amber-300 text-amber-700 font-bold truncate block">Aug 12, 2024</span>
                  </div>
                  <div className="p-2 rounded dark:bg-[#0E1626] bg-white border dark:border-[#1B2945] border-slate-200 shadow-sm">
                    <span className="dark:text-slate-400 text-slate-500 block text-[8px]">EVIDENCE</span>
                    <span className="dark:text-emerald-300 text-emerald-700 font-bold truncate block">ADR + RFC + PR</span>
                  </div>
                </div>
              </div>

              {/* Verifiable Primary Sources */}
              <div className="space-y-1.5 pt-1">
                <span className="text-[10px] font-mono dark:text-slate-400 text-slate-500 uppercase">Primary Citations:</span>
                <div className="flex flex-wrap gap-2 text-[10px] font-mono">
                  <span className="px-2 py-1 rounded dark:bg-[#070B14] bg-slate-100 border dark:border-[#1B2945] border-slate-200 text-sky-600 dark:text-sky-300">✓ ADR-042 Approved</span>
                  <span className="px-2 py-1 rounded dark:bg-[#070B14] bg-slate-100 border dark:border-[#1B2945] border-slate-200 text-sky-600 dark:text-sky-300">✓ RFC-204 Specification</span>
                  <span className="px-2 py-1 rounded dark:bg-[#070B14] bg-slate-100 border dark:border-[#1B2945] border-slate-200 text-amber-600 dark:text-amber-300">✓ Postmortem #88</span>
                </div>
              </div>
            </div>

            <div className="text-xs font-mono text-emerald-600 dark:text-emerald-400/90 pt-2 border-t dark:border-[#1B2945] border-slate-200 flex items-center justify-between">
              <span>Now the context is clear.</span>
              <span className="text-[10px] dark:text-slate-400 text-slate-500">Zero ambiguity remaining</span>
            </div>
          </div>

        </div>

      </div>
    </section>
  );
}
