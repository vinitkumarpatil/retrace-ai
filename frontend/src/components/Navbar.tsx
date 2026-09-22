'use client';

import React from 'react';
import { Radar, Database, Sparkles, UploadCloud, RefreshCw, FileStack } from 'lucide-react';

interface NavbarProps {
  onOpenIngest: () => void;
  onSeedDemo: () => void;
  onOpenDocLibrary: () => void;
  isSeeding: boolean;
  docCount: number;
}

export default function Navbar({
  onOpenIngest,
  onSeedDemo,
  onOpenDocLibrary,
  isSeeding,
  docCount,
}: NavbarProps) {
  return (
    <header className="sticky top-0 z-40 border-b border-console-border bg-console-bg/80 backdrop-blur-xl">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">

        {/* Brand */}
        <div className="flex items-center gap-3">
          <div className="relative w-9 h-9 rounded-lg bg-gradient-to-br from-console-s3 to-console-s1 border border-console-border flex items-center justify-center glow-cyan">
            <Radar className="w-5 h-5 text-console-cyan" />
          </div>
          <div className="leading-tight">
            <div className="flex items-center gap-2">
              <span className="text-lg font-semibold tracking-tight text-white">ReTrace</span>
              <span className="text-[9px] font-mono uppercase px-1.5 py-0.5 rounded bg-console-cyan/10 text-console-cyan border border-console-cyan/25 tracking-widest">
                v0.1
              </span>
            </div>
            <p className="text-[10px] font-mono text-console-mute uppercase tracking-[0.2em]">
              Context Recovery Engine
            </p>
          </div>
        </div>

        {/* Status strip */}
        <div className="hidden md:flex items-center gap-3 text-[11px] font-mono text-console-dim inset-tile px-3 py-1.5">
          <span className="flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-console-emerald pulse-dot" />
            ONLINE
          </span>
          <span className="text-console-border">/</span>
          <span className="flex items-center gap-1.5">
            <Database className="w-3.5 h-3.5 text-console-mute" />
            {docCount} DOCS
          </span>
          <span className="text-console-border">/</span>
          <span className="flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 text-console-violet" />
            GEMINI
          </span>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-2">
          <button
            onClick={onOpenDocLibrary}
            className="px-3 py-1.5 text-xs font-medium text-console-dim hover:text-white bg-console-s2 hover:bg-console-s3 border border-console-border rounded-lg flex items-center gap-1.5 transition-colors"
            title="Inspect ingested documents"
          >
            <FileStack className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Documents</span>
            <span className="text-console-mute">{docCount}</span>
          </button>

          <button
            onClick={onSeedDemo}
            disabled={isSeeding}
            className="px-3 py-1.5 text-xs font-medium text-console-violet hover:text-white bg-console-violet/10 hover:bg-console-violet/20 border border-console-violet/25 rounded-lg flex items-center gap-1.5 transition-colors disabled:opacity-60"
            title="Load Project Meridian sample archive"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isSeeding ? 'animate-spin' : ''}`} />
            <span className="hidden sm:inline">{isSeeding ? 'Seeding…' : 'Demo'}</span>
          </button>

          <button
            onClick={onOpenIngest}
            className="px-3.5 py-1.5 text-xs font-semibold text-console-bg bg-console-cyan hover:bg-white rounded-lg flex items-center gap-1.5 transition-colors"
          >
            <UploadCloud className="w-3.5 h-3.5" />
            <span>Ingest</span>
          </button>
        </div>

      </div>
    </header>
  );
}
