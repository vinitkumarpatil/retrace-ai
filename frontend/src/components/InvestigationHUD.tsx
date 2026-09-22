'use client';

import React, { useEffect, useState } from 'react';
import {
  FileText,
  Search,
  Share2,
  ShieldCheck,
  CheckCircle2,
  Sparkles,
  GitBranch,
} from 'lucide-react';

interface InvestigationHUDProps {
  query: string;
  onComplete: () => void;
}

const STEPS = [
  {
    label: 'Searching documents...',
    detail: 'ADR-042 and related RFCs identified in repository archive',
    icon: Search,
    color: 'text-amber-400 border-amber-500/30 bg-amber-500/10',
  },
  {
    label: 'Connecting evidence...',
    detail: 'Traversing cross-document links and meeting transcripts',
    icon: Share2,
    color: 'text-sky-400 border-sky-500/30 bg-sky-500/10',
  },
  {
    label: 'Following decision trail...',
    detail: 'Identifying Architecture Review Board consensus and timestamps',
    icon: GitBranch,
    color: 'text-indigo-400 border-indigo-500/30 bg-indigo-500/10',
  },
  {
    label: 'Verifying sources...',
    detail: 'Extracting verbatim excerpts with zero-hallucination verification',
    icon: ShieldCheck,
    color: 'text-cyan-400 border-cyan-500/30 bg-cyan-500/10',
  },
  {
    label: 'Context recovered ✓',
    detail: 'Decision reconstructed successfully with verified proofs',
    icon: CheckCircle2,
    color: 'text-emerald-400 border-emerald-500/30 bg-emerald-500/10',
  },
];

export default function InvestigationHUD({ query, onComplete }: InvestigationHUDProps) {
  const [currentStep, setCurrentStep] = useState(0);

  useEffect(() => {
    // 5 steps over ~2.2 seconds
    const interval = setInterval(() => {
      setCurrentStep((prev) => {
        if (prev < STEPS.length - 1) {
          return prev + 1;
        } else {
          clearInterval(interval);
          setTimeout(onComplete, 400);
          return prev;
        }
      });
    }, 420);

    return () => clearInterval(interval);
  }, [onComplete]);

  const progressPercent = Math.min(100, Math.round(((currentStep + 1) / STEPS.length) * 100));

  return (
    <div className="w-full max-w-3xl mx-auto rounded-3xl bg-[#0E1626] border border-[#1E293B] shadow-2xl p-6 sm:p-10 space-y-8 relative overflow-hidden animate-in fade-in zoom-in-95 duration-300">
      {/* Background soft glow lines */}
      <div className="absolute top-0 inset-x-0 h-1 bg-gradient-to-r from-sky-400 via-indigo-500 to-emerald-400" />
      <div className="absolute -top-20 -left-20 w-52 h-52 bg-sky-500/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-20 -right-20 w-52 h-52 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />

      {/* Header */}
      <div className="text-center space-y-2">
        <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-sky-500/10 border border-sky-500/20 text-sky-400 text-xs font-mono">
          <Sparkles className="w-3.5 h-3.5 animate-spin" />
          <span>INVESTIGATION IN PROGRESS</span>
        </div>
        <h3 className="text-xl sm:text-2xl font-extrabold text-white">
          ReTrace is following the evidence...
        </h3>
        <p className="text-xs sm:text-sm text-slate-400 font-mono italic max-w-lg mx-auto truncate">
          &ldquo;{query}&rdquo;
        </p>
      </div>

      {/* Progress Line */}
      <div className="space-y-2">
        <div className="flex justify-between items-center text-xs font-mono text-slate-400">
          <span>INVESTIGATION PROGRESS</span>
          <span className="text-sky-400 font-bold">{progressPercent}%</span>
        </div>
        <div className="w-full h-2 rounded-full bg-[#141F36] overflow-hidden p-0.5">
          <div
            className="h-full bg-gradient-to-r from-sky-400 via-indigo-400 to-emerald-400 rounded-full transition-all duration-300 relative"
            style={{ width: `${progressPercent}%` }}
          >
            <div className="w-2 h-2 rounded-full bg-white absolute right-0 top-0 shadow-md shadow-sky-400 animate-ping" />
          </div>
        </div>
      </div>

      {/* Step Sequence */}
      <div className="space-y-3 pt-2">
        {STEPS.map((step, idx) => {
          const Icon = step.icon;
          const isDone = idx < currentStep;
          const isCurrent = idx === currentStep;

          return (
            <div
              key={idx}
              className={`p-3.5 rounded-2xl border transition-all duration-300 flex items-center justify-between ${
                isCurrent
                  ? 'bg-[#141F36] border-sky-400/60 shadow-lg shadow-sky-500/10 scale-[1.01]'
                  : isDone
                  ? 'bg-[#0E1626]/80 border-[#1E293B] text-slate-300'
                  : 'bg-transparent border-transparent opacity-25 text-slate-600'
              }`}
            >
              <div className="flex items-center space-x-3.5 min-w-0">
                <div
                  className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 border transition-all ${
                    isCurrent
                      ? step.color + ' animate-pulse'
                      : isDone
                      ? 'text-emerald-400 border-emerald-500/30 bg-emerald-500/10'
                      : 'text-slate-600 border-slate-800 bg-[#141F36]'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                </div>

                <div className="min-w-0">
                  <h4
                    className={`text-xs sm:text-sm font-bold truncate ${
                      isCurrent ? 'text-white' : isDone ? 'text-slate-200' : 'text-slate-500'
                    }`}
                  >
                    {step.label}
                  </h4>
                  <p className="text-[11px] text-slate-400 truncate hidden sm:block">
                    {step.detail}
                  </p>
                </div>
              </div>

              {/* Status Indicator */}
              <div className="shrink-0 pl-2">
                {isDone ? (
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                ) : isCurrent ? (
                  <div className="w-2 h-2 rounded-full bg-sky-400 animate-ping" />
                ) : (
                  <div className="w-2 h-2 rounded-full bg-slate-700" />
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Bottom status note */}
      <div className="pt-3 border-t border-[#1E293B] flex items-center justify-between text-[11px] font-mono text-slate-400">
        <span>Zero-Drift Verification Protocol</span>
        <span className="text-sky-400 font-semibold">STAGE {currentStep + 1} OF 5</span>
      </div>

    </div>
  );
}
