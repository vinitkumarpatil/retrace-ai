'use client';

import React from 'react';
import { Users, FileText, HelpCircle, CheckCircle2, ArrowRight, Sparkles, MessageSquare, AlertCircle } from 'lucide-react';

export default function HumanStorySection() {
  return (
    <section className="py-24 bg-[#070D1A] border-t border-[#1E293B] relative overflow-hidden subtle-grid">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 space-y-16">
        
        {/* Section Header */}
        <div className="text-center space-y-3">
          <div className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full bg-indigo-500/10 text-indigo-400 text-xs font-mono font-medium border border-indigo-500/20">
            <Users className="w-3.5 h-3.5" />
            <span>THE HUMAN CHALLENGE</span>
          </div>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-white tracking-tight">
            Important decisions are rarely
            <br />
            stored in one place.
          </h2>
          <p className="text-base sm:text-lg text-slate-400 max-w-lg mx-auto">
            When key engineers move on or systems evolve, the critical &ldquo;why&rdquo; disappears into private chats and stale repositories.
          </p>
        </div>

        {/* Human-Centered Comparison Visual: Before vs. After */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          
          {/* Before: Confusion & Missing Context */}
          <div className="p-8 rounded-3xl bg-[#0E1626] border border-rose-500/30 shadow-xl space-y-6 relative overflow-hidden">
            <div className="flex items-center justify-between">
              <span className="text-xs font-mono font-bold uppercase px-3 py-1 rounded-full bg-rose-500/10 text-rose-400 border border-rose-500/20">
                BEFORE RETRACE
              </span>
              <AlertCircle className="w-5 h-5 text-rose-400" />
            </div>

            <div className="space-y-2">
              <h3 className="text-xl font-bold text-white">
                &ldquo;Why did we do this?&rdquo;
              </h3>
              <p className="text-sm text-slate-400 leading-relaxed font-sans">
                Engineers spend days digging through abandoned Slack channels, unanswered emails, and git blame lines trying to understand why a database was chosen or an incident mitigation was put in place.
              </p>
            </div>

            {/* Scattered Confusion Visual */}
            <div className="space-y-2.5 pt-2">
              <div className="p-3 rounded-xl bg-[#141F36] border border-[#1E293B] text-xs font-mono text-slate-400 flex items-center justify-between">
                <span>💬 Slack: #arch-decisions (Archived)</span>
                <span className="text-rose-400">Context Lost</span>
              </div>
              <div className="p-3 rounded-xl bg-[#141F36] border border-[#1E293B] text-xs font-mono text-slate-400 flex items-center justify-between">
                <span>📄 Outdated Confluence Wiki (2022)</span>
                <span className="text-rose-400">Out of Date</span>
              </div>
              <div className="p-3 rounded-xl bg-[#141F36] border border-[#1E293B] text-xs font-mono text-slate-400 flex items-center justify-between">
                <span>👤 Lead Architect</span>
                <span className="text-rose-400">Left the Company</span>
              </div>
            </div>
          </div>

          {/* After: ReTrace Uncovers the Truth */}
          <div className="p-8 rounded-3xl bg-gradient-to-br from-emerald-500/10 via-[#0E1626] to-[#0E1626] border border-emerald-500/40 shadow-xl space-y-6 relative overflow-hidden">
            <div className="flex items-center justify-between">
              <span className="text-xs font-mono font-bold uppercase px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                WITH RETRACE
              </span>
              <CheckCircle2 className="w-5 h-5 text-emerald-400" />
            </div>

            <div className="space-y-2">
              <h3 className="text-xl font-bold text-white">
                &ldquo;Now we know why.&rdquo;
              </h3>
              <p className="text-sm text-slate-300 leading-relaxed font-sans">
                ReTrace traverses historical artifacts, recovers the exact debate and sign-offs, identifies the approving stakeholders, and provides verbatim document citations within seconds.
              </p>
            </div>

            {/* Organized Clarity Visual */}
            <div className="space-y-2.5 pt-2">
              <div className="p-3 rounded-xl bg-[#141F36] border border-emerald-500/30 text-xs font-mono text-emerald-300 flex items-center justify-between">
                <span>✓ ADR-042 Consensus Found</span>
                <span className="font-bold">Verified</span>
              </div>
              <div className="p-3 rounded-xl bg-[#141F36] border border-emerald-500/30 text-xs font-mono text-emerald-300 flex items-center justify-between">
                <span>✓ Approved by Architecture Council</span>
                <span className="font-bold">March 14, 2025</span>
              </div>
              <div className="p-3 rounded-xl bg-[#141F36] border border-emerald-500/30 text-xs font-mono text-emerald-300 flex items-center justify-between">
                <span>✓ 3 Verbatim Source Citations</span>
                <span className="font-bold">100% Zero-Drift</span>
              </div>
            </div>
          </div>

        </div>

      </div>
    </section>
  );
}
