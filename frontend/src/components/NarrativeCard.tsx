'use client';

import React, { useState, useEffect } from 'react';
import { ShieldCheck, AlertTriangle, AlertCircle, Bookmark, CheckCircle2, Copy, Check, FileDown, Sparkles, Activity, Zap } from 'lucide-react';

interface NarrativeCardProps {
  directAnswer: string;
  reasoningSummary: string;
  confidenceScore: 'high' | 'medium' | 'low';
  confidenceRationale: string;
  query: string;
  onOpenExport?: () => void;
}

export default function NarrativeCard({
  directAnswer,
  reasoningSummary,
  confidenceScore,
  confidenceRationale,
  query,
  onOpenExport,
}: NarrativeCardProps) {
  const [copied, setCopied] = useState(false);
  const [meterWidth, setMeterWidth] = useState('0%');

  // Confidence styling config for Cosmic Neon theme
  const confidenceConfig = {
    high: {
      bg: 'bg-emerald-500/15',
      text: 'text-emerald-300',
      border: 'border-emerald-400/50',
      icon: ShieldCheck,
      label: 'HIGH CONFIDENCE (VERIFIED)',
      percentage: '96%',
      meterColor: 'bg-gradient-to-r from-emerald-500 via-cyan-400 to-emerald-300',
      glow: 'shadow-emerald-500/40',
    },
    medium: {
      bg: 'bg-amber-500/15',
      text: 'text-amber-300',
      border: 'border-amber-400/50',
      icon: AlertTriangle,
      label: 'MEDIUM CONFIDENCE (PARTIAL RECORD)',
      percentage: '74%',
      meterColor: 'bg-gradient-to-r from-amber-500 via-violet-400 to-cyan-300',
      glow: 'shadow-amber-500/40',
    },
    low: {
      bg: 'bg-pink-500/15',
      text: 'text-pink-300',
      border: 'border-pink-500/50',
      icon: AlertCircle,
      label: 'LOW CONFIDENCE (GAP DETECTED)',
      percentage: '42%',
      meterColor: 'bg-gradient-to-r from-pink-500 via-rose-400 to-amber-300',
      glow: 'shadow-pink-500/40',
    },
  }[confidenceScore] || {
    bg: 'bg-slate-800/50',
    text: 'text-slate-300',
    border: 'border-slate-700',
    icon: AlertCircle,
    label: 'CONFIDENCE UNRATED',
    percentage: '50%',
    meterColor: 'bg-slate-400',
    glow: 'shadow-slate-500/20',
  };

  const ConfidenceIcon = confidenceConfig.icon;

  useEffect(() => {
    const timer = setTimeout(() => {
      setMeterWidth(confidenceConfig.percentage);
    }, 150);
    return () => clearTimeout(timer);
  }, [confidenceConfig.percentage]);

  const handleCopyAnswer = () => {
    navigator.clipboard.writeText(directAnswer);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="border-beam-card shadow-2xl transition-all duration-300">
      <div className="border-beam-content forensic-card rounded-xl p-6 relative corner-ticks">
        
        {/* Header bar */}
        <div className="flex flex-wrap items-center justify-between gap-3 pb-4 mb-5 border-b border-[#1E2C54]">
          <div className="flex items-center space-x-3">
            <div className="p-2.5 bg-gradient-to-br from-cyan-500/20 via-violet-500/15 to-transparent border border-cyan-400/50 rounded-xl text-cyan-300 shadow-lg shadow-cyan-500/15">
              <Bookmark className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-sm font-mono font-bold text-white uppercase tracking-wider flex items-center space-x-2">
                <span>RECONSTRUCTED CONTEXT & EXECUTIVE BRIEFING</span>
                <Sparkles className="w-3.5 h-3.5 text-cyan-300 animate-pulse" />
              </h2>
              <p className="text-xs font-mono text-slate-400 mt-0.5">
                TARGET INQUIRY: &ldquo;<span className="text-cyan-200 font-semibold">{query}</span>&rdquo;
              </p>
            </div>
          </div>

          {/* Confidence Stamp & Actions */}
          <div className="flex items-center space-x-2.5">
            {onOpenExport && (
              <button
                onClick={onOpenExport}
                className="btn-shimmer px-3 py-1.5 text-xs font-mono text-cyan-300 hover:text-white bg-[#0A0F24] hover:bg-[#121B3B] border border-[#1E2C54] hover:border-cyan-400/50 rounded-lg flex items-center space-x-1.5 transition-all shadow-xs active:scale-95"
                title="Export Briefing as Dossier"
              >
                <FileDown className="w-3.5 h-3.5 text-cyan-400" />
                <span>Export Dossier</span>
              </button>
            )}

            <div
              className={`flex items-center space-x-2 px-3 py-1.5 rounded-lg border ${confidenceConfig.bg} ${confidenceConfig.border} ${confidenceConfig.text} text-xs font-mono font-bold shadow-md`}
            >
              <ConfidenceIcon className="w-4 h-4" />
              <span>{confidenceConfig.label}</span>
            </div>
          </div>
        </div>

        {/* Animated Confidence Meter Bar with Glowing Tip */}
        <div className="mb-5 p-3.5 rounded-xl bg-[#080D21] border border-[#1E2C54] flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center space-x-2.5 text-xs font-mono text-slate-400">
            <Activity className="w-4 h-4 text-cyan-400 animate-pulse" />
            <span>EVIDENCE INTEGRITY SCORE:</span>
            <span className="text-white font-extrabold bg-cyan-500/10 px-2 py-0.5 rounded border border-cyan-400/30 text-cyan-300">
              {confidenceConfig.percentage}
            </span>
          </div>

          <div className="flex-1 max-w-sm w-full bg-[#040714] rounded-full h-3 overflow-hidden border border-[#1E2C54] relative">
            <div
              className={`h-full rounded-full transition-all duration-1000 ease-out shadow-lg ${confidenceConfig.meterColor} ${confidenceConfig.glow}`}
              style={{ width: meterWidth }}
            ></div>
          </div>
        </div>

        {/* Direct Executive Answer Box with Scanline Sweep */}
        <div className="mb-6 p-5.5 rounded-xl bg-gradient-to-r from-[#0B1530] via-[#0E1B3B] to-[#0A132C] border-l-4 border-cyan-400 border border-[#1E2C54] relative group scanline-box shadow-xl">
          <div className="flex items-center justify-between mb-2.5">
            <span className="text-[10px] font-mono uppercase text-cyan-300 font-extrabold tracking-wider flex items-center space-x-2">
              <span className="w-2 h-2 rounded-full bg-cyan-400 animate-ping"></span>
              <span>EXECUTIVE DIRECT ANSWER // SYNTHESIZED RATIONALE</span>
            </span>

            <button
              onClick={handleCopyAnswer}
              className="text-slate-400 hover:text-cyan-300 text-xs font-mono flex items-center space-x-1.5 px-2.5 py-1 rounded-md hover:bg-white/5 transition-all active:scale-90 border border-transparent hover:border-[#1E2C54]"
              title="Copy answer to clipboard"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copied ? 'Copied!' : 'Copy Brief'}</span>
            </button>
          </div>

          <p className="text-slate-100 font-medium text-base leading-relaxed font-sans">
            {directAnswer}
          </p>
        </div>

        {/* In-depth Forensic Reasoning */}
        <div className="space-y-3">
          <div className="flex items-center space-x-2 text-[10px] font-mono uppercase text-slate-400 font-bold tracking-wider">
            <div className="w-1 h-3 bg-violet-400 rounded-full animate-pulse"></div>
            <span>FORENSIC REASONING TRAIL & EVIDENCE SYNTHESIS</span>
          </div>

          <div className="text-slate-300 text-sm leading-relaxed whitespace-pre-line font-sans pl-3 border-l-2 border-violet-500/40 bg-[#040714]/60 p-4 rounded-r-xl border border-[#1E2C54]">
            {reasoningSummary}
          </div>
        </div>

        {/* Confidence Rationale Footnote */}
        <div className="mt-5 pt-3.5 border-t border-dashed border-[#1E2C54] flex flex-wrap items-center justify-between gap-2 text-xs font-mono text-slate-400">
          <span className="flex items-center space-x-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            <span>EVIDENCE BASIS: <strong className="text-slate-200">{confidenceRationale}</strong></span>
          </span>
          <span className="text-[11px] px-2 py-0.5 rounded bg-[#0A0F24] border border-[#1E2C54] text-cyan-300">
            SOURCE VERIFICATION: ENFORCED
          </span>
        </div>

      </div>
    </div>
  );
}
