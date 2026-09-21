'use client';

import React, { useState } from 'react';
import { AlertOctagon, Compass, Copy, Check, ShieldCheck, ShieldAlert, CheckCircle2 } from 'lucide-react';
import { MissingContextFlag } from '@/lib/types';

interface MissingContextCalloutProps {
  missingContext: MissingContextFlag[];
}

export default function MissingContextCallout({ missingContext }: MissingContextCalloutProps) {
  const [copiedIdx, setCopiedIdx] = useState<number | null>(null);

  const getCategoryBadge = (category: string) => {
    switch (category) {
      case 'unrecorded_reason':
        return {
          label: 'UNRECORDED RATIONALE',
          border: 'border-[#EF4444]/40 text-[#EF4444] bg-[#EF4444]/10',
        };
      case 'missing_stakeholder':
        return {
          label: 'MISSING STAKEHOLDER',
          border: 'border-[#F59E0B]/40 text-[#F59E0B] bg-[#F59E0B]/10',
        };
      case 'broken_chain':
        return {
          label: 'DISCONNECTED CHAIN',
          border: 'border-[#8B5CF6]/40 text-[#8B5CF6] bg-[#8B5CF6]/10',
        };
      case 'gap_in_dates':
        return {
          label: 'TIMELINE GAP',
          border: 'border-[#00F2FE]/40 text-[#00F2FE] bg-[#00F2FE]/10',
        };
      default:
        return {
          label: 'UNRESOLVED CONTEXT',
          border: 'border-[#243044] text-[#94A3B8] bg-[#151D29]',
        };
    }
  };

  const handleCopyGap = (item: MissingContextFlag, idx: number) => {
    const text = `[RETRACE ZERO-HALLUCINATION AUDIT - ${item.category.toUpperCase()}]\nDescription: ${item.description}\nImpact: ${item.impact}\nRecommended Action: ${item.suggested_investigation}`;
    navigator.clipboard.writeText(text);
    setCopiedIdx(idx);
    setTimeout(() => setCopiedIdx(null), 2000);
  };

  return (
    <div className="rounded-xl border border-[#243044] bg-[#101722] p-5 shadow-xl space-y-4">
      
      {/* Zero-Hallucination Dedicated Trust Bar */}
      <div className="p-3.5 rounded-lg bg-[#0B101A] border border-[#243044] flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center space-x-3">
          <div className="p-1.5 rounded-md bg-[#10B981]/15 text-[#10B981] border border-[#10B981]/30">
            <ShieldCheck className="w-4 h-4" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <span className="text-xs font-mono font-bold text-white uppercase tracking-wider">
                ZERO-HALLUCINATION GUARD
              </span>
              <span className="text-[10px] font-mono px-2 py-0.2 rounded-full bg-[#10B981]/15 text-[#10B981] font-bold border border-[#10B981]/30">
                ACTIVE
              </span>
            </div>
            <p className="text-[11px] font-mono text-[#94A3B8]">
              Evidence-backed responses only. Zero fabrications permitted.
            </p>
          </div>
        </div>

        <div className="text-xs font-mono text-[#94A3B8] flex items-center space-x-2">
          {missingContext && missingContext.length > 0 ? (
            <span className="text-[#EF4444] font-bold bg-[#EF4444]/10 px-2 py-0.5 rounded border border-[#EF4444]/30">
              {missingContext.length} UNRECORDED GAPS DETECTED
            </span>
          ) : (
            <span className="text-[#10B981] font-bold bg-[#10B981]/10 px-2 py-0.5 rounded border border-[#10B981]/30 flex items-center space-x-1">
              <CheckCircle2 className="w-3 h-3" />
              <span>100% RECONSTRUCTED FROM CITATIONS</span>
            </span>
          )}
        </div>
      </div>

      {/* If Missing Context Detected */}
      {missingContext && missingContext.length > 0 && (
        <div className="space-y-3 pt-1">
          <div className="text-[10px] font-mono uppercase tracking-wider text-[#EF4444] font-bold flex items-center space-x-1.5">
            <AlertOctagon className="w-3.5 h-3.5" />
            <span>UNRESOLVED ARCHITECTURAL GAPS // AUDIT LOG</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {missingContext.map((item, idx) => {
              const badge = getCategoryBadge(item.category);
              const isCopied = copiedIdx === idx;

              return (
                <div
                  key={idx}
                  className="bg-[#0B101A] p-4 rounded-xl border border-[#243044] hover:border-[#EF4444]/40 transition-all flex flex-col justify-between"
                >
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span
                        className={`text-[9px] font-mono uppercase px-2 py-0.5 rounded font-bold border ${badge.border}`}
                      >
                        {badge.label}
                      </span>
                      <div className="flex items-center space-x-1">
                        <span className="text-[10px] font-mono text-[#64748B]">GAP #{idx + 1}</span>
                        <button
                          onClick={() => handleCopyGap(item, idx)}
                          className="text-[#94A3B8] hover:text-white p-1 rounded hover:bg-white/5 transition-colors"
                          title="Copy gap"
                        >
                          {isCopied ? <Check className="w-3 h-3 text-[#10B981]" /> : <Copy className="w-3 h-3" />}
                        </button>
                      </div>
                    </div>

                    <h4 className="text-xs font-bold text-white mb-2 leading-snug font-sans">
                      {item.description}
                    </h4>

                    <div className="mb-2 text-[11px] text-[#94A3B8] font-sans bg-[#05070D] p-2.5 rounded border border-[#243044]">
                      <strong className="font-mono text-[10px] uppercase text-white block mb-0.5">
                        Impact:
                      </strong>
                      <p className="leading-relaxed">{item.impact}</p>
                    </div>
                  </div>

                  <div className="pt-2 border-t border-[#243044] text-[11px] text-[#00F2FE] bg-[#101722] p-2.5 rounded flex items-start space-x-2">
                    <Compass className="w-3.5 h-3.5 text-[#00F2FE] shrink-0 mt-0.5" />
                    <div>
                      <span className="text-[10px] font-mono uppercase text-[#00F2FE] font-bold block">
                        Recommended Recovery Action:
                      </span>
                      <p className="text-[#94A3B8] text-[10px] mt-0.5 leading-relaxed">
                        {item.suggested_investigation}
                      </p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

    </div>
  );
}
