'use client';

import React from 'react';
import { AlertOctagon, HelpCircle, Compass, FileQuestion, ArrowUpRight } from 'lucide-react';
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
        return { label: 'UNRECORDED RATIONALE', color: 'bg-rose-100 text-rose-800 border-rose-300' };
      case 'missing_stakeholder':
        return { label: 'MISSING STAKEHOLDER', color: 'bg-amber-100 text-amber-800 border-amber-300' };
      case 'broken_chain':
        return { label: 'DISCONNECTED CHAIN', color: 'bg-orange-100 text-orange-800 border-orange-300' };
      case 'gap_in_dates':
        return { label: 'TIMELINE GAP', color: 'bg-purple-100 text-purple-800 border-purple-300' };
      default:
        return { label: 'UNRESOLVED CONTEXT', color: 'bg-stone-100 text-stone-800 border-stone-300' };
    }
  };

  return (
    <div className="rounded-md border-2 border-dashed border-rose-300 bg-[#FFFBFB] p-5 shadow-xs relative">
      
      {/* Drafting Warning Banner */}
      <div className="flex items-center justify-between pb-3 mb-4 border-b border-rose-200">
        <div className="flex items-center space-x-2.5">
          <div className="p-1.5 bg-rose-500 text-white rounded">
            <AlertOctagon className="w-4 h-4 animate-pulse" />
          </div>
          <div>
            <h3 className="text-xs font-mono font-bold text-rose-900 uppercase tracking-widest flex items-center space-x-2">
              <span>CRITICAL FORENSIC AUDIT // UNRECOVERED CONTEXT DETECTED</span>
            </h3>
            <p className="text-[11px] font-mono text-rose-700">
              The following decision factors were NOT found in written records. Zero hallucination enforced.
            </p>
          </div>
        </div>

        <span className="text-xs font-mono px-2 py-0.5 rounded bg-rose-100 text-rose-800 font-semibold border border-rose-300">
          {missingContext.length} GAP{missingContext.length > 1 ? 'S' : ''} IDENTIFIED
        </span>
      </div>

      {/* Grid of Missing Items */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {missingContext.map((item, idx) => {
          const badge = getCategoryBadge(item.category);
          return (
            <div
              key={idx}
              className="bg-white p-4 rounded border border-rose-200/80 shadow-2xs hover:border-rose-300 transition-colors"
            >
              <div className="flex items-center justify-between mb-2">
                <span className={`text-[10px] font-mono uppercase px-2 py-0.5 rounded font-bold border ${badge.color}`}>
                  {badge.label}
                </span>
                <span className="text-[10px] font-mono text-stone-400">ITEM #{idx + 1}</span>
              </div>

              {/* Description */}
              <h4 className="text-sm font-semibold text-stone-900 mb-1.5">
                {item.description}
              </h4>

              {/* Impact */}
              <div className="mb-2 text-xs text-stone-600">
                <strong className="font-mono text-[10px] uppercase text-stone-500 block mb-0.5">
                  Organizational Impact:
                </strong>
                <p className="leading-snug">{item.impact}</p>
              </div>

              {/* Suggested Investigation */}
              <div className="mt-3 pt-2.5 border-t border-dashed border-stone-200 text-xs text-stone-800 bg-[#FAF8F5] p-2.5 rounded flex items-start space-x-2">
                <Compass className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                <div>
                  <span className="text-[10px] font-mono uppercase text-amber-800 font-semibold block">
                    Recommended Recovery Investigation:
                  </span>
                  <p className="text-[11px] text-stone-700 mt-0.5">
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
