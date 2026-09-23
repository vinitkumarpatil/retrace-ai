"use client";

import React from "react";
import { Compass, HelpCircle } from "lucide-react";
import { MissingContextFlag } from "@/lib/types";
import { Eyebrow, Badge, Button } from "@/components/ui";
import { missingCategoryLabel } from "@/lib/utils";

export function KnowledgeGaps({
  gaps,
  onInvestigate,
}: {
  gaps: MissingContextFlag[];
  onInvestigate: (question: string) => void;
}) {
  if (!gaps || gaps.length === 0) return null;

  return (
    <section className="surface-raised overflow-hidden">
      <div className="px-5 py-4 border-b border-line flex items-center justify-between">
        <Eyebrow icon={<HelpCircle className="w-3.5 h-3.5" />} tone="amber">
          Knowledge gaps
        </Eyebrow>
        <span className="text-2xs text-ink-4">
          Retrace found {gaps.length} unanswered question{gaps.length === 1 ? "" : "s"}
        </span>
      </div>

      <ul className="divide-y divide-line stagger">
        {gaps.map((gap, i) => (
          <li key={i} className="px-5 py-4">
            <div className="flex items-start gap-4">
              <span className="text-lg font-mono text-amber/70 tabular leading-none mt-0.5 w-7 shrink-0">
                {String(i + 1).padStart(2, "0")}
              </span>
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2 flex-wrap mb-1">
                  <h4 className="text-sm font-medium text-ink-1">{gap.description}</h4>
                  <Badge tone="amber">{missingCategoryLabel(gap.category)}</Badge>
                </div>
                {gap.impact && (
                  <p className="text-xs text-ink-3 leading-relaxed">
                    <span className="text-ink-4">Impact: </span>
                    {gap.impact}
                  </p>
                )}
                {gap.suggested_investigation && (
                  <div className="flex items-center justify-between gap-3 mt-3">
                    <p className="text-xs text-ink-4 italic leading-relaxed">
                      {gap.suggested_investigation}
                    </p>
                    <Button
                      variant="subtle"
                      size="sm"
                      icon={<Compass className="w-3.5 h-3.5" />}
                      onClick={() => onInvestigate(gap.suggested_investigation)}
                      className="shrink-0"
                    >
                      Investigate
                    </Button>
                  </div>
                )}
              </div>
            </div>
          </li>
        ))}
      </ul>
    </section>
  );
}
