'use client';

import React, { useState, useEffect, useRef } from 'react';
import { Search, Loader2, Sparkles, ArrowRight, X, Command } from 'lucide-react';

interface QueryConsoleProps {
  onSearch: (query: string) => void;
  isLoading: boolean;
  initialQuery?: string;
}

const SAMPLE_INQUIRIES = [
  {
    category: "Architecture Pivot",
    query: "Why did we migrate to PostgreSQL and change the vector index on August 12?",
  },
  {
    category: "Infrastructure Scaling",
    query: "Who approved scaling the AWS RDS instances to db.r6g.2xlarge?",
  },
  {
    category: "Incident Retro",
    query: "What happened during Incident Retrospective #88 and what was decided?",
  },
  {
    category: "Technical Rejection",
    query: "Why was MongoDB rejected for the Order and Payment domains?",
  },
];

export default function QueryConsole({ onSearch, isLoading, initialQuery }: QueryConsoleProps) {
  const [query, setQuery] = useState(initialQuery || '');
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (initialQuery !== undefined) {
      setQuery(initialQuery);
    }
  }, [initialQuery]);

  // Global keyboard shortcut for Ctrl+K or Cmd+K or "/"
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        inputRef.current?.focus();
        inputRef.current?.select();
      } else if (e.key === '/' && document.activeElement?.tagName !== 'INPUT' && document.activeElement?.tagName !== 'TEXTAREA') {
        e.preventDefault();
        inputRef.current?.focus();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim() && !isLoading) {
      onSearch(query.trim());
    }
  };

  const handleSelectSample = (sampleQuery: string) => {
    setQuery(sampleQuery);
    onSearch(sampleQuery);
  };

  const handleClear = () => {
    setQuery('');
    inputRef.current?.focus();
  };

  return (
    <div className="w-full surface-card rounded-xl p-5 border border-slate-200 dark:border-slate-800 shadow-sm transition-colors">
      
      {/* Search Header */}
      <div className="flex items-center justify-between pb-3 mb-3 border-b border-slate-100 dark:border-slate-800/80 text-xs">
        <div className="flex items-center space-x-2">
          <span className="font-semibold text-slate-800 dark:text-slate-200 tracking-tight">
            Investigate Decision Context
          </span>
          <span className="text-slate-300 dark:text-slate-700">•</span>
          <span className="text-slate-500 dark:text-slate-400">
            Natural language retrieval across docs, RFCs, PRs & notes
          </span>
        </div>
        <div className="flex items-center space-x-2">
          <kbd className="hidden sm:inline-flex items-center space-x-1 px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-[11px] text-slate-600 dark:text-slate-300 font-mono">
            <Command className="w-3 h-3 mr-0.5 text-slate-400" />
            <span>K</span>
          </kbd>
        </div>
      </div>

      {/* Main Command Input Form */}
      <form onSubmit={handleSubmit} className="relative flex items-center">
        <div className="absolute left-3.5 text-slate-400 dark:text-slate-500 pointer-events-none">
          {isLoading ? (
            <Loader2 className="w-5 h-5 animate-spin text-indigo-600 dark:text-indigo-400" />
          ) : (
            <Search className="w-5 h-5 text-slate-400 dark:text-slate-500" />
          )}
        </div>

        <input
          ref={inputRef}
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Ask what happened, why an architectural pivot occurred, or who approved it..."
          disabled={isLoading}
          className="w-full pl-11 pr-36 py-3.5 bg-slate-50 dark:bg-[#0B0F19] border border-slate-200 dark:border-slate-800 rounded-xl text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500 text-sm font-sans focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 dark:focus:border-indigo-500 transition-all shadow-inner"
        />

        {query && !isLoading && (
          <button
            type="button"
            onClick={handleClear}
            className="absolute right-30 p-1 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 rounded-md transition-colors"
            title="Clear query"
          >
            <X className="w-4 h-4" />
          </button>
        )}

        <button
          type="submit"
          disabled={isLoading || !query.trim()}
          className="absolute right-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-500 disabled:bg-slate-200 dark:disabled:bg-slate-800 disabled:text-slate-400 text-white rounded-lg text-xs font-medium flex items-center space-x-1.5 transition-all shadow-xs"
        >
          <span>{isLoading ? 'Reconstructing...' : 'Recover Context'}</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </button>
      </form>

      {/* Suggested Inquiries */}
      <div className="mt-3.5 pt-3 border-t border-slate-100 dark:border-slate-800/60 flex flex-wrap items-center gap-2">
        <span className="text-[11px] font-medium text-slate-500 dark:text-slate-400 flex items-center space-x-1 mr-1">
          <Sparkles className="w-3 h-3 text-indigo-500" />
          <span>Quick Inquiries:</span>
        </span>
        {SAMPLE_INQUIRIES.map((sample, idx) => (
          <button
            key={idx}
            type="button"
            onClick={() => handleSelectSample(sample.query)}
            disabled={isLoading}
            className="text-xs text-slate-700 dark:text-slate-300 bg-slate-50 dark:bg-slate-900 hover:bg-indigo-50/70 dark:hover:bg-indigo-950/40 border border-slate-200/90 dark:border-slate-800 hover:border-indigo-300 dark:hover:border-indigo-700 px-2.5 py-1 rounded-lg transition-colors text-left flex items-center space-x-1.5 shadow-2xs"
          >
            <span className="text-[10px] uppercase font-semibold text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950/80 px-1 rounded">
              {sample.category}
            </span>
            <span className="truncate max-w-xs">{sample.query}</span>
          </button>
        ))}
      </div>

    </div>
  );
}
