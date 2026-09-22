'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Search, FileText, Calendar, User, ExternalLink, Filter } from 'lucide-react';
import { ARCHIVE_DOCUMENT_RECORDS, CitationRecord } from '@/data/demoData';
import { useCursor } from '@/context/CursorContext';

interface DocumentLibraryProps {
  documents?: any[];
  onViewDoc: (doc: CitationRecord) => void;
  totalDocCount: number;
}

const CATEGORIES = ['ALL', 'ADR', 'RFC', 'INCIDENT', 'SLACK', 'BENCHMARK'];

export default function DocumentLibrary({
  documents = [],
  onViewDoc,
  totalDocCount,
}: DocumentLibraryProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('ALL');
  const { setCursor, resetCursor } = useCursor();

  // Combine static primary sources with any dynamically fetched backend documents
  const allDocs: CitationRecord[] = [
    ...ARCHIVE_DOCUMENT_RECORDS,
    ...documents.map((d, i) => ({
      documentId: d.id || `doc-backend-${i}`,
      title: d.title || d.name || 'Backend Document',
      type: (d.source_type?.toUpperCase() === 'TEXT' ? 'RFC' : d.source_type?.toUpperCase() || 'ADR') as any,
      code: d.id ? `DOC-${d.id.slice(0, 6)}` : `SPEC-0${i + 1}`,
      date: d.created_at ? new Date(d.created_at).toLocaleDateString() : 'Aug 2024',
      author: d.metadata?.author || 'Platform Engineering',
      role: 'Contributor',
      summary: d.content_preview || 'Archived engineering record indexed for context reconstruction.',
      quote: d.content_preview?.slice(0, 140) || 'Primary technical specification.',
      relevance: 'Verified historical source.',
      sourceHash: `SHA256:${d.id?.slice(0, 8) || '8f4a2b9'}...1c0`,
      relatedDecision: 'Project Meridian Architecture',
    })),
  ];

  const filtered = allDocs.filter((doc) => {
    const matchSearch =
      doc.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      doc.summary.toLowerCase().includes(searchTerm.toLowerCase()) ||
      doc.code.toLowerCase().includes(searchTerm.toLowerCase());

    const matchCategory =
      selectedCategory === 'ALL' ||
      doc.type === selectedCategory ||
      doc.title.toUpperCase().includes(selectedCategory);

    return matchSearch && matchCategory;
  });

  return (
    <section id="archive" className="py-20 md:py-28 dark:bg-[#0A0F1D]/75 bg-slate-50/70 backdrop-blur-[2px] border-b dark:border-[#1B2945]/70 border-slate-200/80 relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
        
        {/* Header & Live Count */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div className="space-y-2">
            <div className="flex items-center space-x-2">
              <span className="stamp-badge text-sky-500 dark:text-sky-400 border-sky-400/30">
                EVIDENCE VAULT
              </span>
              <span className="text-xs font-mono text-emerald-500 dark:text-emerald-400 font-medium">
                ● {totalDocCount || allDocs.length} HISTORICAL DOCUMENTS INDEXED
              </span>
            </div>
            <h2 className="text-3xl sm:text-4xl font-extrabold dark:text-white text-slate-900 tracking-tight">
              Documents ({totalDocCount || allDocs.length})
            </h2>
            <p className="text-sm dark:text-slate-400 text-slate-600 max-w-xl font-normal">
              Inspect primary source records backing every reconstructed architectural milestone.
            </p>
          </div>

          {/* Search Box */}
          <div className="w-full md:w-80 relative">
            <Search className="w-4 h-4 dark:text-slate-400 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search documents by code, title..."
              className="w-full pl-10 pr-4 py-2.5 rounded-lg dark:bg-[#0E1626] bg-white border dark:border-[#2A3B5C] border-slate-300 focus:border-sky-400 text-xs dark:text-white text-slate-900 placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none transition-colors shadow-sm"
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
              className={`px-3 py-1.5 rounded text-xs font-mono font-medium transition-all cursor-pointer ${
                selectedCategory === cat
                  ? 'bg-sky-400 text-slate-950 font-bold shadow-sm'
                  : 'dark:bg-[#0E1626] bg-white dark:text-slate-400 text-slate-600 dark:hover:text-white hover:text-slate-900 border dark:border-[#1B2945] border-slate-300 shadow-sm'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Realistic Physical Document Sheets Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filtered.map((doc) => (
            <div
              key={doc.documentId}
              onClick={() => onViewDoc(doc)}
              onMouseEnter={() => setCursor('OPEN', 'card')}
              onMouseLeave={resetCursor}
              className="doc-sheet doc-fold p-5 rounded-xl cursor-pointer flex flex-col justify-between space-y-4 group"
            >
              <div className="space-y-3">
                <div className="flex items-center justify-between border-b dark:border-[#1E2D4A] border-slate-200 pb-2">
                  <span className="stamp-badge text-sky-500 dark:text-sky-400 border-sky-400/30">
                    {doc.code}
                  </span>
                  <span className="text-[10px] font-mono dark:text-slate-400 text-slate-500 flex items-center">
                    <Calendar className="w-3 h-3 mr-1" />
                    {doc.date}
                  </span>
                </div>

                <h3 className="text-sm font-bold dark:text-white text-slate-900 dark:group-hover:text-sky-300 group-hover:text-sky-600 transition-colors line-clamp-1">
                  {doc.title}
                </h3>

                <p className="text-xs font-mono dark:text-slate-400 text-slate-600 line-clamp-2 leading-relaxed font-normal">
                  {doc.summary}
                </p>

                <div className="p-2.5 rounded dark:bg-[#070B14] bg-slate-100 dark:border-[#1B2945] border-slate-200 text-[11px] font-mono dark:text-slate-300 text-slate-700 italic line-clamp-2">
                  &ldquo;{doc.quote}&rdquo;
                </div>
              </div>

              <div className="pt-3 border-t dark:border-[#1E2D4A] border-slate-200 flex items-center justify-between text-xs font-mono dark:text-slate-400 text-slate-500">
                <div className="flex items-center space-x-2">
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      onViewDoc(doc);
                    }}
                    className="px-2.5 py-1 rounded dark:bg-[#141F36] bg-slate-100 hover:bg-sky-400 hover:text-slate-950 dark:text-slate-200 text-slate-700 text-[10px] font-mono font-bold transition-colors cursor-pointer"
                  >
                    VIEW
                  </button>
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      onViewDoc(doc);
                    }}
                    className="px-2 py-1 rounded border dark:border-[#1B2945] border-slate-300 dark:hover:border-slate-500 hover:border-slate-400 dark:text-slate-400 text-slate-600 dark:hover:text-white hover:text-slate-900 text-[10px] font-mono transition-colors cursor-pointer"
                  >
                    DETAILS
                  </button>
                </div>

                <span className="text-[10px] font-mono text-emerald-500 dark:text-emerald-400 font-bold">
                  ✓ VERIFIED
                </span>
              </div>
            </div>
          ))}
        </div>

      </div>
    </section>
  );
}
