'use client';

import React, { useRef, useState, useEffect } from 'react';
import dynamic from 'next/dynamic';
import { Share2, ZoomIn, ZoomOut, Maximize2, RefreshCw } from 'lucide-react';
import { EntityNode, EntityLink } from '@/lib/types';

// Dynamically import ForceGraph2D with SSR disabled
const ForceGraph2D = dynamic(() => import('react-force-graph-2d'), {
  ssr: false,
  loading: () => (
    <div className="w-full h-80 flex items-center justify-center bg-[#FAF8F5] text-xs font-mono text-stone-400">
      INITIALIZING DRAFTING GRAPH CANVAS...
    </div>
  ),
});

interface RelationshipGraphProps {
  nodes: EntityNode[];
  links: EntityLink[];
}

export default function RelationshipGraph({ nodes, links }: RelationshipGraphProps) {
  const fgRef = useRef<any>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [dimensions, setDimensions] = useState({ width: 600, height: 400 });
  const [selectedNode, setSelectedNode] = useState<EntityNode | null>(null);

  // Resize observer
  useEffect(() => {
    if (!containerRef.current) return;
    const updateDimensions = () => {
      if (containerRef.current) {
        setDimensions({
          width: containerRef.current.clientWidth,
          height: Math.max(380, containerRef.current.clientHeight),
        });
      }
    };
    updateDimensions();
    window.addEventListener('resize', updateDimensions);
    return () => window.removeEventListener('resize', updateDimensions);
  }, []);

  const getNodeColor = (type: string) => {
    switch (type) {
      case 'person':
        return '#059669'; // Sage green
      case 'system':
        return '#1E293B'; // Blueprint navy
      case 'decision':
        return '#D97706'; // Muted ochre
      case 'team':
        return '#4F46E5'; // Indigo
      case 'concept':
        return '#78716C'; // Stone
      default:
        return '#0284C7'; // Sky
    }
  };

  const graphData = {
    nodes: nodes.map(n => ({
      id: n.name || n.id,
      name: n.name || n.id,
      type: n.type || 'concept',
      description: n.description || '',
      val: n.val || (n.type === 'decision' || n.type === 'system' ? 4 : 2),
      color: getNodeColor(n.type),
    })),
    links: links.map(l => ({
      source: typeof l.source === 'object' ? (l.source as any).id : l.source,
      target: typeof l.target === 'object' ? (l.target as any).id : l.target,
      relation: l.relation || 'relates_to',
      evidence: l.evidence || '',
    })),
  };

  const handleZoomIn = () => {
    if (fgRef.current) fgRef.current.zoom(fgRef.current.zoom() * 1.3, 400);
  };

  const handleZoomOut = () => {
    if (fgRef.current) fgRef.current.zoom(fgRef.current.zoom() * 0.7, 400);
  };

  const handleFit = () => {
    if (fgRef.current) fgRef.current.zoomToFit(400, 40);
  };

  if (!nodes || nodes.length === 0) {
    return (
      <div className="drafting-card rounded-md border border-[#E2DDD5] bg-white p-6 relative">
        <div className="p-8 text-center font-mono text-xs text-stone-400">
          NO ENTITY RELATIONSHIPS DETECTED IN THIS SCOPE
        </div>
      </div>
    );
  }

  return (
    <div className="drafting-card rounded-md border border-[#E2DDD5] bg-white p-5 relative corner-ticks shadow-xs flex flex-col">
      
      {/* Blueprint Header */}
      <div className="flex items-center justify-between pb-3 mb-3 border-b border-[#E2DDD5]">
        <div className="flex items-center space-x-2">
          <div className="p-1.5 bg-stone-100 rounded text-stone-700">
            <Share2 className="w-4 h-4 text-amber-600" />
          </div>
          <div>
            <h3 className="text-xs font-mono font-bold text-stone-900 uppercase tracking-wider">
              ENTITY TOPOLOGY & INFLUENCE GRAPH
            </h3>
            <p className="text-[11px] font-mono text-stone-500">
              FORCE-DIRECTED RELATIONAL MAPPING
            </p>
          </div>
        </div>

        {/* Legend */}
        <div className="hidden sm:flex items-center space-x-3 text-[11px] font-mono text-stone-600">
          <div className="flex items-center space-x-1">
            <span className="w-2.5 h-2.5 rounded-full bg-[#059669]"></span>
            <span>Person</span>
          </div>
          <div className="flex items-center space-x-1">
            <span className="w-2.5 h-2.5 rounded-full bg-[#1E293B]"></span>
            <span>System</span>
          </div>
          <div className="flex items-center space-x-1">
            <span className="w-2.5 h-2.5 rounded-full bg-[#D97706]"></span>
            <span>Decision</span>
          </div>
        </div>

        {/* Canvas Controls */}
        <div className="flex items-center space-x-1 bg-stone-100 p-0.5 rounded border border-stone-200">
          <button
            onClick={handleZoomIn}
            className="p-1 text-stone-600 hover:text-stone-900 rounded"
            title="Zoom In"
          >
            <ZoomIn className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={handleZoomOut}
            className="p-1 text-stone-600 hover:text-stone-900 rounded"
            title="Zoom Out"
          >
            <ZoomOut className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={handleFit}
            className="p-1 text-stone-600 hover:text-stone-900 rounded"
            title="Center Graph"
          >
            <Maximize2 className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Graph Visualizer Canvas Area */}
      <div
        ref={containerRef}
        className="w-full h-88 bg-[#FAF8F5] rounded border border-[#E2DDD5] overflow-hidden relative"
      >
        <ForceGraph2D
          ref={fgRef}
          width={dimensions.width}
          height={dimensions.height}
          graphData={graphData}
          nodeLabel={(node: any) => `${node.name} (${node.type})\n${node.description || ''}`}
          nodeColor={(node: any) => node.color}
          nodeRelSize={5}
          linkColor={() => '#CBD5E1'}
          linkDirectionalArrowLength={4}
          linkDirectionalArrowRelPos={1}
          linkCurvature={0.15}
          linkLabel={(link: any) => link.relation || ''}
          onNodeClick={(node: any) => setSelectedNode(node)}
          cooldownTicks={100}
          onEngineStop={() => handleFit()}
        />

        {/* Selected Node Details Popup */}
        {selectedNode && (
          <div className="absolute bottom-3 left-3 right-3 bg-white/95 backdrop-blur p-3 rounded border border-amber-300 shadow-md text-xs font-mono">
            <div className="flex items-center justify-between">
              <span className="font-bold text-stone-900">{selectedNode.name}</span>
              <span className="text-[10px] px-1.5 py-0.5 rounded bg-amber-100 text-amber-800 uppercase font-semibold">
                {selectedNode.type}
              </span>
            </div>
            {selectedNode.description && (
              <p className="text-stone-600 mt-1 font-sans text-xs">
                {selectedNode.description}
              </p>
            )}
          </div>
        )}
      </div>

    </div>
  );
}
