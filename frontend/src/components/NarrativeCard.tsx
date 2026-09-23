'use client';

import React from 'react';
import { ShieldCheck, AlertTriangle, AlertCircle, Bookmark, CheckCircle2, Zap, Sparkles } from 'lucide-react';

interface NarrativeCardProps {
  directAnswer: string;
  reasoningSummary: string;
  confidenceScore: 'high' | 'medium' | 'low';
  confidenceRationale: string;
  query: string;
  backendOnly?: boolean;
}

export default function NarrativeCard({
  directAnswer,
  reasoningSummary,
  confidenceScore,
  confidenceRationale,
  query,
  backendOnly,
}: NarrativeCardProps) {
  
  // Style config for confidence badge
  const confidenceConfig = {
    high: {
      bg: 'bg-emerald-50',
      text: 'text-emerald-800',
      border: 'border-emerald-300',
      icon: ShieldCheck,
      label: 'HIGH CONFIDENCE',
    },
    medium: {
      bg: 'bg-amber-50',
      text: 'text-amber-800',
      border: 'border-amber-300',
      icon: AlertTriangle,
      label: 'MEDIUM CONFIDENCE',
    },
    low: {
      bg: 'bg-rose-50',
      text: 'text-rose-800',
      border: 'border-rose-300',
      icon: AlertCircle,
      label: 'LOW CONFIDENCE',
    },
  }[confidenceScore] || {
    bg: 'bg-stone-50',
    text: 'text-stone-800',
    border: 'border-stone-300',
    icon: AlertCircle,
    label: 'CONFIDENCE UNRATED',
  };

  const ConfidenceIcon = confidenceConfig.icon;

  return (
    <div className="drafting-card rounded-md border border-[#E2DDD5] bg-white p-6 relative corner-ticks shadow-xs">
      
      {/* Header bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 pb-4 mb-5 border-b border-[#E2DDD5]">
        <div className="flex items-center space-x-2">
          <div className="p-1.5 bg-stone-100 rounded text-stone-700">
            <Bookmark className="w-4 h-4 text-[#D97706]" />
          </div>
          <div>
            <h2 className="text-sm font-mono font-bold text-stone-900 uppercase tracking-wider">
              RECONSTRUCTED CONTEXT & REASONING
            </h2>
            <p className="text-xs font-mono text-stone-500">
              TARGET INQUIRY: &quot;{query}&quot;
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {/* Search Mode Indicator */}
          {backendOnly !== undefined && (
            <div className={`flex items-center space-x-1.5 px-2.5 py-1 rounded border text-xs font-mono font-semibold ${
              backendOnly
                ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                : 'bg-violet-50 text-violet-700 border-violet-200'
            }`}>
              {backendOnly ? (
                <>
                  <Zap className="w-3.5 h-3.5" />
                  <span>BACKEND SEARCH</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>AI REASONING</span>
                </>
              )}
            </div>
          )}

          {/* Confidence Stamp */}
          <div className={`flex items-center space-x-2 px-3 py-1 rounded border ${confidenceConfig.bg} ${confidenceConfig.border} ${confidenceConfig.text} text-xs font-mono font-semibold`}>
            <ConfidenceIcon className="w-4 h-4" />
            <span>{confidenceConfig.label}</span>
          </div>
        </div>
      </div>

      {/* Direct Executive Answer */}
      <div className="mb-6 p-4 rounded bg-[#FAF8F5] border-l-4 border-amber-500 border border-[#E2DDD5]">
        <span className="text-[10px] font-mono uppercase text-amber-700 font-bold tracking-wider block mb-1">
          // EXECUTIVE DIRECT ANSWER
        </span>
        <p className="text-stone-900 font-medium text-base leading-relaxed">
          {directAnswer}
        </p>
      </div>

      {/* In-depth Forensic Reasoning */}
      <div className="space-y-3">
        <span className="text-[10px] font-mono uppercase text-stone-500 font-bold tracking-wider block">
          // FORENSIC REASONING TRAIL & ANALYSIS
        </span>
        <div className="text-stone-700 text-sm leading-relaxed whitespace-pre-line font-sans pl-2 border-l border-stone-200">
          {reasoningSummary}
        </div>
      </div>

      {/* Confidence Rationale Footnote */}
      <div className="mt-5 pt-3 border-t border-dashed border-[#E2DDD5] flex items-center justify-between text-xs font-mono text-stone-500">
        <span className="flex items-center space-x-1.5">
          <CheckCircle2 className="w-3.5 h-3.5 text-stone-400" />
          <span>EVIDENCE BASIS: {confidenceRationale}</span>
        </span>
        <span className="text-stone-400">STATUS: VERIFIED CITATION TRAIL</span>
      </div>

    </div>
  );
}
