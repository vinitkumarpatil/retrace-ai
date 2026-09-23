"use client";

import React, { Suspense, useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { CalendarDays, Database, Library, Plus, RefreshCw } from "lucide-react";
import { useRetrace } from "@/lib/store";
import { DocumentItem } from "@/lib/types";
import { KnowledgeGrid } from "@/components/knowledge/KnowledgeGrid";
import { ImportKnowledge } from "@/components/knowledge/ImportKnowledge";
import {
  Button,
  Drawer,
  Eyebrow,
  Badge,
  EmptyState,
  SkeletonCard,
} from "@/components/ui";
import { PageContainer, PageHeader } from "@/components/layout/PageHeader";
import { sourceTypeLabel } from "@/lib/entityMeta";
import { formatEventDate } from "@/lib/utils";

function KnowledgeInner() {
  const params = useSearchParams();
  const {
    documents,
    documentsLoading,
    refreshDocuments,
    seedDemo,
    seeding,
  } = useRetrace();
  const [importOpen, setImportOpen] = useState(false);
  const [selected, setSelected] = useState<DocumentItem | null>(null);

  // Always fetch the latest documents when landing on this page.
  useEffect(() => {
    refreshDocuments();
  }, [refreshDocuments]);

  useEffect(() => {
    const docId = params.get("doc");
    if (docId) {
      const d = documents.find((x) => x.id === docId);
      if (d) setSelected(d);
    }
  }, [params, documents]);

  return (
    <PageContainer>
      <PageHeader
        icon={<Library className="w-5 h-5" />}
        title="Knowledge"
        description="Every document, note, and transcript Retrace draws on to reconstruct context."
        actions={
          <>
            <Button
              variant="subtle"
              size="sm"
              icon={<RefreshCw className={documentsLoading ? "w-3.5 h-3.5 animate-spin" : "w-3.5 h-3.5"} />}
              onClick={() => refreshDocuments()}
            >
              Refresh
            </Button>
            <Button
              variant="primary"
              size="sm"
              icon={<Plus className="w-3.5 h-3.5" />}
              onClick={() => setImportOpen(true)}
            >
              Add knowledge
            </Button>
          </>
        }
      />

      {documentsLoading && documents.length === 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
          {Array.from({ length: 6 }).map((_, i) => (
            <SkeletonCard key={i} />
          ))}
        </div>
      ) : documents.length === 0 ? (
        <div className="surface-raised">
          <EmptyState
            icon={<Library className="w-6 h-6" />}
            title="Your knowledge base is empty"
            description="Import documents, notes, or web pages — or load the demo dataset to see Retrace in action."
            action={
              <div className="flex items-center gap-2">
                <Button variant="secondary" icon={<Plus className="w-4 h-4" />} onClick={() => setImportOpen(true)}>
                  Add knowledge
                </Button>
                <Button variant="primary" loading={seeding} icon={<Database className="w-4 h-4" />} onClick={() => seedDemo()}>
                  Load demo data
                </Button>
              </div>
            }
          />
        </div>
      ) : (
        <KnowledgeGrid documents={documents} onOpenDoc={setSelected} />
      )}

      {/* Document drawer */}
      <Drawer
        open={!!selected}
        onClose={() => setSelected(null)}
        eyebrow={
          selected ? (
            <Eyebrow tone="cyan">{sourceTypeLabel(selected.source_type)} document</Eyebrow>
          ) : undefined
        }
        title={selected?.title}
      >
        {selected && (
          <div className="p-5 space-y-5">
            <div className="flex items-center gap-2 text-xs text-ink-3">
              <CalendarDays className="w-3.5 h-3.5" />
              {formatEventDate((selected.metadata?.date as string) || selected.created_at)}
            </div>
            <div className="flex flex-wrap gap-2">
              {typeof selected.entity_count === "number" && (
                <Badge tone="neutral">{selected.entity_count} entities</Badge>
              )}
              {typeof selected.event_count === "number" && (
                <Badge tone="neutral">{selected.event_count} events</Badge>
              )}
            </div>
            <div>
              <div className="text-2xs font-semibold uppercase tracking-[0.14em] text-ink-4 mb-2">
                Content
              </div>
              <div className="surface-inset p-4 text-sm text-ink-2 leading-relaxed whitespace-pre-wrap">
                {selected.content_preview}
              </div>
            </div>
          </div>
        )}
      </Drawer>

      <ImportKnowledge
        open={importOpen}
        onClose={() => setImportOpen(false)}
        onSuccess={refreshDocuments}
      />
    </PageContainer>
  );
}

export default function KnowledgePage() {
  return (
    <Suspense fallback={null}>
      <KnowledgeInner />
    </Suspense>
  );
}
