'use client';

import React, { useState } from 'react';
import { Search, CornerDownLeft, Sparkles, X, ArrowRight, HelpCircle } from 'lucide-react';

interface AskSectionProps {
  onSearch: (query: string) => void;
  isLoading: boolean;
  searchQuery: string;
  setSearchQuery: (query: string) => void;
}

const EXAMPLE_QUESTIONS = [
  'Why did we change the database?',
  'Who approved the deployment?',
  'Why was MongoDB rejected?',
  'What happened during the incident?',
];

export default function AskSection({
  onSearch,
  isLoading,
  searchQuery,
  setSearchQuery,
}: AskSectionProps) {
  const [isFocused, setIsFocused] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim() && !isLoading) {
      onSearch(searchQuery.trim());
    }
  };

  const handleSelectExample = (question: string) => {
    setSearchQuery('');
    let idx = 0;
    const interval = setInterval(() => {
      idx++;
      setSearchQuery(question.slice(0, idx));
      if (idx >= question.length) {
        clearInterval(interval);
      }
    }, 16);
  };

  return (
    <section id="ask" className="py-20 bg-[#05070D] border-t border-[#1E293B] relative">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        
        {/* Section Heading */}
        <div className="text-center space-y-3">
          <div className="inline-flex items-center space-x-1.5 px-3.5 py-1 rounded-full bg-sky-500/10 text-sky-400 text-xs font-mono font-medium border border-sky-500/20">
            <Sparkles className="w-3.5 h-3.5" />
            <span>INTERACTIVE INVESTIGATION</span>
          </div>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-white tracking-tight">
            What do you want to understand?
          </h2>
          <p className="text-base sm:text-lg text-slate-400 max-w-md mx-auto">
            Ask a question. ReTrace follows the evidence.
          </p>
        </div>

        {/* Large Search Box */}
        <form onSubmit={handleSubmit} className="relative">
          <div
            className={`flex items-center rounded-2xl bg-[#0E1626] border transition-all duration-300 p-2.5 sm:p-3 shadow-2xl relative ${
              isFocused
                ? 'border-sky-400 shadow-sky-500/15 ring-2 ring-sky-500/20'
                : 'border-[#1E293B] hover:border-slate-700'
            }`}
          >
            <div className="pl-3.5 pr-2 text-slate-400 shrink-0">
              <Search className={`w-5 h-5 ${isFocused ? 'text-sky-400' : 'text-slate-400'}`} />
            </div>

            <div className="flex-1 relative flex items-center">
              <input
                type="text"
                value={searchQuery}
                onFocus={() => setIsFocused(true)}
                onBlur={() => setIsFocused(false)}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Why did we migrate to PostgreSQL?"
                disabled={isLoading}
                className="w-full bg-transparent text-white placeholder:text-slate-600 text-sm sm:text-base font-normal focus:outline-none px-2 pr-6"
              />
              {!searchQuery && isFocused && (
                <span className="w-0.5 h-5 bg-sky-400 animate-cursor absolute left-2 pointer-events-none" />
              )}
            </div>

            {searchQuery && !isLoading && (
              <button
                type="button"
                onClick={() => setSearchQuery('')}
                className="p-1.5 text-slate-400 hover:text-white rounded-lg transition-colors mr-2 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            )}

            <button
              type="submit"
              disabled={isLoading || !searchQuery.trim()}
              className="shrink-0 px-6 py-3 rounded-xl font-mono font-bold text-xs sm:text-sm text-slate-950 bg-gradient-to-r from-sky-400 via-cyan-300 to-indigo-400 hover:from-sky-300 hover:to-indigo-300 disabled:opacity-40 disabled:cursor-not-allowed shadow-lg shadow-sky-500/20 transition-all flex items-center space-x-2 active:scale-95 cursor-pointer"
            >
              <span>RECOVER CONTEXT</span>
              <CornerDownLeft className="w-4 h-4 hidden sm:inline" />
            </button>
          </div>
        </form>

        {/* Example Questions Grid */}
        <div className="space-y-3 pt-1">
          <div className="flex items-center justify-center space-x-1.5 text-xs font-mono text-slate-400 uppercase tracking-wider font-semibold">
            <HelpCircle className="w-3.5 h-3.5 text-sky-400" />
            <span>TRY AN EXAMPLE</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {EXAMPLE_QUESTIONS.map((question, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => handleSelectExample(question)}
                className="p-4 rounded-2xl text-left bg-[#0E1626] border border-[#1E293B] hover:border-sky-500/50 hover:bg-[#141F36] transition-all duration-200 cursor-pointer shadow-sm flex items-center justify-between group"
              >
                <span className="text-xs sm:text-sm font-medium text-slate-200 group-hover:text-white transition-colors">
                  &ldquo;{question}&rdquo;
                </span>
                <ArrowRight className="w-4 h-4 text-slate-500 group-hover:text-sky-400 group-hover:translate-x-1 transition-transform shrink-0" />
              </button>
            ))}
          </div>
        </div>

      </div>
    </section>
  );
}
