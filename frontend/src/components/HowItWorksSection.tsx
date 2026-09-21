'use client';

import React from 'react';
import { UploadCloud, Search, Lightbulb, ArrowRight, ShieldCheck, Cpu, FileCheck } from 'lucide-react';

export default function HowItWorksSection() {
  const steps = [
    {
      step: '01',
      badge: 'STEP 1',
      title: 'Upload Evidence',
      icon: UploadCloud,
      color: 'from-amber-400 to-orange-500',
      bgColor: 'bg-amber-500/10 border-amber-500/30 text-amber-400',
      description:
        'Upload ADRs, technical specifications, pull requests, postmortems, or Slack exports in PDF, DOCX, TXT, or Markdown.',
      highlight: 'Automated multi-modal indexing & entity chunking',
    },
    {
      step: '02',
      badge: 'STEP 2',
      title: 'ReTrace Correlation',
      icon: Search,
      color: 'from-sky-400 to-cyan-400',
      bgColor: 'bg-sky-500/10 border-sky-500/30 text-sky-400',
      description:
        'ReTrace crawls vector embeddings and causal entity graphs to connect proposals, stakeholders, dates, and recorded trade-offs.',
      highlight: 'Hybrid BM25 + pgvector causal correlation',
    },
    {
      step: '03',
      badge: 'STEP 3',
      title: 'Understand the WHY',
      icon: Lightbulb,
      color: 'from-emerald-400 to-teal-400',
      bgColor: 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400',
      description:
        'Receive the exact rationale, authorized sign-offs, timestamps, and verbatim citations backing every single claim.',
      highlight: 'Strict Zero-Hallucination verification policy',
    },
  ];

  return (
    <section id="how-it-works" className="py-20 bg-[#0A0F1D] relative overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
        
        {/* Section Header */}
        <div className="text-center max-w-2xl mx-auto space-y-3">
          <div className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full bg-slate-800 text-slate-300 text-xs font-mono font-medium border border-slate-700">
            <span>METHODOLOGY</span>
          </div>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
            How ReTrace Works
          </h2>
          <p className="text-sm sm:text-base text-slate-400">
            Transform fragmented engineering records into an undeniable, verified decision trail in 3 simple steps.
          </p>
        </div>

        {/* 3 Step Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 relative">
          {steps.map((st, idx) => {
            const Icon = st.icon;

            return (
              <div
                key={idx}
                className="relative rounded-2xl bg-[#0F172A] border border-slate-800 p-8 shadow-xl hover:border-slate-700 hover:bg-[#1E293B]/70 transition-all duration-300 flex flex-col justify-between group hover:-translate-y-1"
              >
                {/* Step Number Top Badge */}
                <div className="flex items-center justify-between pb-6 border-b border-slate-800/80">
                  <span
                    className={`text-xs font-mono font-bold px-2.5 py-1 rounded-full border ${st.bgColor}`}
                  >
                    {st.badge}
                  </span>
                  <span className="text-3xl font-black text-slate-800 group-hover:text-slate-700 font-mono transition-colors">
                    {st.step}
                  </span>
                </div>

                {/* Card Main Body */}
                <div className="py-6 space-y-4">
                  <div
                    className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${st.color} text-slate-950 flex items-center justify-center shadow-lg shadow-sky-500/10 group-hover:scale-110 transition-transform`}
                  >
                    <Icon className="w-7 h-7" />
                  </div>

                  <h3 className="text-xl font-bold text-white tracking-tight">
                    {st.title}
                  </h3>

                  <p className="text-sm text-slate-400 leading-relaxed">
                    {st.description}
                  </p>
                </div>

                {/* Card Highlight Footer */}
                <div className="pt-4 border-t border-slate-800/80 flex items-center space-x-2 text-xs font-mono text-slate-400">
                  <FileCheck className="w-4 h-4 text-sky-400 shrink-0" />
                  <span>{st.highlight}</span>
                </div>
              </div>
            );
          })}
        </div>

      </div>
    </section>
  );
}
