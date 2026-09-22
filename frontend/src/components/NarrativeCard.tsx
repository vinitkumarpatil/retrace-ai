'use client';

import React from 'react';
import { ShieldCheck, AlertTriangle, AlertCircle, Crosshair } from 'lucide-react';

interface NarrativeCardProps {
  directAnswer: string;
  reasoningSummary: string;
  confidenceScore: 'high' | 'medium' | 'low';
  confidenceRationale: string;
  query: string;
}

export default function NarrativeCard({
  directAnswer,
  reasoningSummary,
  confidenceScore,
  confidenceRationale,
  query,
}: NarrativeCardProps) {

  const confidenceConfig = {
    high: { text: 'text-console-emerald', ring: 'border-console-emerald/30 bg-console-emerald/10', icon: ShieldCheck, label: 'HIGH', dots: 4 },
    medium: { text: 'text-console-amber', ring: 'border-console-amber/30 bg-console-amber/10', icon: AlertTriangle, label: 'MEDIUM', dots: 3 },
    low: { text: 'text-console-rose', ring: 'border-console-rose/30 bg-console-rose/10', icon: AlertCircle, label: 'LOW', dots: 2 },
  }[confidenceScore] || { text: 'text-console-dim', ring: 'border-console-border bg-console-s2', icon: AlertCircle, label: 'UNRATED', dots: 1 };

  const ConfidenceIcon = confidenceConfig.icon;

  return (
    <div className="panel panel-hover animate-rise p-6">

      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-3 pb-4 mb-5 border-b border-console-border">
        <div className="flex items-center gap-3 min-w-0">
          <div className="p-2 rounded-lg bg-console-cyan/10 border border-console-cyan/20 shrink-0">
            <Crosshair className="w-4 h-4 text-console-cyan" />
          </div>
          <div className="min-w-0">
            <h2 className="text-sm font-semibold text-white uppercase tracking-wider">
              Reconstructed Answer
            </h2>
            <p className="text-xs font-mono text-console-mute truncate">
              query: “{query}”
            </p>
          </div>
        </div>

        {/* Confidence stamp with dot meter */}
        <div className={`flex items-center gap-2.5 px-3 py-1.5 rounded-lg border ${confidenceConfig.ring} ${confidenceConfig.text} text-xs font-mono font-semibold`}>
          <ConfidenceIcon className="w-4 h-4" />
          <span>{confidenceConfig.label}</span>
          <span className="flex items-center gap-0.5">
            {[0, 1, 2, 3].map((i) => (
              <span
                key={i}
                className={`w-1.5 h-1.5 rounded-full ${i < confidenceConfig.dots ? 'bg-current' : 'bg-current/20'}`}
              />
            ))}
          </span>
        </div>
      </div>

      {/* Direct answer */}
      <div className="mb-6 p-4 rounded-xl bg-console-s2 border border-console-border relative overflow-hidden">
        <div className="absolute left-0 top-0 bottom-0 w-1 bg-console-cyan" />
        <span className="text-[10px] font-mono uppercase text-console-cyan font-bold tracking-widest block mb-1.5">
          Direct answer
        </span>
        <p className="text-white font-medium text-base leading-relaxed">
          {directAnswer}
        </p>
      </div>

      {/* Reasoning */}
      <div className="space-y-2">
        <span className="text-[10px] font-mono uppercase text-console-mute font-bold tracking-widest block">
          Reasoning trail
        </span>
        <div className="text-console-dim text-sm leading-relaxed whitespace-pre-line pl-3 border-l border-console-border">
          {reasoningSummary}
        </div>
      </div>

      {/* Footnote */}
      <div className="mt-5 pt-3 border-t border-console-border flex flex-wrap items-center justify-between gap-2 text-[11px] font-mono text-console-mute">
        <span>evidence basis: {confidenceRationale}</span>
        <span className="text-console-emerald/80">✓ verified citation trail</span>
      </div>

    </div>
  );
}
