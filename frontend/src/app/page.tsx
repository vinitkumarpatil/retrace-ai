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
import { queryReconstruction, listDocuments, seedSampleData } from '@/lib/api';
import { ReconstructionResult, DocumentItem } from '@/lib/types';
import { Radar, RefreshCw, AlertCircle, ScanSearch, Layers } from 'lucide-react';

export default function DashboardPage() {
  const [documents, setDocuments] = useState<DocumentItem[]>([]);
  const [result, setResult] = useState<ReconstructionResult | null>(null);
  const [currentQuery, setCurrentQuery] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isSeeding, setIsSeeding] = useState<boolean>(false);
  const [isIngestOpen, setIsIngestOpen] = useState<boolean>(false);
  const [isDocLibraryOpen, setIsDocLibraryOpen] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

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

  const handleSearch = async (queryText: string) => {
    setIsLoading(true);
    setErrorMessage(null);
    setCurrentQuery(queryText);
    try {
      const data = await queryReconstruction(queryText);
      setResult(data);
    } catch (err: any) {
      setErrorMessage(err.message || 'Failed to reconstruct context. Please verify the backend is running.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSeedDemo = async () => {
    setIsSeeding(true);
    setErrorMessage(null);
    try {
      await seedSampleData();
      await fetchDocs();
      await handleSearch('Why did we migrate to PostgreSQL and change the vector index on August 12?');
    } catch (err: any) {
      setErrorMessage(err.message || 'Failed to seed sample project records.');
    } finally {
      setIsSeeding(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar
        onOpenIngest={() => setIsIngestOpen(true)}
        onSeedDemo={handleSeedDemo}
        onOpenDocLibrary={() => setIsDocLibraryOpen(true)}
        isSeeding={isSeeding}
        docCount={documents.length}
      />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">

        {/* Query console */}
        <QueryConsole onSearch={handleSearch} isLoading={isLoading} />

        {/* Error */}
        {errorMessage && (
          <div className="p-4 rounded-xl border border-console-rose/30 bg-console-rose/[0.06] text-xs font-mono text-console-rose flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>ERROR: {errorMessage}</span>
          </div>
        )}

        {/* Loading */}
        {isLoading && (
          <div className="panel brackets scanline p-12 text-center">
            <div className="inline-flex items-center justify-center p-3 rounded-full bg-console-cyan/10 border border-console-cyan/25 text-console-cyan mb-4">
              <Radar className="w-8 h-8 animate-spin" />
            </div>
            <h3 className="text-sm font-semibold text-white uppercase tracking-wider">
              Reconstructing forensic context
            </h3>
            <p className="text-xs font-mono text-console-mute mt-1.5">
              vector similarity · keyword correlation · Gemini synthesis
            </p>
          </div>
        )}

        {/* Results */}
        {!isLoading && result && (
          <div className="space-y-8">
            <NarrativeCard
              directAnswer={result.direct_answer}
              reasoningSummary={result.reasoning_summary}
              confidenceScore={result.confidence_score}
              confidenceRationale={result.confidence_rationale}
              query={currentQuery}
            />

            <MissingContextCallout missingContext={result.missing_context} />

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
              <div className="lg:col-span-7 space-y-8">
                <TimelineView timeline={result.timeline} />
                <EvidencePanel citations={result.citations} />
              </div>
              <div className="lg:col-span-5 lg:sticky lg:top-24">
                <RelationshipGraph
                  nodes={result.graph?.nodes || []}
                  links={result.graph?.links || []}
                />
              </div>
            </div>
          </div>
        )}

        {/* Empty / hero */}
        {!isLoading && !result && (
          <div className="panel brackets animate-rise p-10 text-center max-w-3xl mx-auto my-8">
            <div className="w-14 h-14 rounded-2xl bg-console-cyan/10 border border-console-cyan/25 text-console-cyan flex items-center justify-center mx-auto mb-5 glow-cyan">
              <ScanSearch className="w-7 h-7" />
            </div>

            <h2 className="text-xl font-semibold text-white tracking-tight">
              Recover the <span className="text-console-cyan text-glow-cyan">lost context</span> behind past decisions
            </h2>

            <p className="text-sm text-console-dim max-w-xl mx-auto mt-3 leading-relaxed">
              When engineers leave, teams reorganize, or architectural pivots happen in Slack threads,
              the “why” behind decisions is lost. ReTrace analyzes your scattered PDFs, notes, and
              transcripts to reconstruct timelines, map entity relationships, and flag missing information.
            </p>

            <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
              <button
                onClick={handleSeedDemo}
                disabled={isSeeding}
                className="px-4 py-2.5 bg-console-cyan hover:bg-white disabled:bg-console-s3 disabled:text-console-mute text-console-bg rounded-lg text-xs font-semibold flex items-center gap-2 transition-all"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${isSeeding ? 'animate-spin' : ''}`} />
                <span>{isSeeding ? 'Seeding scenario…' : 'Load Meridian Demo'}</span>
              </button>

              <button
                onClick={() => setIsIngestOpen(true)}
                className="px-4 py-2.5 bg-console-s2 hover:bg-console-s3 border border-console-border text-console-dim hover:text-white rounded-lg text-xs font-semibold flex items-center gap-2 transition-all"
              >
                <Layers className="w-3.5 h-3.5" />
                <span>Upload Documents</span>
              </button>
            </div>

            {/* Feature grid */}
            <div className="mt-8 pt-6 border-t border-console-border grid grid-cols-1 sm:grid-cols-3 gap-3 text-left font-mono text-[11px]">
              {[
                { t: 'Hybrid Retrieval', d: 'Vector similarity via pgvector + exact keyword token matching.', c: 'text-console-cyan' },
                { t: 'Chrono Timeline', d: 'Step-by-step decision path with exact document citations.', c: 'text-console-emerald' },
                { t: 'Zero Hallucination', d: 'Flags unrecorded reasons, missing stakeholders, and gaps.', c: 'text-console-rose' },
              ].map((f) => (
                <div key={f.t} className="inset-tile p-3">
                  <strong className={`block mb-1 ${f.c}`}>// {f.t}</strong>
                  <span className="text-console-dim">{f.d}</span>
                </div>
              ))}
            </div>
          </div>
        )}

      </main>

      <IngestionZone
        isOpen={isIngestOpen}
        onClose={() => setIsIngestOpen(false)}
        onSuccess={fetchDocs}
      />

      <DocumentLibrary
        isOpen={isDocLibraryOpen}
        onClose={() => setIsDocLibraryOpen(false)}
        documents={documents}
      />

      <footer className="border-t border-console-border py-4 mt-auto">
        <div className="max-w-7xl mx-auto px-4 text-center text-[11px] font-mono text-console-mute tracking-wider">
          RETRACE // CONTEXT RECOVERY ENGINE // CONSOLE SPEC v0.1
        </div>
      </footer>
    </div>
  );
}
