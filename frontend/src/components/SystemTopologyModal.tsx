'use client';

import React from 'react';
import { X, Share2, ArrowRight, ArrowDown, Database, Cpu, Globe, Server, ShieldCheck, CheckCircle2 } from 'lucide-react';

interface SystemTopologyModalProps {
  isOpen: boolean;
  onClose: () => void;
  docCount: number;
}

export default function SystemTopologyModal({ isOpen, onClose, docCount }: SystemTopologyModalProps) {
  if (!isOpen) return null;

  const PIPELINE_NODES = [
    {
      id: 'frontend',
      name: 'Frontend Workspace',
      badge: 'NEXT.JS 14 / REACT',
      desc: '3-Column Cyber-Forensic Workspace & Visualizers',
      icon: Globe,
      color: 'border-[#00F2FE]/50 text-[#00F2FE]',
      status: 'ONLINE',
    },
    {
      id: 'gateway',
      name: 'API Gateway',
      badge: 'FASTAPI ASGI',
      desc: 'CORS & Schema Validated Endpoints',
      icon: Server,
      color: 'border-[#8B5CF6]/50 text-[#8B5CF6]',
      status: 'READY',
    },
    {
      id: 'engine',
      name: 'Query Engine',
      badge: 'HYBRID FUSION',
      desc: 'BM25 Token Matching + Vector Cosine Correlation',
      icon: Cpu,
      color: 'border-[#10B981]/50 text-[#10B981]',
      status: 'ACTIVE',
    },
    {
      id: 'vector',
      name: 'Vector Index',
      badge: '768-DIM PGVECTOR',
      desc: 'Supabase pgvector (HNSW) / Local SQLite Array',
      icon: Database,
      color: 'border-[#00F2FE]/50 text-[#00F2FE]',
      status: 'INDEXED',
    },
    {
      id: 'graph',
      name: 'Symbolic Graph',
      badge: 'FORCE-DIRECTED',
      desc: 'Entity Relational Topology & Causal Link Matrix',
      icon: Share2,
      color: 'border-[#8B5CF6]/50 text-[#8B5CF6]',
      status: 'SYNCED',
    },
    {
      id: 'store',
      name: 'Evidence Store',
      badge: 'VERIFIABLE CITATIONS',
      desc: `${docCount} Documents, RFCs, Postmortems & Transcripts`,
      icon: ShieldCheck,
      color: 'border-[#10B981]/50 text-[#10B981]',
      status: `${docCount} DOCS`,
    },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in">
      <div className="w-full max-w-3xl bg-[#0B101A] border border-[#243044] rounded-xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-[#243044] bg-[#101722]">
          <div className="flex items-center space-x-2.5">
            <div className="p-1.5 rounded-lg bg-[#8B5CF6]/10 text-[#8B5CF6] border border-[#8B5CF6]/30">
              <Share2 className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-xs font-mono font-bold text-white uppercase tracking-wider">
                SYSTEM TOPOLOGY VISUALIZATION
              </h2>
              <p className="text-[11px] font-mono text-[#94A3B8]">
                ARCHITECTURAL PIPELINE: RETRIEVAL TO FORENSIC SYNTHESIS
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

        {/* Pipeline Diagram */}
        <div className="p-6 overflow-y-auto space-y-4 bg-[#05070D]">
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {PIPELINE_NODES.map((node, idx) => {
              const NodeIcon = node.icon;
              return (
                <div
                  key={node.id}
                  className="p-4 rounded-xl bg-[#101722] border border-[#243044] hover:border-[#334155] transition-all flex flex-col justify-between shadow-lg relative group"
                >
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-[9px] font-mono uppercase px-2 py-0.5 rounded font-bold border border-[#243044] bg-[#0B101A] text-slate-300">
                        STEP {idx + 1}
                      </span>
                      <span className="text-[10px] font-mono text-[#10B981] flex items-center space-x-1">
                        <span className="w-1.5 h-1.5 rounded-full bg-[#10B981] animate-pulse"></span>
                        <span>{node.status}</span>
                      </span>
                    </div>

                    <div className="flex items-center space-x-2.5 mb-2">
                      <div className={`p-2 rounded-lg bg-[#0B101A] border ${node.color}`}>
                        <NodeIcon className="w-4 h-4" />
                      </div>
                      <h3 className="text-xs font-mono font-bold text-white">
                        {node.name}
                      </h3>
                    </div>

                    <p className="text-[11px] text-[#94A3B8] font-sans leading-relaxed">
                      {node.desc}
                    </p>
                  </div>

                  <div className="mt-3 pt-2.5 border-t border-[#243044] flex items-center justify-between text-[10px] font-mono text-slate-400">
                    <span>{node.badge}</span>
                    <CheckCircle2 className="w-3.5 h-3.5 text-[#00F2FE]" />
                  </div>
                </div>
              );
            })}
          </div>

          {/* Flow Connection Legend */}
          <div className="mt-6 p-4 rounded-xl bg-[#101722] border border-[#243044] text-xs font-mono text-slate-300 space-y-2">
            <div className="text-[11px] uppercase text-[#00F2FE] font-bold">
              // PIPELINE DATAFLOW SPECIFICATION:
            </div>
            <div className="text-[11px] text-[#94A3B8] leading-relaxed">
              Frontend Client ➔ API Gateway ➔ Hybrid Fusion Engine ➔ Parallel Retrieval (pgvector + SQLite cosine similarity) ➔ Force-directed Entity Traversal ➔ Verifiable Citation Extraction ➔ Synthesized Executive Narrative with Zero-Hallucination Guard.
            </div>
          </div>

        </div>

        {/* Footer */}
        <div className="p-3.5 border-t border-[#243044] bg-[#101722] flex items-center justify-between">
          <span className="text-[11px] font-mono text-[#94A3B8]">
            TOPOLOGY STATE: ALL CHANNELS VERIFIED
          </span>
          <button
            onClick={onClose}
            className="px-4 py-1.5 text-xs font-mono font-semibold bg-[#151D29] hover:bg-[#1C2738] text-white border border-[#243044] rounded-md transition-colors"
          >
            Close Topology
          </button>
        </div>

      </div>
    </div>
  );
}
