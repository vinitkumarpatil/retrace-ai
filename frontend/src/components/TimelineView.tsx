'use client';

import React, { useState } from 'react';
import { 
  Calendar, 
  Users, 
  Quote, 
  ChevronDown, 
  ChevronUp, 
  Clock, 
  Search, 
  ChevronsUpDown, 
  Sparkles, 
  CheckCircle2,
  FileText,
  X
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

  const toggleExpand = (idx: number) => {
    setExpandedIndices(prev => ({
      ...prev,
      [idx]: !prev[idx]
    }));
  };

  const handleToggleAll = () => {
    const nextState = !allExpanded;
    setAllExpanded(nextState);
    const newIndices: Record<number, boolean> = {};
    timeline.forEach((_, idx) => {
      newIndices[idx] = nextState;
    });
    setExpandedIndices(newIndices);
  };

  if (!timeline || timeline.length === 0) {
    return (
      <div className="surface-card rounded-xl p-8 text-center border border-slate-200 dark:border-slate-800 text-xs text-slate-500">
        No chronological milestones extracted for this query.
      </div>
    );
  }

  // Filter timeline based on local search text
  const filteredTimeline = timeline.filter(event => {
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
    <div className="surface-card rounded-xl border border-slate-200 dark:border-slate-800 p-6 shadow-sm transition-colors">
      
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-3 pb-4 mb-4 border-b border-slate-100 dark:border-slate-800">
        <div className="flex items-center space-x-3">
          <div className="p-2 bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 rounded-lg">
            <Clock className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-sm font-semibold text-slate-900 dark:text-white tracking-tight">
              Chronological Decision Trail
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Verified sequence of architectural events, stakeholder decisions & milestones
            </p>
          </div>
        </div>

        <div className="flex items-center space-x-2">
          <button
            onClick={handleToggleAll}
            className="px-2.5 py-1 text-xs font-medium text-slate-600 dark:text-slate-300 bg-slate-50 dark:bg-slate-900 hover:bg-slate-100 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-800 rounded-lg flex items-center space-x-1 transition-colors shadow-2xs"
          >
            <ChevronsUpDown className="w-3.5 h-3.5 text-slate-400" />
            <span>{allExpanded ? 'Collapse All' : 'Expand All'}</span>
          </button>

          <span className="text-xs font-medium px-2.5 py-1 rounded-full bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800">
            {timeline.length} Milestones
          </span>
        </div>
      </div>

      {/* Inline Search / Filter Bar */}
      <div className="mb-5 relative">
        <Search className="w-3.5 h-3.5 absolute left-3.5 top-3 text-slate-400 dark:text-slate-500" />
        <input
          type="text"
          value={filterText}
          onChange={(e) => setFilterText(e.target.value)}
          placeholder="Filter milestones by actor, decision keyword, or date..."
          className="w-full pl-9 pr-4 py-2 bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 rounded-lg text-xs text-slate-800 dark:text-slate-200 placeholder:text-slate-400 focus:outline-none focus:border-indigo-500 dark:focus:border-indigo-500 transition-colors"
        />
        {filterText && (
          <button
            onClick={() => setFilterText('')}
            className="absolute right-3 top-2.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        )}
      </div>

      {/* Selected Entity Banner */}
      {selectedEntityId && (
        <div className="mb-5 px-3.5 py-2.5 rounded-lg bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800/80 text-xs text-amber-900 dark:text-amber-200 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Sparkles className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400 shrink-0" />
            <span>
              Filtering events involving <strong className="font-semibold">"{selectedEntityId}"</strong>
            </span>
          </div>
          <button
            onClick={() => onSelectEntityName?.('')}
            className="text-amber-700 dark:text-amber-400 hover:underline flex items-center space-x-1 font-medium text-[11px]"
          >
            <span>Reset filter</span>
            <X className="w-3 h-3" />
          </button>
        </div>
      )}

      {/* Vertical Stepped Timeline */}
      <div className="relative pl-6 space-y-6 before:content-[''] before:absolute before:left-2.5 before:top-3 before:bottom-3 before:w-0.5 before:bg-slate-200 dark:before:bg-slate-800">
        {filteredTimeline.map((event, idx) => {
          const isExpanded = !!expandedIndices[idx];

          const matchesEntity = selectedEntityId
            ? (
                event.title.toLowerCase().includes(selectedEntityId.toLowerCase()) ||
                event.description.toLowerCase().includes(selectedEntityId.toLowerCase()) ||
                (event.actors && event.actors.some(a => a.toLowerCase().includes(selectedEntityId.toLowerCase()))) ||
                (event.decision && event.decision.toLowerCase().includes(selectedEntityId.toLowerCase()))
              )
            : false;

          const isDimmed = selectedEntityId && !matchesEntity;

          return (
            <div
              key={idx}
              className={`relative group transition-all duration-200 ${isDimmed ? 'opacity-35 hover:opacity-100' : 'opacity-100'}`}
            >
              {/* Timeline Marker Node */}
              <div className={`absolute -left-6 top-1.5 w-5 h-5 rounded-full bg-white dark:bg-slate-900 border-2 flex items-center justify-center transition-all shadow-xs ${
                matchesEntity
                  ? 'border-indigo-600 dark:border-indigo-400 ring-4 ring-indigo-500/20 scale-110'
                  : 'border-slate-300 dark:border-slate-600 group-hover:border-indigo-500'
              }`}>
                <span className={`w-1.5 h-1.5 rounded-full ${matchesEntity ? 'bg-indigo-600 dark:bg-indigo-400' : 'bg-slate-400 group-hover:bg-indigo-500'}`}></span>
              </div>

              {/* Event Card */}
              <div className={`rounded-xl p-5 transition-all ${
                matchesEntity
                  ? 'bg-indigo-50/40 dark:bg-indigo-950/20 border-2 border-indigo-400 dark:border-indigo-600 shadow-sm'
                  : 'bg-white dark:bg-[#0B0F19] border border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 shadow-2xs'
              }`}>
                
                {/* Milestone Top Bar */}
                <div className="flex flex-wrap items-center justify-between gap-2 mb-2">
                  <div className="flex items-center space-x-2">
                    <span className="flex items-center space-x-1.5 text-xs font-medium text-indigo-700 dark:text-indigo-300 bg-indigo-50 dark:bg-indigo-950/80 px-2.5 py-0.5 rounded-full border border-indigo-100 dark:border-indigo-900">
                      <Calendar className="w-3 h-3 text-indigo-600 dark:text-indigo-400" />
                      <span>{event.date}</span>
                    </span>
                    {event.document_title && (
                      <span className="flex items-center space-x-1 text-xs text-slate-500 dark:text-slate-400 truncate max-w-xs">
                        <FileText className="w-3 h-3 text-slate-400 shrink-0" />
                        <span className="truncate">{event.document_title}</span>
                      </span>
                    )}
                  </div>

                  <button
                    onClick={() => toggleExpand(idx)}
                    className="text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 p-1 rounded-md transition-colors"
                    title={isExpanded ? "Collapse excerpt" : "Expand excerpt"}
                  >
                    {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                  </button>
                </div>

                {/* Milestone Title */}
                <h4 className="text-sm font-semibold text-slate-900 dark:text-white mb-2 leading-snug">
                  {event.title}
                </h4>

                {/* Event Description */}
                <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed mb-3">
                  {event.description}
                </p>

                {/* Decision Callout */}
                {event.decision && (
                  <div className="p-3 rounded-lg bg-emerald-50/50 dark:bg-emerald-950/20 border-l-3 border-emerald-600 dark:border-emerald-500 border border-emerald-100 dark:border-emerald-900/50 mb-3">
                    <span className="text-[10px] font-semibold uppercase tracking-wider text-emerald-800 dark:text-emerald-400 block mb-0.5">
                      Decision Registered:
                    </span>
                    <p className="text-xs font-medium text-emerald-950 dark:text-emerald-200">
                      {event.decision}
                    </p>
                  </div>
                )}

                {/* Stakeholders Involved */}
                {event.actors && event.actors.length > 0 && (
                  <div className="flex items-center space-x-2 text-xs text-slate-500 dark:text-slate-400 mb-2 flex-wrap gap-y-1">
                    <Users className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                    <span className="text-[11px] text-slate-500">Key Stakeholders:</span>
                    <div className="flex flex-wrap gap-1.5">
                      {event.actors.map((actor, aIdx) => {
                        const isActorSelected = selectedEntityId && actor.toLowerCase() === selectedEntityId.toLowerCase();
                        return (
                          <button
                            key={aIdx}
                            onClick={() => onSelectEntityName?.(actor)}
                            className={`px-2 py-0.5 rounded-md text-[11px] font-medium transition-colors ${
                              isActorSelected
                                ? 'bg-indigo-600 text-white shadow-2xs'
                                : 'bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 border border-slate-200/60 dark:border-slate-700'
                            }`}
                            title={`Filter context by ${actor}`}
                          >
                            {actor}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* Expandable Document Excerpt Quote */}
                {event.evidence_quote && (
                  <div className={`mt-3 pt-3 border-t border-slate-100 dark:border-slate-800 ${isExpanded ? 'block' : 'hidden'}`}>
                    <div className="flex items-start space-x-2 text-xs text-slate-700 dark:text-slate-300 bg-slate-50 dark:bg-slate-900/60 p-3 rounded-lg border border-slate-200/80 dark:border-slate-800/80">
                      <Quote className="w-4 h-4 text-indigo-500 shrink-0 mt-0.5" />
                      <div>
                        <span className="text-[10px] font-semibold uppercase tracking-wider text-slate-400 block mb-1">
                          Direct Excerpt:
                        </span>
                        <p className="italic text-slate-600 dark:text-slate-300 leading-relaxed">
                          "{event.evidence_quote}"
                        </p>
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
