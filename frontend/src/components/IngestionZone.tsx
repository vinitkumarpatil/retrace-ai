'use client';

import React, { useState } from 'react';
import {
  X,
  UploadCloud,
  FileText,
  Globe,
  CheckCircle2,
  AlertCircle,
  Loader2,
  Sparkles,
  FileUp,
} from 'lucide-react';
import { ingestFile, ingestText, ingestUrl } from '@/lib/api';

interface IngestionZoneProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

const DEMO_TEMPLATES = {
  rfc: {
    title: 'RFC-312: Caching Strategy & Redis Cluster Migration',
    text: `RFC-312: Caching Strategy & Redis Cluster Migration
Author: Elena Rostova (Staff Infrastructure Engineer)
Date: 2024-09-05
Status: Approved by Tech Board (Alice Chen, Bob Martinez)

Context:
Our product catalog read traffic grew by 320% after the marketing campaign in late August.
PostgreSQL database CPU utilization reached 88% sustained during peak hours.

Decision:
1. Introduce Redis Cluster v7.2 as a distributed cache layer in front of PostgreSQL.
2. TTL policy set to 15 minutes for inventory items and 60 minutes for catalog taxonomy.
3. Invalidation driven by CDC (Change Data Capture) via Debezium Kafka connector.

Rejected Alternatives:
- Memcached: Rejected because Memcached does not support persistence and replication sets needed for disaster recovery.
- In-memory Node caching: Rejected due to node memory bloat and cold-start synchronization delays.`,
  },
  slack: {
    title: 'Slack #incident-war-room: Auth Token Expiry Outage',
    text: `[2024-09-18 10:15] @marcus_vance: We are seeing 401 Unauthorized errors spiking to 14% on customer mobile apps.
[2024-09-18 10:18] @elena_sre: The RSA public key rotation failed on the auth sidecar because the certificate renewal cron was halted during the cluster upgrade.
[2024-09-18 10:25] @alice_chen: Emergency decision: Force rollout of secret version #4 across all Kubernetes pods and bypass strict mTLS checks for 2 hours.
[2024-09-18 10:40] @elena_sre: Secret version #4 applied. Error rates dropped back to 0.01%.
[2024-09-18 11:00] @marcus_vance: Incident mitigated. Postmortem scheduled for Friday 2 PM.`,
  },
  postmortem: {
    title: 'Incident Postmortem #94: Search Latency Spike',
    text: `Incident Postmortem #94
Date: 2024-09-22
Facilitator: Dave Miller (SRE Lead)

Summary:
Search queries experienced 8.5s P99 latency between 14:00 and 14:45 UTC.

Root Cause:
A rogue analytics batch job initiated an unindexed full-table scan on the search index partition.

Action Items:
1. Enforce strict read-only replicas for all business analytics jobs (Owner: Dave Miller, Due: Oct 1).
2. Set query timeout to 2.0s for all public-facing endpoints (Owner: Alice Chen, Due: Sept 25).

Unresolved Context:
It remains unknown why the read-replica failover threshold was set to 5000ms instead of the standard 1500ms.`,
  },
};

export default function IngestionZone({ isOpen, onClose, onSuccess }: IngestionZoneProps) {
  const [tab, setTab] = useState<'file' | 'text' | 'url'>('file');
  const [file, setFile] = useState<File | null>(null);
  const [textTitle, setTextTitle] = useState('');
  const [textContent, setTextContent] = useState('');
  const [urlInput, setUrlInput] = useState('');
  const [urlTitle, setUrlTitle] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [uploadStatus, setUploadStatus] = useState<'idle' | 'uploading' | 'indexed' | 'failed'>('idle');
  const [statusMessage, setStatusMessage] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleFileUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file) return;
    setIsLoading(true);
    setUploadStatus('uploading');
    setStatusMessage('Uploading and extracting entities with Gemini...');
    try {
      const res = await ingestFile(file);
      setUploadStatus('indexed');
      setStatusMessage(res.message);
      setFile(null);
      setTimeout(() => {
        onSuccess();
        onClose();
        setUploadStatus('idle');
        setStatusMessage(null);
      }, 1500);
    } catch (err: any) {
      setUploadStatus('failed');
      setStatusMessage(err.message || 'File ingestion failed');
    } finally {
      setIsLoading(false);
    }
  };

  const handleTextUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!textTitle.trim() || !textContent.trim()) return;
    setIsLoading(true);
    setUploadStatus('uploading');
    setStatusMessage('Parsing markdown and extracting causal links...');
    try {
      const res = await ingestText(textTitle.trim(), textContent.trim());
      setUploadStatus('indexed');
      setStatusMessage(res.message);
      setTextTitle('');
      setTextContent('');
      setTimeout(() => {
        onSuccess();
        onClose();
        setUploadStatus('idle');
        setStatusMessage(null);
      }, 1500);
    } catch (err: any) {
      setUploadStatus('failed');
      setStatusMessage(err.message || 'Text ingestion failed');
    } finally {
      setIsLoading(false);
    }
  };

  const handleUrlUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!urlInput.trim()) return;
    setIsLoading(true);
    setUploadStatus('uploading');
    setStatusMessage('Scraping remote URL and chunking content...');
    try {
      const res = await ingestUrl(urlInput.trim(), urlTitle.trim() || undefined);
      setUploadStatus('indexed');
      setStatusMessage(res.message);
      setUrlInput('');
      setUrlTitle('');
      setTimeout(() => {
        onSuccess();
        onClose();
        setUploadStatus('idle');
        setStatusMessage(null);
      }, 1500);
    } catch (err: any) {
      setUploadStatus('failed');
      setStatusMessage(err.message || 'URL scraping failed');
    } finally {
      setIsLoading(false);
    }
  };

  const loadTemplate = (type: 'rfc' | 'slack' | 'postmortem') => {
    const t = DEMO_TEMPLATES[type];
    setTextTitle(t.title);
    setTextContent(t.text);
    setTab('text');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in">
      <div className="w-full max-w-xl bg-[#0B101A] border border-[#243044] rounded-xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-[#243044] bg-[#101722]">
          <div className="flex items-center space-x-2.5">
            <div className="p-1.5 rounded-lg bg-[#00F2FE]/10 text-[#00F2FE] border border-[#00F2FE]/30">
              <FileUp className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-xs font-mono font-bold text-white uppercase tracking-wider">
                INGEST EVIDENCE
              </h2>
              <p className="text-[11px] font-mono text-[#94A3B8]">
                Upload historical engineering artifacts to reconstruct missing decision context.
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="text-[#94A3B8] hover:text-white p-1 rounded-md transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Tab Switcher */}
        <div className="flex border-b border-[#243044] bg-[#05070D] px-4 pt-2">
          <button
            onClick={() => setTab('file')}
            className={`flex items-center space-x-2 px-3.5 py-2 text-xs font-mono border-b-2 transition-all ${
              tab === 'file'
                ? 'border-[#00F2FE] text-[#00F2FE] font-bold'
                : 'border-transparent text-[#94A3B8] hover:text-white'
            }`}
          >
            <UploadCloud className="w-3.5 h-3.5" />
            <span>Document File</span>
          </button>

          <button
            onClick={() => setTab('text')}
            className={`flex items-center space-x-2 px-3.5 py-2 text-xs font-mono border-b-2 transition-all ${
              tab === 'text'
                ? 'border-[#00F2FE] text-[#00F2FE] font-bold'
                : 'border-transparent text-[#94A3B8] hover:text-white'
            }`}
          >
            <FileText className="w-3.5 h-3.5" />
            <span>Markdown / Raw Notes</span>
          </button>

          <button
            onClick={() => setTab('url')}
            className={`flex items-center space-x-2 px-3.5 py-2 text-xs font-mono border-b-2 transition-all ${
              tab === 'url'
                ? 'border-[#00F2FE] text-[#00F2FE] font-bold'
                : 'border-transparent text-[#94A3B8] hover:text-white'
            }`}
          >
            <Globe className="w-3.5 h-3.5" />
            <span>Wiki / URL</span>
          </button>
        </div>

        {/* Form Body */}
        <div className="p-5 overflow-y-auto space-y-4 bg-[#05070D]">
          
          {/* Status Alert */}
          {statusMessage && (
            <div
              className={`p-3 rounded-lg border text-xs font-mono flex items-center space-x-2.5 ${
                uploadStatus === 'failed'
                  ? 'bg-[#EF4444]/15 border-[#EF4444]/40 text-[#EF4444]'
                  : uploadStatus === 'indexed'
                  ? 'bg-[#10B981]/15 border-[#10B981]/40 text-[#10B981]'
                  : 'bg-[#00F2FE]/10 border-[#00F2FE]/30 text-[#00F2FE]'
              }`}
            >
              {uploadStatus === 'uploading' && <Loader2 className="w-4 h-4 animate-spin shrink-0" />}
              {uploadStatus === 'indexed' && <CheckCircle2 className="w-4 h-4 shrink-0" />}
              {uploadStatus === 'failed' && <AlertCircle className="w-4 h-4 shrink-0" />}
              <span>{statusMessage}</span>
            </div>
          )}

          {/* TAB 1: File Upload */}
          {tab === 'file' && (
            <form onSubmit={handleFileUpload} className="space-y-4">
              <div
                className="border-2 border-dashed border-[#243044] hover:border-[#00F2FE]/60 rounded-xl p-8 text-center cursor-pointer transition-colors bg-[#101722]"
                onClick={() => document.getElementById('file-upload-input')?.click()}
              >
                <input
                  id="file-upload-input"
                  type="file"
                  accept=".pdf,.md,.txt,.json,.docx,.png,.jpg,.jpeg"
                  onChange={(e) => setFile(e.target.files?.[0] || null)}
                  className="hidden"
                />

                <div className="w-12 h-12 rounded-xl bg-[#00F2FE]/10 border border-[#00F2FE]/30 text-[#00F2FE] flex items-center justify-center mx-auto mb-3">
                  <UploadCloud className="w-6 h-6" />
                </div>

                {file ? (
                  <div className="space-y-1 font-mono text-xs">
                    <span className="font-bold text-white block truncate max-w-sm mx-auto">
                      {file.name}
                    </span>
                    <span className="text-[#94A3B8] text-[11px]">
                      {(file.size / 1024).toFixed(1)} KB — Ready to parse
                    </span>
                  </div>
                ) : (
                  <div className="space-y-1">
                    <span className="text-xs font-bold text-white block">
                      Drag & drop artifact or click to browse
                    </span>
                    <span className="text-[11px] font-mono text-[#94A3B8] block">
                      Supports: PDF, Markdown, TXT, JSON, DOCX, Architecture Diagrams
                    </span>
                  </div>
                )}
              </div>

              <div className="flex justify-end space-x-2 pt-1">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-3 py-1.5 text-xs font-mono text-[#94A3B8] hover:text-white rounded-md bg-[#101722] border border-[#243044]"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isLoading || !file}
                  className="px-4 py-1.5 text-xs font-mono font-bold text-black bg-[#00F2FE] hover:bg-[#38BDF8] disabled:opacity-40 rounded-md flex items-center space-x-1.5 transition-all shadow-sm"
                >
                  {isLoading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : null}
                  <span>{isLoading ? 'Processing...' : 'Upload & Index'}</span>
                </button>
              </div>
            </form>
          )}

          {/* TAB 2: Text / Raw Notes */}
          {tab === 'text' && (
            <form onSubmit={handleTextUpload} className="space-y-3">
              {/* Demo Template Shortcuts */}
              <div className="flex items-center space-x-1.5 text-[11px] font-mono text-[#94A3B8] pb-1">
                <Sparkles className="w-3 h-3 text-[#00F2FE]" />
                <span>Templates:</span>
                <button
                  type="button"
                  onClick={() => loadTemplate('rfc')}
                  className="px-2 py-0.5 rounded bg-[#101722] border border-[#243044] hover:border-[#00F2FE] text-[#00F2FE]"
                >
                  + RFC-312
                </button>
                <button
                  type="button"
                  onClick={() => loadTemplate('slack')}
                  className="px-2 py-0.5 rounded bg-[#101722] border border-[#243044] hover:border-[#8B5CF6] text-[#8B5CF6]"
                >
                  + War Room
                </button>
                <button
                  type="button"
                  onClick={() => loadTemplate('postmortem')}
                  className="px-2 py-0.5 rounded bg-[#101722] border border-[#243044] hover:border-[#EF4444] text-[#EF4444]"
                >
                  + Postmortem #94
                </button>
              </div>

              <div>
                <label className="block text-xs font-mono text-[#94A3B8] mb-1">
                  Document Title
                </label>
                <input
                  type="text"
                  value={textTitle}
                  onChange={(e) => setTextTitle(e.target.value)}
                  placeholder="e.g. RFC-105: Switch to Apache Kafka"
                  className="w-full px-3 py-2 bg-[#101722] border border-[#243044] rounded text-white text-xs font-mono focus:outline-none focus:border-[#00F2FE]"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-mono text-[#94A3B8] mb-1">
                  Content / Markdown Notes
                </label>
                <textarea
                  rows={7}
                  value={textContent}
                  onChange={(e) => setTextContent(e.target.value)}
                  placeholder="Paste RFCs, ADRs, Slack transcripts, or postmortem records..."
                  className="w-full px-3 py-2 bg-[#101722] border border-[#243044] rounded text-white text-xs font-mono focus:outline-none focus:border-[#00F2FE] leading-relaxed"
                  required
                />
              </div>

              <div className="flex justify-end space-x-2 pt-1">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-3 py-1.5 text-xs font-mono text-[#94A3B8] hover:text-white rounded-md bg-[#101722] border border-[#243044]"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isLoading || !textTitle.trim() || !textContent.trim()}
                  className="px-4 py-1.5 text-xs font-mono font-bold text-black bg-[#00F2FE] hover:bg-[#38BDF8] disabled:opacity-40 rounded-md flex items-center space-x-1.5 transition-all shadow-sm"
                >
                  {isLoading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : null}
                  <span>{isLoading ? 'Processing...' : 'Ingest & Index'}</span>
                </button>
              </div>
            </form>
          )}

          {/* TAB 3: URL */}
          {tab === 'url' && (
            <form onSubmit={handleUrlUpload} className="space-y-3">
              <div>
                <label className="block text-xs font-mono text-[#94A3B8] mb-1">
                  Documentation / Wiki URL
                </label>
                <input
                  type="url"
                  value={urlInput}
                  onChange={(e) => setUrlInput(e.target.value)}
                  placeholder="https://wiki.company.internal/arch/adrs/004"
                  className="w-full px-3 py-2 bg-[#101722] border border-[#243044] rounded text-white text-xs font-mono focus:outline-none focus:border-[#00F2FE]"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-mono text-[#94A3B8] mb-1">
                  Custom Title (Optional)
                </label>
                <input
                  type="text"
                  value={urlTitle}
                  onChange={(e) => setUrlTitle(e.target.value)}
                  placeholder="ADR-004: Event-Driven Architecture"
                  className="w-full px-3 py-2 bg-[#101722] border border-[#243044] rounded text-white text-xs font-mono focus:outline-none focus:border-[#00F2FE]"
                />
              </div>

              <div className="flex justify-end space-x-2 pt-1">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-3 py-1.5 text-xs font-mono text-[#94A3B8] hover:text-white rounded-md bg-[#101722] border border-[#243044]"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isLoading || !urlInput.trim()}
                  className="px-4 py-1.5 text-xs font-mono font-bold text-black bg-[#00F2FE] hover:bg-[#38BDF8] disabled:opacity-40 rounded-md flex items-center space-x-1.5 transition-all shadow-sm"
                >
                  {isLoading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : null}
                  <span>{isLoading ? 'Scraping...' : 'Scrape & Ingest'}</span>
                </button>
              </div>
            </form>
          )}

        </div>

      </div>
    </div>
  );
}
