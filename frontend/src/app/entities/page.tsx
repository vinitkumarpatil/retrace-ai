"use client";

import React, { Suspense, useEffect, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import { Boxes, Database, Search } from "lucide-react";
import { useRetrace } from "@/lib/store";
import { deriveEntities } from "@/lib/utils";
import { EntityType } from "@/lib/types";
import { EntityCard } from "@/components/entities/EntityCard";
import { EntityInspector } from "@/components/graph/EntityInspector";
import { Button, EmptyState, SkeletonCard } from "@/components/ui";
import { PageContainer, PageHeader } from "@/components/layout/PageHeader";
import { ENTITY_META, entityMeta } from "@/lib/entityMeta";
import { cn } from "@/lib/utils";

function EntitiesInner() {
  const params = useSearchParams();
  const { graphNodes, graphLinks, graphLoading, seedDemo, seeding } = useRetrace();
  const [selected, setSelected] = useState<string | null>(null);
  const [query, setQuery] = useState("");
  const [type, setType] = useState<string>("all");

  const entities = useMemo(
    () => deriveEntities(graphNodes, graphLinks),
    [graphNodes, graphLinks]
  );

  useEffect(() => {
    const e = params.get("e");
    if (e) setSelected(e);
  }, [params]);

  const presentTypes = useMemo(() => {
    const s = new Set<string>();
    entities.forEach((e) => s.add(e.type));
    return Array.from(s);
  }, [entities]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return entities.filter((e) => {
      const okType = type === "all" || e.type === type;
      const okQuery = !q || e.name.toLowerCase().includes(q);
      return okType && okQuery;
    });
  }, [entities, query, type]);

  return (
    <PageContainer>
      <PageHeader
        icon={<Boxes className="w-5 h-5" />}
        title="Entities"
        description="People, teams, systems, and concepts Retrace has connected across your knowledge base."
      />

      {graphLoading && entities.length === 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {Array.from({ length: 6 }).map((_, i) => (
            <SkeletonCard key={i} />
          ))}
        </div>
      ) : entities.length === 0 ? (
        <div className="surface-raised">
          <EmptyState
            icon={<Boxes className="w-6 h-6" />}
            title="No entities mapped yet"
            description="Entities are extracted as you ingest documents. Load the demo dataset or add knowledge to populate the graph."
            action={
              <Button variant="primary" loading={seeding} icon={<Database className="w-4 h-4" />} onClick={() => seedDemo()}>
                Load demo data
              </Button>
            }
          />
        </div>
      ) : (
        <>
          {/* Controls */}
          <div className="flex flex-col sm:flex-row gap-3 mb-5">
            <div className="relative flex-1 min-w-[200px]">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-ink-4" />
              <input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search entities…"
                className="w-full h-10 pl-9 pr-3 rounded-lg bg-surface-2 border border-line text-sm text-ink-1 placeholder:text-ink-4 outline-none focus-ring"
              />
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-1.5 mb-5">
            {["all", ...presentTypes].map((t) => {
              const meta = t !== "all" ? (ENTITY_META[t as EntityType] || entityMeta(t)) : null;
              return (
                <button
                  key={t}
                  onClick={() => setType(t)}
                  className={cn(
                    "inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs transition-colors focus-ring",
                    type === t
                      ? "border-iris/40 bg-iris/10 text-iris-soft"
                      : "border-line text-ink-3 hover:text-ink-1 hover:bg-surface-2"
                  )}
                >
                  {meta && (
                    <span className="w-2 h-2 rounded-full" style={{ backgroundColor: meta.color }} />
                  )}
                  {t === "all" ? "All" : entityMeta(t).label}
                </button>
              );
            })}
          </div>

          {filtered.length === 0 ? (
            <p className="text-sm text-ink-4 py-10 text-center">No entities match your filters.</p>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 stagger">
              {filtered.map((e) => (
                <EntityCard key={e.id} entity={e} onClick={() => setSelected(e.name)} />
              ))}
            </div>
          )}
        </>
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

export default function EntitiesPage() {
  return (
    <Suspense fallback={null}>
      <EntitiesInner />
    </Suspense>
  );
}
