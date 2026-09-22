'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Search, Sparkles, CornerDownLeft, Loader2, ArrowRight } from 'lucide-react';
import { EXAMPLE_QUESTIONS } from '@/data/demoData';
import { useCursor } from '@/context/CursorContext';

interface QueryBoxProps {
  onSearch: (query: string) => void;
  isLoading: boolean;
  searchQuery: string;
  setSearchQuery: (query: string) => void;
}

export default function QueryBox({
  onSearch,
  isLoading,
  searchQuery,
  setSearchQuery,
}: QueryBoxProps) {
  const [isTyping, setIsTyping] = useState(false);
  const { setCursor, resetCursor } = useCursor();

  const handleSelectExample = (question: string) => {
    if (isLoading) return;
    setIsTyping(true);
    let i = 0;
    setSearchQuery('');
    const timer = setInterval(() => {
      if (i < question.length) {
        setSearchQuery(question.slice(0, i + 1));
        i++;
      } else {
        clearInterval(timer);
        setIsTyping(false);
        onSearch(question);
      }
    }, 18);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchQuery.trim() || isLoading) return;
    onSearch(searchQuery);
  };

  return (
    <section id="ask" className="py-16 md:py-24 bg-[#05070D] relative subtle-grid">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        
        {/* Title Header */}
        <div className="text-center space-y-3">
          <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 text-xs font-mono font-medium">
            <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
            <span>INTERACTIVE FORENSIC QUERY</span>
          </div>
          <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-white">
            What do you want to understand?
          </h2>
          <p className="text-sm sm:text-base text-slate-400 max-w-xl mx-auto font-normal">
            Ask any question about your architecture, incidents, or engineering trade-offs.
          </p>
        </div>

        {/* Large Input Form */}
        <motion.form
          onSubmit={handleSubmit}
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="relative group"
        >
          {/* Subtle Outer Glow */}
          <div className="absolute -inset-1 bg-gradient-to-r from-cyan-500/20 via-indigo-500/15 to-cyan-500/20 rounded-2xl blur-lg opacity-75 group-hover:opacity-100 transition duration-300 -z-10" />

          <div className="relative flex flex-col sm:flex-row items-stretch bg-[#0E1626] border border-[#1E293B] group-focus-within:border-cyan-400/80 rounded-2xl p-2 shadow-2xl transition-all">
            <div className="flex items-center flex-1 px-3 py-2">
              <Search className="w-5 h-5 text-cyan-400 shrink-0 mr-3" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Why did we migrate to PostgreSQL and change the vector index on August 12?"
                disabled={isLoading || isTyping}
                className="w-full bg-transparent text-sm sm:text-base text-white placeholder-slate-500 focus:outline-none disabled:opacity-60"
              />
            </div>

            <button
              type="submit"
              disabled={isLoading || !searchQuery.trim() || isTyping}
              onMouseEnter={() => setCursor('SEARCH', 'button')}
              onMouseLeave={resetCursor}
              className="mt-2 sm:mt-0 sm:ml-2 px-6 py-3 rounded-xl font-mono font-bold text-xs sm:text-sm text-slate-950 bg-gradient-to-r from-sky-400 to-cyan-300 hover:from-sky-300 hover:to-cyan-200 transition-all flex items-center justify-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed shadow-md shadow-cyan-400/20 active:scale-95 cursor-pointer"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin text-slate-950" />
                  <span>RECOVERING...</span>
                </>
              ) : (
                <>
                  <span>RECOVER CONTEXT</span>
                  <CornerDownLeft className="w-4 h-4 text-slate-950" />
                </>
              )}
            </button>
          </div>
        </motion.form>

        {/* 4 Interactive Example Question Pills */}
        <div className="space-y-3">
          <div className="flex items-center justify-between text-xs font-mono text-slate-400">
            <span>OR SELECT A VERIFIED SCENARIO:</span>
            <span className="text-[11px] text-cyan-400">1-click simulation</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
            {EXAMPLE_QUESTIONS.map((q) => (
              <motion.button
                key={q.id}
                onClick={() => handleSelectExample(q.question)}
                whileHover={{ y: -2, scale: 1.01 }}
                onMouseEnter={() => setCursor('TRY', 'button')}
                onMouseLeave={resetCursor}
                disabled={isLoading || isTyping}
                className="text-left p-3.5 rounded-xl bg-[#0E1626]/70 hover:bg-[#141F36] border border-[#1E293B] hover:border-cyan-500/40 transition-all group flex items-start justify-between gap-3 cursor-pointer shadow-sm"
              >
                <div className="space-y-1">
                  <div className="flex items-center space-x-2">
                    <span className="text-[10px] font-mono font-bold text-cyan-400 bg-cyan-500/10 px-2 py-0.5 rounded">
                      {q.tag}
                    </span>
                    <span className="text-xs font-semibold text-slate-200 group-hover:text-white">
                      {q.title}
                    </span>
                  </div>
                  <p className="text-xs text-slate-400 line-clamp-1 group-hover:text-slate-300">
                    &quot;{q.question}&quot;
                  </p>
                </div>
                <ArrowRight className="w-4 h-4 text-slate-500 group-hover:text-cyan-400 shrink-0 mt-1 transition-colors" />
              </motion.button>
            ))}
          </div>
        </div>

      </div>
    </section>
  );
}
