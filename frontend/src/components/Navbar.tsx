'use client';

import React, { useState, useEffect } from 'react';
import {
  Database,
  Plus,
  RotateCw,
  FolderOpen,
  Sun,
  Moon,
  Clock,
} from 'lucide-react';
import { checkHealth } from '@/lib/api';
import { SystemHealth } from '@/lib/types';

interface NavbarProps {
  onOpenIngest: () => void;
  onSeedDemo: () => void;
  onOpenDocLibrary: () => void;
  onOpenHistory: () => void;
  onToggleTheme: () => void;
  isDarkMode: boolean;
  isSeeding: boolean;
  docCount: number;
  historyCount: number;
}

export default function Navbar({
  onOpenIngest,
  onSeedDemo,
  onOpenDocLibrary,
  onOpenHistory,
  onToggleTheme,
  isDarkMode,
  isSeeding,
  docCount,
  historyCount,
}: NavbarProps) {
  const [health, setHealth] = useState<SystemHealth | null>(null);
  const [isOffline, setIsOffline] = useState(false);

  useEffect(() => {
    let mounted = true;
    const fetchHealth = async () => {
      try {
        const data = await checkHealth();
        if (mounted) {
          setHealth(data);
          setIsOffline(false);
        }
      } catch {
        if (mounted) setIsOffline(true);
      }
    };
    fetchHealth();
    const interval = setInterval(fetchHealth, 25000);
    return () => {
      mounted = false;
      clearInterval(interval);
    };
  }, []);

  const isGeminiReady = health?.services.gemini.configured ?? false;
  const dbMode = health?.services.database.mode
    ? (health.services.database.pgvector_ready ? 'pgvector' : 'sqlite')
    : 'local';

  const btn =
    'inline-flex items-center gap-1.5 px-2.5 py-1.5 text-[13px] font-medium text-ink-soft ' +
    'border border-rule rounded-sheet bg-sheet hover:bg-paper hover:border-rule-strong ' +
    'hover:text-ink transition-colors';

  return (
    <header className="sticky top-0 z-40 w-full border-b border-rule-strong bg-paper/90 backdrop-blur-md">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">

        {/* Masthead */}
        <div className="flex items-center gap-3 shrink-0">
          <div className="grid place-items-center w-9 h-9 rounded-sheet border border-stamp/60 bg-stamp/5">
            {/* Registered mark — a filing seal, not a generic app glyph */}
            <span className="font-mono text-stamp text-[15px] font-semibold leading-none tracking-tight">R</span>
          </div>
          <div className="leading-none">
            <div className="font-serif text-[19px] font-semibold text-ink tracking-tight">
              ReTrace
            </div>
            <div className="catalog mt-1 hidden sm:block">context recovery archive</div>
          </div>
        </div>

        {/* Records status strip */}
        <div className="hidden lg:flex items-center gap-4 text-[12px] px-3.5 py-2 rounded-sheet border border-rule bg-sheet/70">
          <span className="flex items-center gap-1.5" title={isOffline ? 'Backend unreachable' : 'Backend connected'}>
            <span className={`w-1.5 h-1.5 rounded-full ${isOffline ? 'bg-stamp' : 'bg-verified'}`} />
            <span className={isOffline ? 'text-stamp font-medium' : 'text-ink-soft'}>
              {isOffline ? 'Offline' : 'Connected'}
            </span>
          </span>
          <span className="w-px h-3.5 bg-rule-strong" />
          <span className="flex items-center gap-1.5 text-ink-soft" title={`Storage: ${dbMode}`}>
            <Database className="w-3.5 h-3.5 text-ink-faint" />
            <span className="font-mono text-[11px]">{docCount} docs · {dbMode}</span>
          </span>
          <span className="w-px h-3.5 bg-rule-strong" />
          <span className="flex items-center gap-1.5 text-ink-soft" title={isGeminiReady ? 'Reasoning model connected' : 'Fallback mode'}>
            <span className={`w-1.5 h-1.5 rounded-full ${isGeminiReady ? 'bg-verified' : 'bg-caution'}`} />
            <span className="font-mono text-[11px]">{isGeminiReady ? 'Gemini live' : (isOffline ? 'no model' : 'demo mode')}</span>
          </span>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-2 shrink-0">
          <button onClick={onOpenHistory} className={btn} title="Recent inquiries">
            <Clock className="w-3.5 h-3.5 text-ink-faint" />
            <span className="hidden sm:inline">History</span>
            {historyCount > 0 && (
              <span className="font-mono text-[10px] text-ink-faint">({historyCount})</span>
            )}
          </button>

          <button onClick={onOpenDocLibrary} className={btn} title="Browse indexed documents">
            <FolderOpen className="w-3.5 h-3.5 text-ink-faint" />
            <span className="hidden sm:inline">Files</span>
            <span className="font-mono text-[10px] text-ink-faint">({docCount})</span>
          </button>

          <button
            onClick={onSeedDemo}
            disabled={isSeeding}
            className="hidden sm:inline-flex items-center gap-1.5 px-2.5 py-1.5 text-[13px] font-medium text-ink-soft border border-dashed border-rule-strong rounded-sheet bg-transparent hover:bg-sheet hover:text-ink transition-colors disabled:opacity-60"
            title="Load the sample Meridian case"
          >
            <RotateCw className={`w-3.5 h-3.5 ${isSeeding ? 'animate-spin text-stamp' : 'text-ink-faint'}`} />
            <span>{isSeeding ? 'Loading…' : 'Load sample case'}</span>
          </button>

          <button
            onClick={onOpenIngest}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-[13px] font-semibold text-paper bg-ink hover:bg-ink/85 rounded-sheet transition-colors"
          >
            <Plus className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Add document</span>
            <span className="sm:hidden">Add</span>
          </button>

          <button
            onClick={onToggleTheme}
            className="grid place-items-center w-9 h-9 text-ink-soft border border-rule rounded-sheet bg-sheet hover:bg-paper hover:text-ink transition-colors"
            title={isDarkMode ? 'Switch to light' : 'Switch to dark'}
            aria-label="Toggle theme"
          >
            {isDarkMode ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
          </button>
        </div>
      </div>
    </header>
  );
}
