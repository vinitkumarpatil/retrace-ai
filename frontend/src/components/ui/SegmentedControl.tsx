"use client";

import React from "react";
import { cn } from "@/lib/utils";

export interface Segment<T extends string> {
  value: T;
  label?: string;
  icon?: React.ReactNode;
  ariaLabel?: string;
}

export function SegmentedControl<T extends string>({
  segments,
  value,
  onChange,
  size = "md",
  className,
}: {
  segments: Segment<T>[];
  value: T;
  onChange: (v: T) => void;
  size?: "sm" | "md";
  className?: string;
}) {
  return (
    <div
      className={cn(
        "inline-flex items-center gap-0.5 p-0.5 rounded-lg bg-surface-2 border border-line",
        className
      )}
      role="tablist"
    >
      {segments.map((s) => {
        const active = s.value === value;
        return (
          <button
            key={s.value}
            role="tab"
            aria-selected={active}
            aria-label={s.ariaLabel || s.label}
            onClick={() => onChange(s.value)}
            className={cn(
              "inline-flex items-center gap-1.5 rounded-md font-medium transition-colors focus-ring",
              size === "sm" ? "h-7 px-2.5 text-xs" : "h-8 px-3 text-xs",
              active
                ? "bg-surface-4 text-ink-1 shadow-[0_1px_0_0_rgba(255,255,255,0.05)_inset]"
                : "text-ink-3 hover:text-ink-1"
            )}
          >
            {s.icon}
            {s.label}
          </button>
        );
      })}
    </div>
  );
}
