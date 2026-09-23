'use client';

import React from 'react';
import { Compass, Database, Sparkles, UploadCloud, RefreshCw, FileText, Wifi, WifiOff, Sun, Moon } from 'lucide-react';
import { useTheme } from '@/components/ThemeProvider';

interface NavbarProps {
  onOpenIngest: () => void;
  onSeedDemo: () => void;
  onOpenDocLibrary: () => void;
  isSeeding: boolean;
  docCount: number;
  isOnline?: boolean;
}

export default function Navbar({
  onOpenIngest,
  onSeedDemo,
  onOpenDocLibrary,
  isSeeding,
  docCount,
  isOnline = true,
}: NavbarProps) {
  const { isDark, toggleTheme } = useTheme();

  return (
    <header
      className="border-b sticky top-0 z-40 backdrop-blur-md"
      style={{
        borderColor: 'var(--border-blueprint)',
        backgroundColor: 'var(--nav-bg)',
      }}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-3">

        {/* Left: Logo */}
        <div className="flex items-center space-x-3 shrink-0">
          <div className="w-9 h-9 rounded bg-[#1E293B] flex items-center justify-center shadow-sm border border-stone-800">
            <Compass className="w-5 h-5 text-amber-400" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <span className="font-bold tracking-tight text-lg" style={{ color: 'var(--ink-primary)' }}>ReTrace</span>
              <span className="hidden sm:inline text-[10px] font-mono uppercase px-1.5 py-0.5 rounded bg-amber-100 text-amber-800 border border-amber-300 font-semibold">
                v0.1 // FORENSIC
              </span>
            </div>
            <p className="hidden md:block text-[11px] font-mono uppercase tracking-widest" style={{ color: 'var(--ink-secondary)' }}>
              Lost Context Recovery Engine
            </p>
          </div>
        </div>

        {/* Middle: Status Stamp */}
        <div
          className="hidden md:flex items-center space-x-4 text-xs font-mono px-3 py-1.5 rounded border"
          style={{
            color: 'var(--ink-secondary)',
            backgroundColor: isDark ? 'rgba(15,28,46,0.8)' : 'rgba(255,255,255,0.7)',
            borderColor: 'var(--border-blueprint)',
          }}
        >
          <div className="flex items-center space-x-1.5">
            <span className={`w-2 h-2 rounded-full ${isOnline ? 'bg-emerald-500 animate-pulse' : 'bg-amber-400'}`} />
            <span>{isOnline ? 'GRID: ACTIVE' : 'LOCAL MODE'}</span>
          </div>
          <span style={{ color: 'var(--border-blueprint)' }}>|</span>
          <div className="flex items-center space-x-1">
            <Database className="w-3.5 h-3.5" style={{ color: 'var(--ink-secondary)' }} />
            <span>DOCS: {docCount}</span>
          </div>
          <span style={{ color: 'var(--border-blueprint)' }}>|</span>
          <div className="flex items-center space-x-1">
            {isOnline ? (
              <>
                <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                <span>GEMINI: READY</span>
              </>
            ) : (
              <>
                <WifiOff className="w-3.5 h-3.5 text-amber-500" />
                <span>OFFLINE</span>
              </>
            )}
          </div>
        </div>

        {/* Right: Actions */}
        <div className="flex items-center gap-2 shrink-0">
          {/* Theme Toggle */}
          <button
            onClick={toggleTheme}
            className="p-2 rounded border transition-all shadow-xs flex items-center justify-center"
            style={{
              borderColor: 'var(--border-blueprint)',
              backgroundColor: isDark ? '#0F1C2E' : '#FFFFFF',
              color: isDark ? '#FBBF24' : '#475569',
            }}
            title={isDark ? 'Switch to Day Mode' : 'Switch to Night Mode'}
            aria-label={isDark ? 'Switch to Day Mode' : 'Switch to Night Mode'}
          >
            {isDark ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
          </button>

          {/* Documents */}
          <button
            onClick={onOpenDocLibrary}
            className="px-3 py-1.5 text-xs font-mono border rounded flex items-center space-x-1.5 transition-colors shadow-xs"
            style={{
              borderColor: 'var(--border-blueprint)',
              backgroundColor: isDark ? '#0F1C2E' : '#FFFFFF',
              color: 'var(--ink-secondary)',
            }}
            title="Inspect Ingested Documents"
          >
            <FileText className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Documents ({docCount})</span>
            <span className="sm:hidden">{docCount}</span>
          </button>

          {/* Demo Seed */}
          <button
            onClick={onSeedDemo}
            disabled={isSeeding}
            className="hidden md:flex px-3 py-1.5 text-xs font-mono text-amber-800 bg-amber-50 hover:bg-amber-100 border border-amber-200 rounded items-center space-x-1.5 transition-colors shadow-xs"
            title="Load Project Phoenix sample decision archive"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isSeeding ? 'animate-spin text-amber-600' : 'text-amber-500'}`} />
            <span>{isSeeding ? 'Seeding...' : 'Load Demo'}</span>
          </button>

          {/* Ingest */}
          <button
            onClick={onOpenIngest}
            className="px-3.5 py-1.5 text-xs font-mono font-medium text-white bg-[#1E293B] hover:bg-stone-800 rounded flex items-center space-x-1.5 transition-colors shadow-xs"
          >
            <UploadCloud className="w-3.5 h-3.5 text-amber-300" />
            <span className="hidden sm:inline">Ingest Document</span>
            <span className="sm:hidden">Ingest</span>
          </button>
        </div>

      </div>
    </header>
  );
}
