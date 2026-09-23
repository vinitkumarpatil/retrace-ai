"use client";

import React from "react";
import { AlertTriangle, RefreshCw } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "./Button";

export function EmptyState({
  icon,
  title,
  description,
  action,
  className,
}: {
  icon?: React.ReactNode;
  title: string;
  description?: React.ReactNode;
  action?: React.ReactNode;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center text-center px-6 py-14",
        className
      )}
    >
      {icon && (
        <div className="w-14 h-14 rounded-2xl grid place-items-center bg-surface-2 border border-line text-ink-3 mb-5">
          {icon}
        </div>
      )}
      <h3 className="text-base font-semibold text-ink-1">{title}</h3>
      {description && (
        <p className="text-sm text-ink-3 mt-2 max-w-sm leading-relaxed text-balance">
          {description}
        </p>
      )}
      {action && <div className="mt-6">{action}</div>}
    </div>
  );
}

export function ErrorState({
  message,
  onRetry,
  className,
}: {
  message: string;
  onRetry?: () => void;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "surface-raised border-rose/25 p-6 flex flex-col items-center text-center",
        className
      )}
      role="alert"
    >
      <div className="w-12 h-12 rounded-xl grid place-items-center bg-rose/12 border border-rose/25 text-rose mb-4">
        <AlertTriangle className="w-5 h-5" />
      </div>
      <h3 className="text-sm font-semibold text-ink-1">
        Something went wrong while retrieving context.
      </h3>
      <p className="text-sm text-ink-3 mt-1.5 max-w-md leading-relaxed">{message}</p>
      <p className="text-2xs text-ink-4 mt-3">Your documents are safe.</p>
      {onRetry && (
        <Button variant="secondary" size="sm" className="mt-5" icon={<RefreshCw className="w-3.5 h-3.5" />} onClick={onRetry}>
          Try again
        </Button>
      )}
    </div>
  );
}
