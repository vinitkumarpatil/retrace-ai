'use client';

import React from 'react';
import { X, FileText, Calendar, Database } from 'lucide-react';
import { DocumentItem } from '@/lib/types';

interface DocumentLibraryProps {
  isOpen: boolean;
  onClose: () => void;
  documents: DocumentItem[];
}

export default function DocumentLibrary({ isOpen, onClose, documents }: DocumentLibraryProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-fade-in">
      <div className="w-full max-w-2xl panel brackets overflow-hidden flex flex-col max-h-[85vh]">

        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-console-border">
          <div className="flex items-center gap-2">
            <Database className="w-4 h-4 text-console-cyan" />
            <h2 className="text-xs font-mono font-bold text-white uppercase tracking-wider">
              Document Archive
              <span className="text-console-mute ml-1.5">({documents.length})</span>
            </h2>
          </div>
          <button onClick={onClose} className="text-console-mute hover:text-white p-1 rounded transition-colors">
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* List */}
        <div className="p-6 overflow-y-auto space-y-3">
          {documents.length === 0 ? (
            <p className="text-center py-10 text-xs font-mono text-console-mute">
              NO DOCUMENTS INGESTED YET. LOAD THE DEMO TO GET STARTED.
            </p>
          ) : (
            documents.map((doc) => (
              <div key={doc.id} className="inset-tile p-4 hover:border-console-border-strong transition-colors">
                <div className="flex items-center justify-between gap-2 mb-1.5">
                  <div className="flex items-center gap-2 min-w-0">
                    <FileText className="w-4 h-4 text-console-mute shrink-0" />
                    <h3 className="text-xs font-semibold text-white font-mono truncate">
                      {doc.title}
                    </h3>
                  </div>
                  <span className="text-[10px] font-mono uppercase px-2 py-0.5 rounded bg-console-s3 border border-console-border text-console-dim font-semibold shrink-0">
                    {doc.source_type}
                  </span>
                </div>

                <p className="text-xs text-console-dim line-clamp-2 mb-2">
                  {doc.content_preview}
                </p>

                <div className="flex items-center gap-4 text-[11px] font-mono text-console-mute pt-2 border-t border-console-border">
                  <span className="flex items-center gap-1">
                    <Calendar className="w-3 h-3" />
                    {new Date(doc.created_at).toLocaleDateString()}
                  </span>
                  <span>entities: {doc.entity_count || 0}</span>
                  <span>events: {doc.event_count || 0}</span>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Footer */}
        <div className="p-3 border-t border-console-border text-right">
          <button
            onClick={onClose}
            className="px-4 py-1.5 text-xs font-medium bg-console-s2 border border-console-border hover:bg-console-s3 hover:text-white rounded-lg text-console-dim transition-colors"
          >
            Close
          </button>
        </div>

      </div>
    </div>
  );
}
