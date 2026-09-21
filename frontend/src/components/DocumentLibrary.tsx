'use client';

import React from 'react';
import { X, FileText, Calendar, Database, Layers } from 'lucide-react';
import { DocumentItem } from '@/lib/types';

interface DocumentLibraryProps {
  isOpen: boolean;
  onClose: () => void;
  documents: DocumentItem[];
}

export default function DocumentLibrary({ isOpen, onClose, documents }: DocumentLibraryProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-900/50 backdrop-blur-xs">
      <div className="w-full max-w-2xl bg-white border border-[#E2DDD5] rounded-md shadow-xl overflow-hidden relative corner-ticks flex flex-col max-h-[85vh]">
        
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-[#E2DDD5] bg-[#FAF8F5]">
          <div className="flex items-center space-x-2">
            <Database className="w-4 h-4 text-stone-700" />
            <h2 className="text-xs font-mono font-bold text-stone-900 uppercase tracking-wider">
              INGESTED DOCUMENT ARCHIVE ({documents.length} ARTIFACTS)
            </h2>
          </div>
          <button onClick={onClose} className="text-stone-400 hover:text-stone-700 p-1 rounded">
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* List */}
        <div className="p-6 overflow-y-auto space-y-4">
          {documents.length === 0 ? (
            <p className="text-center py-8 text-xs font-mono text-stone-400">
              NO DOCUMENTS INGESTED YET. CLICK "LOAD MERIDIAN DEMO" TO GET STARTED.
            </p>
          ) : (
            documents.map((doc) => (
              <div
                key={doc.id}
                className="p-4 rounded bg-[#FAF8F5] border border-[#E2DDD5] hover:border-stone-400 transition-colors"
              >
                <div className="flex items-center justify-between gap-2 mb-1.5">
                  <div className="flex items-center space-x-2">
                    <FileText className="w-4 h-4 text-stone-500 shrink-0" />
                    <h3 className="text-xs font-bold text-stone-900 font-mono">
                      {doc.title}
                    </h3>
                  </div>
                  <span className="text-[10px] font-mono uppercase px-2 py-0.5 rounded bg-stone-100 border border-stone-200 text-stone-700 font-semibold">
                    {doc.source_type}
                  </span>
                </div>

                <p className="text-xs text-stone-600 font-sans line-clamp-2 mb-2">
                  {doc.content_preview}
                </p>

                <div className="flex items-center space-x-4 text-[11px] font-mono text-stone-500 pt-2 border-t border-dashed border-[#E2DDD5]">
                  <span className="flex items-center space-x-1">
                    <Calendar className="w-3 h-3 text-stone-400" />
                    <span>{new Date(doc.created_at).toLocaleDateString()}</span>
                  </span>
                  <span>Entities: {doc.entity_count || 0}</span>
                  <span>Milestones: {doc.event_count || 0}</span>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Footer */}
        <div className="p-3 border-t border-[#E2DDD5] bg-[#FAF8F5] text-right">
          <button
            onClick={onClose}
            className="px-4 py-1.5 text-xs font-mono bg-white border border-[#E2DDD5] hover:bg-stone-50 rounded text-stone-700 shadow-2xs"
          >
            Close Archive
          </button>
        </div>

      </div>
    </div>
  );
}
