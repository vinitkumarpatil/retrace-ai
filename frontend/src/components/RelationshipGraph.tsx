'use client';

import React, { useRef, useState, useEffect, useMemo } from 'react';
import dynamic from 'next/dynamic';
import {
  Share2,
  ZoomIn,
  ZoomOut,
  Maximize2,
  RefreshCw,
  Search,
  Filter,
  Layers,
  Globe,
  X,
  Play,
  Pause,
} from 'lucide-react';
import { EntityNode, EntityLink } from '@/lib/types';
import { getGlobalGraph } from '@/lib/api';

const ForceGraph2D = dynamic(() => import('react-force-graph-2d'), {
  ssr: false,
  loading: () => (
    <div className="w-full h-80 flex flex-col items-center justify-center bg-[#05070D] text-xs font-mono text-[#94A3B8]">
      <RefreshCw className="w-6 h-6 animate-spin text-[#00F2FE] mb-2" />
      <span>INITIALIZING EVIDENCE INVESTIGATION TOPOLOGY...</span>
    </div>
  ),
});

interface RelationshipGraphProps {
  nodes: EntityNode[];
  links: EntityLink[];
  allowGlobalToggle?: boolean;
  onSelectNode?: (node: EntityNode) => void;
}

export default function RelationshipGraph({
  nodes: initialNodes,
  links: initialLinks,
  allowGlobalToggle = true,
  onSelectNode,
}: RelationshipGraphProps) {
  const fgRef = useRef<any>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [dimensions, setDimensions] = useState({ width: 600, height: 420 });
  const [selectedNode, setSelectedNode] = useState<any | null>(null);
  const [filterType, setFilterType] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [isGlobalMode, setIsGlobalMode] = useState<boolean>(false);
  const [globalData, setGlobalData] = useState<{ nodes: EntityNode[]; links: EntityLink[] } | null>(null);
  const [isLoadingGlobal, setIsLoadingGlobal] = useState<boolean>(false);
  const [isPaused, setIsPaused] = useState<boolean>(false);
  const [isFullscreen, setIsFullscreen] = useState<boolean>(false);

  useEffect(() => {
    if (!containerRef.current) return;
    const updateDimensions = () => {
      if (containerRef.current) {
        setDimensions({
          width: containerRef.current.clientWidth,
          height: isFullscreen ? window.innerHeight - 160 : Math.max(380, containerRef.current.clientHeight),
        });
      }
    };
    updateDimensions();
    window.addEventListener('resize', updateDimensions);
    return () => window.removeEventListener('resize', updateDimensions);
  }, [isFullscreen]);

  const handleToggleGlobal = async () => {
    if (!isGlobalMode) {
      if (!globalData) {
        setIsLoadingGlobal(true);
        try {
          const res = await getGlobalGraph();
          setGlobalData(res);
        } catch (e) {
          console.error('Failed to load global graph', e);
        } finally {
          setIsLoadingGlobal(false);
        }
      }
      setIsGlobalMode(true);
    } else {
      setIsGlobalMode(false);
    }
  };

  const activeNodes = isGlobalMode && globalData ? globalData.nodes : initialNodes;
  const activeLinks = isGlobalMode && globalData ? globalData.links : initialLinks;

  const getNodeColor = (type: string) => {
    switch (type?.toLowerCase()) {
      case 'person':
      case 'engineer':
        return '#10B981'; // Emerald
      case 'system':
      case 'repository':
        return '#00F2FE'; // Electric Cyan
      case 'decision':
      case 'architecture':
        return '#F59E0B'; // Amber
      case 'team':
      case 'deployment':
        return '#8B5CF6'; // Violet
      case 'incident':
      case 'document':
        return '#EF4444'; // Red
      default:
        return '#94A3B8';
    }
  };

  const graphData = useMemo(() => {
    const validNodes = (activeNodes || []).map((n) => ({
      id: n.name || n.id,
      name: n.name || n.id,
      type: n.type || 'concept',
      role: (n as any).role || '',
      description: n.description || '',
      val: n.type === 'decision' || n.type === 'system' ? 4.5 : 2.5,
      color: getNodeColor(n.type),
    }));

    const nodeIds = new Set(validNodes.map((n) => n.id));

    const validLinks = (activeLinks || [])
      .map((l) => ({
        source: typeof l.source === 'object' ? (l.source as any).id : l.source,
        target: typeof l.target === 'object' ? (l.target as any).id : l.target,
        relation: l.relation || 'relates_to',
        evidence: l.evidence || '',
      }))
      .filter((l) => nodeIds.has(l.source) && nodeIds.has(l.target));

    let filteredNodes = validNodes;
    if (filterType !== 'all') {
      filteredNodes = filteredNodes.filter((n) => n.type.toLowerCase() === filterType.toLowerCase());
    }
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      filteredNodes = filteredNodes.filter(
        (n) => n.name.toLowerCase().includes(q) || n.description.toLowerCase().includes(q)
      );
    }

    const filteredNodeIds = new Set(filteredNodes.map((n) => n.id));
    const filteredLinks = validLinks.filter(
      (l) => filteredNodeIds.has(l.source as string) && filteredNodeIds.has(l.target as string)
    );

    return { nodes: filteredNodes, links: filteredLinks };
  }, [activeNodes, activeLinks, filterType, searchQuery]);

  const handleNodeClick = (node: any) => {
    setSelectedNode(node);
    if (onSelectNode) {
      onSelectNode({
        id: node.id,
        name: node.name,
        type: node.type,
        description: node.description,
      });
    }
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

  if (!initialNodes || initialNodes.length === 0) {
    return (
      <div className="p-8 text-center rounded-xl bg-[#101722] border border-[#243044] font-mono text-xs text-[#94A3B8]">
        NO EVIDENCE RELATIONSHIPS FOUND IN THIS QUERY SCOPE
      </div>
    );
  }

  return (
    <div
      className={`rounded-xl p-5 bg-[#101722] border border-[#243044] shadow-xl flex flex-col space-y-3 ${
        isFullscreen ? 'fixed inset-4 z-50 bg-[#05070D]' : ''
      }`}
    >
      {/* Topology Header */}
      <div className="flex flex-wrap items-center justify-between gap-2.5 pb-3 border-b border-[#243044]">
        <div className="flex items-center space-x-2.5">
          <div className="p-1.5 rounded-lg bg-[#8B5CF6]/10 text-[#8B5CF6] border border-[#8B5CF6]/30">
            <Share2 className="w-4 h-4" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <h3 className="text-xs font-mono font-bold text-white uppercase tracking-wider">
                {isGlobalMode ? 'GLOBAL KNOWLEDGE GRAPH' : 'EVIDENCE TOPOLOGY GRAPH'}
              </h3>
              <span className="text-[10px] font-mono px-2 py-0.2 rounded-full bg-[#00F2FE]/10 text-[#00F2FE] border border-[#00F2FE]/30 font-bold">
                {graphData.nodes.length} NODES
              </span>
            </div>
            <p className="text-[11px] font-mono text-[#94A3B8]">
              CAUSAL INVESTIGATION NETWORK (ENGINEER ➔ ADR ➔ REPO ➔ DEPLOYMENT)
            </p>
          </div>
        </div>

        {/* Global Toggle & Controls */}
        <div className="flex items-center space-x-1.5">
          {allowGlobalToggle && (
            <button
              onClick={handleToggleGlobal}
              disabled={isLoadingGlobal}
              className={`px-2.5 py-1 text-xs font-mono rounded-md border flex items-center space-x-1 transition-all ${
                isGlobalMode
                  ? 'bg-[#00F2FE]/15 text-[#00F2FE] border-[#00F2FE]/40 font-bold'
                  : 'bg-[#151D29] text-[#94A3B8] hover:text-white border-[#243044]'
              }`}
            >
              <Globe className="w-3.5 h-3.5" />
              <span>{isGlobalMode ? 'Subgraph' : 'Global Graph'}</span>
            </button>
          )}

          <div className="flex items-center space-x-1 bg-[#05070D] p-1 rounded-md border border-[#243044]">
            <button
              onClick={handleZoomIn}
              className="p-1 text-[#94A3B8] hover:text-white rounded"
              title="Zoom In"
            >
              <ZoomIn className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={handleZoomOut}
              className="p-1 text-[#94A3B8] hover:text-white rounded"
              title="Zoom Out"
            >
              <ZoomOut className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={handleFit}
              className="p-1 text-[#94A3B8] hover:text-white rounded"
              title="Center Graph"
            >
              <Maximize2 className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => setIsFullscreen(!isFullscreen)}
              className="p-1 text-[#94A3B8] hover:text-[#00F2FE] rounded"
              title={isFullscreen ? 'Exit Fullscreen' : 'Fullscreen'}
            >
              <Layers className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-wrap items-center justify-between gap-2 text-xs font-mono">
        <div className="flex flex-wrap items-center gap-1.5">
          {['all', 'decision', 'person', 'system', 'team'].map((t) => (
            <button
              key={t}
              onClick={() => setFilterType(t)}
              className={`px-2 py-0.5 rounded text-[10px] uppercase transition-all ${
                filterType === t
                  ? 'bg-[#00F2FE] text-black font-bold'
                  : 'bg-[#0B101A] text-[#94A3B8] hover:text-white border border-[#243044]'
              }`}
            >
              {t}
            </button>
          ))}
        </div>

        <div className="relative">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search entity..."
            className="w-36 sm:w-44 pl-7 pr-2 py-1 bg-[#05070D] border border-[#243044] rounded text-white text-xs font-mono placeholder:text-[#64748B] focus:outline-none focus:border-[#00F2FE]"
          />
          <Search className="w-3.5 h-3.5 text-[#64748B] absolute left-2 top-1.5" />
        </div>
      </div>

      {/* Canvas */}
      <div
        ref={containerRef}
        className={`w-full bg-[#05070D] rounded-xl border border-[#243044] overflow-hidden relative ${
          isFullscreen ? 'flex-1' : 'h-88'
        }`}
      >
        <ForceGraph2D
          ref={fgRef}
          width={dimensions.width}
          height={dimensions.height}
          graphData={graphData}
          backgroundColor="#05070D"
          nodeLabel={(node: any) => `${node.name} [${node.type?.toUpperCase()}]\n${node.description || ''}`}
          nodeColor={(node: any) => node.color}
          nodeRelSize={5}
          linkColor={() => 'rgba(36, 48, 68, 0.8)'}
          linkDirectionalArrowLength={4}
          linkDirectionalArrowRelPos={1}
          linkCurvature={0.12}
          linkLabel={(link: any) => link.relation || ''}
          onNodeClick={handleNodeClick}
          cooldownTicks={120}
          onEngineStop={() => handleFit()}
        />

        {/* Selected Node HUD */}
        {selectedNode && (
          <div className="absolute bottom-3 left-3 right-3 bg-[#101722]/95 backdrop-blur-md p-3 rounded-lg border border-[#00F2FE]/40 shadow-xl text-xs font-mono flex items-center justify-between">
            <div className="space-y-0.5">
              <div className="flex items-center space-x-2">
                <span className="font-bold text-white text-sm">{selectedNode.name}</span>
                <span className="text-[10px] text-[#00F2FE] uppercase font-bold px-1.5 py-0.2 rounded bg-[#00F2FE]/10 border border-[#00F2FE]/30">
                  {selectedNode.type}
                </span>
              </div>
              <p className="text-[11px] text-[#94A3B8] font-sans truncate max-w-lg">
                {selectedNode.description || 'Entity actively correlated in evidence graph.'}
              </p>
            </div>

            <button
              onClick={() => setSelectedNode(null)}
              className="text-[#94A3B8] hover:text-white p-1"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        )}
      </div>

      {/* Legend */}
      <div className="flex flex-wrap items-center justify-between gap-2 text-[10px] font-mono text-[#94A3B8] pt-1">
        <div className="flex items-center space-x-3">
          <span className="flex items-center space-x-1">
            <span className="w-2 h-2 rounded-full bg-[#10B981]"></span>
            <span>Engineer / Person</span>
          </span>
          <span className="flex items-center space-x-1">
            <span className="w-2 h-2 rounded-full bg-[#00F2FE]"></span>
            <span>System / Repo</span>
          </span>
          <span className="flex items-center space-x-1">
            <span className="w-2 h-2 rounded-full bg-[#F59E0B]"></span>
            <span>Decision / ADR</span>
          </span>
          <span className="flex items-center space-x-1">
            <span className="w-2 h-2 rounded-full bg-[#8B5CF6]"></span>
            <span>Team / Deploy</span>
          </span>
        </div>

        <span className="text-[#00F2FE]">Click node to inspect in Right Inspector</span>
      </div>

    </div>
  );
}
