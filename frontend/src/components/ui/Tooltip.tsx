"use client";

import React, { useState, useId } from "react";
import { cn } from "@/lib/utils";

/** Lightweight hover/focus tooltip. Positioned above the trigger.
 *  `className` styles the inline wrapper; `tipClassName` styles the bubble. */
export function Tooltip({
  content,
  children,
  side = "top",
  className,
  tipClassName,
}: {
  content: React.ReactNode;
  children: React.ReactNode;
  side?: "top" | "bottom";
  className?: string;
  tipClassName?: string;
}) {
  const [open, setOpen] = useState(false);
  const id = useId();

  return (
    <span
      className={cn("relative inline-flex", className)}
      onMouseEnter={() => setOpen(true)}
      onMouseLeave={() => setOpen(false)}
      onFocus={() => setOpen(true)}
      onBlur={() => setOpen(false)}
      aria-describedby={open ? id : undefined}
    >
      {children}
      {open && (
        <span
          role="tooltip"
          id={id}
          className={cn(
            "pointer-events-none absolute left-1/2 -translate-x-1/2 z-50 whitespace-nowrap",
            "rounded-md border border-line-strong bg-surface-4 px-2 py-1 text-2xs text-ink-1 shadow-lift animate-fade-in",
            side === "top" ? "bottom-full mb-1.5" : "top-full mt-1.5",
            tipClassName
          )}
        >
          {content}
        </span>
      )}
    </span>
  );
}
