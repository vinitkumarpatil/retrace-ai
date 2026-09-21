'use client';

import React, { useState } from 'react';
import { Calendar, Users, Quote, CheckCircle2, ChevronDown, ChevronUp, Clock } from 'lucide-react';
import { TimelineEvent } from '@/lib/types';

interface TimelineViewProps {
  timeline: TimelineEvent[];
}

export default function TimelineView({ timeline }: TimelineViewProps) {
  const [expandedIndices, setExpandedIndices] = useState<Record<number, boolean>>({});

  const toggleExpand = (idx: number) => {
    setExpandedIndices(prev => ({
      ...prev,
      [idx]: !prev[idx]
    }));
  };

  if (!timeline || timeline.length === 0) {
    return (
      <div className="p-8 text-center border border-dashed border-[#E2DDD5] rounded bg-white font-mono text-xs text-stone-400">
        NO CHRONOLOGICAL MILESTONES EXTRACTED FOR THIS QUERY
      </div>
    );
  }

  return (
    <div className="drafting-card rounded-md border border-[#E2DDD5] bg-white p-6 relative corner-ticks shadow-xs">
      
      {/* Blueprint Header */}
      <div className="flex items-center justify-between pb-4 mb-6 border-b border-[#E2DDD5]">
        <div className="flex items-center space-x-2">
          <div className="p-1.5 bg-stone-100 rounded text-stone-700">
            <Clock className="w-4 h-4 text-emerald-600" />
          </div>
          <div>
            <h3 className="text-xs font-mono font-bold text-stone-900 uppercase tracking-wider">
              CHRONOLOGICAL RECONSTRUCTION TIMELINE
            </h3>
            <p className="text-[11px] font-mono text-stone-500">
              SEQUENCE OF EVENTS, DECISIONS & ARCHITECTURAL PIVOTS
            </p>
          </div>
        </div>

        <span className="text-xs font-mono px-2 py-0.5 rounded bg-emerald-50 text-emerald-800 border border-emerald-200">
          {timeline.length} MILESTONES
        </span>
      </div>

      {/* Vertical Stepped Timeline */}
      <div className="relative pl-6 space-y-6 before:content-[''] before:absolute before:left-2.5 before:top-2 before:bottom-2 before:w-0.5 before:bg-[#E2DDD5]">
        {timeline.map((event, idx) => {
          const isExpanded = !!expandedIndices[idx];

          return (
            <div key={idx} className="relative group">
              {/* Timeline Marker Node */}
              <div className="absolute -left-6 top-1 w-5 h-5 rounded-full bg-white border-2 border-amber-500 flex items-center justify-center group-hover:scale-110 group-hover:border-emerald-600 transition-all shadow-xs">
                <span className="w-1.5 h-1.5 bg-amber-500 rounded-full group-hover:bg-emerald-600"></span>
              </div>

              {/* Event Content Box */}
              <div className="bg-[#FAF8F5] border border-[#E2DDD5] hover:border-amber-400/80 rounded p-4 transition-all">
                
                {/* Milestone Top Bar */}
                <div className="flex flex-wrap items-center justify-between gap-2 mb-2">
                  <div className="flex items-center space-x-2">
                    <span className="flex items-center space-x-1 text-xs font-mono font-semibold text-amber-800 bg-amber-100/60 px-2 py-0.5 rounded border border-amber-200">
                      <Calendar className="w-3 h-3 text-amber-700" />
                      <span>{event.date}</span>
                    </span>
                    {event.document_title && (
                      <span className="text-[11px] font-mono text-stone-500 truncate max-w-xs">
                        via {event.document_title}
                      </span>
                    )}
                  </div>

                  <button
                    onClick={() => toggleExpand(idx)}
                    className="text-stone-400 hover:text-stone-700 p-0.5 rounded"
                  >
                    {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                  </button>
                </div>

                {/* Milestone Title */}
                <h4 className="text-sm font-bold text-stone-900 mb-1.5">
                  {event.title}
                </h4>

                {/* Event Description */}
                <p className="text-xs text-stone-700 leading-relaxed font-sans mb-3">
                  {event.description}
                </p>

                {/* Explicit Decision Callout (if any) */}
                {event.decision && (
                  <div className="p-2.5 rounded bg-white border-l-3 border-emerald-600 border border-[#E2DDD5] mb-3">
                    <span className="text-[10px] font-mono uppercase text-emerald-800 font-bold block mb-0.5">
                      DECISION REGISTERED:
                    </span>
                    <p className="text-xs font-medium text-stone-800">
                      {event.decision}
                    </p>
                  </div>
                )}

                {/* Actors Involved */}
                {event.actors && event.actors.length > 0 && (
                  <div className="flex items-center space-x-1.5 text-xs text-stone-600 mb-2 font-mono">
                    <Users className="w-3.5 h-3.5 text-stone-400 shrink-0" />
                    <span className="text-[11px] text-stone-500">Key Stakeholders:</span>
                    <div className="flex flex-wrap gap-1">
                      {event.actors.map((actor, aIdx) => (
                        <span
                          key={aIdx}
                          className="px-1.5 py-0.2 rounded bg-white border border-stone-200 text-[11px] text-stone-700"
                        >
                          {actor}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {/* Expandable Exact Evidence Quote */}
                {event.evidence_quote && (
                  <div className={`mt-2 pt-2 border-t border-dashed border-[#E2DDD5] ${isExpanded ? 'block' : 'hidden'}`}>
                    <div className="flex items-start space-x-1.5 text-xs text-stone-600 italic bg-white p-2.5 rounded border border-[#E2DDD5]">
                      <Quote className="w-3.5 h-3.5 text-amber-500 shrink-0 mt-0.5" />
                      <div>
                        <span className="text-[10px] font-mono uppercase text-stone-400 not-italic block mb-0.5">
                          Direct Document Excerpt:
                        </span>
                        <span>"{event.evidence_quote}"</span>
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
