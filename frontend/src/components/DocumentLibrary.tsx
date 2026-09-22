'use client';

import React, { useState, useEffect } from 'react';
import { X, FileText, Search } from 'lucide-react';
import { DocumentItem } from '@/lib/types';

interface DocumentLibraryProps {
  isOpen: boolean;
  onClose: () => void;
  documents: DocumentItem[];
}

export default function DocumentLibrary({ isOpen, onClose, documents }: DocumentLibraryProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedType, setSelectedType] = useState<string>('all');

  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
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
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-ink/40 backdrop-blur-[2px]"
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
      role="dialog" aria-modal="true" aria-labelledby="doc-library-title"
    >
      <div className="w-full max-w-2xl bg-sheet border border-rule-strong rounded-card shadow-modal overflow-hidden flex flex-col max-h-[85vh]">
        <div className="flex items-center justify-between px-5 py-4 border-b border-rule bg-paper/50">
          <div>
            <div className="field-label mb-0.5">The archive</div>
            <h2 id="doc-library-title" className="font-serif text-[17px] font-semibold text-ink">
              Indexed documents
            </h2>
          </div>
          <button onClick={onClose} className="p-1.5 text-ink-faint hover:text-ink rounded-sheet hover:bg-sheet transition-colors" aria-label="Close">
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="px-5 py-3.5 border-b border-rule flex flex-wrap items-center gap-3">
          <div className="relative flex-1 min-w-[200px]">
            <Search className="w-3.5 h-3.5 absolute left-3 top-2.5 text-ink-faint" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search titles and contents…"
              className="w-full pl-8 pr-3 py-2 bg-paper border border-rule rounded-sheet text-[13px] text-ink placeholder:text-ink-faint focus:outline-none focus:border-stamp/60"
            />
          </div>
          <div className="flex items-center gap-1">
            {['all', 'pdf', 'image', 'text', 'url'].map((type) => (
              <button
                key={type}
                onClick={() => setSelectedType(type)}
                className={`px-2.5 py-1 rounded-sheet capitalize text-[11.5px] font-medium transition-colors ${
                  selectedType === type
                    ? 'bg-ink text-paper'
                    : 'bg-paper border border-rule text-ink-soft hover:border-rule-strong hover:text-ink'
                }`}
              >
                {type}
              </button>
            ))}
          </div>
        </div>

        <div className="p-5 overflow-y-auto space-y-3 flex-1">
          {filteredDocs.length === 0 ? (
            <div className="text-center py-14">
              <FileText className="w-8 h-8 mx-auto text-rule-strong mb-2" />
              <p className="text-[13px] text-ink-faint">
                {documents.length === 0
                  ? 'Nothing indexed yet. Load the sample case, or add a document to get started.'
                  : 'No documents match your search.'}
              </p>
            </div>
          ) : (
            filteredDocs.map((doc) => (
              <div key={doc.id} className="rounded-card border border-rule bg-paper/50 hover:border-rule-strong transition-colors p-4">
                <div className="flex items-center justify-between gap-2 mb-2">
                  <div className="flex items-center gap-2 min-w-0">
                    <FileText className="w-4 h-4 text-ink-faint shrink-0" />
                    <h3 className="text-[13.5px] font-semibold text-ink truncate">{doc.title}</h3>
                  </div>
                  <span className="catalog uppercase shrink-0">{doc.source_type}</span>
                </div>
                <p className="text-[13px] text-ink-soft leading-relaxed line-clamp-2 mb-3">{doc.content_preview}</p>
                <div className="flex items-center gap-4 pt-2.5 border-t border-rule catalog">
                  <span>{new Date(doc.created_at).toLocaleDateString()}</span>
                  <span>{doc.entity_count || 0} entities</span>
                  <span>{doc.event_count || 0} events</span>
                </div>
              </div>
            ))
          )}
        </div>

        <div className="px-5 py-3.5 border-t border-rule bg-paper/50 flex items-center justify-between">
          <span className="catalog">{filteredDocs.length} of {documents.length} shown</span>
          <button onClick={onClose} className="px-4 py-1.5 text-[13px] font-medium bg-paper border border-rule hover:border-rule-strong hover:bg-sheet rounded-sheet text-ink-soft hover:text-ink transition-colors">
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
