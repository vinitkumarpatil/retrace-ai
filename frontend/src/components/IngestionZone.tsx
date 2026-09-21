'use client';

import React, { useState } from 'react';
import {
  X,
  Upload,
  FileText,
  Globe,
  CheckCircle2,
  AlertCircle,
  Loader2,
  FileCode,
  Sparkles,
  FileUp,
} from 'lucide-react';
import { ingestFile, ingestText, ingestUrl } from '@/lib/api';

interface IngestionZoneProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

const SAMPLE_TEMPLATES = {
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
    title: 'Slack Thread #incident-war-room: Auth Token Expiry Outage',
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
  const [statusMessage, setStatusMessage] = useState<{ text: string; isError?: boolean } | null>(null);

  if (!isOpen) return null;

  const handleFileUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file) return;
    setIsLoading(true);
    setStatusMessage(null);
    try {
      const res = await ingestFile(file);
      setStatusMessage({ text: res.message });
      setFile(null);
      setTimeout(() => {
        onSuccess();
        onClose();
      }, 1200);
    } catch (err: any) {
      setStatusMessage({ text: err.message || 'File ingestion failed', isError: true });
    } finally {
      setIsLoading(false);
    }
  };

  const handleTextUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!textTitle.trim() || !textContent.trim()) return;
    setIsLoading(true);
    setStatusMessage(null);
    try {
      const res = await ingestText(textTitle.trim(), textContent.trim());
      setStatusMessage({ text: res.message });
      setTextTitle('');
      setTextContent('');
      setTimeout(() => {
        onSuccess();
        onClose();
      }, 1200);
    } catch (err: any) {
      setStatusMessage({ text: err.message || 'Text ingestion failed', isError: true });
    } finally {
      setIsLoading(false);
    }
  };

  const handleUrlUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!urlInput.trim()) return;
    setIsLoading(true);
    setStatusMessage(null);
    try {
      const res = await ingestUrl(urlInput.trim(), urlTitle.trim() || undefined);
      setStatusMessage({ text: res.message });
      setUrlInput('');
      setUrlTitle('');
      setTimeout(() => {
        onSuccess();
        onClose();
      }, 1200);
    } catch (err: any) {
      setStatusMessage({ text: err.message || 'URL ingestion failed', isError: true });
    } finally {
      setIsLoading(false);
    }
  };

  const loadTemplate = (type: 'rfc' | 'slack' | 'postmortem') => {
    const t = SAMPLE_TEMPLATES[type];
    setTextTitle(t.title);
    setTextContent(t.text);
    setTab('text');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-in fade-in">
      <div className="w-full max-w-xl bg-[#0F1623] border border-[#202E48] rounded-xl shadow-2xl overflow-hidden relative corner-ticks flex flex-col max-h-[90vh]">
        
        {/* Modal Header */}
        <div className="flex items-center justify-between p-4 border-b border-[#202E48] bg-[#141C2D]">
          <div className="flex items-center space-x-2.5">
            <div className="p-1.5 rounded-lg bg-amber-500/10 border border-amber-500/30 text-amber-400">
              <FileUp className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-xs font-mono font-bold text-white uppercase tracking-wider">
                INGEST HISTORICAL ARTIFACT // EXTRACTION STUDIO
              </h2>
              <p className="text-[11px] font-mono text-slate-400">
                GEMINI STRUCTURED ENTITY & EVENT EXTRACTION PIPELINE
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white p-1 rounded-lg transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="flex border-b border-[#202E48] bg-[#0D121D] px-4 pt-2">
          <button
            onClick={() => setTab('file')}
            className={`flex items-center space-x-2 px-3 py-2 text-xs font-mono border-b-2 transition-all ${
              tab === 'file'
                ? 'border-amber-400 text-amber-300 font-bold'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Upload className="w-3.5 h-3.5" />
            <span>Document / File</span>
          </button>

          <button
            onClick={() => setTab('text')}
            className={`flex items-center space-x-2 px-3 py-2 text-xs font-mono border-b-2 transition-all ${
              tab === 'text'
                ? 'border-amber-400 text-amber-300 font-bold'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <FileText className="w-3.5 h-3.5" />
            <span>Raw Text / Notes</span>
          </button>

          <button
            onClick={() => setTab('url')}
            className={`flex items-center space-x-2 px-3 py-2 text-xs font-mono border-b-2 transition-all ${
              tab === 'url'
                ? 'border-amber-400 text-amber-300 font-bold'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Globe className="w-3.5 h-3.5" />
            <span>Scrape URL</span>
          </button>
        </div>

        {/* Body Form */}
        <div className="p-5 overflow-y-auto flex-1 space-y-4">
          
          {/* Status Message */}
          {statusMessage && (
            <div
              className={`p-3 rounded-lg border text-xs font-mono flex items-center space-x-2 ${
                statusMessage.isError
                  ? 'bg-rose-500/10 border-rose-500/30 text-rose-300'
                  : 'bg-emerald-500/10 border-emerald-500/30 text-emerald-300'
              }`}
            >
              {statusMessage.isError ? (
                <AlertCircle className="w-4 h-4 shrink-0 text-rose-400" />
              ) : (
                <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-400" />
              )}
              <span>{statusMessage.text}</span>
            </div>
          )}

          {/* Tab 1: File Upload */}
          {tab === 'file' && (
            <form onSubmit={handleFileUpload} className="space-y-4">
              <div
                className="border-2 border-dashed border-[#202E48] hover:border-amber-400/50 rounded-xl p-8 text-center cursor-pointer transition-colors bg-[#0A0E17]/60"
                onClick={() => document.getElementById('file-input')?.click()}
              >
                <input
                  id="file-input"
                  type="file"
                  accept=".pdf,.png,.jpg,.jpeg,.webp,.txt,.md"
                  onChange={(e) => setFile(e.target.files?.[0] || null)}
                  className="hidden"
                />

                <div className="w-12 h-12 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-400 flex items-center justify-center mx-auto mb-3">
                  <Upload className="w-6 h-6" />
                </div>

                {file ? (
                  <div>
                    <span className="text-xs font-mono font-bold text-white block">
                      {file.name}
                    </span>
                    <span className="text-[11px] font-mono text-slate-400">
                      {(file.size / 1024).toFixed(1)} KB — Ready for forensic parsing
                    </span>
                  </div>
                ) : (
                  <div>
                    <span className="text-xs font-mono font-bold text-slate-200 block mb-1">
                      Drag and drop your document here, or browse
                    </span>
                    <span className="text-[11px] font-mono text-slate-400">
                      Supports PDF, Architecture Diagrams (PNG/JPG), RFC Markdown, Incident Logs
                    </span>
                  </div>
                )}
              </div>

              <div className="flex justify-end space-x-2 pt-2">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-3 py-1.5 text-xs font-mono text-slate-400 hover:text-white rounded-md bg-[#141C2D] border border-[#202E48]"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isLoading || !file}
                  className="px-4 py-1.5 text-xs font-mono font-bold text-slate-950 bg-amber-400 hover:bg-amber-300 disabled:opacity-50 rounded-md flex items-center space-x-1.5 transition-all"
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      <span>Extracting Entities...</span>
                    </>
                  ) : (
                    <span>Ingest & Extract</span>
                  )}
                </button>
              </div>
            </form>
          )}

          {/* Tab 2: Text / Raw Notes */}
          {tab === 'text' && (
            <form onSubmit={handleTextUpload} className="space-y-3">
              {/* Quick Sample Template Chips */}
              <div className="flex items-center space-x-1.5 text-[11px] font-mono text-slate-400 pb-1">
                <Sparkles className="w-3 h-3 text-amber-400 shrink-0" />
                <span>Quick Templates:</span>
                <button
                  type="button"
                  onClick={() => loadTemplate('rfc')}
                  className="px-2 py-0.5 rounded bg-[#141C2D] border border-[#202E48] hover:border-amber-400/40 text-amber-300"
                >
                  + RFC-312
                </button>
                <button
                  type="button"
                  onClick={() => loadTemplate('slack')}
                  className="px-2 py-0.5 rounded bg-[#141C2D] border border-[#202E48] hover:border-amber-400/40 text-cyan-300"
                >
                  + Slack War Room
                </button>
                <button
                  type="button"
                  onClick={() => loadTemplate('postmortem')}
                  className="px-2 py-0.5 rounded bg-[#141C2D] border border-[#202E48] hover:border-amber-400/40 text-rose-300"
                >
                  + Postmortem #94
                </button>
              </div>

              <div>
                <label className="block text-xs font-mono text-slate-300 mb-1">
                  Document / Note Title
                </label>
                <input
                  type="text"
                  value={textTitle}
                  onChange={(e) => setTextTitle(e.target.value)}
                  placeholder="e.g. RFC-105: Switch to Apache Kafka"
                  className="w-full px-3 py-2 bg-[#0A0E17] border border-[#202E48] rounded-md text-slate-200 placeholder:text-slate-500 text-xs font-mono focus:outline-none focus:border-amber-400"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-mono text-slate-300 mb-1">
                  Content / Markdown Notes
                </label>
                <textarea
                  rows={7}
                  value={textContent}
                  onChange={(e) => setTextContent(e.target.value)}
                  placeholder="Paste meeting notes, Slack dumps, architecture decisions, or RFC draft text..."
                  className="w-full px-3 py-2 bg-[#0A0E17] border border-[#202E48] rounded-md text-slate-200 placeholder:text-slate-500 text-xs font-mono focus:outline-none focus:border-amber-400 leading-relaxed font-mono"
                  required
                />
              </div>

              <div className="flex justify-end space-x-2 pt-2">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-3 py-1.5 text-xs font-mono text-slate-400 hover:text-white rounded-md bg-[#141C2D] border border-[#202E48]"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isLoading || !textTitle.trim() || !textContent.trim()}
                  className="px-4 py-1.5 text-xs font-mono font-bold text-slate-950 bg-amber-400 hover:bg-amber-300 disabled:opacity-50 rounded-md flex items-center space-x-1.5 transition-all"
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      <span>Extracting Entities...</span>
                    </>
                  ) : (
                    <span>Ingest & Extract</span>
                  )}
                </button>
              </div>
            </form>
          )}

          {/* Tab 3: URL Scraper */}
          {tab === 'url' && (
            <form onSubmit={handleUrlUpload} className="space-y-3">
              <div>
                <label className="block text-xs font-mono text-slate-300 mb-1">
                  Documentation / Wiki URL
                </label>
                <input
                  type="url"
                  value={urlInput}
                  onChange={(e) => setUrlInput(e.target.value)}
                  placeholder="https://wiki.company.internal/arch/adrs/004"
                  className="w-full px-3 py-2 bg-[#0A0E17] border border-[#202E48] rounded-md text-slate-200 placeholder:text-slate-500 text-xs font-mono focus:outline-none focus:border-amber-400"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-mono text-slate-300 mb-1">
                  Custom Title (Optional)
                </label>
                <input
                  type="text"
                  value={urlTitle}
                  onChange={(e) => setUrlTitle(e.target.value)}
                  placeholder="ADR-004: Event-Driven Architecture"
                  className="w-full px-3 py-2 bg-[#0A0E17] border border-[#202E48] rounded-md text-slate-200 placeholder:text-slate-500 text-xs font-mono focus:outline-none focus:border-amber-400"
                />
              </div>

              <div className="flex justify-end space-x-2 pt-2">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-3 py-1.5 text-xs font-mono text-slate-400 hover:text-white rounded-md bg-[#141C2D] border border-[#202E48]"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isLoading || !urlInput.trim()}
                  className="px-4 py-1.5 text-xs font-mono font-bold text-slate-950 bg-amber-400 hover:bg-amber-300 disabled:opacity-50 rounded-md flex items-center space-x-1.5 transition-all"
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      <span>Scraping & Ingesting...</span>
                    </>
                  ) : (
                    <span>Scrape & Ingest</span>
                  )}
                </button>
              </div>
            </form>
          )}

        </div>

      </div>
    </div>
  );
}
