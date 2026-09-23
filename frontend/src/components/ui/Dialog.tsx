"use client";

import React, { useEffect, useRef } from "react";
import { X } from "lucide-react";
import { cn } from "@/lib/utils";

function useDismiss(open: boolean, onClose: () => void) {
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", onKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = prev;
    };
  }, [open, onClose]);
}

interface BaseProps {
  open: boolean;
  onClose: () => void;
  title?: React.ReactNode;
  description?: React.ReactNode;
  children: React.ReactNode;
  className?: string;
}

/** Centered modal dialog. */
export function Dialog({ open, onClose, title, description, children, className }: BaseProps) {
  useDismiss(open, onClose);
  const ref = useRef<HTMLDivElement>(null);
  if (!open) return null;
  return (
    <div
      className="fixed inset-0 z-[60] flex items-start justify-center p-4 sm:p-6 overflow-y-auto"
      role="dialog"
      aria-modal="true"
    >
      <div
        className="fixed inset-0 bg-black/65 backdrop-blur-sm animate-fade-in"
        onClick={onClose}
        aria-hidden
      />
      <div
        ref={ref}
        className={cn(
          "relative z-10 w-full max-w-lg my-8 surface-raised animate-scale-in",
          className
        )}
      >
        {(title || description) && (
          <div className="flex items-start justify-between gap-4 px-5 py-4 border-b border-line">
            <div>
              {title && <h2 className="text-base font-semibold text-ink-1">{title}</h2>}
              {description && <p className="text-sm text-ink-3 mt-0.5">{description}</p>}
            </div>
            <button
              onClick={onClose}
              aria-label="Close"
              className="text-ink-4 hover:text-ink-1 p-1 rounded-md hover:bg-surface-3 transition-colors focus-ring"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        )}
        {children}
      </div>
    </div>
  );
}

/** Right-side slide-over drawer — used for source & entity inspectors. */
export function Drawer({
  open,
  onClose,
  title,
  description,
  children,
  className,
  eyebrow,
}: BaseProps & { eyebrow?: React.ReactNode }) {
  useDismiss(open, onClose);
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-[60]" role="dialog" aria-modal="true">
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm animate-fade-in"
        onClick={onClose}
        aria-hidden
      />
      <div
        className={cn(
          "absolute right-0 top-0 h-full w-full max-w-md bg-surface-1 border-l border-line",
          "shadow-[0_0_60px_-12px_rgba(0,0,0,0.9)] animate-slide-in-right flex flex-col",
          className
        )}
      >
        <div className="flex items-start justify-between gap-4 px-5 py-4 border-b border-line shrink-0">
          <div className="min-w-0">
            {eyebrow}
            {title && (
              <h2 className="text-base font-semibold text-ink-1 mt-1 truncate">{title}</h2>
            )}
            {description && <p className="text-sm text-ink-3 mt-0.5">{description}</p>}
          </div>
          <button
            onClick={onClose}
            aria-label="Close"
            className="text-ink-4 hover:text-ink-1 p-1 rounded-md hover:bg-surface-3 transition-colors focus-ring shrink-0"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
        <div className="flex-1 overflow-y-auto">{children}</div>
      </div>
    </div>
  );
}
