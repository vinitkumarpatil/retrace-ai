'use client';

import React from 'react';
import { Compass, ShieldCheck } from 'lucide-react';
import { useCursor } from '@/context/CursorContext';

export default function Footer() {
  const { setCursor, resetCursor } = useCursor();

  return (
    <footer className="border-t border-[#1B2945]/70 bg-[#070B14]/85 py-12 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
      {/* Soft atmospheric horizon glow bookending the visual narrative */}
      <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-3/4 h-36 bg-[radial-gradient(ellipse_at_bottom,rgba(56,189,248,0.1)_0%,rgba(14,22,38,0.05)_55%,transparent_80%)] blur-2xl pointer-events-none -z-10" />

      <div className="max-w-7xl mx-auto space-y-8 text-xs font-mono text-slate-400 relative z-10">
        
        {/* Top Row: Brand and Navigation */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-6 pb-6 border-b border-[#1B2945]/70">
          <div className="flex items-center space-x-3">
            <div className="w-7 h-7 rounded-lg bg-[#0E1626] border border-[#2A3B5C] flex items-center justify-center text-sky-400">
              <Compass className="w-4 h-4" />
            </div>
            <div className="flex items-center space-x-2">
              <span className="text-white font-bold text-sm tracking-tight font-sans">
                ReTrace
              </span>
              <span className="text-slate-600">/</span>
              <span className="text-slate-400 font-mono text-[11px] tracking-wider uppercase">
                Forensic Context Recovery Engine
              </span>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-5 text-xs">
            <a
              href="#hero"
              onMouseEnter={() => setCursor('VIEW', 'button')}
              onMouseLeave={resetCursor}
              className="text-slate-400 hover:text-white transition-colors"
            >
              HOME
            </a>
            <a
              href="#how-it-works"
              onMouseEnter={() => setCursor('VIEW', 'button')}
              onMouseLeave={resetCursor}
              className="text-slate-400 hover:text-white transition-colors"
            >
              HOW IT WORKS
            </a>
            <a
              href="#explore"
              onMouseEnter={() => setCursor('VIEW', 'button')}
              onMouseLeave={resetCursor}
              className="text-slate-400 hover:text-white transition-colors"
            >
              EXPLORE
            </a>
            <a
              href="#archive"
              onMouseEnter={() => setCursor('VIEW', 'button')}
              onMouseLeave={resetCursor}
              className="text-slate-400 hover:text-white transition-colors"
            >
              ARCHIVE
            </a>
            <a
              href="#about"
              onMouseEnter={() => setCursor('VIEW', 'button')}
              onMouseLeave={resetCursor}
              className="text-slate-400 hover:text-white transition-colors"
            >
              ABOUT
            </a>
          </div>
        </div>

        {/* Bottom Row: Verification Guarantee & Status */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 text-[11px] text-slate-500">
          <span>&copy; {new Date().getFullYear()} ReTrace Engine. Designed for engineering context recovery.</span>
          <div className="flex items-center space-x-4">
            <span className="text-emerald-400 font-mono flex items-center space-x-1.5">
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>Evidence-Backed &bull; Zero Hallucinations</span>
            </span>
          </div>
        </div>

      </div>
    </footer>
  );
}
