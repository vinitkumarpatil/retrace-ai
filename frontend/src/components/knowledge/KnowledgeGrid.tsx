"use client";

import React, { useMemo, useState } from "react";
import { LayoutGrid, List, Search } from "lucide-react";
import { DocumentItem } from "@/lib/types";
import { SegmentedControl } from "@/components/ui";
import { DocumentCard } from "./DocumentCard";
import { cn } from "@/lib/utils";
import { sourceTypeLabel } from "@/lib/entityMeta";

type View = "grid" | "list";
type Sort = "recent" | "title";

export function KnowledgeGrid({
  documents,
  onOpenDoc,
}: {
  documents: DocumentItem[];
  onOpenDoc?: (doc: DocumentItem) => void;
}) {
  const [view, setView] = useState<View>("grid");
  const [sort, setSort] = useState<Sort>("recent");
  const [query, setQuery] = useState("");
  const [type, setType] = useState<string>("all");

  const types = useMemo(() => {
    const s = new Set<string>();
    documents.forEach((d) => s.add(d.source_type));
    return Array.from(s);
  }, [documents]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    let out = documents.filter((d) => {
      const matchesType = type === "all" || d.source_type === type;
      const matchesQuery =
        !q ||
        d.title.toLowerCase().includes(q) ||
        d.content_preview?.toLowerCase().includes(q);
      return matchesType && matchesQuery;
    });
    out = [...out].sort((a, b) => {
      if (sort === "title") return a.title.localeCompare(b.title);
      return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
    });
    return out;
  }, [documents, query, type, sort]);

  return (
    <div>
      {/* Toolbar */}
      <div className="flex flex-col sm:flex-row sm:items-center gap-3 mb-5">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-ink-4" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search knowledge…"
            className="w-full h-10 pl-9 pr-3 rounded-lg bg-surface-2 border border-line text-sm text-ink-1 placeholder:text-ink-4 outline-none focus-ring"
          />
        </div>
        <div className="flex items-center gap-2">
          <select
            value={sort}
            onChange={(e) => setSort(e.target.value as Sort)}
            className="h-10 px-3 rounded-lg bg-surface-2 border border-line text-sm text-ink-2 outline-none focus-ring"
            aria-label="Sort documents"
          >
            <option value="recent">Most recent</option>
            <option value="title">Title A–Z</option>
          </select>
          <SegmentedControl<View>
            value={view}
            onChange={setView}
            segments={[
              { value: "grid", icon: <LayoutGrid className="w-3.5 h-3.5" />, ariaLabel: "Grid view" },
              { value: "list", icon: <List className="w-3.5 h-3.5" />, ariaLabel: "List view" },
            ]}
          />
        </div>
      </div>

      {/* Type filters */}
      {types.length > 1 && (
        <div className="flex flex-wrap items-center gap-1.5 mb-5">
          {["all", ...types].map((t) => (
            <button
              key={t}
              onClick={() => setType(t)}
              className={cn(
                "rounded-full border px-3 py-1.5 text-xs transition-colors focus-ring",
                type === t
                  ? "border-iris/40 bg-iris/10 text-iris-soft"
                  : "border-line text-ink-3 hover:text-ink-1 hover:bg-surface-2"
              )}
            >
              {t === "all" ? "All" : sourceTypeLabel(t)}
            </button>
          ))}
        </div>
      )}

      {/* Results */}
      {filtered.length === 0 ? (
        <p className="text-sm text-ink-4 py-10 text-center">
          No documents match your filters.
        </p>
      ) : view === "grid" ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4 stagger">
          {filtered.map((doc) => (
            <DocumentCard
              key={doc.id}
              doc={doc}
              view="grid"
              onClick={() => onOpenDoc?.(doc)}
            />
          ))}
        </div>
      ) : (
        <div className="space-y-2 stagger">
          {filtered.map((doc) => (
            <DocumentCard
              key={doc.id}
              doc={doc}
              view="list"
              onClick={() => onOpenDoc?.(doc)}
            />
          ))}
        </div>
      )}
    </div>
  );
}
