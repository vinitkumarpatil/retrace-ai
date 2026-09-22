'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { FileText, ExternalLink, Calendar, User, Quote } from 'lucide-react';
import { useCursor } from '@/context/CursorContext';

export interface EvidenceItem {
  title: string;
  type: string;
  subtitle?: string;
  date: string;
  author: string;
  summary: string;
  quote: string;
  relatedDecision: string;
}

interface EvidenceCardProps {
  item: EvidenceItem;
  onSelect: (item: EvidenceItem) => void;
  index: number;
}

export default function EvidenceCard({ item, onSelect, index }: EvidenceCardProps) {
  const { setCursor, resetCursor } = useCursor();

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: index * 0.1 }}
      whileHover={{ y: -6, scale: 1.02 }}
      onClick={() => onSelect(item)}
      onMouseEnter={() => setCursor('VIEW', 'card')}
      onMouseLeave={resetCursor}
      className="bg-[#0E1626] border border-[#1E293B] hover:border-cyan-400/50 p-6 rounded-2xl shadow-xl transition-all cursor-pointer flex flex-col justify-between group relative overflow-hidden"
    >
      <div className="space-y-4">
        {/* Type and Date Header */}
        <div className="flex items-center justify-between">
          <span className="text-[10px] font-mono font-bold text-cyan-400 bg-cyan-500/10 px-2.5 py-1 rounded-md border border-cyan-500/20">
            {item.type}
          </span>
          <span className="text-xs font-mono text-slate-400 flex items-center space-x-1">
            <Calendar className="w-3.5 h-3.5 mr-1" />
            {item.date}
          </span>
        </div>

        {/* Title & Subtitle */}
        <div>
          <h4 className="text-base font-bold text-white group-hover:text-cyan-300 transition-colors">
            {item.title}
          </h4>
          <p className="text-xs font-mono text-slate-400 mt-0.5">
            {item.subtitle || item.summary}
          </p>
        </div>

        {/* Verbatim Quote Snippet */}
        <div className="p-3.5 rounded-xl bg-[#05070D]/70 border border-[#1E293B] text-xs text-slate-300 italic relative">
          <Quote className="w-3.5 h-3.5 text-cyan-400/60 mb-1" />
          <p className="line-clamp-2">&quot;{item.quote}&quot;</p>
        </div>
      </div>

      {/* Footer Info & Action */}
      <div className="mt-5 pt-4 border-t border-white/5 flex items-center justify-between text-xs font-mono text-slate-400">
        <span className="flex items-center space-x-1 truncate max-w-[180px]">
          <User className="w-3.5 h-3.5 text-slate-500 mr-1 shrink-0" />
          <span className="truncate">{item.author}</span>
        </span>

        <span className="text-cyan-400 flex items-center space-x-1 font-bold group-hover:translate-x-0.5 transition-transform">
          <span>INSPECT</span>
          <ExternalLink className="w-3.5 h-3.5" />
        </span>
      </div>
    </motion.div>
  );
}
