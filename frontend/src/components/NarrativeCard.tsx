'use client';

import React, { useState } from 'react';
import { 
  ShieldCheck, 
  AlertTriangle, 
  AlertCircle, 
  FileCheck2, 
  Share2, 
  Copy, 
  Download, 
  Check, 
  Sparkles,
  ChevronRight
} from 'lucide-react';
import { ReconstructionResult } from '@/lib/types';

interface NarrativeCardProps {
  directAnswer: string;
  reasoningSummary: string;
  confidenceScore: 'high' | 'medium' | 'low';
  confidenceRationale: string;
  query: string;
  fullResult?: ReconstructionResult | null;
}

export default function NarrativeCard({
  directAnswer,
  reasoningSummary,
  confidenceScore,
  confidenceRationale,
  query,
  fullResult,
}: NarrativeCardProps) {
  const [copied, setCopied] = useState(false);
  const [showExportMenu, setShowExportMenu] = useState(false);

  // Confidence styling config
  const confidenceConfig = {
    high: {
      bg: 'bg-emerald-50 dark:bg-emerald-950/40',
      text: 'text-emerald-700 dark:text-emerald-300',
      border: 'border-emerald-200 dark:border-emerald-800',
      icon: ShieldCheck,
      label: 'High Confidence',
    },
    medium: {
      bg: 'bg-amber-50 dark:bg-amber-950/40',
      text: 'text-amber-700 dark:text-amber-300',
      border: 'border-amber-200 dark:border-amber-800',
      icon: AlertTriangle,
      label: 'Medium Confidence',
    },
    low: {
      bg: 'bg-rose-50 dark:bg-rose-950/40',
      text: 'text-rose-700 dark:text-rose-300',
      border: 'border-rose-200 dark:border-rose-800',
      icon: AlertCircle,
      label: 'Low Confidence',
    },
  }[confidenceScore] || {
    bg: 'bg-slate-50 dark:bg-slate-900',
    text: 'text-slate-700 dark:text-slate-300',
    border: 'border-slate-200 dark:border-slate-800',
    icon: AlertCircle,
    label: 'Unrated',
  };

  const ConfidenceIcon = confidenceConfig.icon;

  const handleCopyMarkdown = () => {
    let md = `# ReTrace Context Recovery Dossier\n\n`;
    md += `**Target Inquiry:** ${query}\n`;
    md += `**Confidence Rating:** ${confidenceScore.toUpperCase()} — ${confidenceRationale}\n\n`;
    md += `## Executive Summary\n${directAnswer}\n\n`;
    md += `## Reconstructed Forensic Trail\n${reasoningSummary}\n\n`;

    if (fullResult?.missing_context && fullResult.missing_context.length > 0) {
      md += `## Knowledge Gaps & Unrecorded Context\n`;
      fullResult.missing_context.forEach(item => {
        md += `- **[${item.category.replace('_', ' ').toUpperCase()}]** ${item.description}\n  *Impact:* ${item.impact}\n  *Recommended Investigation:* ${item.suggested_investigation}\n`;
      });
      md += `\n`;
    }

    if (fullResult?.timeline && fullResult.timeline.length > 0) {
      md += `## Key Chronological Milestones\n`;
      fullResult.timeline.forEach(event => {
        md += `- **${event.date}**: ${event.title}\n  ${event.description}\n`;
        if (event.decision) md += `  *Decision:* ${event.decision}\n`;
        if (event.actors?.length) md += `  *Key Stakeholders:* ${event.actors.join(', ')}\n`;
      });
      md += `\n`;
    }

    if (fullResult?.citations && fullResult.citations.length > 0) {
      md += `## Source Citations\n`;
      fullResult.citations.forEach(c => {
        md += `- **${c.document_title}** (${c.source_type}): "${c.quote}"\n`;
      });
      md += `\n`;
    }

    navigator.clipboard.writeText(md);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
    setShowExportMenu(false);
  };

  const handleDownloadJSON = () => {
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(fullResult || { query, directAnswer, reasoningSummary, confidenceScore, confidenceRationale }, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute("href", dataStr);
    downloadAnchor.setAttribute("download", `retrace-dossier-${Date.now()}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
    setShowExportMenu(false);
  };

  return (
    <div className="surface-card rounded-xl border border-slate-200 dark:border-slate-800 p-6 shadow-sm transition-colors">
      
      {/* Header Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 pb-4 mb-5 border-b border-slate-100 dark:border-slate-800">
        <div className="flex items-center space-x-3">
          <div className="p-2 bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 rounded-lg">
            <FileCheck2 className="w-4 h-4" />
          </div>
          <div>
            <h2 className="text-sm font-semibold text-slate-900 dark:text-white tracking-tight">
              Executive Reconstruction Dossier
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5 line-clamp-1">
              Inquiry: <span className="font-medium text-slate-700 dark:text-slate-300">"{query}"</span>
            </p>
          </div>
        </div>

        {/* Confidence Badge & Export Actions */}
        <div className="flex items-center space-x-2.5">
          <div className={`flex items-center space-x-1.5 px-3 py-1 rounded-full border ${confidenceConfig.bg} ${confidenceConfig.border} ${confidenceConfig.text} text-xs font-medium`}>
            <ConfidenceIcon className="w-3.5 h-3.5" />
            <span>{confidenceConfig.label}</span>
          </div>

          {/* Export Dropdown */}
          <div className="relative">
            <button
              onClick={() => setShowExportMenu(!showExportMenu)}
              className="px-3 py-1.5 text-xs font-medium text-slate-700 dark:text-slate-200 bg-slate-50 dark:bg-slate-900 hover:bg-slate-100 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-800 rounded-lg flex items-center space-x-1.5 transition-colors shadow-2xs"
              title="Export recovered context report"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Share2 className="w-3.5 h-3.5 text-slate-400" />}
              <span>{copied ? 'Copied' : 'Export'}</span>
            </button>

            {showExportMenu && (
              <div className="absolute right-0 mt-1.5 w-56 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl shadow-floating py-1.5 z-30 text-xs">
                <button
                  onClick={handleCopyMarkdown}
                  className="w-full px-3 py-2 text-left text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800 flex items-center space-x-2 transition-colors"
                >
                  <Copy className="w-4 h-4 text-indigo-500" />
                  <div>
                    <div className="font-medium">Copy Markdown Dossier</div>
                    <div className="text-[11px] text-slate-400">Formatted for Slack, PRs, or Notion</div>
                  </div>
                </button>
                <button
                  onClick={handleDownloadJSON}
                  className="w-full px-3 py-2 text-left text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800 flex items-center space-x-2 border-t border-slate-100 dark:border-slate-800 transition-colors"
                >
                  <Download className="w-4 h-4 text-slate-400" />
                  <div>
                    <div className="font-medium">Download JSON Dataset</div>
                    <div className="text-[11px] text-slate-400">Complete raw evidence payload</div>
                  </div>
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Direct Executive Answer Box */}
      <div className="mb-5 p-5 rounded-xl bg-indigo-50/40 dark:bg-indigo-950/20 border border-indigo-100 dark:border-indigo-900/50 relative overflow-hidden">
        <div className="flex items-center space-x-2 text-[11px] font-semibold text-indigo-700 dark:text-indigo-400 uppercase tracking-wider mb-2">
          <Sparkles className="w-3.5 h-3.5 text-indigo-500" />
          <span>Core Finding & Direct Answer</span>
        </div>
        <p className="text-slate-900 dark:text-slate-100 font-medium text-base leading-relaxed">
          {directAnswer}
        </p>
      </div>

      {/* Reconstructed Reasoning & Context Trail */}
      <div className="space-y-2">
        <h3 className="text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase tracking-wider">
          Reconstructed Context & Analytical Trail
        </h3>
        <div className="text-slate-700 dark:text-slate-300 text-sm leading-relaxed whitespace-pre-line font-sans pl-3 border-l-2 border-slate-200 dark:border-slate-800 py-0.5">
          {reasoningSummary}
        </div>
      </div>

      {/* Verification Basis Footnote */}
      <div className="mt-5 pt-3.5 border-t border-slate-100 dark:border-slate-800 flex flex-wrap items-center justify-between gap-2 text-xs text-slate-500 dark:text-slate-400">
        <div className="flex items-center space-x-2">
          <span className="font-medium text-slate-600 dark:text-slate-300">Evidence Basis:</span>
          <span>{confidenceRationale}</span>
        </div>
        <div className="flex items-center space-x-1 text-slate-400 dark:text-slate-500 text-[11px]">
          <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />
          <span>Multi-source zero hallucination audit</span>
        </div>
      </div>

    </div>
  );
}
