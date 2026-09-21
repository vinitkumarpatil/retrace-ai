export type SourceType = 'pdf' | 'image' | 'text' | 'url';

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

export interface EntityNode {
  id: string;
  name: string;
  type: 'person' | 'team' | 'system' | 'decision' | 'document' | 'concept' | 'date';
  description?: string;
  val?: number;
  color?: string;
}

export interface EntityLink {
  source: string;
  target: string;
  relation: string;
  evidence?: string;
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

export interface MissingContextFlag {
  category: 'unrecorded_reason' | 'missing_stakeholder' | 'broken_chain' | 'unresolved_question' | 'gap_in_dates';
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

export interface ReconstructionResult {
  query: string;
  direct_answer: string;
  reasoning_summary: string;
  confidence_score: 'high' | 'medium' | 'low';
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

export interface SystemHealth {
  status: string;
  version: string;
  services: {
    gemini: {
      configured: boolean;
      model: string;
      embedding_model: string;
    };
    database: {
      mode: string;
      pgvector_ready: boolean;
    };
  };
}

export interface QueryHistoryItem {
  id: string;
  query: string;
  timestamp: string;
  confidenceScore?: 'high' | 'medium' | 'low';
}

export interface SelectedEntity {
  id: string;
  name: string;
  type: string;
}

