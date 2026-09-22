'use client';

import React from 'react';
import { Compass, Database, Sparkles, UploadCloud, RefreshCw, FileText, HardDrive } from 'lucide-react';

interface NavbarProps {
  onOpenIngest: () => void;
  onOpenLocalStorage: () => void;
  onSeedDemo: () => void;
  onOpenDocLibrary: () => void;
  isSeeding: boolean;
  docCount: number;
}

export default function Navbar({
  onOpenIngest,
  onOpenLocalStorage,
  onSeedDemo,
  onOpenDocLibrary,
  isSeeding,
  docCount,
}: NavbarProps) {
  return (
    <header className="border-b border-[#E2DDD5] bg-[#FAF8F5]/90 backdrop-blur-md sticky top-0 z-40">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        
        {/* Left: Blueprint Title & Spec Marker */}
        <div className="flex items-center space-x-3">
          <div className="w-9 h-9 rounded bg-[#1E293B] text-[#FAF8F5] flex items-center justify-center font-mono font-bold text-lg shadow-sm border border-stone-800">
            <Compass className="w-5 h-5 text-amber-400" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <span className="font-bold text-stone-900 tracking-tight text-lg">ReTrace</span>
              <span className="text-[10px] font-mono uppercase px-1.5 py-0.5 rounded bg-amber-100 text-amber-800 border border-amber-300 font-semibold">
                v0.1 // FORENSIC
              </span>
            </div>
            <p className="text-[11px] font-mono text-stone-500 uppercase tracking-widest">
              Lost Context Recovery Engine
            </p>
          </div>
        </div>

        {/* Middle: Technical Coordinate / Status Stamp */}
        <div className="hidden md:flex items-center space-x-4 text-xs font-mono text-stone-600 bg-white/70 px-3 py-1.5 rounded border border-[#E2DDD5]">
          <div className="flex items-center space-x-1.5">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
            <span>GRID: ACTIVE</span>
          </div>
          <span className="text-stone-300">|</span>
          <div className="flex items-center space-x-1">
            <Database className="w-3.5 h-3.5 text-stone-400" />
            <span>DOCS: {docCount}</span>
          </div>
          <span className="text-stone-300">|</span>
          <div className="flex items-center space-x-1">
            <Sparkles className="w-3.5 h-3.5 text-amber-500" />
            <span>GEMINI: READY</span>
          </div>
        </div>

        {/* Right: Actions */}
        <div className="flex items-center space-x-2">
          <button
            onClick={onOpenDocLibrary}
            className="px-3 py-1.5 text-xs font-mono text-stone-700 bg-white hover:bg-stone-50 border border-[#E2DDD5] rounded flex items-center space-x-1.5 transition-colors shadow-xs"
            title="Inspect Ingested Documents"
          >
            <FileText className="w-3.5 h-3.5 text-stone-500" />
            <span className="hidden sm:inline">Documents</span>
            <span>({docCount})</span>
          </button>

          <button
            onClick={onSeedDemo}
            disabled={isSeeding}
            className="px-3 py-1.5 text-xs font-mono text-amber-800 bg-amber-50 hover:bg-amber-100 border border-amber-200 rounded flex items-center space-x-1.5 transition-colors shadow-xs"
            title="Load Project Meridian sample decision archive"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isSeeding ? 'animate-spin text-amber-600' : 'text-amber-500'}`} />
            <span className="hidden sm:inline">{isSeeding ? 'Seeding...' : 'Load Meridian Demo'}</span>
            <span className="sm:hidden">Demo</span>
          </button>

          {/* Connect Local Storage Button */}
          <button
            onClick={onOpenLocalStorage}
            className="px-3 py-1.5 text-xs font-mono font-medium text-stone-800 bg-white hover:bg-amber-50/70 border border-amber-300 hover:border-amber-400 rounded flex items-center space-x-1.5 transition-colors shadow-xs"
            title="Connect local folder via File System Access API"
          >
            <HardDrive className="w-3.5 h-3.5 text-amber-600" />
            <span>Connect Local Storage</span>
          </button>

          <button
            onClick={onOpenIngest}
            className="px-3.5 py-1.5 text-xs font-mono font-medium text-white bg-[#1E293B] hover:bg-stone-800 rounded flex items-center space-x-1.5 transition-colors shadow-xs"
          >
            <UploadCloud className="w-3.5 h-3.5 text-amber-300" />
            <span>Ingest</span>
          </button>
        </div>

      </div>
    </header>
  );
}
