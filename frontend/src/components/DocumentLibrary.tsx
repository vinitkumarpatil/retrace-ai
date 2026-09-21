'use client';

import React, { useState, useMemo } from 'react';
import { X, Search, FileText, Calendar, Filter, ArrowUpDown, ChevronLeft, ChevronRight, Download, Eye, Layers } from 'lucide-react';
import { DocumentItem } from '@/lib/types';

interface DocumentLibraryProps {
  isOpen: boolean;
  onClose: () => void;
  documents: DocumentItem[];
  onInspectDocument?: (doc: DocumentItem) => void;
}

export default function DocumentLibrary({
  isOpen,
  onClose,
  documents,
  onInspectDocument,
}: DocumentLibraryProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [typeFilter, setTypeFilter] = useState('all');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [page, setPage] = useState(1);
  const pageSize = 8;
  const [previewDoc, setPreviewDoc] = useState<DocumentItem | null>(null);

  const filteredAndSorted = useMemo(() => {
    let result = (documents || []).filter((doc) => {
      if (typeFilter !== 'all' && doc.source_type.toLowerCase() !== typeFilter.toLowerCase()) {
        return false;
      }
      if (searchTerm.trim()) {
        const q = searchTerm.toLowerCase();
        return (
          doc.title.toLowerCase().includes(q) ||
          (doc.content_preview || '').toLowerCase().includes(q)
        );
      }
      return true;
    });

    result.sort((a, b) => {
      const d1 = new Date(a.created_at).getTime();
      const d2 = new Date(b.created_at).getTime();
      return sortOrder === 'asc' ? d1 - d2 : d2 - d1;
    });

    return result;
  }, [documents, typeFilter, searchTerm, sortOrder]);

  const totalPages = Math.max(1, Math.ceil(filteredAndSorted.length / pageSize));
  const paginatedDocs = filteredAndSorted.slice((page - 1) * pageSize, page * pageSize);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in">
      <div className="w-full max-w-5xl bg-[#0B101A] border border-[#243044] rounded-xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-[#243044] bg-[#101722]">
          <div className="flex items-center space-x-2.5">
            <div className="p-1.5 rounded-lg bg-[#10B981]/10 text-[#10B981] border border-[#10B981]/30">
              <FileText className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-xs font-mono font-bold text-white uppercase tracking-wider">
                HISTORICAL EVIDENCE ARCHIVE ({documents.length} ARTIFACTS)
              </h2>
              <p className="text-[11px] font-mono text-[#94A3B8]">
                SEARCHABLE RECORD STORE & ENTITY EXTRACTION DATABASE
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="text-[#94A3B8] hover:text-white p-1 rounded-md transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Filters and Controls */}
        <div className="p-4 border-b border-[#243044] bg-[#05070D] flex flex-wrap items-center justify-between gap-3 text-xs font-mono">
          <div className="flex items-center space-x-2">
            <span className="text-[#64748B] text-[10px] uppercase">Type:</span>
            {['all', 'text', 'pdf', 'url'].map((t) => (
              <button
                key={t}
                onClick={() => {
                  setTypeFilter(t);
                  setPage(1);
                }}
                className={`px-2.5 py-1 rounded uppercase transition-all ${
                  typeFilter === t
                    ? 'bg-[#00F2FE] text-black font-bold'
                    : 'bg-[#101722] text-[#94A3B8] hover:text-white border border-[#243044]'
                }`}
              >
                {t}
              </button>
            ))}
          </div>

          <div className="flex items-center space-x-2">
            <div className="relative">
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => {
                  setSearchTerm(e.target.value);
                  setPage(1);
                }}
                placeholder="Search archive artifacts..."
                className="w-52 pl-7 pr-2 py-1.5 bg-[#101722] border border-[#243044] rounded text-white text-xs font-mono placeholder:text-[#64748B] focus:outline-none focus:border-[#00F2FE]"
              />
              <Search className="w-3.5 h-3.5 text-[#64748B] absolute left-2 top-2" />
            </div>

            <button
              onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
              className="p-1.5 rounded bg-[#101722] text-[#94A3B8] hover:text-white border border-[#243044] flex items-center space-x-1"
              title="Toggle sort date"
            >
              <ArrowUpDown className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Data Table */}
        <div className="flex-1 overflow-y-auto bg-[#05070D]">
          <table className="w-full text-left text-xs font-mono border-collapse">
            <thead className="bg-[#101722] text-[#94A3B8] text-[10px] uppercase border-b border-[#243044] sticky top-0 z-10">
              <tr>
                <th className="py-2.5 px-4">Artifact</th>
                <th className="py-2.5 px-3">Type</th>
                <th className="py-2.5 px-3">Date</th>
                <th className="py-2.5 px-3">Source</th>
                <th className="py-2.5 px-3">Status</th>
                <th className="py-2.5 px-3">Evidence</th>
                <th className="py-2.5 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#243044]/60">
              {paginatedDocs.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-[#94A3B8]">
                    No artifacts matching query found in historical store.
                  </td>
                </tr>
              ) : (
                paginatedDocs.map((doc) => (
                  <tr
                    key={doc.id}
                    className="hover:bg-[#101722]/80 transition-colors group"
                  >
                    {/* Artifact Title */}
                    <td className="py-3 px-4">
                      <div className="flex items-center space-x-2">
                        <FileText className="w-4 h-4 text-[#00F2FE] shrink-0" />
                        <span className="font-bold text-white font-sans truncate max-w-xs">
                          {doc.title}
                        </span>
                      </div>
                    </td>

                    {/* Type */}
                    <td className="py-3 px-3">
                      <span className="text-[10px] uppercase px-1.5 py-0.5 rounded bg-[#151D29] border border-[#243044] text-[#00F2FE]">
                        {doc.source_type}
                      </span>
                    </td>

                    {/* Date */}
                    <td className="py-3 px-3 text-[#94A3B8]">
                      {new Date(doc.created_at).toLocaleDateString()}
                    </td>

                    {/* Source */}
                    <td className="py-3 px-3 text-[#94A3B8] truncate max-w-[120px]">
                      {doc.metadata?.document_type || doc.source_type}
                    </td>

                    {/* Status */}
                    <td className="py-3 px-3">
                      <span className="text-[10px] px-1.5 py-0.5 rounded font-bold bg-[#10B981]/15 text-[#10B981] border border-[#10B981]/30">
                        Indexed
                      </span>
                    </td>

                    {/* Evidence */}
                    <td className="py-3 px-3 text-[#94A3B8]">
                      {doc.entity_count || 0} entities / {doc.event_count || 0} events
                    </td>

                    {/* Actions */}
                    <td className="py-3 px-4 text-right">
                      <button
                        onClick={() => {
                          if (onInspectDocument) {
                            onInspectDocument(doc);
                            onClose();
                          } else {
                            setPreviewDoc(previewDoc?.id === doc.id ? null : doc);
                          }
                        }}
                        className="px-2.5 py-1 rounded text-[11px] text-[#00F2FE] hover:bg-[#00F2FE]/10 border border-[#00F2FE]/30 transition-all font-bold"
                      >
                        Inspect
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination & Footer */}
        <div className="p-3.5 border-t border-[#243044] bg-[#101722] flex items-center justify-between text-xs font-mono">
          <span className="text-[#94A3B8]">
            Showing page {page} of {totalPages} ({filteredAndSorted.length} artifacts)
          </span>

          <div className="flex items-center space-x-2">
            <button
              disabled={page <= 1}
              onClick={() => setPage(page - 1)}
              className="p-1.5 rounded bg-[#151D29] text-[#94A3B8] hover:text-white disabled:opacity-40 border border-[#243044]"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button
              disabled={page >= totalPages}
              onClick={() => setPage(page + 1)}
              className="p-1.5 rounded bg-[#151D29] text-[#94A3B8] hover:text-white disabled:opacity-40 border border-[#243044]"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>

      </div>
    </div>
  );
}
