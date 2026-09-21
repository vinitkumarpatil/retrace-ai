'use client';

import React, { useState, useEffect } from 'react';
import { 
  X, 
  FileText, 
  Calendar, 
  Database, 
  Search, 
  Filter, 
  Sparkles, 
  Layers, 
  Clock 
} from 'lucide-react';
import { DocumentItem } from '@/lib/types';

interface DocumentLibraryProps {
  isOpen: boolean;
  onClose: () => void;
  documents: DocumentItem[];
}

export default function DocumentLibrary({ isOpen, onClose, documents }: DocumentLibraryProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedType, setSelectedType] = useState<string>('all');

  // Handle ESC key to dismiss
  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const filteredDocs = documents.filter(doc => {
    const matchesSearch = !searchTerm.trim() ||
      doc.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      doc.content_preview.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesType = selectedType === 'all' || doc.source_type.toLowerCase() === selectedType;

    return matchesSearch && matchesType;
  });

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 dark:bg-black/70 backdrop-blur-xs transition-opacity"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
      role="dialog"
      aria-modal="true"
      aria-labelledby="doc-library-title"
    >
      <div className="w-full max-w-2xl bg-white dark:bg-[#0F172A] border border-slate-200 dark:border-slate-800 rounded-2xl shadow-floating overflow-hidden relative flex flex-col max-h-[85vh] transition-all">
        
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-[#090D16]/50">
          <div className="flex items-center space-x-2.5">
            <div className="p-2 bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 rounded-lg">
              <Database className="w-4 h-4" />
            </div>
            <div>
              <h2 id="doc-library-title" className="text-sm font-semibold text-slate-900 dark:text-white tracking-tight">
                Indexed Document Archive
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                {documents.length} historical artifacts available for context reconstruction
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            aria-label="Close document library"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Search & Filter Controls */}
        <div className="p-4 border-b border-slate-100 dark:border-slate-800 bg-white dark:bg-[#0F172A] flex flex-wrap items-center gap-3">
          <div className="relative flex-1 min-w-[200px]">
            <Search className="w-3.5 h-3.5 absolute left-3 top-3 text-slate-400 dark:text-slate-500" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search document titles or previews..."
              className="w-full pl-8 pr-3 py-2 bg-slate-50 dark:bg-[#0B0F19] border border-slate-200 dark:border-slate-800 rounded-xl text-xs text-slate-800 dark:text-slate-200 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
            />
          </div>

          {/* Type filters */}
          <div className="flex items-center space-x-1 text-xs">
            {['all', 'pdf', 'image', 'text', 'url'].map((type) => (
              <button
                key={type}
                onClick={() => setSelectedType(type)}
                className={`px-2.5 py-1 rounded-full capitalize text-[11px] font-medium transition-colors ${
                  selectedType === type
                    ? 'bg-indigo-600 text-white shadow-2xs'
                    : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700'
                }`}
              >
                {type}
              </button>
            ))}
          </div>
        </div>

        {/* List */}
        <div className="p-6 overflow-y-auto space-y-3.5 flex-1">
          {filteredDocs.length === 0 ? (
            <div className="text-center py-12 text-xs text-slate-400 dark:text-slate-500">
              <FileText className="w-8 h-8 mx-auto text-slate-300 dark:text-slate-600 mb-2" />
              {documents.length === 0
                ? 'No documents indexed yet. Click "Load Meridian Scenario" in the navigation bar to start.'
                : 'No documents match your search criteria.'}
            </div>
          ) : (
            filteredDocs.map((doc) => (
              <div
                key={doc.id}
                className="p-4 rounded-xl bg-slate-50/50 dark:bg-[#0B0F19] border border-slate-200 dark:border-slate-800/80 hover:border-slate-300 dark:hover:border-slate-700 transition-all shadow-2xs"
              >
                <div className="flex items-center justify-between gap-2 mb-2">
                  <div className="flex items-center space-x-2">
                    <FileText className="w-4 h-4 text-indigo-500 dark:text-indigo-400 shrink-0" />
                    <h3 className="text-xs font-semibold text-slate-900 dark:text-white">
                      {doc.title}
                    </h3>
                  </div>
                  <span className="text-[10px] font-medium uppercase px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300">
                    {doc.source_type}
                  </span>
                </div>

                <p className="text-xs text-slate-600 dark:text-slate-300 line-clamp-2 mb-3 leading-relaxed">
                  {doc.content_preview}
                </p>

                <div className="flex items-center space-x-4 text-[11px] text-slate-500 dark:text-slate-400 pt-2.5 border-t border-slate-100 dark:border-slate-800/80">
                  <span className="flex items-center space-x-1">
                    <Calendar className="w-3 h-3 text-slate-400" />
                    <span>{new Date(doc.created_at).toLocaleDateString()}</span>
                  </span>
                  <span>{doc.entity_count || 0} entities</span>
                  <span>{doc.event_count || 0} milestones</span>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-[#090D16]/50 flex items-center justify-between">
          <span className="text-xs text-slate-500 dark:text-slate-400">
            Showing {filteredDocs.length} of {documents.length} artifacts
          </span>
          <button
            onClick={onClose}
            className="px-4 py-1.5 text-xs font-medium bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800 rounded-lg text-slate-700 dark:text-slate-200 shadow-2xs transition-colors"
          >
            Close Archive
          </button>
        </div>

      </div>
    </div>
  );
}
