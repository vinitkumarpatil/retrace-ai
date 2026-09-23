"use client";

import React from "react";
import { EvidenceCoverage as Coverage, EvidenceStrength } from "@/lib/types";
import { STRENGTH_META } from "@/lib/utils";
import { CoverageBar, Tooltip } from "@/components/ui";
import { Info } from "lucide-react";

const ORDER: EvidenceStrength[] = ["direct", "supporting", "missing", "conflicting"];

export function EvidenceCoverage({
  coverage,
  rationale,
}: {
  coverage: Coverage;
  rationale?: string;
}) {
  const counts: Record<EvidenceStrength, number> = {
    direct: coverage.direct,
    supporting: coverage.supporting,
    missing: coverage.missing,
    conflicting: coverage.conflicting,
  };

  return (
    <div className="surface-inset p-4">
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-1.5">
          <span className="text-xs font-semibold text-ink-2">Evidence coverage</span>
          <Tooltip
            content="How well the retrieved sources support this answer"
            side="top"
          >
            <Info className="w-3.5 h-3.5 text-ink-4" />
          </Tooltip>
        </div>
        <span className="text-sm font-semibold text-ink-1 tabular">{coverage.percent}%</span>
      </div>

      <CoverageBar percent={coverage.percent} />

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mt-4">
        {ORDER.map((kind) => {
          const meta = STRENGTH_META[kind];
          return (
            <Tooltip key={kind} content={meta.description} side="top" className="w-full">
              <div className="w-full flex items-center gap-2 rounded-lg bg-surface-3/60 border border-line px-2.5 py-2">
                <span
                  className="w-2 h-2 rounded-full shrink-0"
                  style={{ backgroundColor: meta.dot }}
                />
                <span className="min-w-0">
                  <span className="block text-sm font-semibold text-ink-1 tabular leading-none">
                    {counts[kind]}
                  </span>
                  <span className="block text-2xs text-ink-4 mt-1 leading-none truncate">
                    {meta.label.replace(" evidence", "").replace(" sources", "")}
                  </span>
                </span>
              </div>
            </Tooltip>
          );
        })}
      </div>

      {rationale && (
        <p className="text-xs text-ink-3 leading-relaxed mt-3 pt-3 border-t border-line">
          {rationale}
        </p>
      )}
    </div>
  );
}
