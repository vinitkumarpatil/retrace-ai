"use client";

import React, { useEffect, useState } from "react";
import { Check, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

// Mirrors backend PIPELINE_STAGES so streamed stage indices line up 1:1.
const STAGES = [
  "Retrieving relevant context",
  "Analyzing supporting evidence",
  "Connecting entities & relationships",
  "Reconstructing the timeline",
  "Synthesizing the answer",
];

/**
 * Staged investigation animation shown while the real /api/query(/stream)
 * request is in flight.
 *
 * - When `current` is provided, the component is CONTROLLED: it reflects the
 *   actual backend stage streamed over SSE (honest progress).
 * - Otherwise it advances on a gentle timer up to the final stage, which stays
 *   "in progress" until the parent unmounts this on the real response — we
 *   never claim a completion the backend hasn't reported.
 */
export function InvestigationLoader({
  question,
  current,
}: {
  question?: string;
  current?: number;
}) {
  const controlled = typeof current === "number";
  const [autoStep, setAutoStep] = useState(0);
  const step = controlled ? Math.min(current as number, STAGES.length - 1) : autoStep;

  useEffect(() => {
    if (controlled) return;
    if (autoStep >= STAGES.length - 1) return;
    const t = setTimeout(() => setAutoStep((s) => Math.min(s + 1, STAGES.length - 1)), 700);
    return () => clearTimeout(t);
  }, [autoStep, controlled]);

  return (
    <div className="surface-raised p-6 sm:p-8 max-w-2xl mx-auto animate-fade-up">
      <div className="flex items-center gap-3 mb-6">
        <span className="relative grid place-items-center w-10 h-10 rounded-xl bg-iris/12 border border-iris/25 text-iris">
          <span className="absolute inset-0 rounded-xl bg-iris/20 animate-ping" />
          <Loader2 className="w-5 h-5 animate-spin relative" />
        </span>
        <div className="min-w-0">
          <h2 className="text-base font-semibold text-ink-1">Investigating…</h2>
          {question && (
            <p className="text-sm text-ink-3 truncate">{question}</p>
          )}
        </div>
      </div>

      <ol className="space-y-1">
        {STAGES.map((label, i) => {
          const done = i < step;
          const activeStage = i === step;
          return (
            <li
              key={label}
              className={cn(
                "flex items-center gap-3 rounded-lg px-3 py-2 transition-colors",
                activeStage && "bg-surface-2"
              )}
            >
              <span
                className={cn(
                  "grid place-items-center w-5 h-5 rounded-full border shrink-0 transition-colors",
                  done && "bg-emerald/15 border-emerald/40 text-emerald",
                  activeStage && "border-iris/50 text-iris",
                  !done && !activeStage && "border-line text-transparent"
                )}
              >
                {done ? (
                  <Check className="w-3 h-3" />
                ) : activeStage ? (
                  <Loader2 className="w-3 h-3 animate-spin" />
                ) : (
                  <span className="w-1.5 h-1.5 rounded-full bg-line-strong" />
                )}
              </span>
              <span
                className={cn(
                  "text-sm transition-colors",
                  done && "text-ink-2",
                  activeStage && "text-ink-1 font-medium",
                  !done && !activeStage && "text-ink-4"
                )}
              >
                {label}
              </span>
            </li>
          );
        })}
      </ol>
    </div>
  );
}
