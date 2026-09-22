'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { Search, CornerDownLeft, Sparkles, Database, ShieldAlert, Cpu, ArrowRight } from 'lucide-react';
import { SUGGESTED_INQUIRIES } from '@/data/demoData';
import { useCursor } from '@/context/CursorContext';

interface QueryConsoleProps {
  onSearch: (query: string) => void;
  isLoading: boolean;
  searchQuery: string;
  setSearchQuery: (query: string) => void;
}

export default function QueryConsole({
  onSearch,
  isLoading,
  searchQuery,
  setSearchQuery,
}: QueryConsoleProps) {
  const { setCursor, resetCursor } = useCursor();

  const handleSelectQuery = (questionText: string) => {
    if (isLoading) return;
    setSearchQuery(questionText);
    onSearch(questionText);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchQuery.trim() || isLoading) return;
    onSearch(searchQuery);
  };

  return (
    <section id="explore" className="py-20 md:py-28 dark:bg-[#070B14]/75 bg-slate-100/60 backdrop-blur-[2px] border-b dark:border-[#1B2945]/70 border-slate-200/80 relative">
      <div id="ask" className="sr-only" />
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
        
        {/* Header */}
        <div className="text-center space-y-3">
          <div className="inline-flex items-center space-x-2 px-3 py-1 rounded border dark:border-[#2A3B5C] border-sky-300/40 dark:bg-[#0E1626] bg-sky-50 dark:text-sky-400 text-sky-700 text-[10px] font-mono uppercase tracking-widest">
            <span>PRIMARY INTERFACE</span>
          </div>
          <h2 className="text-3xl sm:text-4xl font-extrabold dark:text-white text-slate-900 tracking-tight">
            What are you trying to understand?
          </h2>
          <p className="text-sm sm:text-base dark:text-slate-400 text-slate-600 font-normal">
            Ask what happened, why a decision was made, or who authorized it.
          </p>
        </div>

        {/* Large Search Console Form */}
        <form onSubmit={handleSubmit} className="space-y-3">
          <div className="relative rounded-xl border dark:border-[#2A3B5C] border-slate-200 focus-within:border-sky-400 dark:bg-[#0E1626]/90 bg-white/95 p-2.5 transition-colors shadow-xl backdrop-blur-md">
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
              <div className="flex items-center flex-1 px-3 py-1">
                <Search className="w-5 h-5 text-sky-500 dark:text-sky-400 shrink-0 mr-3" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Why did we migrate to PostgreSQL?"
                  disabled={isLoading}
                  className="w-full bg-transparent text-sm sm:text-base dark:text-white text-slate-900 placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none disabled:opacity-50 font-normal"
                />
              </div>

              <button
                type="submit"
                disabled={isLoading || !searchQuery.trim()}
                onMouseEnter={() => setCursor('RECOVER', 'button')}
                onMouseLeave={resetCursor}
                className="px-6 py-3 rounded-lg font-mono font-bold text-xs sm:text-sm text-slate-950 bg-sky-400 hover:bg-sky-300 transition-colors flex items-center justify-center space-x-2 disabled:opacity-40 disabled:cursor-not-allowed shadow-sm active:scale-95 cursor-pointer shrink-0"
              >
                <span>{isLoading ? 'INVESTIGATING...' : 'RECOVER'}</span>
                <CornerDownLeft className="w-4 h-4 text-slate-950" />
              </button>
            </div>
          </div>

          {/* Status Label */}
          <div className="flex items-center justify-between text-[11px] font-mono dark:text-slate-400 text-slate-500 px-1">
            <span className="flex items-center space-x-1.5 text-emerald-500 dark:text-emerald-400">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 dark:bg-emerald-400" />
              <span>Natural language matching enabled</span>
            </span>
            <span>Zero-hallucination verified</span>
          </div>
        </form>

        {/* Suggested Inquiries (Interactive Question Cards) */}
        <div className="space-y-3 pt-4 border-t dark:border-[#1B2945] border-slate-200">
          <div className="flex items-center justify-between text-xs font-mono dark:text-slate-400 text-slate-500">
            <span>SUGGESTED FORENSIC INQUIRIES:</span>
            <span className="text-[11px] text-sky-500 dark:text-sky-400">1-click investigation</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {SUGGESTED_INQUIRIES.map((item) => (
              <motion.button
                key={item.id}
                onClick={() => handleSelectQuery(item.question)}
                whileHover={{ y: -3, scale: 1.01 }}
                onMouseEnter={() => setCursor('ASK', 'button')}
                onMouseLeave={resetCursor}
                disabled={isLoading}
                className="p-4 rounded-xl dark:bg-[#0E1626]/90 bg-white/90 dark:hover:bg-[#141F36] hover:bg-slate-50 border dark:border-[#1B2945] border-slate-200 hover:border-sky-400/50 text-left transition-all flex flex-col justify-between space-y-3 cursor-pointer group shadow-sm hover:shadow-md backdrop-blur-md"
              >
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <span className="stamp-badge text-sky-500 dark:text-sky-400 border-sky-400/30">
                      {item.tag}
                    </span>
                    <span className="text-[10px] font-mono dark:text-slate-400 text-slate-500">
                      {item.dateBadge}
                    </span>
                  </div>
                  <h4 className="text-xs sm:text-sm font-bold dark:text-white text-slate-900 dark:group-hover:text-sky-300 group-hover:text-sky-600 transition-colors">
                    {item.title}
                  </h4>
                  <p className="text-xs dark:text-slate-300 text-slate-600 font-normal leading-snug line-clamp-2">
                    &ldquo;{item.question}&rdquo;
                  </p>
                </div>

                <div className="pt-2 border-t dark:border-[#1B2945]/70 border-slate-200 flex items-center justify-between text-[10px] font-mono dark:text-slate-400 text-slate-500">
                  <span>{item.sourceCount}</span>
                  <span className="text-sky-500 dark:text-sky-400 font-bold flex items-center space-x-1 group-hover:translate-x-0.5 transition-transform">
                    <span>LOAD QUERY</span>
                    <ArrowRight className="w-3 h-3 ml-0.5" />
                  </span>
                </div>
              </motion.button>
            ))}
          </div>
        </div>

      </div>
    </section>
  );
}
