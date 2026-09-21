'use client';

import React, { useState } from 'react';
import { FileText, Search, ExternalLink, Calendar, ShieldCheck, Eye, Database, Filter } from 'lucide-react';
import { DocumentItem } from '@/lib/types';

interface ArchiveSectionProps {
  documents: DocumentItem[];
  onSelectDoc: (doc: {
    title: string;
    type: string;
    quote?: string;
    relevance?: string;
    author?: string;
    date?: string;
    status?: string;
  }) => void;
}

const DEFAULT_DOCUMENTS = [
  {
    id: 'doc-1',
    title: 'ADR-042: Database Architecture Review & Selection',
    source_type: 'ADR',
    date: 'August 12, 2024',
    status: 'Verified',
    author: 'Alice Chen (Principal Architect)',
    preview:
      'Formal evaluation of MongoDB, MySQL, and PostgreSQL for the Order service. PostgreSQL approved unanimously.',
  },
  {
    id: 'doc-2',
    title: 'RFC-204: Monolith Migration Execution Plan',
    source_type: 'RFC',
    date: 'August 1, 2024',
    status: 'Verified',
    author: 'Team Nova & Platform Eng',
    preview:
      'Decomposition milestones, service boundary isolation, and event stream replication strategy via Kafka.',
  },
  {
    id: 'doc-3',
    title: 'Incident Retrospective #88: RDS Outage',
    source_type: 'Postmortem',
    date: 'August 18, 2024',
    status: 'Verified',
    author: 'SRE On-Call Lead',
    preview:
      'Analysis of connection pool exhaustion under flash sale load. Action items to scale instance and add pgBouncer.',
  },
  {
    id: 'doc-4',
    title: 'Slack #arch-council: Emergency RDS Scaling Session',
    source_type: 'Slack Chat',
    date: 'August 19, 2024',
    status: 'Verified',
    author: 'VP of Engineering',
    preview:
      'Budget sign-off for moving primary databases to AWS RDS db.r6g.2xlarge with provisioned IOPS.',
  },
  {
    id: 'doc-5',
    title: 'ADR-038: NoSQL vs Relational Benchmark Results',
    source_type: 'ADR',
    date: 'July 15, 2024',
    status: 'Verified',
    author: 'Data Platform Team',
    preview:
      'Benchmark results ruling out MongoDB due to distributed multi-document ACID transaction latency spikes.',
  },
  {
    id: 'doc-6',
    title: 'Security Compliance Audit 2024 - Data Retention',
    source_type: 'Audit Spec',
    date: 'June 28, 2024',
    status: 'Verified',
    author: 'SecOps Committee',
    preview:
      'Enforced row-level encryption and immutable audit trail requirements for all customer payment records.',
  },
];

export default function ArchiveSection({ documents, onSelectDoc }: ArchiveSectionProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedType, setSelectedType] = useState('ALL');

  const docList = documents && documents.length > 0
    ? documents.map((d) => ({
        id: d.id,
        title: d.title,
        source_type: (d.source_type || 'PDF').toUpperCase(),
        date: d.created_at ? new Date(d.created_at).toLocaleDateString() : 'August 2024',
        status: 'Verified',
        author: (d.metadata && d.metadata.author) || 'Engineering Contributor',
        preview: d.content_preview || 'Archived record indexed into ReTrace vector storage.',
      }))
    : DEFAULT_DOCUMENTS;

  const filteredDocs = docList.filter((doc) => {
    const matchesSearch =
      doc.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      doc.preview.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType =
      selectedType === 'ALL' || doc.source_type.toLowerCase() === selectedType.toLowerCase();
    return matchesSearch && matchesType;
  });

  const allTypes = ['ALL', ...Array.from(new Set(docList.map((d) => d.source_type)))];

  const getTypeBadgeColor = (type: string) => {
    switch (type.toUpperCase()) {
      case 'ADR':
        return 'text-sky-400 bg-sky-500/10 border-sky-500/20';
      case 'RFC':
        return 'text-indigo-400 bg-indigo-500/10 border-indigo-500/20';
      case 'POSTMORTEM':
        return 'text-rose-400 bg-rose-500/10 border-rose-500/20';
      case 'SLACK CHAT':
        return 'text-amber-400 bg-amber-500/10 border-amber-500/20';
      default:
        return 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20';
    }
  };

  return (
    <section id="archive" className="py-20 bg-[#0A0F1D] relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
        
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div className="space-y-2">
            <div className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full bg-slate-800 text-slate-300 text-xs font-mono font-medium border border-slate-700">
              <Database className="w-3.5 h-3.5 text-sky-400" />
              <span>EVIDENCE ARCHIVE</span>
            </div>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
              Indexed Documents
            </h2>
            <p className="text-sm text-slate-400 max-w-xl">
              Inspect historical records, decision logs, and meeting transcripts indexed in the knowledge base.
            </p>
          </div>

          {/* Search bar & Type Filter in Header */}
          <div className="flex flex-wrap items-center gap-3">
            <div className="relative">
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search archive..."
                className="w-56 sm:w-64 pl-9 pr-3 py-2 bg-[#0F172A] border border-slate-700 rounded-xl text-white text-xs sm:text-sm placeholder:text-slate-500 focus:outline-none focus:border-sky-400 transition-all"
              />
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
            </div>

            {/* Filter pills */}
            <div className="flex items-center gap-1 overflow-x-auto text-xs font-mono">
              {allTypes.slice(0, 4).map((t) => (
                <button
                  key={t}
                  onClick={() => setSelectedType(t)}
                  className={`px-2.5 py-1.5 rounded-lg transition-colors cursor-pointer ${
                    selectedType === t
                      ? 'bg-sky-500 text-slate-950 font-bold'
                      : 'bg-slate-900 text-slate-400 hover:text-white border border-slate-800'
                  }`}
                >
                  {t}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Document Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredDocs.map((doc) => (
            <div
              key={doc.id}
              className="rounded-2xl bg-[#0F172A] border border-slate-800 p-6 shadow-xl hover:border-slate-700 hover:bg-[#1E293B]/60 transition-all duration-300 flex flex-col justify-between group"
            >
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="p-2.5 rounded-xl bg-sky-500/10 text-sky-400 border border-sky-500/20 group-hover:scale-105 transition-transform">
                    <FileText className="w-5 h-5" />
                  </div>
                  <div className="flex items-center space-x-2">
                    <span
                      className={`text-[10px] font-mono px-2 py-0.5 rounded-full border uppercase font-bold ${getTypeBadgeColor(
                        doc.source_type
                      )}`}
                    >
                      {doc.source_type}
                    </span>
                    <span className="inline-flex items-center text-[10px] font-mono text-emerald-400 bg-emerald-500/10 px-1.5 py-0.5 rounded border border-emerald-500/20">
                      <ShieldCheck className="w-3 h-3 mr-0.5" />
                      Verified
                    </span>
                  </div>
                </div>

                <div className="space-y-1.5">
                  <h3 className="text-base font-bold text-white group-hover:text-sky-300 transition-colors">
                    {doc.title}
                  </h3>
                  <p className="text-xs text-slate-400 leading-relaxed line-clamp-3">
                    {doc.preview}
                  </p>
                </div>
              </div>

              {/* Bottom footer with Date & View Button */}
              <div className="pt-4 mt-4 border-t border-slate-800/80 flex items-center justify-between">
                <div className="flex items-center space-x-1.5 text-xs font-mono text-slate-400">
                  <Calendar className="w-3.5 h-3.5" />
                  <span>{doc.date}</span>
                </div>

                <button
                  type="button"
                  onClick={() =>
                    onSelectDoc({
                      title: doc.title,
                      type: doc.source_type,
                      quote: doc.preview,
                      author: doc.author,
                      date: doc.date,
                      status: doc.status,
                      relevance: `Primary source recorded in knowledge archive under author ${doc.author}.`,
                    })
                  }
                  className="px-3 py-1.5 rounded-lg text-xs font-semibold text-sky-400 bg-sky-500/10 hover:bg-sky-500/20 border border-sky-500/30 flex items-center space-x-1.5 transition-all cursor-pointer"
                >
                  <Eye className="w-3.5 h-3.5" />
                  <span>View</span>
                </button>
              </div>
            </div>
          ))}
        </div>

        {filteredDocs.length === 0 && (
          <div className="p-12 text-center rounded-2xl bg-[#0F172A] border border-slate-800 text-sm text-slate-400">
            No documents match your filter. Try another keyword.
          </div>
        )}

      </div>
    </section>
  );
}
