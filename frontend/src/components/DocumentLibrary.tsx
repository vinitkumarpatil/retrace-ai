'use client';

import React, { useState, useMemo } from 'react';
import { X, FileText, Calendar, Database, Search, Layers, ExternalLink, ShieldCheck } from 'lucide-react';
import { DocumentItem } from '@/lib/types';

interface DocumentLibraryProps {
  isOpen: boolean;
  onClose: () => void;
  documents: DocumentItem[];
}

export default function DocumentLibrary({ isOpen, onClose, documents }: DocumentLibraryProps) {
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [sourceFilter, setSourceFilter] = useState<string>('all');
  const [selectedDoc, setSelectedDoc] = useState<DocumentItem | null>(null);

  const filteredDocs = useMemo(() => {
    return (documents || []).filter((doc) => {
      if (sourceFilter !== 'all' && doc.source_type.toLowerCase() !== sourceFilter.toLowerCase()) {
        return false;
      }
      if (searchTerm.trim()) {
        const q = searchTerm.toLowerCase();
        const inTitle = doc.title.toLowerCase().includes(q);
        const inContent = (doc.content_preview || '').toLowerCase().includes(q);
        if (!inTitle && !inContent) return false;
      }
      return true;
    });
  }, [documents, sourceFilter, searchTerm]);

  if (!isOpen) return null;

  const getSourceBadge = (type: string) => {
    switch (type.toLowerCase()) {
      case 'pdf':
        return 'bg-rose-500/10 text-rose-300 border-rose-500/30';
      case 'image':
        return 'bg-purple-500/10 text-purple-300 border-purple-500/30';
      case 'url':
        return 'bg-cyan-500/10 text-cyan-300 border-cyan-500/30';
      default:
        return 'bg-amber-500/10 text-amber-300 border-amber-500/30';
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-in fade-in">
      <div className="w-full max-w-3xl bg-[#0F1623] border border-[#202E48] rounded-xl shadow-2xl overflow-hidden relative corner-ticks flex flex-col max-h-[85vh]">
        
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-[#202E48] bg-[#141C2D]">
          <div className="flex items-center space-x-2.5">
            <div className="p-1.5 rounded-lg bg-cyan-500/10 border border-cyan-500/30 text-cyan-400">
              <Database className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-xs font-mono font-bold text-white uppercase tracking-wider">
                INGESTED ARTIFACT ARCHIVE ({documents.length} RECORDS)
              </h2>
              <p className="text-[11px] font-mono text-slate-400">
                HISTORICAL DECISION DOCUMENTS, CHUNKS & EXTRACTED ENTITIES
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white p-1 rounded-lg transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Filter & Search Bar */}
        <div className="p-3.5 border-b border-[#202E48] bg-[#0A0E17] flex flex-wrap items-center justify-between gap-2.5 text-xs font-mono">
          <div className="flex items-center space-x-1.5">
            <button
              onClick={() => setSourceFilter('all')}
              className={`px-2.5 py-1 rounded transition-all ${
                sourceFilter === 'all'
                  ? 'bg-amber-400 text-slate-950 font-bold'
                  : 'bg-[#141C2D] text-slate-400 hover:text-slate-200 border border-[#202E48]'
              }`}
            >
              All ({documents.length})
            </button>
            {['text', 'pdf', 'url'].map((st) => (
              <button
                key={st}
                onClick={() => setSourceFilter(st)}
                className={`px-2.5 py-1 rounded uppercase transition-all ${
                  sourceFilter === st
                    ? 'bg-cyan-400 text-slate-950 font-bold'
                    : 'bg-[#141C2D] text-slate-400 hover:text-slate-200 border border-[#202E48]'
                }`}
              >
                {st}
              </button>
            ))}
          </div>

          <div className="relative">
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search archive..."
              className="w-44 pl-7 pr-2 py-1 bg-[#101623] border border-[#202E48] rounded text-slate-200 placeholder:text-slate-500 text-xs font-mono focus:outline-none focus:border-amber-400"
            />
            <Search className="w-3.5 h-3.5 text-slate-500 absolute left-2 top-2" />
          </div>
        </div>

        {/* Documents List */}
        <div className="p-5 overflow-y-auto flex-1 space-y-3 bg-[#0A0E17]">
          {filteredDocs.length === 0 ? (
            <div className="p-8 text-center text-xs font-mono text-slate-500">
              NO MATCHING ARTIFACTS FOUND IN THE KNOWLEDGE STORE.
            </div>
          ) : (
            filteredDocs.map((doc) => {
              const badgeClass = getSourceBadge(doc.source_type);

              return (
                <div
                  key={doc.id}
                  className="p-4 rounded-xl bg-[#101625] border border-[#202E48] hover:border-[#2E4166] transition-all shadow-md cursor-pointer"
                  onClick={() => setSelectedDoc(selectedDoc?.id === doc.id ? null : doc)}
                >
                  <div className="flex items-center justify-between gap-2 mb-2">
                    <div className="flex items-center space-x-2">
                      <FileText className="w-4 h-4 text-cyan-400 shrink-0" />
                      <h3 className="text-xs font-bold text-white font-mono">
                        {doc.title}
                      </h3>
                    </div>

                    <span
                      className={`text-[10px] font-mono uppercase px-2 py-0.5 rounded border font-semibold ${badgeClass}`}
                    >
                      {doc.source_type}
                    </span>
                  </div>

                  <p className="text-xs text-slate-300 font-sans line-clamp-2 mb-3 leading-relaxed">
                    {doc.content_preview}
                  </p>

                  <div className="flex flex-wrap items-center justify-between gap-2 text-[11px] font-mono text-slate-400 pt-2.5 border-t border-[#202E48]">
                    <span className="flex items-center space-x-1.5 text-slate-500">
                      <Calendar className="w-3 h-3 text-slate-500" />
                      <span>{new Date(doc.created_at).toLocaleDateString()}</span>
                    </span>

                    <div className="flex items-center space-x-3 text-cyan-300">
                      <span>Entities: {doc.entity_count ?? 0}</span>
                      <span>Milestones: {doc.event_count ?? 0}</span>
                    </div>
                  </div>

                  {/* Expanded full preview */}
                  {selectedDoc?.id === doc.id && (
                    <div className="mt-3 pt-3 border-t border-dashed border-[#202E48] text-xs font-mono text-slate-300 bg-[#0A0E17] p-3 rounded-lg">
                      <div className="text-[10px] uppercase text-amber-400 mb-1 font-bold">
                        RAW PREVIEW EXCERPT:
                      </div>
                      <div className="whitespace-pre-wrap leading-relaxed text-slate-200 font-mono text-[11px]">
                        {doc.content_preview}
                      </div>
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>

        {/* Footer */}
        <div className="p-3 border-t border-[#202E48] bg-[#141C2D] flex items-center justify-between">
          <span className="text-xs font-mono text-slate-400">
            Vector Embeddings: 768-dim (Gemini)
          </span>
          <button
            onClick={onClose}
            className="px-4 py-1.5 text-xs font-mono bg-[#1A253A] border border-[#2B3E60] hover:bg-[#223049] rounded-md text-slate-200 transition-colors"
          >
            Close Archive
          </button>
        </div>

      </div>
    </div>
  );
}
