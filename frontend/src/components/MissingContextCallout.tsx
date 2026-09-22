'use client';

import React from 'react';
import { AlertOctagon, Compass } from 'lucide-react';
import { MissingContextFlag } from '@/lib/types';

interface MissingContextCalloutProps {
  missingContext: MissingContextFlag[];
}

export default function MissingContextCallout({ missingContext }: MissingContextCalloutProps) {
  if (!missingContext || missingContext.length === 0) {
    return null;
  }

  const getCategoryBadge = (category: string) => {
    switch (category) {
      case 'unrecorded_reason':
        return { label: 'UNRECORDED RATIONALE', color: 'bg-console-rose/10 text-console-rose border-console-rose/30' };
      case 'missing_stakeholder':
        return { label: 'MISSING STAKEHOLDER', color: 'bg-console-amber/10 text-console-amber border-console-amber/30' };
      case 'broken_chain':
        return { label: 'DISCONNECTED CHAIN', color: 'bg-orange-400/10 text-orange-300 border-orange-400/30' };
      case 'gap_in_dates':
        return { label: 'TIMELINE GAP', color: 'bg-console-violet/10 text-console-violet border-console-violet/30' };
      default:
        return { label: 'UNRESOLVED CONTEXT', color: 'bg-console-s3 text-console-dim border-console-border' };
    }
  };

  return (
    <div className="animate-rise rounded-2xl border border-console-rose/30 bg-console-rose/[0.04] p-5 relative overflow-hidden">
      <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-console-rose/60 to-transparent" />

      {/* Warning banner */}
      <div className="flex flex-wrap items-center justify-between gap-3 pb-3 mb-4 border-b border-console-rose/20">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-console-rose/15 border border-console-rose/30 text-console-rose">
            <AlertOctagon className="w-4 h-4 pulse-dot" />
          </div>
          <div>
            <h3 className="text-xs font-mono font-bold text-console-rose uppercase tracking-widest">
              Unrecovered context detected
            </h3>
            <p className="text-[11px] text-console-dim mt-0.5">
              These factors were not found in the written records. Zero hallucination enforced.
            </p>
          </div>
        </div>

        <span className="text-xs font-mono px-2.5 py-1 rounded-lg bg-console-rose/10 text-console-rose font-semibold border border-console-rose/30">
          {missingContext.length} GAP{missingContext.length > 1 ? 'S' : ''}
        </span>
      </div>

      {/* Grid of gaps */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {missingContext.map((item, idx) => {
          const badge = getCategoryBadge(item.category);
          return (
            <div
              key={idx}
              className="inset-tile p-4 hover:border-console-rose/30 transition-colors"
            >
              <div className="flex items-center justify-between mb-2">
                <span className={`text-[10px] font-mono uppercase px-2 py-0.5 rounded font-bold border ${badge.color}`}>
                  {badge.label}
                </span>
                <span className="text-[10px] font-mono text-console-mute">#{idx + 1}</span>
              </div>

              <h4 className="text-sm font-semibold text-white mb-2">
                {item.description}
              </h4>

              <div className="mb-2">
                <strong className="font-mono text-[10px] uppercase text-console-mute block mb-0.5">
                  Impact
                </strong>
                <p className="text-xs text-console-dim leading-snug">{item.impact}</p>
              </div>

              <div className="mt-3 pt-2.5 border-t border-console-border flex items-start gap-2 rounded-lg bg-console-cyan/[0.05] border border-console-cyan/15 p-2.5">
                <Compass className="w-4 h-4 text-console-cyan shrink-0 mt-0.5" />
                <div>
                  <span className="text-[10px] font-mono uppercase text-console-cyan font-semibold block">
                    Recommended investigation
                  </span>
                  <p className="text-[11px] text-console-dim mt-0.5">
                    {item.suggested_investigation}
                  </p>
                </div>
              </div>
            </div>
          );
        })}
      </div>

    </div>
  );
}
