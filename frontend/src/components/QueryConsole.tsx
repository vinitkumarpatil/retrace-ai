'use client';

import React, { useState } from 'react';
import { Search, Loader2, Sparkles, HelpCircle, ArrowRight, CornerDownLeft, Clock, History, X, Command } from 'lucide-react';

interface QueryConsoleProps {
  onSearch: (query: string) => void;
  isLoading: boolean;
  recentQueries?: string[];
}

const SAMPLE_QUESTIONS = [
  {
    category: 'ARCH PIVOT',
    color: 'border-cyan-500/40 text-cyan-300 bg-cyan-500/10 hover:border-cyan-400 hover:shadow-cyan-500/20',
    query: "Why did we migrate to PostgreSQL and change the vector index on August 12?",
  },
  {
    category: 'BUDGET & SRE',
    color: 'border-emerald-500/40 text-emerald-300 bg-emerald-500/10 hover:border-emerald-400 hover:shadow-emerald-500/20',
    query: "Who approved scaling the AWS RDS instances to db.r6g.2xlarge?",
  },
  {
    category: 'INCIDENT AUDIT',
    color: 'border-pink-500/40 text-pink-300 bg-pink-500/10 hover:border-pink-400 hover:shadow-pink-500/20',
    query: "What happened during Incident Retrospective #88 and what was decided?",
  },
  {
    category: 'TECH SELECTION',
    color: 'border-violet-500/40 text-violet-300 bg-violet-500/10 hover:border-violet-400 hover:shadow-violet-500/20',
    query: "Why was MongoDB rejected for the Order and Payment domains?",
  },
];

export default function QueryConsole({ onSearch, isLoading, recentQueries = [] }: QueryConsoleProps) {
  const [query, setQuery] = useState('');
  const [isFocused, setIsFocused] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim() && !isLoading) {
      onSearch(query.trim());
    }
  };

  const handleSelectSample = (sampleText: string) => {
    setQuery(sampleText);
    onSearch(sampleText);
  };

  return (
    <div
      className={`w-full forensic-card rounded-2xl p-6 relative corner-ticks transition-all duration-300 ${
        isFocused ? 'border-cyan-400/60 shadow-2xl shadow-cyan-500/10 ring-1 ring-cyan-500/30' : ''
      }`}
    >
      
      {/* Top Console Status Bar */}
      <div className="flex items-center justify-between pb-3 mb-4 border-b border-[#1E2C54] text-xs font-mono text-slate-400">
        <div className="flex items-center space-x-2.5">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-cyan-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-cyan-400"></span>
          </span>
          <span className="font-bold text-white uppercase tracking-wider">
            FORENSIC QUERY TERMINAL
          </span>
          <span className="text-slate-600">|</span>
          <span className="text-slate-400 hidden sm:inline">HYBRID VECTOR & SYMBOLIC RECONSTRUCTION</span>
        </div>

        <div className="flex items-center space-x-1.5 text-[11px] text-slate-400">
          <HelpCircle className="w-3.5 h-3.5 text-cyan-400" />
          <span className="hidden sm:inline">Zero-Hallucination Guard: ACTIVE</span>
        </div>
      </div>

      {/* Main Search Input Form with Animated Focus Glow */}
      <form onSubmit={handleSubmit} className="relative flex items-center">
        <div className="absolute left-4 text-slate-400 pointer-events-none">
          {isLoading ? (
            <Loader2 className="w-5 h-5 animate-spin text-cyan-400" />
          ) : (
            <Search className={`w-5 h-5 transition-colors ${isFocused ? 'text-cyan-400' : 'text-slate-400'}`} />
          )}
        </div>

        <input
          type="text"
          value={query}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Ask what happened, why a decision was made, or who authorized it (e.g. 'Why did we change the vector index?')..."
          disabled={isLoading}
          className="w-full pl-12 pr-36 py-4 bg-[#040714] border border-[#1E2C54] focus:border-cyan-400/80 rounded-xl text-slate-100 placeholder:text-slate-500 text-sm font-sans focus:outline-none focus:ring-4 focus:ring-cyan-400/20 transition-all shadow-inner"
        />

        {query && !isLoading && (
          <button
            type="button"
            onClick={() => setQuery('')}
            className="absolute right-28 text-slate-500 hover:text-white p-1.5 rounded-full hover:bg-white/5 transition-all"
          >
            <X className="w-4 h-4" />
          </button>
        )}

        <button
          type="submit"
          disabled={isLoading || !query.trim()}
          className="btn-shimmer absolute right-2.5 px-4.5 py-2 bg-gradient-to-r from-cyan-400 via-cyan-300 to-violet-400 hover:from-cyan-300 hover:to-violet-300 disabled:from-slate-800 disabled:to-slate-800 disabled:text-slate-600 text-slate-950 rounded-lg text-xs font-mono font-bold flex items-center space-x-1.5 transition-all shadow-lg shadow-cyan-500/20 active:scale-95"
        >
          <span>{isLoading ? 'Tracing...' : 'Recover'}</span>
          {isLoading ? (
            <Loader2 className="w-3.5 h-3.5 animate-spin text-slate-950" />
          ) : (
            <CornerDownLeft className="w-3.5 h-3.5" />
          )}
        </button>
      </form>

      {/* Suggested Inquiries Pills with Hover Elevation */}
      <div className="mt-4 pt-3.5 border-t border-[#1E2C54]/80 flex flex-col sm:flex-row sm:items-center gap-2">
        <span className="text-[11px] font-mono uppercase text-slate-400 flex items-center space-x-1.5 shrink-0">
          <Sparkles className="w-3.5 h-3.5 text-cyan-400 animate-pulse" />
          <span>Demo Scenarios:</span>
        </span>
        <div className="flex flex-wrap items-center gap-2">
          {SAMPLE_QUESTIONS.map((item, idx) => (
            <button
              key={idx}
              type="button"
              onClick={() => handleSelectSample(item.query)}
              disabled={isLoading}
              className={`text-xs px-3 py-1.5 rounded-lg border font-mono transition-all duration-200 text-left flex items-center space-x-2 hover:-translate-y-0.5 hover:shadow-lg active:scale-95 ${item.color}`}
            >
              <span className="text-[9px] font-bold uppercase px-1.5 py-0.2 rounded bg-black/50">
                {item.category}
              </span>
              <span className="truncate max-w-xs">{item.query}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Recent Queries History */}
      {recentQueries.length > 0 && (
        <div className="mt-3 pt-2.5 border-t border-dashed border-[#1E2C54]/60 flex items-center gap-2 flex-wrap text-xs font-mono text-slate-400 animate-in fade-in">
          <History className="w-3.5 h-3.5 text-slate-500 shrink-0" />
          <span className="text-[10px] text-slate-500 uppercase">Recent:</span>
          {recentQueries.slice(0, 4).map((q, idx) => (
            <button
              key={idx}
              type="button"
              onClick={() => handleSelectSample(q)}
              className="text-[11px] text-slate-300 hover:text-cyan-300 bg-[#0A0F24] hover:bg-[#121B3B] px-2.5 py-0.5 rounded-md border border-[#1E2C54] hover:border-cyan-400/40 transition-all truncate max-w-[200px] active:scale-95"
            >
              {q}
            </button>
          ))}
        </div>
      )}

    </div>
  );
}
