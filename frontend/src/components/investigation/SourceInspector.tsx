"use client";

import React from "react";
import { CalendarDays, FileText, Link2 } from "lucide-react";
import { Citation, DocumentItem } from "@/lib/types";
import { Drawer, Eyebrow, Badge } from "@/components/ui";
import { sourceTypeLabel } from "@/lib/entityMeta";
import { formatEventDate } from "@/lib/utils";

/** Renders text with the first occurrence of `mark` highlighted. */
function Highlighted({ text, mark }: { text: string; mark?: string }) {
  if (!mark) return <>{text}</>;
  const idx = text.toLowerCase().indexOf(mark.toLowerCase().slice(0, 60));
  if (idx === -1) return <>{text}</>;
  const end = Math.min(text.length, idx + mark.length);
  return (
    <>
      {text.slice(0, idx)}
      <mark className="evidence-mark">{text.slice(idx, end)}</mark>
      {text.slice(end)}
    </>
  );
}

export function SourceInspector({
  open,
  onClose,
  citation,
  document,
  referencedBy,
}: {
  open: boolean;
  onClose: () => void;
  citation: Citation | null;
  document?: DocumentItem;
  referencedBy?: string;
}) {
  if (!citation) return null;

  const date =
    (document?.metadata?.date as string) ||
    (document?.created_at ? formatEventDate(document.created_at) : undefined);

  return (
    <Drawer
      open={open}
      onClose={onClose}
      eyebrow={
        <Eyebrow icon={<FileText className="w-3.5 h-3.5" />} tone="cyan">
          {sourceTypeLabel(citation.source_type)} source
        </Eyebrow>
      }
      title={citation.document_title}
    >
      <div className="p-5 space-y-5">
        {date && (
          <div className="flex items-center gap-2 text-xs text-ink-3">
            <CalendarDays className="w-3.5 h-3.5" />
            {date}
          </div>
        )}

        {/* Source content with the cited evidence highlighted */}
        <div>
          <div className="text-2xs font-semibold uppercase tracking-[0.14em] text-ink-4 mb-2">
            Source content
          </div>
          <div className="surface-inset p-4 text-sm text-ink-2 leading-relaxed whitespace-pre-wrap max-h-72 overflow-y-auto">
            {document?.content_preview ? (
              <Highlighted text={document.content_preview} mark={citation.quote} />
            ) : (
              <span className="evidence-mark">{citation.quote}</span>
            )}
          </div>
        </div>

        {/* The cited evidence, called out explicitly */}
        <div>
          <div className="text-2xs font-semibold uppercase tracking-[0.14em] text-ink-4 mb-2">
            Cited evidence
          </div>
          <blockquote className="border-l-2 border-cyan/50 pl-3 text-sm text-ink-1 italic leading-relaxed">
            “{citation.quote}”
          </blockquote>
          {citation.relevance && (
            <p className="text-xs text-ink-3 mt-2">
              <span className="text-ink-4">Supports:</span> {citation.relevance}
            </p>
          )}
        </div>

        {referencedBy && (
          <div className="pt-4 border-t border-line">
            <div className="text-2xs font-semibold uppercase tracking-[0.14em] text-ink-4 mb-2">
              Referenced by
            </div>
            <div className="flex items-start gap-2 text-sm text-ink-2">
              <Link2 className="w-4 h-4 text-ink-4 mt-0.5 shrink-0" />
              <span>{referencedBy}</span>
            </div>
          </div>
        )}

        {document && (
          <div className="flex flex-wrap gap-2 pt-1">
            {typeof document.entity_count === "number" && (
              <Badge tone="neutral">{document.entity_count} entities</Badge>
            )}
            {typeof document.event_count === "number" && (
              <Badge tone="neutral">{document.event_count} events</Badge>
            )}
          </div>
        )}
      </div>
    </Drawer>
  );
}
