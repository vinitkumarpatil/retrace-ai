"use client";

import React, { Suspense, useEffect, useRef, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Search } from "lucide-react";
import { useRetrace } from "@/lib/store";
import { AskBox } from "@/components/investigation/AskBox";
import { InvestigationLoader } from "@/components/investigation/InvestigationLoader";
import { InvestigationCard } from "@/components/investigation/InvestigationCard";
import { ErrorState, EmptyState, Button } from "@/components/ui";
import { PageContainer, PageHeader } from "@/components/layout/PageHeader";

function InvestigateInner() {
  const router = useRouter();
  const params = useSearchParams();
  const { investigations, runInvestigation, hydrated, seedDemo, seeding, documents } =
    useRetrace();

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [question, setQuestion] = useState("");
  // null until the first SSE stage arrives → loader runs on its own timer
  // (also the graceful state if streaming is unavailable and we POST instead).
  const [stage, setStage] = useState<number | null>(null);
  const startedRef = useRef<string | null>(null);

  const runQuery = async (q: string) => {
    setLoading(true);
    setError(null);
    setQuestion(q);
    setStage(null);
    try {
      const id = await runInvestigation(q, (s) => setStage(s.index));
      router.replace(`/investigate/${id}`);
    } catch (e: any) {
      setError(
        e.message ||
          "Failed to reconstruct context. Please verify the backend is running."
      );
      setLoading(false);
    }
  };

  // Auto-run when navigated with ?q=
  useEffect(() => {
    const q = params.get("q");
    if (q && startedRef.current !== q) {
      startedRef.current = q;
      runQuery(q);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [params]);

  if (loading) {
    return (
      <PageContainer>
        <InvestigationLoader question={question} current={stage ?? undefined} />
      </PageContainer>
    );
  }

  return (
    <PageContainer>
      <PageHeader
        icon={<Search className="w-5 h-5" />}
        title="Investigate"
        description="Ask a question about your organization's past. Retrace retrieves the evidence, reconstructs the timeline, and shows you what's still missing."
      />

      <div className="max-w-3xl">
        <AskBox onAsk={runQuery} loading={loading} autoFocus />
      </div>

      {error && (
        <div className="max-w-2xl mt-6">
          <ErrorState message={error} onRetry={() => question && runQuery(question)} />
        </div>
      )}

      <div className="mt-12">
        <h2 className="text-lg font-semibold text-ink-1 mb-5">All investigations</h2>
        {!hydrated ? null : investigations.length === 0 ? (
          <div className="surface-raised">
            <EmptyState
              icon={<Search className="w-6 h-6" />}
              title="No investigations yet"
              description="Start with the question above, or load the demo dataset to explore how Retrace reconstructs context."
              action={
                documents.length === 0 ? (
                  <Button variant="primary" loading={seeding} onClick={() => seedDemo()}>
                    Load demo data
                  </Button>
                ) : undefined
              }
            />
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 stagger">
            {investigations.map((inv) => (
              <InvestigationCard key={inv.id} investigation={inv} />
            ))}
          </div>
        )}
      </div>
    </PageContainer>
  );
}

export default function InvestigatePage() {
  return (
    <Suspense fallback={null}>
      <InvestigateInner />
    </Suspense>
  );
}
