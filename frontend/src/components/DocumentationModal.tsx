'use client';

import React from 'react';
import { X, BookOpen, ShieldCheck, Database, Compass, Layers, Cpu, CheckCircle2 } from 'lucide-react';

interface DocumentationModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function DocumentationModal({ isOpen, onClose }: DocumentationModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in">
      <div className="w-full max-w-3xl bg-[#0B101A] border border-[#243044] rounded-xl shadow-2xl overflow-hidden flex flex-col max-h-[88vh]">
        
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-[#243044] bg-[#101722]">
          <div className="flex items-center space-x-2.5">
            <div className="p-1.5 rounded-lg bg-[#00F2FE]/10 text-[#00F2FE] border border-[#00F2FE]/30">
              <BookOpen className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-xs font-mono font-bold text-white uppercase tracking-wider">
                RETRACE SYSTEM MANUAL // ARCHITECTURAL SPECIFICATION
              </h2>
              <p className="text-[11px] font-mono text-[#94A3B8]">
                ENTERPRISE DIGITAL EVIDENCE & REASONING PIPELINE
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

        {/* Content Body */}
        <div className="p-6 overflow-y-auto space-y-6 text-xs text-slate-300 font-sans leading-relaxed bg-[#05070D]">
          
          {/* Section 1 */}
          <section className="space-y-2">
            <div className="flex items-center space-x-2 text-[#00F2FE] font-mono text-xs uppercase font-bold">
              <Compass className="w-4 h-4" />
              <span>1. Executive Mission & Purpose</span>
            </div>
            <p className="text-[#94A3B8]">
              When software organizations scale, institutional knowledge decays. Engineers depart, Slack threads disappear, and architectural pivots are rarely codified. ReTrace is an AI investigation and forensic recovery engine designed to ingest disparate historical records (ADRs, RFCs, Slack dumps, incident postmortems) and synthesize the authoritative &ldquo;WHY&rdquo; behind past product decisions with 100% verifiable citations.
            </p>
          </section>

          {/* Section 2 */}
          <section className="space-y-2">
            <div className="flex items-center space-x-2 text-[#8B5CF6] font-mono text-xs uppercase font-bold">
              <Database className="w-4 h-4" />
              <span>2. Dual-Layer Hybrid Retrieval Engine</span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 font-mono text-[11px]">
              <div className="p-3 rounded-lg bg-[#101722] border border-[#243044]">
                <strong className="text-white block mb-1">DENSE VECTOR EMBEDDINGS</strong>
                Semantic 768-dimensional vector representations indexed via Supabase pgvector (HNSW) / local embedded vector stores for fuzzy conceptual queries.
              </div>
              <div className="p-3 rounded-lg bg-[#101722] border border-[#243044]">
                <strong className="text-white block mb-1">SYMBOLIC ENTITY TOPOLOGY</strong>
                Deterministic entity-relationship graph connecting People, Systems, Milestones, and Decisions extracted by structured extraction models.
              </div>
            </div>
          </section>

          {/* Section 3 */}
          <section className="space-y-2">
            <div className="flex items-center space-x-2 text-[#10B981] font-mono text-xs uppercase font-bold">
              <ShieldCheck className="w-4 h-4" />
              <span>3. Zero-Hallucination Guard Policy</span>
            </div>
            <p className="text-[#94A3B8]">
              Unlike generative AI chat assistants, ReTrace enforces a strict zero-hallucination policy. If a rationale or stakeholder authorization was never recorded in written artifacts, the system explicitly audits and isolates it under the <strong>Missing Context HUD</strong> instead of inventing plausible justifications.
            </p>
            <div className="p-3 rounded-lg bg-[#101722] border border-[#243044] flex items-center space-x-3 text-[11px] font-mono">
              <CheckCircle2 className="w-4 h-4 text-[#10B981] shrink-0" />
              <span className="text-slate-300">
                Rule: Every claimed statement must link to an exact verbatim quote and document source ID.
              </span>
            </div>
          </section>

          {/* Section 4 */}
          <section className="space-y-2">
            <div className="flex items-center space-x-2 text-[#F59E0B] font-mono text-xs uppercase font-bold">
              <Cpu className="w-4 h-4" />
              <span>4. Operational API Contracts</span>
            </div>
            <ul className="list-disc list-inside space-y-1 text-[#94A3B8] font-mono text-[11px]">
              <li><code className="text-[#00F2FE]">POST /api/query</code>: Executes hybrid retrieval & Gemini context synthesis.</li>
              <li><code className="text-[#00F2FE]">GET /api/context/documents</code>: Fetches all ingested historical records.</li>
              <li><code className="text-[#00F2FE]">GET /api/context/graph</code>: Retrieves global entity topology links.</li>
              <li><code className="text-[#00F2FE]">POST /api/context/seed</code>: Populates Project Meridian demo scenario.</li>
              <li><code className="text-[#00F2FE]">POST /api/ingest/*</code>: Multi-format parsing for PDF, Markdown, Text & URLs.</li>
            </ul>
          </section>

        </div>

        {/* Footer */}
        <div className="p-3.5 border-t border-[#243044] bg-[#101722] flex items-center justify-between">
          <span className="text-[11px] font-mono text-[#94A3B8]">
            SPECIFICATION v3.0 // ENTERPRISE EDITION
          </span>
          <button
            onClick={onClose}
            className="px-4 py-1.5 text-xs font-mono font-semibold bg-[#151D29] hover:bg-[#1C2738] text-white border border-[#243044] rounded-md transition-colors"
          >
            Close Manual
          </button>
        </div>

      </div>
    </div>
  );
}
