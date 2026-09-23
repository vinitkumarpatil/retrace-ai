"use client";

import React, { useMemo } from "react";
import Link from "next/link";
import { ArrowUpRight, Boxes, Clock, FileText } from "lucide-react";
import { Investigation } from "@/lib/types";
import { cn, computeCoverage, countSummary, timeAgo } from "@/lib/utils";

/** Pick a short topic label from the strongest system/decision entity. */
function topicOf(inv: Investigation): string | null {
  const nodes = inv.result.graph?.nodes || [];
  const pick =
    nodes.find((n) => n.type === "system") ||
    nodes.find((n) => n.type === "decision") ||
    nodes[0];
  return pick?.name || null;
}

export function InvestigationCard({ investigation }: { investigation: Investigation }) {
  const coverage = useMemo(() => computeCoverage(investigation.result), [investigation]);
  const counts = useMemo(() => countSummary(investigation.result), [investigation]);
  const topic = topicOf(investigation);

  return (
    <Link
      href={`/investigate/${investigation.id}`}
      className={cn(
        "group block p-5 h-full surface-raised interactive card-accent cursor-pointer focus-ring"
      )}
    >
      <div className="flex items-center justify-between mb-3">
        {topic ? (
          <span className="text-2xs font-medium text-iris-soft bg-iris/10 border border-iris/20 rounded-md px-2 py-0.5 truncate max-w-[70%]">
            {topic}
          </span>
        ) : (
          <span />
        )}
        <ArrowUpRight className="w-4 h-4 text-ink-4 group-hover:text-ink-1 transition-colors" />
      </div>

      <h3 className="text-[15px] font-medium text-ink-1 leading-snug line-clamp-2 min-h-[2.6em]">
        {investigation.question}
      </h3>

      {/* Coverage */}
      <div className="mt-4">
        <div className="flex items-center justify-between text-2xs text-ink-4 mb-1.5">
          <span>Evidence coverage</span>
          <span className="text-ink-2 font-semibold tabular">{coverage.percent}%</span>
        </div>
        <div className="coverage-track">
          <div className="coverage-fill" style={{ width: `${coverage.percent}%` }} />
        </div>
      </div>

      <div className="flex items-center gap-4 mt-4 text-2xs text-ink-4">
        <span className="inline-flex items-center gap-1">
          <FileText className="w-3 h-3" /> {counts.sources} sources
        </span>
        <span className="inline-flex items-center gap-1">
          <Boxes className="w-3 h-3" /> {counts.entities} entities
        </span>
        <span className="inline-flex items-center gap-1 ml-auto">
          <Clock className="w-3 h-3" /> {timeAgo(investigation.createdAt)}
        </span>
      </div>
    </Link>
  );
}
