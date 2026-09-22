'use client';

import React from 'react';
import { ArrowRight, Compass, Database, AlertOctagon, Server, CreditCard } from 'lucide-react';

interface DemoScenariosSectionProps {
  onSelectScenario: (query: string) => void;
  isLoading: boolean;
}

const EXPLORE_CARDS = [
  {
    id: 'arch',
    tag: 'ARCHITECTURE',
    title: 'PostgreSQL Migration',
    question: 'Why did we migrate to PostgreSQL and change the vector index on August 12?',
    description: 'Decoupling monolithic Django data and selecting pgvector over dedicated vector clusters.',
    icon: Database,
    color: 'hover:border-sky-500/50',
    btnColor: 'text-sky-400 bg-sky-500/10 border-sky-500/30 hover:bg-sky-500/20',
  },
  {
    id: 'inc',
    tag: 'INCIDENT',
    title: 'Incident Retrospective #88',
    question: 'What happened during Incident #88 and what architectural safeguards were decided?',
    description: 'Analyzing database connection exhaustion and mandated pgBouncer connection pooling.',
    icon: AlertOctagon,
    color: 'hover:border-rose-500/50',
    btnColor: 'text-rose-400 bg-rose-500/10 border-rose-500/30 hover:bg-rose-500/20',
  },
  {
    id: 'infra',
    tag: 'INFRASTRUCTURE',
    title: 'AWS RDS Scaling Approval',
    question: 'Why was AWS RDS scaled to db.r6g.2xlarge and who approved the budget?',
    description: 'Memory footprint sizing to ensure 48GB HNSW vector index remains fully memory-resident.',
    icon: Server,
    color: 'hover:border-emerald-500/50',
    btnColor: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/30 hover:bg-emerald-500/20',
  },
  {
    id: 'tech',
    tag: 'TECHNOLOGY',
    title: 'MongoDB Rejection Rationale',
    question: 'Why was MongoDB rejected for the Order and Payment domains?',
    description: 'Benchmark evaluation of distributed multi-document ACID transactions and PCI-DSS compliance.',
    icon: CreditCard,
    color: 'hover:border-purple-500/50',
    btnColor: 'text-purple-400 bg-purple-500/10 border-purple-500/30 hover:bg-purple-500/20',
  },
];

export default function DemoScenariosSection({
  onSelectScenario,
  isLoading,
}: DemoScenariosSectionProps) {
  return (
    <section id="explore" className="py-24 bg-[#05070D] border-t border-[#1E293B] relative">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
        
        {/* Section Header */}
        <div className="text-center space-y-3">
          <div className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full bg-sky-500/10 text-sky-400 text-xs font-mono font-medium border border-sky-500/20">
            <Compass className="w-3.5 h-3.5" />
            <span>REAL-WORLD SCENARIOS</span>
          </div>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-white tracking-tight">
            Explore ReTrace
          </h2>
          <p className="text-base sm:text-lg text-slate-400 max-w-lg mx-auto">
            Choose a case study to see how ReTrace uncovers the complete story behind technical milestones.
          </p>
        </div>

        {/* 4 Cards Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {EXPLORE_CARDS.map((card) => {
            const Icon = card.icon;
            return (
              <div
                key={card.id}
                className={`p-6 rounded-3xl bg-[#0E1626] border border-[#1E293B] shadow-xl hover:bg-[#141F36] transition-all duration-300 flex flex-col justify-between group hover:-translate-y-1.5 ${card.color}`}
              >
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="p-3 rounded-2xl bg-[#141F36] border border-[#1E293B] group-hover:scale-110 transition-transform text-sky-400">
                      <Icon className="w-5 h-5" />
                    </div>
                    <span className="text-[10px] font-mono uppercase px-2.5 py-0.5 rounded-full border border-slate-700 bg-slate-800 text-slate-300 font-bold">
                      {card.tag}
                    </span>
                  </div>

                  <div className="space-y-1.5">
                    <h3 className="text-base font-bold text-white group-hover:text-sky-300 transition-colors">
                      {card.title}
                    </h3>
                    <p className="text-xs text-slate-300 leading-relaxed font-sans font-medium">
                      &ldquo;{card.question}&rdquo;
                    </p>
                    <p className="text-[11px] text-slate-400 leading-relaxed font-sans pt-1">
                      {card.description}
                    </p>
                  </div>
                </div>

                {/* Bottom Action Button */}
                <div className="pt-5 mt-4 border-t border-[#1E293B]">
                  <button
                    type="button"
                    onClick={() => onSelectScenario(card.question)}
                    disabled={isLoading}
                    className={`w-full py-2.5 px-4 rounded-xl text-xs font-mono font-bold border flex items-center justify-center space-x-2 transition-all active:scale-95 cursor-pointer shadow-sm ${card.btnColor}`}
                  >
                    <span>START INVESTIGATION</span>
                    <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>

      </div>
    </section>
  );
}
