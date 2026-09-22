# ReTrace AI — Current System Audit

**Audit Date:** 2026-09-21  
**Status:** Pre-Deployment  
**Overall Rating:** `PROTOTYPE / PROOF OF CONCEPT`

---

## Table of Contents

1. [Architecture Overview](#architecture-overview)
2. [Backend API Endpoints](#backend-api-endpoints)
3. [Backend File Inventory](#backend-file-inventory)
4. [Frontend File Inventory](#frontend-file-inventory)
5. [Database Schema](#database-schema)
6. [AI Pipeline](#ai-pipeline)
7. [Known Limitations](#known-limitations)
8. [Suspicious / Fragile Code](#suspicious--fragile-code)
9. [Test Coverage](#test-coverage)
10. [Deployment Status](#deployment-status)
11. [Missing Features](#missing-features)

---

## Architecture Overview

| Component       | Technology                              | Status       |
|-----------------|-----------------------------------------|--------------|
| Backend         | FastAPI (Python 3.10+), port 8000       | `OPERATIONAL` |
| Frontend        | Next.js 14 (React 18, TypeScript), port 3000 | `OPERATIONAL` |
| Database        | Dual-mode — Supabase PostgreSQL+pgvector OR local SQLite+NumPy | `OPERATIONAL` |
| AI Provider     | Google Gemini API                       | `OPERATIONAL` |
| Embeddings      | gemini-embedding-001                    | `OPERATIONAL` |
| Offline Fallback| Deterministic/heuristic for every Gemini call | `OPERATIONAL` |

---

## Backend API Endpoints

All endpoints verified in source code.

| Method | Path                    | Description                                      | Status      |
|--------|-------------------------|--------------------------------------------------|-------------|
| GET    | `/`                     | Root endpoint, returns app metadata              | `VERIFIED`  |
| GET    | `/api/health`           | Health check with Gemini/Supabase config status  | `VERIFIED`  |
| POST   | `/api/ingest/text`      | Ingest raw text/markdown/notes                   | `VERIFIED`  |
| POST   | `/api/ingest/url`       | Scrape and ingest URL content                    | `VERIFIED`  |
| POST   | `/api/ingest/file`      | Upload PDF/image/text file                       | `VERIFIED`  |
| POST   | `/api/query`            | Main reconstruction query endpoint               | `VERIFIED`  |
| GET    | `/api/context/documents`| List all ingested documents                      | `VERIFIED`  |
| GET    | `/api/context/graph`    | Global entity-relationship graph                 | `VERIFIED`  |
| POST   | `/api/context/seed`     | Seed "Project Meridian" demo data (3 documents)  | `VERIFIED`  |

---

## Backend File Inventory

| File                          | Lines | Purpose                                       | Status      |
|-------------------------------|-------|-----------------------------------------------|-------------|
| `app/main.py`                 | 57    | FastAPI app, CORS, routers                    | `VERIFIED`  |
| `app/config.py`               | 44    | Pydantic settings, `.env` loading             | `VERIFIED`  |
| `app/db.py`                   | 528   | Dual-backend DatabaseClient, 5 tables, vector search, keyword search | `VERIFIED`  |
| `app/models.py`               | 102   | 12 Pydantic v2 models                         | `VERIFIED`  |
| `app/api/ingest.py`           | 173   | 3 ingestion endpoints                         | `VERIFIED`  |
| `app/api/query.py`            | 158   | Query, documents, graph, seed endpoints       | `VERIFIED`  |
| `app/services/extractor.py`   | 141   | Text chunking, PDF extraction, URL scraping    | `VERIFIED`  |
| `app/services/gemini_service.py`    | 259   | Entity extraction with model fallback chain    | `VERIFIED`  |
| `app/services/embedding_service.py` | 79    | Gemini embeddings with mock fallback           | `VERIFIED`  |
| `app/services/retrieval_service.py` | 306   | Hybrid retrieval with reciprocal rank fusion   | `VERIFIED`  |

---

## Frontend File Inventory

| File                                    | Lines | Purpose                                      | Status      |
|-----------------------------------------|-------|----------------------------------------------|-------------|
| `src/app/page.tsx`                      | 230   | Main dashboard with all state management     | `VERIFIED`  |
| `src/app/layout.tsx`                    | 21    | Root layout                                  | `VERIFIED`  |
| `src/app/globals.css`                   | 97    | Blueprint drafting aesthetic                 | `VERIFIED`  |
| `src/components/Navbar.tsx`             | 94    | Header with status bar                       | `VERIFIED`  |
| `src/components/QueryConsole.tsx`       | 102   | Search with sample questions                 | `VERIFIED`  |
| `src/components/NarrativeCard.tsx`      | 112   | Answer with confidence scoring               | `VERIFIED`  |
| `src/components/MissingContextCallout.tsx` | 104  | Gap detection display                        | `VERIFIED`  |
| `src/components/TimelineView.tsx`       | 153   | Chronological timeline                       | `VERIFIED`  |
| `src/components/RelationshipGraph.tsx`  | 205   | Force-directed graph                         | `VERIFIED`  |
| `src/components/EvidencePanel.tsx`      | 94    | Source citations                             | `VERIFIED`  |
| `src/components/IngestionZone.tsx`      | 269   | File/text/URL upload modal                   | `VERIFIED`  |
| `src/components/DocumentLibrary.tsx`    | 87    | Document list modal                          | `VERIFIED`  |
| `src/lib/api.ts`                        | 77    | 7 API client functions                       | `VERIFIED`  |
| `src/lib/types.ts`                      | 79    | 10 TypeScript interfaces                     | `VERIFIED`  |

---

## Database Schema

### Table: `documents`

| Column      | Type      | Description              |
|-------------|-----------|--------------------------|
| `id`        | UUID      | Primary key              |
| `title`     | TEXT      | Document title           |
| `source_type` | TEXT    | text, url, file, seed    |
| `raw_content` | TEXT    | Full raw text content    |
| `metadata`  | JSONB     | Arbitrary metadata       |
| `created_at` | TIMESTAMP | Creation timestamp      |

### Table: `document_chunks`

| Column         | Type          | Description               |
|----------------|---------------|---------------------------|
| `id`           | UUID          | Primary key               |
| `document_id`  | UUID (FK)     | References `documents.id` |
| `chunk_index`  | INTEGER       | Order within document     |
| `chunk_text`   | TEXT          | Chunk content             |
| `embedding`    | VECTOR(768)   | Gemini embedding vector   |
| `metadata`     | JSONB         | Arbitrary metadata        |

### Table: `extracted_entities`

| Column        | Type      | Description                  |
|---------------|-----------|------------------------------|
| `id`          | UUID      | Primary key                  |
| `document_id` | UUID (FK) | References `documents.id`    |
| `name`        | TEXT      | Entity name                  |
| `type`        | TEXT      | Person, Organization, etc.   |
| `role`        | TEXT      | Role or context              |
| `description` | TEXT      | Brief description            |

### Table: `extracted_relationships`

| Column           | Type      | Description                  |
|------------------|-----------|------------------------------|
| `id`             | UUID      | Primary key                  |
| `document_id`    | UUID (FK) | References `documents.id`    |
| `source_entity`  | TEXT      | Source entity name            |
| `target_entity`  | TEXT      | Target entity name            |
| `relation_type`  | TEXT      | Relationship type            |
| `context`        | TEXT      | Context of relationship      |

### Table: `extracted_events`

| Column         | Type      | Description                     |
|----------------|-----------|---------------------------------|
| `id`           | UUID      | Primary key                     |
| `document_id`  | UUID (FK) | References `documents.id`       |
| `date_str`     | TEXT      | Event date as string            |
| `title`        | TEXT      | Event title                     |
| `description`  | TEXT      | Event description               |
| `decision`     | TEXT      | Decision made (if any)          |
| `actors`       | TEXT      | People or groups involved       |
| `evidence_quote` | TEXT    | Direct quote from source        |

---

## AI Pipeline

Verified end-to-end in source code:

```
1. Raw Input
     │
     ▼
extractor.py ─── Chunking, PDF extraction, URL scraping
     │
     ▼
embedding_service.py ─── Gemini embedding-001 (or mock fallback)
     │
     ▼
gemini_service.py ─── Entity/relationship/event extraction (or heuristic fallback)
     │
     ▼
retrieval_service.py ─── Vector search + keyword search
                         → Reciprocal rank fusion
                         → Gemini synthesis (or heuristic fallback)
```

Every Gemini call has a deterministic offline fallback.

---

## Known Limitations

| # | Limitation                                                    | Severity |
|---|---------------------------------------------------------------|----------|
| 1 | Test coverage: Only 1 integration test (requires real Gemini API key) | HIGH     |
| 2 | No `.env` file exists (only `.env.example`) — needs to be created | HIGH     |
| 3 | SQLite vector search loads all chunks into memory for cosine similarity — fine for demo, not production | MEDIUM   |
| 4 | Gemini model names reference potentially forward-looking versions (3.6-flash) with fallback chain | MEDIUM   |
| 5 | No authentication/authorization on any endpoints              | HIGH     |
| 6 | CORS defaults to wildcard when `ALLOWED_ORIGINS` is empty     | MEDIUM   |
| 7 | Seed endpoint creates "Project Meridian" not "Project Phoenix" — needs updating for demo | LOW      |
| 8 | No Chrome extension exists                                    | HIGH     |
| 9 | Frontend has no `.env` file — needs `NEXT_PUBLIC_API_URL=http://localhost:8000` | HIGH     |

---

## Suspicious / Fragile Code

| # | File                      | Issue                                                                                             | Risk     |
|---|---------------------------|---------------------------------------------------------------------------------------------------|----------|
| 1 | `gemini_service.py`       | Tries models `"models/gemini-3.6-flash"`, `"models/gemini-3.5-flash-lite"`, `"gemini-3.6-flash"` — may not exist, but fallback handles it | LOW      |
| 2 | `embedding_service.py`    | Uses `"gemini-embedding-001"` — verify this model name exists                                     | MEDIUM   |
| 3 | `db.py`                   | SQLite search loads ALL chunks into memory for cosine similarity                                  | MEDIUM   |
| 4 | `src/lib/api.ts`          | **BUG**: Seed endpoint path is `"/api/ctx/seed"` (line 72) but backend route is `"/api/context/seed"` | HIGH     |

---

## Test Coverage

| Item                       | Details                                         | Status        |
|---------------------------|-------------------------------------------------|---------------|
| Integration test file     | `tests/test_integration.py`, 93 lines           | `EXISTS`      |
| Tests: health check       | Yes                                             | `VERIFIED`    |
| Tests: seed               | Yes                                             | `VERIFIED`    |
| Tests: list documents     | Yes                                             | `VERIFIED`    |
| Tests: graph              | Yes                                             | `VERIFIED`    |
| Tests: query              | Yes                                             | `VERIFIED`    |
| Tests: dynamic ingestion  | Yes                                             | `VERIFIED`    |
| Requires real API key     | Asserts `GEMINI_API_KEY` configured is True      | `LIMITATION`  |
| Unit tests                | None                                            | `MISSING`     |
| Mocked tests              | None                                            | `MISSING`     |

---

## Deployment Status

| Item                        | Status         |
|-----------------------------|----------------|
| Deployed                    | `NOT DEPLOYED` |
| Deployment configuration    | `MISSING`      |
| Backend Python env          | `NEEDS SETUP`  |
| Backend `pip install`       | `NEEDS SETUP`  |
| Frontend `npm install`      | `NEEDS SETUP`  |
| Frontend `.env`             | `NEEDS CREATION` |

---

## Missing Features

| # | Feature                           | Priority |
|---|-----------------------------------|----------|
| 1 | Chrome Extension                  | HIGH     |
| 2 | Project Phoenix demo dataset      | HIGH     |
| 3 | Demo mode with deterministic output | HIGH   |
| 4 | Production deployment config      | HIGH     |
| 5 | Comprehensive test suite          | HIGH     |
