'use client';

import React, { useRef, useState, useEffect } from 'react';
import dynamic from 'next/dynamic';
import { Network, ZoomIn, ZoomOut, Maximize2 } from 'lucide-react';
import { EntityNode, EntityLink } from '@/lib/types';

const ForceGraph2D = dynamic(() => import('react-force-graph-2d'), {
  ssr: false,
  loading: () => (
    <div className="w-full h-[420px] flex items-center justify-center text-xs font-mono text-console-mute">
      INITIALIZING GRAPH CANVAS…
    </div>
  ),
});

interface RelationshipGraphProps {
  nodes: EntityNode[];
  links: EntityLink[];
}

const NODE_COLORS: Record<string, string> = {
  person: '#34D399',   // emerald
  system: '#2DD4E8',   // cyan
  decision: '#FBBF24', // amber
  team: '#A78BFA',     // violet
  concept: '#9AA5B8',  // dim
  document: '#FB7185', // rose
  date: '#60A5FA',     // blue
};

export default function RelationshipGraph({ nodes, links }: RelationshipGraphProps) {
  const fgRef = useRef<any>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [dimensions, setDimensions] = useState({ width: 600, height: 420 });
  const [selectedNode, setSelectedNode] = useState<EntityNode | null>(null);

  useEffect(() => {
    if (!containerRef.current) return;
    const updateDimensions = () => {
      if (containerRef.current) {
        setDimensions({
          width: containerRef.current.clientWidth,
          height: Math.max(400, containerRef.current.clientHeight),
        });
      }
    };
    updateDimensions();
    window.addEventListener('resize', updateDimensions);
    return () => window.removeEventListener('resize', updateDimensions);
  }, []);

  const getNodeColor = (type: string) => NODE_COLORS[type] || '#2DD4E8';

  const graphData = {
    nodes: nodes.map(n => ({
      id: n.name || n.id,
      name: n.name || n.id,
      type: n.type || 'concept',
      description: n.description || '',
      val: n.val || (n.type === 'decision' || n.type === 'system' ? 5 : 3),
      color: getNodeColor(n.type),
    })),
    links: links.map(l => ({
      source: typeof l.source === 'object' ? (l.source as any).id : l.source,
      target: typeof l.target === 'object' ? (l.target as any).id : l.target,
      relation: l.relation || 'relates_to',
      evidence: l.evidence || '',
    })),
  };

  const handleZoomIn = () => fgRef.current?.zoom(fgRef.current.zoom() * 1.3, 400);
  const handleZoomOut = () => fgRef.current?.zoom(fgRef.current.zoom() * 0.7, 400);
  const handleFit = () => fgRef.current?.zoomToFit(400, 40);

  const drawNode = (node: any, ctx: CanvasRenderingContext2D, globalScale: number) => {
    const r = Math.max(3, (node.val || 3));
    // glow
    ctx.shadowColor = node.color;
    ctx.shadowBlur = 12;
    ctx.beginPath();
    ctx.arc(node.x, node.y, r, 0, 2 * Math.PI);
    ctx.fillStyle = node.color;
    ctx.fill();
    ctx.shadowBlur = 0;
    // ring
    ctx.beginPath();
    ctx.arc(node.x, node.y, r + 1.5, 0, 2 * Math.PI);
    ctx.strokeStyle = 'rgba(255,255,255,0.25)';
    ctx.lineWidth = 0.6;
    ctx.stroke();
    // label
    if (globalScale > 0.6) {
      const label = node.name;
      const fontSize = Math.max(3.5, 11 / globalScale);
      ctx.font = `${fontSize}px "JetBrains Mono", monospace`;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'top';
      ctx.fillStyle = '#9AA5B8';
      ctx.fillText(label, node.x, node.y + r + 2);
    }
  };

  if (!nodes || nodes.length === 0) {
    return (
      <div className="panel p-6">
        <div className="p-8 text-center font-mono text-xs text-console-mute">
          NO ENTITY RELATIONSHIPS DETECTED IN THIS SCOPE
        </div>
      </div>
    );
  }

  return (
    <div className="panel panel-hover animate-rise p-5 flex flex-col">

      {/* Header */}
      <div className="flex items-center justify-between pb-3 mb-3 border-b border-console-border">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-console-violet/10 border border-console-violet/20">
            <Network className="w-4 h-4 text-console-violet" />
          </div>
          <div>
            <h3 className="text-sm font-semibold text-white uppercase tracking-wider">
              Entity Graph
            </h3>
            <p className="text-[11px] font-mono text-console-mute">
              force-directed relationships
            </p>
          </div>
        </div>

        {/* Controls */}
        <div className="flex items-center gap-1 inset-tile p-0.5">
          <button onClick={handleZoomIn} className="p-1.5 text-console-dim hover:text-white rounded" title="Zoom in">
            <ZoomIn className="w-3.5 h-3.5" />
          </button>
          <button onClick={handleZoomOut} className="p-1.5 text-console-dim hover:text-white rounded" title="Zoom out">
            <ZoomOut className="w-3.5 h-3.5" />
          </button>
          <button onClick={handleFit} className="p-1.5 text-console-dim hover:text-white rounded" title="Fit">
            <Maximize2 className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Legend */}
      <div className="flex flex-wrap items-center gap-x-3 gap-y-1 mb-3 text-[11px] font-mono text-console-dim">
        {[['Person', NODE_COLORS.person], ['System', NODE_COLORS.system], ['Decision', NODE_COLORS.decision], ['Team', NODE_COLORS.team]].map(([label, color]) => (
          <span key={label} className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: color, boxShadow: `0 0 8px ${color}` }} />
            {label}
          </span>
        ))}
      </div>

      {/* Canvas */}
      <div
        ref={containerRef}
        className="w-full h-[420px] rounded-xl border border-console-border overflow-hidden relative bg-[#0B0F17]"
        style={{
          backgroundImage:
            'radial-gradient(circle at 50% 40%, rgba(45,212,232,0.06), transparent 70%), linear-gradient(rgba(148,163,184,0.05) 1px, transparent 1px), linear-gradient(90deg, rgba(148,163,184,0.05) 1px, transparent 1px)',
          backgroundSize: '100% 100%, 26px 26px, 26px 26px',
        }}
      >
        <ForceGraph2D
          ref={fgRef}
          width={dimensions.width}
          height={dimensions.height}
          graphData={graphData}
          backgroundColor="rgba(0,0,0,0)"
          nodeLabel={(node: any) => `${node.name} (${node.type})`}
          nodeCanvasObject={drawNode}
          nodePointerAreaPaint={(node: any, color: string, ctx: CanvasRenderingContext2D) => {
            ctx.beginPath();
            ctx.arc(node.x, node.y, (node.val || 3) + 3, 0, 2 * Math.PI);
            ctx.fillStyle = color;
            ctx.fill();
          }}
          linkColor={() => 'rgba(148,163,184,0.22)'}
          linkDirectionalArrowLength={3.5}
          linkDirectionalArrowRelPos={1}
          linkCurvature={0.12}
          linkLabel={(link: any) => link.relation || ''}
          onNodeClick={(node: any) => setSelectedNode(node)}
          onBackgroundClick={() => setSelectedNode(null)}
          cooldownTicks={100}
          onEngineStop={() => handleFit()}
        />

        {/* Selected node popup */}
        {selectedNode && (
          <div className="absolute bottom-3 left-3 right-3 bg-console-s1/95 backdrop-blur border border-console-cyan/30 rounded-xl p-3 text-xs">
            <div className="flex items-center justify-between gap-2">
              <span className="font-semibold text-white font-mono">{selectedNode.name}</span>
              <span className="text-[10px] px-1.5 py-0.5 rounded bg-console-cyan/10 text-console-cyan uppercase font-semibold border border-console-cyan/25">
                {selectedNode.type}
              </span>
            </div>
            {selectedNode.description && (
              <p className="text-console-dim mt-1">{selectedNode.description}</p>
            )}
          </div>
        )}
      </div>

    </div>
  );
}
