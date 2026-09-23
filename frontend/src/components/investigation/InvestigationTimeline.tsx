"use client";

import React, { useMemo, useState } from "react";
import { CalendarClock, GitBranch, Quote, Users } from "lucide-react";
import { TimelineEvent } from "@/lib/types";
import { Eyebrow, Badge, EmptyState } from "@/components/ui";
import { cn, formatEventDate, sortEventsChrono } from "@/lib/utils";

export function InvestigationTimeline({ events }: { events: TimelineEvent[] }) {
  const sorted = useMemo(() => sortEventsChrono(events || []), [events]);
  const [selected, setSelected] = useState(0);

  if (!sorted.length) {
    return (
      <section className="surface-raised">
        <div className="px-5 py-4 border-b border-line">
          <Eyebrow icon={<CalendarClock className="w-3.5 h-3.5" />} tone="cyan">
            Timeline
          </Eyebrow>
        </div>
        <EmptyState
          icon={<CalendarClock className="w-6 h-6" />}
          title="No timeline reconstructed"
          description="No dated events were found in the sources for this question."
        />
      </section>
    );
  }

  const active = sorted[Math.min(selected, sorted.length - 1)];

  return (
    <section className="surface-raised overflow-hidden">
      <div className="px-5 py-4 border-b border-line flex items-center justify-between">
        <Eyebrow icon={<CalendarClock className="w-3.5 h-3.5" />} tone="cyan">
          Timeline
        </Eyebrow>
        <span className="text-2xs text-ink-4">{sorted.length} events</span>
      </div>

      {/* Horizontal rail */}
      <div className="relative px-5 pt-6 pb-2 overflow-x-auto no-scrollbar">
        <div className="relative flex items-start gap-8 min-w-min">
          {/* rail line */}
          <div className="absolute left-0 right-0 top-[7px] h-0.5 timeline-rail" />
          {sorted.map((ev, i) => {
            const isActive = i === selected;
            return (
              <button
                key={i}
                onClick={() => setSelected(i)}
                className="relative shrink-0 flex flex-col items-start gap-2 focus-ring rounded-lg pt-0 w-36 text-left"
                aria-pressed={isActive}
              >
                <span
                  className={cn(
                    "relative z-10 w-3.5 h-3.5 rounded-full border-2 transition-all",
                    isActive
                      ? "bg-cyan border-cyan shadow-glow-cyan scale-110"
                      : ev.decision
                      ? "bg-amber border-amber"
                      : "bg-surface-4 border-line-strong"
                  )}
                />
                <span
                  className={cn(
                    "text-2xs font-mono transition-colors",
                    isActive ? "text-cyan" : "text-ink-4"
                  )}
                >
                  {formatEventDate(ev.date)}
                </span>
                <span
                  className={cn(
                    "text-xs leading-snug line-clamp-2 transition-colors",
                    isActive ? "text-ink-1 font-medium" : "text-ink-3"
                  )}
                >
                  {ev.title}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Selected event detail */}
      <div key={selected} className="border-t border-line p-5 animate-fade-up">
        <div className="flex items-center gap-2 mb-2">
          <span className="text-2xs font-mono text-cyan">{formatEventDate(active.date)}</span>
          {active.decision && (
            <Badge tone="amber" icon={<GitBranch className="w-3 h-3" />}>
              Decision
            </Badge>
          )}
        </div>
        <h4 className="text-base font-semibold text-ink-1">{active.title}</h4>
        {active.description && (
          <p className="text-sm text-ink-3 leading-relaxed mt-1.5">{active.description}</p>
        )}

        {active.decision && (
          <div className="surface-inset p-3 mt-3 text-sm text-ink-2">
            <span className="text-amber font-medium">Decision: </span>
            {active.decision}
          </div>
        )}

        <div className="grid sm:grid-cols-2 gap-3 mt-4">
          {active.actors?.length > 0 && (
            <div>
              <div className="flex items-center gap-1.5 text-2xs font-semibold uppercase tracking-[0.14em] text-ink-4 mb-1.5">
                <Users className="w-3 h-3" /> People
              </div>
              <div className="flex flex-wrap gap-1.5">
                {active.actors.map((a) => (
                  <Badge key={a} tone="emerald">
                    {a}
                  </Badge>
                ))}
              </div>
            </div>
          )}
          {active.document_title && (
            <div>
              <div className="flex items-center gap-1.5 text-2xs font-semibold uppercase tracking-[0.14em] text-ink-4 mb-1.5">
                <Quote className="w-3 h-3" /> Source
              </div>
              <p className="text-xs text-ink-3">{active.document_title}</p>
            </div>
          )}
        </div>

        {active.evidence_quote && (
          <blockquote className="border-l-2 border-line-strong pl-3 mt-4 text-sm text-ink-2 italic leading-relaxed">
            “{active.evidence_quote}”
          </blockquote>
        )}
      </div>
    </section>
  );
}
