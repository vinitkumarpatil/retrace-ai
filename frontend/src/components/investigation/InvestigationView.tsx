"use client";

import React, { useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowLeft, Boxes, CalendarClock, FileText, Network } from "lucide-react";
import { Citation, Investigation, TracedClaim } from "@/lib/types";
import { computeCoverage, countSummary, traceClaims } from "@/lib/utils";
import { useRetrace } from "@/lib/store";
import { Eyebrow } from "@/components/ui";
import { AnswerPanel } from "./AnswerPanel";
import { EvidencePanel } from "./EvidencePanel";
import { InvestigationTimeline } from "./InvestigationTimeline";
import { KnowledgeGaps } from "./KnowledgeGaps";
import { SourceInspector } from "./SourceInspector";
import { ClaimTrace } from "./ClaimTrace";
import { KnowledgeGraph } from "@/components/graph/KnowledgeGraph";
import { EntityInspector } from "@/components/graph/EntityInspector";

export function InvestigationView({ investigation }: { investigation: Investigation }) {
  const router = useRouter();
  const { documents } = useRetrace();
  const result = investigation.result;

  const coverage = useMemo(() => computeCoverage(result), [result]);
  const claims = useMemo(() => traceClaims(result), [result]);
  const counts = useMemo(() => countSummary(result), [result]);

  const [citation, setCitation] = useState<Citation | null>(null);
  const [sourceOpen, setSourceOpen] = useState(false);
  const [claim, setClaim] = useState<TracedClaim | null>(null);
  const [claimOpen, setClaimOpen] = useState(false);
  const [entityName, setEntityName] = useState<string | null>(null);
  const [entityOpen, setEntityOpen] = useState(false);

  const openSource = (c: Citation) => {
    setClaimOpen(false);
    setCitation(c);
    setSourceOpen(true);
  };
  const openClaim = (cl: TracedClaim) => {
    setClaim(cl);
    setClaimOpen(true);
  };
  const openEntity = (name: string) => {
    setEntityName(name);
    setEntityOpen(true);
  };

  const docForCitation = useMemo(() => {
    if (!citation) return undefined;
    return (
      documents.find((d) => d.id === citation.document_id) ||
      documents.find((d) => d.title === citation.document_title)
    );
  }, [citation, documents]);

  const runNew = (q: string) => router.push(`/investigate?q=${encodeURIComponent(q)}`);

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
      {/* Header */}
      <div className="mb-6">
        <Link
          href="/investigate"
          className="inline-flex items-center gap-1.5 text-sm text-ink-3 hover:text-ink-1 transition-colors focus-ring rounded-md mb-4"
        >
          <ArrowLeft className="w-4 h-4" /> Investigations
        </Link>
        <h1 className="text-2xl sm:text-3xl font-semibold text-ink-1 leading-tight text-balance">
          {investigation.question}
        </h1>
        <div className="flex flex-wrap items-center gap-4 mt-3 text-sm text-ink-4">
          <span className="inline-flex items-center gap-1.5">
            <FileText className="w-4 h-4" /> {counts.sources} sources
          </span>
          <span className="inline-flex items-center gap-1.5">
            <Boxes className="w-4 h-4" /> {counts.entities} entities
          </span>
          <span className="inline-flex items-center gap-1.5">
            <CalendarClock className="w-4 h-4" /> {counts.events} events
          </span>
        </div>
      </div>

      {/* Answer */}
      <AnswerPanel
        result={result}
        claims={claims}
        coverage={coverage}
        onSelectClaim={openClaim}
      />

      {/* Body grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 mt-6 items-start">
        <div className="lg:col-span-7 space-y-6">
          <InvestigationTimeline events={result.timeline} />
          <EvidencePanel citations={result.citations} onOpenSource={openSource} />
          <KnowledgeGaps gaps={result.missing_context} onInvestigate={runNew} />
        </div>

        <div className="lg:col-span-5 lg:sticky lg:top-[76px] space-y-4">
          <section className="surface-raised p-5">
            <div className="flex items-center justify-between mb-4">
              <Eyebrow icon={<Network className="w-3.5 h-3.5" />} tone="iris">
                Relationship graph
              </Eyebrow>
              <span className="text-2xs text-ink-4">click a node to inspect</span>
            </div>
            <KnowledgeGraph
              nodes={result.graph?.nodes || []}
              links={result.graph?.links || []}
              height={420}
              onSelectEntity={openEntity}
            />
          </section>
        </div>
      </div>

      {/* Inspectors */}
      <ClaimTrace
        open={claimOpen}
        onClose={() => setClaimOpen(false)}
        claim={claim}
        onOpenSource={openSource}
      />
      <SourceInspector
        open={sourceOpen}
        onClose={() => setSourceOpen(false)}
        citation={citation}
        document={docForCitation}
        referencedBy={investigation.question}
      />
      <EntityInspector
        open={entityOpen}
        onClose={() => setEntityOpen(false)}
        entityName={entityName}
        nodes={result.graph?.nodes || []}
        links={result.graph?.links || []}
        onSelect={openEntity}
      />
    </div>
  );
}
