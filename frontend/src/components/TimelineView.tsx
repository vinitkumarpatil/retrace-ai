'use client';

import React, { useState, useMemo } from 'react';
import {
  Calendar,
  Users,
  Quote,
  Clock,
  ChevronDown,
  ChevronUp,
  Search,
  CheckCircle2,
  Filter,
  Copy,
  Check,
  Sparkles,
  Zap,
} from 'lucide-react';
import { TimelineEvent } from '@/lib/types';

interface TimelineViewProps {
  timeline: TimelineEvent[];
}

export default function TimelineView({ timeline }: TimelineViewProps) {
  const [expandedIndices, setExpandedIndices] = useState<Record<number, boolean>>({});
  const [filterType, setFilterType] = useState<'all' | 'decisions' | 'citations'>('all');
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [copiedIdx, setCopiedIdx] = useState<number | null>(null);

  const toggleExpand = (idx: number) => {
    setExpandedIndices((prev) => ({
      ...prev,
      [idx]: !prev[idx],
    }));
  };

  const handleExpandAll = () => {
    const all: Record<number, boolean> = {};
    timeline.forEach((_, i) => (all[i] = true));
    setExpandedIndices(all);
  };

  const handleCollapseAll = () => {
    setExpandedIndices({});
  };

  const handleCopyQuote = (quote: string, idx: number) => {
    navigator.clipboard.writeText(quote);
    setCopiedIdx(idx);
    setTimeout(() => setCopiedIdx(null), 2000);
  };

  const filteredTimeline = useMemo(() => {
    if (!timeline) return [];

    return timeline.filter((item) => {
      if (filterType === 'decisions' && !item.decision) return false;
      if (filterType === 'citations' && !item.evidence_quote) return false;

      if (searchTerm.trim()) {
        const q = searchTerm.toLowerCase();
        const inTitle = item.title.toLowerCase().includes(q);
        const inDesc = item.description.toLowerCase().includes(q);
        const inDate = item.date.toLowerCase().includes(q);
        const inActors = (item.actors || []).some((a) => a.toLowerCase().includes(q));
        if (!inTitle && !inDesc && !inDate && !inActors) return false;
      }

      return true;
    });
  }, [timeline, filterType, searchTerm]);

  if (!timeline || timeline.length === 0) {
    return (
      <div className="forensic-card rounded-xl p-8 text-center font-mono text-xs text-slate-500">
        NO CHRONOLOGICAL MILESTONES EXTRACTED FOR THIS QUERY
      </div>
    );
  }

  return (
    <div className="forensic-card rounded-xl p-6 relative corner-ticks shadow-2xl">
      
      {/* Blueprint Header */}
      <div className="flex flex-wrap items-center justify-between gap-3 pb-4 mb-5 border-b border-[#1E2C54]">
        <div className="flex items-center space-x-3">
          <div className="p-2 bg-gradient-to-br from-cyan-500/20 to-violet-600/20 rounded-lg text-cyan-300 border border-cyan-500/40 shadow-md shadow-cyan-500/10">
            <Clock className="w-4 h-4 animate-spin-slow" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <h3 className="text-xs font-mono font-bold text-white uppercase tracking-wider">
                CHRONOLOGICAL RECONSTRUCTION TIMELINE
              </h3>
              <span className="text-[10px] font-mono px-2 py-0.2 rounded-full bg-cyan-500/15 text-cyan-300 border border-cyan-400/30 font-bold shadow-xs">
                {timeline.length} MILESTONES
              </span>
            </div>
            <p className="text-[11px] font-mono text-slate-400">
              CAUSAL SEQUENCE OF DECISIONS, INCIDENTS & ARCHITECTURAL PIVOTS
            </p>
          </div>
        </div>

        {/* Global Expand / Collapse */}
        <div className="flex items-center space-x-2 text-xs font-mono">
          <button
            onClick={handleExpandAll}
            className="text-slate-400 hover:text-white px-2.5 py-1 rounded bg-[#0A0F24] border border-[#1E2C54] hover:border-cyan-500/50 transition-colors active:scale-95"
          >
            Expand All
          </button>
          <button
            onClick={handleCollapseAll}
            className="text-slate-400 hover:text-white px-2.5 py-1 rounded bg-[#0A0F24] border border-[#1E2C54] hover:border-cyan-500/50 transition-colors active:scale-95"
          >
            Collapse All
          </button>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-wrap items-center justify-between gap-2.5 mb-6 text-xs font-mono">
        <div className="flex items-center space-x-1.5">
          <button
            onClick={() => setFilterType('all')}
            className={`px-3 py-1 rounded-md transition-all active:scale-95 ${
              filterType === 'all'
                ? 'bg-gradient-to-r from-cyan-400 to-violet-500 text-slate-950 font-bold shadow-lg shadow-cyan-500/20'
                : 'bg-[#0A0F24] text-slate-400 hover:text-slate-200 border border-[#1E2C54]'
            }`}
          >
            All ({timeline.length})
          </button>
          <button
            onClick={() => setFilterType('decisions')}
            className={`px-3 py-1 rounded-md transition-all active:scale-95 ${
              filterType === 'decisions'
                ? 'bg-gradient-to-r from-emerald-400 to-cyan-400 text-slate-950 font-bold shadow-lg shadow-emerald-500/20'
                : 'bg-[#0A0F24] text-slate-400 hover:text-slate-200 border border-[#1E2C54]'
            }`}
          >
            Decisions Only ({timeline.filter((t) => t.decision).length})
          </button>
          <button
            onClick={() => setFilterType('citations')}
            className={`px-3 py-1 rounded-md transition-all active:scale-95 ${
              filterType === 'citations'
                ? 'bg-gradient-to-r from-violet-400 to-pink-500 text-slate-950 font-bold shadow-lg shadow-violet-500/20'
                : 'bg-[#0A0F24] text-slate-400 hover:text-slate-200 border border-[#1E2C54]'
            }`}
          >
            With Excerpts ({timeline.filter((t) => t.evidence_quote).length})
          </button>
        </div>

        <div className="relative">
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Filter timeline..."
            className="w-40 sm:w-48 pl-7 pr-2 py-1.5 bg-[#040714] border border-[#1E2C54] rounded-md text-slate-200 placeholder:text-slate-500 text-xs font-mono focus:outline-none focus:border-cyan-400 transition-all"
          />
          <Search className="w-3.5 h-3.5 text-slate-500 absolute left-2 top-2" />
        </div>
      </div>

      {/* Vertical Stepped Timeline with Flowing Light Bead Animation */}
      <div className="relative pl-7 space-y-6 before:content-[''] before:absolute before:left-3 before:top-2 before:bottom-2 before:w-0.5 before:bg-gradient-to-b before:from-cyan-400 before:via-violet-500 before:to-emerald-400 timeline-track">
        {filteredTimeline.map((event, idx) => {
          const isExpanded = !!expandedIndices[idx];
          const hasDecision = !!event.decision;

          return (
            <div key={idx} className="relative group transition-all duration-300">
              {/* Sonar Ripple Marker Node */}
              <div
                className={`absolute -left-7 top-1.5 w-6 h-6 rounded-full bg-[#0A0F24] border-2 flex items-center justify-center transition-all duration-300 shadow-lg ${
                  hasDecision
                    ? 'border-emerald-400 sonar-emitter-emerald group-hover:scale-125'
                    : 'border-cyan-400 sonar-emitter group-hover:scale-125'
                }`}
              >
                <span
                  className={`w-2 h-2 rounded-full transition-all ${
                    hasDecision ? 'bg-emerald-400' : 'bg-cyan-400'
                  }`}
                ></span>
              </div>

              {/* Event Content Card with Elevation on Hover */}
              <div className="bg-[#0A0F24] border border-[#1E2C54] hover:border-cyan-500/50 rounded-xl p-5 transition-all duration-300 shadow-md hover:shadow-xl hover:shadow-cyan-500/5 hover:-translate-y-0.5">
                
                {/* Milestone Top Bar */}
                <div className="flex flex-wrap items-center justify-between gap-2 mb-2.5">
                  <div className="flex items-center space-x-2">
                    <span className="flex items-center space-x-1.5 text-xs font-mono font-semibold text-cyan-300 bg-cyan-500/10 px-2.5 py-0.5 rounded border border-cyan-400/30 shadow-xs">
                      <Calendar className="w-3 h-3 text-cyan-400" />
                      <span>{event.date}</span>
                    </span>

                    {event.document_title && (
                      <span className="text-[11px] font-mono text-slate-400 truncate max-w-xs">
                        via <span className="text-slate-300">{event.document_title}</span>
                      </span>
                    )}
                  </div>

                  <button
                    onClick={() => toggleExpand(idx)}
                    className="text-slate-400 hover:text-white p-1 rounded hover:bg-white/5 transition-colors"
                  >
                    {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                  </button>
                </div>

                {/* Milestone Title */}
                <h4 className="text-sm font-bold text-white mb-2 leading-snug">
                  {event.title}
                </h4>

                {/* Event Description */}
                <p className="text-xs text-slate-300 leading-relaxed font-sans mb-3">
                  {event.description}
                </p>

                {/* Registered Decision Callout with Glow Border */}
                {event.decision && (
                  <div className="p-3.5 rounded-lg bg-[#071617] border-l-4 border-emerald-400 border border-emerald-900/50 mb-3 shadow-lg shadow-emerald-950/30">
                    <span className="text-[10px] font-mono uppercase text-emerald-400 font-bold block mb-1 flex items-center space-x-1.5">
                      <Zap className="w-3 h-3 text-emerald-400 animate-pulse" />
                      <span>DECISION REGISTERED // ARCHITECTURAL COMMIT:</span>
                    </span>
                    <p className="text-xs font-semibold text-emerald-100">
                      {event.decision}
                    </p>
                  </div>
                )}

                {/* Actors / Stakeholders */}
                {event.actors && event.actors.length > 0 && (
                  <div className="flex flex-wrap items-center gap-1.5 text-xs text-slate-400 font-mono">
                    <Users className="w-3.5 h-3.5 text-violet-400 shrink-0 mr-1" />
                    <span className="text-[11px] text-slate-500 mr-1">Stakeholders:</span>
                    {event.actors.map((actor, aIdx) => (
                      <span
                        key={aIdx}
                        className="px-2 py-0.5 rounded bg-[#101938] border border-[#202E5C] text-[11px] text-violet-200 transition-all hover:border-violet-400"
                      >
                        {actor}
                      </span>
                    ))}
                  </div>
                )}

                {/* Expandable Direct Evidence Quote */}
                {event.evidence_quote && (
                  <div
                    className={`mt-3 pt-3 border-t border-dashed border-[#1E2C54] transition-all ${
                      isExpanded ? 'block animate-in fade-in duration-200' : 'hidden'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-2 text-xs text-slate-200 italic bg-[#040714] p-3.5 rounded-lg border border-[#1E2C54]">
                      <div className="flex items-start space-x-2">
                        <Quote className="w-4 h-4 text-cyan-400 shrink-0 mt-0.5 not-italic" />
                        <div>
                          <span className="text-[10px] font-mono uppercase text-slate-400 not-italic block mb-0.5">
                            Verbatim Record Excerpt:
                          </span>
                          <span className="leading-relaxed">&ldquo;{event.evidence_quote}&rdquo;</span>
                        </div>
                      </div>

                      <button
                        onClick={() => handleCopyQuote(event.evidence_quote!, idx)}
                        className="text-slate-400 hover:text-white p-1 rounded shrink-0 not-italic active:scale-90 transition-all"
                        title="Copy excerpt"
                      >
                        {copiedIdx === idx ? (
                          <Check className="w-3.5 h-3.5 text-emerald-400" />
                        ) : (
                          <Copy className="w-3.5 h-3.5" />
                        )}
                      </button>
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
