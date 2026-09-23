'use client';

import React, { useState, useEffect, useCallback } from 'react';
import Navbar from '@/components/Navbar';
import QueryConsole from '@/components/QueryConsole';
import NarrativeCard from '@/components/NarrativeCard';
import MissingContextCallout from '@/components/MissingContextCallout';
import TimelineView from '@/components/TimelineView';
import EvidencePanel from '@/components/EvidencePanel';
import IngestionZone from '@/components/IngestionZone';
import DocumentLibrary from '@/components/DocumentLibrary';
import LocalSourceManager from '@/components/LocalSourceManager';
import { queryReconstruction, listDocuments, seedSampleData } from '@/lib/api';
import { ReconstructionResult, DocumentItem } from '@/lib/types';
import { LocalSource, getAllSources } from '@/lib/local-storage';
import { localSearch, LocalSearchResult, getLocalSourceSummary } from '@/lib/local-search';
import { Compass, RefreshCw, AlertCircle, FileSearch, Sparkles, Layers, FolderOpen, WifiOff } from 'lucide-react';

interface LocalSourceSummary extends LocalSource {
  indexedCount: number;
  totalFiles: number;
}

export default function DashboardPage() {
  const [documents, setDocuments] = useState<DocumentItem[]>([]);
  const [localSources, setLocalSources] = useState<LocalSourceSummary[]>([]);
  const [localResults, setLocalResults] = useState<LocalSearchResult[]>([]);
  const [result, setResult] = useState<ReconstructionResult | null>(null);
  const [currentQuery, setCurrentQuery] = useState<string>('');
  const [selectedScope, setSelectedScope] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isSeeding, setIsSeeding] = useState<boolean>(false);
  const [isIngestOpen, setIsIngestOpen] = useState<boolean>(false);
  const [isDocLibraryOpen, setIsDocLibraryOpen] = useState<boolean>(false);
  const [isLocalManagerOpen, setIsLocalManagerOpen] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isOnline, setIsOnline] = useState<boolean>(true);

  useEffect(() => {
    setIsOnline(navigator.onLine);
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  const fetchDocs = async () => {
    try {
      const docs = await listDocuments();
      setDocuments(docs);
    } catch (e) {
      console.warn("Could not fetch documents", e);
    }
  };

  const fetchLocalSources = useCallback(async () => {
    try {
      const summaries = await getLocalSourceSummary();
      setLocalSources(summaries);
    } catch (e) {
      console.warn("Could not fetch local sources", e);
    }
  }, []);

  useEffect(() => {
    fetchDocs();
    fetchLocalSources();
  }, [fetchLocalSources]);

  const handleSearch = async (queryText: string, scope?: string[]) => {
    setIsLoading(true);
    setErrorMessage(null);
    setCurrentQuery(queryText);
    const activeScope = scope !== undefined ? scope : selectedScope;

    try {
      const localResults = await localSearch(queryText, activeScope.length > 0 ? activeScope : undefined);
      setLocalResults(localResults);

      if (navigator.onLine) {
        try {
          const data = await queryReconstruction(queryText, undefined, activeScope);
          setResult(data);
        } catch {
          if (localResults.length > 0) {
            setResult(buildLocalReconstruction(queryText, localResults));
          } else {
            setErrorMessage('No results found. Try a different query or connect more sources.');
          }
        }
      } else if (localResults.length > 0) {
        setResult(buildLocalReconstruction(queryText, localResults));
      } else {
        setErrorMessage('Offline mode: No local results found for this query.');
      }
    } catch (err: any) {
      setErrorMessage(err.message || 'Search failed.');
    } finally {
      setIsLoading(false);
    }
  };

  const buildLocalReconstruction = (query: string, results: LocalSearchResult[]): ReconstructionResult => {
    const terms = query.toLowerCase().split(/\s+/);
    const citations = results.slice(0, 10).map(r => ({
      document_id: r.file.id,
      document_title: r.file.fileName,
      source_type: 'local' as const,
      quote: r.matchedChunks[0] || r.file.rawContent.slice(0, 200),
      relevance: `Matched ${r.score} points across ${r.matchedChunks.length} chunks`,
      path: r.file.relativePath,
      absolutePath: r.file.relativePath, // Use relativePath as fallback
    }));

    const entities = results.flatMap(r =>
      r.matchedChunks.slice(0, 3).map(chunk => ({
        id: `${r.file.id}_${chunk.slice(0, 20)}`,
        name: extractEntityName(chunk, terms),
        type: 'document' as const,
        description: chunk.slice(0, 100),
      }))
    );

    return {
      query,
      direct_answer: `Found ${results.length} relevant local document${results.length !== 1 ? 's' : ''} matching "${query}".`,
      reasoning_summary: `Local search matched across ${results.length} files. Results are from locally connected sources without requiring internet.`,
      confidence_score: results.length > 3 ? 'high' : results.length > 0 ? 'medium' : 'low',
      confidence_rationale: `${results.length} local source${results.length !== 1 ? 's' : ''} matched the query terms.`,
      timeline: [],
      graph: { nodes: entities, links: [] },
      citations,
      missing_context: [],
      backend_only: true,
    };
  };

  const extractEntityName = (chunk: string, terms: string[]): string => {
    for (const term of terms) {
      const idx = chunk.toLowerCase().indexOf(term);
      if (idx >= 0) {
        const start = Math.max(0, idx - 20);
        const end = Math.min(chunk.length, idx + term.length + 20);
        return chunk.slice(start, end).trim();
      }
    }
    return chunk.slice(0, 40).trim();
  };

  const handleSeedDemo = async () => {
    setIsSeeding(true);
    setErrorMessage(null);
    try {
      await seedSampleData();
      await fetchDocs();
      await handleSearch("Why did we change the architecture?");
    } catch (err: any) {
      setErrorMessage(err.message || 'Failed to seed sample project records.');
    } finally {
      setIsSeeding(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col" style={{ backgroundColor: 'transparent' }}>
      {/* Navbar */}
      <Navbar
        onOpenIngest={() => setIsIngestOpen(true)}
        onSeedDemo={handleSeedDemo}
        onOpenDocLibrary={() => setIsDocLibraryOpen(true)}
        isSeeding={isSeeding}
        docCount={documents.length + localSources.length}
        isOnline={isOnline}
      />

      {/* Main workspace */}
      <main className="flex-1 max-w-5xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">

        {/* Offline Banner */}
        {!isOnline && (
          <div className="p-3 rounded border border-amber-300 bg-amber-50 text-xs font-mono text-amber-800 flex items-center space-x-2">
            <WifiOff className="w-4 h-4 text-amber-600 shrink-0" />
            <span>OFFLINE MODE — Local search is active. Gemini AI features require internet.</span>
          </div>
        )}

        {/* Query Console */}
        <section>
          <QueryConsole
            onSearch={handleSearch}
            isLoading={isLoading}
            documents={documents}
            selectedScope={selectedScope}
            onScopeChange={setSelectedScope}
            localSources={localSources}
          />
        </section>

        {/* Error / Status Alert */}
        {errorMessage && (
          <div className={`p-4 rounded border text-xs font-mono flex items-center space-x-2 ${
            errorMessage.includes('Indexed') || errorMessage.includes('Success')
              ? 'border-emerald-300 bg-emerald-50 text-emerald-800'
              : 'border-rose-300 bg-rose-50 text-rose-800'
          }`}>
            {errorMessage.includes('Indexed') || errorMessage.includes('Success') ? (
              <span className="w-4 h-4 text-emerald-600 shrink-0">✓</span>
            ) : (
              <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
            )}
            <span>{errorMessage}</span>
          </div>
        )}

        {/* Loading */}
        {isLoading && (
          <div className="drafting-card rounded-md border p-12 text-center relative corner-ticks" style={{ backgroundColor: 'var(--card-bg)', borderColor: 'var(--border-blueprint)' }}>
            <div className="inline-flex items-center justify-center p-3 rounded-full bg-amber-50 border border-amber-200 text-amber-600 mb-3 animate-pulse">
              <Compass className="w-8 h-8 animate-spin" />
            </div>
            <h3 className="text-sm font-mono font-bold uppercase tracking-wider" style={{ color: 'var(--ink-primary)' }}>
              RECONSTRUCTING FORENSIC CONTEXT
            </h3>
            <p className="text-xs font-mono mt-1" style={{ color: 'var(--ink-secondary)' }}>
              {isOnline
                ? 'Executing hybrid search across local + cloud sources...'
                : 'Executing local search across connected sources...'}
            </p>
          </div>
        )}

        {/* Results — full-width (no graph column) */}
        {!isLoading && result && (
          <div className="space-y-8 animate-in fade-in duration-300">
            <NarrativeCard
              directAnswer={result.direct_answer}
              reasoningSummary={result.reasoning_summary}
              confidenceScore={result.confidence_score}
              confidenceRationale={result.confidence_rationale}
              query={currentQuery}
              backendOnly={result.backend_only}
            />

            <MissingContextCallout missingContext={result.missing_context} />

            {/* Full-width: Timeline + Evidence stacked */}
            <TimelineView timeline={result.timeline} />
            <EvidencePanel citations={result.citations} backendOnly={result.backend_only} />
          </div>
        )}

        {/* Empty / Initial State Hero */}
        {!isLoading && !result && documents.length === 0 && localSources.length === 0 && (
          <div className="drafting-card rounded-md border p-10 relative corner-ticks shadow-xs text-center max-w-3xl mx-auto my-8" style={{ backgroundColor: 'var(--card-bg)', borderColor: 'var(--border-blueprint)' }}>
            <div className="w-12 h-12 rounded-full bg-amber-50 border border-amber-200 text-amber-700 flex items-center justify-center mx-auto mb-4">
              <FileSearch className="w-6 h-6" />
            </div>

            <h2 className="text-base font-mono font-bold uppercase tracking-wider" style={{ color: 'var(--ink-primary)' }}>
              RETRACE // CONTEXT RECOVERY ENGINE
            </h2>

            <p className="text-xs font-sans max-w-xl mx-auto mt-2 leading-relaxed" style={{ color: 'var(--ink-secondary)' }}>
              Connect a local folder or upload files to begin reconstructing context from your real documents.
            </p>

            <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
              <button
                onClick={() => setIsDocLibraryOpen(true)}
                className="px-4 py-2 bg-[#1E293B] hover:bg-stone-800 text-white rounded text-xs font-mono font-semibold flex items-center space-x-2 transition-all shadow-xs"
              >
                <FolderOpen className="w-3.5 h-3.5 text-amber-400" />
                <span>Connect Local Folder</span>
              </button>

              <button
                onClick={() => setIsIngestOpen(true)}
                className="px-4 py-2 rounded text-xs font-mono font-semibold flex items-center space-x-2 transition-all shadow-xs border"
                style={{ backgroundColor: 'var(--card-bg)', borderColor: 'var(--border-blueprint)', color: 'var(--ink-primary)' }}
              >
                <Layers className="w-3.5 h-3.5" style={{ color: 'var(--ink-secondary)' }} />
                <span>Upload Files</span>
              </button>
            </div>

            {/* Demo */}
            <div className="mt-8 pt-6 border-t border-dashed" style={{ borderColor: 'var(--border-blueprint)' }}>
              <p className="text-[10px] font-mono uppercase tracking-wider mb-3" style={{ color: 'var(--ink-secondary)' }}>Or try with demo data</p>
              <button
                onClick={handleSeedDemo}
                disabled={isSeeding}
                className="px-4 py-2 bg-amber-50 hover:bg-amber-100 border border-amber-200 text-amber-800 rounded text-xs font-mono font-semibold flex items-center space-x-2 transition-all shadow-xs mx-auto"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${isSeeding ? 'animate-spin text-amber-600' : 'text-amber-600'}`} />
                <span>{isSeeding ? "Loading..." : "Load Phoenix Demo"}</span>
              </button>
            </div>
          </div>
        )}

        {/* Empty State with Sources but no query */}
        {!isLoading && !result && (documents.length > 0 || localSources.length > 0) && (
          <div className="drafting-card rounded-md border p-8 relative corner-ticks shadow-xs text-center max-w-2xl mx-auto my-8" style={{ backgroundColor: 'var(--card-bg)', borderColor: 'var(--border-blueprint)' }}>
            <div className="w-10 h-10 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-700 flex items-center justify-center mx-auto mb-3">
              <FileSearch className="w-5 h-5" />
            </div>

            <h3 className="text-sm font-mono font-bold uppercase tracking-wider" style={{ color: 'var(--ink-primary)' }}>
              {documents.length + localSources.length} SOURCE{(documents.length + localSources.length) > 1 ? 'S' : ''} INDEXED
            </h3>

            <p className="text-xs font-sans mt-1" style={{ color: 'var(--ink-secondary)' }}>
              Ask a question above to reconstruct context from your documents.
            </p>

            <div className="mt-4 flex flex-wrap items-center justify-center gap-2">
              <button
                onClick={() => setIsDocLibraryOpen(true)}
                className="px-3 py-1.5 rounded text-[11px] font-mono font-semibold flex items-center space-x-1.5 transition-all shadow-xs border"
                style={{ backgroundColor: 'var(--card-bg)', borderColor: 'var(--border-blueprint)', color: 'var(--ink-primary)' }}
              >
                <FolderOpen className="w-3 h-3" style={{ color: 'var(--ink-secondary)' }} />
                <span>Add Local Source</span>
              </button>
              <button
                onClick={() => setIsIngestOpen(true)}
                className="px-3 py-1.5 rounded text-[11px] font-mono font-semibold flex items-center space-x-1.5 transition-all shadow-xs border"
                style={{ backgroundColor: 'var(--card-bg)', borderColor: 'var(--border-blueprint)', color: 'var(--ink-primary)' }}
              >
                <Layers className="w-3 h-3" style={{ color: 'var(--ink-secondary)' }} />
                <span>Upload Files</span>
              </button>
            </div>
          </div>
        )}

      </main>

      {/* Modals */}
      <IngestionZone
        isOpen={isIngestOpen}
        onClose={() => setIsIngestOpen(false)}
        onSuccess={() => { fetchDocs(); }}
      />

      <LocalSourceManager
        isOpen={isLocalManagerOpen}
        onClose={() => setIsLocalManagerOpen(false)}
        onSourcesChanged={() => { fetchLocalSources(); }}
      />

      <DocumentLibrary
        isOpen={isDocLibraryOpen}
        onClose={() => setIsDocLibraryOpen(false)}
        documents={documents}
        onOpenLocalManager={() => {
          setIsDocLibraryOpen(false);
          setIsLocalManagerOpen(true);
        }}
        localSources={localSources}
        onLocalSourcesChanged={fetchLocalSources}
      />

      {/* Footer */}
      <footer className="border-t py-4 mt-auto" style={{ borderColor: 'var(--border-blueprint)', backgroundColor: 'var(--card-bg)' }}>
        <div className="max-w-7xl mx-auto px-4 text-center text-xs font-mono" style={{ color: 'var(--ink-secondary)' }}>
          RETRACE AI // {isOnline ? 'LOCAL + CLOUD' : 'LOCAL MODE'} // ARCHITECTURAL KNOWLEDGE SYSTEM
        </div>
      </footer>
    </div>
  );
}
