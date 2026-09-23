import {
  Boxes,
  CircleDot,
  FileText,
  GitBranch,
  Lightbulb,
  type LucideIcon,
  Server,
  Users,
  User,
} from "lucide-react";
import { EntityType } from "./types";

interface EntityMeta {
  label: string;
  color: string;
  icon: LucideIcon;
}

export const ENTITY_META: Record<EntityType, EntityMeta> = {
  person: { label: "Person", color: "#34d399", icon: User },
  team: { label: "Team", color: "#8b5cf6", icon: Users },
  system: { label: "System", color: "#22d3ee", icon: Server },
  decision: { label: "Decision", color: "#fbbf24", icon: GitBranch },
  document: { label: "Document", color: "#f87171", icon: FileText },
  concept: { label: "Concept", color: "#a78bfa", icon: Lightbulb },
  date: { label: "Date", color: "#60a5fa", icon: CircleDot },
};

export function entityMeta(type: string): EntityMeta {
  return (
    ENTITY_META[type as EntityType] || {
      label: type || "Entity",
      color: "#94a3b8",
      icon: Boxes,
    }
  );
}

export const SOURCE_TYPE_LABEL: Record<string, string> = {
  pdf: "PDF",
  image: "Image",
  text: "Note",
  url: "Web",
};

export function sourceTypeLabel(t: string): string {
  return SOURCE_TYPE_LABEL[t] || t?.toUpperCase() || "Doc";
}
