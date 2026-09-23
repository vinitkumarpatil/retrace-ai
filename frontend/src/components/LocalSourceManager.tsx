'use client';

import React, { useState, useEffect, useCallback } from 'react';
import {
  FolderOpen,
  FileText,
  HardDrive,
  Shield,
  CheckCircle2,
  AlertCircle,
  Loader2,
  RefreshCw,
  Trash2,
  ChevronRight,
  ChevronDown,
  Search,
  Wifi,
  WifiOff,
} from 'lucide-react';
import { LocalSource, getAllSources, getFilesBySource } from '@/lib/local-storage';
import {
  selectDirectory,
  traverseDirectory,
  getSourcePermissionStatus,
  setSourcePermissionStatus,
} from '@/lib/file-system-access';
import { indexConnectedFolder, removeSource, IndexProgress } from '@/lib/local-indexer';
import { getLocalSourceSummary } from '@/lib/local-search';

interface LocalSourceManagerProps {
  isOpen: boolean;
  onClose: () => void;
  onSourcesChanged: () => void;
}

interface SourceWithFiles extends LocalSource {
  files?: { name: string; path: string; extension: string; status: string }[];
  expanded?: boolean;
}

export default function LocalSourceManager({ isOpen, onClose, onSourcesChanged }: LocalSourceManagerProps) {
  const [permissionGranted, setPermissionGranted] = useState(false);
  const [sources, setSources] = useState<SourceWithFiles[]>([]);
  const [isConnecting, setIsConnecting] = useState(false);
  const [progress, setProgress] = useState<IndexProgress | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [isOnline, setIsOnline] = useState(true);

  useEffect(() => {
    setPermissionGranted(getSourcePermissionStatus());
    setIsOnline(navigator.onLine);

    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  const loadSources = useCallback(async () => {
    try {
      const summaries = await getLocalSourceSummary();
      setSources(summaries.map(s => ({ ...s, expanded: false })));
    } catch (e) {
      console.warn('Failed to load sources:', e);
    }
  }, []);

  useEffect(() => {
    if (isOpen) loadSources();
  }, [isOpen, loadSources]);

  if (!isOpen) return null;

  const handleAllowAccess = async () => {
    try {
      const result = await selectDirectory();
      if (!result) return;

      setPermissionGranted(true);
      setSourcePermissionStatus(true);
      setIsConnecting(true);
      setError(null);

      const source = await indexConnectedFolder(
        result.handle,
        result.name,
        (p) => setProgress(p)
      );

      setIsConnecting(false);
      setProgress(null);
      onSourcesChanged();
      await loadSources();
    } catch (e: any) {
      setIsConnecting(false);
      setProgress(null);
      setError(e.message || 'Failed to connect folder');
    }
  };

  const handleConnectMore = async () => {
    try {
      const result = await selectDirectory();
      if (!result) return;

      setIsConnecting(true);
      setError(null);

      await indexConnectedFolder(
        result.handle,
        result.name,
        (p) => setProgress(p)
      );

      setIsConnecting(false);
      setProgress(null);
      onSourcesChanged();
      await loadSources();
    } catch (e: any) {
      setIsConnecting(false);
      setProgress(null);
      setError(e.message || 'Failed to connect folder');
    }
  };

  const handleReindex = async (source: SourceWithFiles) => {
    try {
      if (!('showDirectoryPicker' in window)) return;

      const handle = await (window as any).showDirectoryPicker({ mode: 'read' });
      setIsConnecting(true);
      setError(null);

      await indexConnectedFolder(
        handle,
        source.name,
        (p) => setProgress(p),
        source.id
      );

      setIsConnecting(false);
      setProgress(null);
      onSourcesChanged();
      await loadSources();
    } catch (e: any) {
      if (e.name !== 'AbortError') {
        setIsConnecting(false);
        setProgress(null);
        setError(e.message || 'Failed to re-index');
      }
    }
  };

  const handleRemoveSource = async (sourceId: string) => {
    try {
      await removeSource(sourceId);
      onSourcesChanged();
      await loadSources();
    } catch (e: any) {
      setError(e.message || 'Failed to remove source');
    }
  };

  const toggleExpand = async (sourceId: string) => {
    setSources(prev => prev.map(s => {
      if (s.id === sourceId) {
        return { ...s, expanded: !s.expanded };
      }
      return s;
    }));
  };

  const filteredSources = sources.filter(s =>
    !searchQuery || s.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-900/50 backdrop-blur-xs">
      <div className="w-full max-w-2xl bg-white border border-[#E2DDD5] rounded-md shadow-xl overflow-hidden relative corner-ticks flex flex-col max-h-[85vh]">

        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-[#E2DDD5] bg-[#FAF8F5]">
          <div className="flex items-center space-x-2">
            <HardDrive className="w-4 h-4 text-stone-700" />
            <h2 className="text-xs font-mono font-bold text-stone-900 uppercase tracking-wider">
              LOCAL SOURCES
            </h2>
            <span className={`text-[10px] font-mono px-1.5 py-0.5 rounded flex items-center gap-1 ${
              isOnline
                ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                : 'bg-amber-50 text-amber-700 border border-amber-200'
            }`}>
              {isOnline ? <Wifi className="w-2.5 h-2.5" /> : <WifiOff className="w-2.5 h-2.5" />}
              {isOnline ? 'ONLINE' : 'OFFLINE'}
            </span>
          </div>
          <button onClick={onClose} className="text-stone-400 hover:text-stone-700 p-1 rounded">
            <span className="sr-only">Close</span>
            <span className="text-lg">&times;</span>
          </button>
        </div>

        {/* Body */}
        <div className="p-6 overflow-y-auto flex-1">

          {/* Permission Gate */}
          {!permissionGranted && !isConnecting && (
            <div className="text-center py-8">
              <div className="w-16 h-16 rounded-full bg-amber-50 border border-amber-200 text-amber-600 flex items-center justify-center mx-auto mb-4">
                <Shield className="w-8 h-8" />
              </div>
              <h3 className="text-sm font-mono font-bold text-stone-900 uppercase tracking-wider mb-2">
                Connect Local Storage
              </h3>
              <p className="text-xs text-stone-600 font-sans max-w-md mx-auto mb-4 leading-relaxed">
                ReTrace can access files and folders that you explicitly choose on this computer.
                Your files are processed locally when possible.
              </p>
              <div className="flex items-center justify-center gap-2 mb-4 text-[10px] font-mono text-stone-500">
                <span>🔒 Processed locally</span>
                <span>•</span>
                <span>🔒 Not uploaded automatically</span>
              </div>
              <div className="flex justify-center gap-3">
                <button
                  onClick={handleAllowAccess}
                  className="px-5 py-2.5 bg-[#1E293B] hover:bg-stone-800 text-white rounded text-xs font-mono font-semibold flex items-center space-x-2 transition-all shadow-xs"
                >
                  <FolderOpen className="w-4 h-4 text-amber-300" />
                  <span>Allow Local File Access</span>
                </button>
                <button
                  onClick={onClose}
                  className="px-5 py-2.5 bg-white hover:bg-stone-50 border border-[#E2DDD5] text-stone-700 rounded text-xs font-mono font-semibold transition-all shadow-xs"
                >
                  Not Now
                </button>
              </div>
            </div>
          )}

          {/* Indexing Progress */}
          {isConnecting && progress && (
            <div className="py-6">
              <div className="text-center mb-4">
                <Loader2 className="w-8 h-8 text-amber-500 animate-spin mx-auto mb-2" />
                <h3 className="text-sm font-mono font-bold text-stone-900 uppercase tracking-wider">
                  {progress.status === 'scanning' ? 'SCANNING FOLDER...' : 'INDEXING FILES...'}
                </h3>
                <p className="text-xs font-mono text-stone-500 mt-1">
                  {progress.currentFile || 'Preparing...'}
                </p>
              </div>
              {progress.total > 0 && (
                <div className="max-w-md mx-auto">
                  <div className="flex justify-between text-[10px] font-mono text-stone-500 mb-1">
                    <span>{progress.processed} / {progress.total} files</span>
                    <span>{Math.round((progress.processed / progress.total) * 100)}%</span>
                  </div>
                  <div className="w-full h-2 bg-stone-100 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-amber-500 rounded-full transition-all duration-300"
                      style={{ width: `${(progress.processed / progress.total) * 100}%` }}
                    />
                  </div>
                  <div className="flex justify-between text-[10px] font-mono text-stone-400 mt-1">
                    <span>{progress.skipped} unchanged</span>
                    <span>{progress.failed} failed</span>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Connected Sources */}
          {permissionGranted && !isConnecting && (
            <div className="space-y-4">
              {/* Actions bar */}
              <div className="flex items-center justify-between gap-3">
                <div className="flex-1 relative">
                  <Search className="w-3.5 h-3.5 text-stone-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search sources..."
                    className="w-full pl-9 pr-3 py-2 bg-[#FAF8F5] border border-[#E2DDD5] rounded text-xs font-mono text-stone-900 focus:outline-none focus:border-amber-500"
                  />
                </div>
                <button
                  onClick={handleConnectMore}
                  className="px-4 py-2 bg-[#1E293B] hover:bg-stone-800 text-white rounded text-xs font-mono font-semibold flex items-center space-x-1.5 transition-all shadow-xs whitespace-nowrap"
                >
                  <FolderOpen className="w-3.5 h-3.5 text-amber-300" />
                  <span>+ Connect Folder</span>
                </button>
              </div>

              {/* Sources list */}
              {filteredSources.length === 0 ? (
                <div className="text-center py-8 text-xs font-mono text-stone-400">
                  No connected sources yet.
                </div>
              ) : (
                filteredSources.map((source) => (
                  <div
                    key={source.id}
                    className="border border-[#E2DDD5] rounded-md overflow-hidden"
                  >
                    {/* Source header */}
                    <div className="flex items-center justify-between p-3 bg-[#FAF8F5] hover:bg-stone-50">
                      <div className="flex items-center space-x-3 flex-1 min-w-0">
                        <button
                          onClick={() => toggleExpand(source.id)}
                          className="text-stone-400 hover:text-stone-700 shrink-0"
                        >
                          {source.expanded ? (
                            <ChevronDown className="w-4 h-4" />
                          ) : (
                            <ChevronRight className="w-4 h-4" />
                          )}
                        </button>
                        <FolderOpen className="w-5 h-5 text-amber-500 shrink-0" />
                        <div className="min-w-0">
                          <h4 className="text-xs font-mono font-bold text-stone-900 truncate">
                            {source.name}
                          </h4>
                          <p className="text-[10px] font-mono text-stone-500">
                            {source.indexedCount} files indexed
                            {source.lastIndexed && ` • ${timeAgo(source.lastIndexed)}`}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-1.5 shrink-0 ml-2">
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
                        <button
                          onClick={() => handleReindex(source)}
                          className="p-1.5 text-stone-400 hover:text-amber-600 rounded transition-colors"
                          title="Re-index"
                        >
                          <RefreshCw className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => handleRemoveSource(source.id)}
                          className="p-1.5 text-stone-400 hover:text-rose-600 rounded transition-colors"
                          title="Disconnect source"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>

                    {/* Expanded file tree */}
                    {source.expanded && (
                      <div className="border-t border-[#E2DDD5] p-3 bg-white max-h-48 overflow-y-auto">
                        <SourceFileTree sourceId={source.id} />
                      </div>
                    )}
                  </div>
                ))
              )}
            </div>
          )}

          {/* Error */}
          {error && (
            <div className="mt-4 p-3 rounded text-xs font-mono flex items-center space-x-2 bg-rose-50 text-rose-800 border border-rose-200">
              <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
              <span>{error}</span>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-3 border-t border-[#E2DDD5] bg-[#FAF8F5] flex items-center justify-between">
          <div className="text-[10px] font-mono text-stone-500">
            {sources.length} connected source{sources.length !== 1 ? 's' : ''} • {sources.reduce((sum, s) => sum + s.indexedCount, 0)} total files
          </div>
          <button
            onClick={onClose}
            className="px-4 py-1.5 text-xs font-mono bg-white border border-[#E2DDD5] hover:bg-stone-50 rounded text-stone-700 shadow-xs"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}

function SourceFileTree({ sourceId }: { sourceId: string }) {
  const [files, setFiles] = useState<{ name: string; path: string; extension: string; status: string }[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const allFiles = await getFilesBySource(sourceId);
        setFiles(allFiles.map(f => ({
          name: f.fileName,
          path: f.relativePath,
          extension: f.extension,
          status: f.status,
        })));
      } catch {
        // ignore
      } finally {
        setLoading(false);
      }
    })();
  }, [sourceId]);

  if (loading) {
    return <div className="text-[10px] font-mono text-stone-400 py-2">Loading files...</div>;
  }

  // Build tree structure
  const tree = buildFileTree(files);

  return (
    <div className="text-[11px] font-mono text-stone-700">
      {renderTree(tree, 0)}
    </div>
  );
}

interface TreeNode {
  name: string;
  isDir: boolean;
  children: TreeNode[];
  status?: string;
  extension?: string;
}

function buildFileTree(files: { name: string; path: string; extension: string; status: string }[]): TreeNode[] {
  const root: TreeNode[] = [];

  for (const file of files) {
    const parts = file.path.split('/');
    let current = root;

    for (let i = 0; i < parts.length; i++) {
      const part = parts[i];
      const isLast = i === parts.length - 1;

      let existing = current.find(n => n.name === part);
      if (!existing) {
        existing = {
          name: part,
          isDir: !isLast,
          children: [],
          status: isLast ? file.status : undefined,
          extension: isLast ? file.extension : undefined,
        };
        current.push(existing);
      }
      current = existing.children;
    }
  }

  return root;
}

function renderTree(nodes: TreeNode[], depth: number): React.ReactNode {
  return nodes.map((node, i) => (
    <div key={`${depth}-${i}`} style={{ paddingLeft: `${depth * 16}px` }}>
      <div className="flex items-center gap-1.5 py-0.5 hover:bg-stone-50 rounded">
        {node.isDir ? (
          <FolderOpen className="w-3 h-3 text-amber-500 shrink-0" />
        ) : (
          <FileText className="w-3 h-3 text-stone-400 shrink-0" />
        )}
        <span className={`truncate ${node.isDir ? 'font-semibold' : ''}`}>
          {node.name}
        </span>
        {node.status === 'indexed' && !node.isDir && (
          <CheckCircle2 className="w-2.5 h-2.5 text-emerald-500 shrink-0" />
        )}
        {node.status === 'failed' && !node.isDir && (
          <AlertCircle className="w-2.5 h-2.5 text-rose-500 shrink-0" />
        )}
      </div>
      {node.children.length > 0 && renderTree(node.children, depth + 1)}
    </div>
  ));
}

function timeAgo(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return 'just now';
  if (mins < 60) return `${mins}m ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  return `${days}d ago`;
}
