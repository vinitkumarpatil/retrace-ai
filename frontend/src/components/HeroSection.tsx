'use client';

import React, { useState, useEffect } from 'react';
import {
  FileText,
  Search,
  CheckCircle2,
  Bookmark,
  ArrowRight,
  Play,
  Sparkles,
  ShieldCheck,
  Zap,
  Users,
  GitCommit,
  Share2,
  Database,
} from 'lucide-react';

interface HeroSectionProps {
  onTryReTrace: () => void;
  onSeeHowItWorks: () => void;
  onStartInvestigation: () => void;
}

export default function HeroSection({
  onTryReTrace,
  onSeeHowItWorks,
  onStartInvestigation,
}: HeroSectionProps) {
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });

  const handleMouseMove = (e: React.MouseEvent) => {
    // Subtle desktop parallax (only small degree)
    if (window.innerWidth >= 1024) {
      const rect = e.currentTarget.getBoundingClientRect();
      const x = ((e.clientX - rect.left) / rect.width - 0.5) * 12;
      const y = ((e.clientY - rect.top) / rect.height - 0.5) * 12;
      setMousePos({ x, y });
    }
  };

  const handleMouseLeave = () => {
    setMousePos({ x: 0, y: 0 });
  };

  return (
    <section
      id="hero"
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      className="relative pt-32 pb-20 md:pt-40 md:pb-28 overflow-hidden subtle-grid bg-[#070D1A]"
    >
      {/* Soft background ambient gradient orbs */}
      <div className="absolute top-1/4 left-1/4 w-[28rem] h-[28rem] bg-sky-500/10 rounded-full blur-[140px] pointer-events-none -z-10" />
      <div className="absolute top-1/3 right-1/4 w-[30rem] h-[30rem] bg-indigo-500/10 rounded-full blur-[150px] pointer-events-none -z-10" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8 items-center">
          
          {/* Left Column: Heading & Core Message */}
          <div className="lg:col-span-6 space-y-6 text-center lg:text-left">
            
            {/* Small Badge */}
            <div className="inline-flex items-center space-x-2 px-3.5 py-1.5 rounded-full bg-sky-500/10 border border-sky-500/25 text-sky-400 text-xs font-mono font-semibold shadow-sm">
              <span className="w-2 h-2 rounded-full bg-sky-400 animate-pulse" />
              <span>FORENSIC CONTEXT ENGINE</span>
            </div>

            {/* Large Heading */}
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-white leading-[1.12]">
              Every decision
              <br />
              has a <span className="story-text-gradient">story.</span>
            </h1>

            {/* Subtitle */}
            <p className="text-base sm:text-lg text-slate-300 max-w-xl mx-auto lg:mx-0 leading-relaxed font-normal">
              ReTrace helps you understand what happened, why it happened, who made the decision, and the evidence behind it.
            </p>

            {/* Action Buttons */}
            <div className="flex flex-wrap items-center justify-center lg:justify-start gap-4 pt-2">
              <button
                onClick={onTryReTrace}
                className="px-6 py-3.5 rounded-xl font-mono font-bold text-xs sm:text-sm text-slate-950 bg-gradient-to-r from-sky-400 via-cyan-300 to-indigo-400 hover:from-sky-300 hover:to-indigo-300 shadow-xl shadow-sky-500/25 transition-all flex items-center space-x-2 hover:-translate-y-0.5 active:scale-95 cursor-pointer"
              >
                <Search className="w-4 h-4 text-slate-950" />
                <span>TRY RETRACE</span>
              </button>

              <button
                onClick={onSeeHowItWorks}
                className="px-5 py-3.5 rounded-xl font-mono font-bold text-xs sm:text-sm text-white bg-[#0E1626] hover:bg-[#141F36] border border-[#1E293B] hover:border-slate-700 transition-all flex items-center space-x-2 hover:-translate-y-0.5 active:scale-95 shadow-sm cursor-pointer"
              >
                <Play className="w-3.5 h-3.5 text-sky-400 fill-sky-400" />
                <span>SEE HOW IT WORKS</span>
              </button>
            </div>

            {/* Micro proof points */}
            <div className="pt-4 border-t border-[#1E293B]/80 flex flex-wrap items-center justify-center lg:justify-start gap-6 text-xs text-slate-400 font-mono">
              <div className="flex items-center space-x-1.5">
                <ShieldCheck className="w-4 h-4 text-emerald-400" />
                <span>Strict Zero-Hallucination Policy</span>
              </div>
              <div className="flex items-center space-x-1.5">
                <Sparkles className="w-4 h-4 text-sky-400" />
                <span>Verbatim Citation Verification</span>
              </div>
            </div>
          </div>

          {/* Right Column: Original Animated Investigation Visual + Floating Cards */}
          <div className="lg:col-span-6 relative flex items-center justify-center">
            
            {/* Parallax Container */}
            <div
              className="w-full max-w-md sm:max-w-lg bg-[#0E1626]/90 border border-[#1E293B] rounded-3xl p-6 sm:p-7 shadow-2xl relative overflow-hidden backdrop-blur-md transition-transform duration-200 ease-out"
              style={{
                transform: `translate(${mousePos.x}px, ${mousePos.y}px)`,
              }}
            >
              {/* Scanning Beam across visual */}
              <div className="absolute inset-x-0 h-20 bg-gradient-to-b from-transparent via-sky-400/10 to-transparent pointer-events-none animate-scanbeam" />

              {/* Header inside graphic */}
              <div className="flex items-center justify-between pb-3.5 mb-5 border-b border-[#1E293B] text-xs font-mono text-slate-400">
                <div className="flex items-center space-x-2">
                  <div className="w-2.5 h-2.5 rounded-full bg-rose-500/80" />
                  <div className="w-2.5 h-2.5 rounded-full bg-amber-500/80" />
                  <div className="w-2.5 h-2.5 rounded-full bg-emerald-500/80" />
                  <span className="text-[11px] text-slate-400 ml-1.5 font-mono">forensic_investigation.engine</span>
                </div>
                <span className="text-[10px] text-sky-400 uppercase font-bold bg-sky-500/10 px-2 py-0.5 rounded border border-sky-500/20">
                  RECONSTRUCTION
                </span>
              </div>

              {/* Floating Document Cards Array */}
              <div className="space-y-3 relative">
                
                {/* 1. Architecture Decision */}
                <div className="p-3 rounded-2xl bg-[#141F36] border border-[#1E293B] flex items-center justify-between animate-float-slow-1 shadow-md">
                  <div className="flex items-center space-x-3">
                    <div className="p-2 rounded-xl bg-amber-500/10 text-amber-400 border border-amber-500/20">
                      <FileText className="w-4 h-4" />
                    </div>
                    <div>
                      <span className="text-[10px] font-mono uppercase text-slate-400 font-bold block">
                        ARCHITECTURE
                      </span>
                      <h4 className="text-xs font-bold text-white">
                        ADR-042: Database Selection Review
                      </h4>
                    </div>
                  </div>
                  <span className="text-[10px] font-mono text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded">
                    Scanned
                  </span>
                </div>

                {/* 2. Incident Report */}
                <div className="p-3 rounded-2xl bg-[#141F36] border border-[#1E293B] flex items-center justify-between animate-float-slow-2 shadow-md">
                  <div className="flex items-center space-x-3">
                    <div className="p-2 rounded-xl bg-rose-500/10 text-rose-400 border border-rose-500/20">
                      <FileText className="w-4 h-4" />
                    </div>
                    <div>
                      <span className="text-[10px] font-mono uppercase text-slate-400 font-bold block">
                        INCIDENT REPORT
                      </span>
                      <h4 className="text-xs font-bold text-white">
                        Incident #88: RDS Outage Retrospective
                      </h4>
                    </div>
                  </div>
                  <span className="text-[10px] font-mono text-rose-400 bg-rose-500/10 px-2 py-0.5 rounded">
                    Scanned
                  </span>
                </div>

                {/* Center ReTrace Processing Node */}
                <div className="flex flex-col items-center py-1">
                  <div className="w-0.5 h-3 bg-gradient-to-b from-sky-400 to-indigo-500 animate-pulse" />
                  <div className="px-4 py-1.5 rounded-full bg-gradient-to-r from-sky-400 to-indigo-500 text-slate-950 text-xs font-mono font-bold flex items-center space-x-1.5 shadow-lg shadow-sky-500/20">
                    <Search className="w-3.5 h-3.5" />
                    <span>RETRACE CORRELATION</span>
                  </div>
                  <div className="w-0.5 h-3 bg-gradient-to-b from-indigo-500 to-emerald-400 animate-pulse" />
                </div>

                {/* 3. Decision Context Found Card */}
                <div className="p-4 rounded-2xl bg-gradient-to-r from-emerald-500/15 via-[#141F36] to-[#0E1626] border border-emerald-500/40 shadow-xl space-y-2.5 animate-float-slow-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                      <span className="text-xs font-mono text-emerald-400 font-bold uppercase tracking-wider">
                        Decision Context Found
                      </span>
                    </div>
                    <span className="text-[10px] font-mono text-slate-400">
                      August 12, 2024
                    </span>
                  </div>

                  <p className="text-xs font-semibold text-white leading-relaxed">
                    PostgreSQL migration authorized by Architecture Review Board to unify ACID ledger transactions & vector search.
                  </p>

                  <div className="grid grid-cols-4 gap-1.5 pt-1 text-[10px] font-mono text-center">
                    <span className="p-1 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-bold">
                      ✓ WHY
                    </span>
                    <span className="p-1 rounded bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 font-bold">
                      ✓ WHO
                    </span>
                    <span className="p-1 rounded bg-amber-500/10 text-amber-400 border border-amber-500/20 font-bold">
                      ✓ WHEN
                    </span>
                    <span className="p-1 rounded bg-sky-500/10 text-sky-400 border border-sky-500/20 font-bold">
                      ✓ EVIDENCE
                    </span>
                  </div>
                </div>

              </div>

              {/* Bottom Graphic Note */}
              <div className="mt-4 pt-3 border-t border-[#1E293B] flex items-center justify-between text-[11px] font-mono text-slate-400">
                <span>Evidence trail established</span>
                <span className="text-sky-400 font-semibold">94% Confidence</span>
              </div>
            </div>

            {/* 4 Floating Information Statistics Cards (surrounding the visual) */}
            {/* Top Left Floating Stat */}
            <div className="hidden sm:flex absolute -top-4 -left-6 p-3 rounded-2xl bg-[#0E1626]/95 border border-slate-700/80 shadow-2xl backdrop-blur-xl animate-float-slow-2 z-10 items-center space-x-3">
              <div className="p-2 rounded-xl bg-sky-500/10 text-sky-400">
                <FileText className="w-4 h-4" />
              </div>
              <div className="text-left">
                <span className="text-base font-extrabold text-white font-mono leading-none block">2,481</span>
                <span className="text-[10px] text-slate-400 font-mono uppercase">Documents</span>
              </div>
            </div>

            {/* Top Right Floating Stat */}
            <div className="hidden sm:flex absolute -top-6 -right-4 p-3 rounded-2xl bg-[#0E1626]/95 border border-slate-700/80 shadow-2xl backdrop-blur-xl animate-float-slow-3 z-10 items-center space-x-3">
              <div className="p-2 rounded-xl bg-indigo-500/10 text-indigo-400">
                <Search className="w-4 h-4" />
              </div>
              <div className="text-left">
                <span className="text-base font-extrabold text-white font-mono leading-none block">387</span>
                <span className="text-[10px] text-slate-400 font-mono uppercase">Decisions Found</span>
              </div>
            </div>

            {/* Bottom Left Floating Stat */}
            <div className="hidden sm:flex absolute -bottom-5 -left-4 p-3 rounded-2xl bg-[#0E1626]/95 border border-slate-700/80 shadow-2xl backdrop-blur-xl animate-float-slow-1 z-10 items-center space-x-3">
              <div className="p-2 rounded-xl bg-emerald-500/10 text-emerald-400">
                <ShieldCheck className="w-4 h-4" />
              </div>
              <div className="text-left">
                <span className="text-base font-extrabold text-white font-mono leading-none block">94%</span>
                <span className="text-[10px] text-slate-400 font-mono uppercase">Verified Context</span>
              </div>
            </div>

            {/* Bottom Right Floating Stat */}
            <div className="hidden sm:flex absolute -bottom-4 -right-4 p-3 rounded-2xl bg-[#0E1626]/95 border border-slate-700/80 shadow-2xl backdrop-blur-xl animate-float-slow-2 z-10 items-center space-x-3">
              <div className="p-2 rounded-xl bg-sky-500/10 text-sky-400">
                <Share2 className="w-4 h-4" />
              </div>
              <div className="text-left">
                <span className="text-base font-extrabold text-white font-mono leading-none block">8,942</span>
                <span className="text-[10px] text-slate-400 font-mono uppercase">Evidence Links</span>
              </div>
            </div>

          </div>

        </div>

        {/* 5. Main Hero CTA Banner */}
        <div className="pt-6">
          <div className="p-6 sm:p-7 rounded-3xl bg-gradient-to-r from-sky-500/10 via-[#0E1626] to-indigo-500/10 border border-[#1E293B] shadow-2xl flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="space-y-1 text-center sm:text-left">
              <h3 className="text-lg sm:text-xl font-extrabold text-white">
                Find the missing context.
              </h3>
              <p className="text-xs sm:text-sm text-slate-400">
                Inquire about any technical pivot, architectural consensus, or incident postmortem.
              </p>
            </div>

            <button
              onClick={onStartInvestigation}
              className="px-6 py-3 rounded-xl font-mono font-bold text-xs sm:text-sm text-slate-950 bg-gradient-to-r from-sky-400 to-indigo-400 hover:from-sky-300 hover:to-indigo-300 transition-all flex items-center space-x-2 shadow-lg shadow-sky-500/20 active:scale-95 shrink-0 cursor-pointer"
            >
              <span>START INVESTIGATION</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>

      </div>
    </section>
  );
}
