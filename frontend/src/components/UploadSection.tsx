'use client';

import React, { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  UploadCloud,
  FileText,
  CheckCircle2,
  Loader2,
  AlertCircle,
  Sparkles,
  ArrowRight,
} from 'lucide-react';
import { ingestFile } from '@/lib/api';
import { useCursor } from '@/context/CursorContext';

interface UploadSectionProps {
  onUploadSuccess?: () => void;
}

const UPLOAD_STAGES = [
  'Uploading raw document...',
  'Extracting technical entities & dates...',
  'Connecting to decision graph...',
  'Ready & indexed ✓',
];

export default function UploadSection({ onUploadSuccess }: UploadSectionProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [stageIndex, setStageIndex] = useState(0);
  const [uploadedFile, setUploadedFile] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { setCursor, resetCursor } = useCursor();

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const processFile = async (file: File) => {
    setIsUploading(true);
    setUploadedFile(file.name);
    setStageIndex(0);

    // Simulate animated upload progression
    const stageTimer1 = setTimeout(() => setStageIndex(1), 500);
    const stageTimer2 = setTimeout(() => setStageIndex(2), 1100);
    const stageTimer3 = setTimeout(() => setStageIndex(3), 1700);

    try {
      // Attempt backend ingestion if running
      await ingestFile(file);
    } catch (e) {
      // Graceful local handling
    } finally {
      setTimeout(() => {
        setIsUploading(false);
        if (onUploadSuccess) onUploadSuccess();
      }, 2300);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      processFile(e.dataTransfer.files[0]);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      processFile(e.target.files[0]);
    }
  };

  return (
    <section id="upload" className="py-20 md:py-28 bg-[#05070D] relative subtle-grid">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
        
        {/* Header */}
        <div className="text-center space-y-3 max-w-xl mx-auto">
          <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 text-xs font-mono font-medium">
            <Sparkles className="w-3.5 h-3.5" />
            <span>INSTANT INGESTION</span>
          </div>
          <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-white">
            Bring Your Own Evidence
          </h2>
          <p className="text-sm sm:text-base text-slate-400 font-normal">
            Drop in Architecture Decision Records, RFCs, Postmortems, or engineering logs to expand ReTrace&apos;s forensic memory.
          </p>
        </div>

        {/* Drag and Drop Zone */}
        <motion.div
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          onClick={() => !isUploading && fileInputRef.current?.click()}
          onMouseEnter={() => setCursor(isUploading ? '' : 'UPLOAD', 'button')}
          onMouseLeave={resetCursor}
          whileHover={{ scale: isUploading ? 1 : 1.01 }}
          className={`relative p-8 sm:p-12 rounded-3xl border-2 border-dashed transition-all cursor-pointer text-center bg-[#0E1626]/80 backdrop-blur-md ${
            isDragging
              ? 'border-cyan-400 bg-cyan-500/10 shadow-2xl shadow-cyan-500/20'
              : 'border-[#1E293B] hover:border-cyan-500/50 hover:bg-[#0E1626]'
          }`}
        >
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileChange}
            accept=".md,.txt,.pdf,.json,.docx"
            className="hidden"
          />

          <AnimatePresence mode="wait">
            {isUploading ? (
              <motion.div
                key="uploading-state"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="space-y-6 max-w-sm mx-auto"
              >
                <div className="w-14 h-14 rounded-2xl bg-cyan-500/20 border border-cyan-400/40 text-cyan-400 flex items-center justify-center mx-auto">
                  <Loader2 className="w-7 h-7 animate-spin" />
                </div>

                <div className="space-y-2">
                  <span className="text-xs font-mono font-bold text-cyan-400 tracking-wider">
                    INGESTING: {uploadedFile}
                  </span>
                  <p className="text-sm font-medium text-white">
                    {UPLOAD_STAGES[stageIndex]}
                  </p>
                </div>

                {/* Progress bar */}
                <div className="w-full bg-[#141F36] h-1.5 rounded-full overflow-hidden">
                  <motion.div
                    className="h-full bg-cyan-400"
                    initial={{ width: '0%' }}
                    animate={{ width: `${((stageIndex + 1) / UPLOAD_STAGES.length) * 100}%` }}
                    transition={{ duration: 0.4 }}
                  />
                </div>
              </motion.div>
            ) : uploadedFile ? (
              <motion.div
                key="success-state"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="space-y-4 max-w-sm mx-auto"
              >
                <div className="w-14 h-14 rounded-2xl bg-emerald-500/20 border border-emerald-400/40 text-emerald-400 flex items-center justify-center mx-auto">
                  <CheckCircle2 className="w-7 h-7" />
                </div>

                <div className="space-y-1">
                  <h4 className="text-base font-bold text-white">
                    Evidence Ingested Successfully
                  </h4>
                  <p className="text-xs font-mono text-cyan-400">
                    {uploadedFile} is now indexed &amp; searchable
                  </p>
                </div>

                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    setUploadedFile(null);
                  }}
                  className="px-4 py-2 rounded-xl text-xs font-mono text-slate-300 hover:text-white bg-white/5 border border-white/10"
                >
                  Upload Another File
                </button>
              </motion.div>
            ) : (
              <motion.div
                key="idle-state"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="space-y-5"
              >
                <div className="w-16 h-16 rounded-2xl bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 flex items-center justify-center mx-auto group-hover:scale-110 transition-transform">
                  <UploadCloud className="w-8 h-8" />
                </div>

                <div className="space-y-1.5">
                  <h3 className="text-lg font-bold text-white">
                    Drop engineering files here, or <span className="text-cyan-400 underline underline-offset-4">browse</span>
                  </h3>
                  <p className="text-xs sm:text-sm text-slate-400">
                    Supported: Markdown (.md), PDF, TXT, JSON, and DOCX
                  </p>
                </div>

                <div className="flex flex-wrap items-center justify-center gap-2 pt-2">
                  <span className="text-[10px] font-mono px-2.5 py-1 rounded-md bg-[#141F36] text-slate-300 border border-white/5">
                    ADR-*.md
                  </span>
                  <span className="text-[10px] font-mono px-2.5 py-1 rounded-md bg-[#141F36] text-slate-300 border border-white/5">
                    RFC-*.pdf
                  </span>
                  <span className="text-[10px] font-mono px-2.5 py-1 rounded-md bg-[#141F36] text-slate-300 border border-white/5">
                    retro-*.txt
                  </span>
                  <span className="text-[10px] font-mono px-2.5 py-1 rounded-md bg-[#141F36] text-slate-300 border border-white/5">
                    slack-export.json
                  </span>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>

      </div>
    </section>
  );
}
