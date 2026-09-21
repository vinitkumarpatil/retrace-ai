'use client';

import React, { useEffect } from 'react';
import { X, Clock, ArrowRight, Trash2, History } from 'lucide-react';
import { QueryHistoryItem } from '@/lib/types';

interface HistoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  history: QueryHistoryItem[];
  onSelectQuery: (query: string) => void;
  onClearHistory: () => void;
}

export default function HistoryModal({
  isOpen,
  onClose,
  history,
  onSelectQuery,
  onClearHistory,
}: HistoryModalProps) {
  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 dark:bg-black/70 backdrop-blur-xs transition-opacity"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
      role="dialog"
      aria-modal="true"
      aria-labelledby="history-dialog-title"
    >
      <div className="w-full max-w-lg bg-white dark:bg-[#0F172A] border border-slate-200 dark:border-slate-800 rounded-2xl shadow-floating overflow-hidden relative flex flex-col max-h-[80vh] transition-all">
        
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-[#090D16]/50">
          <div className="flex items-center space-x-2.5">
            <div className="p-2 bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 rounded-lg">
              <History className="w-4 h-4" />
            </div>
            <div>
              <h2 id="history-dialog-title" className="text-sm font-semibold text-slate-900 dark:text-white tracking-tight">
                Recent Inquiries
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                {history.length} past searches in this browser session
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            aria-label="Close dialog"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* History List */}
        <div className="p-5 overflow-y-auto space-y-2.5 flex-1">
          {history.length === 0 ? (
            <div className="text-center py-12 text-xs text-slate-400 dark:text-slate-500">
              <Clock className="w-8 h-8 mx-auto text-slate-300 dark:text-slate-600 mb-2" />
              No past inquiries in this session.
            </div>
          ) : (
            history.map((item) => (
              <div
                key={item.id}
                onClick={() => {
                  onSelectQuery(item.query);
                  onClose();
                }}
                className="p-3.5 rounded-xl bg-slate-50/50 dark:bg-[#0B0F19] border border-slate-200 dark:border-slate-800/80 hover:border-indigo-400 dark:hover:border-indigo-600 transition-all cursor-pointer group flex items-start justify-between gap-3 shadow-2xs"
              >
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-medium text-slate-900 dark:text-slate-100 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors leading-relaxed">
                    "{item.query}"
                  </p>
                  <div className="flex items-center space-x-3 mt-2 text-[11px] text-slate-400 dark:text-slate-500">
                    <span className="flex items-center space-x-1">
                      <Clock className="w-3 h-3" />
                      <span>{new Date(item.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                    </span>
                    {item.confidenceScore && (
                      <span className="capitalize text-[10px] px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 font-medium">
                        {item.confidenceScore} confidence
                      </span>
                    )}
                  </div>
                </div>

                <div className="p-1 rounded-md text-slate-400 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 group-hover:translate-x-0.5 transition-all shrink-0 mt-0.5">
                  <ArrowRight className="w-4 h-4" />
                </div>
              </div>
            ))
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-[#090D16]/50 flex items-center justify-between">
          {history.length > 0 ? (
            <button
              onClick={onClearHistory}
              className="text-xs font-medium text-rose-600 dark:text-rose-400 hover:underline flex items-center space-x-1.5"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Clear History</span>
            </button>
          ) : (
            <div></div>
          )}
          <button
            onClick={onClose}
            className="px-4 py-1.5 text-xs font-medium bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800 rounded-lg text-slate-700 dark:text-slate-200 shadow-2xs transition-colors"
          >
            Close
          </button>
        </div>

      </div>
    </div>
  );
}
