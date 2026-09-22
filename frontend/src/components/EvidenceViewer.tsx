'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  X,
  FileText,
  Copy,
  Check,
  Calendar,
  User,
  ShieldCheck,
  GitBranch,
  Quote,
  Hash,
} from 'lucide-react';
import { CitationRecord } from '@/data/demoData';

interface EvidenceViewerProps {
  isOpen: boolean;
  onClose: () => void;
  document: CitationRecord | null;
}

export default function EvidenceViewer({
  isOpen,
  onClose,
  document,
}: EvidenceViewerProps) {
  const [copied, setCopied] = useState(false);

  // Escape key closes modal
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    if (isOpen) {
      window.addEventListener('keydown', handleKeyDown);
    }
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen || !document) return null;

  const handleCopyQuote = () => {
    const textToCopy = document.quote || document.summary || '';
    if (textToCopy) {
      navigator.clipboard.writeText(textToCopy);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 overflow-y-auto">
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="fixed inset-0 bg-[#070B14]/85 backdrop-blur-sm transition-opacity"
        />

        {/* Realistic Physical Archival Document Sheet */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 15 }}
          transition={{ type: 'spring', damping: 26, stiffness: 320 }}
          className="relative dark:bg-[#0E1626] bg-white border dark:border-[#2A3B5C] border-slate-200 rounded-xl w-full max-w-2xl overflow-hidden shadow-2xl z-10 my-8 doc-fold"
        >
          {/* Header Bar */}
          <div className="px-6 py-4 border-b dark:border-[#1B2945] border-slate-200 dark:bg-[#0A0F1D] bg-slate-50 flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <span className="stamp-badge text-sky-500 dark:text-sky-400 border-sky-400/40">
                {document.code}
              </span>
              <div>
                <h3 className="text-sm sm:text-base font-bold dark:text-white text-slate-900 truncate max-w-xs sm:max-w-md">
                  {document.title}
                </h3>
              </div>
            </div>

            <button
              onClick={onClose}
              className="p-1.5 rounded-lg dark:text-slate-400 text-slate-500 hover:text-slate-900 dark:hover:text-white dark:hover:bg-white/5 hover:bg-slate-100 transition-colors cursor-pointer"
              aria-label="Close document viewer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Document Content */}
          <div className="p-6 sm:p-7 space-y-6">
            
            {/* Metadata Bar */}
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              <div className="p-3 rounded-lg dark:bg-[#070B14] bg-slate-50 border dark:border-[#1B2945] border-slate-200">
                <span className="text-[9px] font-mono dark:text-slate-400 text-slate-500 uppercase block">Author</span>
                <p className="text-xs font-bold dark:text-white text-slate-900 mt-1 flex items-center truncate">
                  <User className="w-3.5 h-3.5 text-sky-500 dark:text-sky-400 mr-1.5 shrink-0" />
                  <span className="truncate">{document.author}</span>
                </p>
              </div>

              <div className="p-3 rounded-lg dark:bg-[#070B14] bg-slate-50 border dark:border-[#1B2945] border-slate-200">
                <span className="text-[9px] font-mono dark:text-slate-400 text-slate-500 uppercase block">Recorded Date</span>
                <p className="text-xs font-bold text-amber-500 dark:text-amber-300 mt-1 flex items-center font-mono">
                  <Calendar className="w-3.5 h-3.5 text-amber-500 dark:text-amber-400 mr-1.5 shrink-0" />
                  <span>{document.date}</span>
                </p>
              </div>

              <div className="p-3 rounded-lg dark:bg-[#070B14] bg-slate-50 border dark:border-[#1B2945] border-slate-200 col-span-2 sm:col-span-1">
                <span className="text-[9px] font-mono dark:text-slate-400 text-slate-500 uppercase block">Audit Verification</span>
                <p className="text-xs font-bold text-emerald-600 dark:text-emerald-400 mt-1 flex items-center">
                  <ShieldCheck className="w-3.5 h-3.5 mr-1.5 shrink-0" />
                  <span>Verified Evidence</span>
                </p>
              </div>
            </div>

            {/* Verbatim Excerpt */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-mono text-sky-600 dark:text-sky-400 font-bold flex items-center space-x-1.5">
                  <Quote className="w-3.5 h-3.5" />
                  <span>VERBATIM PRIMARY SOURCE EXCERPT</span>
                </span>

                <button
                  onClick={handleCopyQuote}
                  className="inline-flex items-center space-x-1 px-2.5 py-1 rounded text-xs font-mono dark:bg-white/5 bg-slate-100 dark:hover:bg-white/10 hover:bg-slate-200 dark:text-slate-300 text-slate-700 border dark:border-[#1B2945] border-slate-200 transition-colors cursor-pointer"
                >
                  {copied ? (
                    <>
                      <Check className="w-3 h-3 text-emerald-500 dark:text-emerald-400" />
                      <span className="text-emerald-600 dark:text-emerald-400 font-bold">COPIED!</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3 h-3 dark:text-slate-400 text-slate-500" />
                      <span>COPY QUOTE</span>
                    </>
                  )}
                </button>
              </div>

              <div className="p-4 rounded-lg dark:bg-[#070B14] bg-sky-50/50 border dark:border-sky-400/30 border-sky-200 dark:text-slate-200 text-slate-800 text-xs sm:text-sm font-mono leading-relaxed italic">
                &ldquo;{document.quote || document.summary || 'Verified document archived in institutional memory.'}&rdquo;
              </div>
            </div>

            {/* Technical Summary */}
            <div className="space-y-1.5">
              <span className="text-xs font-mono dark:text-slate-400 text-slate-500 uppercase font-semibold">
                Forensic Analysis Summary
              </span>
              <p className="text-xs sm:text-sm dark:text-slate-300 text-slate-700 dark:bg-[#070B14] bg-slate-50 p-3.5 rounded-lg border dark:border-[#1B2945] border-slate-200 leading-relaxed font-normal">
                {document.summary}
              </p>
            </div>

            {/* Related Decision */}
            <div className="p-3.5 rounded-lg dark:bg-[#0A0F1D] bg-slate-50 border dark:border-[#1B2945] border-slate-200 flex items-center justify-between text-xs font-mono">
              <div className="flex items-center space-x-2">
                <GitBranch className="w-3.5 h-3.5 text-sky-500 dark:text-sky-400" />
                <span className="dark:text-slate-400 text-slate-500">Related Milestone:</span>
                <span className="dark:text-white text-slate-900 font-bold">{document.relatedDecision}</span>
              </div>
            </div>

          </div>

          {/* Footer Bar */}
          <div className="px-6 py-3.5 dark:bg-[#0A0F1D] bg-slate-50 border-t dark:border-[#1B2945] border-slate-200 flex items-center justify-between text-[11px] font-mono dark:text-slate-400 text-slate-500">
            <span className="flex items-center space-x-1">
              <Hash className="w-3 h-3 text-slate-400 dark:text-slate-500" />
              <span>{document.sourceHash}</span>
            </span>

            <button
              onClick={onClose}
              className="px-3.5 py-1.5 rounded-lg text-xs font-mono font-bold dark:text-white text-slate-800 dark:bg-[#141F36] bg-slate-200 dark:hover:bg-[#1E2D4A] hover:bg-slate-300 border dark:border-[#2A3B5C] border-slate-300 transition-colors cursor-pointer"
            >
              CLOSE DOCUMENT
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
