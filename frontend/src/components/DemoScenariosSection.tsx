'use client';

import React from 'react';
import { ArrowRight, Database, AlertOctagon, Server, CreditCard, Sparkles, Compass } from 'lucide-react';

interface DemoScenariosSectionProps {
  onSelectScenario: (query: string) => void;
  isLoading: boolean;
}

const DEMOS = [
  {
    id: 1,
    tag: 'ARCHITECTURE',
    emoji: '🏗️',
    title: 'PostgreSQL Migration',
    question: 'Why did we migrate to PostgreSQL and change the vector index on August 12?',
    date: 'August 2024',
    sourcesCount: '7 records',
    border: 'hover:border-sky-500/60',
    color: 'from-sky-500/20 to-indigo-500/10 text-sky-400',
    buttonColor: 'bg-sky-500/10 hover:bg-sky-500/20 text-sky-400 border-sky-500/30',
  },
  {
    id: 2,
    tag: 'INCIDENT',
    emoji: '🚨',
    title: 'Incident Retrospective #88',
    question: 'What happened during Incident #88 and what architectural safeguards were decided?',
    date: 'August 2024',
    sourcesCount: '4 records',
    border: 'hover:border-rose-500/60',
    color: 'from-rose-500/20 to-pink-500/10 text-rose-400',
    buttonColor: 'bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border-rose-500/30',
  },
  {
    id: 3,
    tag: 'INFRASTRUCTURE',
    emoji: '☁️',
    title: 'AWS RDS Scaling Approval',
    question: 'Why was AWS RDS scaled to db.r6g.2xlarge and who approved the budget?',
    date: 'July 2024',
    sourcesCount: '3 records',
    border: 'hover:border-emerald-500/60',
    color: 'from-emerald-500/20 to-teal-500/10 text-emerald-400',
    buttonColor: 'bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 border-emerald-500/30',
  },
  {
    id: 4,
    tag: 'TECHNOLOGY',
    emoji: '💳',
    title: 'MongoDB Rejection Rationale',
    question: 'Why was MongoDB rejected for the Order and Payment domains?',
    date: 'July 2024',
    sourcesCount: '5 records',
    border: 'hover:border-purple-500/60',
    color: 'from-purple-500/20 to-violet-500/10 text-purple-400',
    buttonColor: 'bg-purple-500/10 hover:bg-purple-500/20 text-purple-400 border-purple-500/30',
  },
];

export default function DemoScenariosSection({
  onSelectScenario,
  isLoading,
}: DemoScenariosSectionProps) {
  return (
    <section id="explore" className="py-20 bg-[#0A0F1D] relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
        
        {/* Header */}
        <div className="text-center max-w-2xl mx-auto space-y-3">
          <div className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full bg-indigo-500/10 text-indigo-400 text-xs font-mono font-medium border border-indigo-500/20">
            <Compass className="w-3.5 h-3.5" />
            <span>INTERACTIVE SCENARIOS</span>
          </div>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
            Explore a Demo
          </h2>
          <p className="text-sm sm:text-base text-slate-400">
            Choose a real-world scenario from Project Meridian to see ReTrace reconstruct the decision in real-time.
          </p>
        </div>

        {/* 4 Cards Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {DEMOS.map((d) => (
            <div
              key={d.id}
              className={`rounded-2xl bg-[#0F172A] border border-slate-800 p-6 shadow-xl transition-all duration-300 flex flex-col justify-between group hover:-translate-y-1 ${d.border}`}
            >
              <div className="space-y-4">
                {/* Header row */}
                <div className="flex items-center justify-between">
                  <span className="text-2xl">{d.emoji}</span>
                  <span className="text-[10px] font-mono px-2.5 py-0.5 rounded-full uppercase font-bold border border-slate-700 bg-slate-800 text-slate-300">
                    {d.tag}
                  </span>
                </div>

                <div className="space-y-1.5">
                  <h3 className="text-base font-bold text-white group-hover:text-sky-300 transition-colors">
                    {d.title}
                  </h3>
                  <p className="text-xs text-slate-400 leading-relaxed font-sans line-clamp-3">
                    &ldquo;{d.question}&rdquo;
                  </p>
                </div>
              </div>

              {/* Bottom footer with Explore button */}
              <div className="pt-5 mt-4 border-t border-slate-800/80 space-y-3">
                <div className="flex items-center justify-between text-[11px] font-mono text-slate-400">
                  <span>{d.date}</span>
                  <span className="text-slate-300">{d.sourcesCount}</span>
                </div>

                <button
                  type="button"
                  onClick={() => onSelectScenario(d.question)}
                  disabled={isLoading}
                  className={`w-full py-2.5 px-4 rounded-xl text-xs font-semibold border flex items-center justify-center space-x-2 transition-all active:scale-95 cursor-pointer ${d.buttonColor}`}
                >
                  <span>Explore Scenario</span>
                  <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                </button>
              </div>
            </div>
          ))}
        </div>

      </div>
    </section>
  );
}
