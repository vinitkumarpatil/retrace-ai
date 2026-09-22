'use client';

import React from 'react';
import { motion } from 'framer-motion';
import {
  ArrowRight,
  Play,
  FileText,
  Search,
  ShieldCheck,
  Link as LinkIcon,
  MousePointer,
  ChevronDown,
} from 'lucide-react';
import HeroInvestigation from './HeroInvestigation';
import { useCursor } from '@/context/CursorContext';
import { useTheme } from '@/context/ThemeContext';

interface HeroProps {
  onTryInvestigation: () => void;
  onSeeHowItWorks: () => void;
}

export default function Hero({ onTryInvestigation, onSeeHowItWorks }: HeroProps) {
  const { setCursor, resetCursor } = useCursor();
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  return (
    <section
      id="hero"
      className="relative pt-24 pb-12 sm:pt-28 sm:pb-16 md:pt-32 md:pb-20 overflow-hidden border-b dark:border-[#1B2945]/70 border-slate-200/80 transition-colors duration-500"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        
        {/* Split Hero: Left Narrative vs Right Interactive Board */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-6 items-center min-h-[500px] lg:min-h-[560px]">
          
          {/* Left Column: Clean Editorial Headline matching Reference Image */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.55, ease: [0.16, 1, 0.3, 1] }}
            className="lg:col-span-6 space-y-6 text-center lg:text-left relative z-20"
          >
            {/* Pill Badge: ● FORENSIC CONTEXT ENGINE */}
            <div className="inline-flex items-center space-x-2.5 px-3.5 py-1.5 rounded-full border dark:border-sky-400/40 border-sky-300/60 dark:bg-[#071326]/75 bg-sky-50/85 backdrop-blur-md text-sky-500 dark:text-sky-400 text-xs font-mono tracking-wider shadow-sm">
              <span className="w-2 h-2 rounded-full bg-sky-400 animate-pulse shadow-[0_0_8px_#38BDF8]" />
              <span className="font-bold uppercase tracking-widest text-[11px]">
                FORENSIC CONTEXT ENGINE
              </span>
            </div>

            {/* Giant Headline: Every decision leaves a trail. */}
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black dark:text-white text-slate-900 tracking-tight leading-[1.08]">
              Every decision
              <br />
              leaves a{' '}
              <span className="bg-gradient-to-r from-sky-400 via-cyan-300 to-sky-300 bg-clip-text text-transparent drop-shadow-[0_0_24px_rgba(56,189,248,0.35)]">
                trail.
              </span>
            </h1>

            {/* Subtext Paragraph */}
            <p className="text-base sm:text-lg dark:text-slate-300 text-slate-700 max-w-xl mx-auto lg:mx-0 leading-relaxed font-normal">
              ReTrace connects documents, incidents and engineering records to reveal the reasoning behind important decisions.
            </p>

            {/* Action Buttons */}
            <div className="flex flex-wrap items-center justify-center lg:justify-start gap-4 pt-2">
              {/* Primary Cyan Pill: Try an Investigation → */}
              <button
                onClick={onTryInvestigation}
                onMouseEnter={() => setCursor('START', 'button')}
                onMouseLeave={resetCursor}
                className="px-7 py-3.5 rounded-full font-bold text-sm text-slate-950 bg-cyan-400 hover:bg-cyan-300 transition-all flex items-center space-x-2.5 cursor-pointer shadow-lg shadow-cyan-400/30 active:scale-95 hover:shadow-cyan-400/50"
              >
                <span>Try an Investigation</span>
                <ArrowRight className="w-4 h-4 text-slate-950 ml-1" />
              </button>

              {/* Secondary Pill: ▷ See How It Works */}
              <button
                onClick={onSeeHowItWorks}
                onMouseEnter={() => setCursor('EXPLORE', 'button')}
                onMouseLeave={resetCursor}
                className="px-6 py-3.5 rounded-full font-semibold text-sm dark:text-white text-slate-900 dark:bg-slate-900/60 bg-white/80 dark:hover:bg-slate-800/80 hover:bg-slate-100/90 border dark:border-slate-700/80 border-slate-300 backdrop-blur-md transition-all flex items-center space-x-2.5 cursor-pointer shadow-sm active:scale-95"
              >
                <Play className="w-3.5 h-3.5 text-sky-400 fill-sky-400/30 stroke-sky-400" />
                <span>See How It Works</span>
              </button>
            </div>
          </motion.div>

          {/* Right Column: Interactive Constellation Board over the Moon */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.6, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
            className="lg:col-span-6 flex items-center justify-center relative min-h-[460px] sm:min-h-[500px] z-20"
          >
            <div className="relative z-10 w-full">
              <HeroInvestigation />
            </div>
          </motion.div>

        </div>

        {/* ============================================================ */}
        {/* 2. HERO BOTTOM METRICS BAR (Matching Reference Design)        */}
        {/* ============================================================ */}
        <div className="mt-14 sm:mt-18 pt-6 border-t dark:border-[#1B2945]/80 border-slate-200/80 flex flex-wrap items-center justify-between gap-6 text-xs font-mono dark:text-slate-400 text-slate-600">
          
          {/* Metrics Group */}
          <div className="flex flex-wrap items-center gap-6 sm:gap-10">
            {/* Metric 1 */}
            <div className="flex items-center space-x-2.5">
              <FileText className="w-4 h-4 text-sky-500 dark:text-sky-400" />
              <div>
                <span className="font-bold dark:text-white text-slate-900 text-sm">2,481</span>{' '}
                <span className="text-xs">Documents</span>
              </div>
            </div>

            {/* Metric 2 */}
            <div className="flex items-center space-x-2.5">
              <Search className="w-4 h-4 text-sky-500 dark:text-sky-400" />
              <div>
                <span className="font-bold dark:text-white text-slate-900 text-sm">387</span>{' '}
                <span className="text-xs">Decisions Found</span>
              </div>
            </div>

            {/* Metric 3 */}
            <div className="flex items-center space-x-2.5">
              <ShieldCheck className="w-4 h-4 text-emerald-500 dark:text-emerald-400" />
              <div>
                <span className="font-bold dark:text-white text-slate-900 text-sm">94%</span>{' '}
                <span className="text-xs">Verified Context</span>
              </div>
            </div>

            {/* Metric 4 */}
            <div className="flex items-center space-x-2.5">
              <LinkIcon className="w-4 h-4 text-sky-500 dark:text-sky-400" />
              <div>
                <span className="font-bold dark:text-white text-slate-900 text-sm">8,942</span>{' '}
                <span className="text-xs">Evidence Links</span>
              </div>
            </div>
          </div>

          {/* Right Scroll to Explore Indicator */}
          <div className="flex items-center space-x-2.5 sm:border-l sm:dark:border-[#1B2945]/80 sm:border-slate-200/80 sm:pl-6 text-xs text-slate-400">
            <div className="w-4 h-6 rounded-full border border-slate-500 flex items-start justify-center p-1">
              <div className="w-1 h-1.5 rounded-full bg-sky-400 animate-bounce" />
            </div>
            <span>Scroll to explore</span>
          </div>

        </div>

      </div>
    </section>
  );
}
