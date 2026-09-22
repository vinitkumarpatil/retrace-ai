'use client';

import React, { useRef, useState, useEffect } from 'react';
import dynamic from 'next/dynamic';
import {
  ZoomIn,
  ZoomOut,
  Maximize2,
  Minimize2,
  X,
  Filter,
} from 'lucide-react';
import { EntityNode, EntityLink } from '@/lib/types';

const ForceGraph2D = dynamic(() => import('react-force-graph-2d'), {
  ssr: false,
  loading: () => (
    <div className="w-full h-80 grid place-items-center text-[12px] text-ink-faint">
      Drawing the map…
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

// Node palette — tuned to the case-file tones (readable on both paper and microfilm).
const TYPE_COLOR: Record<string, string> = {
  person: '#4A6A4A',    // archival green
  system: '#3E6478',    // muted teal-slate
  decision: '#9E3323',  // stamp oxblood
  team: '#8A6D3B',      // sienna
  concept: '#8A8374',   // ink-faint
  document: '#5C574C',
  date: '#A37A2B',
};

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
  const [isDark, setIsDark] = useState(false);

  // Track theme so canvas link colors adapt.
  useEffect(() => {
    const check = () => setIsDark(document.documentElement.classList.contains('dark'));
    check();
    const obs = new MutationObserver(check);
    obs.observe(document.documentElement, { attributes: true, attributeFilter: ['class'] });
    return () => obs.disconnect();
  }, []);

  useEffect(() => {
    if (!containerRef.current) return;
    const update = () => {
      if (containerRef.current) {
        setDimensions({
          width: containerRef.current.clientWidth,
          height: isFullscreen ? window.innerHeight - 150 : Math.max(420, containerRef.current.clientHeight),
        });
      }
    };
    update();
    const observer = new ResizeObserver(update);
    observer.observe(containerRef.current);
    return () => observer.disconnect();
  }, [isFullscreen]);

  const getNodeColor = (type: string, isSelected: boolean) =>
    isSelected ? '#9E3323' : (TYPE_COLOR[type?.toLowerCase()] || TYPE_COLOR.concept);

  const filteredNodes = nodes.filter(n =>
    selectedType === 'all' ? true : (n.type || 'concept').toLowerCase() === selectedType
  );
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

  const handleZoomIn = () => fgRef.current?.zoom(fgRef.current.zoom() * 1.3, 400);
  const handleZoomOut = () => fgRef.current?.zoom(fgRef.current.zoom() * 0.7, 400);
  const handleFit = () => fgRef.current?.zoomToFit(400, 50);

  const handleNodeClick = (node: any) => {
    if (selectedEntityId === node.id) onSelectEntity?.(null);
    else onSelectEntity?.(node.rawNode || node);
  };

  const activeSelected = nodes.find(n => (n.name || n.id) === selectedEntityId);
  const connectedRelations = activeSelected ? links.filter(l => {
    const sId = typeof l.source === 'object' ? (l.source as any).id : l.source;
    const tId = typeof l.target === 'object' ? (l.target as any).id : l.target;
    const myId = activeSelected.name || activeSelected.id;
    return sId === myId || tId === myId;
  }) : [];

  if (!nodes || nodes.length === 0) {
    return (
      <div className="sheet shadow-sheet p-8 text-center text-[13px] text-ink-faint">
        No connections between people, systems, or decisions were found.
      </div>
    );
  }

  return (
    <section className={`sheet shadow-sheet p-5 flex flex-col ${isFullscreen ? 'fixed inset-4 z-50 shadow-modal' : ''}`}>
      <header className="flex flex-wrap items-center justify-between gap-3 pb-3 mb-3 border-b border-rule">
        <div>
          <h3 className="font-serif text-[17px] font-semibold text-ink">Connections</h3>
          <p className="text-[13px] text-ink-soft mt-0.5">Who and what links to what. Click a node to focus everything on it.</p>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="flex items-center border border-rule rounded-sheet bg-paper overflow-hidden">
            <button onClick={handleZoomIn} className="p-1.5 text-ink-soft hover:text-ink hover:bg-sheet transition-colors" title="Zoom in">
              <ZoomIn className="w-3.5 h-3.5" />
            </button>
            <span className="w-px h-4 bg-rule" />
            <button onClick={handleZoomOut} className="p-1.5 text-ink-soft hover:text-ink hover:bg-sheet transition-colors" title="Zoom out">
              <ZoomOut className="w-3.5 h-3.5" />
            </button>
            <span className="w-px h-4 bg-rule" />
            <button onClick={handleFit} className="px-2 py-1.5 text-[12px] font-medium text-ink-soft hover:text-ink hover:bg-sheet transition-colors" title="Fit">
              Fit
            </button>
          </div>
          <button
            onClick={() => setIsFullscreen(!isFullscreen)}
            className="p-1.5 text-ink-soft hover:text-ink border border-rule rounded-sheet bg-paper hover:bg-sheet transition-colors"
            title={isFullscreen ? 'Exit fullscreen' : 'Fullscreen'}
          >
            {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
          </button>
        </div>
      </header>

      {/* Type filter */}
      <div className="flex flex-wrap items-center justify-between gap-2 mb-3">
        <div className="flex items-center gap-1 flex-wrap">
          <Filter className="w-3 h-3 text-ink-faint mr-1" />
          {ENTITY_TYPES.map(type => (
            <button
              key={type}
              onClick={() => setSelectedType(type)}
              className={`px-2.5 py-0.5 rounded-sheet capitalize text-[11.5px] font-medium transition-colors ${
                selectedType === type
                  ? 'bg-ink text-paper'
                  : 'bg-paper border border-rule text-ink-soft hover:border-rule-strong hover:text-ink'
              }`}
            >
              {type}
            </button>
          ))}
        </div>
        {selectedEntityId && (
          <button onClick={() => onSelectEntity?.(null)} className="inline-flex items-center gap-1 text-[12px] text-stamp font-medium hover:underline">
            Clear focus <X className="w-3 h-3" />
          </button>
        )}
      </div>

      <div
        ref={containerRef}
        className={`w-full sheet-flush overflow-hidden relative ${isFullscreen ? 'flex-1 min-h-[500px]' : 'h-96'}`}
      >
        <ForceGraph2D
          ref={fgRef}
          width={dimensions.width}
          height={dimensions.height}
          graphData={graphData}
          backgroundColor="rgba(0,0,0,0)"
          nodeLabel={(node: any) => `${node.name} (${node.type})\n${node.description || ''}`}
          nodeColor={(node: any) => node.color}
          nodeRelSize={6}
          linkColor={() => (isDark ? 'rgba(176,168,152,0.35)' : 'rgba(138,131,116,0.5)')}
          linkDirectionalArrowLength={4}
          linkDirectionalArrowRelPos={1}
          linkCurvature={0.12}
          linkLabel={(link: any) => link.relation || ''}
          onNodeClick={handleNodeClick}
          cooldownTicks={120}
          onEngineStop={handleFit}
        />

        {activeSelected && (
          <div className="absolute bottom-3 left-3 right-3 bg-sheet/95 backdrop-blur-sm p-4 rounded-card border border-stamp/40 shadow-lift z-20">
            <div className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-2 min-w-0">
                <span className="w-2 h-2 rounded-full bg-stamp shrink-0" />
                <span className="font-serif font-semibold text-ink text-[15px] truncate">
                  {activeSelected.name || activeSelected.id}
                </span>
                <span className="catalog uppercase shrink-0">{activeSelected.type}</span>
              </div>
              <button onClick={() => onSelectEntity?.(null)} className="p-1 text-ink-faint hover:text-ink rounded shrink-0" title="Clear">
                <X className="w-4 h-4" />
              </button>
            </div>

            {activeSelected.description && (
              <p className="text-[12.5px] text-ink-soft mt-1.5 leading-relaxed">{activeSelected.description}</p>
            )}

            {connectedRelations.length > 0 && (
              <div className="mt-2.5 pt-2 border-t border-rule flex items-center flex-wrap gap-1.5 text-[11.5px]">
                <span className="field-label">Links</span>
                {connectedRelations.slice(0, 4).map((rel, rIdx) => {
                  const target = rel.target === activeSelected.name ? rel.source : rel.target;
                  return (
                    <span key={rIdx} className="font-mono text-[11px] bg-paper border border-rule px-1.5 py-0.5 rounded text-ink-soft">
                      {rel.relation} → {typeof target === 'object' ? (target as any).name : target}
                    </span>
                  );
                })}
              </div>
            )}
          </div>
        )}
      </div>
    </section>
  );
}
