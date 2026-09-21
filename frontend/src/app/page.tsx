'use client';

import React, { useState, useEffect } from 'react';
import Navbar from '@/components/Navbar';
import QueryConsole from '@/components/QueryConsole';
import NarrativeCard from '@/components/NarrativeCard';
import MissingContextCallout from '@/components/MissingContextCallout';
import TimelineView from '@/components/TimelineView';
import RelationshipGraph from '@/components/RelationshipGraph';
import EvidencePanel from '@/components/EvidencePanel';
import IngestionZone from '@/components/IngestionZone';
import DocumentLibrary from '@/components/DocumentLibrary';
import DossierExportModal from '@/components/DossierExportModal';
import ToastContainer, { ToastMessage } from '@/components/Toast';
import { queryReconstruction, listDocuments, seedSampleData } from '@/lib/api';
import { ReconstructionResult, DocumentItem } from '@/lib/types';
import {
  Compass,
  RefreshCw,
  AlertCircle,
  FileSearch,
  Sparkles,
  Layers,
  Share2,
  Clock,
  ShieldAlert,
  FileText,
  Activity,
  ArrowRight,
  Database,
  Search,
  Zap,
} from 'lucide-react';

export default function DashboardPage() {
  const [documents, setDocuments] = useState<DocumentItem[]>([]);
  const [result, setResult] = useState<ReconstructionResult | null>(null);
  const [currentQuery, setCurrentQuery] = useState<string>('');
  const [recentQueries, setRecentQueries] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [loadingStep, setLoadingStep] = useState<number>(1);
  const [isSeeding, setIsSeeding] = useState<boolean>(false);
  const [isIngestOpen, setIsIngestOpen] = useState<boolean>(false);
  const [isDocLibraryOpen, setIsDocLibraryOpen] = useState<boolean>(false);
  const [isExportOpen, setIsExportOpen] = useState<boolean>(false);
  const [activeTab, setActiveTab] = useState<'overview' | 'graph' | 'timeline' | 'evidence' | 'blindspots'>('overview');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  const addToast = (type: 'success' | 'error' | 'info', title: string, description?: string) => {
    const id = Date.now().toString();
    setToasts((prev) => [...prev, { id, type, title, description }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 4000);
  };

  const removeToast = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  const fetchDocs = async () => {
    try {
      const docs = await listDocuments();
      setDocuments(docs);
    } catch (e) {
      console.warn('Could not fetch documents', e);
    }
  };

  useEffect(() => {
    fetchDocs();
  }, []);

  // Multi-step loading progress simulation with smooth step transitions
  useEffect(() => {
    if (!isLoading) {
      setLoadingStep(1);
      return;
    }
    const t1 = setTimeout(() => setLoadingStep(2), 1200);
    const t2 = setTimeout(() => setLoadingStep(3), 2600);
    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
    };
  }, [isLoading]);

  const handleSearch = async (queryText: string) => {
    setIsLoading(true);
    setErrorMessage(null);
    setCurrentQuery(queryText);
    setRecentQueries((prev) => Array.from(new Set([queryText, ...prev])).slice(0, 6));

    try {
      const data = await queryReconstruction(queryText);
      setResult(data);
      addToast('success', 'Forensic Reconstruction Complete', `Retrieved ${data.citations?.length || 0} primary citations and ${data.timeline?.length || 0} milestones.`);
    } catch (err: any) {
      const msg = err.message || 'Failed to reconstruct context. Please verify backend is online.';
      setErrorMessage(msg);
      addToast('error', 'Reconstruction Failed', msg);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSeedDemo = async () => {
    setIsSeeding(true);
    setErrorMessage(null);
    try {
      const res = await seedSampleData();
      await fetchDocs();
      addToast('success', 'Project Meridian Scenario Loaded', res.message);
      // Auto run first inquiry to showcase immediately
      await handleSearch('Why did we migrate to PostgreSQL and change the vector index on August 12?');
    } catch (err: any) {
      const msg = err.message || 'Failed to seed sample project records.';
      setErrorMessage(msg);
      addToast('error', 'Seeding Failed', msg);
    } finally {
      setIsSeeding(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#040714] text-slate-100 selection:bg-cyan-400 selection:text-slate-950 font-sans relative overflow-x-hidden">
      
      {/* Dynamic Glowing Ambient Aurora Orbs */}
      <div className="fixed top-0 left-1/4 w-[32rem] h-[32rem] bg-violet-600/15 rounded-full blur-[120px] pointer-events-none -z-10 animate-float"></div>
      <div className="fixed top-1/3 right-1/4 w-[28rem] h-[28rem] bg-cyan-500/10 rounded-full blur-[100px] pointer-events-none -z-10 animate-float-reverse"></div>
      <div className="fixed bottom-10 left-1/3 w-[24rem] h-[24rem] bg-pink-500/8 rounded-full blur-[90px] pointer-events-none -z-10"></div>

      {/* Toast Notification Container */}
      <ToastContainer toasts={toasts} onDismiss={removeToast} />

      {/* Animated Navbar */}
      <Navbar
        onOpenIngest={() => setIsIngestOpen(true)}
        onSeedDemo={handleSeedDemo}
        onOpenDocLibrary={() => setIsDocLibraryOpen(true)}
        onToggleGlobalGraph={() => {
          if (result) {
            setActiveTab('graph');
          } else {
            setIsDocLibraryOpen(true);
          }
        }}
        isSeeding={isSeeding}
        docCount={documents.length}
      />

      {/* Main Forensic Command Workspace */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-7">
        
        {/* Top Query Console Section */}
        <section>
          <QueryConsole
            onSearch={handleSearch}
            isLoading={isLoading}
            recentQueries={recentQueries}
          />
        </section>

        {/* Error Alert */}
        {errorMessage && (
          <div className="p-4 rounded-xl border border-pink-500/40 bg-pink-500/15 text-xs font-mono text-pink-300 flex items-center justify-between shadow-xl animate-in fade-in">
            <div className="flex items-center space-x-2.5">
              <AlertCircle className="w-5 h-5 text-pink-400 shrink-0 animate-pulse" />
              <span>ALERT: {errorMessage}</span>
            </div>
            <button
              onClick={() => setErrorMessage(null)}
              className="px-2.5 py-0.5 rounded bg-pink-500/25 hover:bg-pink-500/40 text-pink-200 active:scale-95 transition-all"
            >
              Dismiss
            </button>
          </div>
        )}

        {/* Multi-step Loading State Simulation with Scanline */}
        {isLoading && (
          <div className="forensic-card rounded-2xl p-12 text-center relative corner-ticks shadow-2xl scanline-box">
            <div className="inline-flex items-center justify-center p-4 rounded-full bg-gradient-to-br from-cyan-500/20 to-violet-500/20 border border-cyan-400/50 text-cyan-300 mb-4 animate-glow">
              <Compass className="w-10 h-10 animate-spin text-cyan-400" />
            </div>

            <h3 className="text-sm font-mono font-bold text-white uppercase tracking-wider shimmer-text">
              RECONSTRUCTING FORENSIC CONTEXT ACROSS HISTORICAL ARTIFACTS
            </h3>

            {/* Stepped Progress HUD */}
            <div className="max-w-md mx-auto mt-6 space-y-2.5 font-mono text-xs text-left">
              <div
                className={`p-3 rounded-xl border flex items-center space-x-3 transition-all duration-300 ${
                  loadingStep >= 1
                    ? 'bg-cyan-500/15 border-cyan-400/50 text-cyan-300 shadow-md shadow-cyan-500/10'
                    : 'bg-[#0A0F24] border-[#1E2C54] text-slate-500'
                }`}
              >
                <div
                  className={`w-2.5 h-2.5 rounded-full ${
                    loadingStep === 1 ? 'bg-cyan-400 animate-ping' : 'bg-cyan-400'
                  }`}
                ></div>
                <span>1. Hybrid Vector Retrieval (pgvector + BM25 keyword matching)...</span>
              </div>

              <div
                className={`p-3 rounded-xl border flex items-center space-x-3 transition-all duration-300 ${
                  loadingStep >= 2
                    ? 'bg-violet-500/15 border-violet-400/50 text-violet-300 shadow-md shadow-violet-500/10'
                    : 'bg-[#0A0F24] border-[#1E2C54] text-slate-500'
                }`}
              >
                <div
                  className={`w-2.5 h-2.5 rounded-full ${
                    loadingStep === 2 ? 'bg-violet-400 animate-ping' : loadingStep > 2 ? 'bg-violet-400' : 'bg-slate-600'
                  }`}
                ></div>
                <span>2. Entity Topology Traversal & Cross-Document Link Correlation...</span>
              </div>

              <div
                className={`p-3 rounded-xl border flex items-center space-x-3 transition-all duration-300 ${
                  loadingStep >= 3
                    ? 'bg-emerald-500/15 border-emerald-400/50 text-emerald-300 shadow-md shadow-emerald-500/10'
                    : 'bg-[#0A0F24] border-[#1E2C54] text-slate-500'
                }`}
              >
                <div
                  className={`w-2.5 h-2.5 rounded-full ${
                    loadingStep === 3 ? 'bg-emerald-400 animate-ping' : 'bg-slate-600'
                  }`}
                ></div>
                <span>3. Gemini 3.6 Synthesis & Zero-Hallucination Gap Verification...</span>
              </div>
            </div>
          </div>
        )}

        {/* Reconstructed Results View */}
        {!isLoading && result && (
          <div className="space-y-6 animate-in fade-in duration-300">
            
            {/* View Switcher Tabs with Cosmic Neon Highlights */}
            <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[#1E2C54] pb-1.5">
              <div className="flex items-center space-x-2 overflow-x-auto">
                <button
                  onClick={() => setActiveTab('overview')}
                  className={`px-4 py-2 text-xs font-mono font-bold rounded-lg transition-all duration-200 flex items-center space-x-2 active:scale-95 ${
                    activeTab === 'overview'
                      ? 'bg-gradient-to-r from-cyan-400 to-violet-500 text-slate-950 shadow-xl shadow-cyan-500/25'
                      : 'text-slate-400 hover:text-white hover:bg-[#0E1630]'
                  }`}
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>Overview Briefing</span>
                </button>

                <button
                  onClick={() => setActiveTab('graph')}
                  className={`px-4 py-2 text-xs font-mono font-bold rounded-lg transition-all duration-200 flex items-center space-x-2 active:scale-95 ${
                    activeTab === 'graph'
                      ? 'bg-gradient-to-r from-cyan-400 to-violet-500 text-slate-950 shadow-xl shadow-cyan-500/25'
                      : 'text-slate-400 hover:text-white hover:bg-[#0E1630]'
                  }`}
                >
                  <Share2 className="w-3.5 h-3.5" />
                  <span>Knowledge Topology ({result.graph?.nodes?.length || 0})</span>
                </button>

                <button
                  onClick={() => setActiveTab('timeline')}
                  className={`px-4 py-2 text-xs font-mono font-bold rounded-lg transition-all duration-200 flex items-center space-x-2 active:scale-95 ${
                    activeTab === 'timeline'
                      ? 'bg-gradient-to-r from-cyan-400 to-violet-500 text-slate-950 shadow-xl shadow-cyan-500/25'
                      : 'text-slate-400 hover:text-white hover:bg-[#0E1630]'
                  }`}
                >
                  <Clock className="w-3.5 h-3.5" />
                  <span>Timeline ({result.timeline?.length || 0})</span>
                </button>

                <button
                  onClick={() => setActiveTab('evidence')}
                  className={`px-4 py-2 text-xs font-mono font-bold rounded-lg transition-all duration-200 flex items-center space-x-2 active:scale-95 ${
                    activeTab === 'evidence'
                      ? 'bg-gradient-to-r from-cyan-400 to-violet-500 text-slate-950 shadow-xl shadow-cyan-500/25'
                      : 'text-slate-400 hover:text-white hover:bg-[#0E1630]'
                  }`}
                >
                  <Layers className="w-3.5 h-3.5" />
                  <span>Evidence ({result.citations?.length || 0})</span>
                </button>

                {result.missing_context && result.missing_context.length > 0 && (
                  <button
                    onClick={() => setActiveTab('blindspots')}
                    className={`px-4 py-2 text-xs font-mono font-bold rounded-lg transition-all duration-200 flex items-center space-x-2 active:scale-95 ${
                      activeTab === 'blindspots'
                        ? 'bg-gradient-to-r from-pink-500 to-rose-600 text-white shadow-xl shadow-pink-500/30'
                        : 'text-pink-400 hover:text-pink-200 hover:bg-pink-950/20'
                    }`}
                  >
                    <ShieldAlert className="w-3.5 h-3.5 animate-pulse" />
                    <span>Blindspots ({result.missing_context.length})</span>
                  </button>
                )}
              </div>

              {/* Quick Action: Export Dossier */}
              <button
                onClick={() => setIsExportOpen(true)}
                className="btn-shimmer px-3.5 py-1.5 text-xs font-mono text-cyan-300 bg-cyan-500/10 hover:bg-cyan-500/20 border border-cyan-400/40 rounded-lg flex items-center space-x-1.5 transition-all shadow-md active:scale-95"
              >
                <FileText className="w-3.5 h-3.5 text-cyan-400" />
                <span>Export Executive Dossier</span>
              </button>
            </div>

            {/* TAB 1: OVERVIEW BRIEFING */}
            {activeTab === 'overview' && (
              <div className="space-y-7 animate-in fade-in duration-300">
                {/* Executive Answer Card with Rotating Border Beam */}
                <NarrativeCard
                  directAnswer={result.direct_answer}
                  reasoningSummary={result.reasoning_summary}
                  confidenceScore={result.confidence_score}
                  confidenceRationale={result.confidence_rationale}
                  query={currentQuery}
                  onOpenExport={() => setIsExportOpen(true)}
                />

                {/* Missing Context Callout HUD */}
                <MissingContextCallout missingContext={result.missing_context} />

                {/* 2-Column Split: Timeline on Left, Graph on Right */}
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-7 items-start">
                  <div className="lg:col-span-7 space-y-7">
                    <TimelineView timeline={result.timeline} />
                    <EvidencePanel citations={result.citations} />
                  </div>

                  <div className="lg:col-span-5 sticky top-24">
                    <RelationshipGraph
                      nodes={result.graph?.nodes || []}
                      links={result.graph?.links || []}
                    />
                  </div>
                </div>
              </div>
            )}

            {/* TAB 2: KNOWLEDGE TOPOLOGY EXPLORER */}
            {activeTab === 'graph' && (
              <div className="space-y-6 animate-in fade-in duration-300">
                <RelationshipGraph
                  nodes={result.graph?.nodes || []}
                  links={result.graph?.links || []}
                />
              </div>
            )}

            {/* TAB 3: DECISION TIMELINE */}
            {activeTab === 'timeline' && (
              <div className="space-y-6 animate-in fade-in duration-300">
                <TimelineView timeline={result.timeline} />
              </div>
            )}

            {/* TAB 4: PRIMARY EVIDENCE & CITATIONS */}
            {activeTab === 'evidence' && (
              <div className="space-y-6 animate-in fade-in duration-300">
                <EvidencePanel citations={result.citations} />
              </div>
            )}

            {/* TAB 5: FORENSIC BLINDSPOTS */}
            {activeTab === 'blindspots' && (
              <div className="space-y-6 animate-in fade-in duration-300">
                <MissingContextCallout missingContext={result.missing_context} />
              </div>
            )}

          </div>
        )}

        {/* Empty / Initial State Hero */}
        {!isLoading && !result && (
          <div className="forensic-card rounded-2xl p-10 relative corner-ticks shadow-2xl text-center max-w-3xl mx-auto my-8 border border-[#1E2C54]">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-cyan-400/25 via-violet-500/15 to-transparent border border-cyan-400/50 text-cyan-300 flex items-center justify-center mx-auto mb-5 shadow-2xl shadow-cyan-500/20 animate-float">
              <FileSearch className="w-8 h-8" />
            </div>

            <h2 className="text-base font-mono font-extrabold text-white uppercase tracking-wider shimmer-text">
              RETRACE // FORENSIC CONTEXT RECOVERY ENGINE
            </h2>

            <p className="text-xs text-slate-300 font-sans max-w-xl mx-auto mt-2.5 leading-relaxed">
              When key engineers leave, codebases pivot, or architectural compromises are made in private Slack channels, the critical &ldquo;why&rdquo; is lost. ReTrace ingests historical documentation, ADRs, and incident postmortems to reconstruct the missing decision trail with verifiable citations.
            </p>

            {/* Primary Action Buttons with Shimmer & Micro-Interactions */}
            <div className="mt-7 flex flex-wrap items-center justify-center gap-3">
              <button
                onClick={handleSeedDemo}
                disabled={isSeeding}
                className="btn-shimmer px-5 py-2.5 bg-gradient-to-r from-amber-400 via-amber-300 to-amber-400 hover:from-amber-300 hover:to-amber-200 disabled:opacity-50 text-slate-950 rounded-xl text-xs font-mono font-bold flex items-center space-x-2 transition-all shadow-xl shadow-amber-500/20 hover:-translate-y-0.5 active:scale-95"
              >
                <RefreshCw className={`w-4 h-4 ${isSeeding ? 'animate-spin text-slate-950' : 'text-slate-950'}`} />
                <span>{isSeeding ? 'Seeding Scenario...' : 'Load Meridian Demo Scenario'}</span>
              </button>

              <button
                onClick={() => setIsIngestOpen(true)}
                className="btn-shimmer px-4 py-2.5 bg-gradient-to-r from-cyan-400 via-cyan-300 to-violet-400 hover:from-cyan-300 hover:to-violet-300 text-slate-950 rounded-xl text-xs font-mono font-bold flex items-center space-x-2 transition-all shadow-xl shadow-cyan-500/20 hover:-translate-y-0.5 active:scale-95"
              >
                <Layers className="w-4 h-4 text-slate-950" />
                <span>Upload Custom Artifact</span>
              </button>

              <button
                onClick={() => setIsDocLibraryOpen(true)}
                className="px-4 py-2.5 bg-[#0A0F24] hover:bg-[#121B3B] hover:text-white border border-[#1E2C54] hover:border-cyan-400/50 text-slate-200 rounded-xl text-xs font-mono font-semibold flex items-center space-x-2 transition-all hover:-translate-y-0.5 active:scale-95 shadow-sm"
              >
                <Database className="w-4 h-4 text-cyan-400" />
                <span>View Archive ({documents.length})</span>
              </button>
            </div>

            {/* Technical Capability Cards with Hover Elevation */}
            <div className="mt-9 pt-7 border-t border-[#1E2C54] grid grid-cols-1 sm:grid-cols-3 gap-4 text-left font-mono text-xs">
              <div className="p-4 bg-[#0A0F24]/90 rounded-xl border border-[#1E2C54] hover:border-cyan-500/50 transition-all duration-300 hover:-translate-y-0.5 shadow-sm group">
                <strong className="text-cyan-300 block mb-1.5 flex items-center space-x-1.5">
                  <Zap className="w-3.5 h-3.5 text-cyan-400 group-hover:scale-110 transition-transform" />
                  <span>// HYBRID RETRIEVAL</span>
                </strong>
                <p className="text-slate-400 text-[11px] leading-relaxed">
                  Dual-layer vector embeddings (768-dim) paired with exact keyword token correlation.
                </p>
              </div>

              <div className="p-4 bg-[#0A0F24]/90 rounded-xl border border-[#1E2C54] hover:border-violet-500/50 transition-all duration-300 hover:-translate-y-0.5 shadow-sm group">
                <strong className="text-violet-300 block mb-1.5 flex items-center space-x-1.5">
                  <Share2 className="w-3.5 h-3.5 text-violet-400 group-hover:scale-110 transition-transform" />
                  <span>// CAUSAL TOPOLOGY</span>
                </strong>
                <p className="text-slate-400 text-[11px] leading-relaxed">
                  Interactive force-directed graph mapping influence between people, systems, and decisions.
                </p>
              </div>

              <div className="p-4 bg-[#0A0F24]/90 rounded-xl border border-[#1E2C54] hover:border-pink-500/50 transition-all duration-300 hover:-translate-y-0.5 shadow-sm group">
                <strong className="text-pink-300 block mb-1.5 flex items-center space-x-1.5">
                  <ShieldAlert className="w-3.5 h-3.5 text-pink-400 group-hover:scale-110 transition-transform" />
                  <span>// ZERO HALLUCINATION</span>
                </strong>
                <p className="text-slate-400 text-[11px] leading-relaxed">
                  Explicitly audits and flags missing rationale, broken decision chains, and unrecorded stakeholders.
                </p>
              </div>
            </div>

          </div>
        )}

      </main>

      {/* Ingestion Studio Modal */}
      <IngestionZone
        isOpen={isIngestOpen}
        onClose={() => setIsIngestOpen(false)}
        onSuccess={() => {
          fetchDocs();
          addToast('success', 'Document Ingested Successfully', 'Knowledge store updated with new chunks and entities.');
        }}
      />

      {/* Document Library Modal */}
      <DocumentLibrary
        isOpen={isDocLibraryOpen}
        onClose={() => setIsDocLibraryOpen(false)}
        documents={documents}
      />

      {/* Executive Dossier Export Modal */}
      <DossierExportModal
        isOpen={isExportOpen}
        onClose={() => setIsExportOpen(false)}
        result={result}
        query={currentQuery}
        onCopySuccess={() => {
          addToast('success', 'Dossier Copied to Clipboard', 'Executive Markdown report ready to share.');
        }}
      />

      {/* Footer */}
      <footer className="border-t border-[#1E2C54] bg-[#040714] py-4 mt-auto">
        <div className="max-w-7xl mx-auto px-4 flex flex-wrap items-center justify-between gap-2 text-xs font-mono text-slate-500">
          <div>
            RETRACE AI // FORENSIC KNOWLEDGE INTELLIGENCE // SPEC v2.0
          </div>
          <div className="flex items-center space-x-3 text-[11px]">
            <span className="text-cyan-400 font-bold">ENGINE: GEMINI 3.6 FLASH</span>
            <span>•</span>
            <span className="text-violet-400 font-bold">VECTORS: 768-DIM</span>
            <span>•</span>
            <span className="text-emerald-400 font-bold">HACKATHON EDITION</span>
          </div>
        </div>
      </footer>

    </div>
  );
}
