"use client";

import React from "react";
import { Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

type Variant = "primary" | "secondary" | "ghost" | "subtle" | "danger";
type Size = "sm" | "md" | "lg";

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  size?: Size;
  loading?: boolean;
  icon?: React.ReactNode;
  iconRight?: React.ReactNode;
}

const VARIANTS: Record<Variant, string> = {
  primary:
    "bg-iris text-white hover:bg-iris-deep shadow-[0_8px_24px_-12px_rgba(139,92,246,0.9)] border border-transparent",
  secondary:
    "bg-surface-3 text-ink-1 hover:bg-surface-4 border border-line-strong",
  subtle:
    "bg-surface-2 text-ink-2 hover:text-ink-1 hover:bg-surface-3 border border-line",
  ghost:
    "bg-transparent text-ink-3 hover:text-ink-1 hover:bg-surface-2 border border-transparent",
  danger:
    "bg-rose/15 text-rose hover:bg-rose/25 border border-rose/30",
};

const SIZES: Record<Size, string> = {
  sm: "h-8 px-3 text-xs gap-1.5 rounded-lg",
  md: "h-10 px-4 text-sm gap-2 rounded-lg",
  lg: "h-12 px-5 text-sm gap-2 rounded-xl",
};

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      variant = "secondary",
      size = "md",
      loading = false,
      icon,
      iconRight,
      className,
      children,
      disabled,
      ...props
    },
    ref
  ) => {
    return (
      <button
        ref={ref}
        disabled={disabled || loading}
        className={cn(
          "inline-flex items-center justify-center font-medium whitespace-nowrap select-none",
          "transition-all duration-150 focus-ring",
          "disabled:opacity-50 disabled:pointer-events-none active:scale-[0.98]",
          VARIANTS[variant],
          SIZES[size],
          className
        )}
        {...props}
      >
        {loading ? (
          <Loader2 className="w-4 h-4 animate-spin" aria-hidden />
        ) : (
          icon
        )}
        {children}
        {iconRight}
      </button>
    );
  }
);
Button.displayName = "Button";
