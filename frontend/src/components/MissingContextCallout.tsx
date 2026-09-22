'use client';

import React from 'react';
import { ArrowRight } from 'lucide-react';
import { MissingContextFlag } from '@/lib/types';

interface MissingContextCalloutProps {
  missingContext: MissingContextFlag[];
}

const CATEGORY_LABEL: Record<string, string> = {
  unrecorded_reason: 'Unrecorded reason',
  missing_stakeholder: 'Missing person',
  broken_chain: 'Broken chain',
  gap_in_dates: 'Timeline gap',
  unresolved_question: 'Open question',
};

export default function MissingContextCallout({ missingContext }: MissingContextCalloutProps) {
  if (!missingContext || missingContext.length === 0) return null;

  const count = missingContext.length;

  return (
    <section className="sheet shadow-sheet overflow-hidden border-stamp/35">
      {/* Header with a struck "not on record" stamp */}
      <header className="flex flex-wrap items-center justify-between gap-3 px-6 py-4 border-b border-stamp/20 bg-stamp/[0.04]">
        <div>
          <h3 className="font-serif text-[17px] font-semibold text-ink">Gaps in the record</h3>
          <p className="text-[13px] text-ink-soft mt-0.5 max-w-[70ch]">
            These factors shaped the decision but were never written down. ReTrace flags them rather than guessing.
          </p>
        </div>
        <span className="stamp inline-flex items-center px-3 py-1.5 text-[12px] shrink-0">
          {count} not on record
        </span>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-px bg-rule">
        {missingContext.map((item, idx) => (
          <div key={idx} className="bg-sheet p-5 flex flex-col">
            <div className="flex items-center justify-between gap-2 mb-2.5">
              <span className="font-mono text-[10px] uppercase tracking-label text-stamp border border-stamp/30 rounded px-1.5 py-0.5">
                {CATEGORY_LABEL[item.category] || 'Open question'}
              </span>
              <span className="catalog">GAP-{String(idx + 1).padStart(2, '0')}</span>
            </div>

            <h4 className="font-serif text-[16px] font-medium text-ink leading-snug mb-3">
              {item.description}
            </h4>

            <div className="mb-3">
              <div className="field-label mb-1">Why it matters</div>
              <p className="text-[13px] text-ink-soft leading-relaxed">{item.impact}</p>
            </div>

            <div className="mt-auto pt-3 border-t border-rule flex items-start gap-2">
              <ArrowRight className="w-3.5 h-3.5 text-stamp shrink-0 mt-0.5" />
              <div>
                <div className="field-label mb-0.5">Where to look next</div>
                <p className="text-[13px] text-ink-soft leading-relaxed">{item.suggested_investigation}</p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
