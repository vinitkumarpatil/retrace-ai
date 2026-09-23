"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Boxes, Database, FileText, Plus, Search, Sparkles } from "lucide-react";
import { useRetrace } from "@/lib/store";
import { AskBox } from "@/components/investigation/AskBox";
import { InvestigationCard } from "@/components/investigation/InvestigationCard";
import { ImportKnowledge } from "@/components/knowledge/ImportKnowledge";
import { Button, EmptyState, SkeletonCard } from "@/components/ui";

export default function OverviewPage() {
  const router = useRouter();
  const {
    investigations,
    documents,
    graphNodes,
    hydrated,
    seedDemo,
    seeding,
    refreshDocuments,
  } = useRetrace();
  const [importOpen, setImportOpen] = useState(false);

  const ask = (q: string) => router.push(`/investigate?q=${encodeURIComponent(q)}`);
  const recent = hydrated ? investigations.slice(0, 6) : [];

  const stats = [
    { label: "Documents", value: documents.length, icon: FileText },
    { label: "Entities mapped", value: graphNodes.length, icon: Boxes },
    { label: "Investigations", value: hydrated ? investigations.length : 0, icon: Search },
  ];

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-16">
      {/* Hero */}
      <div className="max-w-3xl">
        <div className="inline-flex items-center gap-2 text-2xs font-medium text-iris-soft bg-iris/10 border border-iris/20 rounded-full px-3 py-1 mb-6">
          <Sparkles className="w-3.5 h-3.5" />
          Organizational memory, reconstructed
        </div>
        <h1 className="text-3xl sm:text-[2.75rem] font-semibold leading-[1.08] tracking-tight text-balance">
          <span className="text-gradient">Understand the decisions</span>
          <br />
          behind your systems.
        </h1>
        <p className="text-base sm:text-lg text-ink-3 mt-4 leading-relaxed max-w-2xl text-balance">
          Retrace reconstructs organizational context from documents, decisions, people and
          events — recovering the why, the evidence, and what&apos;s still missing.
        </p>
      </div>

      {/* Ask */}
      <div className="mt-8 max-w-3xl">
        <AskBox onAsk={ask} autoFocus />
      </div>

      {/* Stats + actions */}
      <div className="flex flex-wrap items-center gap-3 mt-8">
        {stats.map((s) => (
          <div
            key={s.label}
            className="flex items-center gap-2.5 surface-inset px-3.5 py-2"
          >
            <s.icon className="w-4 h-4 text-ink-4" />
            <span className="text-sm font-semibold text-ink-1 tabular">{s.value}</span>
            <span className="text-xs text-ink-4">{s.label}</span>
          </div>
        ))}
        <div className="flex items-center gap-2 ml-auto">
          <Button
            variant="subtle"
            size="sm"
            icon={<Plus className="w-3.5 h-3.5" />}
            onClick={() => setImportOpen(true)}
          >
            Add knowledge
          </Button>
          {documents.length === 0 && (
            <Button
              variant="primary"
              size="sm"
              loading={seeding}
              icon={<Database className="w-3.5 h-3.5" />}
              onClick={() => seedDemo()}
            >
              Load demo data
            </Button>
          )}
        </div>
      </div>

      {/* Recent investigations */}
      <div className="mt-14">
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-lg font-semibold text-ink-1">Recent investigations</h2>
          {recent.length > 0 && (
            <Link
              href="/investigate"
              className="text-sm text-ink-3 hover:text-ink-1 transition-colors focus-ring rounded"
            >
              View all
            </Link>
          )}
        </div>

        {!hydrated ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {Array.from({ length: 3 }).map((_, i) => (
              <SkeletonCard key={i} />
            ))}
          </div>
        ) : recent.length === 0 ? (
          <div className="surface-raised">
            <EmptyState
              icon={<Search className="w-6 h-6" />}
              title="No investigations yet"
              description="Ask Retrace a question about your organization's history to begin reconstructing context."
              action={
                documents.length === 0 ? (
                  <Button
                    variant="primary"
                    loading={seeding}
                    icon={<Database className="w-4 h-4" />}
                    onClick={() => seedDemo()}
                  >
                    Load demo data to explore
                  </Button>
                ) : (
                  <Button variant="primary" onClick={() => ask("Why did we migrate to PostgreSQL?")}>
                    Try an example investigation
                  </Button>
                )
              }
            />
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 stagger">
            {recent.map((inv) => (
              <InvestigationCard key={inv.id} investigation={inv} />
            ))}
          </div>
        )}
      </div>

      <ImportKnowledge
        open={importOpen}
        onClose={() => setImportOpen(false)}
        onSuccess={refreshDocuments}
      />
    </div>
  );
}
