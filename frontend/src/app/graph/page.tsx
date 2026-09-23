"use client";

import React, { useState } from "react";
import { Database, Network } from "lucide-react";
import { useRetrace } from "@/lib/store";
import { KnowledgeGraph } from "@/components/graph/KnowledgeGraph";
import { EntityInspector } from "@/components/graph/EntityInspector";
import { Button, EmptyState, SkeletonCard } from "@/components/ui";
import { PageContainer, PageHeader } from "@/components/layout/PageHeader";

export default function GraphPage() {
  const { graphNodes, graphLinks, graphLoading, seedDemo, seeding } = useRetrace();
  const [selected, setSelected] = useState<string | null>(null);

  return (
    <PageContainer className="max-w-7xl">
      <PageHeader
        icon={<Network className="w-5 h-5" />}
        title="Knowledge graph"
        description="The full web of people, systems, decisions, and documents. Click any node to inspect its connections."
      />

      {graphLoading && graphNodes.length === 0 ? (
        <SkeletonCard className="h-[520px]" />
      ) : graphNodes.length === 0 ? (
        <div className="surface-raised">
          <EmptyState
            icon={<Network className="w-6 h-6" />}
            title="The graph is empty"
            description="Ingest documents to let Retrace map the relationships between people, systems, and decisions."
            action={
              <Button variant="primary" loading={seeding} icon={<Database className="w-4 h-4" />} onClick={() => seedDemo()}>
                Load demo data
              </Button>
            }
          />
        </div>
      ) : (
        <div className="surface-raised p-4 sm:p-5">
          <KnowledgeGraph
            nodes={graphNodes}
            links={graphLinks}
            height={560}
            onSelectEntity={setSelected}
          />
        </div>
      )}

      <EntityInspector
        open={!!selected}
        onClose={() => setSelected(null)}
        entityName={selected}
        nodes={graphNodes}
        links={graphLinks}
        onSelect={setSelected}
      />
    </PageContainer>
  );
}
