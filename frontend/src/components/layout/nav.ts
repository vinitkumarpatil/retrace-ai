import {
  Boxes,
  GitBranch,
  LayoutGrid,
  Library,
  type LucideIcon,
  Network,
  Search,
  Settings,
} from "lucide-react";

export interface NavItem {
  label: string;
  href: string;
  icon: LucideIcon;
  /** Match sub-routes too (e.g. /investigate/[id]). */
  match?: (path: string) => boolean;
}

export const PRIMARY_NAV: NavItem[] = [
  { label: "Overview", href: "/", icon: LayoutGrid, match: (p) => p === "/" },
  {
    label: "Investigate",
    href: "/investigate",
    icon: Search,
    match: (p) => p.startsWith("/investigate"),
  },
  {
    label: "Knowledge",
    href: "/knowledge",
    icon: Library,
    match: (p) => p.startsWith("/knowledge"),
  },
  {
    label: "Decisions",
    href: "/decisions",
    icon: GitBranch,
    match: (p) => p.startsWith("/decisions"),
  },
  {
    label: "Entities",
    href: "/entities",
    icon: Boxes,
    match: (p) => p.startsWith("/entities"),
  },
  {
    label: "Graph",
    href: "/graph",
    icon: Network,
    match: (p) => p.startsWith("/graph"),
  },
];

export const SETTINGS_NAV: NavItem = {
  label: "Settings",
  href: "/settings",
  icon: Settings,
  match: (p) => p.startsWith("/settings"),
};

export function isActive(item: NavItem, path: string): boolean {
  return item.match ? item.match(path) : path === item.href;
}
