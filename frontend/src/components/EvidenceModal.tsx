'use client';

import React from 'react';
import { X, FileText, CheckCircle2, ShieldCheck, Quote, Copy, Check, Calendar, User, ExternalLink } from 'lucide-react';
import { Citation } from '@/lib/types';

interface EvidenceModalProps {
  isOpen: boolean;
  onClose: () => void;
  evidence: {
    title: string;
    type?: string;
    quote?: string;
    relevance?: string;
    author?: string;
    date?: string;
    status?: string;
  } | null;
}

export default function EvidenceModal({ isOpen, onClose, evidence }: EvidenceModalProps) {
  const [copied, setCopied] = React.useState(false);

  if (!isOpen || !evidence) return null;

  const handleCopy = () => {
    if (evidence.quote) {
      navigator.clipboard.writeText(evidence.quote);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-fade-in">
      <div className="relative w-full max-w-lg bg-[#0F172A] border border-slate-700/80 rounded-2xl shadow-2xl overflow-hidden">
        {/* Modal Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-[#1E293B]/60">
          <div className="flex items-center space-x-3">
            <div className="p-2 rounded-xl bg-sky-500/10 text-sky-400 border border-sky-500/20">
              <FileText className="w-5 h-5" />
            </div>
            <div>
              <span className="text-[11px] font-mono uppercase tracking-wider text-sky-400 font-semibold">
                {evidence.type || 'DOCUMENT RECORD'}
              </span>
              <h3 className="text-sm font-bold text-white leading-tight">
                {evidence.title}
              </h3>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 space-y-4 text-sm text-slate-300">
          {/* Metadata badges */}
          <div className="flex flex-wrap items-center gap-2">
            <span className="inline-flex items-center space-x-1 px-2.5 py-1 rounded-full text-xs font-medium bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>{evidence.status || 'Verified Source'}</span>
            </span>

            {evidence.date && (
              <span className="inline-flex items-center space-x-1 px-2.5 py-1 rounded-full text-xs font-medium bg-slate-800 text-slate-300 border border-slate-700">
                <Calendar className="w-3.5 h-3.5 text-slate-400" />
                <span>{evidence.date}</span>
              </span>
            )}

            {evidence.author && (
              <span className="inline-flex items-center space-x-1 px-2.5 py-1 rounded-full text-xs font-medium bg-slate-800 text-slate-300 border border-slate-700">
                <User className="w-3.5 h-3.5 text-slate-400" />
                <span>{evidence.author}</span>
              </span>
            )}
          </div>

          {/* Relevance Explanation */}
          {evidence.relevance && (
            <div className="p-3.5 rounded-xl bg-slate-800/40 border border-slate-700/60 text-xs text-slate-300 leading-relaxed">
              <strong className="text-sky-400 block mb-1 font-mono uppercase text-[10px] tracking-wider">
                Why this document matters:
              </strong>
              {evidence.relevance}
            </div>
          )}

          {/* Verbatim Quote Box */}
          {evidence.quote && (
            <div className="space-y-2">
              <div className="flex items-center justify-between text-xs font-mono text-slate-400">
                <span>VERBATIM QUOTE:</span>
                <button
                  onClick={handleCopy}
                  className="flex items-center space-x-1 text-sky-400 hover:text-sky-300 transition-colors"
                >
                  {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copied ? 'Copied' : 'Copy Quote'}</span>
                </button>
              </div>
              <div className="p-4 rounded-xl bg-[#030712] border border-slate-800 text-slate-200 italic font-serif text-sm relative">
                <Quote className="w-4 h-4 text-sky-400/40 absolute top-3 left-3" />
                <p className="pl-6">&ldquo;{evidence.quote}&rdquo;</p>
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="px-6 py-3.5 bg-slate-900/80 border-t border-slate-800 flex items-center justify-between text-xs text-slate-400">
          <span className="font-mono text-[11px]">Zero-Hallucination Verified</span>
          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-white font-medium transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
