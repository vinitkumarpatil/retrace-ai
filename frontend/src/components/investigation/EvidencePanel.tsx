"use client";

import React from "react";
import { ArrowUpRight, Quote, ShieldCheck } from "lucide-react";
import { Citation } from "@/lib/types";
import { classifyCitation, STRENGTH_META } from "@/lib/utils";
import { Badge, Eyebrow, EmptyState } from "@/components/ui";
import { sourceTypeLabel } from "@/lib/entityMeta";

const STRENGTH_TONE = {
  direct: "emerald",
  supporting: "cyan",
  missing: "amber",
  conflicting: "rose",
} as const;

export function EvidencePanel({
  citations,
  onOpenSource,
}: {
  citations: Citation[];
  onOpenSource: (c: Citation) => void;
}) {
  return (
    <section className="surface-raised overflow-hidden">
      <div className="flex items-center justify-between px-5 py-4 border-b border-line">
        <Eyebrow icon={<ShieldCheck className="w-3.5 h-3.5" />} tone="emerald">
          Evidence
        </Eyebrow>
        <span className="text-2xs text-ink-4">
          {citations.length} source{citations.length === 1 ? "" : "s"} supporting this conclusion
        </span>
      </div>

      {citations.length === 0 ? (
        <EmptyState
          icon={<Quote className="w-6 h-6" />}
          title="No direct evidence retrieved"
          description="Retrace couldn't tie this answer to specific sources. Try ingesting more documents or rephrasing the question."
        />
      ) : (
        <ul className="divide-y divide-line stagger">
          {citations.map((c, i) => {
            const kind = classifyCitation(c);
            const meta = STRENGTH_META[kind];
            return (
              <li key={i}>
                <button
                  onClick={() => onOpenSource(c)}
                  className="w-full text-left px-5 py-4 hover:bg-surface-2 transition-colors focus-ring group"
                >
                  <div className="flex items-center gap-2 mb-2">
                    <span
                      className="w-2 h-2 rounded-full shrink-0"
                      style={{ backgroundColor: meta.dot }}
                    />
                    <span className="text-sm font-medium text-ink-1 truncate flex-1">
                      {c.document_title}
                    </span>
                    <Badge tone={STRENGTH_TONE[kind]}>{meta.label.replace(" evidence", "").replace(" sources", "")}</Badge>
                  </div>

                  <blockquote className="text-sm text-ink-2 leading-relaxed border-l-2 border-line-strong pl-3 italic">
                    “{c.quote}”
                  </blockquote>

                  <div className="flex items-center justify-between gap-3 mt-2.5">
                    <span className="text-2xs text-ink-4 truncate">
                      {c.relevance ? `Supports: ${c.relevance}` : sourceTypeLabel(c.source_type)}
                    </span>
                    <span className="inline-flex items-center gap-1 text-2xs text-iris-soft opacity-0 group-hover:opacity-100 transition-opacity shrink-0">
                      Open source <ArrowUpRight className="w-3 h-3" />
                    </span>
                  </div>
                </button>
              </li>
            );
          })}
        </ul>
      )}
    </section>
  );
}
