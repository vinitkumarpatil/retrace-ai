"use client";

import React from "react";
import { ArrowUpRight, GitFork } from "lucide-react";
import { Citation, TracedClaim } from "@/lib/types";
import { Dialog, Badge, Eyebrow } from "@/components/ui";
import { classifyCitation, STRENGTH_META } from "@/lib/utils";

const STRENGTH_TONE = {
  direct: "emerald",
  supporting: "cyan",
  missing: "amber",
  conflicting: "rose",
} as const;

export function ClaimTrace({
  open,
  onClose,
  claim,
  onOpenSource,
}: {
  open: boolean;
  onClose: () => void;
  claim: TracedClaim | null;
  onOpenSource: (c: Citation) => void;
}) {
  if (!claim) return null;

  return (
    <Dialog open={open} onClose={onClose}>
      <div className="p-5 sm:p-6">
        <Eyebrow icon={<GitFork className="w-3.5 h-3.5" />} tone="iris">
          Claim traceability
        </Eyebrow>

        <blockquote className="mt-3 text-base text-ink-1 leading-relaxed border-l-2 border-iris/60 pl-4">
          “{claim.text}”
        </blockquote>

        <div className="mt-5">
          <div className="text-2xs font-semibold uppercase tracking-[0.14em] text-ink-4 mb-2">
            Supported by {claim.citations.length} source
            {claim.citations.length === 1 ? "" : "s"}
          </div>

          <ul className="space-y-2">
            {claim.citations.map((c, i) => {
              const kind = classifyCitation(c);
              const meta = STRENGTH_META[kind];
              return (
                <li key={i}>
                  <button
                    onClick={() => onOpenSource(c)}
                    className="w-full text-left surface-inset hover:border-line-strong p-3 rounded-lg transition-colors focus-ring group"
                  >
                    <div className="flex items-center gap-2 mb-1.5">
                      <span
                        className="w-2 h-2 rounded-full shrink-0"
                        style={{ backgroundColor: meta.dot }}
                      />
                      <span className="text-sm font-medium text-ink-1 flex-1 truncate">
                        {c.document_title}
                      </span>
                      <Badge tone={STRENGTH_TONE[kind]}>
                        {meta.label.replace(" evidence", "").replace(" sources", "")}
                      </Badge>
                    </div>
                    <p className="text-xs text-ink-3 leading-relaxed line-clamp-2">
                      “{c.quote}”
                    </p>
                    <span className="inline-flex items-center gap-1 text-2xs text-iris-soft mt-1.5 opacity-0 group-hover:opacity-100 transition-opacity">
                      Open source <ArrowUpRight className="w-3 h-3" />
                    </span>
                  </button>
                </li>
              );
            })}
          </ul>
        </div>
      </div>
    </Dialog>
  );
}
