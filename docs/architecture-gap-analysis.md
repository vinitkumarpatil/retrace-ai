# Architecture Gap Analysis

Date: 2026-09-21

## ALREADY IMPLEMENTED

| Component | Status | Location |
|-----------|--------|----------|
| Local SQLite storage | ✓ Complete | db.py:44-108 |
| Document table (source ledger partial) | ✓ Partial | db.py:49-57 (id, title, source_type, raw_content, metadata, created_at) |
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

## MISSING (Must Implement)

| Component | Priority | Reason |
|-----------|----------|--------|
| Source Ledger fields (path, url, content_hash, project, modified_at, indexed_at) | HIGH | Core architecture requirement |
| Metadata filtering in search | HIGH | Required for project/file/date filtering |
| Content hash for deduplication | HIGH | Avoid reprocessing unchanged files |
| Cache layer for repeated queries | HIGH | Token/cost control |
| Backend-only query routing | HIGH | Simple queries should not call Gemini |
| Source traceability (path/URL in citations) | HIGH | Evidence display requirement |
| Timeline chronological sorting | HIGH | Currently unsorted |
| Deterministic confidence calculation | MEDIUM | Currently always "medium" |
| Evidence grouping by source | MEDIUM | Better evidence display |
