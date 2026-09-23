"use client";

import React from "react";
import { Boxes, CalendarClock, FileText } from "lucide-react";
import { DocumentItem } from "@/lib/types";
import { Badge } from "@/components/ui";
import { sourceTypeLabel } from "@/lib/entityMeta";
import { formatEventDate } from "@/lib/utils";

const SOURCE_TONE: Record<string, "iris" | "cyan" | "emerald" | "amber" | "rose"> = {
  pdf: "rose",
  image: "amber",
  text: "cyan",
  url: "iris",
};

export function DocumentCard({
  doc,
  view,
  onClick,
}: {
  doc: DocumentItem;
  view: "grid" | "list";
  onClick?: () => void;
}) {
  const date = (doc.metadata?.date as string) || doc.created_at;

  if (view === "list") {
    return (
      <button
        onClick={onClick}
        className="w-full text-left surface-raised interactive card-accent px-4 py-3 flex items-center gap-4 focus-ring"
      >
        <span className="grid place-items-center w-9 h-9 rounded-lg bg-surface-2 border border-line text-ink-3 shrink-0">
          <FileText className="w-4 h-4" />
        </span>
        <span className="min-w-0 flex-1">
          <span className="block text-sm font-medium text-ink-1 truncate">{doc.title}</span>
          <span className="block text-2xs text-ink-4 truncate mt-0.5">
            {doc.content_preview}
          </span>
        </span>
        <span className="hidden sm:flex items-center gap-3 text-2xs text-ink-4 shrink-0">
          {typeof doc.entity_count === "number" && (
            <span className="inline-flex items-center gap-1">
              <Boxes className="w-3 h-3" /> {doc.entity_count}
            </span>
          )}
          <span>{formatEventDate(date)}</span>
        </span>
        <Badge tone={SOURCE_TONE[doc.source_type] || "neutral"}>
          {sourceTypeLabel(doc.source_type)}
        </Badge>
      </button>
    );
  }

  return (
    <button
      onClick={onClick}
      className="text-left surface-raised interactive card-accent p-5 flex flex-col h-full focus-ring"
    >
      <div className="flex items-center justify-between mb-3">
        <span className="grid place-items-center w-9 h-9 rounded-lg bg-surface-2 border border-line text-ink-3">
          <FileText className="w-4 h-4" />
        </span>
        <Badge tone={SOURCE_TONE[doc.source_type] || "neutral"}>
          {sourceTypeLabel(doc.source_type)}
        </Badge>
      </div>
      <h3 className="text-sm font-medium text-ink-1 leading-snug line-clamp-2">{doc.title}</h3>
      <p className="text-xs text-ink-4 leading-relaxed line-clamp-3 mt-2 flex-1">
        {doc.content_preview}
      </p>
      <div className="flex items-center gap-3 mt-4 pt-3 border-t border-line text-2xs text-ink-4">
        {typeof doc.entity_count === "number" && (
          <span className="inline-flex items-center gap-1">
            <Boxes className="w-3 h-3" /> {doc.entity_count} entities
          </span>
        )}
        <span className="inline-flex items-center gap-1 ml-auto">
          <CalendarClock className="w-3 h-3" /> {formatEventDate(date)}
        </span>
      </div>
    </button>
  );
}
