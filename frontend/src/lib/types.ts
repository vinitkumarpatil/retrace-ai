/* =========================================================
   API CONTRACT TYPES  (must match backend/app/models.py exactly)
   Do not change these shapes — the backend depends on them.
   ========================================================= */

export type SourceType = "pdf" | "image" | "text" | "url";

export interface DocumentItem {
  id: string;
  title: string;
  source_type: SourceType;
  content_preview: string;
  metadata?: Record<string, any>;
  created_at: string;
  entity_count?: number;
  event_count?: number;
}

export type EntityType =
  | "person"
  | "team"
  | "system"
  | "decision"
  | "document"
  | "concept"
  | "date";

export interface EntityNode {
  id: string;
  name: string;
  type: EntityType;
  description?: string;
  role?: string;
  val?: number;
  color?: string;
}

export interface EntityLink {
  source: string;
  target: string;
  relation: string;
  evidence?: string;
  context?: string;
}

export interface TimelineEvent {
  date: string;
  title: string;
  description: string;
  decision?: string;
  actors: string[];
  evidence_quote?: string;
  document_title?: string;
}

export type MissingContextCategory =
  | "unrecorded_reason"
  | "missing_stakeholder"
  | "broken_chain"
  | "unresolved_question"
  | "gap_in_dates";

export interface MissingContextFlag {
  category: MissingContextCategory;
  description: string;
  impact: string;
  suggested_investigation: string;
}

export interface Citation {
  document_id?: string;
  document_title: string;
  source_type: string;
  quote: string;
  relevance: string;
}

export type ConfidenceScore = "high" | "medium" | "low";

export interface ReconstructionResult {
  query: string;
  direct_answer: string;
  reasoning_summary: string;
  confidence_score: ConfidenceScore;
  confidence_rationale: string;
  timeline: TimelineEvent[];
  graph: {
    nodes: EntityNode[];
    links: EntityLink[];
  };
  citations: Citation[];
  missing_context: MissingContextFlag[];
}

export interface IngestResponse {
  success: boolean;
  document_id: string;
  title: string;
  source_type: SourceType;
  chunk_count: number;
  extracted_entities_count: number;
  extracted_events_count: number;
  message: string;
}

export interface GlobalGraphResponse {
  nodes: EntityNode[];
  links: EntityLink[];
}

/* =========================================================
   VIEW MODELS  (frontend-only — derived, never sent to backend)
   ========================================================= */

/** A query result, wrapped with a client-generated identity so it can
 *  live in the "Recent" list and have its own /investigate/[id] page.
 *  This is session state, not fabricated data. */
export interface Investigation {
  id: string;
  question: string;
  result: ReconstructionResult;
  createdAt: string; // ISO
}

/** Evidence strength buckets, derived from citations + missing_context. */
export type EvidenceStrength = "direct" | "supporting" | "missing" | "conflicting";

export interface EvidenceCoverage {
  percent: number; // 0-100
  direct: number;
  supporting: number;
  missing: number;
  conflicting: number;
  totalSources: number;
}

/** A claim extracted from the answer, with the sources that back it. */
export interface TracedClaim {
  text: string;
  citations: Citation[];
}

/** Decision view, derived from timeline events that carry a `decision`. */
export interface DerivedDecision {
  id: string;
  title: string;
  date: string;
  decision: string;
  actors: string[];
  evidence_quote?: string;
  document_title?: string;
  investigationId: string;
}

/** Entity view, derived from graph nodes + link degree. */
export interface DerivedEntity {
  id: string;
  name: string;
  type: EntityType;
  description?: string;
  role?: string;
  connections: number;
  relatedNames: string[];
}
