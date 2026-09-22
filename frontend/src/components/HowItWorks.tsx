'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { UploadCloud, GitBranch, CheckCircle2, ArrowRight } from 'lucide-react';
import { useCursor } from '@/context/CursorContext';

const STEPS = [
  {
    number: '01',
    stage: 'COLLECT',
    headline: 'Documents Enter ReTrace',
    description:
      'Upload Architecture Decision Records, RFC specifications, incident postmortems, or Slack transcripts. Formats include Markdown, PDF, TXT, and JSON.',
    icon: UploadCloud,
    meta: 'ALL REPOSITORIES',
  },
  {
    number: '02',
    stage: 'CONNECT',
    headline: 'Related Evidence is Connected',
    description:
      'ReTrace parses technical entities, dates, authors, and tradeoffs. Causal lines link proposals to commit merges and post-incident retro items.',
    icon: GitBranch,
    meta: 'CAUSAL LINKING',
  },
  {
    number: '03',
    stage: 'RECOVER',
    headline: 'The Decision Context Emerges',
    description:
      'Ask any fuzzy inquiry in natural language. Receive the executive direct answer, verifiable reasoning trail, and exact primary source citations.',
    icon: CheckCircle2,
    meta: 'AUDIT GROUNDED',
  },
];

export default function HowItWorks() {
  const { setCursor, resetCursor } = useCursor();

  return (
    <section id="how-it-works" className="py-20 md:py-28 dark:bg-[#0A0F1D]/75 bg-slate-50/70 backdrop-blur-[2px] border-b dark:border-[#1B2945]/70 border-slate-200/80 relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-16">
        
        {/* Header */}
        <div className="text-center space-y-3 max-w-2xl mx-auto">
          <div className="inline-flex items-center space-x-2 px-3 py-1 rounded border dark:border-[#2A3B5C] border-sky-300/40 dark:bg-[#0E1626] bg-sky-50 dark:text-sky-400 text-sky-700 text-[10px] font-mono uppercase tracking-widest">
            <span>THREE SIMPLE STEPS</span>
          </div>
          <h2 className="text-3xl sm:text-4xl font-extrabold dark:text-white text-slate-900 tracking-tight">
            How ReTrace Works
          </h2>
          <p className="text-sm sm:text-base dark:text-slate-400 text-slate-600 font-normal">
            No complex setup or training cycles. Drop in your files or connect repos to start recovering lost engineering context.
          </p>
        </div>

        {/* 3 Step Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {STEPS.map((step, idx) => {
            const Icon = step.icon;
            return (
              <motion.div
                key={step.number}
                initial={{ opacity: 0, y: 15 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: idx * 0.12 }}
                whileHover={{ y: -4 }}
                onMouseEnter={() => setCursor(`0${idx + 1}`, 'card')}
                onMouseLeave={resetCursor}
                className="p-7 rounded-2xl dark:bg-[#0E1626]/90 bg-white/90 dark:border-[#1B2945] border-slate-200 hover:border-sky-400/50 shadow-xl transition-all flex flex-col justify-between space-y-6 group backdrop-blur-md"
              >
                <div className="space-y-4">
                  <div className="flex items-center justify-between border-b dark:border-[#1B2945] border-slate-200 pb-3">
                    <span className="text-3xl font-mono font-black dark:text-slate-600 text-slate-300 group-hover:text-sky-500 transition-colors">
                      {step.number}
                    </span>
                    <span className="stamp-badge text-sky-500 dark:text-sky-400 border-sky-400/30">
                      {step.stage}
                    </span>
                  </div>

                  <div className="w-10 h-10 rounded-lg dark:bg-[#070B14] bg-sky-50 dark:border-[#2A3B5C] border-sky-200 flex items-center justify-center">
                    <Icon className="w-5 h-5 text-sky-500 dark:text-sky-400" />
                  </div>

                  <div className="space-y-2">
                    <h3 className="text-lg font-bold dark:text-white text-slate-900">
                      {step.headline}
                    </h3>
                    <p className="text-xs sm:text-sm dark:text-slate-400 text-slate-600 leading-relaxed font-normal">
                      {step.description}
                    </p>
                  </div>
                </div>

                <div className="pt-3 border-t dark:border-[#1B2945] border-slate-200 flex items-center justify-between text-[11px] font-mono dark:text-slate-400 text-slate-500">
                  <span>{step.meta}</span>
                  <ArrowRight className="w-3.5 h-3.5 text-sky-500 dark:text-sky-400 group-hover:translate-x-1 transition-transform" />
                </div>
              </motion.div>
            );
          })}
        </div>

      </div>
    </section>
  );
}
