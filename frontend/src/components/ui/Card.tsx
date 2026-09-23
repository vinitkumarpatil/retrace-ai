"use client";

import React from "react";
import { cn } from "@/lib/utils";

interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  as?: React.ElementType;
  interactive?: boolean;
  accent?: boolean;
  raised?: boolean;
}

export function Card({
  as: Tag = "div",
  interactive = false,
  accent = false,
  raised = true,
  className,
  children,
  ...props
}: CardProps) {
  return (
    <Tag
      className={cn(
        raised ? "surface-raised" : "surface",
        interactive && "interactive cursor-pointer",
        accent && "card-accent",
        className
      )}
      {...props}
    >
      {children}
    </Tag>
  );
}

export function CardHeader({
  className,
  children,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn("flex items-center gap-3 px-5 py-4 border-b border-line", className)}
      {...props}
    >
      {children}
    </div>
  );
}

export function CardBody({
  className,
  children,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div className={cn("p-5", className)} {...props}>
      {children}
    </div>
  );
}

/** Small eyebrow label used above card titles (replaces forensic caps-mono). */
export function Eyebrow({
  icon,
  children,
  tone = "iris",
}: {
  icon?: React.ReactNode;
  children: React.ReactNode;
  tone?: "iris" | "cyan" | "emerald" | "amber" | "rose" | "muted";
}) {
  const tones: Record<string, string> = {
    iris: "text-iris",
    cyan: "text-cyan",
    emerald: "text-emerald",
    amber: "text-amber",
    rose: "text-rose",
    muted: "text-ink-3",
  };
  return (
    <span
      className={cn(
        "inline-flex items-center gap-2 text-2xs font-semibold uppercase tracking-[0.14em]",
        tones[tone]
      )}
    >
      {icon}
      {children}
    </span>
  );
}
