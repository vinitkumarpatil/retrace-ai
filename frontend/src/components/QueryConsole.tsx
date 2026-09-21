'use client';

import React, { useState } from 'react';
import { Search, Loader2, ArrowRight, CornerDownLeft, X, Terminal, Clock, Sparkles } from 'lucide-react';

interface QueryConsoleProps {
  onSearch: (query: string) => void;
  isLoading: boolean;
  recentQueries?: string[];
}

export default function QueryConsole({ onSearch, isLoading, recentQueries = [] }: QueryConsoleProps) {
  const [query, setQuery] = useState('');
  const [isFocused, setIsFocused] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim() && !isLoading) {
      onSearch(query.trim());
    }
  };

  const handleSelectRecent = (q: string) => {
    setQuery(q);
    onSearch(q);
  };

  return (
    <div
      className={`w-full rounded-xl p-5 bg-[#101722] border transition-all duration-200 shadow-xl ${
        isFocused ? 'border-[#00F2FE]/70 shadow-[#00F2FE]/5 ring-1 ring-[#00F2FE]/20' : 'border-[#243044]'
      }`}
    >
      {/* Top Terminal Status Header */}
      <div className="flex flex-wrap items-center justify-between pb-3 mb-3 border-b border-[#243044] text-xs font-mono text-[#94A3B8]">
        <div className="flex items-center space-x-2">
          <Terminal className="w-3.5 h-3.5 text-[#00F2FE]" />
          <span className="font-bold text-white uppercase tracking-wider">
            FORENSIC QUERY
          </span>
          <span className="text-[#243044]">|</span>
          <span className="text-[11px] text-[#94A3B8]">
            Ask what happened, why a decision was made, or who authorized it.
          </span>
        </div>

        <div className="text-[10px] text-[#00F2FE] bg-[#00F2FE]/10 px-2 py-0.5 rounded border border-[#00F2FE]/30 font-semibold hidden sm:inline">
          NATURAL LANGUAGE HYBRID SEARCH
        </div>
      </div>

      {/* Primary Query Input Bar */}
      <form onSubmit={handleSubmit} className="relative flex items-center">
        <div className="absolute left-3.5 text-[#94A3B8] pointer-events-none">
          {isLoading ? (
            <Loader2 className="w-4 h-4 animate-spin text-[#00F2FE]" />
          ) : (
            <Search className={`w-4 h-4 transition-colors ${isFocused ? 'text-[#00F2FE]' : 'text-[#94A3B8]'}`} />
          )}
        </div>

        <input
          type="text"
          value={query}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="e.g. Why did we migrate to PostgreSQL and change the vector index on August 12?..."
          disabled={isLoading}
          className="w-full pl-10 pr-36 py-3 bg-[#05070D] border border-[#243044] focus:border-[#00F2FE] rounded-lg text-white placeholder:text-[#64748B] text-sm font-sans focus:outline-none transition-all"
        />

        {query && !isLoading && (
          <button
            type="button"
            onClick={() => setQuery('')}
            className="absolute right-36 text-[#94A3B8] hover:text-white p-1"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        )}

        {/* Submit Button */}
        <button
          type="submit"
          disabled={isLoading || !query.trim()}
          className="absolute right-1.5 px-4 py-2 bg-[#00F2FE] hover:bg-[#38BDF8] disabled:bg-[#151D29] disabled:text-[#64748B] text-black rounded-md text-xs font-mono font-bold flex items-center space-x-1.5 transition-all shadow-md active:scale-95"
        >
          <span>{isLoading ? 'Recovering...' : 'Recover Context'}</span>
          {isLoading ? (
            <Loader2 className="w-3.5 h-3.5 animate-spin" />
          ) : (
            <CornerDownLeft className="w-3.5 h-3.5" />
          )}
        </button>
      </form>

      {/* Recent Queries quick-chips */}
      {recentQueries.length > 0 && (
        <div className="mt-3 pt-2.5 border-t border-[#243044]/60 flex items-center gap-2 overflow-x-auto text-[11px] font-mono">
          <div className="flex items-center space-x-1 text-[#64748B] shrink-0 text-[10px] uppercase font-bold">
            <Clock className="w-3 h-3 text-[#00F2FE]" />
            <span>Recent:</span>
          </div>
          <div className="flex items-center gap-1.5 overflow-x-auto py-0.5">
            {recentQueries.map((rq, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => handleSelectRecent(rq)}
                className="px-2.5 py-0.5 rounded bg-[#05070D] hover:bg-[#151D29] border border-[#243044] hover:border-[#00F2FE]/40 text-[#94A3B8] hover:text-white text-[10px] truncate max-w-[240px] transition-colors"
                title={rq}
              >
                {rq}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
