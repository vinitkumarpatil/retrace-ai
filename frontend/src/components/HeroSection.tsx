'use client';

import React, { useState } from 'react';
import {
  FileText,
  Search,
  CheckCircle2,
  Bookmark,
  ArrowRight,
  ArrowDown,
  Sparkles,
  UploadCloud,
  Layers,
  ShieldCheck,
  Zap,
} from 'lucide-react';

interface HeroSectionProps {
  onTryDemo: () => void;
  onUploadClick: () => void;
}

export default function HeroSection({ onTryDemo, onUploadClick }: HeroSectionProps) {
  const [activeStep, setActiveStep] = useState<number>(2);

  const steps = [
    {
      id: 0,
      title: 'Historical Documents',
      badge: 'INPUT',
      icon: FileText,
      color: 'from-amber-500 to-orange-500',
      tagColor: 'text-amber-400 bg-amber-500/10 border-amber-500/20',
      description: 'ADRs, Slack threads, RFCs, and incident postmortems.',
    },
    {
      id: 1,
      title: 'AI Forensic Engine',
      badge: 'SEARCH & RETRIEVAL',
      icon: Search,
      color: 'from-sky-500 to-cyan-400',
      tagColor: 'text-sky-400 bg-sky-500/10 border-sky-500/20',
      description: 'Hybrid vector embeddings + causal entity graph correlation.',
    },
    {
      id: 2,
      title: 'Verified Decision',
      badge: 'OUTPUT',
      icon: CheckCircle2,
      color: 'from-emerald-500 to-teal-400',
      tagColor: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20',
      description: 'Exact explanation of what was approved, when, and who signed off.',
    },
    {
      id: 3,
      title: 'Supporting Evidence',
      badge: 'PROOFS',
      icon: Bookmark,
      color: 'from-indigo-500 to-purple-500',
      tagColor: 'text-indigo-400 bg-indigo-500/10 border-indigo-500/20',
      description: 'Direct verbatim quotes with zero-hallucination verification.',
    },
  ];

  return (
    <section id="hero" className="relative pt-12 pb-20 md:pt-20 md:pb-28 overflow-hidden">
      {/* Background Subtle Glowing Gradients */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[36rem] h-[24rem] bg-sky-500/10 rounded-full blur-[140px] pointer-events-none -z-10" />
      <div className="absolute top-1/3 right-10 w-[24rem] h-[24rem] bg-indigo-500/10 rounded-full blur-[120px] pointer-events-none -z-10" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8 items-center">
          
          {/* Left Column: Content */}
          <div className="lg:col-span-6 space-y-6 text-center lg:text-left">
            {/* Badge */}
            <div className="inline-flex items-center space-x-2 px-3.5 py-1.5 rounded-full bg-sky-500/10 border border-sky-500/30 text-sky-400 text-xs font-mono font-medium shadow-sm">
              <span className="w-2 h-2 rounded-full bg-sky-400 animate-ping" />
              <span>FORENSIC CONTEXT ENGINE</span>
            </div>

            {/* Main Heading */}
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-white leading-[1.12]">
              Understand <span className="text-transparent bg-clip-text bg-gradient-to-r from-sky-400 via-cyan-300 to-indigo-400">WHY</span>.
              <br />
              Not just WHAT.
            </h1>

            {/* Subtitle */}
            <p className="text-base sm:text-lg text-slate-300 max-w-xl mx-auto lg:mx-0 leading-relaxed font-normal">
              ReTrace helps you recover the reasoning behind important engineering decisions using historical documents and verified evidence.
            </p>

            {/* Action Buttons */}
            <div className="flex flex-wrap items-center justify-center lg:justify-start gap-4 pt-2">
              <button
                onClick={onTryDemo}
                className="px-6 py-3.5 rounded-xl font-semibold text-slate-950 bg-gradient-to-r from-sky-400 via-sky-300 to-indigo-400 hover:from-sky-300 hover:to-indigo-300 shadow-xl shadow-sky-500/25 transition-all flex items-center space-x-2 hover:-translate-y-0.5 active:scale-95 text-sm sm:text-base cursor-pointer"
              >
                <Zap className="w-4 h-4 fill-slate-950" />
                <span>Try Demo</span>
                <ArrowRight className="w-4 h-4" />
              </button>

              <button
                onClick={onUploadClick}
                className="px-6 py-3.5 rounded-xl font-semibold text-white bg-slate-900/80 hover:bg-slate-800 border border-slate-700 hover:border-slate-600 transition-all flex items-center space-x-2 hover:-translate-y-0.5 active:scale-95 text-sm sm:text-base shadow-sm cursor-pointer"
              >
                <UploadCloud className="w-4 h-4 text-sky-400" />
                <span>Upload Evidence</span>
              </button>
            </div>

            {/* Micro proof points */}
            <div className="pt-6 border-t border-slate-800/80 flex flex-wrap items-center justify-center lg:justify-start gap-6 text-xs text-slate-400 font-mono">
              <div className="flex items-center space-x-1.5">
                <ShieldCheck className="w-4 h-4 text-emerald-400" />
                <span>Zero-Hallucination Policy</span>
              </div>
              <div className="flex items-center space-x-1.5">
                <Sparkles className="w-4 h-4 text-sky-400" />
                <span>Verbatim Citations</span>
              </div>
              <div className="flex items-center space-x-1.5">
                <CheckCircle2 className="w-4 h-4 text-indigo-400" />
                <span>Causal Audit Trail</span>
              </div>
            </div>
          </div>

          {/* Right Column: Visual Interactive Illustration */}
          <div className="lg:col-span-6 flex justify-center">
            <div className="w-full max-w-md bg-[#0F172A]/90 border border-slate-700/80 rounded-2xl p-6 shadow-2xl relative overflow-hidden backdrop-blur-sm">
              
              {/* Top Card Header */}
              <div className="flex items-center justify-between pb-4 mb-5 border-b border-slate-800 text-xs font-mono">
                <div className="flex items-center space-x-2 text-slate-400">
                  <div className="w-2.5 h-2.5 rounded-full bg-rose-500/80" />
                  <div className="w-2.5 h-2.5 rounded-full bg-amber-500/80" />
                  <div className="w-2.5 h-2.5 rounded-full bg-emerald-500/80" />
                  <span className="text-[11px] text-slate-400 ml-2">context_pipeline.svg</span>
                </div>
                <span className="text-[10px] text-sky-400 uppercase font-bold bg-sky-500/10 px-2 py-0.5 rounded border border-sky-500/20">
                  INTERACTIVE FLOW
                </span>
              </div>

              {/* Step Progression */}
              <div className="space-y-3">
                {steps.map((step, idx) => {
                  const Icon = step.icon;
                  const isActive = activeStep === step.id;

                  return (
                    <div key={step.id}>
                      <div
                        onClick={() => setActiveStep(step.id)}
                        className={`p-3.5 rounded-xl border transition-all cursor-pointer flex items-start space-x-3.5 ${
                          isActive
                            ? 'bg-[#1E293B] border-sky-500/60 shadow-lg shadow-sky-500/10 scale-[1.02]'
                            : 'bg-slate-900/60 border-slate-800/80 hover:border-slate-700 hover:bg-slate-900'
                        }`}
                      >
                        <div
                          className={`p-2.5 rounded-xl bg-gradient-to-br ${step.color} text-white shadow-md shrink-0`}
                        >
                          <Icon className="w-4 h-4" />
                        </div>

                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between gap-2">
                            <h4 className="text-xs font-bold text-white tracking-wide">
                              {step.title}
                            </h4>
                            <span
                              className={`text-[9px] font-mono px-2 py-0.5 rounded-full border uppercase font-bold ${step.tagColor}`}
                            >
                              {step.badge}
                            </span>
                          </div>
                          <p className="text-[11px] text-slate-400 mt-1 leading-relaxed">
                            {step.description}
                          </p>
                        </div>
                      </div>

                      {/* Animated Connector Arrow between steps */}
                      {idx < steps.length - 1 && (
                        <div className="flex justify-center py-1">
                          <div className="w-0.5 h-3 bg-gradient-to-b from-slate-700 to-slate-800 relative">
                            <div className="w-1 h-1 rounded-full bg-sky-400 absolute left-[-1px] animate-pulse" />
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>

              {/* Active Step Footnote */}
              <div className="mt-5 pt-3.5 border-t border-slate-800/80 flex items-center justify-between text-[11px] font-mono text-slate-400">
                <span>Click any stage to examine</span>
                <span className="text-sky-400 font-bold">STAGE {activeStep + 1} OF 4</span>
              </div>

            </div>
          </div>

        </div>
      </div>
    </section>
  );
}
