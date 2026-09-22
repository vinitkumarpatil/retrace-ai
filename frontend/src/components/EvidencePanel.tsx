'use client';

import React from 'react';
import { FileText, Quote, Layers } from 'lucide-react';
import { Citation } from '@/lib/types';

interface EvidencePanelProps {
  citations: Citation[];
}

export default function EvidencePanel({ citations }: EvidencePanelProps) {
  if (!citations || citations.length === 0) {
    return null;
  }

  const getSourceBadge = (type: string) => {
    switch (type.toLowerCase()) {
      case 'pdf':
        return 'bg-console-rose/10 text-console-rose border-console-rose/25';
      case 'image':
        return 'bg-console-violet/10 text-console-violet border-console-violet/25';
      case 'url':
        return 'bg-console-cyan/10 text-console-cyan border-console-cyan/25';
      default:
        return 'bg-console-amber/10 text-console-amber border-console-amber/25';
    }
  };

  return (
    <div className="panel panel-hover animate-rise p-6">

      {/* Header */}
      <div className="flex items-center justify-between pb-4 mb-4 border-b border-console-border">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-console-s3 border border-console-border">
            <Layers className="w-4 h-4 text-console-dim" />
          </div>
          <div>
            <h3 className="text-sm font-semibold text-white uppercase tracking-wider">
              Evidence & Sources
            </h3>
            <p className="text-[11px] font-mono text-console-mute">
              original documents backing every claim
            </p>
          </div>
        </div>

        <span className="text-xs font-mono px-2.5 py-1 rounded-lg bg-console-s3 text-console-dim border border-console-border">
          {citations.length} SOURCE{citations.length > 1 ? 'S' : ''}
        </span>
      </div>

      {/* List */}
      <div className="space-y-3">
        {citations.map((citation, idx) => {
          const badgeClass = getSourceBadge(citation.source_type);

          return (
            <div
              key={idx}
              className="inset-tile p-3.5 hover:border-console-border-strong transition-colors"
            >
              <div className="flex items-center justify-between gap-2 mb-1.5">
                <div className="flex items-center gap-2 min-w-0">
                  <FileText className="w-4 h-4 text-console-mute shrink-0" />
                  <span className="text-xs font-semibold text-white font-mono truncate">
                    {citation.document_title}
                  </span>
                </div>
                <span className={`text-[10px] font-mono uppercase px-2 py-0.5 rounded border font-semibold shrink-0 ${badgeClass}`}>
                  {citation.source_type}
                </span>
              </div>

              {citation.relevance && (
                <p className="text-[11px] font-mono text-console-mute mb-2">
                  note: {citation.relevance}
                </p>
              )}

              <div className="bg-console-s1 p-2.5 rounded-lg border border-console-border text-xs text-console-dim flex items-start gap-2">
                <Quote className="w-3.5 h-3.5 text-console-violet shrink-0 mt-0.5" />
                <span className="leading-relaxed italic">“{citation.quote}”</span>
              </div>
            </div>
          );
        })}
      </div>

    </div>
  );
}
