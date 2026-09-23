import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import {
  Citation,
  DerivedDecision,
  DerivedEntity,
  EntityLink,
  EntityNode,
  EvidenceCoverage,
  EvidenceStrength,
  Investigation,
  MissingContextFlag,
  ReconstructionResult,
  TracedClaim,
} from "./types";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/* ---------------- IDs ---------------- */
export function makeId(prefix = "inv"): string {
  return `${prefix}_${Date.now().toString(36)}${Math.random().toString(36).slice(2, 7)}`;
}

/** Stable, URL-safe slug for deriving deterministic ids from names. */
export function slugify(input: string): string {
  return input
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "")
    .slice(0, 64);
}

/* ---------------- Dates ---------------- */
export function timeAgo(iso: string): string {
  const then = new Date(iso).getTime();
  if (Number.isNaN(then)) return "";
  const diff = Date.now() - then;
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  const days = Math.floor(hrs / 24);
  if (days < 30) return `${days}d ago`;
  const months = Math.floor(days / 30);
  if (months < 12) return `${months}mo ago`;
  return `${Math.floor(months / 12)}y ago`;
}

/** Best-effort friendly date. Accepts ISO, 'YYYY-MM-DD', or free text like 'Q3 2024'. */
export function formatEventDate(raw: string): string {
  if (!raw) return "";
  const d = new Date(raw);
  if (!Number.isNaN(d.getTime()) && /\d{4}/.test(raw)) {
    return d.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: raw.length > 7 ? "numeric" : undefined,
    });
  }
  return raw; // free-form timeframe, keep as-is
}

/** Sort timeline events chronologically where a real date is parseable. */
export function sortEventsChrono<T extends { date: string }>(events: T[]): T[] {
  return [...events].sort((a, b) => {
    const da = new Date(a.date).getTime();
    const db = new Date(b.date).getTime();
    if (Number.isNaN(da) && Number.isNaN(db)) return 0;
    if (Number.isNaN(da)) return 1;
    if (Number.isNaN(db)) return -1;
    return da - db;
  });
}

/* ---------------- Evidence coverage ---------------- */

const DIRECT_HINTS = [
  "decision",
  "decided",
  "approved",
  "selected",
  "chosen",
  "chose",
  "rejected",
  "because",
  "root cause",
  "directly",
  "explicit",
  "adopt",
  "migrat",
];

const CONFLICT_HINTS = ["conflict", "disagree", "contradic", "inconsist", "dispute"];

export function classifyCitation(c: Citation): EvidenceStrength {
  const hay = `${c.relevance || ""} ${c.quote || ""}`.toLowerCase();
  if (CONFLICT_HINTS.some((h) => hay.includes(h))) return "conflicting";
  if (DIRECT_HINTS.some((h) => hay.includes(h))) return "direct";
  return "supporting";
}

const CONFIDENCE_BASE: Record<string, number> = { high: 86, medium: 62, low: 38 };

/**
 * Derives an evidence-coverage breakdown from the (real) citations and
 * missing-context flags returned by the backend. This is an interpretation
 * of the model's own output — it does not invent sources.
 */
export function computeCoverage(result: ReconstructionResult): EvidenceCoverage {
  const citations = result.citations || [];
  const missingFlags = result.missing_context || [];

  let direct = 0;
  let supporting = 0;
  let conflicting = 0;

  for (const c of citations) {
    const kind = classifyCitation(c);
    if (kind === "direct") direct += 1;
    else if (kind === "conflicting") conflicting += 1;
    else supporting += 1;
  }

  const missing = missingFlags.length;
  const supported = direct + supporting;
  const denom = supported + missing + conflicting;

  let percent: number;
  if (denom === 0) {
    percent = CONFIDENCE_BASE[result.confidence_score] ?? 50;
  } else {
    const weighted = direct * 1 + supporting * 0.62;
    percent = Math.round((weighted / (weighted + missing + conflicting * 0.8 || 1)) * 100);
    // Keep the derived number sane and aligned with the model's own confidence band.
    const band = CONFIDENCE_BASE[result.confidence_score] ?? 55;
    percent = Math.round(percent * 0.6 + band * 0.4);
  }

  return {
    percent: Math.max(6, Math.min(98, percent)),
    direct,
    supporting,
    missing,
    conflicting,
    totalSources: citations.length,
  };
}

export const STRENGTH_META: Record<
  EvidenceStrength,
  { label: string; description: string; tone: string; dot: string }
> = {
  direct: {
    label: "Direct evidence",
    description: "The source explicitly supports the conclusion.",
    tone: "text-emerald",
    dot: "#34d399",
  },
  supporting: {
    label: "Supporting evidence",
    description: "The source indirectly strengthens the conclusion.",
    tone: "text-cyan",
    dot: "#22d3ee",
  },
  missing: {
    label: "Missing evidence",
    description: "Relevant context could not be found.",
    tone: "text-amber",
    dot: "#fbbf24",
  },
  conflicting: {
    label: "Conflicting sources",
    description: "Available sources disagree.",
    tone: "text-rose",
    dot: "#f87171",
  },
};

/* ---------------- Claim tracing ---------------- */

const STOP = new Set([
  "the", "a", "an", "and", "or", "but", "was", "were", "is", "are", "to", "of",
  "in", "on", "for", "with", "that", "this", "it", "as", "by", "we", "our",
  "from", "at", "be", "been", "which", "their", "they", "has", "had", "have",
  "into", "due", "its", "than", "then", "also", "not", "no",
]);

function keywords(text: string): Set<string> {
  return new Set(
    text
      .toLowerCase()
      .replace(/[^a-z0-9\s]/g, " ")
      .split(/\s+/)
      .filter((w) => w.length > 3 && !STOP.has(w))
  );
}

function splitSentences(text: string): string[] {
  return text
    .replace(/\n+/g, " ")
    .split(/(?<=[.!?])\s+(?=[A-Z0-9])/)
    .map((s) => s.trim())
    .filter(Boolean);
}

/**
 * Splits the reconstructed answer into sentences and attaches supporting
 * citations to each, based on keyword overlap with the citation quote.
 * Sentences with >=1 matching citation become clickable claims.
 */
export function traceClaims(result: ReconstructionResult): TracedClaim[] {
  const citations = result.citations || [];
  const sentences = splitSentences(result.direct_answer || "");
  return sentences.map((sentence) => {
    const sk = keywords(sentence);
    const matched = citations.filter((c) => {
      const ck = keywords(`${c.quote} ${c.relevance}`);
      let overlap = 0;
      for (const k of ck) if (sk.has(k)) overlap += 1;
      return overlap >= 2;
    });
    return { text: sentence, citations: matched };
  });
}

/* ---------------- Derived decisions & entities ---------------- */

export function deriveDecisions(investigations: Investigation[]): DerivedDecision[] {
  const seen = new Set<string>();
  const out: DerivedDecision[] = [];
  for (const inv of investigations) {
    for (const ev of inv.result.timeline || []) {
      const decisionText = ev.decision?.trim();
      if (!decisionText) continue;
      const key = slugify(`${ev.title}-${ev.date}`);
      if (seen.has(key)) continue;
      seen.add(key);
      out.push({
        id: key,
        title: ev.title,
        date: ev.date,
        decision: decisionText,
        actors: ev.actors || [],
        evidence_quote: ev.evidence_quote,
        document_title: ev.document_title,
        investigationId: inv.id,
      });
    }
  }
  return sortEventsChrono(out).reverse();
}

export function deriveEntities(nodes: EntityNode[], links: EntityLink[]): DerivedEntity[] {
  const linkName = (v: string | { id?: string; name?: string }): string =>
    typeof v === "object" ? v.name || v.id || "" : v;

  const degree = new Map<string, Set<string>>();
  for (const l of links) {
    const s = linkName(l.source as any);
    const t = linkName(l.target as any);
    if (!s || !t) continue;
    if (!degree.has(s)) degree.set(s, new Set());
    if (!degree.has(t)) degree.set(t, new Set());
    degree.get(s)!.add(t);
    degree.get(t)!.add(s);
  }

  return nodes
    .map((n) => {
      const key = n.name || n.id;
      const related = degree.get(key) || new Set<string>();
      return {
        id: slugify(key),
        name: key,
        type: n.type,
        description: n.description,
        role: (n as any).role,
        connections: related.size,
        relatedNames: Array.from(related),
      };
    })
    .sort((a, b) => b.connections - a.connections);
}

/* ---------------- Misc formatting ---------------- */

export const MISSING_CATEGORY_LABEL: Record<string, string> = {
  unrecorded_reason: "Unrecorded reason",
  missing_stakeholder: "Missing stakeholder",
  broken_chain: "Broken chain",
  unresolved_question: "Unresolved question",
  gap_in_dates: "Gap in timeline",
};

export function missingCategoryLabel(c: string): string {
  return MISSING_CATEGORY_LABEL[c] || c.replace(/_/g, " ");
}

export function titleCase(s: string): string {
  return s.replace(/\b\w/g, (m) => m.toUpperCase());
}

export function countSummary(result: ReconstructionResult): {
  sources: number;
  entities: number;
  events: number;
} {
  return {
    sources: result.citations?.length || 0,
    entities: result.graph?.nodes?.length || 0,
    events: result.timeline?.length || 0,
  };
}
