"use client";

import React from "react";
import { Sparkles } from "lucide-react";
import { EvidenceCoverage as Coverage, ReconstructionResult, TracedClaim } from "@/lib/types";
import { Eyebrow } from "@/components/ui";
import { EvidenceCoverage } from "./EvidenceCoverage";
import { cn } from "@/lib/utils";

export function AnswerPanel({
  result,
  claims,
  coverage,
  onSelectClaim,
}: {
  result: ReconstructionResult;
  claims: TracedClaim[];
  coverage: Coverage;
  onSelectClaim: (claim: TracedClaim) => void;
}) {
  return (
    <section className="surface-raised card-accent overflow-hidden animate-fade-up">
      {/* Ambient AI glow strip */}
      <div className="pointer-events-none h-px bg-gradient-to-r from-iris/60 via-cyan/40 to-transparent" />

      <div className="p-5 sm:p-6">
        <div className="flex items-center justify-between mb-4">
          <Eyebrow icon={<Sparkles className="w-3.5 h-3.5" />} tone="iris">
            Reconstructed answer
          </Eyebrow>
          <span className="text-2xs text-ink-4">
            {coverage.totalSources} supporting source{coverage.totalSources === 1 ? "" : "s"}
          </span>
        </div>

        {/* The answer, with traceable claims */}
        <div className="text-[15px] sm:text-base text-ink-1 leading-[1.75] text-balance">
          {claims.map((claim, i) => {
            const traceable = claim.citations.length > 0;
            return (
              <React.Fragment key={i}>
                {traceable ? (
                  <button
                    className={cn("claim text-left", "focus-ring")}
                    onClick={() => onSelectClaim(claim)}
                    title={`${claim.citations.length} supporting source${
                      claim.citations.length === 1 ? "" : "s"
                    } — click to trace`}
                  >
                    {claim.text}
                  </button>
                ) : (
                  <span>{claim.text}</span>
                )}{" "}
              </React.Fragment>
            );
          })}
        </div>

        {result.reasoning_summary && (
          <p className="text-sm text-ink-3 leading-relaxed mt-4">
            {result.reasoning_summary}
          </p>
        )}

        <div className="mt-5">
          <EvidenceCoverage coverage={coverage} rationale={result.confidence_rationale} />
        </div>

        <p className="text-2xs text-ink-4 mt-3">
          Highlighted statements are traceable — click any to see the sources behind it.
        </p>
      </div>
    </section>
  );
}
