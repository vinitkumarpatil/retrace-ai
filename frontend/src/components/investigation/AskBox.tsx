"use client";

import React, { useRef, useState } from "react";
import { ArrowRight, Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";

const EXAMPLES = [
  "Why did we migrate from MongoDB to PostgreSQL?",
  "What caused the vector index lockout on August 12?",
  "Who approved scaling the RDS instance, and why?",
];

export function AskBox({
  onAsk,
  loading = false,
  autoFocus = false,
  showExamples = true,
  size = "lg",
  placeholder = "Ask anything about your organization's history…",
}: {
  onAsk: (question: string) => void;
  loading?: boolean;
  autoFocus?: boolean;
  showExamples?: boolean;
  size?: "md" | "lg";
  placeholder?: string;
}) {
  const [value, setValue] = useState("");
  const ref = useRef<HTMLTextAreaElement>(null);

  const submit = () => {
    const q = value.trim();
    if (!q || loading) return;
    onAsk(q);
  };

  const onKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      submit();
    }
  };

  return (
    <div className="w-full">
      <div
        className={cn(
          "group relative surface-raised card-accent transition-shadow",
          "focus-within:border-iris/60 focus-within:shadow-glow-iris"
        )}
      >
        {/* subtle top glow bar */}
        <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-iris/50 to-transparent" />

        <div className={cn("flex items-start gap-3", size === "lg" ? "p-5" : "p-4")}>
          <span className="mt-1 grid place-items-center w-8 h-8 rounded-lg bg-iris/12 border border-iris/25 text-iris shrink-0">
            <Sparkles className="w-4 h-4" />
          </span>
          <textarea
            ref={ref}
            autoFocus={autoFocus}
            value={value}
            rows={size === "lg" ? 2 : 1}
            onChange={(e) => setValue(e.target.value)}
            onKeyDown={onKeyDown}
            placeholder={placeholder}
            className={cn(
              "flex-1 resize-none bg-transparent outline-none text-ink-1 placeholder:text-ink-4 leading-relaxed pt-1",
              size === "lg" ? "text-lg" : "text-base"
            )}
            aria-label="Ask Retrace a question"
          />
        </div>

        <div className="flex items-center justify-between gap-3 px-5 pb-4">
          <span className="text-2xs text-ink-4 hidden sm:block">
            Press <kbd className="font-mono border border-line rounded px-1">Enter</kbd> to
            investigate · <kbd className="font-mono border border-line rounded px-1">Shift+Enter</kbd> for a new line
          </span>
          <button
            onClick={submit}
            disabled={!value.trim() || loading}
            className={cn(
              "ml-auto inline-flex items-center gap-2 h-10 px-5 rounded-lg text-sm font-medium transition-all focus-ring active:scale-[0.98]",
              "bg-iris text-white hover:bg-iris-deep disabled:opacity-40 disabled:pointer-events-none",
              "shadow-[0_10px_30px_-14px_rgba(139,92,246,0.95)]"
            )}
          >
            {loading ? "Investigating…" : "Ask Retrace"}
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      {showExamples && (
        <div className="mt-3 flex flex-wrap gap-2">
          {EXAMPLES.map((ex) => (
            <button
              key={ex}
              onClick={() => {
                setValue(ex);
                ref.current?.focus();
              }}
              className="text-xs text-ink-3 hover:text-ink-1 bg-surface-2 hover:bg-surface-3 border border-line hover:border-line-strong rounded-full px-3 py-1.5 transition-colors focus-ring"
            >
              {ex}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
