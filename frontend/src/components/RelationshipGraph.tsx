'use client';

import React, { useRef, useState, useEffect } from 'react';
import dynamic from 'next/dynamic';
import { 
  Share2, 
  ZoomIn, 
  ZoomOut, 
  Maximize2, 
  Minimize2, 
  X, 
  Filter, 
  Layers, 
  Info, 
  ChevronRight,
  Sparkles
} from 'lucide-react';
import { EntityNode, EntityLink } from '@/lib/types';

// Dynamically import ForceGraph2D with SSR disabled
const ForceGraph2D = dynamic(() => import('react-force-graph-2d'), {
  ssr: false,
  loading: () => (
    <div className="w-full h-80 flex items-center justify-center bg-slate-50 dark:bg-[#090D16] text-xs text-slate-400">
      Initializing Graph Canvas...
    </div>
  ),
});

interface RelationshipGraphProps {
  nodes: EntityNode[];
  links: EntityLink[];
  selectedEntityId?: string | null;
  onSelectEntity?: (entity: EntityNode | null) => void;
}

const ENTITY_TYPES = ['all', 'person', 'system', 'decision', 'team', 'concept'] as const;

export default function RelationshipGraph({
  nodes,
  links,
  selectedEntityId,
  onSelectEntity,
}: RelationshipGraphProps) {
  const fgRef = useRef<any>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [dimensions, setDimensions] = useState({ width: 600, height: 440 });
  const [selectedType, setSelectedType] = useState<string>('all');
  const [isFullscreen, setIsFullscreen] = useState(false);

  // Responsive dimension sync
  useEffect(() => {
    if (!containerRef.current) return;
    const updateDimensions = () => {
      if (containerRef.current) {
        setDimensions({
          width: containerRef.current.clientWidth,
          height: isFullscreen ? window.innerHeight - 150 : Math.max(420, containerRef.current.clientHeight),
        });
      }
    };
    updateDimensions();

    const observer = new ResizeObserver(() => updateDimensions());
    observer.observe(containerRef.current);

    return () => observer.disconnect();
  }, [isFullscreen]);

  const getNodeColor = (type: string, isSelected: boolean) => {
    if (isSelected) return '#4F46E5'; // Indigo brand for selected
    switch (type.toLowerCase()) {
      case 'person':
        return '#059669'; // Emerald
      case 'system':
        return '#0284C7'; // Sky
      case 'decision':
        return '#D97706'; // Amber
      case 'team':
        return '#7C3AED'; // Violet
      case 'concept':
        return '#64748B'; // Slate
      default:
        return '#0284C7';
    }
  };

  // Filter nodes based on active type filter
  const filteredNodes = nodes.filter(n => {
    if (selectedType === 'all') return true;
    return (n.type || 'concept').toLowerCase() === selectedType;
  });

  const activeNodeIds = new Set(filteredNodes.map(n => n.name || n.id));

  const filteredLinks = links.filter(l => {
    const sId = typeof l.source === 'object' ? (l.source as any).id : l.source;
    const tId = typeof l.target === 'object' ? (l.target as any).id : l.target;
    return activeNodeIds.has(sId) && activeNodeIds.has(tId);
  });

  const graphData = {
    nodes: filteredNodes.map(n => {
      const id = n.name || n.id;
      const isSelected = selectedEntityId === id || selectedEntityId === n.name;
      return {
        id,
        name: n.name || n.id,
        type: n.type || 'concept',
        description: n.description || '',
        val: isSelected ? 8 : (n.val || (n.type === 'decision' || n.type === 'system' ? 4 : 2)),
        color: getNodeColor(n.type, isSelected),
        rawNode: n,
      };
    }),
    links: filteredLinks.map(l => ({
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
    if (fgRef.current) fgRef.current.zoomToFit(400, 50);
  };

  const handleNodeClick = (node: any) => {
    if (selectedEntityId === node.id) {
      onSelectEntity?.(null);
    } else {
      onSelectEntity?.(node.rawNode || node);
    }
  };

  const activeSelected = nodes.find(n => (n.name || n.id) === selectedEntityId);

  // Find connected links for the selected node
  const connectedRelations = activeSelected ? links.filter(l => {
    const sId = typeof l.source === 'object' ? (l.source as any).id : l.source;
    const tId = typeof l.target === 'object' ? (l.target as any).id : l.target;
    const myId = activeSelected.name || activeSelected.id;
    return sId === myId || tId === myId;
  }) : [];

  if (!nodes || nodes.length === 0) {
    return (
      <div className="surface-card rounded-xl border border-slate-200 dark:border-slate-800 p-8 text-center text-xs text-slate-500">
        No entity relationships detected in this inquiry scope.
      </div>
    );
  }

  return (
    <div className={`surface-card rounded-xl border border-slate-200 dark:border-slate-800 p-5 shadow-sm flex flex-col transition-all ${
      isFullscreen ? 'fixed inset-4 z-50 shadow-floating overflow-hidden' : ''
    }`}>
      
      {/* Header Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 pb-3 mb-3 border-b border-slate-100 dark:border-slate-800">
        <div className="flex items-center space-x-2.5">
          <div className="p-2 bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 rounded-lg">
            <Share2 className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-sm font-semibold text-slate-900 dark:text-white tracking-tight">
              Entity Topology & Influence Graph
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Click nodes to cross-reference across timeline and citations
            </p>
          </div>
        </div>

        {/* Zoom & Canvas Controls */}
        <div className="flex items-center space-x-1.5">
          <div className="flex items-center bg-slate-100 dark:bg-slate-800 p-0.5 rounded-lg border border-slate-200 dark:border-slate-700">
            <button
              onClick={handleZoomIn}
              className="p-1.5 text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white rounded"
              title="Zoom In"
            >
              <ZoomIn className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={handleZoomOut}
              className="p-1.5 text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white rounded"
              title="Zoom Out"
            >
              <ZoomOut className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={handleFit}
              className="px-2 py-1 text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white rounded text-xs font-medium"
              title="Fit to Center"
            >
              Fit
            </button>
          </div>

          <button
            onClick={() => setIsFullscreen(!isFullscreen)}
            className="p-1.5 text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white bg-slate-100 dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 transition-colors"
            title={isFullscreen ? "Exit Fullscreen" : "Fullscreen View"}
          >
            {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
          </button>
        </div>
      </div>

      {/* Filter Chips Bar */}
      <div className="flex flex-wrap items-center justify-between gap-2 mb-3 pb-2.5 border-b border-slate-100 dark:border-slate-800/80 text-xs">
        <div className="flex items-center space-x-1 overflow-x-auto py-0.5">
          <Filter className="w-3 h-3 text-slate-400 mr-1 shrink-0" />
          {ENTITY_TYPES.map(type => (
            <button
              key={type}
              onClick={() => setSelectedType(type)}
              className={`px-2.5 py-0.5 rounded-full capitalize text-[11px] font-medium transition-colors ${
                selectedType === type
                  ? 'bg-indigo-600 text-white shadow-2xs'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700'
              }`}
            >
              {type}
            </button>
          ))}
        </div>

        {selectedEntityId && (
          <button
            onClick={() => onSelectEntity?.(null)}
            className="flex items-center space-x-1 text-xs text-indigo-600 dark:text-indigo-400 font-medium hover:underline"
          >
            <span>Reset filter</span>
            <X className="w-3 h-3" />
          </button>
        )}
      </div>

      {/* Graph Visualizer Canvas Area */}
      <div
        ref={containerRef}
        className={`w-full bg-slate-50 dark:bg-[#0B0F19] rounded-xl border border-slate-200 dark:border-slate-800 overflow-hidden relative transition-all ${
          isFullscreen ? 'flex-1 min-h-[500px]' : 'h-96'
        }`}
      >
        <ForceGraph2D
          ref={fgRef}
          width={dimensions.width}
          height={dimensions.height}
          graphData={graphData}
          nodeLabel={(node: any) => `${node.name} (${node.type})\n${node.description || ''}`}
          nodeColor={(node: any) => node.color}
          nodeRelSize={6}
          linkColor={() => '#94A3B8'}
          linkDirectionalArrowLength={4}
          linkDirectionalArrowRelPos={1}
          linkCurvature={0.12}
          linkLabel={(link: any) => link.relation || ''}
          onNodeClick={handleNodeClick}
          cooldownTicks={120}
          onEngineStop={() => handleFit()}
        />

        {/* Selected Node Details Drawer */}
        {activeSelected && (
          <div className="absolute bottom-3 left-3 right-3 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md p-4 rounded-xl border border-indigo-200 dark:border-indigo-800 shadow-floating text-xs z-20 transition-all">
            <div className="flex items-center justify-between gap-2">
              <div className="flex items-center space-x-2">
                <span className="w-2.5 h-2.5 rounded-full bg-indigo-600 animate-pulse"></span>
                <span className="font-semibold text-slate-900 dark:text-white text-sm">
                  {activeSelected.name || activeSelected.id}
                </span>
                <span className="text-[10px] uppercase font-semibold px-2 py-0.5 rounded-full bg-indigo-50 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800">
                  {activeSelected.type}
                </span>
              </div>
              <button
                onClick={() => onSelectEntity?.(null)}
                className="p-1 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 rounded-md"
                title="Clear selection"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {activeSelected.description && (
              <p className="text-slate-600 dark:text-slate-300 mt-1.5 text-xs leading-relaxed">
                {activeSelected.description}
              </p>
            )}

            {connectedRelations.length > 0 && (
              <div className="mt-2.5 pt-2 border-t border-slate-100 dark:border-slate-800 flex items-center space-x-2 text-[11px] text-slate-500 flex-wrap gap-1">
                <span className="font-medium text-slate-600 dark:text-slate-400">Connected:</span>
                {connectedRelations.slice(0, 4).map((rel, rIdx) => {
                  const target = rel.target === activeSelected.name ? rel.source : rel.target;
                  return (
                    <span key={rIdx} className="bg-slate-100 dark:bg-slate-800 px-1.5 py-0.5 rounded text-slate-700 dark:text-slate-300">
                      {rel.relation} → {typeof target === 'object' ? (target as any).name : target}
                    </span>
                  );
                })}
              </div>
            )}

            <div className="mt-2 text-[11px] text-indigo-600 dark:text-indigo-400 font-medium flex items-center space-x-1">
              <Sparkles className="w-3 h-3" />
              <span>Cross-filtering active: Matching timeline events and source quotes highlighted</span>
            </div>
          </div>
        )}
      </div>

    </div>
  );
}
