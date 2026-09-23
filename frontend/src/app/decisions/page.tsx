"use client";

import React, { useMemo } from "react";
import { GitBranch } from "lucide-react";
import Link from "next/link";
import { useRetrace } from "@/lib/store";
import { deriveDecisions } from "@/lib/utils";
import { DecisionCard } from "@/components/decisions/DecisionCard";
import { EmptyState } from "@/components/ui";
import { PageContainer, PageHeader } from "@/components/layout/PageHeader";

export default function DecisionsPage() {
  const { investigations, hydrated } = useRetrace();
  const decisions = useMemo(
    () => (hydrated ? deriveDecisions(investigations) : []),
    [investigations, hydrated]
  );

  return (
    <PageContainer>
      <PageHeader
        icon={<GitBranch className="w-5 h-5" />}
        title="Decisions"
        description="Key decisions Retrace has surfaced across your investigations — who decided, when, and the evidence behind them."
      />

      {!hydrated ? null : decisions.length === 0 ? (
        <div className="surface-raised">
          <EmptyState
            icon={<GitBranch className="w-6 h-6" />}
            title="No decisions surfaced yet"
            description="Decisions are extracted from your investigations. Run one to start building this view."
            action={
              <Link
                href="/investigate"
                className="inline-flex items-center justify-center h-10 px-5 rounded-lg text-sm font-medium bg-iris text-white hover:bg-iris-deep transition-colors focus-ring"
              >
                Start investigating
              </Link>
            }
          />
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 stagger">
          {decisions.map((d) => (
            <DecisionCard key={d.id} decision={d} />
          ))}
        </div>
      )}
    </PageContainer>
  );
}
