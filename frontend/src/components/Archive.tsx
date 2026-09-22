'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Search, FileText, Calendar, User, ExternalLink, Filter } from 'lucide-react';
import { ARCHIVE_DOCS } from '@/data/demoData';
import { useCursor } from '@/context/CursorContext';

interface ArchiveProps {
  documents?: any[];
  onSelectDoc: (doc: any) => void;
}

const CATEGORIES = ['ALL', 'ADR', 'RFC', 'INCIDENT', 'SLACK', 'BENCHMARK'];

export default function Archive({ documents = [], onSelectDoc }: ArchiveProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('ALL');
  const { setCursor, resetCursor } = useCursor();

  // Merge static pre-loaded docs with any live uploaded ones
  const allDocs = [
    ...ARCHIVE_DOCS,
    ...documents.map((d) => ({
      id: d.id || d.name,
      title: d.title || d.name,
      type: d.category || 'Uploaded Doc',
      category: d.category || 'ADR',
      date: d.date || 'Just now',
      author: d.author || 'Uploaded User',
      summary: d.summary || 'Custom ingested document into ReTrace context memory.',
      quote: d.quote || 'Document indexed for architectural reconstruction.',
      relatedDecision: 'Custom Project Knowledge Base',
    })),
  ];

  // Filtering
  const filtered = allDocs.filter((doc) => {
    const matchesSearch =
      doc.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      doc.summary.toLowerCase().includes(searchTerm.toLowerCase()) ||
      doc.type.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesCategory =
      selectedCategory === 'ALL' ||
      doc.type.toUpperCase().includes(selectedCategory) ||
      doc.title.toUpperCase().includes(selectedCategory);

    return matchesSearch && matchesCategory;
  });

  return (
    <section id="archive" className="py-20 md:py-28 bg-[#070D1A] relative border-t border-[#1E293B]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
        
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div className="space-y-2">
            <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 text-xs font-mono font-medium">
              <FileText className="w-3.5 h-3.5" />
              <span>FORENSIC ARCHIVE</span>
            </div>
            <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-white">
              Evidence Document Library
            </h2>
            <p className="text-sm text-slate-400 max-w-xl font-normal">
              Explore primary source records that back every reconstructed architectural decision.
            </p>
          </div>

          {/* Search Box */}
          <div className="w-full md:w-80 relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search archive..."
              className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-[#0E1626] border border-[#1E293B] focus:border-cyan-400 text-xs text-white placeholder-slate-500 focus:outline-none transition-colors"
            />
          </div>
        </div>

        {/* Category Filters */}
        <div className="flex flex-wrap items-center gap-2">
          {CATEGORIES.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              onMouseEnter={() => setCursor('FILTER', 'button')}
              onMouseLeave={resetCursor}
              className={`px-3 py-1.5 rounded-lg text-xs font-mono font-semibold transition-all cursor-pointer ${
                selectedCategory === cat
                  ? 'bg-cyan-400 text-slate-950 font-bold shadow-md shadow-cyan-400/20'
                  : 'bg-[#0E1626] text-slate-400 hover:text-white border border-[#1E293B]'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Document Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filtered.map((doc: any, idx) => (
            <motion.div
              key={(doc.documentId || doc.id || idx) + String(idx)}
              initial={{ opacity: 0, y: 15 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.35, delay: idx * 0.05 }}
              whileHover={{ y: -4, scale: 1.015 }}
              onClick={() => onSelectDoc(doc)}
              onMouseEnter={() => setCursor('INSPECT', 'card')}
              onMouseLeave={resetCursor}
              className="p-6 rounded-2xl bg-[#0E1626] border border-[#1E293B] hover:border-cyan-500/40 shadow-lg transition-all cursor-pointer flex flex-col justify-between group"
            >
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-mono font-bold text-cyan-400 bg-cyan-500/10 px-2 py-0.5 rounded">
                    {doc.type}
                  </span>
                  <span className="text-[11px] font-mono text-slate-400 flex items-center">
                    <Calendar className="w-3 h-3 mr-1" />
                    {doc.date}
                  </span>
                </div>

                <h3 className="text-sm font-bold text-white group-hover:text-cyan-300 transition-colors line-clamp-1">
                  {doc.title}
                </h3>

                <p className="text-xs text-slate-400 line-clamp-2 leading-relaxed font-normal">
                  {doc.summary}
                </p>
              </div>

              <div className="mt-5 pt-3 border-t border-white/5 flex items-center justify-between text-xs font-mono text-slate-500">
                <span className="flex items-center truncate max-w-[160px]">
                  <User className="w-3 h-3 text-slate-500 mr-1 shrink-0" />
                  <span className="truncate">{doc.author}</span>
                </span>

                <span className="text-cyan-400 font-bold flex items-center space-x-1 group-hover:translate-x-0.5 transition-transform">
                  <span>VIEW</span>
                  <ExternalLink className="w-3 h-3" />
                </span>
              </div>
            </motion.div>
          ))}
        </div>

      </div>
    </section>
  );
}
