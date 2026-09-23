"use client";

import React from "react";
import { cn } from "@/lib/utils";

type Tone = "iris" | "cyan" | "emerald" | "amber" | "rose" | "neutral";

const TONES: Record<Tone, string> = {
  iris: "bg-iris/12 text-iris-soft border-iris/25",
  cyan: "bg-cyan/12 text-cyan border-cyan/25",
  emerald: "bg-emerald/12 text-emerald border-emerald/25",
  amber: "bg-amber/12 text-amber border-amber/25",
  rose: "bg-rose/12 text-rose border-rose/25",
  neutral: "bg-surface-3 text-ink-3 border-line-strong",
};

export function Badge({
  tone = "neutral",
  className,
  children,
  icon,
  mono = false,
}: {
  tone?: Tone;
  className?: string;
  children: React.ReactNode;
  icon?: React.ReactNode;
  mono?: boolean;
}) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 rounded-md border px-2 py-0.5 text-2xs font-medium",
        mono && "font-mono",
        TONES[tone],
        className
      )}
    >
      {icon}
      {children}
    </span>
  );
}

/** A tiny colored dot (entity/status legend). */
export function Dot({ color, className }: { color: string; className?: string }) {
  return (
    <span
      className={cn("inline-block w-2 h-2 rounded-full shrink-0", className)}
      style={{ backgroundColor: color, boxShadow: `0 0 8px ${color}66` }}
    />
  );
}
