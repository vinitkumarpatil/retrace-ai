'use client';

import React, { useState } from 'react';
import { Copy, Download, Check, Share2 } from 'lucide-react';
import { ReconstructionResult } from '@/lib/types';

interface NarrativeCardProps {
  directAnswer: string;
  reasoningSummary: string;
  confidenceScore: 'high' | 'medium' | 'low';
  confidenceRationale: string;
  query: string;
  fullResult?: ReconstructionResult | null;
}

export default function NarrativeCard({
  directAnswer,
  reasoningSummary,
  confidenceScore,
  confidenceRationale,
  query,
  fullResult,
}: NarrativeCardProps) {
  const [copied, setCopied] = useState(false);
  const [showExportMenu, setShowExportMenu] = useState(false);

  const confidence = {
    high: { label: 'High confidence', cls: 'text-verified border-verified/60 bg-verified/8' },
    medium: { label: 'Medium confidence', cls: 'text-caution border-caution/60 bg-caution/8' },
    low: { label: 'Low confidence', cls: 'text-stamp border-stamp/60 bg-stamp/8' },
  }[confidenceScore] || { label: 'Unrated', cls: 'text-ink-faint border-rule bg-paper' };

  const handleCopyMarkdown = () => {
    let md = `# ReTrace — recovered context\n\n`;
    md += `**Inquiry:** ${query}\n`;
    md += `**Confidence:** ${confidenceScore.toUpperCase()} — ${confidenceRationale}\n\n`;
    md += `## Finding\n${directAnswer}\n\n`;
    md += `## How we reconstructed it\n${reasoningSummary}\n\n`;

    if (fullResult?.missing_context?.length) {
      md += `## Gaps in the record\n`;
      fullResult.missing_context.forEach(item => {
        md += `- **[${item.category.replace('_', ' ').toUpperCase()}]** ${item.description}\n  *Impact:* ${item.impact}\n  *Next:* ${item.suggested_investigation}\n`;
      });
      md += `\n`;
    }
    if (fullResult?.timeline?.length) {
      md += `## Timeline\n`;
      fullResult.timeline.forEach(event => {
        md += `- **${event.date}**: ${event.title}\n  ${event.description}\n`;
        if (event.decision) md += `  *Decision:* ${event.decision}\n`;
        if (event.actors?.length) md += `  *People:* ${event.actors.join(', ')}\n`;
      });
      md += `\n`;
    }
    if (fullResult?.citations?.length) {
      md += `## Sources\n`;
      fullResult.citations.forEach((c, i) => {
        md += `- **EX-${String(i + 1).padStart(2, '0')} · ${c.document_title}** (${c.source_type}): "${c.quote}"\n`;
      });
      md += `\n`;
    }

    navigator.clipboard.writeText(md);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
    setShowExportMenu(false);
  };

  const handleDownloadJSON = () => {
    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(
      JSON.stringify(fullResult || { query, directAnswer, reasoningSummary, confidenceScore, confidenceRationale }, null, 2)
    );
    const a = document.createElement('a');
    a.setAttribute('href', dataStr);
    a.setAttribute('download', `retrace-${Date.now()}.json`);
    document.body.appendChild(a);
    a.click();
    a.remove();
    setShowExportMenu(false);
  };

  return (
    <article className="sheet shadow-lift overflow-hidden animate-reveal-up">
      {/* Case header band */}
      <header className="flex flex-wrap items-start justify-between gap-4 px-6 sm:px-7 pt-5 pb-4 border-b border-rule bg-paper/50">
        <div className="min-w-0">
          <div className="field-label mb-1.5">Finding</div>
          <p className="text-[13px] text-ink-soft leading-snug">
            <span className="text-ink-faint">re:</span>{' '}
            <span className="italic font-serif text-ink">{query}</span>
          </p>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          {/* Confidence stamp */}
          <span className={`stamp inline-flex items-center px-2.5 py-1 text-[11px] ${confidence.cls}`}>
            {confidence.label}
          </span>

          <div className="relative">
            <button
              onClick={() => setShowExportMenu(!showExportMenu)}
              className="inline-flex items-center gap-1.5 px-2.5 py-1.5 text-[12px] font-medium text-ink-soft border border-rule rounded-sheet bg-sheet hover:bg-paper hover:text-ink transition-colors"
              title="Export this finding"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-verified" /> : <Share2 className="w-3.5 h-3.5 text-ink-faint" />}
              <span>{copied ? 'Copied' : 'Export'}</span>
            </button>

            {showExportMenu && (
              <>
                <div className="fixed inset-0 z-10" onClick={() => setShowExportMenu(false)} />
                <div className="absolute right-0 mt-1.5 w-60 bg-sheet border border-rule-strong rounded-card shadow-modal py-1.5 z-20">
                  <button onClick={handleCopyMarkdown} className="w-full px-3 py-2 text-left hover:bg-paper flex items-start gap-2.5 transition-colors">
                    <Copy className="w-4 h-4 text-ink-faint mt-0.5 shrink-0" />
                    <span>
                      <span className="block text-[13px] font-medium text-ink">Copy as Markdown</span>
                      <span className="block text-[11px] text-ink-faint">For Slack, PRs, or Notion</span>
                    </span>
                  </button>
                  <button onClick={handleDownloadJSON} className="w-full px-3 py-2 text-left hover:bg-paper flex items-start gap-2.5 border-t border-rule transition-colors">
                    <Download className="w-4 h-4 text-ink-faint mt-0.5 shrink-0" />
                    <span>
                      <span className="block text-[13px] font-medium text-ink">Download JSON</span>
                      <span className="block text-[11px] text-ink-faint">Full structured evidence</span>
                    </span>
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      </header>

      <div className="px-6 sm:px-7 py-6">
        {/* The verdict — set large in serif, like the opening line of a report */}
        <p className="prose-finding text-[21px] sm:text-[23px] leading-[1.5] text-ink max-w-[68ch]">
          {directAnswer}
        </p>

        {/* Reconstruction trail */}
        <div className="mt-7">
          <div className="field-label mb-2.5">How we reconstructed it</div>
          <div className="prose-finding text-[15px] text-ink-soft whitespace-pre-line max-w-[74ch] pl-4 border-l-2 border-rule-strong">
            {reasoningSummary}
          </div>
        </div>
      </div>

      {/* Evidence basis footnote */}
      <footer className="px-6 sm:px-7 py-3.5 border-t border-rule bg-paper/50 flex flex-wrap items-center justify-between gap-2 text-[12px]">
        <span className="text-ink-soft">
          <span className="field-label mr-1.5 inline">Basis</span>
          {confidenceRationale}
        </span>
        <span className="catalog flex items-center gap-1.5">
          <span className="w-1.5 h-1.5 rounded-full bg-verified" />
          every claim tied to a source
        </span>
      </footer>
    </article>
  );
}
