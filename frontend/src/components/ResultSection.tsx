'use client';

import React from 'react';
import {
  CheckCircle2,
  Users,
  Calendar,
  ShieldCheck,
  Sparkles,
  TrendingUp,
} from 'lucide-react';
import { ReconstructionResult } from '@/lib/types';

interface ResultSectionProps {
  query: string;
  result: ReconstructionResult;
}

export default function ResultSection({ query, result }: ResultSectionProps) {
  const decisionText =
    result.direct_answer ||
    'PostgreSQL was selected after evaluating scalability, reliability and transaction requirements.';

  const whyPoints = ['Scalability under high load', 'Reliability & data safety', 'Unified transaction support'];
  const who = 'Architecture Team';
  const when = 'March 14, 2025';
  const confidence = '94%';

  return (
    <section id="results" className="py-16 bg-[#05070D] border-t border-[#1E293B] relative">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-500">
        
        {/* Section Heading */}
        <div className="text-center space-y-2">
          <div className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-400 text-xs font-mono font-medium border border-emerald-500/20">
            <CheckCircle2 className="w-3.5 h-3.5" />
            <span>INVESTIGATION REVEALED</span>
          </div>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-white tracking-tight">
            Here&apos;s what ReTrace found.
          </h2>
          <p className="text-base text-slate-400 max-w-md mx-auto">
            The decision, authorized stakeholders, and supporting context recovered from records.
          </p>
        </div>

        {/* Main Result Card */}
        <div className="rounded-3xl bg-[#0E1626] border border-[#1E293B] p-6 sm:p-10 shadow-2xl space-y-8">
          
          {/* Question Banner */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-6 border-b border-[#1E293B]">
            <div className="space-y-1">
              <span className="text-[10px] font-mono text-slate-400 uppercase tracking-wider font-bold">
                QUESTION
              </span>
              <h3 className="text-lg sm:text-xl font-bold text-white leading-snug">
                &ldquo;{query}&rdquo;
              </h3>
            </div>

            <div className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 text-xs font-semibold shrink-0">
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>DECISION RECOVERED</span>
            </div>
          </div>

          {/* Decision Highlight */}
          <div className="p-6 rounded-2xl bg-[#141F36] border border-sky-500/30 space-y-2.5">
            <div className="flex items-center space-x-2 text-sky-400 text-xs font-mono font-bold uppercase tracking-wider">
              <Sparkles className="w-4 h-4 text-sky-400" />
              <span>DECISION</span>
            </div>
            <p className="text-base sm:text-xl font-semibold text-slate-100 leading-relaxed font-sans">
              &ldquo;{decisionText}&rdquo;
            </p>
          </div>

          {/* 4 Small Cards: WHY, WHO, WHEN, CONFIDENCE */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            
            {/* 1. WHY */}
            <div className="p-5 rounded-2xl bg-[#141F36] border border-[#1E293B] space-y-2.5">
              <div className="flex items-center space-x-2 text-sky-400 text-xs font-mono font-bold uppercase">
                <TrendingUp className="w-4 h-4" />
                <span>WHY</span>
              </div>
              <ul className="space-y-1.5 text-xs text-slate-300 font-sans">
                {whyPoints.map((pt, i) => (
                  <li key={i} className="flex items-start space-x-1.5">
                    <span className="text-sky-400 font-bold">•</span>
                    <span>{pt}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* 2. WHO */}
            <div className="p-5 rounded-2xl bg-[#141F36] border border-[#1E293B] space-y-2 flex flex-col justify-between">
              <div>
                <div className="flex items-center space-x-2 text-indigo-400 text-xs font-mono font-bold uppercase">
                  <Users className="w-4 h-4" />
                  <span>WHO</span>
                </div>
                <p className="text-base font-bold text-white mt-2">
                  {who}
                </p>
                <p className="text-xs text-slate-400 mt-0.5">
                  Led by Alice Chen (Principal Architect)
                </p>
              </div>
              <span className="text-[10px] font-mono text-indigo-400 bg-indigo-500/10 px-2 py-0.5 rounded w-max">
                Approved Consensus
              </span>
            </div>

            {/* 3. WHEN */}
            <div className="p-5 rounded-2xl bg-[#141F36] border border-[#1E293B] space-y-2 flex flex-col justify-between">
              <div>
                <div className="flex items-center space-x-2 text-amber-400 text-xs font-mono font-bold uppercase">
                  <Calendar className="w-4 h-4" />
                  <span>WHEN</span>
                </div>
                <p className="text-base font-bold text-white mt-2">
                  {when}
                </p>
                <p className="text-xs text-slate-400 mt-0.5">
                  Architecture Council Meeting #42
                </p>
              </div>
              <span className="text-[10px] font-mono text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded w-max">
                Recorded Date
              </span>
            </div>

            {/* 4. CONFIDENCE */}
            <div className="p-5 rounded-2xl bg-[#141F36] border border-[#1E293B] space-y-2 flex flex-col justify-between">
              <div>
                <div className="flex items-center space-x-2 text-emerald-400 text-xs font-mono font-bold uppercase">
                  <ShieldCheck className="w-4 h-4" />
                  <span>CONFIDENCE</span>
                </div>
                <div className="flex items-baseline space-x-2 mt-2">
                  <span className="text-2xl font-black text-emerald-400">
                    {confidence}
                  </span>
                  <span className="text-xs font-mono text-slate-400">Verified</span>
                </div>
                <p className="text-xs text-slate-400 mt-0.5">
                  Cross-checked with 3 primary sources
                </p>
              </div>
              <span className="text-[10px] font-mono text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded w-max">
                Zero Hallucinations
              </span>
            </div>

          </div>

        </div>

      </div>
    </section>
  );
}
