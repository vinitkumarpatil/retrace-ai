'use client';

import React, { useState } from 'react';
import { FileText, Copy, Check } from 'lucide-react';
import { Citation } from '@/lib/types';

interface EvidencePanelProps {
  citations: Citation[];
  selectedEntityId?: string | null;
}

export default function EvidencePanel({ citations, selectedEntityId }: EvidencePanelProps) {
  const [copiedIdx, setCopiedIdx] = useState<number | null>(null);

  if (!citations || citations.length === 0) return null;

  const handleCopyQuote = (quote: string, idx: number) => {
    navigator.clipboard.writeText(quote);
    setCopiedIdx(idx);
    setTimeout(() => setCopiedIdx(null), 2000);
  };

  return (
    <section className="sheet shadow-sheet p-6">
      <header className="flex flex-wrap items-center justify-between gap-3 pb-4 mb-4 border-b border-rule">
        <div>
          <h3 className="font-serif text-[17px] font-semibold text-ink">Sources</h3>
          <p className="text-[13px] text-ink-soft mt-0.5">The exact passages behind the finding. Nothing inferred.</p>
        </div>
        <span className="catalog">{citations.length} exhibits</span>
      </header>

      <div className="space-y-3">
        {citations.map((citation, idx) => {
          const isMatched = selectedEntityId
            ? citation.document_title.toLowerCase().includes(selectedEntityId.toLowerCase()) ||
              citation.quote.toLowerCase().includes(selectedEntityId.toLowerCase()) ||
              citation.relevance.toLowerCase().includes(selectedEntityId.toLowerCase())
            : false;

          return (
            <figure
              key={idx}
              className={`rounded-card border p-4 transition-colors ${
                isMatched ? 'border-stamp/50 bg-stamp/[0.03]' : 'border-rule bg-paper/50 hover:border-rule-strong'
              }`}
            >
              <figcaption className="flex items-center justify-between gap-2 mb-2.5">
                <div className="flex items-center gap-2.5 min-w-0">
                  <span className="font-mono text-[11px] font-semibold text-stamp border border-stamp/30 rounded px-1.5 py-0.5 shrink-0">
                    EX-{String(idx + 1).padStart(2, '0')}
                  </span>
                  <FileText className="w-3.5 h-3.5 text-ink-faint shrink-0" />
                  <span className="text-[13px] font-medium text-ink truncate">{citation.document_title}</span>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <span className="catalog uppercase">{citation.source_type}</span>
                  <button
                    onClick={() => handleCopyQuote(citation.quote, idx)}
                    className="p-1 text-ink-faint hover:text-ink rounded transition-colors"
                    title="Copy quote"
                  >
                    {copiedIdx === idx ? <Check className="w-3.5 h-3.5 text-verified" /> : <Copy className="w-3.5 h-3.5" />}
                  </button>
                </div>
              </figcaption>

              {citation.relevance && (
                <p className="text-[12.5px] text-ink-faint mb-2.5">
                  <span className="text-ink-soft font-medium">Relevance:</span> {citation.relevance}
                </p>
              )}

              {/* Verbatim quote — indented, serif, like a block quotation in a report */}
              <blockquote className="prose-finding text-[14px] text-ink pl-4 border-l-2 border-stamp/40 italic">
                “{citation.quote}”
              </blockquote>
            </figure>
          );
        })}
      </div>
    </section>
  );
}
