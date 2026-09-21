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
import { Compass, RefreshCw, AlertCircle, FileSearch, Sparkles, Layers } from 'lucide-react';

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
      console.warn("Could not fetch documents", e);
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
      setErrorMessage(err.message || 'Failed to reconstruct context. Please verify backend is running.');
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
      // Auto run first sample query to showcase the system immediately
      await handleSearch("Why did we change the architecture?");
    } catch (err: any) {
      setErrorMessage(err.message || 'Failed to seed sample project records.');
    } finally {
      setIsSeeding(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#FAF8F5]">
      {/* Blueprint Header */}
      <Navbar
        onOpenIngest={() => setIsIngestOpen(true)}
        onSeedDemo={handleSeedDemo}
        onOpenDocLibrary={() => setIsDocLibraryOpen(true)}
        isSeeding={isSeeding}
        docCount={documents.length}
      />

      {/* Main Drafting Workspace */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        
        {/* Top Section: Query Console */}
        <section>
          <QueryConsole onSearch={handleSearch} isLoading={isLoading} />
        </section>

        {/* Error Alert */}
        {errorMessage && (
          <div className="p-4 rounded border border-rose-300 bg-rose-50 text-xs font-mono text-rose-800 flex items-center space-x-2">
            <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
            <span>ERROR: {errorMessage}</span>
          </div>
        )}

        {/* Loading State */}
        {isLoading && (
          <div className="drafting-card rounded-md border border-[#E2DDD5] bg-white p-12 text-center relative corner-ticks">
            <div className="inline-flex items-center justify-center p-3 rounded-full bg-amber-50 border border-amber-200 text-amber-600 mb-3 animate-pulse">
              <Compass className="w-8 h-8 animate-spin" />
            </div>
            <h3 className="text-sm font-mono font-bold text-stone-900 uppercase tracking-wider">
              RECONSTRUCTING FORENSIC CONTEXT ACROSS HISTORICAL ARTIFACTS
            </h3>
            <p className="text-xs font-mono text-stone-500 mt-1">
              Executing vector similarity search, keyword correlation, and Gemini evidence synthesis...
            </p>
          </div>
        )}

        {/* Reconstructed Results View */}
        {!isLoading && result && (
          <div className="space-y-8 animate-in fade-in duration-300">
            
            {/* Row 1: Executive Narrative Answer */}
            <NarrativeCard
              directAnswer={result.direct_answer}
              reasoningSummary={result.reasoning_summary}
              confidenceScore={result.confidence_score}
              confidenceRationale={result.confidence_rationale}
              query={currentQuery}
            />

            {/* Row 2: Prominently Marked Missing Context Callout */}
            <MissingContextCallout missingContext={result.missing_context} />

            {/* Row 3: 2-Column Split (Timeline & Evidence on Left, Force Graph on Right) */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
              
              {/* Left Column (7 cols): Timeline & Primary Evidence */}
              <div className="lg:col-span-7 space-y-8">
                <TimelineView timeline={result.timeline} />
                <EvidencePanel citations={result.citations} />
              </div>

              {/* Right Column (5 cols): Force-Directed Entity Graph */}
              <div className="lg:col-span-5 sticky top-24">
                <RelationshipGraph
                  nodes={result.graph?.nodes || []}
                  links={result.graph?.links || []}
                />
              </div>

            </div>

          </div>
        )}

        {/* Empty / Initial State Hero */}
        {!isLoading && !result && (
          <div className="drafting-card rounded-md border border-[#E2DDD5] bg-white p-10 relative corner-ticks shadow-xs text-center max-w-3xl mx-auto my-8">
            <div className="w-12 h-12 rounded-full bg-amber-50 border border-amber-200 text-amber-700 flex items-center justify-center mx-auto mb-4">
              <FileSearch className="w-6 h-6" />
            </div>

            <h2 className="text-base font-mono font-bold text-stone-900 uppercase tracking-wider">
              WELCOME TO RETRACE // LOST CONTEXT RECOVERY ENGINE
            </h2>

            <p className="text-xs text-stone-600 font-sans max-w-xl mx-auto mt-2 leading-relaxed">
              When engineers leave, teams reorganize, or architectural pivots happen in Slack threads, 
              the "why" behind past decisions is lost. ReTrace analyzes your scattered PDFs, meeting notes, 
              and transcripts to reconstruct clear timelines, map entity relationships, and flag missing information.
            </p>

            <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
              <button
                onClick={handleSeedDemo}
                disabled={isSeeding}
                className="px-4 py-2 bg-[#1E293B] hover:bg-stone-800 disabled:bg-stone-400 text-white rounded text-xs font-mono font-semibold flex items-center space-x-2 transition-all shadow-xs"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${isSeeding ? 'animate-spin text-amber-400' : 'text-amber-400'}`} />
                <span>{isSeeding ? "Seeding Scenario..." : "Load Project Phoenix Demo"}</span>
              </button>

              <button
                onClick={() => setIsIngestOpen(true)}
                className="px-4 py-2 bg-white hover:bg-stone-50 border border-[#E2DDD5] text-stone-800 rounded text-xs font-mono font-semibold flex items-center space-x-2 transition-all shadow-xs"
              >
                <Layers className="w-3.5 h-3.5 text-stone-500" />
                <span>Upload Custom Documents</span>
              </button>
            </div>

            {/* Feature Checklist */}
            <div className="mt-8 pt-6 border-t border-dashed border-[#E2DDD5] grid grid-cols-1 sm:grid-cols-3 gap-4 text-left font-mono text-[11px] text-stone-600">
              <div className="p-3 bg-[#FAF8F5] rounded border border-[#E2DDD5]">
                <strong className="text-stone-900 block mb-1">// HYBRID RETRIEVAL</strong>
                Vector similarity search via pgvector + exact keyword token matching.
              </div>
              <div className="p-3 bg-[#FAF8F5] rounded border border-[#E2DDD5]">
                <strong className="text-stone-900 block mb-1">// CHRONO TIMELINE</strong>
                Step-by-step reconstructed decision path with exact document citations.
              </div>
              <div className="p-3 bg-[#FAF8F5] rounded border border-[#E2DDD5]">
                <strong className="text-stone-900 block mb-1">// ZERO HALLUCINATION</strong>
                Explicitly flags unrecorded reasons, missing stakeholders, and knowledge gaps.
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

      {/* Blueprint Footer */}
      <footer className="border-t border-[#E2DDD5] bg-white/70 py-4 mt-auto">
        <div className="max-w-7xl mx-auto px-4 text-center text-xs font-mono text-stone-400">
          RETRACE AI // ARCHITECTURAL KNOWLEDGE SYSTEM // PARCHMENT SPEC v0.1
        </div>
      </footer>
    </div>
  );
}
