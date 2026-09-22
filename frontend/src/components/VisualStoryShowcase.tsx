'use client';

import React, { useState } from 'react';
import {
  FileText,
  MessageSquare,
  AlertOctagon,
  GitBranch,
  Layers,
  Code,
  Sparkles,
  CheckCircle2,
  RotateCcw,
} from 'lucide-react';

const SCATTERED_PIECES = [
  { id: 1, title: 'Architecture', label: 'ADR-042 Review', icon: FileText, color: 'text-sky-400 bg-sky-500/10' },
  { id: 2, title: 'Incident', label: 'Postmortem #88', icon: AlertOctagon, color: 'text-rose-400 bg-rose-500/10' },
  { id: 3, title: 'Deployment', label: 'RDS Scaling Manifest', icon: GitBranch, color: 'text-indigo-400 bg-indigo-500/10' },
  { id: 4, title: 'Slack', label: '#arch-council Chat', icon: MessageSquare, color: 'text-amber-400 bg-amber-500/10' },
  { id: 5, title: 'Documents', label: 'RFC-204 Migration', icon: Layers, color: 'text-purple-400 bg-purple-500/10' },
  { id: 6, title: 'Code', label: 'PR #409: pgvector', icon: Code, color: 'text-emerald-400 bg-emerald-500/10' },
];

export default function VisualStoryShowcase() {
  const [converged, setConverged] = useState(true);

  return (
    <section className="py-24 bg-[#05070D] border-t border-[#1E293B] relative overflow-hidden">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
        
        {/* Section Heading */}
        <div className="text-center space-y-3">
          <div className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full bg-sky-500/10 text-sky-400 text-xs font-mono font-medium border border-sky-500/20">
            <Sparkles className="w-3.5 h-3.5" />
            <span>SPECIAL CONVERGENCE</span>
          </div>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-white tracking-tight">
            Scattered information.
            <br />
            One clear story.
          </h2>
          <p className="text-base sm:text-lg text-slate-400 max-w-md mx-auto">
            Witness how ReTrace gathers fragmented engineering pieces into a single verified truth.
          </p>

          <button
            type="button"
            onClick={() => setConverged(!converged)}
            className="mt-3 px-4 py-2 rounded-xl text-xs font-mono font-bold bg-[#0E1626] hover:bg-[#141F36] text-sky-400 border border-[#1E293B] hover:border-sky-500/40 transition-all inline-flex items-center space-x-2 cursor-pointer shadow-sm"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>{converged ? 'Scatter Sources' : 'Replay Convergence'}</span>
          </button>
        </div>

        {/* Convergence Interactive Stage */}
        <div className="rounded-3xl bg-[#0E1626] border border-[#1E293B] p-6 sm:p-12 shadow-2xl relative min-h-[440px] flex flex-col items-center justify-center space-y-8">
          
          {/* Top: 6 Scattered Pieces */}
          <div className="w-full flex flex-wrap items-center justify-center gap-3 transition-all duration-700">
            {SCATTERED_PIECES.map((piece) => {
              const Icon = piece.icon;
              return (
                <div
                  key={piece.id}
                  className={`p-3 rounded-2xl bg-[#141F36] border border-[#1E293B] shadow-lg flex items-center space-x-2.5 transition-all duration-700 ${
                    converged ? 'scale-95 opacity-85 border-sky-500/30' : 'scale-105 border-slate-700 animate-float-slow-1'
                  }`}
                >
                  <div className={`p-2 rounded-xl ${piece.color}`}>
                    <Icon className="w-4 h-4" />
                  </div>
                  <div>
                    <span className="text-[9px] font-mono text-slate-400 uppercase font-bold block">
                      {piece.title}
                    </span>
                    <p className="text-xs font-bold text-white max-w-[150px] truncate">
                      {piece.label}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Center Connector: ReTrace Core */}
          <div className="flex flex-col items-center space-y-2">
            <div className="w-0.5 h-8 bg-gradient-to-b from-sky-400 to-indigo-500 animate-pulse" />
            <div className="px-5 py-2 rounded-2xl bg-gradient-to-r from-sky-400 to-indigo-500 text-slate-950 font-mono font-bold text-xs sm:text-sm shadow-xl shadow-sky-500/20 flex items-center space-x-2">
              <Sparkles className="w-4 h-4 text-slate-950" />
              <span>RETRACE</span>
            </div>
            <div className="w-0.5 h-8 bg-gradient-to-b from-indigo-500 to-emerald-400 animate-pulse" />
          </div>

          {/* Bottom: Decision Context Card with WHY, WHO, WHEN, EVIDENCE */}
          <div
            className={`w-full max-w-xl rounded-2xl p-6 transition-all duration-700 ${
              converged
                ? 'bg-gradient-to-br from-emerald-500/10 via-[#141F36] to-[#0E1626] border border-emerald-500/50 shadow-2xl scale-100 opacity-100'
                : 'opacity-40 scale-95 border-slate-800'
            }`}
          >
            <div className="flex items-center justify-between pb-3 mb-3 border-b border-[#1E293B]">
              <div className="flex items-center space-x-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                <span className="text-xs font-mono text-emerald-400 font-bold uppercase tracking-wider">
                  Decision Context
                </span>
              </div>
              <span className="text-[10px] font-mono text-slate-400">
                March 14, 2025
              </span>
            </div>

            <h4 className="text-base sm:text-lg font-bold text-white leading-snug">
              PostgreSQL Migration Approved
            </h4>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-4 text-center text-[10px] font-mono">
              <div className="p-2 rounded-xl bg-sky-500/10 text-sky-400 border border-sky-500/20">
                <span className="block font-bold">WHY</span>
                <span className="text-slate-300">Scalability & ACID</span>
              </div>
              <div className="p-2 rounded-xl bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
                <span className="block font-bold">WHO</span>
                <span className="text-slate-300">Architecture Team</span>
              </div>
              <div className="p-2 rounded-xl bg-amber-500/10 text-amber-400 border border-amber-500/20">
                <span className="block font-bold">WHEN</span>
                <span className="text-slate-300">March 14, 2025</span>
              </div>
              <div className="p-2 rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                <span className="block font-bold">EVIDENCE</span>
                <span className="text-slate-300">3 Verified Sources</span>
              </div>
            </div>
          </div>

        </div>

      </div>
    </section>
  );
}
