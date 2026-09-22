'use client';

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  FileText,
  Search,
  GitMerge,
  Users,
  CheckCircle2,
  ShieldAlert,
} from 'lucide-react';

interface InvestigationProps {
  query: string;
  onComplete: () => void;
}

const STEPS = [
  {
    id: 1,
    title: 'Reading documents...',
    detail: 'Scanning ADR-042, RFC-204, and Incident Retrospective #88',
    icon: FileText,
    color: 'text-cyan-400',
  },
  {
    id: 2,
    title: 'Searching context...',
    detail: 'Matching commit messages, AWS telemetry, and PR review threads',
    icon: Search,
    color: 'text-sky-400',
  },
  {
    id: 3,
    title: 'Connecting evidence...',
    detail: 'Correlating vector indexing benchmarks to Postgres RDS sizing',
    icon: GitMerge,
    color: 'text-violet-400',
  },
  {
    id: 4,
    title: 'Finding decision makers...',
    detail: 'Verified: Alice Chen (Principal Architect) & VP of Engineering sign-off',
    icon: Users,
    color: 'text-indigo-400',
  },
  {
    id: 5,
    title: 'Context recovered',
    detail: 'Zero-hallucination verification complete. Generating audit narrative.',
    icon: CheckCircle2,
    color: 'text-emerald-400',
  },
];

export default function Investigation({ query, onComplete }: InvestigationProps) {
  const [currentStepIndex, setCurrentStepIndex] = useState(0);

  useEffect(() => {
    // Progress through the 5 steps over ~2.2 seconds
    const interval = setInterval(() => {
      setCurrentStepIndex((prev) => {
        if (prev < STEPS.length - 1) {
          return prev + 1;
        } else {
          clearInterval(interval);
          setTimeout(() => {
            onComplete();
          }, 350);
          return prev;
        }
      });
    }, 420);

    return () => clearInterval(interval);
  }, [onComplete]);

  const progressPercent = Math.min(
    100,
    Math.round(((currentStepIndex + 1) / STEPS.length) * 100)
  );

  return (
    <div className="max-w-3xl mx-auto my-8 bg-[#0E1626] border border-cyan-500/40 rounded-2xl p-6 sm:p-8 shadow-2xl relative overflow-hidden">
      {/* Scanning beam effect */}
      <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-cyan-400 to-transparent animate-scanbeam" />

      {/* Header Info */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pb-6 border-b border-[#1E293B]">
        <div>
          <div className="flex items-center space-x-2 text-cyan-400 font-mono text-xs font-bold tracking-wider">
            <span className="w-2 h-2 rounded-full bg-cyan-400 animate-ping" />
            <span>FORENSIC CONTEXT INVESTIGATION RUNNING</span>
          </div>
          <p className="text-sm font-medium text-slate-300 mt-1 line-clamp-1">
            &quot;{query}&quot;
          </p>
        </div>

        <div className="text-right">
          <div className="text-2xl font-mono font-bold text-white">
            {progressPercent}%
          </div>
          <div className="text-[10px] font-mono text-slate-400 uppercase">
            AUDIT COMPLETION
          </div>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="w-full bg-[#141F36] h-2 rounded-full mt-6 overflow-hidden">
        <motion.div
          className="h-full bg-gradient-to-r from-cyan-400 via-sky-400 to-emerald-400 rounded-full"
          initial={{ width: '0%' }}
          animate={{ width: `${progressPercent}%` }}
          transition={{ duration: 0.35, ease: 'easeOut' }}
        />
      </div>

      {/* 5 Stepped Forensic Milestones */}
      <div className="mt-8 space-y-3">
        {STEPS.map((step, idx) => {
          const isFinished = idx < currentStepIndex;
          const isCurrent = idx === currentStepIndex;
          const isPending = idx > currentStepIndex;
          const Icon = step.icon;

          return (
            <motion.div
              key={step.id}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: idx * 0.08 }}
              className={`flex items-center space-x-3.5 p-3 rounded-xl border transition-all ${
                isCurrent
                  ? 'bg-cyan-500/10 border-cyan-400/50 shadow-md'
                  : isFinished
                  ? 'bg-[#141F36]/50 border-emerald-500/20 opacity-90'
                  : 'bg-transparent border-transparent opacity-40'
              }`}
            >
              <div
                className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 ${
                  isFinished
                    ? 'bg-emerald-500/20 text-emerald-400'
                    : isCurrent
                    ? 'bg-cyan-500/20 text-cyan-400'
                    : 'bg-white/5 text-slate-500'
                }`}
              >
                {isFinished ? (
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                ) : (
                  <Icon className="w-4 h-4" />
                )}
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between">
                  <span
                    className={`text-xs font-mono font-bold tracking-wide ${
                      isCurrent
                        ? 'text-cyan-300'
                        : isFinished
                        ? 'text-white'
                        : 'text-slate-500'
                    }`}
                  >
                    0{step.id} • {step.title}
                  </span>
                  {isCurrent && (
                    <span className="text-[10px] font-mono text-cyan-400 animate-pulse">
                      PROCESSING...
                    </span>
                  )}
                  {isFinished && (
                    <span className="text-[10px] font-mono text-emerald-400">
                      RESOLVED ✓
                    </span>
                  )}
                </div>
                <p className="text-[11px] text-slate-400 truncate mt-0.5">
                  {step.detail}
                </p>
              </div>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}
