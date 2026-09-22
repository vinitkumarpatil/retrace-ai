'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  FileText,
  AlertTriangle,
  GitBranch,
  MessageSquare,
  Search,
  CheckCircle2,
  RefreshCw,
  Sparkles,
  ShieldCheck,
  Compass,
} from 'lucide-react';
import { useCursor } from '@/context/CursorContext';

const SCATTERED_ITEMS = [
  {
    id: 'adr',
    code: 'ADR-042',
    type: 'Architecture Decision',
    date: 'Jul 15',
    text: '“Adopt PostgreSQL + pgvector for unified payment ledger.”',
    initialPos: { x: -140, y: -70, rotate: -4 },
  },
  {
    id: 'incident',
    code: 'INCIDENT #88',
    type: 'Postmortem Retrospective',
    date: 'Aug 12',
    text: '“Vector index lockup: memory exhaustion under 3.8M embeddings.”',
    initialPos: { x: 150, y: -65, rotate: 5 },
  },
  {
    id: 'slack',
    code: '#ARCH-COUNCIL',
    type: 'Emergency Sign-off',
    date: '15:10 UTC',
    text: '“Approved budget increase for 2xlarge RDS instance for Q3.”',
    initialPos: { x: -160, y: 75, rotate: 3 },
  },
  {
    id: 'rfc',
    code: 'RFC-204',
    type: 'Migration Specification',
    date: 'Jul 20',
    text: '“Payment service requires strict ACID serializable guarantees.”',
    initialPos: { x: 140, y: 80, rotate: -6 },
  },
];

export default function StoryAnimation() {
  const [isOrganized, setIsOrganized] = useState(false);
  const { setCursor, resetCursor } = useCursor();

  return (
    <section className="py-20 md:py-28 dark:bg-[#070B14]/75 bg-slate-100/60 backdrop-blur-[2px] border-b dark:border-[#1B2945]/70 border-slate-200/80 relative overflow-hidden">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12 text-center">
        
        {/* Header */}
        <div className="space-y-3 max-w-2xl mx-auto">
          <div className="inline-flex items-center space-x-2 px-3 py-1 rounded border dark:border-[#2A3B5C] border-sky-300/40 dark:bg-[#0E1626] bg-sky-50 dark:text-sky-400 text-sky-700 text-[10px] font-mono uppercase tracking-widest">
            <span>SCROLL STORYTELLING</span>
          </div>
          <h2 className="text-3xl sm:text-4xl font-extrabold dark:text-white text-slate-900 tracking-tight">
            From Scattered Records to Reconstructed Truth
          </h2>
          <p className="text-sm sm:text-base dark:text-slate-400 text-slate-600 font-normal">
            Isolated documents and buried discussions connect into an indisputable architectural narrative.
          </p>
        </div>

        {/* Visual Showcase Stage */}
        <div className="relative min-h-[440px] flex items-center justify-center p-4">
          
          <AnimatePresence mode="wait">
            {!isOrganized ? (
              /* Phase 1: Scattered Documents */
              <motion.div
                key="scattered"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.3 }}
                className="relative w-full max-w-2xl h-[360px] flex items-center justify-center"
              >
                {/* Central ReTrace Gathering Node */}
                <div className="w-20 h-20 rounded-xl dark:bg-[#0E1626] bg-white border dark:border-sky-400/50 border-sky-300 shadow-xl flex flex-col items-center justify-center p-2 text-center z-10">
                  <Compass className="w-5 h-5 text-sky-500 dark:text-sky-400 mb-1" />
                  <span className="text-[10px] font-mono font-bold dark:text-white text-slate-900">RETRACE</span>
                  <span className="text-[8px] font-mono dark:text-slate-400 text-slate-500">GATHERING</span>
                </div>

                {/* Scattered Physical Document Sheets */}
                {SCATTERED_ITEMS.map((item) => (
                  <motion.div
                    key={item.id}
                    animate={{
                      x: [item.initialPos.x, item.initialPos.x + 3, item.initialPos.x],
                      y: [item.initialPos.y, item.initialPos.y - 5, item.initialPos.y],
                      rotate: [item.initialPos.rotate, item.initialPos.rotate + 1, item.initialPos.rotate],
                    }}
                    transition={{ duration: 6, repeat: Infinity, ease: 'easeInOut' }}
                    whileHover={{ scale: 1.04 }}
                    onMouseEnter={() => setCursor('VIEW', 'card')}
                    onMouseLeave={resetCursor}
                    className="absolute w-56 sm:w-64 doc-sheet doc-fold p-3.5 rounded-lg text-left shadow-xl cursor-pointer"
                  >
                    <div className="flex items-center justify-between border-b dark:border-[#1E2D4A] border-slate-200 pb-1 mb-1.5">
                      <span className="stamp-badge text-sky-500 dark:text-sky-400 border-sky-400/30">
                        {item.code}
                      </span>
                      <span className="text-[10px] font-mono dark:text-slate-400 text-slate-500">{item.date}</span>
                    </div>
                    <p className="text-xs font-bold dark:text-white text-slate-900 truncate">{item.type}</p>
                    <p className="text-[11px] font-mono dark:text-slate-400 text-slate-600 mt-1 line-clamp-2 leading-tight">
                      {item.text}
                    </p>
                  </motion.div>
                ))}
              </motion.div>
            ) : (
              /* Phase 2: Organized & Reconstructed Story */
              <motion.div
                key="organized"
                initial={{ opacity: 0, scale: 0.92 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.92 }}
                transition={{ duration: 0.4 }}
                className="w-full max-w-2xl dark:bg-[#0E1626]/95 bg-white/95 border dark:border-sky-400/60 border-sky-300 rounded-2xl p-6 sm:p-8 shadow-2xl text-left space-y-6 backdrop-blur-md"
              >
                <div className="flex items-center justify-between border-b dark:border-[#1B2945] border-slate-200 pb-3">
                  <div className="flex items-center space-x-2 text-emerald-500 dark:text-emerald-400 text-xs font-mono font-bold">
                    <CheckCircle2 className="w-4 h-4" />
                    <span>SYNTHESIZED ARCHITECTURAL STORY</span>
                  </div>
                  <span className="stamp-badge text-sky-500 dark:text-sky-400 border-sky-400/40">
                    4 SOURCES CONNECTED
                  </span>
                </div>

                <div className="space-y-2">
                  <span className="text-[10px] font-mono dark:text-slate-400 text-slate-500 uppercase">
                    The Complete Story
                  </span>
                  <p className="text-sm sm:text-base dark:text-slate-100 text-slate-800 font-medium leading-relaxed">
                    PostgreSQL with pgvector was chosen to satisfy ACID guarantees on order ledgers (RFC-204) without introducing cross-network vector query latency. When staging tests failed to catch index lockups under 3.8M embeddings (Incident #88), SRE Dave Miller and VP of Engineering Marcus Vance authorized emergency failover to an upgraded 64GB db.r6g.2xlarge instance.
                  </p>
                </div>

                {/* 4 Connected Micro Badges */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-2 border-t dark:border-[#1B2945] border-slate-200 text-[10px] font-mono dark:text-slate-300 text-slate-700">
                  <div className="p-2 rounded dark:bg-[#070B14] bg-slate-100 border dark:border-[#1B2945] border-slate-200 truncate">
                    ✓ ADR-042 Approved
                  </div>
                  <div className="p-2 rounded dark:bg-[#070B14] bg-slate-100 border dark:border-[#1B2945] border-slate-200 truncate">
                    ✓ RFC-204 Specced
                  </div>
                  <div className="p-2 rounded dark:bg-[#070B14] bg-slate-100 border dark:border-[#1B2945] border-slate-200 truncate">
                    ✓ Postmortem #88
                  </div>
                  <div className="p-2 rounded dark:bg-[#070B14] bg-slate-100 border dark:border-[#1B2945] border-slate-200 truncate">
                    ✓ VP Eng Sign-off
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

        </div>

        {/* Action Toggle */}
        <div>
          <button
            onClick={() => setIsOrganized(!isOrganized)}
            onMouseEnter={() => setCursor(isOrganized ? 'RESET' : 'CONNECT', 'button')}
            onMouseLeave={resetCursor}
            className="px-6 py-3 rounded-lg font-mono font-bold text-xs sm:text-sm text-slate-950 bg-sky-400 hover:bg-sky-300 transition-colors inline-flex items-center space-x-2 cursor-pointer shadow-md active:scale-95"
          >
            <RefreshCw className="w-3.5 h-3.5 text-slate-950" />
            <span>
              {isOrganized ? 'EXPLORE SCATTERED RECORDS AGAIN' : 'CONNECT RECORDS INTO COMPLETE STORY'}
            </span>
          </button>
        </div>

      </div>
    </section>
  );
}
