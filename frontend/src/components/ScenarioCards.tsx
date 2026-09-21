'use client';

import React from 'react';
import { ArrowRight, Database, AlertOctagon, Server, Cpu, Sparkles } from 'lucide-react';

interface ScenarioCardsProps {
  onSelect: (query: string) => void;
  isLoading: boolean;
}

const SCENARIOS = [
  {
    category: 'ARCHITECTURE',
    categoryColor: 'text-[#00F2FE] border-[#00F2FE]/30 bg-[#00F2FE]/10',
    icon: Database,
    question: 'Why did we migrate to PostgreSQL and change the vector index on August 12?',
    evidenceCount: '7 artifacts',
    date: 'August 2024',
  },
  {
    category: 'INCIDENT',
    categoryColor: 'text-[#EF4444] border-[#EF4444]/30 bg-[#EF4444]/10',
    icon: AlertOctagon,
    question: 'What happened during Incident Retrospective #88 and what was decided?',
    evidenceCount: '4 artifacts',
    date: 'August 2024',
  },
  {
    category: 'INFRASTRUCTURE',
    categoryColor: 'text-[#10B981] border-[#10B981]/30 bg-[#10B981]/10',
    icon: Server,
    question: 'Who approved scaling the AWS RDS instances to db.r6g.2xlarge?',
    evidenceCount: '3 artifacts',
    date: 'August 2024',
  },
  {
    category: 'TECHNOLOGY',
    categoryColor: 'text-[#8B5CF6] border-[#8B5CF6]/30 bg-[#8B5CF6]/10',
    icon: Cpu,
    question: 'Why was MongoDB rejected for the Order and Payment domains?',
    evidenceCount: '5 artifacts',
    date: 'July 2024',
  },
];

export default function ScenarioCards({ onSelect, isLoading }: ScenarioCardsProps) {
  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between text-xs font-mono">
        <div className="flex items-center space-x-2 text-white font-bold tracking-wider uppercase">
          <Sparkles className="w-3.5 h-3.5 text-[#00F2FE]" />
          <span>TRY AN INVESTIGATION</span>
        </div>
        <span className="text-[10px] text-[#94A3B8]">Click any scenario to reconstruct</span>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        {SCENARIOS.map((item, idx) => {
          const Icon = item.icon;

          return (
            <button
              key={idx}
              disabled={isLoading}
              onClick={() => onSelect(item.question)}
              className="p-4 rounded-xl bg-[#101722] border border-[#243044] hover:border-[#334155] hover:bg-[#151D29] text-left transition-all duration-200 shadow-md group flex flex-col justify-between relative overflow-hidden"
            >
              <div>
                <div className="flex items-center justify-between gap-1 mb-2.5">
                  <span
                    className={`text-[9px] font-mono uppercase px-2 py-0.5 rounded font-bold border ${item.categoryColor}`}
                  >
                    {item.category}
                  </span>
                  <span className="text-[10px] font-mono text-[#64748B]">
                    {item.date}
                  </span>
                </div>

                <p className="text-xs font-semibold text-slate-100 font-sans leading-snug group-hover:text-white transition-colors mb-3">
                  {item.question}
                </p>
              </div>

              <div className="pt-2.5 border-t border-[#243044] flex items-center justify-between text-[10px] font-mono text-[#94A3B8]">
                <span>{item.evidenceCount}</span>
                <span className="text-[#00F2FE] group-hover:translate-x-1 transition-transform flex items-center space-x-1 font-bold">
                  <span>Investigate</span>
                  <ArrowRight className="w-3 h-3" />
                </span>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}
