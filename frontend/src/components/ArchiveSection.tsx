'use client';

import React, { useState } from 'react';
import { FileText, Search, ShieldCheck, Calendar, Eye, Database } from 'lucide-react';
import { DocumentItem } from '@/lib/types';

interface ArchiveSectionProps {
  documents: DocumentItem[];
  onSelectDoc: (doc: any) => void;
}

const DEFAULT_ARCHIVE_CARDS = [
  {
    id: 'doc-1',
    title: 'ADR-042: Database Selection Review',
    type: 'ADR',
    date: 'March 14, 2025',
    status: 'Verified',
    author: 'Alice Chen (Principal Architect)',
    summary:
      'Formal evaluation of MongoDB, MySQL, and PostgreSQL for the Order service. Approved PostgreSQL with pgvector.',
    quote:
      'Adopt Kafka + PostgreSQL with pgvector starting August 1, 2024. Team Nova will execute migration in Phase 1.',
  },
  {
    id: 'doc-2',
    title: 'RFC-204: Monolith Migration Strategy',
    type: 'RFC',
    date: 'March 1, 2025',
    status: 'Verified',
    author: 'Team Nova & Platform Eng',
    summary:
      'Decomposition milestones, service boundary isolation, and event stream replication strategy via Kafka.',
    quote:
      'Decomposition milestones require strict ACID guarantees for the payment service. Relational model is mandatory.',
  },
  {
    id: 'doc-3',
    title: 'Incident Retrospective #88: RDS Outage',
    type: 'Postmortem',
    date: 'February 20, 2025',
    status: 'Verified',
    author: 'SRE Incident Lead',
    summary:
      'Analysis of connection pool exhaustion under flash sale load. Action items to scale instance and add pgBouncer.',
    quote:
      'Standardize pgBouncer connection pooling across all microservices to prevent connection spikes.',
  },
  {
    id: 'doc-4',
    title: 'Slack #arch-council: Emergency Scaling',
    type: 'Slack Chat',
    date: 'February 22, 2025',
    status: 'Verified',
    author: 'VP of Engineering',
    summary:
      'Budget sign-off for moving primary databases to AWS RDS db.r6g.2xlarge with provisioned IOPS.',
    quote:
      'Approved the budget increase for the 2xlarge RDS instance for Q3 to support pgvector index memory caching.',
  },
  {
    id: 'doc-5',
    title: 'ADR-038: NoSQL vs Relational Benchmark',
    type: 'ADR',
    date: 'January 15, 2025',
    status: 'Verified',
    author: 'Data Platform Team',
    summary:
      'Benchmark results ruling out MongoDB due to distributed multi-document ACID transaction latency spikes.',
    quote:
      'Distributed document locking in MongoDB resulted in acceptable read performance but unacceptable transaction contention during simultaneous inventory checkouts.',
  },
  {
    id: 'doc-6',
    title: 'Security Compliance Audit 2025',
    type: 'Audit Spec',
    date: 'January 28, 2025',
    status: 'Verified',
    author: 'SecOps Committee',
    summary:
      'Enforced row-level encryption and immutable audit trail requirements for all customer payment records.',
    quote:
      'Payment ledger must maintain immutable audit trail with serializable isolation guarantees.',
  },
];

export default function ArchiveSection({ documents, onSelectDoc }: ArchiveSectionProps) {
  const [searchTerm, setSearchTerm] = useState('');

  const cards = documents && documents.length > 0
    ? documents.map((d) => ({
        id: d.id,
        title: d.title,
        type: (d.source_type || 'PDF').toUpperCase(),
        date: d.created_at ? new Date(d.created_at).toLocaleDateString() : 'March 2025',
        status: 'Verified',
        author: (d.metadata && d.metadata.author) || 'Engineering Team',
        summary: d.content_preview || 'Archived record indexed into ReTrace vector storage.',
        quote: d.content_preview || 'Direct historical excerpt retrieved from knowledge store.',
      }))
    : DEFAULT_ARCHIVE_CARDS;

  const filteredCards = cards.filter((c) => {
    return (
      c.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.summary.toLowerCase().includes(searchTerm.toLowerCase())
    );
  });

  return (
    <section id="archive" className="py-24 bg-[#05070D] border-t border-[#1E293B] relative">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
        
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div className="space-y-3">
            <div className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full bg-slate-800 text-slate-300 text-xs font-mono font-medium border border-slate-700">
              <Database className="w-3.5 h-3.5 text-sky-400" />
              <span>RECORD REPOSITORY</span>
            </div>
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-white tracking-tight">
              Evidence Archive
            </h2>
            <p className="text-base text-slate-400 max-w-xl">
              Historical engineering records, ADRs, postmortems, and transcripts indexed into ReTrace.
            </p>
          </div>

          {/* Simple Search Input */}
          <div className="relative">
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search archive..."
              className="w-64 sm:w-80 pl-10 pr-4 py-2.5 bg-[#0E1626] border border-[#1E293B] focus:border-sky-400 rounded-xl text-white text-xs sm:text-sm placeholder:text-slate-500 focus:outline-none transition-all"
            />
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
          </div>
        </div>

        {/* Document Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredCards.map((doc) => (
            <div
              key={doc.id}
              className="p-6 rounded-3xl bg-[#0E1626] border border-[#1E293B] hover:border-slate-700 hover:bg-[#141F36] transition-all duration-300 flex flex-col justify-between group shadow-xl hover:-translate-y-1"
            >
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="w-10 h-10 rounded-2xl bg-sky-500/10 text-sky-400 flex items-center justify-center border border-sky-500/20 group-hover:scale-105 transition-transform">
                    <FileText className="w-5 h-5" />
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className="text-[10px] font-mono px-2.5 py-0.5 rounded-full border border-slate-700 bg-slate-800 text-slate-300 uppercase font-bold">
                      {doc.type}
                    </span>
                    <span className="inline-flex items-center text-[10px] font-mono text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/20">
                      <ShieldCheck className="w-3 h-3 mr-0.5" />
                      {doc.status}
                    </span>
                  </div>
                </div>

                <div className="space-y-1">
                  <h3 className="text-base font-bold text-white group-hover:text-sky-300 transition-colors">
                    {doc.title}
                  </h3>
                  <p className="text-xs text-slate-400 leading-relaxed line-clamp-3 font-sans">
                    {doc.summary}
                  </p>
                </div>
              </div>

              {/* Bottom Card Footer with Date & VIEW button */}
              <div className="pt-4 mt-4 border-t border-[#1E293B] flex items-center justify-between">
                <div className="flex items-center space-x-1.5 text-xs font-mono text-slate-400">
                  <Calendar className="w-3.5 h-3.5" />
                  <span>{doc.date}</span>
                </div>

                <button
                  type="button"
                  onClick={() =>
                    onSelectDoc({
                      title: doc.title,
                      type: doc.type,
                      date: doc.date,
                      author: doc.author,
                      summary: doc.summary,
                      quote: doc.quote,
                      relatedDecision: 'ReTrace Evidence Archive Record',
                    })
                  }
                  className="px-3.5 py-1.5 rounded-xl text-xs font-mono font-bold text-sky-400 bg-sky-500/10 hover:bg-sky-500/20 border border-sky-500/30 flex items-center space-x-1.5 transition-all cursor-pointer"
                >
                  <Eye className="w-3.5 h-3.5" />
                  <span>VIEW</span>
                </button>
              </div>
            </div>
          ))}
        </div>

        {filteredCards.length === 0 && (
          <div className="p-12 text-center rounded-3xl bg-[#0E1626] border border-[#1E293B] text-sm text-slate-400 font-mono">
            No records matched your search query.
          </div>
        )}

      </div>
    </section>
  );
}
