'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { Sparkles, ArrowRight, Compass, ShieldAlert, Cpu, Database } from 'lucide-react';
import { DEMO_SCENARIOS } from '@/data/demoData';
import { useCursor } from '@/context/CursorContext';

interface DemoScenariosProps {
  onSelectScenario: (query: string) => void;
  isLoading: boolean;
}

export default function DemoScenarios({
  onSelectScenario,
  isLoading,
}: DemoScenariosProps) {
  const { setCursor, resetCursor } = useCursor();

  const scenarioList = Object.values(DEMO_SCENARIOS);

  const getIcon = (tag: string) => {
    switch (tag) {
      case 'ARCHITECTURE':
        return <Database className="w-5 h-5 text-cyan-400" />;
      case 'INCIDENT':
        return <ShieldAlert className="w-5 h-5 text-rose-400" />;
      case 'INFRASTRUCTURE':
        return <Cpu className="w-5 h-5 text-indigo-400" />;
      default:
        return <Compass className="w-5 h-5 text-amber-400" />;
    }
  };

  return (
    <section id="explore" className="py-20 md:py-28 bg-[#070D1A] relative border-t border-[#1E293B]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-16">
        
        {/* Header */}
        <div className="text-center space-y-3 max-w-2xl mx-auto">
          <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 text-xs font-mono font-medium">
            <Sparkles className="w-3.5 h-3.5" />
            <span>INTERACTIVE BENCHMARKS</span>
          </div>
          <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-white">
            Explore Pre-Loaded Scenarios
          </h2>
          <p className="text-sm sm:text-base text-slate-400 font-normal">
            Click any scenario to see ReTrace reconstruct the backstory in real-time.
          </p>
        </div>

        {/* 4 Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {scenarioList.map((sc, idx) => (
            <motion.div
              key={sc.id}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: idx * 0.1 }}
              whileHover={{ y: -5, scale: 1.015 }}
              onClick={() => !isLoading && onSelectScenario(sc.question)}
              onMouseEnter={() => setCursor('RUN', 'demo')}
              onMouseLeave={resetCursor}
              className="p-6 sm:p-7 rounded-2xl bg-[#0E1626] border border-[#1E293B] hover:border-cyan-400/50 shadow-xl transition-all cursor-pointer flex flex-col justify-between group"
            >
              <div className="space-y-4">
                {/* Header Badge */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2.5">
                    <div className="p-2 rounded-xl bg-white/5">
                      {getIcon(sc.tag)}
                    </div>
                    <span className="text-xs font-mono font-bold tracking-wider text-cyan-400">
                      {sc.tag}
                    </span>
                  </div>

                  <span className="text-[11px] font-mono text-slate-400">
                    {(sc as any).confidencePercentage ? `${(sc as any).confidencePercentage}%` : (sc as any).confidence || '94%'} CONFIDENCE
                  </span>
                </div>

                {/* Title and Question */}
                <div className="space-y-1.5">
                  <h3 className="text-lg font-bold text-white group-hover:text-cyan-300 transition-colors">
                    {sc.title}
                  </h3>
                  <p className="text-xs sm:text-sm text-slate-300 font-medium italic">
                    &quot;{sc.question}&quot;
                  </p>
                </div>

                {/* Direct Answer snippet */}
                <div className="p-3.5 rounded-xl bg-[#070D1A] border border-white/5 text-xs text-slate-400 line-clamp-2">
                  {sc.directAnswer}
                </div>
              </div>

              {/* Action Link */}
              <div className="mt-6 pt-4 border-t border-white/5 flex items-center justify-between">
                <span className="text-xs font-mono text-slate-500">
                  {sc.citations.length} Verified Evidence Records
                </span>

                <button
                  disabled={isLoading}
                  className="px-3.5 py-1.5 rounded-lg text-xs font-mono font-bold text-slate-950 bg-cyan-400 group-hover:bg-cyan-300 transition-all flex items-center space-x-1.5 shadow-md shadow-cyan-400/20"
                >
                  <span>INVESTIGATE</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </motion.div>
          ))}
        </div>

      </div>
    </section>
  );
}
