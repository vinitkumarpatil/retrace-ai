'use client';

import React from 'react';
import { AlertCircle, HelpCircle, ArrowUpRight, Compass, ShieldAlert } from 'lucide-react';
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
        return { 
          label: 'Unrecorded Rationale', 
          color: 'bg-rose-50 dark:bg-rose-950/60 text-rose-700 dark:text-rose-300 border-rose-200 dark:border-rose-800' 
        };
      case 'missing_stakeholder':
        return { 
          label: 'Missing Stakeholder', 
          color: 'bg-amber-50 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300 border-amber-200 dark:border-amber-800' 
        };
      case 'broken_chain':
        return { 
          label: 'Disconnected Event Chain', 
          color: 'bg-orange-50 dark:bg-orange-950/60 text-orange-700 dark:text-orange-300 border-orange-200 dark:border-orange-800' 
        };
      case 'gap_in_dates':
        return { 
          label: 'Timeline Discontinuity', 
          color: 'bg-purple-50 dark:bg-purple-950/60 text-purple-700 dark:text-purple-300 border-purple-200 dark:border-purple-800' 
        };
      default:
        return { 
          label: 'Unresolved Question', 
          color: 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700' 
        };
    }
  };

  return (
    <div className="surface-card rounded-xl border border-rose-200/90 dark:border-rose-900/60 bg-gradient-to-b from-rose-50/30 to-white dark:from-rose-950/10 dark:to-[#0F172A] p-6 shadow-sm transition-colors">
      
      {/* Header Banner */}
      <div className="flex flex-wrap items-center justify-between gap-3 pb-4 mb-5 border-b border-rose-100 dark:border-rose-900/40">
        <div className="flex items-center space-x-3">
          <div className="p-2 bg-rose-100 dark:bg-rose-950 text-rose-700 dark:text-rose-400 rounded-lg">
            <ShieldAlert className="w-4.5 h-4.5" />
          </div>
          <div>
            <h3 className="text-sm font-semibold text-slate-900 dark:text-white tracking-tight flex items-center space-x-2">
              <span>Knowledge Gaps & Unrecorded Context</span>
              <span className="text-xs font-medium px-2 py-0.5 rounded-full bg-rose-100 dark:bg-rose-950 text-rose-700 dark:text-rose-300 border border-rose-200 dark:border-rose-800">
                {missingContext.length} {missingContext.length === 1 ? 'gap' : 'gaps'} detected
              </span>
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              The following decision factors were not found in written records. Zero-hallucination constraint flagged these missing links.
            </p>
          </div>
        </div>
      </div>

      {/* Grid of Missing Items */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {missingContext.map((item, idx) => {
          const badge = getCategoryBadge(item.category);
          return (
            <div
              key={idx}
              className="bg-white dark:bg-[#0B0F19] p-5 rounded-xl border border-slate-200 dark:border-slate-800/80 shadow-2xs hover:border-rose-300 dark:hover:border-rose-800 transition-all flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between gap-2 mb-2.5">
                  <span className={`text-[11px] font-medium px-2.5 py-0.5 rounded-full border ${badge.color}`}>
                    {badge.label}
                  </span>
                  <span className="text-[11px] text-slate-400 dark:text-slate-500 font-mono">
                    Gap #{idx + 1}
                  </span>
                </div>

                {/* Gap Description */}
                <h4 className="text-sm font-semibold text-slate-900 dark:text-slate-100 mb-2 leading-snug">
                  {item.description}
                </h4>

                {/* Impact Analysis */}
                <div className="mb-3 text-xs text-slate-600 dark:text-slate-300">
                  <span className="font-semibold text-slate-500 dark:text-slate-400 text-[11px] block mb-1">
                    Organizational Impact:
                  </span>
                  <p className="leading-relaxed bg-slate-50 dark:bg-slate-900/60 p-2.5 rounded-lg border border-slate-100 dark:border-slate-800/60">
                    {item.impact}
                  </p>
                </div>
              </div>

              {/* Recommended Next Action */}
              <div className="mt-3 pt-3 border-t border-slate-100 dark:border-slate-800/60 flex items-start space-x-2 text-xs text-indigo-700 dark:text-indigo-300">
                <Compass className="w-4 h-4 text-indigo-500 dark:text-indigo-400 shrink-0 mt-0.5" />
                <div>
                  <span className="font-semibold text-[11px] uppercase tracking-wider block text-indigo-800 dark:text-indigo-300">
                    Suggested Investigation:
                  </span>
                  <p className="text-slate-700 dark:text-slate-300 mt-0.5 text-xs">
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
