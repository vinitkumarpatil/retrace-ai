'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { ShieldCheck, Layers, Sparkles, FileText, ArrowRight } from 'lucide-react';
import EvidenceCard, { EvidenceItem } from './EvidenceCard';
import { DEMO_SCENARIOS } from '@/data/demoData';
import { useCursor } from '@/context/CursorContext';

interface EvidenceSectionProps {
  onSelectCard: (item: EvidenceItem) => void;
}

export default function EvidenceSection({ onSelectCard }: EvidenceSectionProps) {
  const { setCursor, resetCursor } = useCursor();
  const [activeStackIndex, setActiveStackIndex] = useState(0);

  // Evidence citations from the default postgres scenario
  const citations = DEMO_SCENARIOS.postgres.citations;

  return (
    <section className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div className="space-y-2">
          <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 text-xs font-mono font-medium">
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>GROUNDED AUDIT TRAIL</span>
          </div>
          <h3 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white">
            Backed by Evidence.
          </h3>
          <p className="text-sm text-slate-400 max-w-xl font-normal">
            Zero hallucinations. Every claim links back to authentic architecture specs, pull requests, and incident logs.
          </p>
        </div>

        <span className="text-xs font-mono text-cyan-400">
          3 VERIFIED CITATIONS
        </span>
      </div>

      {/* 3 Evidence Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {citations.map((item, idx) => (
          <EvidenceCard
            key={item.type + idx}
            item={item}
            index={idx}
            onSelect={onSelectCard}
          />
        ))}
      </div>

      {/* Interactive Document Stack Fan-Out Showcase */}
      <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.3 }}
        className="p-6 sm:p-8 rounded-2xl bg-gradient-to-r from-[#0E1626] to-[#141F36] border border-[#1E293B] shadow-xl space-y-6"
      >
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center space-x-2.5">
            <div className="p-2 rounded-xl bg-cyan-500/10 text-cyan-400">
              <Layers className="w-4 h-4" />
            </div>
            <div>
              <h4 className="text-sm sm:text-base font-bold text-white">
                Interactive Document Stack
              </h4>
              <p className="text-xs text-slate-400">
                Click across the forensic stack to inspect corroborating sources
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            {citations.map((c, i) => (
              <button
                key={i}
                onClick={() => setActiveStackIndex(i)}
                onMouseEnter={() => setCursor('STACK', 'button')}
                onMouseLeave={resetCursor}
                className={`px-3 py-1.5 rounded-lg text-xs font-mono font-bold transition-all cursor-pointer ${
                  activeStackIndex === i
                    ? 'bg-cyan-400 text-slate-950 shadow-md shadow-cyan-400/20'
                    : 'bg-white/5 text-slate-400 hover:text-white hover:bg-white/10'
                }`}
              >
                {c.type}
              </button>
            ))}
          </div>
        </div>

        {/* Highlighted Stack Detail Card */}
        <div
          onClick={() => onSelectCard(citations[activeStackIndex])}
          onMouseEnter={() => setCursor('INSPECT', 'card')}
          onMouseLeave={resetCursor}
          className="p-5 rounded-xl bg-[#070D1A] border border-cyan-500/30 hover:border-cyan-400 transition-all cursor-pointer group flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4"
        >
          <div className="space-y-1.5">
            <div className="flex items-center space-x-2 text-xs font-mono text-cyan-400">
              <span>{citations[activeStackIndex].type}</span>
              <span>•</span>
              <span className="text-slate-400">{citations[activeStackIndex].date}</span>
            </div>
            <h5 className="text-base font-bold text-white group-hover:text-cyan-300 transition-colors">
              {citations[activeStackIndex].title}
            </h5>
            <p className="text-xs text-slate-300 font-sans italic line-clamp-1">
              &quot;{citations[activeStackIndex].quote}&quot;
            </p>
          </div>

          <button className="shrink-0 px-4 py-2 rounded-lg text-xs font-mono font-bold text-cyan-400 bg-cyan-500/10 border border-cyan-500/20 group-hover:bg-cyan-400 group-hover:text-slate-950 transition-all flex items-center space-x-1.5">
            <span>FULL VIEW</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </motion.div>

    </section>
  );
}
