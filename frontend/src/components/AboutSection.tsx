'use client';

import React from 'react';
import { FileText, HelpCircle, Zap, Target, ArrowRight, ShieldCheck, CheckCircle2 } from 'lucide-react';

export default function AboutSection() {
  const steps = [
    {
      icon: FileText,
      title: 'Old Documents',
      desc: 'ADRs, Slack chats, and PRs buried across repositories.',
      badge: 'THE PAST',
      color: 'from-amber-400 to-orange-500 text-slate-950',
    },
    {
      icon: HelpCircle,
      title: 'Missing Context',
      desc: 'Engineers leave, context is lost, and teams fear touching legacy systems.',
      badge: 'THE PROBLEM',
      color: 'from-rose-500 to-red-500 text-white',
    },
    {
      icon: Zap,
      title: 'ReTrace Engine',
      desc: 'Hybrid vectors & causal graphs reconstruct the decision trail.',
      badge: 'THE SOLUTION',
      color: 'from-sky-400 to-cyan-400 text-slate-950',
    },
    {
      icon: Target,
      title: 'Clear Decision',
      desc: 'Know exactly WHAT happened, WHY, WHO approved it, and WHEN.',
      badge: 'THE OUTCOME',
      color: 'from-emerald-400 to-teal-400 text-slate-950',
    },
  ];

  return (
    <section id="about" className="py-20 bg-[#080D1A] border-t border-slate-800/80 relative">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
        
        {/* Header */}
        <div className="text-center max-w-2xl mx-auto space-y-3">
          <div className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full bg-slate-800 text-slate-300 text-xs font-mono font-medium border border-slate-700">
            <span>CORE VALUE</span>
          </div>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
            What Problem Does ReTrace Solve?
          </h2>
          <p className="text-sm sm:text-base text-slate-400">
            Every growing software organization loses tribal knowledge. ReTrace brings institutional memory back to life.
          </p>
        </div>

        {/* Visual Flow Graphic */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 relative">
          {steps.map((st, idx) => {
            const Icon = st.icon;

            return (
              <div
                key={idx}
                className="p-6 rounded-2xl bg-[#0F172A] border border-slate-800 shadow-xl flex flex-col justify-between space-y-4 hover:border-slate-700 hover:bg-[#1E293B]/60 transition-all group"
              >
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div
                      className={`w-12 h-12 rounded-xl bg-gradient-to-br ${st.color} flex items-center justify-center shadow-md group-hover:scale-105 transition-transform`}
                    >
                      <Icon className="w-6 h-6" />
                    </div>
                    <span className="text-[9px] font-mono font-bold px-2 py-0.5 rounded-full border border-slate-700 bg-slate-800 text-slate-300">
                      {st.badge}
                    </span>
                  </div>

                  <h3 className="text-base font-bold text-white group-hover:text-sky-300 transition-colors">
                    {st.title}
                  </h3>

                  <p className="text-xs text-slate-400 leading-relaxed">
                    {st.desc}
                  </p>
                </div>

                {idx < steps.length - 1 && (
                  <div className="hidden lg:flex justify-end pt-2 text-slate-700">
                    <ArrowRight className="w-4 h-4 text-slate-600" />
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Bottom Explanatory Statement */}
        <div className="p-6 sm:p-8 rounded-2xl bg-gradient-to-r from-sky-500/10 via-slate-900 to-indigo-500/10 border border-slate-800 text-center max-w-3xl mx-auto space-y-3">
          <h4 className="text-base sm:text-lg font-bold text-white">
            Built for developers, engineering managers & architectural auditors
          </h4>
          <p className="text-xs sm:text-sm text-slate-300 leading-relaxed font-sans">
            Instead of spending days bugging alumni engineers or guessing why a legacy microservice was built a certain way, engineers can query ReTrace to get immediate, verified historical clarity backed by exact document quotes.
          </p>
        </div>

      </div>
    </section>
  );
}
