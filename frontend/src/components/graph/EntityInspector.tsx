"use client";

import React, { useMemo } from "react";
import { Link2, Sparkles } from "lucide-react";
import { EntityLink, EntityNode } from "@/lib/types";
import { Drawer, Eyebrow, Badge } from "@/components/ui";
import { entityMeta } from "@/lib/entityMeta";
import { deriveEntities } from "@/lib/utils";

export function EntityInspector({
  open,
  onClose,
  entityName,
  nodes,
  links,
  onSelect,
}: {
  open: boolean;
  onClose: () => void;
  entityName: string | null;
  nodes: EntityNode[];
  links: EntityLink[];
  onSelect?: (name: string) => void;
}) {
  const entity = useMemo(() => {
    if (!entityName) return null;
    return deriveEntities(nodes, links).find((e) => e.name === entityName) || null;
  }, [entityName, nodes, links]);

  const typeOfName = useMemo(() => {
    const map = new Map<string, string>();
    nodes.forEach((n) => map.set(n.name || n.id, n.type));
    return map;
  }, [nodes]);

  if (!entity) return null;
  const meta = entityMeta(entity.type);
  const Icon = meta.icon;

  return (
    <Drawer
      open={open}
      onClose={onClose}
      eyebrow={
        <Eyebrow icon={<Icon className="w-3.5 h-3.5" />} tone="iris">
          {meta.label}
        </Eyebrow>
      }
      title={entity.name}
      description={entity.role || undefined}
    >
      <div className="p-5 space-y-5">
        <div className="flex items-center gap-3">
          <span
            className="grid place-items-center w-11 h-11 rounded-xl border"
            style={{
              backgroundColor: `${meta.color}1a`,
              borderColor: `${meta.color}44`,
              color: meta.color,
            }}
          >
            <Icon className="w-5 h-5" />
          </span>
          <div>
            <div className="text-sm font-semibold text-ink-1">
              {entity.connections} connection{entity.connections === 1 ? "" : "s"}
            </div>
            <div className="text-2xs text-ink-4">in the knowledge graph</div>
          </div>
        </div>

        {entity.description && (
          <p className="text-sm text-ink-3 leading-relaxed">{entity.description}</p>
        )}

        {entity.relatedNames.length > 0 && (
          <div>
            <div className="flex items-center gap-1.5 text-2xs font-semibold uppercase tracking-[0.14em] text-ink-4 mb-2">
              <Link2 className="w-3 h-3" /> Connected to
            </div>
            <div className="flex flex-wrap gap-1.5">
              {entity.relatedNames.map((name) => {
                const t = typeOfName.get(name) || "concept";
                const m = entityMeta(t);
                return (
                  <button
                    key={name}
                    onClick={() => onSelect?.(name)}
                    className="inline-flex items-center gap-1.5 rounded-full border border-line hover:border-line-strong bg-surface-2 hover:bg-surface-3 px-2.5 py-1 text-2xs text-ink-2 transition-colors focus-ring"
                  >
                    <span
                      className="w-1.5 h-1.5 rounded-full"
                      style={{ backgroundColor: m.color }}
                    />
                    {name}
                  </button>
                );
              })}
            </div>
          </div>
        )}

        <div className="surface-inset p-3 flex items-start gap-2.5">
          <Sparkles className="w-4 h-4 text-iris shrink-0 mt-0.5" />
          <p className="text-xs text-ink-3 leading-relaxed">
            Ask Retrace how {entity.name} relates to a decision to reconstruct the full
            context around this entity.
          </p>
        </div>
      </div>
    </Drawer>
  );
}
