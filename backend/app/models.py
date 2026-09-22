from typing import List, Optional, Dict, Any
from pydantic import BaseModel, Field

# --- Ingestion Models ---

class TextIngestRequest(BaseModel):
    title: str = Field(..., description="Document or note title")
    text: str = Field(..., description="Raw text or markdown content")
    source_type: str = Field(default="text", description="Type of source: text, note, meeting_minutes")
    metadata: Optional[Dict[str, Any]] = Field(default_factory=dict)
    path: Optional[str] = Field(default=None, description="Local file path if available")
    url: Optional[str] = Field(default=None, description="Source URL if available")
    project: Optional[str] = Field(default=None, description="Project or workspace name")

class UrlIngestRequest(BaseModel):
    url: str = Field(..., description="URL to scrape and ingest")
    title: Optional[str] = Field(None, description="Optional custom title")
    project: Optional[str] = Field(default=None, description="Project or workspace name")

class IngestResponse(BaseModel):
    success: bool
    document_id: str
    title: str
    source_type: str
    chunk_count: int
    extracted_entities_count: int
    extracted_events_count: int
    message: str
    content_hash: Optional[str] = None
    is_duplicate: bool = False

# --- Extraction Models (AI Output) ---

class ExtractedEntity(BaseModel):
    name: str
    type: str = Field(..., description="person, team, system, decision, concept, document")
    role: Optional[str] = None
    description: Optional[str] = None

class ExtractedRelationship(BaseModel):
    source: str
    target: str
    relation: str
    context: Optional[str] = None

class ExtractedEvent(BaseModel):
    date: str = Field(..., description="Date or timeframe mentioned (e.g. '2024-08-12', 'Q3 2024')")
    title: str
    description: str
    decision: Optional[str] = None
    actors: List[str] = Field(default_factory=list)
    evidence_quote: Optional[str] = None
    document_title: Optional[str] = None

class ExtractedDocumentData(BaseModel):
    summary: str
    entities: List[ExtractedEntity] = Field(default_factory=list)
    relationships: List[ExtractedRelationship] = Field(default_factory=list)
    events: List[ExtractedEvent] = Field(default_factory=list)
    key_decisions: List[Dict[str, Any]] = Field(default_factory=list)

# --- Query & Reconstruction Models ---

class QueryRequest(BaseModel):
    query: str = Field(..., description="Fuzzy question regarding past decisions or events")
    top_k: int = Field(default=6, description="Number of evidence chunks to retrieve")
    project: Optional[str] = Field(default=None, description="Filter by project")
    source_type: Optional[str] = Field(default=None, description="Filter by source type")

class MissingContextItem(BaseModel):
    category: str = Field(..., description="unrecorded_reason, missing_stakeholder, broken_chain, unresolved_question, gap_in_dates")
    description: str
    impact: str
    suggested_investigation: str

class CitationItem(BaseModel):
    document_id: Optional[str] = None
    document_title: str
    source_type: str
    quote: str
    relevance: str
    path: Optional[str] = Field(default=None, description="Local file path if available")
    url: Optional[str] = Field(default=None, description="Source URL if available")
    chunk_id: Optional[str] = Field(default=None, description="Source chunk ID")
    score: Optional[float] = Field(default=None, description="Relevance score")

class GraphNode(BaseModel):
    id: str
    name: str
    type: str
    description: Optional[str] = None
    val: Optional[float] = 1.0
    color: Optional[str] = None

class GraphLink(BaseModel):
    source: str
    target: str
    relation: str
    evidence: Optional[str] = None

class GraphData(BaseModel):
    nodes: List[GraphNode] = Field(default_factory=list)
    links: List[GraphLink] = Field(default_factory=list)

class ReconstructionResponse(BaseModel):
    query: str
    direct_answer: str
    reasoning_summary: str
    confidence_score: str = Field(..., description="'high' | 'medium' | 'low'")
    confidence_rationale: str
    timeline: List[ExtractedEvent] = Field(default_factory=list)
    graph: GraphData
    citations: List[CitationItem] = Field(default_factory=list)
    missing_context: List[MissingContextItem] = Field(default_factory=list)
    sources_used: List[str] = Field(default_factory=list, description="List of source document IDs used")
    backend_only: bool = Field(default=False, description="True if answer was computed without Gemini")
