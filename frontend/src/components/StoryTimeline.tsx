'use client';

import React, { useState } from 'react';
import {
  FileText,
  MessageSquare,
  CheckCircle2,
  GitBranch,
  Target,
  Calendar,
  Users,
  Layers,
  ArrowRight,
  Sparkles,
} from 'lucide-react';

interface StoryTimelineProps {
  onSelectEvidenceDocument?: (docTitle: string) => void;
}

const STORY_STAGES = [
  {
    id: 'proposal',
    step: '01',
    name: 'Proposal',
    tag: 'RFC DRAFTED',
    icon: FileText,
    date: 'August 1, 2024',
    title: 'RFC-204: Monolith Database Decomposition Proposal',
    lead: 'Team Nova & Platform Lead',
    summary:
      'Initial evaluation of PostgreSQL vs MongoDB to decouple the order transactional services from the legacy Django monolith.',
    evidenceCount: '2 documents',
    documents: ['RFC-204: Monolith Migration Plan', 'Tech Spec: Order Domain Isolation'],
    color: 'from-amber-400 to-orange-500 text-amber-400',
    borderColor: 'border-amber-500/30',
  },
  {
    id: 'discussion',
    step: '02',
    name: 'Discussion',
    tag: 'BENCHMARK REVIEW',
    icon: MessageSquare,
    date: 'August 8, 2024',
    title: 'Slack #arch-council & Performance Benchmarks',
    lead: 'Staff Engineers & Data Eng',
    summary:
      'Intensive benchmark testing evaluated NoSQL lock contention and latency under peak simulated traffic. MongoDB ACID transactions suffered 8.4% abort rates.',
    evidenceCount: '4 documents',
    documents: ['ADR-038: NoSQL vs Relational Benchmark', 'Slack #arch-council Meeting Notes'],
    color: 'from-sky-400 to-cyan-400 text-sky-400',
    borderColor: 'border-sky-500/30',
  },
  {
    id: 'decision',
    step: '03',
    name: 'Decision',
    tag: 'FORMAL SIGN-OFF',
    icon: CheckCircle2,
    date: 'August 12, 2024',
    title: 'ADR-042: Architecture Review Board Consensus',
    lead: 'Architecture Review Board (Alice Chen)',
    summary:
      'Formal committee approval authorizing PostgreSQL with pgvector for unified relational consistency and semantic indexing. Budget approved for RDS db.r6g.2xlarge.',
    evidenceCount: '3 documents',
    documents: ['ADR-042: Database Architecture Selection', 'Executive Budget Authorization Sign-off'],
    color: 'from-emerald-400 to-teal-400 text-emerald-400',
    borderColor: 'border-emerald-500/30',
  },
  {
    id: 'implementation',
    step: '04',
    name: 'Implementation',
    tag: 'PHASED ROLLOUT',
    icon: GitBranch,
    date: 'August 24, 2024',
    title: 'Kafka Dual-Write & Canary Data Migration',
    lead: 'Core Platform & DevOps',
    summary:
      'Dual-writing active checkout orders to both legacy DB and PostgreSQL replicas. SRE configured pgBouncer connection pooling to avoid resource exhaustion.',
    evidenceCount: '3 documents',
    documents: ['Canary Deployment Manifest v2.4', 'pgBouncer Pool Configuration PR #409'],
    color: 'from-indigo-400 to-purple-400 text-indigo-400',
    borderColor: 'border-indigo-500/30',
  },
  {
    id: 'result',
    step: '05',
    name: 'Result',
    tag: 'PRODUCTION SUCCESS',
    icon: Target,
    date: 'September 10, 2024',
    title: '100% Traffic Cutover & Zero Downtime Achieved',
    lead: 'Engineering Leadership',
    summary:
      'Completed zero-downtime cutover. Order processing latency decreased from 140ms to 18ms with 99.99% availability during subsequent flash sales.',
    evidenceCount: '2 documents',
    documents: ['Q3 Service Level Objective Verification', 'Incident Postmortem Retrospective #88'],
    color: 'from-cyan-400 to-emerald-400 text-cyan-400',
    borderColor: 'border-cyan-500/30',
  },
];

export default function StoryTimeline({ onSelectEvidenceDocument }: StoryTimelineProps) {
  const [selectedStageId, setSelectedStageId] = useState<string>('decision');

  const activeStage =
    STORY_STAGES.find((s) => s.id === selectedStageId) || STORY_STAGES[2];

  return (
    <section className="py-20 bg-[#05070D] border-t border-[#1E293B] relative">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
        
        {/* Section Header */}
        <div className="text-center space-y-3">
          <div className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full bg-indigo-500/10 text-indigo-400 text-xs font-mono font-medium border border-indigo-500/20">
            <Sparkles className="w-3.5 h-3.5" />
            <span>CHRONOLOGICAL AUDIT</span>
          </div>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
            Follow the story.
          </h2>
          <p className="text-sm sm:text-base text-slate-400 max-w-lg mx-auto">
            Click any milestone stage below to see what happened at every step of the decision lifecycle.
          </p>
        </div>

        {/* Horizontal Timeline Steps */}
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 relative">
          {STORY_STAGES.map((stage) => {
            const isSelected = selectedStageId === stage.id;
            const Icon = stage.icon;

            return (
              <button
                key={stage.id}
                type="button"
                onClick={() => setSelectedStageId(stage.id)}
                className={`p-4 sm:p-5 rounded-2xl border text-left transition-all duration-200 cursor-pointer flex flex-col justify-between group ${
                  isSelected
                    ? 'bg-[#131B2B] border-sky-400 shadow-xl shadow-sky-500/10 scale-[1.03] ring-1 ring-sky-400/30'
                    : 'bg-[#0D1420] border-[#1E293B] hover:border-slate-700 hover:bg-[#131B2B]/50'
                }`}
              >
                <div className="flex items-center justify-between mb-3">
                  <div
                    className={`w-9 h-9 rounded-xl flex items-center justify-center border ${
                      isSelected
                        ? 'bg-sky-500/20 border-sky-400/50 text-sky-400'
                        : 'bg-[#131B2B] border-[#1E293B] text-slate-400 group-hover:text-white'
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                  </div>
                  <span className="text-[10px] font-mono font-bold text-slate-500">
                    {stage.step}
                  </span>
                </div>

                <div className="space-y-1">
                  <h4 className="text-sm font-bold text-white tracking-tight">
                    {stage.name}
                  </h4>
                  <p className="text-[10px] font-mono text-slate-400 uppercase truncate">
                    {stage.date}
                  </p>
                </div>
              </button>
            );
          })}
        </div>

        {/* Expanded Stage Inspection Card */}
        <div className="rounded-3xl bg-[#0D1420] border border-[#1E293B] p-6 sm:p-8 shadow-2xl space-y-6 animate-in fade-in zoom-in-95 duration-200">
          
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-5 border-b border-[#1E293B]">
            <div className="space-y-1">
              <div className="flex items-center space-x-2">
                <span className="text-[10px] font-mono font-bold uppercase px-2.5 py-0.5 rounded bg-sky-500/10 text-sky-400 border border-sky-500/20">
                  {activeStage.tag}
                </span>
                <span className="text-xs font-mono text-slate-400 flex items-center space-x-1">
                  <Calendar className="w-3.5 h-3.5 text-slate-500" />
                  <span>{activeStage.date}</span>
                </span>
              </div>
              <h3 className="text-xl sm:text-2xl font-bold text-white">
                {activeStage.title}
              </h3>
            </div>

            <div className="flex items-center space-x-2 text-xs font-mono text-slate-400 bg-[#131B2B] px-3.5 py-2 rounded-xl border border-[#1E293B] shrink-0">
              <Users className="w-4 h-4 text-indigo-400" />
              <span>{activeStage.lead}</span>
            </div>
          </div>

          {/* Narrative Summary */}
          <p className="text-sm sm:text-base text-slate-300 leading-relaxed font-sans">
            {activeStage.summary}
          </p>

          {/* Linked Evidence Documents for this Stage */}
          <div className="pt-4 border-t border-[#1E293B] space-y-3">
            <div className="flex items-center justify-between text-xs font-mono text-slate-400">
              <span className="flex items-center space-x-1.5 uppercase font-bold text-slate-300">
                <Layers className="w-3.5 h-3.5 text-sky-400" />
                <span>LINKED EVIDENCE ({activeStage.evidenceCount})</span>
              </span>
              <span className="text-[11px] text-sky-400">Verified in primary archive</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {activeStage.documents.map((doc, idx) => (
                <div
                  key={idx}
                  onClick={() => onSelectEvidenceDocument && onSelectEvidenceDocument(doc)}
                  className="p-3.5 rounded-xl bg-[#131B2B] border border-[#1E293B] hover:border-sky-500/40 transition-all flex items-center justify-between text-xs text-slate-200 cursor-pointer group"
                >
                  <div className="flex items-center space-x-2.5 truncate mr-2">
                    <FileText className="w-4 h-4 text-sky-400 shrink-0" />
                    <span className="font-medium group-hover:text-sky-300 transition-colors truncate">
                      {doc}
                    </span>
                  </div>
                  <ArrowRight className="w-3.5 h-3.5 text-slate-500 group-hover:text-sky-400 group-hover:translate-x-0.5 transition-transform shrink-0" />
                </div>
              ))}
            </div>
          </div>

        </div>

      </div>
    </section>
  );
}
