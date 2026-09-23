"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { PanelLeftClose, PanelLeftOpen, Plus, FileSearch } from "lucide-react";
import { cn } from "@/lib/utils";
import { useRetrace } from "@/lib/store";
import { Logo } from "./Logo";
import { PRIMARY_NAV, SETTINGS_NAV, isActive } from "./nav";

export function Sidebar({
  collapsed,
  onToggleCollapse,
  onNavigate,
}: {
  collapsed: boolean;
  onToggleCollapse: () => void;
  onNavigate?: () => void;
}) {
  const pathname = usePathname();
  const { investigations, hydrated } = useRetrace();
  const recent = hydrated ? investigations.slice(0, 5) : [];

  const NavLink = ({ item }: { item: (typeof PRIMARY_NAV)[number] }) => {
    const active = isActive(item, pathname);
    const Icon = item.icon;
    return (
      <Link
        href={item.href}
        onClick={onNavigate}
        aria-current={active ? "page" : undefined}
        title={collapsed ? item.label : undefined}
        className={cn(
          "group flex items-center gap-3 rounded-lg text-sm font-medium transition-colors focus-ring",
          collapsed ? "justify-center h-10 w-10 mx-auto" : "h-9 px-3",
          active
            ? "bg-surface-3 text-ink-1"
            : "text-ink-3 hover:text-ink-1 hover:bg-surface-2"
        )}
      >
        <Icon
          className={cn(
            "w-[18px] h-[18px] shrink-0 transition-colors",
            active ? "text-iris-soft" : "text-ink-4 group-hover:text-ink-2"
          )}
        />
        {!collapsed && <span>{item.label}</span>}
        {!collapsed && active && (
          <span className="ml-auto w-1.5 h-1.5 rounded-full bg-iris" />
        )}
      </Link>
    );
  };

  return (
    <aside
      className={cn(
        "flex flex-col h-full bg-base-800/80 backdrop-blur-xl border-r border-line",
        collapsed ? "w-[72px]" : "w-[248px]"
      )}
    >
      {/* Brand */}
      <div className={cn("h-[60px] flex items-center border-b border-line", collapsed ? "justify-center px-0" : "px-4")}>
        <Link href="/" onClick={onNavigate} className="focus-ring rounded-lg">
          <Logo collapsed={collapsed} />
        </Link>
      </div>

      {/* New investigation CTA */}
      <div className={cn("px-3 pt-4", collapsed && "px-0 flex justify-center")}>
        {collapsed ? (
          <Link
            href="/investigate"
            onClick={onNavigate}
            aria-label="New investigation"
            title="New investigation"
            className="grid place-items-center w-10 h-10 rounded-lg bg-iris text-white hover:bg-iris-deep transition-colors focus-ring"
          >
            <Plus className="w-[18px] h-[18px]" />
          </Link>
        ) : (
          <Link
            href="/investigate"
            onClick={onNavigate}
            className="flex items-center gap-2 h-9 px-3 rounded-lg bg-iris text-white text-sm font-medium hover:bg-iris-deep transition-colors focus-ring"
          >
            <Plus className="w-4 h-4" />
            New investigation
          </Link>
        )}
      </div>

      {/* Primary nav */}
      <nav className="px-3 pt-4 space-y-1" aria-label="Primary">
        {!collapsed && (
          <div className="px-3 pb-1 text-2xs font-semibold uppercase tracking-[0.14em] text-ink-4">
            Workspace
          </div>
        )}
        {PRIMARY_NAV.map((item) => (
          <NavLink key={item.href} item={item} />
        ))}
      </nav>

      {/* Recent investigations */}
      {!collapsed && (
        <div className="px-3 pt-6 flex-1 min-h-0 flex flex-col">
          <div className="px-3 pb-2 text-2xs font-semibold uppercase tracking-[0.14em] text-ink-4">
            Recent
          </div>
          <div className="flex-1 overflow-y-auto no-scrollbar space-y-0.5 -mx-1 px-1">
            {recent.length === 0 ? (
              <p className="px-3 py-2 text-xs text-ink-4 leading-relaxed">
                No investigations yet.
              </p>
            ) : (
              recent.map((inv) => (
                <Link
                  key={inv.id}
                  href={`/investigate/${inv.id}`}
                  onClick={onNavigate}
                  className={cn(
                    "flex items-start gap-2 rounded-lg px-3 py-2 text-xs transition-colors focus-ring",
                    pathname === `/investigate/${inv.id}`
                      ? "bg-surface-3 text-ink-1"
                      : "text-ink-3 hover:text-ink-1 hover:bg-surface-2"
                  )}
                >
                  <FileSearch className="w-3.5 h-3.5 mt-0.5 shrink-0 text-ink-4" />
                  <span className="line-clamp-2 leading-snug">{inv.question}</span>
                </Link>
              ))
            )}
          </div>
        </div>
      )}

      {/* Footer: settings + collapse */}
      <div className={cn("mt-auto border-t border-line p-3 space-y-1", collapsed && "px-0")}>
        <NavLink item={SETTINGS_NAV} />
        <button
          onClick={onToggleCollapse}
          className={cn(
            "hidden md:flex items-center gap-3 rounded-lg text-sm font-medium text-ink-4 hover:text-ink-1 hover:bg-surface-2 transition-colors focus-ring w-full",
            collapsed ? "justify-center h-10 w-10 mx-auto" : "h-9 px-3"
          )}
          aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
        >
          {collapsed ? (
            <PanelLeftOpen className="w-[18px] h-[18px]" />
          ) : (
            <>
              <PanelLeftClose className="w-[18px] h-[18px]" />
              <span>Collapse</span>
            </>
          )}
        </button>
      </div>
    </aside>
  );
}
