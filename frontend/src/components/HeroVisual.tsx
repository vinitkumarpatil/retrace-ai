'use client';

import React from 'react';
import { motion } from 'framer-motion';
import {
  FileText,
  AlertTriangle,
  GitCommit,
  MessageSquare,
  Search,
  CheckCircle2,
  Sparkles,
  ShieldCheck,
  Clock,
  User,
} from 'lucide-react';
import { useCursor } from '@/context/CursorContext';

export default function HeroVisual() {
  const { setCursor, resetCursor } = useCursor();

  return (
    <div className="relative w-full max-w-xl mx-auto lg:max-w-none aspect-[1.15/1] sm:aspect-[1.25/1] flex items-center justify-center select-none">
      
      {/* Dynamic Background Glows */}
      <div className="absolute inset-0 bg-gradient-to-tr from-cyan-500/10 via-indigo-500/5 to-transparent rounded-3xl filter blur-3xl -z-10" />

      {/* SVG Connecting Lines with Animated Dash Offset */}
      <svg
        className="absolute inset-0 w-full h-full pointer-events-none -z-0"
        viewBox="0 0 500 420"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          <linearGradient id="cyanLine" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#00F2FE" stopOpacity="0.8" />
            <stop offset="100%" stopColor="#8B5CF6" stopOpacity="0.4" />
          </linearGradient>
          <linearGradient id="violetLine" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#38BDF8" stopOpacity="0.6" />
            <stop offset="100%" stopColor="#00F2FE" stopOpacity="0.9" />
          </linearGradient>
        </defs>

        {/* Path from Card 1 (Top Left) to Central Hub */}
        <motion.path
          d="M 120 70 Q 180 120 250 180"
          stroke="url(#cyanLine)"
          strokeWidth="1.5"
          strokeDasharray="4 4"
          initial={{ pathOffset: 0 }}
          animate={{ pathOffset: -1 }}
          transition={{ duration: 4, repeat: Infinity, ease: 'linear' }}
        />

        {/* Path from Card 2 (Top Right) to Central Hub */}
        <motion.path
          d="M 380 80 Q 320 120 250 180"
          stroke="url(#violetLine)"
          strokeWidth="1.5"
          strokeDasharray="4 4"
          initial={{ pathOffset: 0 }}
          animate={{ pathOffset: 1 }}
          transition={{ duration: 5, repeat: Infinity, ease: 'linear' }}
        />

        {/* Path from Card 3 (Bottom Left) to Central Hub */}
        <motion.path
          d="M 110 320 Q 180 260 250 210"
          stroke="url(#cyanLine)"
          strokeWidth="1.5"
          strokeDasharray="4 4"
          initial={{ pathOffset: 0 }}
          animate={{ pathOffset: -1 }}
          transition={{ duration: 4.5, repeat: Infinity, ease: 'linear' }}
        />

        {/* Path from Card 4 (Bottom Right) to Central Hub */}
        <motion.path
          d="M 390 310 Q 330 260 250 210"
          stroke="url(#violetLine)"
          strokeWidth="1.5"
          strokeDasharray="4 4"
          initial={{ pathOffset: 0 }}
          animate={{ pathOffset: 1 }}
          transition={{ duration: 4.2, repeat: Infinity, ease: 'linear' }}
        />
      </svg>

      {/* 1. Floating Source Card: Top-Left (Architecture Decision) */}
      <motion.div
        animate={{ y: [0, -8, 0], rotate: [0, 1, 0] }}
        transition={{ duration: 6, repeat: Infinity, ease: 'easeInOut' }}
        whileHover={{ scale: 1.05, y: -10 }}
        onMouseEnter={() => setCursor('ADR', 'card')}
        onMouseLeave={resetCursor}
        className="absolute top-2 left-2 sm:top-6 sm:left-4 z-10 bg-[#0E1626]/90 backdrop-blur-md border border-[#1E293B] hover:border-cyan-400/50 p-3 sm:p-3.5 rounded-xl shadow-xl w-44 sm:w-52 cursor-pointer transition-colors"
      >
        <div className="flex items-center space-x-2 text-[10px] font-mono text-cyan-400 font-bold mb-1">
          <FileText className="w-3.5 h-3.5" />
          <span>ADR-042 • AUG 12</span>
        </div>
        <p className="text-xs font-semibold text-white truncate">Architecture Decision</p>
        <p className="text-[11px] text-slate-400 mt-0.5 leading-snug truncate">
          &quot;Migrate to PostgreSQL &amp; pgvector&quot;
        </p>
      </motion.div>

      {/* 2. Floating Source Card: Top-Right (Incident Retrospective) */}
      <motion.div
        animate={{ y: [0, 8, 0], rotate: [0, -1.2, 0] }}
        transition={{ duration: 7, repeat: Infinity, ease: 'easeInOut', delay: 0.8 }}
        whileHover={{ scale: 1.05, y: 6 }}
        onMouseEnter={() => setCursor('INCIDENT', 'card')}
        onMouseLeave={resetCursor}
        className="absolute top-4 right-2 sm:top-8 sm:right-4 z-10 bg-[#0E1626]/90 backdrop-blur-md border border-[#1E293B] hover:border-rose-400/50 p-3 sm:p-3.5 rounded-xl shadow-xl w-44 sm:w-52 cursor-pointer transition-colors"
      >
        <div className="flex items-center space-x-2 text-[10px] font-mono text-rose-400 font-bold mb-1">
          <AlertTriangle className="w-3.5 h-3.5" />
          <span>POSTMORTEM #88</span>
        </div>
        <p className="text-xs font-semibold text-white truncate">Incident Report</p>
        <p className="text-[11px] text-slate-400 mt-0.5 leading-snug truncate">
          &quot;Connection pool exhaustion&quot;
        </p>
      </motion.div>

      {/* 3. Floating Source Card: Bottom-Left (Migration Roadmap) */}
      <motion.div
        animate={{ y: [0, -7, 0], rotate: [0, -1, 0] }}
        transition={{ duration: 6.5, repeat: Infinity, ease: 'easeInOut', delay: 1.2 }}
        whileHover={{ scale: 1.05, y: -9 }}
        onMouseEnter={() => setCursor('RFC', 'card')}
        onMouseLeave={resetCursor}
        className="absolute bottom-6 left-2 sm:bottom-8 sm:left-4 z-10 bg-[#0E1626]/90 backdrop-blur-md border border-[#1E293B] hover:border-violet-400/50 p-3 sm:p-3.5 rounded-xl shadow-xl w-44 sm:w-52 cursor-pointer transition-colors"
      >
        <div className="flex items-center space-x-2 text-[10px] font-mono text-violet-400 font-bold mb-1">
          <GitCommit className="w-3.5 h-3.5" />
          <span>RFC-204 • ROADMAP</span>
        </div>
        <p className="text-xs font-semibold text-white truncate">Decomposition Plan</p>
        <p className="text-[11px] text-slate-400 mt-0.5 leading-snug truncate">
          &quot;Payment ledger ACID isolation&quot;
        </p>
      </motion.div>

      {/* 4. Floating Source Card: Bottom-Right (Slack Arch Council) */}
      <motion.div
        animate={{ y: [0, 7, 0], rotate: [0, 1.5, 0] }}
        transition={{ duration: 7.5, repeat: Infinity, ease: 'easeInOut', delay: 0.5 }}
        whileHover={{ scale: 1.05, y: 5 }}
        onMouseEnter={() => setCursor('SLACK', 'card')}
        onMouseLeave={resetCursor}
        className="absolute bottom-4 right-2 sm:bottom-6 sm:right-4 z-10 bg-[#0E1626]/90 backdrop-blur-md border border-[#1E293B] hover:border-emerald-400/50 p-3 sm:p-3.5 rounded-xl shadow-xl w-44 sm:w-52 cursor-pointer transition-colors"
      >
        <div className="flex items-center space-x-2 text-[10px] font-mono text-emerald-400 font-bold mb-1">
          <MessageSquare className="w-3.5 h-3.5" />
          <span>#ARCH-COUNCIL</span>
        </div>
        <p className="text-xs font-semibold text-white truncate">Decision Discussion</p>
        <p className="text-[11px] text-slate-400 mt-0.5 leading-snug truncate">
          &quot;VP Eng approved 2xlarge RDS&quot;
        </p>
      </motion.div>

      {/* Central ReTrace Radar Node */}
      <motion.div
        animate={{ scale: [1, 1.03, 1] }}
        transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
        className="relative z-20 flex flex-col items-center"
      >
        <div className="relative">
          {/* Radar Ring 1 */}
          <motion.div
            animate={{ scale: [1, 1.6], opacity: [0.6, 0] }}
            transition={{ duration: 2.5, repeat: Infinity, ease: 'easeOut' }}
            className="absolute -inset-3 rounded-full border border-cyan-400/40 pointer-events-none"
          />

          {/* Central Hub Button */}
          <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-2xl bg-gradient-to-tr from-[#0E1626] to-[#141F36] border border-cyan-400/50 shadow-[0_0_35px_rgba(0,242,254,0.25)] flex flex-col items-center justify-center p-2 text-center">
            <div className="w-9 h-9 rounded-xl bg-cyan-400/10 flex items-center justify-center text-cyan-400 mb-1">
              <Search className="w-5 h-5" />
            </div>
            <span className="text-[10px] font-mono font-bold tracking-wider text-cyan-300">
              RETRACE
            </span>
            <span className="text-[8px] font-mono text-slate-400 uppercase">Engine</span>
          </div>
        </div>

        {/* Found Context Result Card Hanging Below Hub */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="mt-4 bg-[#0E1626]/95 border border-cyan-500/40 rounded-xl px-4 py-2.5 shadow-2xl backdrop-blur-md max-w-[280px] sm:max-w-[320px] text-left"
        >
          <div className="flex items-center justify-between gap-2 mb-1.5 pb-1 border-b border-white/5">
            <div className="flex items-center space-x-1.5 text-emerald-400 text-[10px] font-mono font-bold">
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>CONTEXT FOUND</span>
            </div>
            <span className="text-[9px] font-mono text-slate-400 bg-white/5 px-2 py-0.5 rounded">
              94% VERIFIED
            </span>
          </div>
          <p className="text-xs font-medium text-white line-clamp-1">
            &quot;Adopt Kafka + PostgreSQL with pgvector&quot;
          </p>
          <div className="flex items-center justify-between text-[10px] font-mono text-slate-400 mt-1.5 pt-1 border-t border-white/5">
            <span className="flex items-center space-x-1">
              <User className="w-3 h-3 text-cyan-400" />
              <span>Alice Chen</span>
            </span>
            <span className="flex items-center space-x-1">
              <Clock className="w-3 h-3 text-slate-400" />
              <span>Aug 12, 2024</span>
            </span>
          </div>
        </motion.div>
      </motion.div>
    </div>
  );
}
