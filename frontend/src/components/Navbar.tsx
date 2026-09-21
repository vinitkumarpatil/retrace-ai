'use client';

import React, { useState, useEffect } from 'react';
import {
  Compass,
  Database,
  Sparkles,
  UploadCloud,
  RefreshCw,
  FileText,
  Share2,
  Activity,
  ShieldCheck,
  Radio,
  Zap,
} from 'lucide-react';
import { checkHealth } from '@/lib/api';

interface NavbarProps {
  onOpenIngest: () => void;
  onSeedDemo: () => void;
  onOpenDocLibrary: () => void;
  onToggleGlobalGraph?: () => void;
  isSeeding: boolean;
  docCount: number;
}

export default function Navbar({
  onOpenIngest,
  onSeedDemo,
  onOpenDocLibrary,
  onToggleGlobalGraph,
  isSeeding,
  docCount,
}: NavbarProps) {
  const [health, setHealth] = useState<{
    gemini?: boolean;
    dbMode?: string;
  }>({ gemini: true, dbMode: 'Vector Store' });

  useEffect(() => {
    checkHealth()
      .then((res) => {
        setHealth({
          gemini: res?.services?.gemini?.configured ?? true,
          dbMode: res?.services?.database?.mode ?? 'pgvector',
        });
      })
      .catch(() => {
        // Fallback gracefully without breaking UI
      });
  }, []);

  return (
    <header className="relative border-b border-[#1E2C54] bg-[#070D1E]/95 backdrop-blur-2xl sticky top-0 z-40 transition-all shadow-2xl">
      
      {/* 1. Animated Iridescent Aurora Bottom Border */}
      <div className="animated-nav-border"></div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-18 flex items-center justify-between py-2">
        
        {/* Left: Holographic Logo with Dual Rotating Orbits */}
        <div className="flex items-center space-x-3.5 group cursor-default">
          <div className="relative w-11 h-11 flex items-center justify-center">
            {/* Outer Rotating Cyan Orbit */}
            <div className="absolute inset-0 rounded-xl border border-dashed border-cyan-400/50 animate-spin-slow pointer-events-none"></div>
            
            {/* Inner Rotating Violet Ring */}
            <div className="absolute inset-1 rounded-lg border border-dotted border-violet-400/60 animate-spin-reverse pointer-events-none"></div>

            {/* Glowing Core */}
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-cyan-500/30 via-violet-600/30 to-transparent border border-cyan-400/60 text-cyan-300 flex items-center justify-center shadow-lg shadow-cyan-500/20 group-hover:scale-105 transition-transform duration-300">
              <Compass className="w-5 h-5 text-cyan-300 animate-spin" style={{ animationDuration: '20s' }} />
            </div>

            {/* Micro Ping Dot */}
            <span className="absolute -top-0.5 -right-0.5 flex h-2.5 w-2.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-cyan-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-cyan-400"></span>
            </span>
          </div>

          <div className="flex items-center space-x-2.5">
            <span className="font-extrabold text-xl tracking-tight shimmer-text">
              ReTrace
            </span>
            <span className="text-slate-600 font-mono text-xs hidden sm:inline">|</span>
            <span className="text-[11px] font-mono uppercase tracking-widest text-slate-300 font-semibold hidden sm:flex items-center space-x-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
              <span>FORENSIC CONTEXT ENGINE</span>
            </span>
          </div>
        </div>

        {/* Center: Live ECG / Telemetry Heartbeat Monitor */}
        <div className="hidden lg:flex items-center space-x-4 text-xs font-mono text-slate-400 bg-[#0B132B]/90 px-4 py-2 rounded-xl border border-[#1E2C54] shadow-inner">
          
          {/* Status Dot with Animated Wave Equalizer */}
          <div className="flex items-center space-x-2.5">
            <span className="relative flex h-2.5 w-2.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
            </span>
            <span className="text-emerald-300 font-bold tracking-wide">ACTIVE</span>

            {/* Animated Equalizer Waveform */}
            <div className="flex items-end space-x-0.5 h-3.5">
              <span className="w-0.5 bg-emerald-400 rounded-full animate-wave-1"></span>
              <span className="w-0.5 bg-cyan-400 rounded-full animate-wave-2"></span>
              <span className="w-0.5 bg-violet-400 rounded-full animate-wave-3"></span>
            </div>
          </div>

          <span className="text-slate-700">|</span>

          {/* Real-time SVG Heartbeat Line */}
          <div className="flex items-center space-x-1.5 text-[11px] text-slate-400">
            <div className="w-16 h-4 flex items-center overflow-hidden">
              <svg className="w-full h-full text-cyan-400 opacity-80" viewBox="0 0 60 16" fill="none">
                <path
                  d="M0 8 H15 L18 2 L22 14 L26 5 L30 11 L33 8 H60"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="animate-pulse"
                />
              </svg>
            </div>
            <span className="text-slate-300 text-[10px]">PULSE 99.8%</span>
          </div>

          <span className="text-slate-700">|</span>

          {/* Database Counter Badge */}
          <div className="flex items-center space-x-1.5">
            <Database className="w-3.5 h-3.5 text-cyan-400 animate-pulse" />
            <span className="text-slate-400">INDEX:</span>
            <span className="text-cyan-300 font-bold bg-cyan-500/10 px-1.5 py-0.2 rounded border border-cyan-500/30">
              {docCount} DOCS
            </span>
          </div>

        </div>

        {/* Right: Actions with High-Tech Glow */}
        <div className="flex items-center space-x-2.5">
          {onToggleGlobalGraph && (
            <button
              onClick={onToggleGlobalGraph}
              className="px-3 py-1.5 text-xs font-mono text-slate-300 bg-[#0E1630] hover:bg-[#152044] hover:text-white border border-[#1E2C54] hover:border-violet-500/60 rounded-lg flex items-center space-x-1.5 transition-all shadow-xs active:scale-95 group"
              title="Inspect Global Knowledge Graph Topology"
            >
              <Share2 className="w-3.5 h-3.5 text-violet-400 group-hover:rotate-45 transition-transform duration-300" />
              <span className="hidden sm:inline">Topology</span>
            </button>
          )}

          <button
            onClick={onOpenDocLibrary}
            className="px-3 py-1.5 text-xs font-mono text-slate-300 bg-[#0E1630] hover:bg-[#152044] hover:text-white border border-[#1E2C54] hover:border-cyan-500/60 rounded-lg flex items-center space-x-1.5 transition-all shadow-xs active:scale-95"
            title="Inspect Ingested Documents"
          >
            <FileText className="w-3.5 h-3.5 text-cyan-400" />
            <span>Archive ({docCount})</span>
          </button>

          <button
            onClick={onSeedDemo}
            disabled={isSeeding}
            className="btn-shimmer px-3.5 py-1.5 text-xs font-mono font-bold text-amber-300 bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/40 hover:border-amber-400 rounded-lg flex items-center space-x-1.5 transition-all shadow-lg shadow-amber-500/10 disabled:opacity-50 active:scale-95"
            title="Load realistic sample historical records (RFC-204, Slack Emergency, Retro #88)"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isSeeding ? 'animate-spin text-amber-400' : 'text-amber-400'}`} />
            <span>{isSeeding ? 'Seeding Scenario...' : 'Load Meridian Demo'}</span>
          </button>

          <button
            onClick={onOpenIngest}
            className="btn-shimmer px-4 py-1.5 text-xs font-mono font-bold text-slate-950 bg-gradient-to-r from-cyan-400 via-cyan-300 to-violet-400 hover:from-cyan-300 hover:to-violet-300 rounded-lg flex items-center space-x-1.5 transition-all shadow-xl shadow-cyan-500/25 active:scale-95 hover:shadow-cyan-400/40"
          >
            <UploadCloud className="w-4 h-4 text-slate-950" />
            <span>Ingest Artifact</span>
          </button>
        </div>

      </div>
    </header>
  );
}
