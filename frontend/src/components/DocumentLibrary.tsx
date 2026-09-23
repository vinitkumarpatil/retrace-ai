'use client';

import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
  X,
  FileText,
  Calendar,
  Database,
  FolderOpen,
  Globe,
  Tag,
  Music,
  Search,
  HardDrive,
  CheckCircle2,
  AlertCircle,
  RefreshCw,
  Trash2,
  ChevronRight,
  ChevronDown,
  Wifi,
  WifiOff,
  Shield,
  Smartphone,
  Loader2,
  HardDriveDownload,
} from 'lucide-react';
import { DocumentItem } from '@/lib/types';
import { LocalSource, getAllSources, getFilesBySource, deleteSource, deleteFilesBySource } from '@/lib/local-storage';
import { getLocalSourceSummary } from '@/lib/local-search';
import { selectDirectory, getSourcePermissionStatus, setSourcePermissionStatus } from '@/lib/file-system-access';
import { indexConnectedFolder, IndexProgress } from '@/lib/local-indexer';
import { useTheme } from '@/components/ThemeProvider';

interface DocumentLibraryProps {
  isOpen: boolean;
  onClose: () => void;
  documents: DocumentItem[];
  onOpenLocalManager: () => void;
  localSources: LocalSourceSummary[];
  onLocalSourcesChanged: () => void;
}

interface LocalSourceSummary extends LocalSource {
  indexedCount: number;
  totalFiles: number;
  expanded?: boolean;
}

// Detect Android
function isAndroid(): boolean {
  if (typeof navigator === 'undefined') return false;
  return /Android/i.test(navigator.userAgent);
}

// Detect File System Access API support
function hasFileSystemAccess(): boolean {
  return typeof window !== 'undefined' && 'showDirectoryPicker' in window;
}

export default function DocumentLibrary({
  isOpen,
  onClose,
  documents,
  onOpenLocalManager,
  localSources,
  onLocalSourcesChanged,
}: DocumentLibraryProps) {
  const { isDark } = useTheme();
  const [tab, setTab] = useState<'remote' | 'local'>('local');
  const [searchQuery, setSearchQuery] = useState('');
  const [expandedSources, setExpandedSources] = useState<Set<string>>(new Set());
  const [sourceFiles, setSourceFiles] = useState<Record<string, { name: string; path: string; extension: string; status: string }[]>>({});
  const [isOnline, setIsOnline] = useState(true);
  const [loadingFiles, setLoadingFiles] = useState<string | null>(null);

  // Inline indexing state
  const [permissionGranted, setPermissionGranted] = useState(false);
  const [isIndexing, setIsIndexing] = useState(false);
  const [indexProgress, setIndexProgress] = useState<IndexProgress | null>(null);
  const [indexError, setIndexError] = useState<string | null>(null);
  const [localSourcesInternal, setLocalSourcesInternal] = useState<LocalSourceSummary[]>(localSources);

  const android = isAndroid();
  const hasAPI = hasFileSystemAccess();

  useEffect(() => {
    setLocalSourcesInternal(localSources);
  }, [localSources]);

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

  const reloadLocalSources = useCallback(async () => {
    try {
      const summaries = await getLocalSourceSummary();
      setLocalSourcesInternal(summaries as LocalSourceSummary[]);
      onLocalSourcesChanged();
    } catch { /* ignore */ }
  }, [onLocalSourcesChanged]);

  const loadSourceFiles = useCallback(async (sourceId: string) => {
    try {
      setLoadingFiles(sourceId);
      const files = await getFilesBySource(sourceId);
      setSourceFiles(prev => ({
        ...prev,
        [sourceId]: files.map(f => ({
          name: f.fileName,
          path: f.relativePath,
          extension: f.extension,
          status: f.status,
        })),
      }));
    } catch { /* ignore */ }
    finally { setLoadingFiles(null); }
  }, []);

  const toggleSourceExpand = async (sourceId: string) => {
    const newExpanded = new Set(expandedSources);
    if (newExpanded.has(sourceId)) {
      newExpanded.delete(sourceId);
    } else {
      newExpanded.add(sourceId);
      if (!sourceFiles[sourceId]) await loadSourceFiles(sourceId);
    }
    setExpandedSources(newExpanded);
  };

  const handleRemoveSource = async (sourceId: string) => {
    try {
      await deleteFilesBySource(sourceId);
      await deleteSource(sourceId);
      await reloadLocalSources();
    } catch { /* ignore */ }
  };

  // ── Inline Connect: one-click PC access ──────────────────────
  const handleConnectPC = async () => {
    if (!hasAPI) return;
    setIndexError(null);
    try {
      const result = await selectDirectory();
      if (!result) return;
      setPermissionGranted(true);
      setSourcePermissionStatus(true);
      setIsIndexing(true);
      await indexConnectedFolder(result.handle, result.name, (p) => setIndexProgress(p));
      setIsIndexing(false);
      setIndexProgress(null);
      await reloadLocalSources();
    } catch (e: any) {
      setIsIndexing(false);
      setIndexProgress(null);
      if (e.name !== 'AbortError') setIndexError(e.message || 'Failed to connect');
    }
  };

  // ── Android fallback: file input ───────────────────────────
  const fileInputRef = useRef<HTMLInputElement>(null);
  const handleAndroidFolderPick = () => {
    if (fileInputRef.current) fileInputRef.current.click();
  };
  const handleAndroidFiles = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;
    setIndexError(null);
    setIsIndexing(true);
    // Simulate progress for the user
    setIndexProgress({ status: 'indexing', processed: 0, total: files.length, skipped: 0, failed: 0, unsupported: 0, currentFile: 'Preparing...' });

    try {
      const firstFile = files[0];
      const rel = (firstFile as any).webkitRelativePath || firstFile.name;
      const root = rel.split('/')[0] || 'Uploaded';
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

      let processed = 0, skipped = 0, failed = 0;
      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        setIndexProgress({ status: 'indexing', processed: i, total: files.length, skipped, failed, unsupported: 0, currentFile: file.name });
        const fd = new FormData();
        fd.append('file', file);
        fd.append('project', root);
        fd.append('relative_path', (file as any).webkitRelativePath || file.name);
        try {
          const res = await fetch(`${apiUrl}/api/ingest/file`, { method: 'POST', body: fd });
          if (res.ok) {
            const d = await res.json();
            d.is_duplicate ? skipped++ : processed++;
          } else { failed++; }
        } catch { failed++; }
      }
      setIndexError(`✓ Indexed: ${processed} • Skipped: ${skipped} • Failed: ${failed}`);
      onLocalSourcesChanged();
    } catch (e: any) {
      setIndexError(e.message || 'Upload failed');
    } finally {
      setIsIndexing(false);
      setIndexProgress(null);
    }
  };

  if (!isOpen) return null;

  const filteredRemoteDocs = documents.filter(d =>
    !searchQuery || d.title.toLowerCase().includes(searchQuery.toLowerCase())
  );
  const filteredLocalSources = localSourcesInternal.filter(s =>
    !searchQuery || s.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const cardStyle = { backgroundColor: isDark ? '#111827' : '#FFFFFF', borderColor: 'var(--border-blueprint)' };
  const bgStyle  = { backgroundColor: isDark ? '#0F1C2E' : '#FAF8F5' };
  const textPrimary   = { color: 'var(--ink-primary)' };
  const textSecondary = { color: 'var(--ink-secondary)' };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4" style={{ backgroundColor: 'rgba(0,0,0,0.55)', backdropFilter: 'blur(4px)' }}>
      <div className="w-full max-w-3xl rounded-md shadow-xl overflow-hidden relative corner-ticks flex flex-col" style={{ ...cardStyle, border: '1px solid', maxHeight: '90vh' }}>

        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b shrink-0" style={{ ...bgStyle, borderColor: 'var(--border-blueprint)' }}>
          <div className="flex items-center space-x-2">
            <Database className="w-4 h-4" style={textPrimary} />
            <h2 className="text-xs font-mono font-bold uppercase tracking-wider" style={textPrimary}>
              DOCUMENTS ({documents.length + localSourcesInternal.length} sources)
            </h2>
            <span className={`text-[10px] font-mono px-1.5 py-0.5 rounded flex items-center gap-1 ${
              isOnline ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : 'bg-amber-50 text-amber-700 border border-amber-200'
            }`}>
              {isOnline ? <Wifi className="w-2.5 h-2.5" /> : <WifiOff className="w-2.5 h-2.5" />}
              {isOnline ? 'LOCAL + CLOUD' : 'LOCAL MODE'}
            </span>
          </div>
          <button onClick={onClose} className="p-1 rounded hover:opacity-70" style={textSecondary} aria-label="Close">
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Tabs */}
        <div className="flex border-b shrink-0 text-xs font-mono" style={{ ...bgStyle, borderColor: 'var(--border-blueprint)' }}>
          <button
            onClick={() => setTab('local')}
            className={`flex-1 py-2.5 px-4 text-center border-r flex items-center justify-center space-x-1.5 transition-colors ${
              tab === 'local' ? 'font-bold border-b-2 border-b-amber-500' : 'hover:opacity-80'
            }`}
            style={{
              ...textPrimary,
              borderColor: 'var(--border-blueprint)',
              backgroundColor: tab === 'local' ? 'var(--card-bg)' : 'transparent',
            }}
          >
            <HardDrive className="w-3.5 h-3.5" />
            <span>Local Sources ({localSourcesInternal.length})</span>
          </button>
          <button
            onClick={() => setTab('remote')}
            className={`flex-1 py-2.5 px-4 text-center flex items-center justify-center space-x-1.5 transition-colors ${
              tab === 'remote' ? 'font-bold border-b-2 border-b-amber-500' : 'hover:opacity-80'
            }`}
            style={{
              ...textPrimary,
              backgroundColor: tab === 'remote' ? 'var(--card-bg)' : 'transparent',
            }}
          >
            <Globe className="w-3.5 h-3.5" />
            <span>Uploaded ({documents.length})</span>
          </button>
        </div>

        {/* Body */}
        <div className="p-4 sm:p-6 overflow-y-auto flex-1">
          {/* Search */}
          <div className="mb-4 relative">
            <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2" style={textSecondary} />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={`Search ${tab === 'local' ? 'sources' : 'documents'}...`}
              className="w-full pl-9 pr-3 py-2 border rounded text-xs font-mono focus:outline-none focus:border-amber-500"
              style={{ backgroundColor: 'var(--input-bg)', borderColor: 'var(--border-blueprint)', color: 'var(--ink-primary)' }}
            />
          </div>

          {/* ── LOCAL TAB ─────────────────────────────────────── */}
          {tab === 'local' && (
            <div className="space-y-3">

              {/* Indexing Progress */}
              {isIndexing && indexProgress && (
                <div className="p-4 rounded border" style={{ backgroundColor: 'var(--input-bg)', borderColor: 'var(--border-blueprint)' }}>
                  <div className="flex items-center gap-2 mb-2">
                    <Loader2 className="w-4 h-4 text-amber-500 animate-spin" />
                    <span className="text-xs font-mono font-bold uppercase" style={textPrimary}>
                      {indexProgress.status === 'scanning' ? 'Scanning...' : 'Indexing Files...'}
                    </span>
                  </div>
                  <p className="text-[10px] font-mono truncate mb-2" style={textSecondary}>
                    {indexProgress.currentFile || 'Preparing...'}
                  </p>
                  {indexProgress.total > 0 && (
                    <>
                      <div className="w-full h-1.5 rounded-full overflow-hidden mb-1" style={{ backgroundColor: 'var(--border-blueprint)' }}>
                        <div
                          className="h-full bg-amber-500 rounded-full transition-all duration-300"
                          style={{ width: `${(indexProgress.processed / indexProgress.total) * 100}%` }}
                        />
                      </div>
                      <div className="flex justify-between text-[10px] font-mono" style={textSecondary}>
                        <span>{indexProgress.processed} / {indexProgress.total}</span>
                        <span>{Math.round((indexProgress.processed / indexProgress.total) * 100)}%</span>
                      </div>
                    </>
                  )}
                </div>
              )}

              {/* Error / success message */}
              {indexError && (
                <div className={`p-3 rounded border text-xs font-mono flex items-center gap-2 ${
                  indexError.startsWith('✓')
                    ? 'bg-emerald-50 border-emerald-200 text-emerald-800'
                    : 'bg-rose-50 border-rose-200 text-rose-800'
                }`}>
                  {indexError.startsWith('✓') ? <CheckCircle2 className="w-4 h-4 shrink-0" /> : <AlertCircle className="w-4 h-4 shrink-0" />}
                  {indexError}
                </div>
              )}

              {/* ── ANDROID FALLBACK ── */}
              {android && (
                <div className="p-4 rounded border text-center" style={{ backgroundColor: 'var(--input-bg)', borderColor: 'var(--border-blueprint)' }}>
                  <Smartphone className="w-8 h-8 mx-auto mb-2 text-amber-500" />
                  <p className="text-xs font-mono font-bold mb-1" style={textPrimary}>MOBILE MODE</p>
                  <p className="text-[11px] font-mono mb-3" style={textSecondary}>
                    Direct folder access isn't supported on Android browsers. Use the upload option below.
                  </p>
                  <input
                    ref={fileInputRef}
                    type="file"
                    multiple
                    accept=".pdf,.txt,.md,.json,.csv,.py,.js,.ts,.html,.css,.xml,.yml,.yaml"
                    onChange={handleAndroidFiles}
                    className="hidden"
                  />
                  <button
                    onClick={handleAndroidFolderPick}
                    disabled={isIndexing}
                    className="px-4 py-2 bg-amber-500 hover:bg-amber-600 text-white rounded text-xs font-mono font-semibold flex items-center gap-2 mx-auto transition-all"
                  >
                    <HardDriveDownload className="w-4 h-4" />
                    Upload Files
                  </button>
                </div>
              )}

              {/* ── PC: ONE-CLICK ACCESS ── */}
              {!android && !isIndexing && (
                <div>
                  {!permissionGranted ? (
                    /* Permission Gate */
                    <div className="p-6 rounded border-2 border-dashed text-center mb-3" style={{ borderColor: 'var(--border-blueprint)' }}>
                      <Shield className="w-10 h-10 mx-auto mb-3 text-amber-500" />
                      <h3 className="text-sm font-mono font-bold uppercase tracking-wider mb-1" style={textPrimary}>
                        Connect Local Storage
                      </h3>
                      <p className="text-xs font-sans mb-3 max-w-xs mx-auto leading-relaxed" style={textSecondary}>
                        One-click access to any folder on this PC. Your files are read locally — nothing uploaded without your consent.
                      </p>
                      <div className="flex items-center justify-center gap-3">
                        {hasAPI ? (
                          <button
                            onClick={handleConnectPC}
                            className="px-5 py-2.5 bg-[#1E293B] hover:bg-stone-800 text-white rounded text-xs font-mono font-semibold flex items-center gap-2 transition-all shadow-sm"
                          >
                            <FolderOpen className="w-4 h-4 text-amber-300" />
                            Allow &amp; Connect Folder
                          </button>
                        ) : (
                          <p className="text-xs font-mono text-rose-600">
                            ⚠ Use Chrome, Edge, or Opera for local folder access.
                          </p>
                        )}
                      </div>
                    </div>
                  ) : (
                    /* Already permitted — show Connect More */
                    hasAPI && (
                      <button
                        onClick={handleConnectPC}
                        className="w-full p-3 border-2 border-dashed rounded-md text-center transition-colors flex items-center justify-center space-x-2 mb-3"
                        style={{ borderColor: 'var(--border-blueprint)', backgroundColor: 'var(--input-bg)' }}
                      >
                        <FolderOpen className="w-4 h-4 text-amber-500" />
                        <span className="text-xs font-mono font-semibold" style={textPrimary}>
                          + Connect Another Folder
                        </span>
                      </button>
                    )
                  )}
                </div>
              )}

              {/* Sources list */}
              {filteredLocalSources.length === 0 && permissionGranted && !isIndexing && (
                <div className="text-center py-8">
                  <Shield className="w-8 h-8 mx-auto mb-2" style={{ color: 'var(--border-blueprint)' }} />
                  <p className="text-xs font-mono" style={textSecondary}>
                    {localSourcesInternal.length === 0
                      ? 'No connected sources yet. Click "Connect" above to begin.'
                      : 'No sources match your search.'}
                  </p>
                </div>
              )}

              {filteredLocalSources.map((source) => (
                <div key={source.id} className="border rounded-md overflow-hidden" style={{ borderColor: 'var(--border-blueprint)' }}>
                  <div className="flex items-center justify-between p-3" style={bgStyle}>
                    <div className="flex items-center space-x-3 flex-1 min-w-0">
                      <button
                        onClick={() => toggleSourceExpand(source.id)}
                        className="shrink-0 hover:opacity-70"
                        style={textSecondary}
                      >
                        {expandedSources.has(source.id)
                          ? <ChevronDown className="w-4 h-4" />
                          : <ChevronRight className="w-4 h-4" />}
                      </button>
                      <FolderOpen className="w-5 h-5 text-amber-500 shrink-0" />
                      <div className="min-w-0">
                        <h4 className="text-xs font-mono font-bold truncate" style={textPrimary}>{source.name}</h4>
                        <p className="text-[10px] font-mono" style={textSecondary}>
                          {source.indexedCount} files indexed
                          {source.lastIndexed && ` • ${timeAgo(source.lastIndexed)}`}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-1.5 shrink-0 ml-2">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
                      <button
                        onClick={() => handleRemoveSource(source.id)}
                        className="p-1.5 rounded transition-colors hover:text-rose-600"
                        style={textSecondary}
                        title="Disconnect source"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>

                  {expandedSources.has(source.id) && (
                    <div className="border-t p-3 max-h-64 overflow-y-auto" style={{ borderColor: 'var(--border-blueprint)', backgroundColor: 'var(--card-bg)' }}>
                      {loadingFiles === source.id ? (
                        <div className="text-[10px] font-mono py-2" style={textSecondary}>Loading files...</div>
                      ) : sourceFiles[source.id] ? (
                        <FileTree files={sourceFiles[source.id]} isDark={isDark} />
                      ) : (
                        <div className="text-[10px] font-mono py-2" style={textSecondary}>No files loaded</div>
                      )}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}

          {/* ── REMOTE/UPLOADED TAB ───────────────────────────── */}
          {tab === 'remote' && (
            <div className="space-y-3">
              {filteredRemoteDocs.length === 0 ? (
                <div className="text-center py-8">
                  <FileText className="w-8 h-8 mx-auto mb-2" style={{ color: 'var(--border-blueprint)' }} />
                  <p className="text-xs font-mono" style={textSecondary}>
                    {documents.length === 0
                      ? 'No uploaded documents. Use "Ingest Document" in the navbar to upload files.'
                      : 'No documents match your search.'}
                  </p>
                </div>
              ) : (
                filteredRemoteDocs.map((doc) => (
                  <div
                    key={doc.id}
                    className="p-4 rounded border transition-colors"
                    style={{ backgroundColor: 'var(--input-bg)', borderColor: 'var(--border-blueprint)' }}
                  >
                    <div className="flex items-center justify-between gap-2 mb-1.5">
                      <div className="flex items-center space-x-2">
                        {getSourceIcon(doc.source_type)}
                        <h3 className="text-xs font-bold font-mono truncate" style={textPrimary}>{doc.title}</h3>
                      </div>
                      <div className="flex items-center gap-1.5">
                        {doc.project && (
                          <span className="text-[10px] font-mono uppercase px-1.5 py-0.5 rounded bg-sky-50 border border-sky-200 text-sky-700 font-semibold flex items-center gap-1">
                            <Tag className="w-2.5 h-2.5" />{doc.project}
                          </span>
                        )}
                        <span className="text-[10px] font-mono uppercase px-2 py-0.5 rounded border" style={{ backgroundColor: 'var(--input-bg)', borderColor: 'var(--border-blueprint)', color: 'var(--ink-secondary)' }}>
                          {doc.source_type}
                        </span>
                      </div>
                    </div>

                    <p className="text-xs font-sans line-clamp-2 mb-2" style={textSecondary}>{doc.content_preview}</p>

                    {(doc.path || doc.url) && (
                      <div className="flex items-center gap-3 mb-2 text-[11px] font-mono" style={textSecondary}>
                        {doc.path && (
                          <span className="flex items-center gap-1">
                            <FolderOpen className="w-3 h-3" />
                            <span className="truncate max-w-[200px]">{doc.path}</span>
                          </span>
                        )}
                        {doc.url && (
                          <a href={doc.url} target="_blank" rel="noopener noreferrer"
                            className="flex items-center gap-1 text-sky-600 hover:underline">
                            <Globe className="w-3 h-3" />
                            <span className="truncate max-w-[200px]">{doc.url}</span>
                          </a>
                        )}
                      </div>
                    )}

                    <div className="flex items-center space-x-4 text-[11px] font-mono pt-2 border-t border-dashed" style={{ borderColor: 'var(--border-blueprint)', color: 'var(--ink-secondary)' }}>
                      <span className="flex items-center space-x-1">
                        <Calendar className="w-3 h-3" />
                        <span>{new Date(doc.created_at).toLocaleDateString()}</span>
                      </span>
                      <span>Entities: {doc.entity_count || 0}</span>
                      <span>Milestones: {doc.event_count || 0}</span>
                    </div>
                  </div>
                ))
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-3 border-t flex items-center justify-between shrink-0" style={{ ...bgStyle, borderColor: 'var(--border-blueprint)' }}>
          <div className="text-[10px] font-mono" style={textSecondary}>
            {localSourcesInternal.length} local source{localSourcesInternal.length !== 1 ? 's' : ''} • {documents.length} uploaded
          </div>
          <button
            onClick={onClose}
            className="px-4 py-1.5 text-xs font-mono rounded border shadow-xs transition-colors hover:opacity-80"
            style={{ backgroundColor: 'var(--card-bg)', borderColor: 'var(--border-blueprint)', color: 'var(--ink-primary)' }}
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}

function getSourceIcon(sourceType: string) {
  switch (sourceType) {
    case 'audio': return <Music className="w-4 h-4 text-stone-500 shrink-0" />;
    case 'pdf':   return <FileText className="w-4 h-4 text-stone-500 shrink-0" />;
    case 'url':   return <Globe className="w-4 h-4 text-stone-500 shrink-0" />;
    default:      return <FileText className="w-4 h-4 text-stone-500 shrink-0" />;
  }
}

interface TreeNode {
  name: string;
  isDir: boolean;
  children: TreeNode[];
  status?: string;
}

function FileTree({ files, isDark }: { files: { name: string; path: string; extension: string; status: string }[]; isDark: boolean }) {
  const tree = buildTree(files);
  return (
    <div className="text-[11px] font-mono" style={{ color: 'var(--ink-primary)' }}>
      {renderTreeNode(tree, 0)}
    </div>
  );
}

function buildTree(files: { name: string; path: string; extension: string; status: string }[]): TreeNode[] {
  const root: TreeNode[] = [];
  for (const file of files) {
    const parts = file.path.split('/');
    let current = root;
    for (let i = 0; i < parts.length; i++) {
      const part = parts[i];
      const isLast = i === parts.length - 1;
      let existing = current.find(n => n.name === part);
      if (!existing) {
        existing = { name: part, isDir: !isLast, children: [], status: isLast ? file.status : undefined };
        current.push(existing);
      }
      current = existing.children;
    }
  }
  return root;
}

function renderTreeNode(nodes: TreeNode[], depth: number): React.ReactNode {
  return nodes.map((node, i) => (
    <div key={`${depth}-${i}`} style={{ paddingLeft: `${depth * 14}px` }}>
      <div className="flex items-center gap-1.5 py-0.5 rounded hover:opacity-80">
        {node.isDir
          ? <FolderOpen className="w-3 h-3 text-amber-500 shrink-0" />
          : <FileText className="w-3 h-3 shrink-0" style={{ color: 'var(--ink-secondary)' }} />}
        <span className={`truncate ${node.isDir ? 'font-semibold' : ''}`}>{node.name}</span>
        {node.status === 'indexed' && !node.isDir && <CheckCircle2 className="w-2.5 h-2.5 text-emerald-500 shrink-0" />}
        {node.status === 'failed'  && !node.isDir && <AlertCircle className="w-2.5 h-2.5 text-rose-500 shrink-0" />}
      </div>
      {node.children.length > 0 && renderTreeNode(node.children, depth + 1)}
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
  return `${Math.floor(hours / 24)}d ago`;
}
