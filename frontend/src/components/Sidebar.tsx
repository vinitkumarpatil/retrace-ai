'use client';

import React from 'react';
import {
  Compass,
  Terminal,
  Clock,
  Share2,
  AlertOctagon,
  Layers,
  FileText,
  Bookmark,
  Archive,
  Database,
  Cpu,
  Activity,
  Workflow,
  CheckCircle2,
  ChevronRight,
  Sparkles,
  GitBranch,
} from 'lucide-react';

export type NavItemKey =
  | 'overview'
  | 'query_terminal'
  | 'decision_trails'
  | 'architecture'
  | 'incidents'
  | 'deployments'
  | 'artifacts'
  | 'documents'
  | 'citations'
  | 'archive'
  | 'vector_index'
  | 'symbolic_graph'
  | 'topology'
  | 'system_health';

interface SidebarProps {
  activeNav: NavItemKey;
  onSelectNav: (key: NavItemKey) => void;
  docCount: number;
  isOpenMobile: boolean;
  onCloseMobile: () => void;
}

export default function Sidebar({
  activeNav,
  onSelectNav,
  docCount,
  isOpenMobile,
  onCloseMobile,
}: SidebarProps) {
  const SECTIONS = [
    {
      title: 'OVERVIEW',
      items: [
        { key: 'overview' as NavItemKey, label: 'Command Center', icon: Compass },
      ],
    },
    {
      title: 'INVESTIGATE',
      items: [
        { key: 'query_terminal' as NavItemKey, label: 'Query Terminal', icon: Terminal },
        { key: 'decision_trails' as NavItemKey, label: 'Decision Trails', icon: Clock },
        { key: 'architecture' as NavItemKey, label: 'Architecture', icon: GitBranch },
        { key: 'incidents' as NavItemKey, label: 'Incidents', icon: AlertOctagon },
        { key: 'deployments' as NavItemKey, label: 'Deployments', icon: Workflow },
      ],
    },
    {
      title: 'EVIDENCE',
      items: [
        { key: 'artifacts' as NavItemKey, label: 'Artifacts', icon: Layers, badge: `${docCount}` },
        { key: 'documents' as NavItemKey, label: 'Documents', icon: FileText },
        { key: 'citations' as NavItemKey, label: 'Citations', icon: Bookmark },
        { key: 'archive' as NavItemKey, label: 'Archive', icon: Archive },
      ],
    },
    {
      title: 'SYSTEM',
      items: [
        { key: 'vector_index' as NavItemKey, label: 'Vector Index', icon: Database, badge: 'HNSW' },
        { key: 'symbolic_graph' as NavItemKey, label: 'Symbolic Graph', icon: Share2 },
        { key: 'topology' as NavItemKey, label: 'Topology', icon: Cpu },
        { key: 'system_health' as NavItemKey, label: 'System Health', icon: Activity },
      ],
    },
  ];

  return (
    <>
      {/* Mobile Backdrop */}
      {isOpenMobile && (
        <div
          className="fixed inset-0 z-40 bg-black/70 backdrop-blur-xs md:hidden"
          onClick={onCloseMobile}
        />
      )}

      {/* Sidebar Container */}
      <aside
        className={`w-[250px] shrink-0 border-r border-[#243044] bg-[#0B101A] flex flex-col justify-between z-40 transition-transform duration-300 md:translate-x-0 ${
          isOpenMobile
            ? 'fixed inset-y-0 left-0 translate-x-0'
            : 'fixed inset-y-0 left-0 -translate-x-full md:relative md:translate-x-0'
        }`}
      >
        {/* Navigation List */}
        <div className="flex-1 overflow-y-auto p-4 space-y-6">
          {SECTIONS.map((section, sIdx) => (
            <div key={sIdx} className="space-y-1.5">
              <div className="px-2 text-[10px] font-mono uppercase tracking-widest text-[#94A3B8] font-bold">
                {section.title}
              </div>

              <div className="space-y-0.5">
                {section.items.map((item) => {
                  const Icon = item.icon;
                  const isActive = activeNav === item.key;

                  return (
                    <button
                      key={item.key}
                      onClick={() => {
                        onSelectNav(item.key);
                        onCloseMobile();
                      }}
                      className={`w-full flex items-center justify-between px-2.5 py-1.5 rounded-lg text-xs font-mono transition-all group relative ${
                        isActive
                          ? 'bg-[#151D29] text-[#00F2FE] font-bold border border-[#243044] shadow-xs'
                          : 'text-[#94A3B8] hover:text-white hover:bg-[#101722]'
                      }`}
                    >
                      {/* Active Indicator Strip */}
                      {isActive && (
                        <span className="absolute left-0 top-1.5 bottom-1.5 w-1 rounded-r bg-[#00F2FE]"></span>
                      )}

                      <div className="flex items-center space-x-2.5 pl-1.5">
                        <Icon
                          className={`w-3.5 h-3.5 transition-colors ${
                            isActive ? 'text-[#00F2FE]' : 'text-[#64748B] group-hover:text-slate-300'
                          }`}
                        />
                        <span>{item.label}</span>
                      </div>

                      {item.badge && (
                        <span
                          className={`text-[9px] px-1.5 py-0.2 rounded font-mono ${
                            isActive
                              ? 'bg-[#00F2FE]/15 text-[#00F2FE] border border-[#00F2FE]/30'
                              : 'bg-[#151D29] text-[#94A3B8] border border-[#243044]'
                          }`}
                        >
                          {item.badge}
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>
          ))}
        </div>

        {/* Bottom Status Block */}
        <div className="p-4 border-t border-[#243044] bg-[#05070D] font-mono text-xs space-y-2">
          <div className="text-[10px] uppercase tracking-wider text-[#64748B] font-bold">
            SYSTEM STATUS
          </div>

          <div className="flex items-center justify-between">
            <span className="flex items-center space-x-1.5 text-slate-200">
              <span className="w-2 h-2 rounded-full bg-[#10B981] animate-pulse"></span>
              <span className="font-semibold text-[11px]">Operational</span>
            </span>
            <span className="text-[10px] text-[#00F2FE] bg-[#00F2FE]/10 px-1.5 py-0.5 rounded border border-[#00F2FE]/30">
              INDEX: 98.8%
            </span>
          </div>

          <div className="text-[10px] text-[#94A3B8] flex items-center justify-between pt-1 border-t border-[#243044]/60">
            <span>Last sync:</span>
            <span className="text-slate-400">2 min ago</span>
          </div>
        </div>

      </aside>
    </>
  );
}
