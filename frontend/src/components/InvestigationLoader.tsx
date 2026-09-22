'use client';

import React, { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import {
  FileText,
  Layers,
  GitBranch,
  ShieldCheck,
  CheckCircle2,
} from 'lucide-react';

interface InvestigationLoaderProps {
  query: string;
  onComplete: () => void;
}

const STAGES = [
  {
    id: 1,
    title: 'DOCUMENTS FOUND',
    detail: 'Matching ADR-042, RFC-204, and Incident Retrospective #88 in memory',
    icon: FileText,
  },
  {
    id: 2,
    title: 'CONTEXT CONNECTED',
    detail: 'Correlating vector indexing benchmarks to AWS RDS db.r6g.2xlarge sizing',
    icon: Layers,
  },
  {
    id: 3,
    title: 'DECISION TRAIL FOUND',
    detail: 'Tracing consensus between Alice Chen (Principal Architect) and Marcus Vance (VP Eng)',
    icon: GitBranch,
  },
  {
    id: 4,
    title: 'SOURCES VERIFIED',
    detail: 'Cryptographic hash checks passed on primary markdown & chat transcripts',
    icon: ShieldCheck,
  },
  {
    id: 5,
    title: 'CONTEXT RECOVERED',
    detail: 'Zero-hallucination verification complete. Generating executive decision story.',
    icon: CheckCircle2,
  },
];

export default function InvestigationLoader({ query, onComplete }: InvestigationLoaderProps) {
  const [currentStageIdx, setCurrentStageIdx] = useState(0);
  const onCompleteRef = useRef(onComplete);
  onCompleteRef.current = onComplete;

  useEffect(() => {
    // Progress through the 5 stages smoothly over ~2.4 seconds
    const interval = setInterval(() => {
      setCurrentStageIdx((prev) => {
        if (prev < STAGES.length - 1) {
          return prev + 1;
        } else {
          clearInterval(interval);
          setTimeout(() => {
            if (onCompleteRef.current) {
              onCompleteRef.current();
            }
          }, 350);
          return prev;
        }
      });
    }, 450);

    return () => clearInterval(interval);
  }, []);

  const progressPercent = Math.min(100, Math.round(((currentStageIdx + 1) / STAGES.length) * 100));

  return (
    <div className="max-w-3xl mx-auto my-6 bg-[#0E1626] border border-sky-400/50 rounded-2xl p-6 sm:p-8 shadow-2xl relative overflow-hidden">
      
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pb-5 border-b border-[#1B2945]">
        <div>
          <div className="flex items-center space-x-2 text-sky-400 font-mono text-xs font-bold tracking-wider">
            <span className="w-2 h-2 rounded-full bg-sky-400 animate-ping" />
            <span>INVESTIGATION IN PROGRESS</span>
          </div>
          <p className="text-sm font-medium text-slate-200 mt-1 line-clamp-1">
            &ldquo;{query}&rdquo;
          </p>
        </div>

        <div className="text-right">
          <div className="text-xl sm:text-2xl font-mono font-bold text-white">
            {progressPercent}%
          </div>
          <div className="text-[10px] font-mono text-slate-400 uppercase tracking-wider">
            EVIDENCE RETRIEVAL
          </div>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="w-full bg-[#111B2E] h-2 rounded-full mt-6 overflow-hidden border border-[#1E2D4A]">
        <motion.div
          className="h-full bg-sky-400"
          initial={{ width: '0%' }}
          animate={{ width: `${progressPercent}%` }}
          transition={{ duration: 0.35, ease: 'easeOut' }}
        />
      </div>

      {/* 5 Stepped Forensic Stages */}
      <div className="mt-8 space-y-3">
        {STAGES.map((stage, idx) => {
          const isDone = idx < currentStageIdx;
          const isCurrent = idx === currentStageIdx;
          const Icon = stage.icon;

          return (
            <motion.div
              key={stage.id}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: idx * 0.06 }}
              className={`flex items-center space-x-3.5 p-3.5 rounded-xl border transition-all ${
                isCurrent
                  ? 'bg-[#141F36] border-sky-400/60 shadow-md'
                  : isDone
                  ? 'bg-[#0A0F1D] border-[#1B2945] opacity-80'
                  : 'bg-transparent border-transparent opacity-35'
              }`}
            >
              <div
                className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 ${
                  isDone
                    ? 'bg-emerald-500/20 text-emerald-400'
                    : isCurrent
                    ? 'bg-sky-500/20 text-sky-400'
                    : 'bg-white/5 text-slate-500'
                }`}
              >
                {isDone ? (
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                ) : (
                  <Icon className="w-4 h-4" />
                )}
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between">
                  <span
                    className={`text-xs font-mono font-bold tracking-wider ${
                      isCurrent
                        ? 'text-sky-300'
                        : isDone
                        ? 'text-slate-200'
                        : 'text-slate-500'
                    }`}
                  >
                    0{stage.id} • {stage.title}
                  </span>

                  {isCurrent && (
                    <span className="text-[10px] font-mono text-sky-400 animate-pulse">
                      PROCESSING...
                    </span>
                  )}
                  {isDone && (
                    <span className="text-[10px] font-mono text-emerald-400">
                      RESOLVED ✓
                    </span>
                  )}
                </div>

                <p className="text-[11px] font-mono text-slate-400 truncate mt-0.5">
                  {stage.detail}
                </p>
              </div>
            </motion.div>
          );
        })}
      </div>

    </div>
  );
}
