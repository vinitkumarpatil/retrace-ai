"use client";

import React, { useState } from "react";
import { Activity, Database, Settings as SettingsIcon, Trash2 } from "lucide-react";
import { checkHealth } from "@/lib/api";
import { useRetrace } from "@/lib/store";
import { Button, Badge } from "@/components/ui";
import { PageContainer, PageHeader } from "@/components/layout/PageHeader";

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

export default function SettingsPage() {
  const { investigations, clearInvestigations, seedDemo, seeding, hydrated } = useRetrace();
  const [health, setHealth] = useState<any>(null);
  const [checking, setChecking] = useState(false);
  const [healthError, setHealthError] = useState<string | null>(null);

  const runHealth = async () => {
    setChecking(true);
    setHealthError(null);
    try {
      setHealth(await checkHealth());
    } catch (e: any) {
      setHealthError(e.message || "Backend unreachable");
      setHealth(null);
    } finally {
      setChecking(false);
    }
  };

  return (
    <PageContainer className="max-w-3xl">
      <PageHeader
        icon={<SettingsIcon className="w-5 h-5" />}
        title="Settings"
        description="Connection, data, and workspace preferences."
      />

      <div className="space-y-4">
        {/* Backend connection */}
        <section className="surface-raised p-5">
          <div className="flex items-center gap-2 mb-1">
            <Activity className="w-4 h-4 text-cyan" />
            <h2 className="text-sm font-semibold text-ink-1">Backend connection</h2>
          </div>
          <p className="text-sm text-ink-3 mb-4">
            Retrace talks to the API at{" "}
            <code className="font-mono text-xs text-ink-2 bg-surface-2 px-1.5 py-0.5 rounded">
              {API_BASE}
            </code>
            . Set <code className="font-mono text-xs">NEXT_PUBLIC_API_URL</code> to change it.
          </p>

          <div className="flex items-center gap-3">
            <Button variant="secondary" size="sm" loading={checking} onClick={runHealth}>
              Check connection
            </Button>
            {health && (
              <Badge tone="emerald">
                {health.status || "healthy"}
              </Badge>
            )}
            {healthError && <Badge tone="rose">{healthError}</Badge>}
          </div>

          {health?.services && (
            <div className="grid sm:grid-cols-2 gap-3 mt-4">
              <div className="surface-inset p-3">
                <div className="text-2xs uppercase tracking-wide text-ink-4 mb-1">AI model</div>
                <div className="text-sm text-ink-2">
                  {health.services.gemini?.configured ? "Configured" : "Not configured"}
                </div>
              </div>
              <div className="surface-inset p-3">
                <div className="text-2xs uppercase tracking-wide text-ink-4 mb-1">Database</div>
                <div className="text-sm text-ink-2">
                  {health.services.database?.mode || "unknown"}
                </div>
              </div>
            </div>
          )}
        </section>

        {/* Demo data */}
        <section className="surface-raised p-5">
          <div className="flex items-center gap-2 mb-1">
            <Database className="w-4 h-4 text-iris" />
            <h2 className="text-sm font-semibold text-ink-1">Demo dataset</h2>
          </div>
          <p className="text-sm text-ink-3 mb-4">
            Seed the &ldquo;Project Meridian&rdquo; architecture-pivot scenario to explore
            Retrace with realistic records.
          </p>
          <Button variant="primary" size="sm" loading={seeding} onClick={() => seedDemo()}>
            Load demo data
          </Button>
        </section>

        {/* Local data */}
        <section className="surface-raised p-5">
          <div className="flex items-center gap-2 mb-1">
            <Trash2 className="w-4 h-4 text-rose" />
            <h2 className="text-sm font-semibold text-ink-1">Investigation history</h2>
          </div>
          <p className="text-sm text-ink-3 mb-4">
            Your investigations are stored locally in this browser
            {hydrated ? ` (${investigations.length} saved)` : ""}. Clearing them does not
            affect your documents or the backend.
          </p>
          <Button
            variant="danger"
            size="sm"
            icon={<Trash2 className="w-3.5 h-3.5" />}
            onClick={clearInvestigations}
            disabled={!hydrated || investigations.length === 0}
          >
            Clear investigation history
          </Button>
        </section>
      </div>
    </PageContainer>
  );
}
