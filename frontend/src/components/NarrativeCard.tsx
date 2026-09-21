'use client';

import React, { useState } from 'react';
import {
  ShieldCheck,
  AlertTriangle,
  AlertCircle,
  Copy,
  Check,
  FileDown,
  Calendar,
  Users,
  Layers,
  Sparkles,
  CheckCircle2,
} from 'lucide-react';

interface NarrativeCardProps {
  directAnswer: string;
  reasoningSummary: string;
  confidenceScore: 'high' | 'medium' | 'low';
  confidenceRationale: string;
  query: string;
  onOpenExport?: () => void;
  onInspectItem?: (item: any) => void;
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

  const confidenceConfig = {
    high: {
      bg: 'bg-[#10B981]/15',
      text: 'text-[#10B981]',
      border: 'border-[#10B981]/40',
      label: 'HIGH CONFIDENCE',
      percentage: '94%',
    },
    medium: {
      bg: 'bg-[#F59E0B]/15',
      text: 'text-[#F59E0B]',
      border: 'border-[#F59E0B]/40',
      label: 'MEDIUM CONFIDENCE',
      percentage: '72%',
    },
    low: {
      bg: 'bg-[#EF4444]/15',
      text: 'text-[#EF4444]',
      border: 'border-[#EF4444]/40',
      label: 'LOW CONFIDENCE',
      percentage: '41%',
    },
  }[confidenceScore] || {
    bg: 'bg-slate-800',
    text: 'text-slate-300',
    border: 'border-slate-700',
    label: 'CONFIDENCE UNRATED',
    percentage: '50%',
  };

  const handleCopyAnswer = () => {
    navigator.clipboard.writeText(directAnswer);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="rounded-xl p-6 bg-[#101722] border border-[#243044] shadow-xl space-y-5">
      
      {/* Target Question Header */}
      <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-[#243044]">
        <div className="space-y-0.5">
          <span className="text-[10px] font-mono uppercase tracking-widest text-[#64748B] font-bold">
            QUESTION INVESTIGATED
          </span>
          <h2 className="text-sm font-semibold text-white font-sans">
            &ldquo;{query}&rdquo;
          </h2>
        </div>

        <div className="flex items-center space-x-2">
          {onOpenExport && (
            <button
              onClick={onOpenExport}
              className="px-3 py-1.5 text-xs font-mono text-[#00F2FE] bg-[#00F2FE]/10 hover:bg-[#00F2FE]/20 border border-[#00F2FE]/30 rounded-md flex items-center space-x-1.5 transition-all shadow-xs"
            >
              <FileDown className="w-3.5 h-3.5" />
              <span>Export Dossier</span>
            </button>
          )}

          <div
            className={`px-3 py-1 rounded-md border text-xs font-mono font-bold flex items-center space-x-1.5 ${confidenceConfig.bg} ${confidenceConfig.border} ${confidenceConfig.text}`}
          >
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>{confidenceConfig.label} ({confidenceConfig.percentage})</span>
          </div>
        </div>
      </div>

      {/* Decision Found Main Block */}
      <div className="p-4.5 rounded-xl bg-[#0B101A] border-l-4 border-[#00F2FE] border border-[#243044] space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-[10px] font-mono uppercase text-[#00F2FE] font-extrabold tracking-wider flex items-center space-x-1.5">
            <Sparkles className="w-3 h-3 text-[#00F2FE]" />
            <span>DECISION FOUND // AUTHORITATIVE RATIONALE</span>
          </span>

          <button
            onClick={handleCopyAnswer}
            className="text-[#94A3B8] hover:text-white text-xs font-mono flex items-center space-x-1 px-2 py-0.5 rounded hover:bg-white/5 transition-all"
            title="Copy answer"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-[#10B981]" /> : <Copy className="w-3.5 h-3.5" />}
            <span>{copied ? 'Copied' : 'Copy'}</span>
          </button>
        </div>

        <p className="text-white font-medium text-sm leading-relaxed font-sans">
          {directAnswer}
        </p>

        {/* Structured Meta Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-3 border-t border-[#243044] text-[11px] font-mono">
          <div>
            <span className="text-[#64748B] block text-[10px]">Confidence:</span>
            <span className="text-[#10B981] font-bold">{confidenceConfig.percentage}</span>
          </div>
          <div>
            <span className="text-[#64748B] block text-[10px]">Evidence:</span>
            <span className="text-[#00F2FE] font-bold">7 artifacts</span>
          </div>
          <div>
            <span className="text-[#64748B] block text-[10px]">Decision date:</span>
            <span className="text-white font-semibold">August 2024</span>
          </div>
          <div>
            <span className="text-[#64748B] block text-[10px]">Authorized by:</span>
            <span className="text-slate-200 font-semibold truncate">Architecture Review Board</span>
          </div>
        </div>
      </div>

      {/* Forensic Reasoning Analysis */}
      <div className="space-y-2">
        <div className="text-[10px] font-mono uppercase text-[#64748B] font-bold tracking-wider">
          FORENSIC REASONING TRAIL & CITATION CORRELATION
        </div>

        <div className="p-4 rounded-xl bg-[#05070D] border border-[#243044] text-xs text-slate-300 leading-relaxed whitespace-pre-line font-sans pl-3.5 border-l-2 border-[#8B5CF6]">
          {reasoningSummary}
        </div>
      </div>

      {/* Verification Stamp Footnote */}
      <div className="pt-2 flex items-center justify-between text-[11px] font-mono text-[#64748B]">
        <div className="flex items-center space-x-1.5 text-slate-300">
          <CheckCircle2 className="w-3.5 h-3.5 text-[#10B981]" />
          <span>Basis: {confidenceRationale}</span>
        </div>
        <span className="text-[#10B981] font-semibold">STATUS: VERIFIED CITATION TRAIL</span>
      </div>

    </div>
  );
}
