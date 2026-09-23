"use client";

import React, { useEffect, useState } from "react";
import { cn } from "@/lib/utils";

/** Animated evidence-coverage bar. Fills on mount for a premium reveal. */
export function CoverageBar({
  percent,
  className,
  showLabel = false,
}: {
  percent: number;
  className?: string;
  showLabel?: boolean;
}) {
  const [w, setW] = useState(0);
  useEffect(() => {
    const t = requestAnimationFrame(() => setW(percent));
    return () => cancelAnimationFrame(t);
  }, [percent]);

  return (
    <div className={cn("flex items-center gap-3", className)}>
      <div
        className="coverage-track flex-1"
        role="progressbar"
        aria-valuenow={percent}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-label="Evidence coverage"
      >
        <div className="coverage-fill" style={{ width: `${w}%` }} />
      </div>
      {showLabel && (
        <span className="text-sm font-semibold text-ink-1 tabular w-11 text-right">
          {percent}%
        </span>
      )}
    </div>
  );
}
