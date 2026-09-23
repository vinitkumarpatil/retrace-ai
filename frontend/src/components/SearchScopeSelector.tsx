'use client';

import React, { useState, useMemo } from 'react';
import { 
  FolderTree, 
  Folder, 
  FolderOpen, 
  FileText, 
  ChevronRight, 
  ChevronDown, 
  Check, 
  Filter, 
  Search,
  HardDrive,
  WifiOff
} from 'lucide-react';
import { DocumentItem } from '@/lib/types';
import { LocalSource } from '@/lib/local-storage';

export interface SearchScopeSelectorProps {
  documents: DocumentItem[];
  selectedPaths: string[];
  onSelectionChange: (paths: string[]) => void;
  localSources?: LocalSource[];
}

interface TreeNode {
  id: string;
  name: string;
  isFolder: boolean;
  children: TreeNode[];
  docCount: number;
}

function cleanPath(p: string): string {
  if (!p) return '';
  return p.replace(/\\/g, '/').replace(/\/+/g, '/').trim();
}

function getDocumentDisplayPath(doc: DocumentItem): string {
  if (doc.metadata?.relative_path) {
    return cleanPath(doc.metadata.relative_path);
  }
  if (doc.path) {
    const cleaned = cleanPath(doc.path);
    if (cleaned.includes(':') || cleaned.startsWith('/')) {
      const parts = cleaned.split('/');
      return parts.slice(-2).join('/');
    }
    return cleaned;
  }
  if (doc.project) {
    return `${cleanPath(doc.project)}/${cleanPath(doc.title)}`;
  }
  return cleanPath(doc.title);
}

function buildFileTree(documents: DocumentItem[]): TreeNode[] {
  const root: { [key: string]: any } = {};

  documents.forEach((doc) => {
    const rawPath = getDocumentDisplayPath(doc);
    const parts = rawPath.split('/').filter(Boolean);
    if (parts.length === 0) return;

    let current = root;
    for (let i = 0; i < parts.length; i++) {
      const part = parts[i];
      const isLast = i === parts.length - 1;

      if (!current[part]) {
        current[part] = {
          _name: part,
          _isFolder: !isLast,
          _path: isLast ? parts.slice(0, i + 1).join('/') : parts.slice(0, i + 1).join('/') + '/',
          _children: {},
          _docs: 0,
        };
      }
      current[part]._docs += 1;
      current = current[part]._children;
    }
  });

  function convert(obj: any): TreeNode[] {
    const nodes: TreeNode[] = [];
    for (const key of Object.keys(obj)) {
      const item = obj[key];
      nodes.push({
        id: item._path,
        name: item._name,
        isFolder: item._isFolder,
        children: convert(item._children),
        docCount: item._docs,
      });
    }
    nodes.sort((a, b) => {
      if (a.isFolder === b.isFolder) return a.name.localeCompare(b.name);
      return a.isFolder ? -1 : 1;
    });
    return nodes;
  }

  return convert(root);
}

export default function SearchScopeSelector({
  documents,
  selectedPaths,
  onSelectionChange,
  localSources = [],
}: SearchScopeSelectorProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [filterQuery, setFilterQuery] = useState('');
  const [expandedFolders, setExpandedFolders] = useState<Record<string, boolean>>({});

  const tree = useMemo(() => buildFileTree(documents), [documents]);

  const toggleFolderExpand = (folderPath: string) => {
    setExpandedFolders((prev) => ({
      ...prev,
      [folderPath]: !prev[folderPath],
    }));
  };

  const isSelected = (path: string): boolean => {
    if (selectedPaths.includes(path)) return true;
    return selectedPaths.some((sp) => {
      if (sp.endsWith('/')) return path.startsWith(sp);
      return false;
    });
  };

  const isDirectlySelected = (path: string): boolean => {
    return selectedPaths.includes(path);
  };

  const handleToggleNode = (node: TreeNode) => {
    const directMatch = isDirectlySelected(node.id);
    const coveredByParent = isSelected(node.id);

    if (directMatch) {
      onSelectionChange(selectedPaths.filter((p) => p !== node.id));
    } else if (coveredByParent) {
      const parentScope = selectedPaths.find((sp) => sp.endsWith('/') && node.id.startsWith(sp));
      if (parentScope) {
        onSelectionChange(selectedPaths.filter((p) => p !== parentScope));
      }
    } else {
      if (node.isFolder) {
        const filtered = selectedPaths.filter((p) => !p.startsWith(node.id));
        onSelectionChange([...filtered, node.id]);
      } else {
        onSelectionChange([...selectedPaths, node.id]);
      }
    }
  };

  const handleToggleLocalSource = (sourceId: string) => {
    const tag = `local:${sourceId}`;
    if (selectedPaths.includes(tag)) {
      onSelectionChange(selectedPaths.filter((p) => p !== tag));
    } else {
      onSelectionChange([...selectedPaths, tag]);
    }
  };

  const handleRemovePill = (pathToRemove: string) => {
    onSelectionChange(selectedPaths.filter((p) => p !== pathToRemove));
  };

  const handleClearAll = () => {
    onSelectionChange([]);
  };

  const handleSelectAll = () => {
    const allTopPaths = tree.map((n) => n.id);
    const localPaths = localSources.map(s => `local:${s.id}`);
    onSelectionChange([...allTopPaths, ...localPaths]);
  };

  const renderNode = (node: TreeNode, depth: number = 0) => {
    const isFolder = node.isFolder;
    const isExpanded = expandedFolders[node.id] ?? true;
    const active = isSelected(node.id);
    const direct = isDirectlySelected(node.id);

    if (filterQuery.trim()) {
      const match = node.name.toLowerCase().includes(filterQuery.toLowerCase()) ||
                    node.id.toLowerCase().includes(filterQuery.toLowerCase());
      const hasMatchingChild = node.children.some(c => 
        c.name.toLowerCase().includes(filterQuery.toLowerCase()) || 
        c.id.toLowerCase().includes(filterQuery.toLowerCase())
      );
      if (!match && !hasMatchingChild) return null;
    }

    return (
      <div key={node.id} className="text-xs font-mono select-none">
        <div 
          className={`flex items-center space-x-2 py-1 px-2 rounded hover:bg-stone-100/80 cursor-pointer transition-colors ${
            active ? 'bg-amber-50/70 text-amber-950 font-medium' : 'text-stone-700'
          }`}
          style={{ paddingLeft: `${depth * 16 + 8}px` }}
          onClick={() => handleToggleNode(node)}
        >
          {isFolder ? (
            <button
              type="button"
              onClick={(e) => { e.stopPropagation(); toggleFolderExpand(node.id); }}
              className="p-0.5 hover:bg-stone-200 rounded text-stone-500"
            >
              {isExpanded ? <ChevronDown className="w-3.5 h-3.5" /> : <ChevronRight className="w-3.5 h-3.5" />}
            </button>
          ) : (
            <span className="w-3.5 h-3.5 inline-block" />
          )}

          <div className={`w-3.5 h-3.5 rounded border flex items-center justify-center transition-colors ${
            active ? 'bg-amber-600 border-amber-600 text-white' : 'border-stone-300 bg-white hover:border-stone-400'
          }`}>
            {active && <Check className="w-2.5 h-2.5 stroke-[3]" />}
          </div>

          {isFolder ? (
            isExpanded ? <FolderOpen className="w-3.5 h-3.5 text-amber-600 shrink-0" /> : <Folder className="w-3.5 h-3.5 text-amber-600 shrink-0" />
          ) : (
            <FileText className="w-3.5 h-3.5 text-stone-500 shrink-0" />
          )}

          <span className="truncate max-w-[320px]">{node.name}</span>

          {isFolder && (
            <span className="ml-auto text-[10px] text-stone-400 font-mono">
              {node.docCount} {node.docCount === 1 ? 'doc' : 'docs'}
            </span>
          )}

          {direct && (
            <span className="text-[9px] bg-amber-200/60 text-amber-800 px-1 rounded uppercase font-semibold">scope</span>
          )}
        </div>

        {isFolder && isExpanded && node.children.length > 0 && (
          <div>{node.children.map((child) => renderNode(child, depth + 1))}</div>
        )}
      </div>
    );
  };

  const totalDocs = documents.length + localSources.reduce((sum, s) => sum + (s.indexedCount || 0), 0);

  return (
    <div className="w-full space-y-2">
      <div className="flex flex-wrap items-center gap-1.5 text-xs font-mono">
        <span className="text-stone-500 font-semibold uppercase flex items-center gap-1 mr-1">
          <FolderTree className="w-3.5 h-3.5 text-amber-600 shrink-0" />
          <span>Search in:</span>
        </span>

        {selectedPaths.length === 0 ? (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded bg-stone-100 border border-stone-200 text-stone-700 text-[11px] font-mono">
            All Sources ({totalDocs})
          </span>
        ) : (
          selectedPaths.map((path) => {
            const isLocal = path.startsWith('local:');
            const isFolder = path.endsWith('/') && !isLocal;
            const label = isLocal
              ? localSources.find(s => s.id === path.replace('local:', ''))?.name || path
              : path;
            return (
              <span
                key={path}
                className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-amber-50 border border-amber-300 text-amber-900 text-[11px] font-mono shadow-2xs animate-in fade-in"
              >
                {isLocal ? (
                  <HardDrive className="w-3 h-3 text-amber-600 shrink-0" />
                ) : isFolder ? (
                  <Folder className="w-3 h-3 text-amber-600 shrink-0" />
                ) : (
                  <FileText className="w-3 h-3 text-stone-500 shrink-0" />
                )}
                <span className="truncate max-w-[200px]" title={label}>{label}</span>
                <button
                  type="button"
                  onClick={() => handleRemovePill(path)}
                  className="ml-0.5 text-amber-700 hover:text-rose-600 font-bold focus:outline-none"
                  title="Remove from scope"
                >
                  ×
                </button>
              </span>
            );
          })
        )}

        {selectedPaths.length > 0 && (
          <button
            type="button"
            onClick={handleClearAll}
            className="text-[11px] text-stone-400 hover:text-rose-600 underline ml-1 font-mono transition-colors"
          >
            Clear Scope
          </button>
        )}

        <button
          type="button"
          onClick={() => setIsOpen(!isOpen)}
          className="ml-auto px-2.5 py-1 rounded border border-[#E2DDD5] bg-white hover:bg-stone-50 text-[11px] font-mono text-stone-700 flex items-center gap-1.5 shadow-2xs transition-colors"
        >
          <Filter className="w-3 h-3 text-stone-500" />
          <span>{isOpen ? 'Hide Scope' : 'Filter Scope'}</span>
          {selectedPaths.length > 0 && (
            <span className="w-4 h-4 rounded-full bg-amber-500 text-white text-[9px] flex items-center justify-center font-bold">
              {selectedPaths.length}
            </span>
          )}
        </button>
      </div>

      {isOpen && (
        <div className="p-3 bg-[#FAF8F5] border border-[#E2DDD5] rounded-md shadow-inner space-y-2 animate-in fade-in duration-150">
          
          <div className="flex items-center justify-between gap-2 pb-2 border-b border-[#E2DDD5]/70">
            <div className="relative flex-1 max-w-xs">
              <Search className="w-3 h-3 text-stone-400 absolute left-2 top-2" />
              <input
                type="text"
                value={filterQuery}
                onChange={(e) => setFilterQuery(e.target.value)}
                placeholder="Filter folders or files..."
                className="w-full pl-7 pr-2 py-1 text-xs font-mono bg-white border border-[#E2DDD5] rounded placeholder:text-stone-400 focus:outline-none focus:ring-1 focus:ring-amber-500"
              />
            </div>

            <div className="flex items-center gap-2 text-[10px] font-mono">
              <button type="button" onClick={handleSelectAll} className="px-2 py-0.5 bg-white border border-stone-200 hover:border-stone-300 rounded text-stone-700 transition-colors">
                Select All
              </button>
              <button type="button" onClick={handleClearAll} className="px-2 py-0.5 bg-white border border-stone-200 hover:border-stone-300 rounded text-stone-700 transition-colors">
                Clear
              </button>
              <button type="button" onClick={() => setIsOpen(false)} className="px-2 py-0.5 bg-[#1E293B] text-white rounded hover:bg-stone-800 transition-colors">
                Done
              </button>
            </div>
          </div>

          <div className="max-h-72 overflow-y-auto pr-1 space-y-0.5">
            {/* Local Sources Section */}
            {localSources.length > 0 && (
              <div className="mb-2">
                <div className="text-[10px] font-mono uppercase text-stone-500 font-bold tracking-wider px-2 py-1 flex items-center gap-1">
                  <HardDrive className="w-3 h-3" />
                  Local Sources
                </div>
                {localSources.map((source) => {
                  const tag = `local:${source.id}`;
                  const active = selectedPaths.includes(tag);
                  const matchesFilter = !filterQuery.trim() || source.name.toLowerCase().includes(filterQuery.toLowerCase());
                  if (!matchesFilter) return null;
                  return (
                    <div
                      key={source.id}
                      className={`flex items-center space-x-2 py-1 px-2 rounded hover:bg-stone-100/80 cursor-pointer transition-colors ${
                        active ? 'bg-amber-50/70 text-amber-950 font-medium' : 'text-stone-700'
                      }`}
                      style={{ paddingLeft: '24px' }}
                      onClick={() => handleToggleLocalSource(source.id)}
                    >
                      <span className="w-3.5 h-3.5 inline-block" />
                      <div className={`w-3.5 h-3.5 rounded border flex items-center justify-center transition-colors ${
                        active ? 'bg-amber-600 border-amber-600 text-white' : 'border-stone-300 bg-white hover:border-stone-400'
                      }`}>
                        {active && <Check className="w-2.5 h-2.5 stroke-[3]" />}
                      </div>
                      <FolderOpen className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                      <span className="truncate max-w-[320px]">{source.name}</span>
                      <span className="ml-auto text-[10px] text-stone-400 font-mono">
                        {source.indexedCount || 0} files
                      </span>
                      {active && (
                        <span className="text-[9px] bg-amber-200/60 text-amber-800 px-1 rounded uppercase font-semibold">scope</span>
                      )}
                    </div>
                  );
                })}
              </div>
            )}

            {/* Remote Documents Section */}
            <div>
              <div className="text-[10px] font-mono uppercase text-stone-500 font-bold tracking-wider px-2 py-1 flex items-center gap-1">
                <FileText className="w-3 h-3" />
                Uploaded Documents
              </div>
              {tree.length === 0 ? (
                <div className="p-4 text-center text-xs font-mono text-stone-400">
                  No uploaded files. Use Ingest Document to upload.
                </div>
              ) : (
                tree.map((node) => renderNode(node, 0))
              )}
            </div>
          </div>

          <div className="pt-1.5 border-t border-dashed border-[#E2DDD5] text-[10px] font-mono text-stone-400 flex items-center justify-between">
            <span>Selecting a folder includes all its nested subfolders and files.</span>
            <span>{selectedPaths.length} scope location{selectedPaths.length === 1 ? '' : 's'} active</span>
          </div>
        </div>
      )}
    </div>
  );
}
