"use client";

import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import {
  ArrowRight,
  CornerDownLeft,
  FileText,
  FileSearch,
  Sparkles,
} from "lucide-react";
import { useRetrace } from "@/lib/store";
import { cn, deriveEntities } from "@/lib/utils";
import { entityMeta } from "@/lib/entityMeta";
import { PRIMARY_NAV } from "./nav";

type ResultKind = "ask" | "investigation" | "document" | "entity" | "nav";

interface Result {
  kind: ResultKind;
  id: string;
  title: string;
  subtitle?: string;
  icon: React.ReactNode;
  color?: string;
  action: () => void;
}

/** Subsequence fuzzy match: returns true if all chars of `q` appear in order. */
function fuzzy(q: string, text: string): boolean {
  if (!q) return true;
  const t = text.toLowerCase();
  let i = 0;
  for (const ch of q.toLowerCase()) {
    i = t.indexOf(ch, i);
    if (i === -1) return false;
    i += 1;
  }
  return true;
}

const SECTION_LABEL: Record<ResultKind, string> = {
  ask: "Ask Retrace",
  investigation: "Investigations",
  document: "Documents",
  entity: "People & entities",
  nav: "Navigate",
};

export function CommandPalette() {
  const router = useRouter();
  const {
    paletteOpen,
    setPaletteOpen,
    documents,
    investigations,
    graphNodes,
    graphLinks,
  } = useRetrace();

  const [query, setQuery] = useState("");
  const [active, setActive] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLDivElement>(null);

  const close = useCallback(() => {
    setPaletteOpen(false);
    setQuery("");
    setActive(0);
  }, [setPaletteOpen]);

  const go = useCallback(
    (href: string) => {
      close();
      router.push(href);
    },
    [close, router]
  );

  // Global Cmd/Ctrl+K
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setPaletteOpen(true);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [setPaletteOpen]);

  // Focus input on open, lock scroll
  useEffect(() => {
    if (!paletteOpen) return;
    const t = setTimeout(() => inputRef.current?.focus(), 20);
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      clearTimeout(t);
      document.body.style.overflow = prev;
    };
  }, [paletteOpen]);

  const entities = useMemo(
    () => deriveEntities(graphNodes, graphLinks).slice(0, 40),
    [graphNodes, graphLinks]
  );

  const results = useMemo<Result[]>(() => {
    const q = query.trim();
    const out: Result[] = [];

    if (q) {
      out.push({
        kind: "ask",
        id: "ask",
        title: `Ask Retrace: “${q}”`,
        subtitle: "Start a new investigation",
        icon: <Sparkles className="w-4 h-4" />,
        color: "#8b5cf6",
        action: () => go(`/investigate?q=${encodeURIComponent(q)}`),
      });
    }

    for (const inv of investigations) {
      if (fuzzy(q, inv.question)) {
        out.push({
          kind: "investigation",
          id: inv.id,
          title: inv.question,
          subtitle: `${inv.result.citations?.length || 0} sources`,
          icon: <FileSearch className="w-4 h-4" />,
          action: () => go(`/investigate/${inv.id}`),
        });
      }
    }

    for (const doc of documents) {
      if (fuzzy(q, doc.title)) {
        out.push({
          kind: "document",
          id: doc.id,
          title: doc.title,
          subtitle: doc.source_type?.toUpperCase(),
          icon: <FileText className="w-4 h-4" />,
          action: () => go(`/knowledge?doc=${encodeURIComponent(doc.id)}`),
        });
      }
    }

    for (const ent of entities) {
      if (fuzzy(q, ent.name)) {
        const meta = entityMeta(ent.type);
        out.push({
          kind: "entity",
          id: ent.id,
          title: ent.name,
          subtitle: `${meta.label} · ${ent.connections} links`,
          icon: <meta.icon className="w-4 h-4" />,
          color: meta.color,
          action: () => go(`/entities?e=${encodeURIComponent(ent.name)}`),
        });
      }
    }

    for (const item of PRIMARY_NAV) {
      if (fuzzy(q, item.label)) {
        out.push({
          kind: "nav",
          id: item.href,
          title: item.label,
          subtitle: "Go to page",
          icon: <item.icon className="w-4 h-4" />,
          action: () => go(item.href),
        });
      }
    }

    return out.slice(0, 40);
  }, [query, investigations, documents, entities, go]);

  // Clamp active index when results change
  useEffect(() => {
    setActive((a) => Math.min(a, Math.max(0, results.length - 1)));
  }, [results.length]);

  // Grouped for rendering, but keep a flat index map for keyboard nav
  const grouped = useMemo(() => {
    const order: ResultKind[] = ["ask", "investigation", "document", "entity", "nav"];
    let flat = 0;
    return order
      .map((kind) => {
        const items = results
          .filter((r) => r.kind === kind)
          .map((r) => ({ r, index: flat++ }));
        return { kind, items };
      })
      .filter((g) => g.items.length > 0);
  }, [results]);

  const onKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setActive((a) => Math.min(a + 1, results.length - 1));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setActive((a) => Math.max(a - 1, 0));
    } else if (e.key === "Enter") {
      e.preventDefault();
      results[active]?.action();
    } else if (e.key === "Escape") {
      e.preventDefault();
      close();
    }
  };

  // Keep active item scrolled into view
  useEffect(() => {
    const el = listRef.current?.querySelector<HTMLElement>(`[data-idx="${active}"]`);
    el?.scrollIntoView({ block: "nearest" });
  }, [active]);

  if (!paletteOpen) return null;

  return (
    <div className="fixed inset-0 z-[70] flex items-start justify-center p-4 pt-[12vh]">
      <div
        className="fixed inset-0 bg-black/60 backdrop-blur-sm animate-fade-in"
        onClick={close}
        aria-hidden
      />
      <div
        role="dialog"
        aria-modal="true"
        aria-label="Command palette"
        className="relative z-10 w-full max-w-xl surface-raised overflow-hidden animate-scale-in"
      >
        {/* Input */}
        <div className="flex items-center gap-3 px-4 h-14 border-b border-line">
          <Sparkles className="w-4 h-4 text-iris shrink-0" />
          <input
            ref={inputRef}
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={onKeyDown}
            placeholder="Search Retrace, or ask a question…"
            className="flex-1 bg-transparent text-sm text-ink-1 placeholder:text-ink-4 outline-none"
            aria-label="Search"
          />
          <kbd className="text-2xs font-mono text-ink-4 border border-line rounded px-1.5 py-0.5">
            ESC
          </kbd>
        </div>

        {/* Results */}
        <div ref={listRef} className="max-h-[52vh] overflow-y-auto py-2">
          {results.length === 0 ? (
            <div className="px-4 py-10 text-center text-sm text-ink-4">
              No matches. Press Enter to ask Retrace this question.
            </div>
          ) : (
            grouped.map((group) => (
              <div key={group.kind} className="px-2 pb-1">
                <div className="px-3 pt-2 pb-1 text-2xs font-semibold uppercase tracking-[0.14em] text-ink-4">
                  {SECTION_LABEL[group.kind]}
                </div>
                {group.items.map(({ r, index }) => (
                  <button
                    key={`${r.kind}-${r.id}`}
                    data-idx={index}
                    onMouseMove={() => setActive(index)}
                    onClick={r.action}
                    className={cn(
                      "w-full flex items-center gap-3 px-3 py-2 rounded-lg text-left transition-colors",
                      index === active ? "bg-surface-3" : "hover:bg-surface-2"
                    )}
                  >
                    <span
                      className="grid place-items-center w-8 h-8 rounded-lg bg-surface-2 border border-line shrink-0"
                      style={r.color ? { color: r.color } : { color: "#94a3b8" }}
                    >
                      {r.icon}
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="block text-sm text-ink-1 truncate">{r.title}</span>
                      {r.subtitle && (
                        <span className="block text-2xs text-ink-4 truncate">
                          {r.subtitle}
                        </span>
                      )}
                    </span>
                    {index === active && (
                      <CornerDownLeft className="w-3.5 h-3.5 text-ink-4 shrink-0" />
                    )}
                  </button>
                ))}
              </div>
            ))
          )}
        </div>

        {/* Footer hint */}
        <div className="flex items-center justify-between px-4 h-10 border-t border-line text-2xs text-ink-4">
          <span className="flex items-center gap-3">
            <span className="flex items-center gap-1">
              <kbd className="font-mono border border-line rounded px-1">↑</kbd>
              <kbd className="font-mono border border-line rounded px-1">↓</kbd>
              navigate
            </span>
            <span className="flex items-center gap-1">
              <kbd className="font-mono border border-line rounded px-1">↵</kbd>
              select
            </span>
          </span>
          <span className="flex items-center gap-1">
            Ask anything <ArrowRight className="w-3 h-3" />
          </span>
        </div>
      </div>
    </div>
  );
}
