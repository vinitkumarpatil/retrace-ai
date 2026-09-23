# ReTrace Architecture Implementation Report

Date: 2026-09-21

## WHAT ALREADY EXISTED

| Component | Status | Location |
|-----------|--------|----------|
| Local SQLite storage | ✓ Complete | db.py:44-108 |
| Document table | ✓ Partial | db.py:49-57 |
| PDF ingestion | ✓ Complete | extractor.py:66-92, ingest.py:132-136 |
| Text ingestion | ✓ Complete | extractor.py:132-141, ingest.py:59-89 |
| URL ingestion | ✓ Complete | extractor.py:94-130, ingest.py:91-116 |
| File upload ingestion | ✓ Complete | ingest.py:118-173 |
| Text chunking | ✓ Complete | extractor.py:8-64 |
| Keyword search | ✓ Complete | db.py:382-422 |
| Vector search (NumPy cosine) | ✓ Complete | db.py:322-380 |
| Hybrid reciprocal fusion | ✓ Complete | retrieval_service.py:192-209 |
| Entity/relationship/event storage | ✓ Complete | db.py:182-318 |
| Gemini integration | ✓ Complete | gemini_service.py, retrieval_service.py:240-302 |
| Heuristic fallback | ✓ Complete | gemini_service.py:72-167, retrieval_service.py:82-176 |
| Evidence citations | ✓ Complete | models.py:68-72 |
| Frontend UI | ✓ Complete | 9 components, zero TS errors |

## WHAT WAS CHANGED

### 1. Source Ledger Expansion (db.py)
- Added columns to `documents` table: `path`, `url`, `content_hash`, `project`, `modified_at`, `indexed_at`, `index_status`
- Added `compute_content_hash()` function for deduplication
- Added `parse_date_for_sorting()` function for timeline ordering
- Added `get_document_by_id()` for single document retrieval
- Added `check_content_hash()` for duplicate detection
- Added `get_cache()` / `set_cache()` for query caching
- Added `query_cache` table

### 2. Metadata Filtering (db.py)
- `search_chunks_by_vector()` now accepts `project` and `source_type` filters
- `search_chunks_by_keywords()` now accepts `project` and `source_type` filters
- Filters are applied at SQL level before vector/keyword scoring

### 3. Content Hash Deduplication (db.py, ingest.py)
- `compute_content_hash()` generates SHA-256 hash of content
- `check_content_hash()` checks if content already exists
- Ingestion endpoints detect duplicates and return existing document_id
- `IngestResponse` model now includes `content_hash` and `is_duplicate` fields

### 4. Cache Layer (db.py, retrieval_service.py)
- `query_cache` table stores query results with hit counts
- `get_cache()` retrieves cached results and increments hit count
- `set_cache()` stores new results
- Cache key is SHA-256 of query + filters
- Cached results include hit count in confidence rationale

### 5. Backend-Only Query Routing (retrieval_service.py, query.py)
- `_is_backend_only_query()` detects simple queries that don't need Gemini
- Patterns: "show files", "list documents", "find sources", "search", "filter"
- Backend-only queries skip Gemini and use heuristic reconstruction
- `ReconstructionResponse` now includes `backend_only` flag

### 6. Source Traceability (models.py, retrieval_service.py)
- `CitationItem` model now includes: `path`, `url`, `chunk_id`, `score`
- `_build_source_traceable_citation()` builds citations with full traceability
- `ReconstructionResponse` now includes `sources_used` list

### 7. Timeline Chronological Sorting (retrieval_service.py)
- `_sort_timeline_chronologically()` sorts events by parsed date
- Supports YYYY-MM-DD, Month DD YYYY, Q1-Q4 YYYY formats
- Undated events placed at end

### 8. Deterministic Confidence (retrieval_service.py)
- `_calculate_deterministic_confidence()` computes confidence from signals:
  - Number of evidence chunks
  - Number of timeline events
  - Source diversity (distinct documents)
  - Average vector similarity
- Returns high/medium/low with explanatory rationale

### 9. New Endpoints (query.py)
- `GET /api/search` - Backend-only search with source traceability
- `GET /api/context/documents/{doc_id}` - Single document retrieval
- `GET /api/context/documents` now supports `project` and `source_type` filters
- `POST /api/query` now supports `project` and `source_type` filters

## WHAT IS FULLY WORKING

- Source Ledger with path, url, content_hash, project, indexed_at
- Metadata filtering by project and source_type
- Content hash deduplication (duplicate detection)
- Query caching with hit counts
- Backend-only query routing (simple queries skip Gemini)
- Source traceable citations (document_id, path, url, chunk_id, score)
- Timeline chronological sorting
- Deterministic confidence calculation
- All 16 critical tests pass
- All 22 demo verification checks pass

## WHAT IS PARTIALLY WORKING

- Backend-only query detection: Pattern matching works but may miss some simple queries
- Timeline sorting: Works for YYYY-MM-DD and Month DD YYYY formats, may not parse all formats
- Confidence calculation: Based on heuristics, not ground-truth validated

## WHAT REMAINS

- Chrome extension (not started)
- Advanced hybrid retrieval (entity/temporal/relationship relevance)
- Production deployment
- Gemini API key configuration (required for AI-quality synthesis)
- DOC/DOCX file support (requires python-docx)
- JSON/CSV file support (requires custom parsers)

## WHICH OPERATIONS USE GEMINI

- Complex reasoning queries ("Why did we change the architecture?")
- Entity extraction during ingestion (when API key configured)
- Image OCR (when API key configured)

## WHICH OPERATIONS ARE BACKEND-ONLY

- Simple search queries ("Show files mentioning X")
- Document listing and filtering
- Metadata filtering
- Content hash deduplication
- Cache lookup/storage
- Timeline sorting
- Confidence calculation
- Graph retrieval
- Health checks

## GEMINI CALLS DURING SIMPLE QUERIES

Verified: Simple queries like "Show files mentioning Architecture B" are routed to backend-only path and do NOT call Gemini. The `_is_backend_only_query()` function detects these patterns and returns `backend_only=True` in the response.

## TEST RESULTS

### Critical Tests (test_critical.py)
```
16/16 passed in 2.29s
```

### Demo Verification (verify_demo.py)
```
22/22 passed
FINAL: DEMO READY
```

### New Architecture Features
```
Backend-only search: ✓
Metadata filtering: ✓
Content hash deduplication: ✓
Cache: ✓
Source traceability: ✓
Backend-only flag: ✓
Timeline sorting: ✓
Deterministic confidence: ✓
```
