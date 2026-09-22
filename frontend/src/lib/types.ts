export type SourceType = 'pdf' | 'image' | 'video' | 'audio' | 'text' | 'code' | 'json' | 'url' | 'other';

export interface DocumentItem {
  id: string;
  title: string;
  source_type: SourceType;
  content_preview: string;
  raw_content?: string;
  metadata?: Record<string, any>;
  created_at: string;
  entity_count?: number;
  event_count?: number;
  file_url?: string;
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
  file_url?: string;
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

export interface LocalDiscoveredFile {
  name: string;
  size: number;
  type: string;
  extension: string;
  sourceType: SourceType;
  handle?: FileSystemFileHandle;
  nativeFile?: File;
  selected: boolean;
}
