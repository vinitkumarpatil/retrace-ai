'use client';

import React, { useState, useEffect, useRef } from 'react';
import { Search, Loader2, ArrowRight, X } from 'lucide-react';

interface QueryConsoleProps {
  onSearch: (query: string) => void;
  isLoading: boolean;
  initialQuery?: string;
}

const SAMPLE_INQUIRIES = [
  { tag: 'pivot', query: 'Why did we migrate to PostgreSQL and change the vector index on August 12?' },
  { tag: 'approval', query: 'Who approved scaling the AWS RDS instances to db.r6g.2xlarge?' },
  { tag: 'incident', query: 'What happened during Incident Retrospective #88 and what was decided?' },
  { tag: 'rejection', query: 'Why was MongoDB rejected for the Order and Payment domains?' },
];

export default function QueryConsole({ onSearch, isLoading, initialQuery }: QueryConsoleProps) {
  const [query, setQuery] = useState(initialQuery || '');
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (initialQuery !== undefined) setQuery(initialQuery);
  }, [initialQuery]);

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
    if (query.trim() && !isLoading) onSearch(query.trim());
  };

  return (
    <div className="sheet shadow-sheet p-5 sm:p-6">
      <div className="flex items-baseline justify-between gap-3 mb-3">
        <label htmlFor="inquiry" className="field-label">Open an inquiry</label>
        <kbd className="hidden sm:inline-flex items-center gap-1 font-mono text-[11px] text-ink-faint">
          <span className="px-1.5 py-0.5 rounded border border-rule bg-paper">⌘K</span>
        </kbd>
      </div>

      <form onSubmit={handleSubmit} className="relative flex items-center">
        <div className="absolute left-4 text-ink-faint pointer-events-none">
          {isLoading
            ? <Loader2 className="w-5 h-5 animate-spin text-stamp" />
            : <Search className="w-5 h-5" />}
        </div>

        <input
          ref={inputRef}
          id="inquiry"
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Ask what happened, why a decision was made, or who signed off…"
          disabled={isLoading}
          className="w-full pl-12 pr-40 py-4 bg-paper border border-rule-strong rounded-sheet text-ink text-[17px] font-serif placeholder:text-ink-faint placeholder:font-sans placeholder:text-[15px] focus:outline-none focus:border-stamp focus:ring-1 focus:ring-stamp/40 transition-colors"
        />

        {query && !isLoading && (
          <button
            type="button"
            onClick={() => { setQuery(''); inputRef.current?.focus(); }}
            className="absolute right-[9.5rem] p-1 text-ink-faint hover:text-ink rounded transition-colors"
            title="Clear"
          >
            <X className="w-4 h-4" />
          </button>
        )}

        <button
          type="submit"
          disabled={isLoading || !query.trim()}
          className="absolute right-2 inline-flex items-center gap-1.5 px-4 py-2.5 bg-ink hover:bg-ink/85 disabled:bg-rule-strong disabled:text-paper text-paper rounded-sheet text-[13px] font-semibold transition-colors"
        >
          <span>{isLoading ? 'Reconstructing…' : 'Recover'}</span>
          {!isLoading && <ArrowRight className="w-3.5 h-3.5" />}
        </button>
      </form>

      <div className="mt-4 pt-3.5 border-t border-rule flex flex-wrap items-center gap-x-2 gap-y-2">
        <span className="field-label mr-1">Try</span>
        {SAMPLE_INQUIRIES.map((sample, idx) => (
          <button
            key={idx}
            type="button"
            onClick={() => { setQuery(sample.query); onSearch(sample.query); }}
            disabled={isLoading}
            className="group inline-flex items-center gap-2 max-w-full pl-1.5 pr-3 py-1 rounded-sheet border border-rule bg-paper/60 hover:bg-paper hover:border-rule-strong transition-colors text-left disabled:opacity-50"
          >
            <span className="font-mono text-[10px] text-stamp bg-stamp/8 border border-stamp/25 rounded px-1 py-0.5 shrink-0">
              {sample.tag}
            </span>
            <span className="text-[12.5px] text-ink-soft group-hover:text-ink truncate">
              {sample.query}
            </span>
          </button>
        ))}
      </div>
    </div>
  );
}
