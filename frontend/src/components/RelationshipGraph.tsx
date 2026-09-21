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
  Info,
  X,
  Play,
  Pause,
  Zap,
} from 'lucide-react';
import { EntityNode, EntityLink } from '@/lib/types';
import { getGlobalGraph } from '@/lib/api';

// Dynamically import ForceGraph2D with SSR disabled
const ForceGraph2D = dynamic(() => import('react-force-graph-2d'), {
  ssr: false,
  loading: () => (
    <div className="w-full h-96 flex flex-col items-center justify-center bg-[#040714] text-xs font-mono text-slate-400">
      <RefreshCw className="w-7 h-7 animate-spin text-cyan-400 mb-3" />
      <span className="shimmer-text">INITIALIZING TOPOLOGY ENGINE & GRAPH PHYSICS...</span>
    </div>
  ),
});

interface RelationshipGraphProps {
  nodes: EntityNode[];
  links: EntityLink[];
  allowGlobalToggle?: boolean;
}

export default function RelationshipGraph({
  nodes: initialNodes,
  links: initialLinks,
  allowGlobalToggle = true,
}: RelationshipGraphProps) {
  const fgRef = useRef<any>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [dimensions, setDimensions] = useState({ width: 600, height: 450 });
  const [selectedNode, setSelectedNode] = useState<any | null>(null);
  const [filterType, setFilterType] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [isGlobalMode, setIsGlobalMode] = useState<boolean>(false);
  const [globalData, setGlobalData] = useState<{ nodes: EntityNode[]; links: EntityLink[] } | null>(null);
  const [isLoadingGlobal, setIsLoadingGlobal] = useState<boolean>(false);
  const [isPaused, setIsPaused] = useState<boolean>(false);
  const [isFullscreen, setIsFullscreen] = useState<boolean>(false);

  // Resize listener
  useEffect(() => {
    if (!containerRef.current) return;
    const updateDimensions = () => {
      if (containerRef.current) {
        setDimensions({
          width: containerRef.current.clientWidth,
          height: isFullscreen ? window.innerHeight - 180 : Math.max(420, containerRef.current.clientHeight),
        });
      }
    };
    updateDimensions();
    window.addEventListener('resize', updateDimensions);
    return () => window.removeEventListener('resize', updateDimensions);
  }, [isFullscreen]);

  // Load global graph if toggled
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
        return '#00DF89'; // Neon Mint
      case 'system':
        return '#00F2FE'; // Electric Cyan
      case 'decision':
        return '#FBBF24'; // Cyber Amber
      case 'team':
        return '#A855F7'; // Electric Violet
      case 'document':
        return '#FF007A'; // Cyber Pink
      default:
        return '#38BDF8'; // Sky Blue
    }
  };

  // Filtered graph dataset
  const graphData = useMemo(() => {
    const validNodes = (activeNodes || []).map((n) => ({
      id: n.name || n.id,
      name: n.name || n.id,
      type: n.type || 'concept',
      role: (n as any).role || '',
      description: n.description || '',
      val: n.type === 'decision' || n.type === 'system' ? 5 : 3,
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
      filteredNodes = filteredNodes.filter((n) => n.name.toLowerCase().includes(q) || n.description.toLowerCase().includes(q));
    }

    const filteredNodeIds = new Set(filteredNodes.map((n) => n.id));
    const filteredLinks = validLinks.filter(
      (l) => filteredNodeIds.has(l.source as string) && filteredNodeIds.has(l.target as string)
    );

    return { nodes: filteredNodes, links: filteredLinks };
  }, [activeNodes, activeLinks, filterType, searchQuery]);

  const handleZoomIn = () => {
    if (fgRef.current) fgRef.current.zoom(fgRef.current.zoom() * 1.3, 400);
  };

  const handleZoomOut = () => {
    if (fgRef.current) fgRef.current.zoom(fgRef.current.zoom() * 0.7, 400);
  };

  const handleFit = () => {
    if (fgRef.current) fgRef.current.zoomToFit(400, 40);
  };

  const togglePause = () => {
    if (fgRef.current) {
      if (isPaused) {
        fgRef.current.resumeAnimation();
        setIsPaused(false);
      } else {
        fgRef.current.pauseAnimation();
        setIsPaused(true);
      }
    }
  };

  if (!initialNodes || initialNodes.length === 0) {
    return (
      <div className="forensic-card rounded-xl border border-[#1E2C54] p-6 relative">
        <div className="p-8 text-center font-mono text-xs text-slate-500">
          NO ENTITY RELATIONSHIPS EXTRACTED FOR CURRENT QUERY
        </div>
      </div>
    );
  }

  return (
    <div
      className={`forensic-card rounded-xl p-5 relative corner-ticks shadow-2xl flex flex-col transition-all duration-300 ${
        isFullscreen ? 'fixed inset-4 z-50 bg-[#040714]' : ''
      }`}
    >
      {/* Topology Header */}
      <div className="flex flex-wrap items-center justify-between gap-2.5 pb-3 mb-3 border-b border-[#1E2C54]">
        <div className="flex items-center space-x-2.5">
          <div className="p-2 bg-gradient-to-br from-cyan-500/20 to-violet-600/20 rounded-lg text-cyan-300 border border-cyan-500/40 shadow-md shadow-cyan-500/10">
            <Share2 className="w-4 h-4 animate-spin-slow" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <h3 className="text-xs font-mono font-bold text-white uppercase tracking-wider">
                {isGlobalMode ? 'GLOBAL KNOWLEDGE TOPOLOGY' : 'QUERY ENTITY GRAPH'}
              </h3>
              <span className="text-[10px] font-mono px-2 py-0.2 rounded-full bg-cyan-500/15 text-cyan-300 border border-cyan-400/30 font-bold">
                {graphData.nodes.length} NODES
              </span>
            </div>
            <p className="text-[11px] font-mono text-slate-400">
              FORCE-DIRECTED CAUSAL & ARCHITECTURAL MAPPING
            </p>
          </div>
        </div>

        {/* Global / Subgraph Toggle */}
        {allowGlobalToggle && (
          <button
            onClick={handleToggleGlobal}
            disabled={isLoadingGlobal}
            className={`px-3 py-1.5 text-xs font-mono rounded-lg border flex items-center space-x-1.5 transition-all shadow-sm active:scale-95 ${
              isGlobalMode
                ? 'bg-cyan-500/20 text-cyan-300 border-cyan-400/50 shadow-cyan-500/10 font-bold'
                : 'bg-[#0A0F24] text-slate-300 hover:text-white border-[#1E2C54]'
            }`}
          >
            <Globe className={`w-3.5 h-3.5 ${isLoadingGlobal ? 'animate-spin text-cyan-400' : 'text-cyan-400'}`} />
            <span>{isGlobalMode ? 'View Subgraph' : 'Explore Global'}</span>
          </button>
        )}

        {/* Canvas Controls */}
        <div className="flex items-center space-x-1 bg-[#0A0F24] p-1 rounded-lg border border-[#1E2C54]">
          <button
            onClick={togglePause}
            className="p-1 text-slate-400 hover:text-white rounded"
            title={isPaused ? 'Resume Layout' : 'Freeze Layout'}
          >
            {isPaused ? <Play className="w-3.5 h-3.5 text-emerald-400" /> : <Pause className="w-3.5 h-3.5" />}
          </button>
          <button
            onClick={handleZoomIn}
            className="p-1 text-slate-400 hover:text-white rounded"
            title="Zoom In"
          >
            <ZoomIn className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={handleZoomOut}
            className="p-1 text-slate-400 hover:text-white rounded"
            title="Zoom Out"
          >
            <ZoomOut className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={handleFit}
            className="p-1 text-slate-400 hover:text-white rounded"
            title="Center Graph"
          >
            <Maximize2 className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={() => setIsFullscreen(!isFullscreen)}
            className="p-1 text-slate-400 hover:text-cyan-400 rounded"
            title={isFullscreen ? 'Exit Fullscreen' : 'Fullscreen'}
          >
            <Layers className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-wrap items-center justify-between gap-2 mb-3 text-xs font-mono">
        {/* Type Filter Pills */}
        <div className="flex flex-wrap items-center gap-1.5">
          {['all', 'person', 'system', 'decision', 'team'].map((t) => (
            <button
              key={t}
              onClick={() => setFilterType(t)}
              className={`px-2.5 py-0.5 rounded-md text-[11px] uppercase transition-all duration-200 active:scale-95 ${
                filterType === t
                  ? 'bg-gradient-to-r from-cyan-400 to-violet-500 text-slate-950 font-bold shadow-md shadow-cyan-500/20'
                  : 'bg-[#0A0F24] text-slate-400 hover:text-slate-200 border border-[#1E2C54]'
              }`}
            >
              {t}
            </button>
          ))}
        </div>

        {/* Node Search */}
        <div className="relative">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search entity..."
            className="w-36 sm:w-44 pl-7 pr-2 py-1 bg-[#040714] border border-[#1E2C54] rounded-md text-slate-200 placeholder:text-slate-500 text-xs font-mono focus:outline-none focus:border-cyan-400 transition-all"
          />
          <Search className="w-3 h-3 text-slate-500 absolute left-2.5 top-2" />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-1.5 top-1.5 text-slate-500 hover:text-white"
            >
              <X className="w-3 h-3" />
            </button>
          )}
        </div>
      </div>

      {/* Graph Visualizer Canvas Area */}
      <div
        ref={containerRef}
        className={`w-full bg-[#040714] rounded-xl border border-[#1E2C54] overflow-hidden relative shadow-inner ${
          isFullscreen ? 'flex-1' : 'h-96'
        }`}
      >
        <ForceGraph2D
          ref={fgRef}
          width={dimensions.width}
          height={dimensions.height}
          graphData={graphData}
          backgroundColor="#040714"
          nodeLabel={(node: any) => `${node.name} [${node.type?.toUpperCase()}]\n${node.description || ''}`}
          nodeColor={(node: any) => node.color}
          nodeRelSize={6}
          linkColor={() => 'rgba(0, 242, 254, 0.25)'}
          linkDirectionalArrowLength={4}
          linkDirectionalArrowRelPos={1}
          linkCurvature={0.15}
          linkLabel={(link: any) => link.relation || ''}
          onNodeClick={(node: any) => setSelectedNode(node)}
          cooldownTicks={120}
          onEngineStop={() => {
            if (!isPaused) handleFit();
          }}
        />

        {/* Selected Node Details HUD */}
        {selectedNode && (
          <div className="absolute bottom-3 left-3 right-3 bg-[#0A0F24]/95 backdrop-blur-md p-4 rounded-xl border border-cyan-400/50 shadow-2xl text-xs font-mono animate-in fade-in">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <span className="font-bold text-white text-sm">{selectedNode.name}</span>
                <span
                  className="text-[10px] px-2 py-0.5 rounded uppercase font-bold"
                  style={{
                    backgroundColor: `${selectedNode.color}22`,
                    color: selectedNode.color,
                    borderColor: `${selectedNode.color}55`,
                    borderWidth: 1,
                  }}
                >
                  {selectedNode.type}
                </span>
                {selectedNode.role && (
                  <span className="text-[10px] text-slate-400 hidden sm:inline">
                    ({selectedNode.role})
                  </span>
                )}
              </div>

              <button
                onClick={() => setSelectedNode(null)}
                className="text-slate-400 hover:text-white p-1"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>

            {selectedNode.description && (
              <p className="text-slate-300 mt-2 font-sans text-xs leading-relaxed">
                {selectedNode.description}
              </p>
            )}
          </div>
        )}
      </div>

      {/* Legend Footer */}
      <div className="mt-3 pt-2.5 border-t border-[#1E2C54] flex flex-wrap items-center justify-between gap-2 text-[11px] font-mono text-slate-400">
        <div className="flex items-center space-x-3">
          <span className="flex items-center space-x-1">
            <span className="w-2.5 h-2.5 rounded-full bg-[#00DF89] shadow-xs"></span>
            <span>Person</span>
          </span>
          <span className="flex items-center space-x-1">
            <span className="w-2.5 h-2.5 rounded-full bg-[#00F2FE] shadow-xs"></span>
            <span>System</span>
          </span>
          <span className="flex items-center space-x-1">
            <span className="w-2.5 h-2.5 rounded-full bg-[#FBBF24] shadow-xs"></span>
            <span>Decision</span>
          </span>
          <span className="flex items-center space-x-1">
            <span className="w-2.5 h-2.5 rounded-full bg-[#A855F7] shadow-xs"></span>
            <span>Team</span>
          </span>
        </div>

        <span className="text-cyan-400/80">Click node for deep dive</span>
      </div>

    </div>
  );
}
