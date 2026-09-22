'use client';

import React, { useState } from 'react';
import {
  Users,
  Quote,
  ChevronDown,
  ChevronUp,
  Search,
  ChevronsUpDown,
  FileText,
  X,
} from 'lucide-react';
import { TimelineEvent } from '@/lib/types';

interface TimelineViewProps {
  timeline: TimelineEvent[];
  selectedEntityId?: string | null;
  onSelectEntityName?: (name: string) => void;
}

export default function TimelineView({
  timeline,
  selectedEntityId,
  onSelectEntityName,
}: TimelineViewProps) {
  const [expandedIndices, setExpandedIndices] = useState<Record<number, boolean>>({});
  const [filterText, setFilterText] = useState('');
  const [allExpanded, setAllExpanded] = useState(false);

  const toggleExpand = (idx: number) =>
    setExpandedIndices(prev => ({ ...prev, [idx]: !prev[idx] }));

  const handleToggleAll = () => {
    const next = !allExpanded;
    setAllExpanded(next);
    const map: Record<number, boolean> = {};
    timeline.forEach((_, idx) => { map[idx] = next; });
    setExpandedIndices(map);
  };

  if (!timeline || timeline.length === 0) {
    return (
      <div className="sheet shadow-sheet p-8 text-center text-[13px] text-ink-faint">
        No dated events were found for this inquiry.
      </div>
    );
  }

  const filtered = timeline.filter(event => {
    if (!filterText.trim()) return true;
    const q = filterText.toLowerCase();
    return (
      event.title.toLowerCase().includes(q) ||
      event.description.toLowerCase().includes(q) ||
      event.date.toLowerCase().includes(q) ||
      (event.decision && event.decision.toLowerCase().includes(q)) ||
      (event.actors && event.actors.some(a => a.toLowerCase().includes(q)))
    );
  });

  return (
    <section className="sheet shadow-sheet p-6">
      <header className="flex flex-wrap items-center justify-between gap-3 pb-4 mb-4 border-b border-rule">
        <div>
          <h3 className="font-serif text-[17px] font-semibold text-ink">Timeline</h3>
          <p className="text-[13px] text-ink-soft mt-0.5">The sequence of events, reconstructed from the sources.</p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={handleToggleAll}
            className="inline-flex items-center gap-1.5 px-2.5 py-1 text-[12px] font-medium text-ink-soft border border-rule rounded-sheet bg-paper hover:bg-sheet hover:text-ink transition-colors"
          >
            <ChevronsUpDown className="w-3.5 h-3.5 text-ink-faint" />
            {allExpanded ? 'Collapse all' : 'Expand all'}
          </button>
          <span className="catalog">{timeline.length} events</span>
        </div>
      </header>

      {/* Filter */}
      <div className="mb-6 relative">
        <Search className="w-3.5 h-3.5 absolute left-3 top-2.5 text-ink-faint" />
        <input
          type="text"
          value={filterText}
          onChange={(e) => setFilterText(e.target.value)}
          placeholder="Filter by person, decision, or date…"
          className="w-full pl-9 pr-4 py-2 bg-paper border border-rule rounded-sheet text-[13px] text-ink placeholder:text-ink-faint focus:outline-none focus:border-stamp/60 transition-colors"
        />
        {filterText && (
          <button onClick={() => setFilterText('')} className="absolute right-3 top-2.5 text-ink-faint hover:text-ink">
            <X className="w-3.5 h-3.5" />
          </button>
        )}
      </div>

      {selectedEntityId && (
        <div className="mb-5 flex items-center justify-between gap-2 px-3.5 py-2 rounded-sheet border border-stamp/30 bg-stamp/[0.05] text-[12.5px] text-ink-soft">
          <span>Showing events involving <strong className="font-semibold text-ink">{selectedEntityId}</strong></span>
          <button onClick={() => onSelectEntityName?.('')} className="inline-flex items-center gap-1 text-stamp hover:underline font-medium">
            Clear <X className="w-3 h-3" />
          </button>
        </div>
      )}

      {/* Ruled chronology — a single margin rule, dated entries hang off it */}
      <ol className="relative pl-8 space-y-5 before:content-[''] before:absolute before:left-[6px] before:top-2 before:bottom-2 before:w-px before:bg-rule-strong">
        {filtered.map((event, idx) => {
          const isExpanded = !!expandedIndices[idx];
          const matches = selectedEntityId
            ? (
                event.title.toLowerCase().includes(selectedEntityId.toLowerCase()) ||
                event.description.toLowerCase().includes(selectedEntityId.toLowerCase()) ||
                (event.actors && event.actors.some(a => a.toLowerCase().includes(selectedEntityId.toLowerCase()))) ||
                (event.decision && event.decision.toLowerCase().includes(selectedEntityId.toLowerCase()))
              )
            : false;
          const isDimmed = selectedEntityId && !matches;

          return (
            <li
              key={idx}
              className={`relative transition-opacity duration-200 ${isDimmed ? 'opacity-40 hover:opacity-100' : 'opacity-100'}`}
            >
              {/* Node on the margin rule */}
              <span className={`absolute -left-[1.625rem] top-1.5 w-[13px] h-[13px] rounded-full border-2 bg-sheet transition-colors ${
                matches ? 'border-stamp' : 'border-rule-strong'
              }`}>
                {matches && <span className="absolute inset-1 rounded-full bg-stamp" />}
              </span>

              <div className={`rounded-card border p-4 transition-colors ${
                matches ? 'border-stamp/50 bg-stamp/[0.03]' : 'border-rule bg-paper/50 hover:border-rule-strong'
              }`}>
                <div className="flex flex-wrap items-center justify-between gap-2 mb-1.5">
                  <div className="flex items-center gap-2.5 min-w-0">
                    <span className="font-mono text-[12px] font-medium text-stamp">{event.date}</span>
                    {event.document_title && (
                      <span className="flex items-center gap-1 text-[11.5px] text-ink-faint truncate">
                        <FileText className="w-3 h-3 shrink-0" />
                        <span className="truncate">{event.document_title}</span>
                      </span>
                    )}
                  </div>
                  {event.evidence_quote && (
                    <button
                      onClick={() => toggleExpand(idx)}
                      className="text-ink-faint hover:text-ink p-0.5 rounded transition-colors"
                      title={isExpanded ? 'Hide excerpt' : 'Show excerpt'}
                    >
                      {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                    </button>
                  )}
                </div>

                <h4 className="font-serif text-[16px] font-medium text-ink leading-snug mb-1.5">{event.title}</h4>
                <p className="text-[13.5px] text-ink-soft leading-relaxed mb-3">{event.description}</p>

                {event.decision && (
                  <div className="mb-3 pl-3 border-l-2 border-verified/70 bg-verified/[0.06] py-2 pr-3 rounded-r-sheet">
                    <div className="field-label mb-0.5" style={{ color: 'rgb(var(--verified))' }}>Decision</div>
                    <p className="text-[13.5px] font-medium text-ink">{event.decision}</p>
                  </div>
                )}

                {event.actors && event.actors.length > 0 && (
                  <div className="flex items-center flex-wrap gap-1.5 text-[12px]">
                    <Users className="w-3.5 h-3.5 text-ink-faint shrink-0" />
                    {event.actors.map((actor, aIdx) => {
                      const active = selectedEntityId && actor.toLowerCase() === selectedEntityId.toLowerCase();
                      return (
                        <button
                          key={aIdx}
                          onClick={() => onSelectEntityName?.(actor)}
                          className={`px-2 py-0.5 rounded-sheet text-[11.5px] font-medium transition-colors ${
                            active
                              ? 'bg-stamp text-paper'
                              : 'bg-sheet border border-rule text-ink-soft hover:border-rule-strong hover:text-ink'
                          }`}
                          title={`Focus on ${actor}`}
                        >
                          {actor}
                        </button>
                      );
                    })}
                  </div>
                )}

                {event.evidence_quote && isExpanded && (
                  <div className="mt-3 pt-3 border-t border-rule flex items-start gap-2.5">
                    <Quote className="w-4 h-4 text-stamp shrink-0 mt-0.5" />
                    <div>
                      <div className="field-label mb-1">From the source</div>
                      <p className="prose-finding italic text-[13.5px] text-ink-soft">“{event.evidence_quote}”</p>
                    </div>
                  </div>
                )}
              </div>
            </li>
          );
        })}
      </ol>
    </section>
  );
}
