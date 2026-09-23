"use client";

import React from "react";
import { Link2 } from "lucide-react";
import { DerivedEntity } from "@/lib/types";
import { entityMeta } from "@/lib/entityMeta";

export function EntityCard({
  entity,
  onClick,
}: {
  entity: DerivedEntity;
  onClick?: () => void;
}) {
  const meta = entityMeta(entity.type);
  const Icon = meta.icon;

  return (
    <button
      onClick={onClick}
      className="text-left surface-raised interactive card-accent p-4 flex flex-col h-full focus-ring"
    >
      <div className="flex items-center gap-3">
        <span
          className="grid place-items-center w-10 h-10 rounded-xl border shrink-0"
          style={{
            backgroundColor: `${meta.color}1a`,
            borderColor: `${meta.color}40`,
            color: meta.color,
          }}
        >
          <Icon className="w-5 h-5" />
        </span>
        <div className="min-w-0">
          <div className="text-sm font-medium text-ink-1 truncate">{entity.name}</div>
          <div className="text-2xs text-ink-4">{entity.role || meta.label}</div>
        </div>
      </div>

      {entity.description && (
        <p className="text-xs text-ink-4 leading-relaxed line-clamp-2 mt-3">
          {entity.description}
        </p>
      )}

      <div className="flex items-center gap-1.5 mt-3 pt-3 border-t border-line text-2xs text-ink-4">
        <Link2 className="w-3 h-3" />
        {entity.connections} connection{entity.connections === 1 ? "" : "s"}
      </div>
    </button>
  );
}
