'use client';

import React, { useState, useEffect } from 'react';
import { 
  Compass, 
  Database, 
  Sparkles, 
  Plus, 
  RotateCw, 
  FolderGit2, 
  Sun, 
  Moon, 
  Clock,
  Layers
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
        if (mounted) {
          setIsOffline(true);
        }
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

  return (
    <header className="sticky top-0 z-40 w-full border-b border-slate-200/80 dark:border-slate-800/80 bg-white/85 dark:bg-[#090D16]/85 backdrop-blur-md transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-15 flex items-center justify-between gap-4">
        
        {/* Left: Brand Identity */}
        <div className="flex items-center space-x-3 shrink-0">
          <div className="w-8 h-8 rounded-lg bg-indigo-600 dark:bg-indigo-500 text-white flex items-center justify-center shadow-xs">
            <Compass className="w-4.5 h-4.5 text-white" />
          </div>
          <div className="flex items-baseline space-x-2">
            <span className="font-semibold text-slate-900 dark:text-white tracking-tight text-base">
              ReTrace
            </span>
            <span className="text-[11px] font-medium px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700 hidden sm:inline-block">
              Context Recovery
            </span>
          </div>
        </div>

        {/* Center: System & Storage Status */}
        <div className="hidden lg:flex items-center space-x-3 text-xs text-slate-600 dark:text-slate-300 bg-slate-50 dark:bg-slate-900/60 px-3 py-1.5 rounded-lg border border-slate-200/80 dark:border-slate-800/80">
          <div className="flex items-center space-x-1.5" title={isOffline ? "Backend API unreachable" : "Backend service connected"}>
            <span className={`w-2 h-2 rounded-full ${isOffline ? 'bg-rose-500' : 'bg-emerald-500 animate-pulse'}`}></span>
            <span className={`font-medium ${isOffline ? 'text-rose-600 dark:text-rose-400' : 'text-slate-700 dark:text-slate-200'}`}>
              {isOffline ? 'Offline' : 'System Connected'}
            </span>
          </div>
          <span className="text-slate-300 dark:text-slate-700">|</span>
          <div className="flex items-center space-x-1.5" title={`Database storage engine: ${dbMode}`}>
            <Database className="w-3.5 h-3.5 text-slate-400" />
            <span>{docCount} docs ({dbMode})</span>
          </div>
          <span className="text-slate-300 dark:text-slate-700">|</span>
          <div className="flex items-center space-x-1.5" title={isGeminiReady ? "Gemini Reasoning Model Connected" : "Operating in fallback mode"}>
            <Sparkles className={`w-3.5 h-3.5 ${isGeminiReady ? 'text-indigo-500 dark:text-indigo-400' : 'text-slate-400'}`} />
            <span className="font-medium text-slate-700 dark:text-slate-300">
              {isGeminiReady ? 'Gemini 1.5 Pro' : (isOffline ? 'Disconnected' : 'Demo Mode')}
            </span>
          </div>
        </div>

        {/* Right: Actions */}
        <div className="flex items-center space-x-2 shrink-0">
          
          {/* History */}
          <button
            onClick={onOpenHistory}
            className="px-2.5 py-1.5 text-xs font-medium text-slate-700 dark:text-slate-200 bg-white dark:bg-slate-900 hover:bg-slate-50 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-800 rounded-lg flex items-center space-x-1.5 transition-colors shadow-2xs"
            title="View query history"
          >
            <Clock className="w-3.5 h-3.5 text-slate-400 dark:text-slate-500" />
            <span className="hidden sm:inline">History</span>
            {historyCount > 0 && (
              <span className="px-1.5 py-0.2 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 text-[10px] font-semibold">
                {historyCount}
              </span>
            )}
          </button>

          {/* Documents Archive */}
          <button
            onClick={onOpenDocLibrary}
            className="px-2.5 sm:px-3 py-1.5 text-xs font-medium text-slate-700 dark:text-slate-200 bg-white dark:bg-slate-900 hover:bg-slate-50 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-800 rounded-lg flex items-center space-x-1.5 transition-colors shadow-2xs"
            title="Inspect ingested source artifacts"
          >
            <FolderGit2 className="w-3.5 h-3.5 text-slate-400 dark:text-slate-500" />
            <span>Archive</span>
            <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 font-semibold">
              {docCount}
            </span>
          </button>

          {/* Seed Demo Scenario */}
          <button
            onClick={onSeedDemo}
            disabled={isSeeding}
            className="hidden sm:flex px-3 py-1.5 text-xs font-medium text-indigo-700 dark:text-indigo-300 bg-indigo-50 dark:bg-indigo-950/60 hover:bg-indigo-100 dark:hover:bg-indigo-900/60 border border-indigo-200 dark:border-indigo-800/80 rounded-lg items-center space-x-1.5 transition-colors shadow-2xs"
            title="Load sample architectural pivot scenario"
          >
            <RotateCw className={`w-3.5 h-3.5 ${isSeeding ? 'animate-spin text-indigo-600' : 'text-indigo-500'}`} />
            <span>{isSeeding ? 'Loading Scenario...' : 'Load Meridian Scenario'}</span>
          </button>

          {/* Ingest Document Button */}
          <button
            onClick={onOpenIngest}
            className="px-3 py-1.5 text-xs font-medium text-white bg-indigo-600 hover:bg-indigo-500 dark:bg-indigo-600 dark:hover:bg-indigo-500 rounded-lg flex items-center space-x-1.5 transition-all shadow-xs"
          >
            <Plus className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Ingest Artifact</span>
            <span className="sm:hidden">Ingest</span>
          </button>

          {/* Theme Toggle */}
          <button
            onClick={onToggleTheme}
            className="p-1.5 text-slate-600 dark:text-slate-300 bg-white dark:bg-slate-900 hover:bg-slate-50 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-800 rounded-lg transition-colors shadow-2xs"
            title={isDarkMode ? "Switch to Light theme" : "Switch to Dark theme"}
            aria-label="Toggle theme"
          >
            {isDarkMode ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-slate-600" />}
          </button>

        </div>

      </div>
    </header>
  );
}
