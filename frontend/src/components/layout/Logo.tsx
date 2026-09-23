"use client";

import React from "react";
import { cn } from "@/lib/utils";

/** Retrace mark — three converging traces resolving into a point (context
 *  being reconstructed back to its source). Pure SVG, no external asset. */
export function LogoMark({ className }: { className?: string }) {
  return (
    <span
      className={cn(
        "relative grid place-items-center rounded-xl w-9 h-9 shrink-0",
        "bg-gradient-to-br from-iris to-cyan-deep glow-iris",
        className
      )}
      aria-hidden
    >
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
        <path
          d="M4 5c6 0 8 3 8 7s2 7 8 7"
          stroke="white"
          strokeWidth="1.8"
          strokeLinecap="round"
          opacity="0.95"
        />
        <path
          d="M4 12c5 0 8 0 8 0"
          stroke="white"
          strokeWidth="1.8"
          strokeLinecap="round"
          opacity="0.55"
        />
        <path
          d="M4 19c6 0 8-3 8-7"
          stroke="white"
          strokeWidth="1.8"
          strokeLinecap="round"
          opacity="0.35"
        />
        <circle cx="20" cy="19" r="2" fill="white" />
      </svg>
    </span>
  );
}

export function Logo({ collapsed = false }: { collapsed?: boolean }) {
  return (
    <div className="flex items-center gap-2.5">
      <LogoMark />
      {!collapsed && (
        <div className="leading-none">
          <div className="text-[15px] font-semibold tracking-tight text-ink-1">
            Retrace
          </div>
          <div className="text-2xs text-ink-4 mt-0.5">Intelligence Workspace</div>
        </div>
      )}
    </div>
  );
}
