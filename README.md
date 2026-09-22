# ReTrace — AI-Powered Context Reconstruction System

[![Next.js](https://img.shields.io/badge/Next.js-14-black?style=flat&logo=next.js)](https://nextjs.org/)
[![FastAPI](https://img.shields.io/badge/FastAPI-0.110+-009688?style=flat&logo=fastapi)](https://fastapi.tiangolo.com/)
[![Google Gemini](https://img.shields.io/badge/Google_Gemini-Flash-4285F4?style=flat&logo=google)](https://deepmind.google/technologies/gemini/)
[![License](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)

**ReTrace** does not merely search for information. It reconstructs the context connecting fragmented information and explicitly identifies where that context is missing.

When engineers leave, teams reorganize, or architectural pivots happen in Slack threads, the "why" behind past decisions is lost. ReTrace analyzes your scattered PDFs, meeting notes, and transcripts to reconstruct clear timelines, map entity relationships, and flag missing information.

---

## Problem

Teams lose critical context when:
- Engineers leave and institutional knowledge walks out the door
- Decisions are made in Slack threads that get buried
- Meeting notes are scattered across different tools
- Architecture decisions lack documented rationale
- Incident postmortems don't connect to root causes

## Solution

ReTrace reconstructs lost context by:
1. Ingesting scattered documentation from multiple sources
2. Extracting entities, relationships, events, and decisions
3. Building a searchable knowledge graph
4. Answering natural language questions with full source traceability
5. Explicitly identifying where context is missing

---

## Architecture

```text
                    USER
                     |
          +----------+----------+
          |                     |
     Local Files             Browser Tabs
      / Folders              / Pages
          |                     |
          +----------+----------+
                     v
              CONTEXT CAPTURE
                     v
              SOURCE LEDGER
                     v
             CONTENT STORAGE
                     v
             INDEXING ENGINE
                     v
       +-------------+-------------+
       v             v             v
    Keyword        Vector       Metadata
    Search         Search        Search
       +-------------+-------------+
                     v
              HYBRID RANKING
                     v
              RANKED EVIDENCE
                     v
              WORK ENGINE
                     |
             +-------+-------+
             v               v
       Backend Logic       Gemini
             |               |
             +-------+-------+
                     v
           CONTEXT RECONSTRUCTION
                     v
       +--------+--------+--------+-------------+
       v        v        v        v             v
     Answer   Timeline Evidence Graph   Missing Context
                                           +
                                        Confidence
```

---

## Input Sources

### Local Files
- PDF documents
- Text files and Markdown
- JSON and CSV data
- Source code files
- DOC/DOCX (via text extraction)

### Browser Tabs (Chrome Extension)
- Web pages and articles
- GitHub discussions
- Wiki pages
- Documentation sites
- Slack/Teams messages (via copy-paste)

### Demo Data
- Project Phoenix: Architecture Migration scenario
- 4 interconnected documents demonstrating cross-source reconstruction

---

## Search Engine

### Keyword Search
Matches tokens across document chunks, scoring by keyword proportion.

### Vector Search
Uses NumPy cosine similarity over 768-dim embeddings (Gemini embedding-001 or deterministic fallback).

### Metadata Filter
Filter by project, source type, date, domain, entity, or topic.

### Hybrid Ranking
Combines vector similarity (60%) and keyword match (40%) using reciprocal rank fusion.

---

## Work Engine

The Work Engine separates deterministic backend processing from Gemini reasoning:

### Backend-Only Operations
- Simple search queries ("Show files mentioning X")
- Document listing and filtering
- Metadata filtering
- Content hash deduplication
- Cache lookup/storage
- Timeline sorting
- Confidence calculation
- Graph retrieval

### Gemini Operations
- Complex reasoning queries ("Why did we change the architecture?")
- Entity extraction during ingestion
- Image OCR

### Query Classification
```
USER QUERY
    v
QUERY CLASSIFICATION
    v
Can deterministic backend answer?
    |
    +-- YES --> backend-only (no Gemini token cost)
    |
    +-- NO
         v
    retrieve evidence
         v
    minimize evidence
         v
    Gemini reasoning
```

---

## Context Reconstruction

Given a question and relevant evidence, ReTrace produces:

- **Answer**: Clear, direct response backed by evidence
- **Timeline**: Chronological sequence of events
- **Evidence**: Source-traceable citations with paths and URLs
- **Graph**: Entity relationships and connections
- **Missing Context**: Query-specific gaps in available information
- **Confidence**: Deterministic score based on evidence quality

### Missing Context Detection
ReTrace distinguishes between:
- **Documented fact**: Directly supported by evidence
- **Inference**: Reasonably inferred from multiple sources
- **Unknown**: Not supported by available evidence

Example: If the evidence shows an incident followed by an architecture discussion, ReTrace does NOT automatically claim "the incident caused the change." Instead: "The incident and architecture discussion are connected across the available sources, but the documents do not explicitly establish that the incident alone caused the decision."

---

## Chrome Extension

### Installation
1. Open `chrome://extensions/`
2. Enable "Developer mode"
3. Click "Load unpacked"
4. Select the `extension/` directory

### Usage
1. Navigate to any web page
2. Click the ReTrace icon
3. Preview the page content
4. Choose a project
5. Click **Save Context** or **Save + Ask**

---

## Setup

### Prerequisites
- Node.js 18+
- Python 3.10+
- (Optional) Google Gemini API Key

### Backend

```bash
cd backend
python -m venv .venv
# Windows:
.\.venv\Scripts\activate
# Linux/macOS:
source .venv/bin/activate

pip install -r requirements.txt
cp .env.example .env
# Edit .env with your settings
python run.py
```

### Frontend

```bash
cd frontend
npm install
cp .env.example .env
npm run dev
```

### Chrome Extension

```bash
# Load extension/ directory in chrome://extensions/
```

---

## API Endpoints

### Ingestion
- `POST /api/ingest/text` - Ingest raw text/notes
- `POST /api/ingest/url` - Scrape and ingest a URL
- `POST /api/ingest/file` - Upload and ingest a file
- `POST /api/ingest/browser` - Ingest browser context

### Query
- `POST /api/query` - Reconstruct context for a question
- `GET /api/search` - Backend-only search with source traceability

### Context
- `GET /api/context/documents` - List all documents (supports project filter)
- `GET /api/context/documents/{doc_id}` - Get single document
- `GET /api/context/graph` - Get entity relationship graph
- `POST /api/context/seed` - Seed Project Phoenix demo data

### Health
- `GET /api/health` - Check system status

---

## Demo Questions

### Simple (Backend-Only)
> "Show documents related to Architecture B."

Expected: Backend-only search, no Gemini tokens used.

### Decision
> "Why did we change the architecture?"

Expected: Cross-source reconstruction with timeline and evidence.

### Cross-Source
> "What evidence connects the payment outage to the decision to move to Architecture B?"

Expected: Multiple source citations with explicit evidence vs inference distinction.

### Attribution
> "Who approved Architecture B?"

Expected: Evidence-backed answer or explicit missing-context result.

### Missing Context
> "What context is missing from this decision?"

Expected: Query-specific missing-context analysis.

---

## Testing

### Critical Tests
```bash
cd backend
python -m pytest tests/test_critical.py -v
```
Expected: 16/16 passed

### Demo Verification
```bash
cd backend
python verify_demo.py
```
Expected: 22/22 passed, FINAL: DEMO READY

---

## Project Structure

```
retrace-ai/
+-- backend/
|   +-- app/
|   |   +-- main.py              # FastAPI application
|   |   +-- config.py            # Environment settings
|   |   +-- db.py                # Dual-mode storage layer
|   |   +-- models.py            # Pydantic schemas
|   |   +-- api/
|   |   |   +-- ingest.py        # Ingestion endpoints
|   |   |   +-- query.py         # Query & context endpoints
|   |   +-- services/
|   |       +-- extractor.py     # Document parser & chunker
|   |       +-- gemini_service.py # AI extraction
|   |       +-- embedding_service.py # Vector embeddings
|   |       +-- retrieval_service.py # Hybrid search
|   |       +-- work_engine.py   # Deterministic processing
|   +-- tests/
|   +-- verify_demo.py           # 22-point demo verification
|   +-- requirements.txt
|   +-- .env.example
+-- frontend/
|   +-- src/
|   |   +-- app/page.tsx         # Main dashboard
|   |   +-- components/          # 9 React components
|   |   +-- lib/api.ts           # API client
|   |   +-- lib/types.ts         # TypeScript types
|   +-- package.json
+-- extension/                   # Chrome Extension (Manifest V3)
|   +-- manifest.json
|   +-- popup.html
|   +-- popup.js
|   +-- content.js
|   +-- background.js
+-- docs/
|   +-- architecture.md
|   +-- verified-capabilities.md
+-- README.md
```

---

## Security & Privacy

- **Explicit Capture Only**: Chrome extension only captures when you click Save
- **No Silent Collection**: Does not collect browsing history
- **Local Storage**: Data stored locally in SQLite by default
- **API Keys**: Environment variables excluded via .gitignore
- **No Hallucination**: Explicitly flags missing context rather than inventing facts

---

## Environment Variables

### Backend (.env)
```env
GEMINI_API_KEY=your_key_here     # Optional for AI features
HOST=127.0.0.1
PORT=8000
ENVIRONMENT=development
CORS_ORIGINS=http://localhost:3000

# Optional Supabase (falls back to SQLite)
SUPABASE_URL=
SUPABASE_KEY=
```

### Frontend (.env)
```env
NEXT_PUBLIC_API_URL=http://localhost:8000
```

---

## License

MIT License
