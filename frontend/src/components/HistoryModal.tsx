'use client';

import React, { useEffect } from 'react';
import { X, Clock, ArrowRight, Trash2 } from 'lucide-react';
import { QueryHistoryItem } from '@/lib/types';

interface HistoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  history: QueryHistoryItem[];
  onSelectQuery: (query: string) => void;
  onClearHistory: () => void;
}

const CONF_COLOR: Record<string, string> = {
  high: 'text-verified',
  medium: 'text-caution',
  low: 'text-stamp',
};

export default function HistoryModal({
  isOpen,
  onClose,
  history,
  onSelectQuery,
  onClearHistory,
}: HistoryModalProps) {
  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-ink/40 backdrop-blur-[2px]"
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
      role="dialog" aria-modal="true" aria-labelledby="history-title"
    >
      <div className="w-full max-w-lg bg-sheet border border-rule-strong rounded-card shadow-modal overflow-hidden flex flex-col max-h-[80vh]">
        <div className="flex items-center justify-between px-5 py-4 border-b border-rule bg-paper/50">
          <div>
            <div className="field-label mb-0.5">Case log</div>
            <h2 id="history-title" className="font-serif text-[17px] font-semibold text-ink">Recent inquiries</h2>
          </div>
          <button onClick={onClose} className="p-1.5 text-ink-faint hover:text-ink rounded-sheet hover:bg-sheet transition-colors" aria-label="Close">
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="p-5 overflow-y-auto space-y-2.5 flex-1">
          {history.length === 0 ? (
            <div className="text-center py-14">
              <Clock className="w-8 h-8 mx-auto text-rule-strong mb-2" />
              <p className="text-[13px] text-ink-faint">Your past inquiries will collect here.</p>
            </div>
          ) : (
            history.map((item) => (
              <button
                key={item.id}
                onClick={() => { onSelectQuery(item.query); onClose(); }}
                className="w-full text-left rounded-card border border-rule bg-paper/50 hover:border-stamp/50 transition-colors p-3.5 group flex items-start justify-between gap-3"
              >
                <div className="flex-1 min-w-0">
                  <p className="font-serif text-[14px] text-ink italic leading-snug">“{item.query}”</p>
                  <div className="flex items-center gap-3 mt-2 catalog">
                    <span>{new Date(item.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                    {item.confidenceScore && (
                      <span className={`${CONF_COLOR[item.confidenceScore] || 'text-ink-faint'} font-medium`}>
                        {item.confidenceScore} confidence
                      </span>
                    )}
                  </div>
                </div>
                <ArrowRight className="w-4 h-4 text-ink-faint group-hover:text-stamp group-hover:translate-x-0.5 transition-all shrink-0 mt-0.5" />
              </button>
            ))
          )}
        </div>

        <div className="px-5 py-3.5 border-t border-rule bg-paper/50 flex items-center justify-between">
          {history.length > 0 ? (
            <button onClick={onClearHistory} className="inline-flex items-center gap-1.5 text-[12.5px] font-medium text-stamp hover:underline">
              <Trash2 className="w-3.5 h-3.5" /> Clear log
            </button>
          ) : <span />}
          <button onClick={onClose} className="px-4 py-1.5 text-[13px] font-medium bg-paper border border-rule hover:border-rule-strong hover:bg-sheet rounded-sheet text-ink-soft hover:text-ink transition-colors">
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
