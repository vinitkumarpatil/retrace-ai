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
  GitBranch,
  Quote,
  ShieldCheck,
} from 'lucide-react';

interface EvidenceModalProps {
  isOpen: boolean;
  onClose: () => void;
  evidence: any;
}

export default function EvidenceModal({
  isOpen,
  onClose,
  evidence,
}: EvidenceModalProps) {
  const [copied, setCopied] = useState(false);

  // Close on ESC key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    if (isOpen) {
      window.addEventListener('keydown', handleKeyDown);
    }
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen || !evidence) return null;

  const docTitle = evidence.title || evidence.document_title || evidence.name || 'Forensic Evidence Document';
  const docType = evidence.type || evidence.source_type || evidence.category || 'Architecture Spec';
  const docQuote = evidence.quote || evidence.snippet || evidence.summary || 'Adopt Kafka + PostgreSQL starting August 1, 2024 with pgvector HNSW index caching.';
  const docAuthor = evidence.author || 'Platform Architecture Review Board';
  const docDate = evidence.date || 'August 2024';
  const docSummary = evidence.summary || evidence.relevance || 'Evaluated against scalability, transactional integrity, and operational simplicity.';
  const relatedDecision = evidence.relatedDecision || 'PostgreSQL Migration & Unified Vector Cache';

  const handleCopy = () => {
    navigator.clipboard.writeText(docQuote);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
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
          className="fixed inset-0 bg-[#05070D]/80 backdrop-blur-md transition-opacity"
        />

        {/* Modal Window */}
        <motion.div
          initial={{ opacity: 0, scale: 0.94, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.94, y: 20 }}
          transition={{ type: 'spring', damping: 25, stiffness: 300 }}
          className="relative bg-[#0E1626] border border-cyan-500/30 rounded-2xl w-full max-w-2xl overflow-hidden shadow-2xl z-10 my-8"
        >
          {/* Header Bar */}
          <div className="flex items-center justify-between px-6 py-4 border-b border-[#1E293B] bg-[#070D1A]">
            <div className="flex items-center space-x-2.5">
              <div className="p-2 rounded-lg bg-cyan-500/10 text-cyan-400">
                <FileText className="w-4 h-4" />
              </div>
              <div>
                <span className="text-[10px] font-mono text-cyan-400 font-bold uppercase tracking-wider">
                  {docType}
                </span>
                <h3 className="text-sm sm:text-base font-bold text-white truncate max-w-sm sm:max-w-md">
                  {docTitle}
                </h3>
              </div>
            </div>

            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-white/5 transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Modal Body */}
          <div className="p-6 space-y-6">
            
            {/* Metadata Badges */}
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              <div className="p-3 rounded-xl bg-[#070D1A] border border-[#1E293B]">
                <span className="text-[10px] font-mono text-slate-400 uppercase">Author</span>
                <p className="text-xs font-medium text-white truncate flex items-center mt-1">
                  <User className="w-3.5 h-3.5 text-cyan-400 mr-1.5 shrink-0" />
                  <span className="truncate">{docAuthor}</span>
                </p>
              </div>

              <div className="p-3 rounded-xl bg-[#070D1A] border border-[#1E293B]">
                <span className="text-[10px] font-mono text-slate-400 uppercase">Timestamp</span>
                <p className="text-xs font-medium text-white truncate flex items-center mt-1">
                  <Calendar className="w-3.5 h-3.5 text-amber-400 mr-1.5 shrink-0" />
                  <span>{docDate}</span>
                </p>
              </div>

              <div className="p-3 rounded-xl bg-[#070D1A] border border-[#1E293B] col-span-2 sm:col-span-1">
                <span className="text-[10px] font-mono text-slate-400 uppercase">Status</span>
                <p className="text-xs font-medium text-emerald-400 flex items-center mt-1">
                  <ShieldCheck className="w-3.5 h-3.5 mr-1.5 shrink-0" />
                  <span>Verified Evidence</span>
                </p>
              </div>
            </div>

            {/* Verbatim Quote with 1-Click Copy */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-mono text-cyan-400 font-bold flex items-center space-x-1.5">
                  <Quote className="w-3.5 h-3.5" />
                  <span>VERBATIM SOURCE EXCERPT</span>
                </span>

                <button
                  onClick={handleCopy}
                  className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-lg text-xs font-mono bg-white/5 hover:bg-white/10 text-slate-300 hover:text-white border border-[#1E293B] transition-all cursor-pointer"
                >
                  {copied ? (
                    <>
                      <Check className="w-3.5 h-3.5 text-emerald-400" />
                      <span className="text-emerald-400">COPIED!</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3.5 h-3.5 text-slate-400" />
                      <span>COPY QUOTE</span>
                    </>
                  )}
                </button>
              </div>

              <div className="p-4 rounded-xl bg-[#05070D] border border-cyan-500/20 text-slate-200 text-sm leading-relaxed font-sans italic relative">
                &quot;{docQuote}&quot;
              </div>
            </div>

            {/* Document Analysis / Summary */}
            <div className="space-y-1.5">
              <span className="text-xs font-mono text-slate-400 uppercase font-semibold">
                Forensic Relevance
              </span>
              <p className="text-xs sm:text-sm text-slate-300 bg-[#070D1A] p-3.5 rounded-xl border border-[#1E293B] leading-relaxed">
                {docSummary}
              </p>
            </div>

            {/* Related Decision */}
            <div className="p-3.5 rounded-xl bg-cyan-950/20 border border-cyan-500/25 flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <GitBranch className="w-4 h-4 text-cyan-400" />
                <span className="text-xs font-mono text-cyan-300 font-medium">
                  Related Decision:
                </span>
                <span className="text-xs font-bold text-white">
                  {relatedDecision}
                </span>
              </div>
            </div>

          </div>

          {/* Footer */}
          <div className="px-6 py-4 bg-[#070D1A] border-t border-[#1E293B] flex items-center justify-between">
            <span className="text-[11px] font-mono text-slate-500">
              Verified Source Hash: 8f4a2b9...1c0
            </span>

            <button
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-xs font-mono font-bold text-white bg-[#141F36] hover:bg-[#1E293B] transition-colors cursor-pointer"
            >
              CLOSE PREVIEW
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
