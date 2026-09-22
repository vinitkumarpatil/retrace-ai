'use client';

import React, { useState } from 'react';
import { Calendar, Users, Quote, ChevronDown, ChevronUp, GitCommitVertical, Milestone } from 'lucide-react';
import { TimelineEvent } from '@/lib/types';

interface TimelineViewProps {
  timeline: TimelineEvent[];
}

export default function TimelineView({ timeline }: TimelineViewProps) {
  const [expandedIndices, setExpandedIndices] = useState<Record<number, boolean>>({});

  const toggleExpand = (idx: number) => {
    setExpandedIndices(prev => ({ ...prev, [idx]: !prev[idx] }));
  };

  if (!timeline || timeline.length === 0) {
    return (
      <div className="panel p-8 text-center font-mono text-xs text-console-mute">
        NO CHRONOLOGICAL MILESTONES EXTRACTED FOR THIS QUERY
      </div>
    );
  }

  return (
    <div className="panel panel-hover animate-rise p-6">

      {/* Header */}
      <div className="flex items-center justify-between pb-4 mb-6 border-b border-console-border">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-console-emerald/10 border border-console-emerald/20">
            <Milestone className="w-4 h-4 text-console-emerald" />
          </div>
          <div>
            <h3 className="text-sm font-semibold text-white uppercase tracking-wider">
              Chronology
            </h3>
            <p className="text-[11px] font-mono text-console-mute">
              reconstructed sequence of events & decisions
            </p>
          </div>
        </div>

        <span className="text-xs font-mono px-2.5 py-1 rounded-lg bg-console-emerald/10 text-console-emerald border border-console-emerald/25">
          {timeline.length} STEPS
        </span>
      </div>

      {/* Stepped timeline */}
      <div className="relative pl-7 space-y-5 before:content-[''] before:absolute before:left-[11px] before:top-2 before:bottom-2 before:w-px before:bg-gradient-to-b before:from-console-cyan/40 before:via-console-border before:to-transparent">
        {timeline.map((event, idx) => {
          const isExpanded = !!expandedIndices[idx];

          return (
            <div key={idx} className="relative group">
              {/* Node */}
              <div className="absolute -left-7 top-1.5 w-6 h-6 rounded-full bg-console-s1 border border-console-cyan/50 flex items-center justify-center group-hover:border-console-cyan transition-all">
                <GitCommitVertical className="w-3 h-3 text-console-cyan" />
              </div>

              {/* Content */}
              <div className="inset-tile p-4 hover:border-console-cyan/30 transition-all">
                <div className="flex flex-wrap items-center justify-between gap-2 mb-2">
                  <div className="flex items-center gap-2 min-w-0">
                    <span className="flex items-center gap-1 text-xs font-mono font-semibold text-console-cyan bg-console-cyan/10 px-2 py-0.5 rounded border border-console-cyan/20">
                      <Calendar className="w-3 h-3" />
                      {event.date}
                    </span>
                    {event.document_title && (
                      <span className="text-[11px] font-mono text-console-mute truncate max-w-[16rem]">
                        via {event.document_title}
                      </span>
                    )}
                  </div>

                  {event.evidence_quote && (
                    <button
                      onClick={() => toggleExpand(idx)}
                      className="text-console-mute hover:text-white p-0.5 rounded transition-colors"
                    >
                      {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                    </button>
                  )}
                </div>

                <h4 className="text-sm font-semibold text-white mb-1.5">
                  {event.title}
                </h4>

                <p className="text-xs text-console-dim leading-relaxed mb-3">
                  {event.description}
                </p>

                {event.decision && (
                  <div className="p-2.5 rounded-lg bg-console-emerald/[0.06] border border-console-emerald/20 mb-3">
                    <span className="text-[10px] font-mono uppercase text-console-emerald font-bold block mb-0.5">
                      Decision registered
                    </span>
                    <p className="text-xs font-medium text-white">
                      {event.decision}
                    </p>
                  </div>
                )}

                {event.actors && event.actors.length > 0 && (
                  <div className="flex items-center flex-wrap gap-1.5 text-xs text-console-dim">
                    <Users className="w-3.5 h-3.5 text-console-mute shrink-0" />
                    {event.actors.map((actor, aIdx) => (
                      <span
                        key={aIdx}
                        className="px-1.5 py-0.5 rounded bg-console-s3 border border-console-border text-[11px] text-console-dim"
                      >
                        {actor}
                      </span>
                    ))}
                  </div>
                )}

                {event.evidence_quote && (
                  <div className={`mt-2 pt-2 border-t border-console-border ${isExpanded ? 'block' : 'hidden'}`}>
                    <div className="flex items-start gap-2 text-xs text-console-dim bg-console-s1 p-2.5 rounded-lg border border-console-border">
                      <Quote className="w-3.5 h-3.5 text-console-violet shrink-0 mt-0.5" />
                      <div>
                        <span className="text-[10px] font-mono uppercase text-console-mute block mb-0.5">
                          Direct excerpt
                        </span>
                        <span className="italic">“{event.evidence_quote}”</span>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

    </div>
  );
}
