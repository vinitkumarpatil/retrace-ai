"use client";

import React from "react";
import { cn } from "@/lib/utils";

export function PageContainer({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={cn("max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8", className)}>
      {children}
    </div>
  );
}

export function PageHeader({
  title,
  description,
  actions,
  icon,
}: {
  title: string;
  description?: string;
  actions?: React.ReactNode;
  icon?: React.ReactNode;
}) {
  return (
    <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4 mb-6">
      <div className="flex items-start gap-3 min-w-0">
        {icon && (
          <span className="grid place-items-center w-10 h-10 rounded-xl bg-surface-2 border border-line text-iris-soft shrink-0">
            {icon}
          </span>
        )}
        <div className="min-w-0">
          <h1 className="text-xl sm:text-2xl font-semibold text-ink-1 tracking-tight">
            {title}
          </h1>
          {description && (
            <p className="text-sm text-ink-3 mt-1 leading-relaxed max-w-2xl">{description}</p>
          )}
        </div>
      </div>
      {actions && <div className="flex items-center gap-2 shrink-0">{actions}</div>}
    </div>
  );
}
