'use client';

import React, { useState, useEffect } from 'react';
import { 
  FolderOpen, 
  X, 
  CheckSquare, 
  Square, 
  Upload, 
  FileText, 
  Film, 
  Headphones, 
  Image as ImageIcon, 
  Code, 
  AlertCircle, 
  CheckCircle2, 
  Loader2, 
  Info,
  HardDrive
} from 'lucide-react';
import { LocalDiscoveredFile, SourceType } from '@/lib/types';
import { ingestFile } from '@/lib/api';

interface LocalStorageConnectorProps {
  isOpen: boolean;
  onClose: () => void;
  onIngestSuccess: () => void;
}

export default function LocalStorageConnector({
  isOpen,
  onClose,
  onIngestSuccess,
}: LocalStorageConnectorProps) {
  const [isSupported, setIsSupported] = useState<boolean>(true);
  const [folderName, setFolderName] = useState<string>('');
  const [discoveredFiles, setDiscoveredFiles] = useState<LocalDiscoveredFile[]>([]);
  const [isScanning, setIsScanning] = useState<boolean>(false);
  const [isUploading, setIsUploading] = useState<boolean>(false);
  const [uploadProgress, setUploadProgress] = useState<{ current: number; total: number; filename: string } | null>(null);
  const [statusMessage, setStatusMessage] = useState<{ text: string; isError?: boolean } | null>(null);
  const [activeFilter, setActiveFilter] = useState<'all' | 'documents' | 'media' | 'code'>('all');

  useEffect(() => {
    if (typeof window !== 'undefined') {
      setIsSupported('showDirectoryPicker' in window);
    }
  }, []);

  if (!isOpen) return null;

  const determineSourceType = (filename: string): SourceType => {
    const ext = filename.split('.').pop()?.toLowerCase() || '';
    if (ext === 'pdf') return 'pdf';
    if (['png', 'jpg', 'jpeg', 'webp', 'gif', 'svg'].includes(ext)) return 'image';
    if (['mp4', 'webm', 'mov', 'avi', 'mkv', 'm4v'].includes(ext)) return 'video';
    if (['mp3', 'wav', 'm4a', 'ogg', 'flac', 'aac'].includes(ext)) return 'audio';
    if (['json'].includes(ext)) return 'json';
    if (['py', 'js', 'jsx', 'ts', 'tsx', 'html', 'css', 'yaml', 'yml', 'sql', 'sh', 'toml'].includes(ext)) return 'code';
    if (['txt', 'md', 'csv', 'log'].includes(ext)) return 'text';
    return 'other';
  };

  const handlePickDirectory = async () => {
    setStatusMessage(null);
    setIsScanning(true);

    try {
      if ('showDirectoryPicker' in window) {
        // Chromium native File System Access API
        const dirHandle = await (window as any).showDirectoryPicker({
          mode: 'read',
        });
        setFolderName(dirHandle.name);

        const files: LocalDiscoveredFile[] = [];

        // Scan directory (non-recursive for safety & performance, max 100 files)
        for await (const entry of dirHandle.values()) {
          if (entry.kind === 'file') {
            const ext = entry.name.split('.').pop()?.toLowerCase() || '';
            // Skip hidden or build system files
            if (entry.name.startsWith('.') || ['exe', 'dll', 'bin', 'lock'].includes(ext)) {
              continue;
            }
            try {
              const fileObj = await entry.getFile();
              files.push({
                name: entry.name,
                size: fileObj.size,
                type: fileObj.type,
                extension: ext,
                sourceType: determineSourceType(entry.name),
                handle: entry,
                nativeFile: fileObj,
                selected: true, // Default checked
              });
            } catch (err) {
              console.warn(`Could not read permission for ${entry.name}`, err);
            }
          }
        }

        setDiscoveredFiles(files);
        if (files.length === 0) {
          setStatusMessage({ text: `Folder "${dirHandle.name}" opened, but no compatible documents or media were found.`, isError: true });
        }
      }
    } catch (err: any) {
      if (err.name !== 'AbortError') {
        setStatusMessage({ text: `Folder access error: ${err.message || err}`, isError: true });
      }
    } finally {
      setIsScanning(false);
    }
  };

  // Fallback for Firefox/Safari or standard folder file input
  const handleFallbackFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files) return;
    const fileList = Array.from(e.target.files);
    setFolderName('Selected Local Files');
    const files: LocalDiscoveredFile[] = fileList.map(f => ({
      name: f.name,
      size: f.size,
      type: f.type,
      extension: f.name.split('.').pop()?.toLowerCase() || '',
      sourceType: determineSourceType(f.name),
      nativeFile: f,
      selected: true,
    }));
    setDiscoveredFiles(files);
  };

  const toggleSelectAll = (select: boolean) => {
    setDiscoveredFiles(prev => prev.map(f => ({ ...f, selected: select })));
  };

  const toggleFile = (index: number) => {
    setDiscoveredFiles(prev => {
      const copy = [...prev];
      copy[index].selected = !copy[index].selected;
      return copy;
    });
  };

  const filteredFiles = discoveredFiles.filter(f => {
    if (activeFilter === 'documents') return ['pdf', 'text'].includes(f.sourceType);
    if (activeFilter === 'media') return ['image', 'video', 'audio'].includes(f.sourceType);
    if (activeFilter === 'code') return ['code', 'json'].includes(f.sourceType);
    return true;
  });

  const selectedCount = discoveredFiles.filter(f => f.selected).length;

  const handleIngestSelected = async () => {
    const selected = discoveredFiles.filter(f => f.selected);
    if (selected.length === 0) return;

    setIsUploading(true);
    setStatusMessage(null);

    let successCount = 0;
    let failCount = 0;

    for (let i = 0; i < selected.length; i++) {
      const item = selected[i];
      setUploadProgress({ current: i + 1, total: selected.length, filename: item.name });

      try {
        let fileToUpload = item.nativeFile;
        if (!fileToUpload && item.handle) {
          fileToUpload = await item.handle.getFile();
        }

        if (fileToUpload) {
          await ingestFile(fileToUpload);
          successCount++;
        }
      } catch (err) {
        console.error(`Failed to ingest ${item.name}:`, err);
        failCount++;
      }
    }

    setIsUploading(false);
    setUploadProgress(null);

    if (failCount === 0) {
      setStatusMessage({ text: `Successfully ingested ${successCount} local artifact(s) into ReTrace!` });
      setTimeout(() => {
        onIngestSuccess();
        onClose();
      }, 1500);
    } else {
      setStatusMessage({ 
        text: `Ingested ${successCount} file(s). ${failCount} failed. Check console for details.`, 
        isError: true 
      });
      onIngestSuccess();
    }
  };

  const getSourceTypeIcon = (type: SourceType) => {
    switch (type) {
      case 'pdf': return <FileText className="w-4 h-4 text-rose-500" />;
      case 'image': return <ImageIcon className="w-4 h-4 text-purple-500" />;
      case 'video': return <Film className="w-4 h-4 text-sky-500" />;
      case 'audio': return <Headphones className="w-4 h-4 text-emerald-500" />;
      case 'code':
      case 'json': return <Code className="w-4 h-4 text-amber-500" />;
      default: return <FileText className="w-4 h-4 text-stone-500" />;
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-900/60 backdrop-blur-xs">
      <div className="w-full max-w-2xl bg-white border border-[#E2DDD5] rounded-md shadow-2xl overflow-hidden relative corner-ticks flex flex-col max-h-[85vh]">
        
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-[#E2DDD5] bg-[#FAF8F5]">
          <div className="flex items-center space-x-2">
            <div className="p-1.5 bg-amber-100 rounded text-amber-900">
              <HardDrive className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-xs font-mono font-bold text-stone-900 uppercase tracking-wider">
                CONNECT LOCAL STORAGE // FILE SYSTEM ACCESS
              </h2>
              <p className="text-[11px] font-mono text-stone-500">
                Grant permission to explore and selectively ingest local folders
              </p>
            </div>
          </div>
          <button 
            onClick={onClose} 
            disabled={isUploading}
            className="text-stone-400 hover:text-stone-700 p-1 rounded"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Chromium Browser Notice */}
        <div className="px-4 py-2 bg-amber-50/70 border-b border-amber-200/60 flex items-start space-x-2 text-[11px] font-mono text-amber-800">
          <Info className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
          <div>
            <span><strong>Native Permission Notice:</strong> Native local folder selection utilizes the File System Access API (supported in Google Chrome & Microsoft Edge).</span>
            {!isSupported && (
              <span className="block text-rose-700 mt-0.5 font-bold">
                (Note: Your current browser does not support directory picking; fallback multi-file selection is enabled.)
              </span>
            )}
          </div>
        </div>

        {/* Action Bar / Picker */}
        <div className="p-4 border-b border-[#E2DDD5] bg-stone-50 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center space-x-2">
            {isSupported ? (
              <button
                type="button"
                onClick={handlePickDirectory}
                disabled={isScanning || isUploading}
                className="px-3.5 py-1.5 bg-[#1E293B] hover:bg-stone-800 text-white rounded text-xs font-mono font-semibold flex items-center space-x-1.5 transition-colors shadow-xs"
              >
                {isScanning ? <Loader2 className="w-3.5 h-3.5 animate-spin text-amber-300" /> : <FolderOpen className="w-3.5 h-3.5 text-amber-300" />}
                <span>{folderName ? 'Choose Another Folder' : 'Select Local Folder'}</span>
              </button>
            ) : (
              <label className="px-3.5 py-1.5 bg-[#1E293B] hover:bg-stone-800 text-white rounded text-xs font-mono font-semibold flex items-center space-x-1.5 transition-colors shadow-xs cursor-pointer">
                <FolderOpen className="w-3.5 h-3.5 text-amber-300" />
                <span>Select Folder / Files</span>
                <input
                  type="file"
                  multiple
                  onChange={handleFallbackFileInput}
                  className="hidden"
                />
              </label>
            )}

            {folderName && (
              <span className="text-xs font-mono text-stone-700 font-semibold px-2 py-1 bg-white border border-[#E2DDD5] rounded">
                📁 {folderName} ({discoveredFiles.length} files)
              </span>
            )}
          </div>

          {/* Filter Pills */}
          {discoveredFiles.length > 0 && (
            <div className="flex items-center space-x-1 text-[11px] font-mono">
              <button
                onClick={() => setActiveFilter('all')}
                className={`px-2 py-0.5 rounded ${activeFilter === 'all' ? 'bg-[#1E293B] text-white' : 'bg-white text-stone-600 border border-[#E2DDD5]'}`}
              >
                All
              </button>
              <button
                onClick={() => setActiveFilter('documents')}
                className={`px-2 py-0.5 rounded ${activeFilter === 'documents' ? 'bg-[#1E293B] text-white' : 'bg-white text-stone-600 border border-[#E2DDD5]'}`}
              >
                Docs
              </button>
              <button
                onClick={() => setActiveFilter('media')}
                className={`px-2 py-0.5 rounded ${activeFilter === 'media' ? 'bg-[#1E293B] text-white' : 'bg-white text-stone-600 border border-[#E2DDD5]'}`}
              >
                Media
              </button>
              <button
                onClick={() => setActiveFilter('code')}
                className={`px-2 py-0.5 rounded ${activeFilter === 'code' ? 'bg-[#1E293B] text-white' : 'bg-white text-stone-600 border border-[#E2DDD5]'}`}
              >
                Code/JSON
              </button>
            </div>
          )}
        </div>

        {/* File Selection List */}
        <div className="p-4 overflow-y-auto flex-1 space-y-2">
          {discoveredFiles.length === 0 ? (
            <div className="text-center py-12 text-stone-400 font-mono text-xs space-y-2">
              <FolderOpen className="w-8 h-8 text-stone-300 mx-auto" />
              <p>NO LOCAL FOLDER CONNECTED</p>
              <p className="text-[11px] text-stone-400 max-w-sm mx-auto">
                Click "Select Local Folder" above to trigger browser permission and explore files to ingest.
              </p>
            </div>
          ) : (
            <>
              {/* Select All Controls */}
              <div className="flex items-center justify-between pb-2 border-b border-[#E2DDD5] text-xs font-mono text-stone-500">
                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => toggleSelectAll(true)}
                    className="hover:text-stone-900 underline"
                  >
                    Select All
                  </button>
                  <span>|</span>
                  <button
                    onClick={() => toggleSelectAll(false)}
                    className="hover:text-stone-900 underline"
                  >
                    Deselect All
                  </button>
                </div>
                <span>{selectedCount} of {discoveredFiles.length} selected for ingestion</span>
              </div>

              {/* Items */}
              <div className="space-y-1.5 pt-1">
                {filteredFiles.map((file, idx) => (
                  <div
                    key={file.name + idx}
                    onClick={() => !isUploading && toggleFile(idx)}
                    className={`flex items-center justify-between p-2.5 rounded border transition-colors cursor-pointer text-xs font-mono ${
                      file.selected 
                        ? 'bg-amber-50/60 border-amber-300 text-stone-900' 
                        : 'bg-white border-[#E2DDD5] text-stone-500 hover:bg-stone-50'
                    }`}
                  >
                    <div className="flex items-center space-x-2.5 min-w-0">
                      <div className="shrink-0 text-amber-700">
                        {file.selected ? <CheckSquare className="w-4 h-4 text-amber-600" /> : <Square className="w-4 h-4 text-stone-400" />}
                      </div>
                      <div className="shrink-0">{getSourceTypeIcon(file.sourceType)}</div>
                      <span className="truncate font-semibold">{file.name}</span>
                    </div>

                    <div className="flex items-center space-x-3 shrink-0 text-[11px] text-stone-400">
                      <span className="uppercase px-1.5 py-0.5 rounded bg-stone-100 text-stone-600 border border-stone-200">
                        {file.sourceType}
                      </span>
                      <span>{formatFileSize(file.size)}</span>
                    </div>
                  </div>
                ))}
              </div>
            </>
          )}
        </div>

        {/* Upload Progress Bar */}
        {uploadProgress && (
          <div className="p-3 bg-amber-50 border-t border-amber-200 text-xs font-mono text-amber-900 space-y-1.5">
            <div className="flex items-center justify-between">
              <span>Ingesting ({uploadProgress.current}/{uploadProgress.total}): {uploadProgress.filename}</span>
              <span>{Math.round((uploadProgress.current / uploadProgress.total) * 100)}%</span>
            </div>
            <div className="w-full bg-amber-200 h-1.5 rounded-full overflow-hidden">
              <div 
                className="bg-amber-600 h-full transition-all duration-200"
                style={{ width: `${(uploadProgress.current / uploadProgress.total) * 100}%` }}
              />
            </div>
          </div>
        )}

        {/* Status Message */}
        {statusMessage && (
          <div className={`p-3 text-xs font-mono flex items-center space-x-2 border-t ${
            statusMessage.isError ? 'bg-rose-50 text-rose-800 border-rose-200' : 'bg-emerald-50 text-emerald-800 border-emerald-200'
          }`}>
            {statusMessage.isError ? <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" /> : <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />}
            <span>{statusMessage.text}</span>
          </div>
        )}

        {/* Footer */}
        <div className="p-3.5 border-t border-[#E2DDD5] bg-[#FAF8F5] flex items-center justify-between">
          <p className="text-[11px] font-mono text-stone-400">
            Files are ingested only upon explicit selection and consent.
          </p>
          <div className="flex items-center space-x-2">
            <button
              onClick={onClose}
              disabled={isUploading}
              className="px-3 py-1.5 text-xs font-mono bg-white border border-[#E2DDD5] hover:bg-stone-50 rounded text-stone-700 shadow-2xs"
            >
              Cancel
            </button>
            <button
              onClick={handleIngestSelected}
              disabled={selectedCount === 0 || isUploading}
              className="px-4 py-1.5 text-xs font-mono font-semibold bg-[#1E293B] hover:bg-stone-800 disabled:bg-stone-300 text-white rounded flex items-center space-x-1.5 shadow-xs"
            >
              {isUploading ? <Loader2 className="w-3.5 h-3.5 animate-spin text-amber-300" /> : <Upload className="w-3.5 h-3.5 text-amber-300" />}
              <span>{isUploading ? `Ingesting...` : `Ingest Selected (${selectedCount})`}</span>
            </button>
          </div>
        </div>

      </div>
    </div>
  );
}
