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
  RotateCw,
  AlertCircle,
  FileText,
  Clock,
  Share2,
  ShieldAlert,
  Plus,
  X,
} from 'lucide-react';

type PerspectiveTab = 'overview' | 'timeline' | 'graph' | 'gaps' | 'evidence';

const LOADING_PHASES = [
  { label: 'Searching the documents', hint: 'Matching your question against every indexed source' },
  { label: 'Mapping people and systems', hint: 'Linking who touched what, and when' },
  { label: 'Writing up the finding', hint: 'Assembling the answer — and flagging what is missing' },
];

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

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const savedTheme = localStorage.getItem('retrace_theme');
      if (savedTheme === 'dark') {
        setIsDarkMode(true);
        document.documentElement.classList.add('dark');
      }
      const savedHistory = localStorage.getItem('retrace_query_history');
      if (savedHistory) {
        try { setHistory(JSON.parse(savedHistory)); } catch {}
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
      console.warn('Could not fetch documents', e);
    }
  };

  useEffect(() => { fetchDocs(); }, []);

  useEffect(() => {
    let timer1: any, timer2: any;
    if (isLoading) {
      setLoadingStep(1);
      timer1 = setTimeout(() => setLoadingStep(2), 1100);
      timer2 = setTimeout(() => setLoadingStep(3), 2400);
    }
    return () => { clearTimeout(timer1); clearTimeout(timer2); };
  }, [isLoading]);

  const handleSearch = async (queryText: string) => {
    setIsLoading(true);
    setErrorMessage(null);
    setCurrentQuery(queryText);
    setSelectedEntity(null);
    try {
      const data = await queryReconstruction(queryText);
      setResult(data);
      setActiveTab('overview');
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
      setErrorMessage(err.message || "Couldn't reconstruct that. Check the backend is running on localhost:8000.");
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
      await handleSearch('Why did we migrate to PostgreSQL and change the vector index on August 12?');
    } catch (err: any) {
      setErrorMessage(err.message || "Couldn't load the sample case.");
    } finally {
      setIsSeeding(false);
    }
  };

  const selectedEntityId = selectedEntity?.name || selectedEntity?.id || null;

  const TABS: { key: PerspectiveTab; label: string; icon: any; count?: number; alert?: boolean }[] = [
    { key: 'overview', label: 'Finding', icon: FileText },
    { key: 'timeline', label: 'Timeline', icon: Clock, count: result?.timeline?.length || 0 },
    { key: 'graph', label: 'Connections', icon: Share2, count: result?.graph?.nodes?.length || 0 },
    { key: 'gaps', label: 'Gaps', icon: ShieldAlert, count: result?.missing_context?.length || 0, alert: true },
    { key: 'evidence', label: 'Sources', icon: Share2, count: result?.citations?.length || 0 },
  ];

  return (
    <div className="min-h-screen flex flex-col text-ink">
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

      <main className="flex-1 max-w-6xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
        <QueryConsole onSearch={handleSearch} isLoading={isLoading} initialQuery={currentQuery} />

        {errorMessage && (
          <div className="flex items-center gap-2.5 px-4 py-3 rounded-sheet border border-stamp/40 bg-stamp/[0.06] text-[13px] text-stamp">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span className="font-medium">{errorMessage}</span>
          </div>
        )}

        {/* Loading — an investigation in progress */}
        {isLoading && (
          <div className="sheet shadow-sheet p-8 sm:p-10">
            <div className="field-label mb-5">Reconstructing</div>
            <ol className="space-y-4 max-w-xl">
              {LOADING_PHASES.map((phase, i) => {
                const step = i + 1;
                const state = loadingStep > step ? 'done' : loadingStep === step ? 'active' : 'pending';
                return (
                  <li key={i} className="flex items-start gap-3.5">
                    <span className={`mt-0.5 grid place-items-center w-6 h-6 rounded-full border font-mono text-[11px] shrink-0 transition-colors ${
                      state === 'done' ? 'border-verified bg-verified/10 text-verified'
                        : state === 'active' ? 'border-stamp bg-stamp/10 text-stamp'
                        : 'border-rule text-ink-faint'
                    }`}>
                      {state === 'done' ? '✓' : step}
                    </span>
                    <div>
                      <p className={`text-[15px] font-medium ${state === 'pending' ? 'text-ink-faint' : 'text-ink'} ${state === 'active' ? 'flex items-center gap-2' : ''}`}>
                        {phase.label}
                        {state === 'active' && <span className="inline-block w-1.5 h-1.5 rounded-full bg-stamp animate-pulse" />}
                      </p>
                      <p className="text-[12.5px] text-ink-faint mt-0.5">{phase.hint}</p>
                    </div>
                  </li>
                );
              })}
            </ol>
          </div>
        )}

        {/* Results */}
        {!isLoading && result && (
          <div className="space-y-6">
            {selectedEntityId && (
              <div className="flex items-center justify-between gap-2 px-4 py-2.5 rounded-sheet border border-stamp/30 bg-stamp/[0.05] text-[13px] text-ink-soft">
                <span>Focused on <strong className="font-semibold text-ink">{selectedEntityId}</strong> — timeline, connections, and sources are filtered to match.</span>
                <button onClick={() => setSelectedEntity(null)} className="inline-flex items-center gap-1 text-stamp font-medium hover:underline shrink-0">
                  Clear <X className="w-3 h-3" />
                </button>
              </div>
            )}

            {/* Folder tabs */}
            <div className="flex items-center gap-1 border-b border-rule-strong overflow-x-auto -mb-px">
              {TABS.map(tab => {
                const Icon = tab.icon;
                const active = activeTab === tab.key;
                return (
                  <button
                    key={tab.key}
                    onClick={() => setActiveTab(tab.key)}
                    className={`relative inline-flex items-center gap-2 px-4 py-2.5 text-[13.5px] font-medium whitespace-nowrap rounded-t-sheet border border-b-0 transition-colors ${
                      active
                        ? 'bg-sheet border-rule-strong text-ink'
                        : 'bg-transparent border-transparent text-ink-faint hover:text-ink-soft'
                    }`}
                    style={active ? { marginBottom: '-1px' } : undefined}
                  >
                    <Icon className="w-3.5 h-3.5" />
                    <span>{tab.label}</span>
                    {typeof tab.count === 'number' && tab.count > 0 && (
                      <span className={`font-mono text-[10px] ${tab.alert ? 'text-stamp' : 'text-ink-faint'}`}>
                        {tab.count}
                      </span>
                    )}
                  </button>
                );
              })}
            </div>

            {activeTab === 'overview' && (
              <div className="space-y-6">
                <NarrativeCard
                  directAnswer={result.direct_answer}
                  reasoningSummary={result.reasoning_summary}
                  confidenceScore={result.confidence_score}
                  confidenceRationale={result.confidence_rationale}
                  query={currentQuery}
                  fullResult={result}
                />
                {result.missing_context && result.missing_context.length > 0 && (
                  <MissingContextCallout missingContext={result.missing_context} />
                )}
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
                  <div className="lg:col-span-7 space-y-6">
                    <TimelineView
                      timeline={result.timeline}
                      selectedEntityId={selectedEntityId}
                      onSelectEntityName={(name) => {
                        const match = result.graph?.nodes?.find(n => (n.name || n.id).toLowerCase() === name.toLowerCase());
                        setSelectedEntity(name ? (match || { id: name, name, type: 'person' }) : null);
                      }}
                    />
                    <EvidencePanel citations={result.citations} selectedEntityId={selectedEntityId} />
                  </div>
                  <div className="lg:col-span-5 lg:sticky lg:top-24">
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

            {activeTab === 'timeline' && (
              <TimelineView
                timeline={result.timeline}
                selectedEntityId={selectedEntityId}
                onSelectEntityName={(name) => {
                  const match = result.graph?.nodes?.find(n => (n.name || n.id).toLowerCase() === name.toLowerCase());
                  setSelectedEntity(name ? (match || { id: name, name, type: 'person' }) : null);
                }}
              />
            )}

            {activeTab === 'graph' && (
              <RelationshipGraph
                nodes={result.graph?.nodes || []}
                links={result.graph?.links || []}
                selectedEntityId={selectedEntityId}
                onSelectEntity={(entity) => setSelectedEntity(entity)}
              />
            )}

            {activeTab === 'gaps' && (
              result.missing_context && result.missing_context.length > 0 ? (
                <MissingContextCallout missingContext={result.missing_context} />
              ) : (
                <div className="sheet shadow-sheet p-8 text-center">
                  <p className="font-serif text-[16px] text-ink">The record is complete.</p>
                  <p className="text-[13px] text-ink-faint mt-1">No missing reasons, people, or timeline gaps were flagged for this inquiry.</p>
                </div>
              )
            )}

            {activeTab === 'evidence' && (
              <EvidencePanel citations={result.citations} selectedEntityId={selectedEntityId} />
            )}
          </div>
        )}

        {/* Empty state — a case file waiting to be opened */}
        {!isLoading && !result && (
          <div className="sheet shadow-lift max-w-3xl mx-auto overflow-hidden">
            <div className="px-8 sm:px-12 pt-12 pb-10">
              <div className="field-label mb-4">Case unopened</div>
              <h1 className="font-serif text-[30px] sm:text-[38px] leading-[1.15] font-semibold text-ink max-w-[20ch]">
                Recover the <span className="text-stamp">why</span> behind past decisions.
              </h1>
              <p className="text-[15px] text-ink-soft leading-relaxed max-w-[62ch] mt-5">
                When the people who made a call move on, the reasoning scatters across old RFCs, Slack threads, and meeting notes. Ask a question and ReTrace pulls it back together — a plain answer, a timeline, the people involved, and every source it leaned on. Where the record is silent, it says so instead of guessing.
              </p>

              <div className="mt-8 flex flex-wrap items-center gap-3">
                <button
                  onClick={handleSeedDemo}
                  disabled={isSeeding}
                  className="inline-flex items-center gap-2 px-5 py-2.5 bg-ink hover:bg-ink/85 disabled:opacity-60 text-paper rounded-sheet text-[13.5px] font-semibold transition-colors"
                >
                  <RotateCw className={`w-4 h-4 ${isSeeding ? 'animate-spin' : ''}`} />
                  <span>{isSeeding ? 'Loading…' : 'Open the sample case'}</span>
                </button>
                <button
                  onClick={() => setIsIngestOpen(true)}
                  className="inline-flex items-center gap-2 px-5 py-2.5 bg-paper border border-rule-strong hover:bg-sheet text-ink rounded-sheet text-[13.5px] font-semibold transition-colors"
                >
                  <Plus className="w-4 h-4 text-ink-faint" />
                  <span>Add your own documents</span>
                </button>
              </div>
            </div>

            {/* How it works — three facets, set as ledger rows not identical cards */}
            <div className="border-t border-rule bg-paper/40 px-8 sm:px-12 py-7 grid grid-cols-1 sm:grid-cols-3 gap-x-8 gap-y-6">
              {[
                { n: '01', h: 'Finds across silos', p: 'Semantic and keyword search over every document you add, so nothing relevant gets missed.' },
                { n: '02', h: 'Shows its work', p: 'Every claim is tied to a dated event and a verbatim source quote you can check.' },
                { n: '03', h: 'Admits the gaps', p: 'Missing reasons, absent stakeholders, and broken timelines are flagged, never invented.' },
              ].map(item => (
                <div key={item.n}>
                  <div className="font-mono text-[12px] text-stamp mb-2">{item.n}</div>
                  <h3 className="font-serif text-[15px] font-semibold text-ink mb-1">{item.h}</h3>
                  <p className="text-[13px] text-ink-soft leading-relaxed">{item.p}</p>
                </div>
              ))}
            </div>
          </div>
        )}
      </main>

      <IngestionZone isOpen={isIngestOpen} onClose={() => setIsIngestOpen(false)} onSuccess={fetchDocs} />
      <DocumentLibrary isOpen={isDocLibraryOpen} onClose={() => setIsDocLibraryOpen(false)} documents={documents} />
      <HistoryModal
        isOpen={isHistoryOpen}
        onClose={() => setIsHistoryOpen(false)}
        history={history}
        onSelectQuery={(q) => handleSearch(q)}
        onClearHistory={handleClearHistory}
      />

      <footer className="border-t border-rule bg-paper/50 py-4 mt-auto">
        <div className="max-w-6xl mx-auto px-4 flex items-center justify-between catalog">
          <span>ReTrace · context recovery archive</span>
          <span>every claim tied to a source</span>
        </div>
      </footer>
    </div>
  );
}
