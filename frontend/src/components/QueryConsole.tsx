'use client';

import React, { useState } from 'react';
import { Search, Loader2, Sparkles, HelpCircle, ArrowRight } from 'lucide-react';

interface QueryConsoleProps {
  onSearch: (query: string) => void;
  isLoading: boolean;
}

const SAMPLE_QUESTIONS = [
  "Why did we migrate to PostgreSQL and change the vector index on August 12?",
  "Who approved scaling the AWS RDS instances to db.r6g.2xlarge?",
  "What happened during Incident Retrospective #88 and what was decided?",
  "Why was MongoDB rejected for the Order and Payment domains?",
];

export default function QueryConsole({ onSearch, isLoading }: QueryConsoleProps) {
  const [query, setQuery] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim() && !isLoading) {
      onSearch(query.trim());
    }
  };

  const handleSelectSample = (sample: string) => {
    setQuery(sample);
    onSearch(sample);
  };

  return (
    <div className="w-full drafting-card rounded-md p-5 border border-[#E2DDD5] bg-white relative corner-ticks shadow-xs">
      
      {/* Top Drafting Header */}
      <div className="flex items-center justify-between pb-3 mb-3 border-b border-[#E2DDD5]/70 text-xs font-mono text-stone-500">
        <div className="flex items-center space-x-2">
          <span className="w-1.5 h-1.5 bg-amber-500 rounded-full"></span>
          <span className="font-semibold text-stone-800 uppercase tracking-wider">
            FORENSIC QUERY CONSOLE
          </span>
          <span className="text-stone-300">|</span>
          <span className="text-stone-400">INPUT SPECIFICATION // SECTION 04</span>
        </div>
        <div className="flex items-center space-x-1 text-[11px] text-stone-400">
          <HelpCircle className="w-3.5 h-3.5" />
          <span>Fuzzy natural language matching enabled</span>
        </div>
      </div>

      {/* Main Search Input Form */}
      <form onSubmit={handleSubmit} className="relative flex items-center">
        <div className="absolute left-3.5 text-stone-400">
          {isLoading ? (
            <Loader2 className="w-5 h-5 animate-spin text-amber-600" />
          ) : (
            <Search className="w-5 h-5 text-stone-500" />
          )}
        </div>

        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Ask what happened, why a decision was made, or who authorized it (e.g. 'Why did we change the database?')..."
          disabled={isLoading}
          className="w-full pl-11 pr-32 py-3 bg-[#FAF8F5] border border-[#E2DDD5] rounded text-stone-900 placeholder:text-stone-400 text-sm font-sans focus:outline-none focus:ring-2 focus:ring-amber-500/30 focus:border-amber-500 transition-all"
        />

        <button
          type="submit"
          disabled={isLoading || !query.trim()}
          className="absolute right-2 px-4 py-1.5 bg-[#1E293B] hover:bg-stone-800 disabled:bg-stone-300 text-white rounded text-xs font-mono font-medium flex items-center space-x-1.5 transition-all shadow-xs"
        >
          <span>{isLoading ? 'Reconstructing...' : 'Recover'}</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </button>
      </form>

      {/* Suggestion Pills */}
      <div className="mt-3.5 pt-3 border-t border-dashed border-[#E2DDD5] flex flex-wrap items-center gap-2">
        <span className="text-[11px] font-mono uppercase text-stone-400 flex items-center space-x-1">
          <Sparkles className="w-3 h-3 text-amber-500" />
          <span>Suggested Inquiries:</span>
        </span>
        {SAMPLE_QUESTIONS.map((sample, idx) => (
          <button
            key={idx}
            type="button"
            onClick={() => handleSelectSample(sample)}
            disabled={isLoading}
            className="text-xs text-stone-700 bg-[#FAF8F5] hover:bg-amber-50/70 border border-[#E2DDD5] hover:border-amber-300 px-2.5 py-1 rounded transition-colors text-left font-mono"
          >
            "{sample}"
          </button>
        ))}
      </div>

    </div>
  );
}
