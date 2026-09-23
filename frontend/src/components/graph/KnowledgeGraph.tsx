"use client";

import React, { useEffect, useMemo, useRef, useState } from "react";
import dynamic from "next/dynamic";
import { Maximize2, Search, ZoomIn, ZoomOut } from "lucide-react";
import { EntityLink, EntityNode, EntityType } from "@/lib/types";
import { ENTITY_META, entityMeta } from "@/lib/entityMeta";
import { cn } from "@/lib/utils";

const ForceGraph2D = dynamic(() => import("react-force-graph-2d"), {
  ssr: false,
  loading: () => (
    <div className="w-full h-full min-h-[360px] flex items-center justify-center text-sm text-ink-4">
      Preparing graph…
    </div>
  ),
});

interface Props {
  nodes: EntityNode[];
  links: EntityLink[];
  height?: number;
  onSelectEntity?: (name: string) => void;
  className?: string;
}

const linkEnd = (v: any): string =>
  typeof v === "object" && v !== null ? v.id ?? v.name : v;

export function KnowledgeGraph({
  nodes,
  links,
  height = 460,
  onSelectEntity,
  className,
}: Props) {
  const fgRef = useRef<any>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [dim, setDim] = useState({ width: 640, height });
  const [hover, setHover] = useState<string | null>(null);
  const [selected, setSelected] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [disabled, setDisabled] = useState<Set<EntityType>>(new Set());

  useEffect(() => {
    if (!containerRef.current) return;
    const update = () => {
      if (containerRef.current) {
        setDim({
          width: containerRef.current.clientWidth,
          height: containerRef.current.clientHeight || height,
        });
      }
    };
    update();
    const ro = new ResizeObserver(update);
    ro.observe(containerRef.current);
    return () => ro.disconnect();
  }, [height]);

  // Present entity types (for the legend/filters)
  const presentTypes = useMemo(() => {
    const s = new Set<EntityType>();
    nodes.forEach((n) => s.add((n.type as EntityType) || "concept"));
    return Array.from(s);
  }, [nodes]);

  // Adjacency for highlight
  const adjacency = useMemo(() => {
    const map = new Map<string, Set<string>>();
    links.forEach((l) => {
      const s = linkEnd(l.source);
      const t = linkEnd(l.target);
      if (!map.has(s)) map.set(s, new Set());
      if (!map.has(t)) map.set(t, new Set());
      map.get(s)!.add(t);
      map.get(t)!.add(s);
    });
    return map;
  }, [links]);

  const graphData = useMemo(() => {
    const q = search.trim().toLowerCase();
    const visible = nodes.filter((n) => !disabled.has((n.type as EntityType) || "concept"));
    const visibleNames = new Set(visible.map((n) => n.name || n.id));
    return {
      nodes: visible.map((n) => ({
        id: n.name || n.id,
        name: n.name || n.id,
        type: n.type || "concept",
        description: n.description || "",
        role: (n as any).role || "",
        val: n.val || (n.type === "decision" || n.type === "system" ? 6 : 3.5),
        color: entityMeta(n.type).color,
        dim: q ? !(n.name || n.id).toLowerCase().includes(q) : false,
      })),
      links: links
        .filter(
          (l) => visibleNames.has(linkEnd(l.source)) && visibleNames.has(linkEnd(l.target))
        )
        .map((l) => ({
          source: linkEnd(l.source),
          target: linkEnd(l.target),
          relation: l.relation || "related",
        })),
    };
  }, [nodes, links, disabled, search]);

  const focusName = hover || selected;
  const neighbors = focusName ? adjacency.get(focusName) : undefined;

  const drawNode = (node: any, ctx: CanvasRenderingContext2D, scale: number) => {
    const r = Math.max(3, node.val);
    const isFocus = node.id === focusName;
    const isNeighbor = neighbors?.has(node.id);
    const faded = (focusName && !isFocus && !isNeighbor) || node.dim;

    ctx.globalAlpha = faded ? 0.22 : 1;

    if (isFocus) {
      ctx.shadowColor = node.color;
      ctx.shadowBlur = 16;
    }
    ctx.beginPath();
    ctx.arc(node.x, node.y, r, 0, 2 * Math.PI);
    ctx.fillStyle = node.color;
    ctx.fill();
    ctx.shadowBlur = 0;

    // selection ring
    if (node.id === selected) {
      ctx.beginPath();
      ctx.arc(node.x, node.y, r + 2.5, 0, 2 * Math.PI);
      ctx.strokeStyle = "#ffffff";
      ctx.lineWidth = 1.2;
      ctx.stroke();
    }

    if (scale > 0.5 && !faded) {
      const label = node.name;
      const fontSize = Math.max(3.5, 10 / scale);
      ctx.font = `${fontSize}px Inter, sans-serif`;
      ctx.textAlign = "center";
      ctx.textBaseline = "top";
      ctx.fillStyle = "#94a3b8";
      ctx.fillText(label, node.x, node.y + r + 2);
    }
    ctx.globalAlpha = 1;
  };

  const handleClick = (node: any) => {
    setSelected(node.id);
    onSelectEntity?.(node.id);
  };

  const toggleType = (t: EntityType) =>
    setDisabled((prev) => {
      const next = new Set(prev);
      if (next.has(t)) next.delete(t);
      else next.add(t);
      return next;
    });

  if (!nodes.length) {
    return (
      <div className={cn("surface-inset grid place-items-center", className)} style={{ height }}>
        <p className="text-sm text-ink-4">No entity relationships detected in this scope.</p>
      </div>
    );
  }

  return (
    <div className={cn("flex flex-col", className)}>
      {/* Controls */}
      <div className="flex items-center gap-2 flex-wrap mb-3">
        <div className="relative flex-1 min-w-[160px]">
          <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-ink-4" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Find an entity…"
            className="w-full h-8 pl-8 pr-3 rounded-lg bg-surface-2 border border-line text-xs text-ink-1 placeholder:text-ink-4 outline-none focus-ring"
          />
        </div>
        <div className="flex items-center gap-0.5 p-0.5 rounded-lg bg-surface-2 border border-line">
          <button
            onClick={() => fgRef.current?.zoom(fgRef.current.zoom() * 1.3, 400)}
            className="p-1.5 rounded-md text-ink-3 hover:text-ink-1 hover:bg-surface-3 focus-ring"
            aria-label="Zoom in"
          >
            <ZoomIn className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={() => fgRef.current?.zoom(fgRef.current.zoom() * 0.7, 400)}
            className="p-1.5 rounded-md text-ink-3 hover:text-ink-1 hover:bg-surface-3 focus-ring"
            aria-label="Zoom out"
          >
            <ZoomOut className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={() => fgRef.current?.zoomToFit(400, 48)}
            className="p-1.5 rounded-md text-ink-3 hover:text-ink-1 hover:bg-surface-3 focus-ring"
            aria-label="Fit to view"
          >
            <Maximize2 className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Legend / filters */}
      <div className="flex flex-wrap items-center gap-1.5 mb-3">
        {presentTypes.map((t) => {
          const meta = ENTITY_META[t] || entityMeta(t);
          const off = disabled.has(t);
          return (
            <button
              key={t}
              onClick={() => toggleType(t)}
              className={cn(
                "inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-2xs transition-colors focus-ring",
                off
                  ? "border-line text-ink-4 line-through opacity-60"
                  : "border-line-strong text-ink-2 hover:bg-surface-2"
              )}
            >
              <span
                className="w-2 h-2 rounded-full"
                style={{ backgroundColor: meta.color }}
              />
              {meta.label}
            </button>
          );
        })}
      </div>

      {/* Canvas */}
      <div
        ref={containerRef}
        className="relative w-full rounded-xl border border-line overflow-hidden bg-[#0a0c11]"
        style={{ height }}
      >
        <ForceGraph2D
          ref={fgRef}
          width={dim.width}
          height={dim.height}
          graphData={graphData}
          backgroundColor="rgba(0,0,0,0)"
          nodeCanvasObject={drawNode}
          nodePointerAreaPaint={(node: any, color: string, ctx: CanvasRenderingContext2D) => {
            ctx.beginPath();
            ctx.arc(node.x, node.y, (node.val || 3) + 3, 0, 2 * Math.PI);
            ctx.fillStyle = color;
            ctx.fill();
          }}
          nodeLabel={(n: any) => `${n.name} · ${entityMeta(n.type).label}`}
          linkColor={(l: any) => {
            if (!focusName) return "rgba(148,163,184,0.18)";
            const s = linkEnd(l.source);
            const t = linkEnd(l.target);
            return s === focusName || t === focusName
              ? "rgba(139,92,246,0.6)"
              : "rgba(148,163,184,0.08)";
          }}
          linkDirectionalArrowLength={3}
          linkDirectionalArrowRelPos={1}
          linkCurvature={0.1}
          onNodeHover={(n: any) => setHover(n ? n.id : null)}
          onNodeClick={handleClick}
          onBackgroundClick={() => setSelected(null)}
          cooldownTicks={90}
          onEngineStop={() => fgRef.current?.zoomToFit(400, 48)}
        />
      </div>
    </div>
  );
}
