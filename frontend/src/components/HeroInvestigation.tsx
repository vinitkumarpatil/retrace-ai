'use client';

import React from 'react';
import { motion } from 'framer-motion';
import {
  FileText,
  AlertTriangle,
  Database,
  CheckCircle2,
  Calendar,
  Sparkles,
  ExternalLink,
} from 'lucide-react';
import { useCursor } from '@/context/CursorContext';
import { useTheme } from '@/context/ThemeContext';

interface HeroInvestigationProps {
  onSelectScenario?: (key: string) => void;
}

export default function HeroInvestigation({ onSelectScenario }: HeroInvestigationProps) {
  const { setCursor, resetCursor } = useCursor();
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  const handleCardClick = (target: string) => {
    if (onSelectScenario) {
      onSelectScenario(target);
    } else {
      const askEl = document.getElementById('explore') || document.getElementById('ask');
      if (askEl) {
        askEl.scrollIntoView({ behavior: 'smooth' });
      }
    }
  };

  return (
    <div className="relative w-full max-w-xl lg:max-w-2xl mx-auto aspect-[1.12/1] select-none flex items-center justify-center p-2">
      
      {/* ============================================================ */}
      {/* SVG CONNECTING PATHS WITH TRAVELING LIGHT PULSES            */}
      {/* ============================================================ */}
      <svg
        className="absolute inset-0 w-full h-full pointer-events-none z-10"
        viewBox="0 0 600 520"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          <linearGradient id="lineGlow1" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#38BDF8" stopOpacity="0.8" />
            <stop offset="100%" stopColor="#0284C7" stopOpacity="0.2" />
          </linearGradient>
          <linearGradient id="lineGlowAmber" x1="100%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#F59E0B" stopOpacity="0.85" />
            <stop offset="100%" stopColor="#38BDF8" stopOpacity="0.25" />
          </linearGradient>
          <radialGradient id="particleGlow" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#38BDF8" stopOpacity="1" />
            <stop offset="100%" stopColor="#38BDF8" stopOpacity="0" />
          </radialGradient>
        </defs>

        {/* Path 1: Top Node (Architecture Decision) -> Central Hub */}
        <motion.path
          d="M 300 135 Q 320 200 375 240"
          stroke="url(#lineGlow1)"
          strokeWidth="1.8"
          strokeDasharray="4 4"
          initial={{ strokeDashoffset: 40 }}
          animate={{ strokeDashoffset: 0 }}
          transition={{ duration: 3, repeat: Infinity, ease: 'linear' }}
        />

        {/* Path 2: Top-Right Node (Incident Report) -> Central Hub */}
        <motion.path
          d="M 480 180 Q 440 220 405 255"
          stroke="url(#lineGlowAmber)"
          strokeWidth="1.8"
          strokeDasharray="4 4"
          initial={{ strokeDashoffset: -40 }}
          animate={{ strokeDashoffset: 0 }}
          transition={{ duration: 3.5, repeat: Infinity, ease: 'linear' }}
        />

        {/* Path 3: Bottom-Left Node (Deployment Log) -> Central Hub */}
        <motion.path
          d="M 285 365 Q 315 320 360 280"
          stroke="url(#lineGlow1)"
          strokeWidth="1.8"
          strokeDasharray="4 4"
          initial={{ strokeDashoffset: 40 }}
          animate={{ strokeDashoffset: 0 }}
          transition={{ duration: 3.8, repeat: Infinity, ease: 'linear' }}
        />

        {/* Path 4: Bottom-Right Node (Migration Plan) -> Central Hub */}
        <motion.path
          d="M 465 375 Q 430 325 390 285"
          stroke="url(#lineGlow1)"
          strokeWidth="1.8"
          strokeDasharray="4 4"
          initial={{ strokeDashoffset: -40 }}
          animate={{ strokeDashoffset: 0 }}
          transition={{ duration: 3.2, repeat: Infinity, ease: 'linear' }}
        />

        {/* Dynamic Light Pulses Traveling along paths */}
        <circle r="3.5" fill="#38BDF8" filter="drop-shadow(0 0 6px #38BDF8)">
          <animateMotion
            path="M 300 135 Q 320 200 375 240"
            dur="2.8s"
            repeatCount="indefinite"
          />
        </circle>
        <circle r="3.5" fill="#F59E0B" filter="drop-shadow(0 0 6px #F59E0B)">
          <animateMotion
            path="M 480 180 Q 440 220 405 255"
            dur="3.2s"
            repeatCount="indefinite"
          />
        </circle>
        <circle r="3.5" fill="#38BDF8" filter="drop-shadow(0 0 6px #38BDF8)">
          <animateMotion
            path="M 285 365 Q 315 320 360 280"
            dur="3.5s"
            repeatCount="indefinite"
          />
        </circle>
        <circle r="3.5" fill="#38BDF8" filter="drop-shadow(0 0 6px #38BDF8)">
          <animateMotion
            path="M 465 375 Q 430 325 390 285"
            dur="3s"
            repeatCount="indefinite"
          />
        </circle>
      </svg>

      {/* ============================================================ */}
      {/* 1. TOP CARD: Architecture Decision (Mar 14, 2025)           */}
      {/* ============================================================ */}
      <motion.div
        animate={{ y: [0, -4, 0] }}
        transition={{ duration: 6, repeat: Infinity, ease: 'easeInOut' }}
        whileHover={{ scale: 1.04, y: -6 }}
        onClick={() => handleCardClick('postgres')}
        onMouseEnter={() => setCursor('VIEW', 'card')}
        onMouseLeave={resetCursor}
        className="absolute top-2 sm:top-4 left-1/4 sm:left-[22%] -translate-x-1/2 z-20 w-48 sm:w-56 p-3 sm:p-3.5 rounded-xl dark:bg-[#0B1528]/85 bg-white/90 backdrop-blur-xl border border-sky-400/30 hover:border-sky-400/80 shadow-2xl transition-all cursor-pointer group"
      >
        <div className="flex items-start space-x-3">
          <div className="w-8 h-8 rounded-lg bg-sky-500/15 border border-sky-400/40 flex items-center justify-center text-sky-400 shrink-0 mt-0.5">
            <FileText className="w-4 h-4" />
          </div>
          <div className="min-w-0 flex-1 space-y-1">
            <h4 className="text-xs sm:text-sm font-bold dark:text-white text-slate-900 truncate group-hover:text-sky-400 transition-colors">
              Architecture Decision
            </h4>
            <div className="space-y-1 py-0.5">
              <div className="h-1.5 w-full dark:bg-slate-700/60 bg-slate-200 rounded-full" />
              <div className="h-1.5 w-3/4 dark:bg-slate-700/40 bg-slate-200/80 rounded-full" />
            </div>
            <span className="text-[10px] font-mono dark:text-slate-400 text-slate-500 block">
              Mar 14, 2025
            </span>
          </div>
        </div>
      </motion.div>

      {/* ============================================================ */}
      {/* 2. TOP-RIGHT CARD: Incident Report (Aug 12, 2024)            */}
      {/* ============================================================ */}
      <motion.div
        animate={{ y: [0, -5, 0] }}
        transition={{ duration: 7, repeat: Infinity, ease: 'easeInOut', delay: 0.8 }}
        whileHover={{ scale: 1.04, y: -6 }}
        onClick={() => handleCardClick('incident')}
        onMouseEnter={() => setCursor('VIEW', 'card')}
        onMouseLeave={resetCursor}
        className="absolute top-12 sm:top-14 right-2 sm:right-6 z-20 w-48 sm:w-56 p-3 sm:p-3.5 rounded-xl dark:bg-[#0B1528]/85 bg-white/90 backdrop-blur-xl border border-amber-400/30 hover:border-amber-400/80 shadow-2xl transition-all cursor-pointer group"
      >
        <div className="flex items-start space-x-3">
          <div className="w-8 h-8 rounded-lg bg-amber-500/15 border border-amber-400/40 flex items-center justify-center text-amber-400 shrink-0 mt-0.5">
            <AlertTriangle className="w-4 h-4" />
          </div>
          <div className="min-w-0 flex-1 space-y-1">
            <h4 className="text-xs sm:text-sm font-bold dark:text-white text-slate-900 truncate group-hover:text-amber-400 transition-colors">
              Incident Report
            </h4>
            <div className="space-y-1 py-0.5">
              <div className="h-1.5 w-full bg-amber-400/40 rounded-full" />
              <div className="h-1.5 w-2/3 bg-amber-400/20 rounded-full" />
            </div>
            <span className="text-[10px] font-mono dark:text-slate-400 text-slate-500 block">
              Aug 12, 2024
            </span>
          </div>
        </div>
      </motion.div>

      {/* ============================================================ */}
      {/* 3. BOTTOM-LEFT CARD: Deployment Log (Jun 03, 2024)          */}
      {/* ============================================================ */}
      <motion.div
        animate={{ y: [0, 4, 0] }}
        transition={{ duration: 6.5, repeat: Infinity, ease: 'easeInOut', delay: 1.2 }}
        whileHover={{ scale: 1.04, y: -4 }}
        onClick={() => handleCardClick('scaling')}
        onMouseEnter={() => setCursor('VIEW', 'card')}
        onMouseLeave={resetCursor}
        className="absolute bottom-16 sm:bottom-20 left-2 sm:left-6 z-20 w-48 sm:w-56 p-3 sm:p-3.5 rounded-xl dark:bg-[#0B1528]/85 bg-white/90 backdrop-blur-xl border border-sky-400/30 hover:border-sky-400/80 shadow-2xl transition-all cursor-pointer group"
      >
        <div className="flex items-start space-x-3">
          <div className="w-8 h-8 rounded-lg bg-sky-500/15 border border-sky-400/40 flex items-center justify-center text-sky-400 shrink-0 mt-0.5">
            <Database className="w-4 h-4" />
          </div>
          <div className="min-w-0 flex-1 space-y-1">
            <h4 className="text-xs sm:text-sm font-bold dark:text-white text-slate-900 truncate group-hover:text-sky-400 transition-colors">
              Deployment Log
            </h4>
            <div className="space-y-1 py-0.5">
              <div className="h-1.5 w-full dark:bg-slate-700/60 bg-slate-200 rounded-full" />
              <div className="h-1.5 w-4/5 dark:bg-slate-700/40 bg-slate-200/80 rounded-full" />
            </div>
            <span className="text-[10px] font-mono dark:text-slate-400 text-slate-500 block">
              Jun 03, 2024
            </span>
          </div>
        </div>
      </motion.div>

      {/* ============================================================ */}
      {/* 4. BOTTOM-RIGHT CARD: Migration Plan (Feb 28, 2024)         */}
      {/* ============================================================ */}
      <motion.div
        animate={{ y: [0, 5, 0] }}
        transition={{ duration: 7.5, repeat: Infinity, ease: 'easeInOut', delay: 0.4 }}
        whileHover={{ scale: 1.04, y: -4 }}
        onClick={() => handleCardClick('mongodb')}
        onMouseEnter={() => setCursor('VIEW', 'card')}
        onMouseLeave={resetCursor}
        className="absolute bottom-6 sm:bottom-10 right-2 sm:right-8 z-20 w-48 sm:w-56 p-3 sm:p-3.5 rounded-xl dark:bg-[#0B1528]/85 bg-white/90 backdrop-blur-xl border border-sky-400/30 hover:border-sky-400/80 shadow-2xl transition-all cursor-pointer group"
      >
        <div className="flex items-start space-x-3">
          <div className="w-8 h-8 rounded-lg bg-sky-500/15 border border-sky-400/40 flex items-center justify-center text-sky-400 shrink-0 mt-0.5">
            <FileText className="w-4 h-4" />
          </div>
          <div className="min-w-0 flex-1 space-y-1">
            <h4 className="text-xs sm:text-sm font-bold dark:text-white text-slate-900 truncate group-hover:text-sky-400 transition-colors">
              Migration Plan
            </h4>
            <div className="space-y-1 py-0.5">
              <div className="h-1.5 w-full dark:bg-slate-700/60 bg-slate-200 rounded-full" />
              <div className="h-1.5 w-3/5 dark:bg-slate-700/40 bg-slate-200/80 rounded-full" />
            </div>
            <span className="text-[10px] font-mono dark:text-slate-400 text-slate-500 block">
              Feb 28, 2024
            </span>
          </div>
        </div>
      </motion.div>

      {/* ============================================================ */}
      {/* 5. CENTRAL RETRACE CONCENTRIC HUB & CONTEXT RECOVERED BADGE  */}
      {/* Positioned right on the moon, matching the reference image    */}
      {/* ============================================================ */}
      <div className="absolute top-[50%] left-[62%] sm:left-[64%] -translate-x-1/2 -translate-y-1/2 z-30 flex flex-col items-center pointer-events-none">
        
        {/* Concentric Rotating Orbital Rings */}
        <div className="relative w-28 h-28 sm:w-32 sm:h-32 flex items-center justify-center">
          
          {/* Outer Pulsing Glow */}
          <div className="absolute inset-0 rounded-full bg-sky-500/20 blur-xl animate-pulse" />

          {/* Outer Thin Ring with Rotating Cyan Dot */}
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 24, repeat: Infinity, ease: 'linear' }}
            className="absolute inset-0 rounded-full border border-sky-400/30 border-dashed"
          >
            <div className="absolute -top-1 left-1/2 -translate-x-1/2 w-2 h-2 rounded-full bg-sky-400 shadow-[0_0_8px_#38BDF8]" />
          </motion.div>

          {/* Intermediate Ring with Second Dot */}
          <motion.div
            animate={{ rotate: -360 }}
            transition={{ duration: 16, repeat: Infinity, ease: 'linear' }}
            className="absolute inset-2 sm:inset-2.5 rounded-full border border-sky-400/40"
          >
            <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-1.5 h-1.5 rounded-full bg-cyan-300 shadow-[0_0_6px_#67E8F9]" />
          </motion.div>

          {/* Central Solid Hub Node */}
          <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-full dark:bg-[#08101E]/95 bg-white/95 border-2 border-sky-400 shadow-[0_0_28px_rgba(56,189,248,0.5)] flex flex-col items-center justify-center p-2 text-center z-10 backdrop-blur-md pointer-events-auto cursor-pointer hover:scale-105 transition-transform">
            {/* Stylized Cyan 'R' Logo */}
            <div className="text-sky-400 font-black text-xl sm:text-2xl leading-none">
              R
            </div>
            <span className="text-[8px] sm:text-[9px] font-mono font-black tracking-widest dark:text-white text-slate-900 mt-0.5">
              RETRACE
            </span>
          </div>
        </div>

        {/* Docked Pill Badge: CONTEXT RECOVERED ✓ */}
        <motion.div
          initial={{ opacity: 0, y: 5 }}
          animate={{ opacity: 1, y: 0 }}
          className="mt-3 px-3 py-1 rounded-full border border-emerald-400/60 dark:bg-[#061817]/90 bg-emerald-50/90 shadow-[0_0_18px_rgba(16,185,129,0.35)] backdrop-blur-md flex items-center space-x-1.5 z-40 pointer-events-auto"
        >
          <span className="text-[10px] sm:text-[11px] font-mono font-black tracking-wider text-emerald-600 dark:text-emerald-400 flex items-center space-x-1">
            <span>CONTEXT RECOVERED</span>
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400 ml-1 inline" />
          </span>
        </motion.div>

      </div>

    </div>
  );
}
