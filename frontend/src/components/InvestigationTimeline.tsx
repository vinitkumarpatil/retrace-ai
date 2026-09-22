'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Calendar, User, FileText, CheckCircle2, ChevronRight } from 'lucide-react';
import { TimelineMilestone } from '@/data/demoData';
import { useCursor } from '@/context/CursorContext';

interface InvestigationTimelineProps {
  timeline: TimelineMilestone[];
  onSelectMilestone?: (milestone: TimelineMilestone) => void;
}

export default function InvestigationTimeline({
  timeline,
  onSelectMilestone,
}: InvestigationTimelineProps) {
  const [selectedIdx, setSelectedIdx] = useState(2); // default to 'Decision'
  const { setCursor, resetCursor } = useCursor();

  const active = timeline[selectedIdx] || timeline[0];

  return (
    <section className="py-20 md:py-28 dark:bg-[#0A0F1D]/80 bg-white/70 backdrop-blur-[2px] border-b dark:border-[#1B2945] border-slate-200 relative">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
        
        {/* Header */}
        <div className="text-center space-y-3 max-w-2xl mx-auto">
          <div className="inline-flex items-center space-x-2 px-3 py-1 rounded border dark:border-[#2A3B5C] border-sky-300/40 dark:bg-[#0E1626] bg-sky-50 dark:text-sky-400 text-sky-700 text-[10px] font-mono uppercase tracking-widest">
            <span>CHRONOLOGICAL TRAIL</span>
          </div>
          <h2 className="text-3xl sm:text-4xl font-extrabold dark:text-white text-slate-900 tracking-tight">
            The Decision Timeline
          </h2>
          <p className="text-sm sm:text-base dark:text-slate-400 text-slate-600 font-normal">
            Decisions don&apos;t happen in a vacuum. ReTrace maps each technical step from initial proposal to production result.
          </p>
        </div>

        {/* Horizontal Self-Drawing Stepper */}
        <div className="relative pt-6 pb-2">
          {/* Connecting Line */}
          <div className="absolute top-11 left-4 right-4 h-0.5 dark:bg-[#1B2945] bg-slate-200 -z-0">
            <motion.div
              className="h-full bg-sky-400"
              initial={{ width: '0%' }}
              whileInView={{ width: '100%' }}
              viewport={{ once: true }}
              transition={{ duration: 1.2, ease: 'easeOut' }}
            />
          </div>

          <div className="grid grid-cols-5 gap-2 relative z-10">
            {timeline.map((item, idx) => {
              const isSelected = selectedIdx === idx;
              return (
                <button
                  key={item.stage}
                  onClick={() => {
                    setSelectedIdx(idx);
                    if (onSelectMilestone) onSelectMilestone(item);
                  }}
                  onMouseEnter={() => setCursor('VIEW', 'button')}
                  onMouseLeave={resetCursor}
                  className="flex flex-col items-center text-center group cursor-pointer focus:outline-none"
                >
                  <div
                    className={`w-10 h-10 rounded-full border-2 flex items-center justify-center text-xs font-mono font-bold transition-all ${
                      isSelected
                        ? 'bg-sky-400 text-slate-950 border-sky-400 shadow-lg shadow-sky-400/20 scale-110'
                        : 'dark:bg-[#0E1626] bg-white dark:text-slate-400 text-slate-600 dark:border-[#2A3B5C] border-slate-300 group-hover:border-sky-400 dark:group-hover:text-white group-hover:text-slate-900 shadow-sm'
                    }`}
                  >
                    0{idx + 1}
                  </div>

                  <span
                    className={`text-xs font-mono font-bold mt-3 transition-colors ${
                      isSelected ? 'text-sky-500 dark:text-sky-400' : 'dark:text-slate-400 text-slate-500 dark:group-hover:text-slate-200 group-hover:text-slate-800'
                    }`}
                  >
                    {item.stage}
                  </span>

                  <span className="text-[10px] font-mono dark:text-slate-500 text-slate-400 mt-0.5 hidden sm:block">
                    {item.date}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Selected Milestone Detail Card */}
        {active && (
          <motion.div
            key={active.stage}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.25 }}
            className="p-6 sm:p-7 rounded-2xl dark:bg-[#0E1626]/90 bg-white/90 border dark:border-sky-400/40 border-sky-200 shadow-xl space-y-4 backdrop-blur-md"
          >
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 border-b dark:border-[#1B2945] border-slate-200 pb-3">
              <div className="flex items-center space-x-2.5">
                <span className="stamp-badge text-sky-500 dark:text-sky-400 border-sky-400/30">
                  STAGE {selectedIdx + 1}: {active.stage.toUpperCase()}
                </span>
                <h3 className="text-base sm:text-lg font-bold dark:text-white text-slate-900">
                  {active.title}
                </h3>
              </div>

              <span className="text-xs font-mono text-amber-500 dark:text-amber-400 flex items-center">
                <Calendar className="w-3.5 h-3.5 mr-1" />
                {active.date}
              </span>
            </div>

            <p className="text-xs sm:text-sm dark:text-slate-200 text-slate-700 leading-relaxed font-normal">
              {active.description}
            </p>

            <div className="pt-3 border-t dark:border-[#1B2945] border-slate-200 flex flex-wrap items-center justify-between gap-4 text-xs font-mono dark:text-slate-400 text-slate-500">
              <span className="flex items-center">
                <User className="w-3.5 h-3.5 mr-1.5 text-sky-500 dark:text-sky-400" />
                <span>Stakeholder: {active.leadStakeholder}</span>
              </span>

              <span className="flex items-center dark:text-slate-300 text-slate-600">
                <FileText className="w-3.5 h-3.5 mr-1.5 dark:text-slate-400 text-slate-500" />
                <span>Corroborating Document: {active.documentRef}</span>
              </span>
            </div>
          </motion.div>
        )}

      </div>
    </section>
  );
}
