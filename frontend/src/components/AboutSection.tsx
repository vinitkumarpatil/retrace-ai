'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { Brain, ShieldCheck, Database, CheckCircle2 } from 'lucide-react';
import { useCursor } from '@/context/CursorContext';

export default function AboutSection() {
  const { setCursor, resetCursor } = useCursor();

  return (
    <section id="about" className="py-20 md:py-28 dark:bg-[#070B14]/75 bg-slate-100/60 backdrop-blur-[2px] border-b dark:border-[#1B2945]/70 border-slate-200/80 relative">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
        
        {/* Header */}
        <div className="text-center space-y-3 max-w-2xl mx-auto">
          <div className="inline-flex items-center space-x-2 px-3 py-1 rounded border dark:border-[#2A3B5C] border-sky-300/40 dark:bg-[#0E1626] bg-sky-50 dark:text-sky-400 text-sky-700 text-[10px] font-mono uppercase tracking-widest">
            <span>ABOUT RETRACE</span>
          </div>
          <h2 className="text-3xl sm:text-4xl font-extrabold dark:text-white text-slate-900 tracking-tight">
            Institutional Memory for Engineering
          </h2>
          <p className="text-sm sm:text-base dark:text-slate-400 text-slate-600 font-normal">
            Code tells you <em className="dark:text-white text-slate-900 font-semibold not-italic">what</em> the system does. ReTrace tells you <em className="dark:text-white text-slate-900 font-semibold not-italic">why</em> it was built that way.
          </p>
        </div>

        {/* 3 Editorial Fact Columns */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="p-7 rounded-xl dark:bg-[#0E1626]/90 bg-white/90 dark:border-[#1B2945] border-slate-200 shadow-md backdrop-blur-md space-y-3">
            <div className="w-10 h-10 rounded-lg dark:bg-[#070B14] bg-sky-50 dark:border-[#2A3B5C] border-sky-200 flex items-center justify-center text-sky-500 dark:text-sky-400">
              <Brain className="w-5 h-5" />
            </div>
            <h3 className="text-base font-bold dark:text-white text-slate-900">
              Prevent Context Drift
            </h3>
            <p className="text-xs sm:text-sm dark:text-slate-400 text-slate-600 leading-relaxed font-normal">
              When senior architects move on, architectural intent drifts. ReTrace indexes every RFC, ADR, and incident to make reasoning persistent and discoverable.
            </p>
          </div>

          <div className="p-7 rounded-xl dark:bg-[#0E1626]/90 bg-white/90 dark:border-[#1B2945] border-slate-200 shadow-md backdrop-blur-md space-y-3">
            <div className="w-10 h-10 rounded-lg dark:bg-[#070B14] bg-emerald-50 dark:border-[#2A3B5C] border-emerald-200 flex items-center justify-center text-emerald-500 dark:text-emerald-400">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <h3 className="text-base font-bold dark:text-white text-slate-900">
              Zero-Hallucination Grounding
            </h3>
            <p className="text-xs sm:text-sm dark:text-slate-400 text-slate-600 leading-relaxed font-normal">
              Every sentence in an executive answer links to an authenticated markdown file, chat log, or commit hash. If evidence does not exist, ReTrace explicitly flags the gap.
            </p>
          </div>

          <div className="p-7 rounded-xl dark:bg-[#0E1626]/90 bg-white/90 dark:border-[#1B2945] border-slate-200 shadow-md backdrop-blur-md space-y-3">
            <div className="w-10 h-10 rounded-lg dark:bg-[#070B14] bg-amber-50 dark:border-[#2A3B5C] border-amber-200 flex items-center justify-center text-amber-500 dark:text-amber-400">
              <Database className="w-5 h-5" />
            </div>
            <h3 className="text-base font-bold dark:text-white text-slate-900">
              Deterministic Audits
            </h3>
            <p className="text-xs sm:text-sm dark:text-slate-400 text-slate-600 leading-relaxed font-normal">
              Prepare for security reviews, compliance certifications, or post-incident retrospectives in seconds rather than spending weeks digging through git blame logs.
            </p>
          </div>
        </div>

      </div>
    </section>
  );
}
