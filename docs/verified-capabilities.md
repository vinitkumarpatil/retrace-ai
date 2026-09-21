# ReTrace Verified Capabilities

Generated: 2026-09-21
Based on: Code inspection, 16 critical tests, 22-point demo verification

---

## IMPLEMENTED + VERIFIED

### Core Pipeline
- **Text ingestion**: POST /api/ingest/text accepts title, text, source_type. Chunking, embedding, extraction all execute. VERIFIED via test and demo script.
- **URL ingestion**: POST /api/ingest/url fetches and scrapes web pages using httpx + BeautifulSoup. VERIFIED in code.
- **File ingestion**: POST /api/ingest/file accepts PDF/image/text uploads. PDF extraction via pypdf. VERIFIED in code.
- **Document listing**: GET /api/context/documents returns all documents with entity/event counts. VERIFIED.
- **Entity graph**: GET /api/context/graph returns nodes and links from extracted entities/relationships. VERIFIED (37 nodes, 15 links in Phoenix dataset).

### Retrieval
- **Vector similarity search**: NumPy cosine similarity over SQLite embeddings. Returns top-k chunks ranked by similarity. VERIFIED in code (db.py:322-380).
- **Keyword search**: SQL LIKE matching across document chunks. Scores by proportion of query keywords matched. VERIFIED in code (db.py:382-422).
- **Hybrid reciprocal fusion**: Combines vector (0.6 weight) and keyword (0.4 weight) results using reciprocal rank fusion. Deduplicates by chunk ID. VERIFIED in code (retrieval_service.py:193-209).
- **Supabase pgvector mode**: When Supabase credentials provided, uses match_chunks RPC function with HNSW index. VERIFIED in code (db.py:324-337).

### Extraction (Heuristic Mode)
- **Person extraction**: Detects @mentions and capitalized name patterns (e.g., "Sarah Kim"). VERIFIED in code (gemini_service.py:89-99).
- **System/tech extraction**: Matches against hardcoded list (PostgreSQL, Kafka, Redis, etc.). VERIFIED in code (gemini_service.py:102-110).
- **Decision sentence extraction**: Detects sentences containing decision keywords (decided, approved, rejected, etc.). VERIFIED in code (gemini_service.py:112-136).
- **Date extraction**: Regex patterns for YYYY-MM-DD, Month DD YYYY, Q1-Q4 YYYY. Fallback "Timeline Reference" when no dates found. VERIFIED in code (gemini_service.py:83-87, 138-148).

### Query Reconstruction
- **Decision queries**: "Why did we change the architecture?" returns answer, citations, timeline, missing context. VERIFIED via test.
- **Attribution queries**: "Who approved Architecture B?" returns answer with citations. VERIFIED via test.
- **Incident queries**: "What happened during the payment outage?" cites Incident Retrospective #112. VERIFIED via test.
- **Alternatives queries**: "What alternatives were considered and rejected?" returns answer with citations. VERIFIED via test.
- **Cross-source queries**: Pulls citations from 2+ documents. VERIFIED via test.
- **Missing context detection**: Returns flags with category, description, impact, suggested_investigation. VERIFIED via test.
- **Unsupported questions**: Returns response without crashing. VERIFIED via test.
- **Malformed input**: Empty query returns 400, missing field returns 422. VERIFIED via test.

### Evidence Traceability
- **Citations**: Each citation includes document_id, document_title, source_type, quote, relevance. VERIFIED.
- **Timeline events**: Each event includes date, title, description, decision, actors, evidence_quote, document_title. VERIFIED.
- **Frontend EvidencePanel**: Displays document title, source type badge, relevance note, exact verbatim quote. VERIFIED in code.
- **Frontend NarrativeCard**: Displays direct answer, reasoning summary, confidence score, confidence rationale. VERIFIED in code.

### Demo Dataset
- **Project Phoenix**: 4 documents covering architecture migration scenario. VERIFIED.
  - RFC-037: Payment Processing Architecture Overhaul (10 entities, 2 events)
  - Slack Transcript: Architecture B Kickoff (6 entities, 2 events)
  - Incident Retrospective #112: Payment Service Outage (7 entities, 1 event)
  - Architecture Board Meeting Notes: Q4 2024 Review (6 entities, 2 events)

### Frontend
- **Zero TypeScript errors**: npx tsc --noEmit passes. VERIFIED.
- **Blueprint drafting aesthetic**: Parchment canvas, drafting accents, technical grid. VERIFIED in code.
- **All 9 components**: Navbar, QueryConsole, NarrativeCard, MissingContextCallout, TimelineView, RelationshipGraph, EvidencePanel, IngestionZone, DocumentLibrary. VERIFIED.

---

## IMPLEMENTED BUT PARTIALLY VERIFIED

### Cross-Source Causal Reasoning
- **Retrieval**: Correctly pulls from multiple documents. VERIFIED.
- **Synthesis**: Heuristic mode produces generic answers that don't explain causal connections. With Gemini, would synthesize proper answers. PARTIALLY VERIFIED (retrieval works, synthesis is weak in heuristic mode).

### Relationship Extraction
- **Heuristic mode**: Only creates 1 relationship per document (first actor -> first tech keyword). Very limited. PARTIALLY VERIFIED.
- **Gemini mode**: Prompt asks for detailed relationships with source, target, relation, context. Not tested (no API key).

### Temporal Reasoning
- **Date extraction**: Regex captures some dates. Fallback "Timeline Reference" for undated events. PARTIALLY VERIFIED.
- **Chronological ordering**: Timeline events are NOT sorted chronologically. Non-meaningful date labels ("Historical Record", "Timeline Reference"). NOT VERIFIED.

### Entity Extraction Quality
- **Heuristic extraction produces false positives**: "Problem Statement", "Rejected Alternatives", "Action Items", "Root Cause" incorrectly identified as person entities. PARTIALLY VERIFIED (extraction runs but quality is low).

### Confidence Scoring
- **Heuristic mode**: Always returns "medium" when 2+ chunks retrieved, "low" otherwise. Not based on actual evidence quality. PARTIALLY VERIFIED.

---

## PLANNED / NOT IMPLEMENTED

### Chrome Extension
- No Chrome extension code exists in the repository.
- NOT IMPLEMENTED.

### Advanced Hybrid Retrieval
- No entity-based relevance scoring.
- No temporal relevance (recency boosting).
- No relationship graph proximity boosting.
- Only vector + keyword fusion is implemented.
- NOT IMPLEMENTED (only basic hybrid).

### Multi-User Architecture
- No authentication/authorization on any endpoint.
- No user sessions or data isolation.
- NOT IMPLEMENTED.

### Production Deployment
- No Docker/container configuration.
- No CI/CD pipeline.
- No production database setup.
- NOT IMPLEMENTED.

### Gemini AI Integration (Full)
- System prompt and extraction prompt are defined but require a valid GEMINI_API_KEY.
- Heuristic fallback is functional but produces lower quality results.
- PARTIALLY IMPLEMENTED (prompts exist, key required for full functionality).

### Image OCR / Vision
- extract_from_image_with_gemini() exists in code.
- Requires Gemini API key for actual OCR.
- Fallback returns placeholder text.
- PARTIALLY IMPLEMENTED (code exists, needs API key).

### URL Ingestion (Production)
- Works for simple pages.
- May fail on JavaScript-heavy sites, paywalls, rate limiting.
- PARTIALLY VERIFIED.

---

## TEST RESULTS

### Critical Tests (test_critical.py)
```
16/16 passed in 2.32s
- test_decision_query PASSED
- test_attribution_query PASSED
- test_incident_query PASSED
- test_alternatives_query PASSED
- test_cross_source_query PASSED
- test_unsupported_question PASSED
- test_missing_context_detection PASSED
- test_empty_query PASSED
- test_whitespace_query PASSED
- test_missing_query_field PASSED
- test_nonsensical_query PASSED
- test_health_endpoint PASSED
- test_documents_endpoint PASSED
- test_graph_endpoint PASSED
- test_ingest_text_endpoint PASSED
- test_seed_endpoint PASSED
```

### Demo Verification (verify_demo.py)
```
22/22 passed
- Backend health: PASS
- Database mode: PASS (local-sqlite-vector)
- Phoenix seed: PASS (4 documents)
- Document count: PASS
- RFC-037 present: PASS
- Slack Transcript present: PASS
- Incident #112 present: PASS
- Board Meeting present: PASS
- Graph nodes: PASS (37 nodes)
- Graph links: PASS (15 links)
- Decision query: PASS
- Attribution query: PASS
- Incident query: PASS
- Alternatives query: PASS
- Cross-source query: PASS
- Missing context query: PASS
- Missing context flags: PASS
- Flag structure: PASS
- Unsupported question: PASS
- Empty query validation: PASS
- Missing query validation: PASS
- Text ingestion: PASS
```
