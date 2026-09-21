'use client';

import React, { useState } from 'react';
import {
  Calendar,
  Clock,
  ChevronDown,
  ChevronUp,
  Search,
  Quote,
  Check,
  Copy,
  ArrowDown,
  CheckCircle2,
  Users,
} from 'lucide-react';
import { TimelineEvent } from '@/lib/types';

interface TimelineViewProps {
  timeline: TimelineEvent[];
  onSelectEvent?: (event: TimelineEvent) => void;
}

export default function TimelineView({ timeline, onSelectEvent }: TimelineViewProps) {
  const [expandedIndices, setExpandedIndices] = useState<Record<number, boolean>>({});
  const [selectedIdx, setSelectedIdx] = useState<number | null>(null);
  const [searchTerm, setSearchTerm] = useState<string>('');

  const toggleExpand = (idx: number, e: React.MouseEvent) => {
    e.stopPropagation();
    setExpandedIndices((prev) => ({
      ...prev,
      [idx]: !prev[idx],
    }));
  };

  const handleSelect = (event: TimelineEvent, idx: number) => {
    setSelectedIdx(idx);
    if (onSelectEvent) {
      onSelectEvent(event);
    }
  };

  const filtered = (timeline || []).filter((item) => {
    if (!searchTerm.trim()) return true;
    const q = searchTerm.toLowerCase();
    return (
      item.title.toLowerCase().includes(q) ||
      item.description.toLowerCase().includes(q) ||
      item.date.toLowerCase().includes(q)
    );
  });

  if (!timeline || timeline.length === 0) {
    return (
      <div className="p-8 text-center rounded-xl bg-[#101722] border border-[#243044] font-mono text-xs text-[#94A3B8]">
        NO CHRONOLOGICAL DECISION MILESTONES EXTRACTED FOR THIS QUERY
      </div>
    );
  }

  return (
    <div className="rounded-xl p-6 bg-[#101722] border border-[#243044] shadow-xl space-y-5">
      
      {/* Timeline Header */}
      <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-[#243044]">
        <div className="flex items-center space-x-2.5">
          <div className="p-1.5 rounded-lg bg-[#00F2FE]/10 text-[#00F2FE] border border-[#00F2FE]/30">
            <Clock className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-xs font-mono font-bold text-white uppercase tracking-wider">
              DECISION TIMELINE
            </h3>
            <p className="text-[11px] font-mono text-[#94A3B8]">
              CHRONOLOGICAL SEQUENCE OF PROPOSALS, COMMITTEES & DEPLOYMENTS
            </p>
          </div>
        </div>

        {/* Search */}
        <div className="relative">
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search timeline..."
            className="w-40 sm:w-48 pl-7 pr-2 py-1 bg-[#05070D] border border-[#243044] rounded text-white text-xs font-mono placeholder:text-[#64748B] focus:outline-none focus:border-[#00F2FE]"
          />
          <Search className="w-3.5 h-3.5 text-[#64748B] absolute left-2 top-2" />
        </div>
      </div>

      {/* Stepped Timeline */}
      <div className="relative pl-7 space-y-5 before:content-[''] before:absolute before:left-3 before:top-2 before:bottom-2 before:w-0.5 before:bg-[#243044]">
        {filtered.map((event, idx) => {
          const isSelected = selectedIdx === idx;
          const isExpanded = !!expandedIndices[idx];

          return (
            <div
              key={idx}
              onClick={() => handleSelect(event, idx)}
              className="relative group cursor-pointer transition-all"
            >
              {/* Stepped Marker Node */}
              <div
                className={`absolute -left-7 top-2 w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all bg-[#0B101A] ${
                  isSelected
                    ? 'border-[#00F2FE] scale-110 shadow-md shadow-[#00F2FE]/30'
                    : 'border-[#243044] group-hover:border-[#00F2FE]'
                }`}
              >
                <span
                  className={`w-1.5 h-1.5 rounded-full ${
                    isSelected ? 'bg-[#00F2FE]' : 'bg-[#94A3B8] group-hover:bg-[#00F2FE]'
                  }`}
                ></span>
              </div>

              {/* Event Card */}
              <div
                className={`p-4 rounded-xl border transition-all ${
                  isSelected
                    ? 'bg-[#151D29] border-[#00F2FE]/60 shadow-lg'
                    : 'bg-[#0B101A] border-[#243044] hover:border-[#334155]'
                }`}
              >
                <div className="flex items-center justify-between gap-2 mb-1.5">
                  <div className="flex items-center space-x-2">
                    <span className="text-xs font-mono font-bold text-[#00F2FE] bg-[#00F2FE]/10 px-2 py-0.5 rounded border border-[#00F2FE]/30">
                      {event.date}
                    </span>
                    {event.document_title && (
                      <span className="text-[11px] font-mono text-[#94A3B8] truncate max-w-xs">
                        via {event.document_title}
                      </span>
                    )}
                  </div>

                  <button
                    onClick={(e) => toggleExpand(idx, e)}
                    className="text-[#94A3B8] hover:text-white p-1"
                  >
                    {isExpanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                  </button>
                </div>

                <h4 className="text-xs font-bold text-white font-sans mb-1">
                  {event.title}
                </h4>

                <p className="text-[11px] text-[#94A3B8] font-sans leading-relaxed mb-2">
                  {event.description}
                </p>

                {/* Explicit Decision Tag */}
                {event.decision && (
                  <div className="p-2 rounded bg-[#101722] border-l-2 border-[#10B981] border border-[#243044] text-[11px] text-slate-200 mb-2">
                    <strong className="text-[#10B981] block text-[10px] font-mono uppercase">
                      Decision Commit:
                    </strong>
                    {event.decision}
                  </div>
                )}

                {/* Actors Involved */}
                {event.actors && event.actors.length > 0 && (
                  <div className="flex flex-wrap items-center gap-1.5 pt-1 text-[10px] font-mono text-[#94A3B8]">
                    <span className="text-[#64748B]">Stakeholders:</span>
                    {event.actors.map((actor, aIdx) => (
                      <span
                        key={aIdx}
                        className="px-1.5 py-0.2 rounded bg-[#151D29] border border-[#243044] text-slate-200"
                      >
                        {actor}
                      </span>
                    ))}
                  </div>
                )}

                {/* Expandable Quote Excerpt */}
                {isExpanded && event.evidence_quote && (
                  <div className="mt-2.5 pt-2 border-t border-[#243044] text-[11px] text-[#94A3B8] font-sans italic bg-[#05070D] p-2.5 rounded border border-[#243044]">
                    &ldquo;{event.evidence_quote}&rdquo;
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
