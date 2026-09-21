'use client';

import React, { useState } from 'react';
import { AlertOctagon, Compass, Copy, Check, ShieldAlert, ArrowUpRight, Search, PlusCircle, Flame } from 'lucide-react';
import { MissingContextFlag } from '@/lib/types';

interface MissingContextCalloutProps {
  missingContext: MissingContextFlag[];
  onAddNote?: (category: string) => void;
}

export default function MissingContextCallout({ missingContext, onAddNote }: MissingContextCalloutProps) {
  const [copiedIdx, setCopiedIdx] = useState<number | null>(null);

  if (!missingContext || missingContext.length === 0) {
    return null;
  }

  const getCategoryBadge = (category: string) => {
    switch (category) {
      case 'unrecorded_reason':
        return {
          label: 'UNRECORDED RATIONALE',
          border: 'border-pink-500/50 text-pink-300 bg-pink-500/15',
        };
      case 'missing_stakeholder':
        return {
          label: 'MISSING STAKEHOLDER',
          border: 'border-amber-500/50 text-amber-300 bg-amber-500/15',
        };
      case 'broken_chain':
        return {
          label: 'DISCONNECTED CHAIN',
          border: 'border-violet-500/50 text-violet-300 bg-violet-500/15',
        };
      case 'gap_in_dates':
        return {
          label: 'TIMELINE GAP',
          border: 'border-cyan-500/50 text-cyan-300 bg-cyan-500/15',
        };
      default:
        return {
          label: 'UNRESOLVED CONTEXT',
          border: 'border-slate-500/50 text-slate-300 bg-slate-500/15',
        };
    }
  };

  const handleCopyGap = (item: MissingContextFlag, idx: number) => {
    const text = `[RETRACE BLINDSPOT - ${item.category.toUpperCase()}]\nIssue: ${item.description}\nImpact: ${item.impact}\nRecommended Investigation: ${item.suggested_investigation}`;
    navigator.clipboard.writeText(text);
    setCopiedIdx(idx);
    setTimeout(() => setCopiedIdx(null), 2000);
  };

  return (
    <div className="rounded-xl border border-pink-500/40 bg-gradient-to-b from-pink-950/25 via-[#0D0B1C] to-[#080D21] p-6 shadow-2xl relative transition-all duration-300">
      
      {/* Warning Banner Header */}
      <div className="flex flex-wrap items-center justify-between gap-3 pb-4 mb-5 border-b border-pink-500/25">
        <div className="flex items-center space-x-3">
          <div className="p-2.5 bg-pink-500/20 border border-pink-500/50 text-pink-400 rounded-xl shadow-lg shadow-pink-500/15">
            <AlertOctagon className="w-5 h-5 animate-pulse" />
          </div>
          <div>
            <h3 className="text-xs font-mono font-bold text-pink-300 uppercase tracking-widest flex items-center space-x-2">
              <span>CRITICAL FORENSIC AUDIT // UNRECOVERED CONTEXT DETECTED</span>
            </h3>
            <p className="text-[11px] font-mono text-pink-200/70 mt-0.5">
              Zero-Hallucination Guard: These decision factors were NEVER recorded in written artifacts.
            </p>
          </div>
        </div>

        <span className="text-xs font-mono px-3.5 py-1 rounded-full bg-pink-500/20 text-pink-300 font-bold border border-pink-500/40 shadow-xs flex items-center space-x-1.5">
          <span className="w-2 h-2 rounded-full bg-pink-400 animate-ping"></span>
          <span>{missingContext.length} KNOWLEDGE GAP{missingContext.length > 1 ? 'S' : ''} FLAGGED</span>
        </span>
      </div>

      {/* Grid of Missing Items */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {missingContext.map((item, idx) => {
          const badge = getCategoryBadge(item.category);
          const isCopied = copiedIdx === idx;

          return (
            <div
              key={idx}
              className="bg-[#0A0F24]/90 backdrop-blur-md p-4.5 rounded-xl border border-pink-500/20 hover:border-pink-500/50 shadow-lg transition-all duration-300 hover:-translate-y-0.5 flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between mb-2.5">
                  <span className={`text-[10px] font-mono uppercase px-2 py-0.5 rounded font-bold border ${badge.border}`}>
                    {badge.label}
                  </span>
                  <div className="flex items-center space-x-1">
                    <span className="text-[10px] font-mono text-slate-500">GAP #{idx + 1}</span>
                    <button
                      onClick={() => handleCopyGap(item, idx)}
                      className="text-slate-400 hover:text-pink-300 p-1 rounded hover:bg-white/5 transition-colors"
                      title="Copy gap summary"
                    >
                      {isCopied ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                    </button>
                  </div>
                </div>

                {/* Description */}
                <h4 className="text-sm font-semibold text-slate-100 mb-2.5 leading-snug">
                  {item.description}
                </h4>

                {/* Impact */}
                <div className="mb-3.5 text-xs text-slate-300 bg-[#040714] p-3 rounded-lg border border-white/5">
                  <strong className="font-mono text-[10px] uppercase text-pink-400 block mb-0.5">
                    Organizational Impact:
                  </strong>
                  <p className="leading-relaxed">{item.impact}</p>
                </div>
              </div>

              {/* Suggested Investigation */}
              <div className="pt-2.5 border-t border-dashed border-[#1E2C54] text-xs text-slate-300 bg-[#070D20] p-3 rounded-lg flex items-start space-x-2.5">
                <Compass className="w-4 h-4 text-cyan-400 shrink-0 mt-0.5 animate-spin-slow" />
                <div className="flex-1">
                  <span className="text-[10px] font-mono uppercase text-cyan-300 font-bold block">
                    Recommended Recovery Investigation:
                  </span>
                  <p className="text-[11px] text-slate-300 mt-0.5 leading-relaxed">
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
