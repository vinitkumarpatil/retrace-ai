'use client';

import React, { useState } from 'react';
import { Search, Loader2, ArrowRight, CornerDownLeft, Sparkles, X, HelpCircle } from 'lucide-react';

interface AskSectionProps {
  onSearch: (query: string) => void;
  isLoading: boolean;
  searchQuery: string;
  setSearchQuery: (query: string) => void;
}

const EXAMPLE_QUESTIONS = [
  {
    text: 'Why did we change the database?',
    category: 'Architecture',
    color: 'hover:border-sky-500/50 hover:bg-sky-500/5 text-sky-300',
  },
  {
    text: 'Who approved the deployment?',
    category: 'Governance',
    color: 'hover:border-emerald-500/50 hover:bg-emerald-500/5 text-emerald-300',
  },
  {
    text: 'Why was MongoDB rejected?',
    category: 'Tech Stack',
    color: 'hover:border-purple-500/50 hover:bg-purple-500/5 text-purple-300',
  },
  {
    text: 'What happened during the incident?',
    category: 'Incident Postmortem',
    color: 'hover:border-rose-500/50 hover:bg-rose-500/5 text-rose-300',
  },
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
    setSearchQuery(question);
    onSearch(question);
  };

  return (
    <section id="ask" className="py-16 bg-[#080D1A] border-y border-slate-800/80 relative">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        
        {/* Section Header */}
        <div className="text-center space-y-2">
          <div className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full bg-sky-500/10 text-sky-400 text-xs font-mono font-medium border border-sky-500/20">
            <Sparkles className="w-3.5 h-3.5" />
            <span>INSTANT CONTEXT RECOVERY</span>
          </div>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
            Ask ReTrace
          </h2>
          <p className="text-sm sm:text-base text-slate-400 max-w-lg mx-auto">
            Inquire about any technical pivot, architecture proposal, or incident postmortem.
          </p>
        </div>

        {/* Large Search Input Box */}
        <form onSubmit={handleSubmit} className="relative">
          <div
            className={`flex items-center rounded-2xl bg-[#0F172A] border transition-all duration-300 p-2 sm:p-2.5 shadow-2xl ${
              isFocused
                ? 'border-sky-400 shadow-sky-500/10 ring-2 ring-sky-500/20'
                : 'border-slate-700/80 hover:border-slate-600'
            }`}
          >
            <div className="pl-3.5 pr-2 text-slate-400 shrink-0">
              {isLoading ? (
                <Loader2 className="w-5 h-5 animate-spin text-sky-400" />
              ) : (
                <Search className={`w-5 h-5 ${isFocused ? 'text-sky-400' : 'text-slate-400'}`} />
              )}
            </div>

            <input
              type="text"
              value={searchQuery}
              onFocus={() => setIsFocused(true)}
              onBlur={() => setIsFocused(false)}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="e.g. Why did we migrate to PostgreSQL?..."
              disabled={isLoading}
              className="w-full bg-transparent text-white placeholder:text-slate-500 text-sm sm:text-base font-normal focus:outline-none px-2"
            />

            {searchQuery && !isLoading && (
              <button
                type="button"
                onClick={() => setSearchQuery('')}
                className="p-1.5 text-slate-400 hover:text-white rounded-lg transition-colors mr-1 shrink-0"
              >
                <X className="w-4 h-4" />
              </button>
            )}

            <button
              type="submit"
              disabled={isLoading || !searchQuery.trim()}
              className="shrink-0 px-5 py-3 rounded-xl font-semibold text-slate-950 bg-gradient-to-r from-sky-400 to-indigo-400 hover:from-sky-300 hover:to-indigo-300 disabled:opacity-50 disabled:cursor-not-allowed shadow-md shadow-sky-500/20 transition-all flex items-center space-x-2 active:scale-95 text-xs sm:text-sm cursor-pointer"
            >
              <span>{isLoading ? 'Searching...' : 'Recover Context'}</span>
              {isLoading ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <CornerDownLeft className="w-4 h-4 hidden sm:inline" />
              )}
            </button>
          </div>
        </form>

        {/* Example Questions Section */}
        <div className="space-y-3">
          <div className="flex items-center justify-between text-xs font-mono text-slate-400">
            <span className="flex items-center space-x-1.5">
              <HelpCircle className="w-3.5 h-3.5 text-sky-400" />
              <span>Or click an example question to try immediately:</span>
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {EXAMPLE_QUESTIONS.map((ex, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => handleSelectExample(ex.text)}
                className={`p-3.5 rounded-xl text-left bg-[#0F172A]/70 border border-slate-800 transition-all duration-200 group flex items-center justify-between gap-2 cursor-pointer ${ex.color}`}
              >
                <div className="space-y-0.5">
                  <span className="text-[10px] font-mono text-slate-400 block uppercase tracking-wider">
                    {ex.category}
                  </span>
                  <p className="text-xs sm:text-sm font-medium text-slate-200 group-hover:text-white transition-colors">
                    &ldquo;{ex.text}&rdquo;
                  </p>
                </div>
                <ArrowRight className="w-4 h-4 text-slate-400 group-hover:text-white group-hover:translate-x-1 transition-all shrink-0" />
              </button>
            ))}
          </div>
        </div>

      </div>
    </section>
  );
}
