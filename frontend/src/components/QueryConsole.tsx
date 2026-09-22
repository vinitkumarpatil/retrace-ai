'use client';

import React, { useState } from 'react';
import { Search, Loader2, Sparkles, ArrowRight, Terminal } from 'lucide-react';

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
    <div className="panel brackets p-5">

      {/* Header row */}
      <div className="flex items-center justify-between pb-3 mb-4 border-b border-console-border">
        <div className="flex items-center gap-2 text-xs font-mono">
          <Terminal className="w-4 h-4 text-console-cyan" />
          <span className="font-semibold text-white uppercase tracking-wider">Query Console</span>
          <span className="text-console-border">/</span>
          <span className="text-console-mute uppercase tracking-wide">natural language</span>
        </div>
        <span className="hidden sm:flex items-center gap-1.5 text-[11px] font-mono text-console-mute">
          <span className="w-1.5 h-1.5 rounded-full bg-console-cyan pulse-dot" />
          fuzzy matching
        </span>
      </div>

      {/* Input */}
      <form onSubmit={handleSubmit} className="relative flex items-center">
        <div className="absolute left-4 text-console-mute">
          {isLoading ? (
            <Loader2 className="w-5 h-5 animate-spin text-console-cyan" />
          ) : (
            <Search className="w-5 h-5" />
          )}
        </div>

        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Ask what happened, why a decision was made, or who authorized it…"
          disabled={isLoading}
          className="w-full pl-12 pr-32 py-3.5 bg-console-s2 border border-console-border rounded-xl text-white placeholder:text-console-mute text-sm focus-cyan transition-all disabled:opacity-60"
        />

        <button
          type="submit"
          disabled={isLoading || !query.trim()}
          className="absolute right-2 px-4 py-2 bg-console-cyan hover:bg-white disabled:bg-console-s3 disabled:text-console-mute text-console-bg rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all"
        >
          <span>{isLoading ? 'Reconstructing…' : 'Recover'}</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </button>
      </form>

      {/* Suggestion pills */}
      <div className="mt-4 pt-3.5 border-t border-console-border flex flex-wrap items-center gap-2">
        <span className="text-[11px] font-mono uppercase text-console-mute flex items-center gap-1.5">
          <Sparkles className="w-3 h-3 text-console-violet" />
          Suggested
        </span>
        {SAMPLE_QUESTIONS.map((sample, idx) => (
          <button
            key={idx}
            type="button"
            onClick={() => handleSelectSample(sample)}
            disabled={isLoading}
            className="text-xs text-console-dim hover:text-white bg-console-s2 hover:bg-console-s3 border border-console-border hover:border-console-cyan/40 px-2.5 py-1 rounded-lg transition-colors text-left disabled:opacity-60"
          >
            {sample}
          </button>
        ))}
      </div>

    </div>
  );
}
