"use client";

import React from "react";
import { useParams } from "next/navigation";
import { FileSearch } from "lucide-react";
import { useRetrace } from "@/lib/store";
import { InvestigationView } from "@/components/investigation/InvestigationView";
import { EmptyState, SkeletonCard } from "@/components/ui";
import { PageContainer } from "@/components/layout/PageHeader";
import Link from "next/link";

export default function InvestigationDetailPage() {
  const params = useParams<{ id: string }>();
  const { getInvestigation, hydrated } = useRetrace();
  const investigation = getInvestigation(params.id);

  if (!hydrated) {
    return (
      <PageContainer>
        <div className="space-y-6">
          <SkeletonCard />
          <div className="grid lg:grid-cols-12 gap-6">
            <div className="lg:col-span-7 space-y-6">
              <SkeletonCard />
              <SkeletonCard />
            </div>
            <div className="lg:col-span-5">
              <SkeletonCard />
            </div>
          </div>
        </div>
      </PageContainer>
    );
  }

  if (!investigation) {
    return (
      <PageContainer>
        <div className="surface-raised">
          <EmptyState
            icon={<FileSearch className="w-6 h-6" />}
            title="Investigation not found"
            description="This investigation isn't in your recent history — it may have been cleared. Start a new one to reconstruct the context again."
            action={
              <Link
                href="/investigate"
                className="inline-flex items-center justify-center h-10 px-5 rounded-lg text-sm font-medium bg-iris text-white hover:bg-iris-deep transition-colors focus-ring"
              >
                New investigation
              </Link>
            }
          />
        </div>
      </PageContainer>
    );
  }

  return <InvestigationView investigation={investigation} />;
}
