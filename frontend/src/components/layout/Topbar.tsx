"use client";

import React, { useEffect, useState } from "react";
import { Bell, Menu, Search } from "lucide-react";
import { useRetrace } from "@/lib/store";
import { cn } from "@/lib/utils";
import { getApiBase } from "@/lib/api";

const STATUS_META = {
  checking: { label: "Checking…", dot: "#fbbf24", text: "text-amber" },
  online: { label: "Connected", dot: "#34d399", text: "text-emerald" },
  offline: { label: "Offline", dot: "#f87171", text: "text-rose" },
} as const;

function BackendStatus() {
  const { backendStatus, refreshHealth } = useRetrace();
  const meta = STATUS_META[backendStatus];
  return (
    <button
      onClick={() => refreshHealth()}
      title={
        backendStatus === "offline"
          ? `Can't reach the backend at ${getApiBase()} — click to retry`
          : `Backend ${meta.label.toLowerCase()} — click to re-check`
      }
      className="flex items-center gap-1.5 h-9 px-2.5 rounded-lg border border-line bg-surface-2 hover:border-line-strong transition-colors focus-ring"
      aria-label={`Backend ${meta.label}`}
    >
      <span
        className={cn(
          "w-2 h-2 rounded-full shrink-0",
          backendStatus === "checking" && "animate-pulse-soft"
        )}
        style={{ backgroundColor: meta.dot, boxShadow: `0 0 8px ${meta.dot}88` }}
      />
      <span className={cn("hidden sm:inline text-2xs font-medium", meta.text)}>
        {meta.label}
      </span>
    </button>
  );
}

export function Topbar({ onOpenMobileNav }: { onOpenMobileNav: () => void }) {
  const { setPaletteOpen } = useRetrace();
  // Resolve modifier key after mount to avoid SSR/client hydration mismatch.
  const [isMac, setIsMac] = useState(false);
  useEffect(() => {
    setIsMac(/Mac|iPhone|iPad/.test(navigator.platform));
  }, []);

  return (
    <header
      className={cn(
        "sticky top-0 z-40 h-[60px] flex items-center gap-3 px-4 sm:px-6",
        "bg-base-900/70 backdrop-blur-xl border-b border-line"
      )}
    >
      {/* Mobile menu */}
      <button
        onClick={onOpenMobileNav}
        className="md:hidden grid place-items-center w-9 h-9 rounded-lg text-ink-3 hover:text-ink-1 hover:bg-surface-2 transition-colors focus-ring"
        aria-label="Open navigation"
      >
        <Menu className="w-5 h-5" />
      </button>

      {/* Command palette trigger */}
      <button
        onClick={() => setPaletteOpen(true)}
        className={cn(
          "group flex items-center gap-2.5 h-9 px-3 rounded-lg w-full max-w-md",
          "bg-surface-2 border border-line text-ink-4 hover:border-line-strong hover:text-ink-3 transition-colors focus-ring"
        )}
        aria-label="Search knowledge"
      >
        <Search className="w-4 h-4 shrink-0" />
        <span className="text-sm">Search knowledge, decisions, people…</span>
        <kbd className="ml-auto hidden sm:inline-flex items-center gap-0.5 rounded-md border border-line-strong bg-surface-3 px-1.5 py-0.5 text-2xs font-mono text-ink-3">
          {isMac ? "⌘" : "Ctrl"} K
        </kbd>
      </button>

      <div className="ml-auto flex items-center gap-1.5">
        <BackendStatus />
        <button
          className="relative grid place-items-center w-9 h-9 rounded-lg text-ink-3 hover:text-ink-1 hover:bg-surface-2 transition-colors focus-ring"
          aria-label="Notifications"
        >
          <Bell className="w-[18px] h-[18px]" />
          <span className="absolute top-2 right-2.5 w-1.5 h-1.5 rounded-full bg-iris" />
        </button>
        <button
          className="grid place-items-center w-9 h-9 rounded-full bg-gradient-to-br from-iris to-cyan-deep text-white text-xs font-semibold focus-ring"
          aria-label="Profile"
          title="Profile"
        >
          AK
        </button>
      </div>
    </header>
  );
}
