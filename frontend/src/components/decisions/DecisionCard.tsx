"use client";

import React from "react";
import Link from "next/link";
import { ArrowUpRight, GitBranch, Users } from "lucide-react";
import { DerivedDecision } from "@/lib/types";
import { Badge } from "@/components/ui";
import { formatEventDate } from "@/lib/utils";

export function DecisionCard({ decision }: { decision: DerivedDecision }) {
  return (
    <div className="surface-raised card-accent interactive p-5 flex flex-col h-full">
      <div className="flex items-center justify-between mb-3">
        <Badge tone="amber" icon={<GitBranch className="w-3 h-3" />}>
          Decision
        </Badge>
        <span className="text-2xs font-mono text-ink-4">{formatEventDate(decision.date)}</span>
      </div>

      <h3 className="text-[15px] font-semibold text-ink-1 leading-snug">{decision.title}</h3>
      <p className="text-sm text-ink-3 leading-relaxed mt-2 flex-1">{decision.decision}</p>

      {decision.evidence_quote && (
        <blockquote className="border-l-2 border-line-strong pl-3 mt-3 text-xs text-ink-3 italic leading-relaxed line-clamp-3">
          “{decision.evidence_quote}”
        </blockquote>
      )}

      <div className="flex items-center gap-3 mt-4 pt-3 border-t border-line">
        {decision.actors.length > 0 && (
          <span className="inline-flex items-center gap-1.5 text-2xs text-ink-4 min-w-0">
            <Users className="w-3 h-3 shrink-0" />
            <span className="truncate">{decision.actors.join(", ")}</span>
          </span>
        )}
        <Link
          href={`/investigate/${decision.investigationId}`}
          className="ml-auto inline-flex items-center gap-1 text-2xs text-iris-soft hover:text-iris transition-colors focus-ring rounded shrink-0"
        >
          View investigation <ArrowUpRight className="w-3 h-3" />
        </Link>
      </div>
    </div>
  );
}
