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
import HistoryModal from '@/components/HistoryModal';
import { queryReconstruction, listDocuments, seedSampleData } from '@/lib/api';
import { ReconstructionResult, DocumentItem, QueryHistoryItem, EntityNode } from '@/lib/types';
import { 
  Compass, 
  RotateCw, 
  AlertCircle, 
  Search, 
  Layers, 
  Sparkles, 
  CheckCircle2, 
  Clock, 
  Share2, 
  ShieldAlert, 
  FileText, 
  ArrowRight,
  Filter,
  X
} from 'lucide-react';

type PerspectiveTab = 'overview' | 'timeline' | 'graph' | 'gaps' | 'evidence';

export default function DashboardPage() {
  const [documents, setDocuments] = useState<DocumentItem[]>([]);
  const [result, setResult] = useState<ReconstructionResult | null>(null);
  const [currentQuery, setCurrentQuery] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [loadingStep, setLoadingStep] = useState<number>(1);
  const [isSeeding, setIsSeeding] = useState<boolean>(false);
  const [isIngestOpen, setIsIngestOpen] = useState<boolean>(false);
  const [isDocLibraryOpen, setIsDocLibraryOpen] = useState<boolean>(false);
  const [isHistoryOpen, setIsHistoryOpen] = useState<boolean>(false);
  const [isDarkMode, setIsDarkMode] = useState<boolean>(false);
  const [history, setHistory] = useState<QueryHistoryItem[]>([]);
  const [selectedEntity, setSelectedEntity] = useState<EntityNode | null>(null);
  const [activeTab, setActiveTab] = useState<PerspectiveTab>('overview');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Initialize theme and history from localStorage
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const savedTheme = localStorage.getItem('retrace_theme');
      if (savedTheme === 'dark') {
        setIsDarkMode(true);
        document.documentElement.classList.add('dark');
      }

      const savedHistory = localStorage.getItem('retrace_query_history');
      if (savedHistory) {
        try {
          setHistory(JSON.parse(savedHistory));
        } catch {}
      }
    }
  }, []);

  const handleToggleTheme = () => {
    setIsDarkMode(prev => {
      const next = !prev;
      if (next) {
        document.documentElement.classList.add('dark');
        localStorage.setItem('retrace_theme', 'dark');
      } else {
        document.documentElement.classList.remove('dark');
        localStorage.setItem('retrace_theme', 'light');
      }
      return next;
    });
  };

  const fetchDocs = async () => {
    try {
      const docs = await listDocuments();
      setDocuments(docs);
    } catch (e) {
      console.warn("Could not fetch documents", e);
    }
  };

  useEffect(() => {
    fetchDocs();
  }, []);

  // Multi-step animated loader timer
  useEffect(() => {
    let timer1: any, timer2: any;
    if (isLoading) {
      setLoadingStep(1);
      timer1 = setTimeout(() => setLoadingStep(2), 1100);
      timer2 = setTimeout(() => setLoadingStep(3), 2400);
    }
    return () => {
      clearTimeout(timer1);
      clearTimeout(timer2);
    };
  }, [isLoading]);

  const handleSearch = async (queryText: string) => {
    setIsLoading(true);
    setErrorMessage(null);
    setCurrentQuery(queryText);
    setSelectedEntity(null); // Reset entity filter on new inquiry
    try {
      const data = await queryReconstruction(queryText);
      setResult(data);
      setActiveTab('overview');

      // Save to query history
      const newItem: QueryHistoryItem = {
        id: Date.now().toString(),
        query: queryText,
        timestamp: new Date().toISOString(),
        confidenceScore: data.confidence_score,
      };

      setHistory(prev => {
        const filtered = prev.filter(item => item.query.toLowerCase() !== queryText.toLowerCase());
        const updated = [newItem, ...filtered].slice(0, 25);
        localStorage.setItem('retrace_query_history', JSON.stringify(updated));
        return updated;
      });
    } catch (err: any) {
      setErrorMessage(err.message || 'Failed to reconstruct context. Please verify backend is running.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleClearHistory = () => {
    setHistory([]);
    localStorage.removeItem('retrace_query_history');
  };

  const handleSeedDemo = async () => {
    setIsSeeding(true);
    setErrorMessage(null);
    try {
      await seedSampleData();
      await fetchDocs();
      // Auto run representative sample query
      await handleSearch("Why did we migrate to PostgreSQL and change the vector index on August 12?");
    } catch (err: any) {
      setErrorMessage(err.message || 'Failed to seed sample project records.');
    } finally {
      setIsSeeding(false);
    }
  };

  const selectedEntityId = selectedEntity?.name || selectedEntity?.id || null;

  return (
    <div className="min-h-screen flex flex-col bg-[#F8FAFC] dark:bg-[#090D16] text-slate-900 dark:text-slate-100 transition-colors">
      
      {/* Navigation Header */}
      <Navbar
        onOpenIngest={() => setIsIngestOpen(true)}
        onSeedDemo={handleSeedDemo}
        onOpenDocLibrary={() => setIsDocLibraryOpen(true)}
        onOpenHistory={() => setIsHistoryOpen(true)}
        onToggleTheme={handleToggleTheme}
        isDarkMode={isDarkMode}
        isSeeding={isSeeding}
        docCount={documents.length}
        historyCount={history.length}
      />

      {/* Main Workspace Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-7">
        
        {/* Top Command Console */}
        <section>
          <QueryConsole
            onSearch={handleSearch}
            isLoading={isLoading}
            initialQuery={currentQuery}
          />
        </section>

        {/* Error Alert */}
        {errorMessage && (
          <div className="p-4 rounded-xl border border-rose-200 dark:border-rose-900 bg-rose-50/80 dark:bg-rose-950/40 text-xs text-rose-800 dark:text-rose-300 flex items-center space-x-2.5 shadow-xs">
            <AlertCircle className="w-4 h-4 text-rose-600 dark:text-rose-400 shrink-0" />
            <span className="font-medium">Error: {errorMessage}</span>
          </div>
        )}

        {/* Multi-Phase Loading State */}
        {isLoading && (
          <div className="surface-card rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#0F172A] p-10 text-center shadow-elevated">
            <div className="inline-flex items-center justify-center p-3.5 rounded-full bg-indigo-50 dark:bg-indigo-950/60 border border-indigo-100 dark:border-indigo-800 text-indigo-600 dark:text-indigo-400 mb-4 animate-pulse">
              <Compass className="w-8 h-8 animate-spin" />
            </div>

            <h3 className="text-sm font-semibold text-slate-900 dark:text-white tracking-tight mb-2">
              Reconstructing Institutional Context Across Historical Artifacts
            </h3>

            {/* Stepper Pipeline */}
            <div className="max-w-xl mx-auto my-6 grid grid-cols-3 gap-2.5 text-xs font-medium">
              <div className={`p-3 rounded-xl border transition-all ${
                loadingStep >= 1
                  ? 'bg-indigo-50 dark:bg-indigo-950/60 border-indigo-300 dark:border-indigo-700 text-indigo-900 dark:text-indigo-200 shadow-2xs'
                  : 'bg-slate-50 dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-400'
              }`}>
                <span className="block text-[10px] uppercase font-semibold text-slate-400 mb-0.5">Phase 01</span>
                Vector & Keyword Search
              </div>

              <div className={`p-3 rounded-xl border transition-all ${
                loadingStep >= 2
                  ? 'bg-indigo-50 dark:bg-indigo-950/60 border-indigo-300 dark:border-indigo-700 text-indigo-900 dark:text-indigo-200 shadow-2xs'
                  : 'bg-slate-50 dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-400'
              }`}>
                <span className="block text-[10px] uppercase font-semibold text-slate-400 mb-0.5">Phase 02</span>
                Topology & Entity Mapping
              </div>

              <div className={`p-3 rounded-xl border transition-all ${
                loadingStep >= 3
                  ? 'bg-indigo-50 dark:bg-indigo-950/60 border-indigo-300 dark:border-indigo-700 text-indigo-900 dark:text-indigo-200 shadow-2xs'
                  : 'bg-slate-50 dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-400'
              }`}>
                <span className="block text-[10px] uppercase font-semibold text-slate-400 mb-0.5">Phase 03</span>
                Synthesis & Gap Audit
              </div>
            </div>

            <p className="text-xs text-slate-500 dark:text-slate-400">
              Correlating document chunks with zero-hallucination constraint...
            </p>
          </div>
        )}

        {/* Results Workspace: Perspective Tabs + Views */}
        {!isLoading && result && (
          <div className="space-y-6">
            
            {/* Active Entity Filter Badge (if any) */}
            {selectedEntityId && (
              <div className="flex items-center justify-between px-4 py-2.5 rounded-xl bg-indigo-50 dark:bg-indigo-950/40 border border-indigo-200 dark:border-indigo-800 text-xs text-indigo-900 dark:text-indigo-200 shadow-2xs">
                <div className="flex items-center space-x-2">
                  <Filter className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400" />
                  <span>
                    Focusing perspective on entity: <strong className="font-semibold">"{selectedEntityId}"</strong>
                  </span>
                </div>
                <button
                  onClick={() => setSelectedEntity(null)}
                  className="flex items-center space-x-1 text-indigo-700 dark:text-indigo-300 font-medium hover:underline text-[11px]"
                >
                  <span>Clear entity focus</span>
                  <X className="w-3 h-3" />
                </button>
              </div>
            )}

            {/* Perspective View Switcher */}
            <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-2 overflow-x-auto gap-2">
              <div className="flex items-center space-x-1 sm:space-x-2">
                <button
                  onClick={() => setActiveTab('overview')}
                  className={`px-3.5 py-2 rounded-lg text-xs font-medium flex items-center space-x-2 transition-all ${
                    activeTab === 'overview'
                      ? 'bg-indigo-600 text-white shadow-xs'
                      : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
                  }`}
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>Executive Overview</span>
                </button>

                <button
                  onClick={() => setActiveTab('timeline')}
                  className={`px-3.5 py-2 rounded-lg text-xs font-medium flex items-center space-x-2 transition-all ${
                    activeTab === 'timeline'
                      ? 'bg-indigo-600 text-white shadow-xs'
                      : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
                  }`}
                >
                  <Clock className="w-3.5 h-3.5" />
                  <span>Chronology</span>
                  <span className={`text-[10px] px-1.5 py-0.2 rounded-full font-semibold ${
                    activeTab === 'timeline' ? 'bg-indigo-700 text-white' : 'bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300'
                  }`}>
                    {result.timeline?.length || 0}
                  </span>
                </button>

                <button
                  onClick={() => setActiveTab('graph')}
                  className={`px-3.5 py-2 rounded-lg text-xs font-medium flex items-center space-x-2 transition-all ${
                    activeTab === 'graph'
                      ? 'bg-indigo-600 text-white shadow-xs'
                      : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
                  }`}
                >
                  <Share2 className="w-3.5 h-3.5" />
                  <span>Entity Topology</span>
                  <span className={`text-[10px] px-1.5 py-0.2 rounded-full font-semibold ${
                    activeTab === 'graph' ? 'bg-indigo-700 text-white' : 'bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300'
                  }`}>
                    {result.graph?.nodes?.length || 0}
                  </span>
                </button>

                <button
                  onClick={() => setActiveTab('gaps')}
                  className={`px-3.5 py-2 rounded-lg text-xs font-medium flex items-center space-x-2 transition-all ${
                    activeTab === 'gaps'
                      ? 'bg-indigo-600 text-white shadow-xs'
                      : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
                  }`}
                >
                  <ShieldAlert className="w-3.5 h-3.5" />
                  <span>Knowledge Gaps</span>
                  {result.missing_context && result.missing_context.length > 0 && (
                    <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-rose-500 text-white font-semibold">
                      {result.missing_context.length}
                    </span>
                  )}
                </button>

                <button
                  onClick={() => setActiveTab('evidence')}
                  className={`px-3.5 py-2 rounded-lg text-xs font-medium flex items-center space-x-2 transition-all ${
                    activeTab === 'evidence'
                      ? 'bg-indigo-600 text-white shadow-xs'
                      : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
                  }`}
                >
                  <Layers className="w-3.5 h-3.5" />
                  <span>Evidence & Sources</span>
                  <span className={`text-[10px] px-1.5 py-0.2 rounded-full font-semibold ${
                    activeTab === 'evidence' ? 'bg-indigo-700 text-white' : 'bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300'
                  }`}>
                    {result.citations?.length || 0}
                  </span>
                </button>
              </div>
            </div>

            {/* TAB CONTENT */}

            {/* 1. Overview Tab */}
            {activeTab === 'overview' && (
              <div className="space-y-7">
                {/* Executive Answer Dossier */}
                <NarrativeCard
                  directAnswer={result.direct_answer}
                  reasoningSummary={result.reasoning_summary}
                  confidenceScore={result.confidence_score}
                  confidenceRationale={result.confidence_rationale}
                  query={currentQuery}
                  fullResult={result}
                />

                {/* Prominently Highlighted Knowledge Gaps (if any) */}
                {result.missing_context && result.missing_context.length > 0 && (
                  <MissingContextCallout missingContext={result.missing_context} />
                )}

                {/* 2-Column Split: Timeline Highlights & Entity Graph Preview */}
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-7 items-start">
                  <div className="lg:col-span-7 space-y-7">
                    <TimelineView
                      timeline={result.timeline}
                      selectedEntityId={selectedEntityId}
                      onSelectEntityName={(name) => {
                        const match = result.graph?.nodes?.find(n => (n.name || n.id).toLowerCase() === name.toLowerCase());
                        setSelectedEntity(match || { id: name, name, type: 'person' });
                      }}
                    />
                    <EvidencePanel
                      citations={result.citations}
                      selectedEntityId={selectedEntityId}
                    />
                  </div>

                  <div className="lg:col-span-5 sticky top-22">
                    <RelationshipGraph
                      nodes={result.graph?.nodes || []}
                      links={result.graph?.links || []}
                      selectedEntityId={selectedEntityId}
                      onSelectEntity={(entity) => setSelectedEntity(entity)}
                    />
                  </div>
                </div>
              </div>
            )}

            {/* 2. Full Timeline Tab */}
            {activeTab === 'timeline' && (
              <div>
                <TimelineView
                  timeline={result.timeline}
                  selectedEntityId={selectedEntityId}
                  onSelectEntityName={(name) => {
                    const match = result.graph?.nodes?.find(n => (n.name || n.id).toLowerCase() === name.toLowerCase());
                    setSelectedEntity(match || { id: name, name, type: 'person' });
                  }}
                />
              </div>
            )}

            {/* 3. Full Entity Graph Tab */}
            {activeTab === 'graph' && (
              <div>
                <RelationshipGraph
                  nodes={result.graph?.nodes || []}
                  links={result.graph?.links || []}
                  selectedEntityId={selectedEntityId}
                  onSelectEntity={(entity) => setSelectedEntity(entity)}
                />
              </div>
            )}

            {/* 4. Knowledge Gaps Tab */}
            {activeTab === 'gaps' && (
              <div>
                <MissingContextCallout missingContext={result.missing_context} />
              </div>
            )}

            {/* 5. Evidence & Citations Tab */}
            {activeTab === 'evidence' && (
              <div>
                <EvidencePanel
                  citations={result.citations}
                  selectedEntityId={selectedEntityId}
                />
              </div>
            )}

          </div>
        )}

        {/* Empty / Initial State Onboarding Hero */}
        {!isLoading && !result && (
          <div className="surface-card rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#0F172A] p-8 sm:p-12 shadow-sm text-center max-w-4xl mx-auto my-6 transition-all">
            
            <div className="w-12 h-12 rounded-xl bg-indigo-50 dark:bg-indigo-950/60 border border-indigo-100 dark:border-indigo-800 text-indigo-600 dark:text-indigo-400 flex items-center justify-center mx-auto mb-5 shadow-2xs">
              <Compass className="w-6 h-6" />
            </div>

            <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 text-xs font-medium mb-3">
              <Sparkles className="w-3.5 h-3.5 text-indigo-500" />
              <span>Institutional Knowledge Recovery</span>
            </div>

            <h2 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white tracking-tight">
              Reconstruct the "Why" Behind Past Engineering Decisions
            </h2>

            <p className="text-sm text-slate-600 dark:text-slate-300 max-w-2xl mx-auto mt-3 leading-relaxed">
              When key engineers depart or architectural changes unfold across unlinked Slack threads and meeting transcripts, 
              institutional context is lost. ReTrace indexes scattered documents, generates verified chronological timelines, 
              maps entity dependencies, and explicitly flags unrecorded gaps with zero hallucination.
            </p>

            <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
              <button
                onClick={handleSeedDemo}
                disabled={isSeeding}
                className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-500 disabled:bg-slate-300 dark:disabled:bg-slate-800 text-white rounded-xl text-xs font-semibold flex items-center space-x-2 transition-all shadow-sm"
              >
                <RotateCw className={`w-4 h-4 ${isSeeding ? 'animate-spin text-white' : 'text-indigo-200'}`} />
                <span>{isSeeding ? "Loading Scenario..." : "Load Meridian Architecture Scenario"}</span>
              </button>

              <button
                onClick={() => setIsIngestOpen(true)}
                className="px-5 py-2.5 bg-white dark:bg-slate-900 hover:bg-slate-50 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-200 rounded-xl text-xs font-semibold flex items-center space-x-2 transition-all shadow-2xs"
              >
                <Layers className="w-4 h-4 text-slate-400" />
                <span>Upload Custom Artifacts</span>
              </button>
            </div>

            {/* Architectural Pillars */}
            <div className="mt-10 pt-8 border-t border-slate-100 dark:border-slate-800 grid grid-cols-1 sm:grid-cols-3 gap-5 text-left text-xs">
              <div className="p-4 bg-slate-50/70 dark:bg-[#0B0F19] rounded-xl border border-slate-200/80 dark:border-slate-800/80">
                <span className="font-semibold text-slate-900 dark:text-white block mb-1">
                  Hybrid Retrieval
                </span>
                <p className="text-slate-600 dark:text-slate-400 leading-relaxed">
                  Vector semantic similarity combined with precise token keyword matching for high-recall discovery.
                </p>
              </div>

              <div className="p-4 bg-slate-50/70 dark:bg-[#0B0F19] rounded-xl border border-slate-200/80 dark:border-slate-800/80">
                <span className="font-semibold text-slate-900 dark:text-white block mb-1">
                  Chrono Pathing
                </span>
                <p className="text-slate-600 dark:text-slate-400 leading-relaxed">
                  Step-by-step reconstructed decision sequence directly backed by verbatim source citations.
                </p>
              </div>

              <div className="p-4 bg-slate-50/70 dark:bg-[#0B0F19] rounded-xl border border-slate-200/80 dark:border-slate-800/80">
                <span className="font-semibold text-slate-900 dark:text-white block mb-1">
                  Zero Hallucination Audit
                </span>
                <p className="text-slate-600 dark:text-slate-400 leading-relaxed">
                  Explicitly detects unrecorded rationales, missing stakeholders, and knowledge blind spots.
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
        }}
      />

      {/* Document Library Modal */}
      <DocumentLibrary
        isOpen={isDocLibraryOpen}
        onClose={() => setIsDocLibraryOpen(false)}
        documents={documents}
      />

      {/* Query History Modal */}
      <HistoryModal
        isOpen={isHistoryOpen}
        onClose={() => setIsHistoryOpen(false)}
        history={history}
        onSelectQuery={(q) => handleSearch(q)}
        onClearHistory={handleClearHistory}
      />

      {/* Clean Enterprise Footer */}
      <footer className="border-t border-slate-200/80 dark:border-slate-800/80 bg-white/60 dark:bg-[#090D16]/60 py-4 mt-auto transition-colors">
        <div className="max-w-7xl mx-auto px-4 text-center text-xs text-slate-400 dark:text-slate-500">
          ReTrace AI • Institutional Context Recovery Engine
        </div>
      </footer>

    </div>
  );
}
