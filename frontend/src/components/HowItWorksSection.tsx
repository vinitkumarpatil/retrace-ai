'use client';

import React from 'react';
import { UploadCloud, Share2, Lightbulb, Check } from 'lucide-react';

export default function HowItWorksSection() {
  const steps = [
    {
      number: '01',
      action: 'UPLOAD',
      icon: UploadCloud,
      emoji: '📄',
      title: 'Give ReTrace your documents.',
      description:
        'Upload ADRs, technical specs, Slack conversations, Git commit logs, or incident retrospectives in PDF, Markdown, DOCX, or TXT.',
      gradient: 'from-amber-400 to-orange-500',
    },
    {
      number: '02',
      action: 'CONNECT',
      icon: Share2,
      emoji: '🔗',
      title: 'ReTrace connects related information.',
      description:
        'Our forensic engine crawls vector similarity and causal entity links to map relationships between proposals, stakeholders, dates, and trade-offs.',
      gradient: 'from-sky-400 to-cyan-400',
    },
    {
      number: '03',
      action: 'UNDERSTAND',
      icon: Lightbulb,
      emoji: '💡',
      title: 'Discover the reason behind the decision.',
      description:
        'Get the complete story: What happened, Why it was approved, Who made the call, and the exact verbatim evidence backing it up.',
      gradient: 'from-emerald-400 to-teal-400',
    },
  ];

  return (
    <section id="how-it-works" className="py-24 bg-[#070D1A] border-t border-[#1E293B] relative">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 space-y-16">
        
        {/* Section Header */}
        <div className="text-center space-y-3">
          <div className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full bg-slate-800 text-slate-300 text-xs font-mono font-medium border border-slate-700">
            <span>THREE-STEP PIPELINE</span>
          </div>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-white tracking-tight">
            From information
            <br />
            to understanding.
          </h2>
          <p className="text-base sm:text-lg text-slate-400 max-w-md mx-auto">
            Three simple steps to transform raw engineering documentation into verifiable clarity.
          </p>
        </div>

        {/* 3 Step Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 relative">
          {steps.map((st, idx) => {
            const Icon = st.icon;

            return (
              <div
                key={idx}
                className="p-8 rounded-3xl bg-[#0E1626] border border-[#1E293B] hover:border-slate-700 hover:bg-[#141F36] transition-all duration-300 flex flex-col justify-between group shadow-xl hover:-translate-y-1 relative"
              >
                {/* Step number and header */}
                <div className="flex items-center justify-between pb-6 border-b border-[#1E293B]">
                  <span className="text-xs font-mono font-bold px-3 py-1 rounded-full bg-[#141F36] text-sky-400 border border-[#1E293B]">
                    STEP {st.number}
                  </span>
                  <span className="text-3xl font-black font-mono text-slate-800 group-hover:text-slate-700 transition-colors">
                    {st.number}
                  </span>
                </div>

                {/* Main Content */}
                <div className="py-6 space-y-4">
                  <div className="flex items-center space-x-3">
                    <div
                      className={`w-12 h-12 rounded-2xl bg-gradient-to-br ${st.gradient} text-slate-950 flex items-center justify-center shadow-md group-hover:scale-105 transition-transform`}
                    >
                      <Icon className="w-6 h-6" />
                    </div>
                    <span className="text-xs font-mono text-slate-300 font-extrabold tracking-wider">
                      {st.action}
                    </span>
                  </div>

                  <h3 className="text-lg font-bold text-white leading-snug">
                    {st.title}
                  </h3>

                  <p className="text-xs sm:text-sm text-slate-400 leading-relaxed font-sans">
                    {st.description}
                  </p>
                </div>

                {/* Footer Checkmark */}
                <div className="pt-4 border-t border-[#1E293B] flex items-center space-x-1.5 text-xs font-mono text-slate-400">
                  <Check className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Automated & verified</span>
                </div>
              </div>
            );
          })}
        </div>

      </div>
    </section>
  );
}
