# ReTrace — AI-Powered Lost Context Recovery Tool

[![Next.js](https://img.shields.io/badge/Next.js-14-black?style=flat&logo=next.js)](https://nextjs.org/)
[![FastAPI](https://img.shields.io/badge/FastAPI-0.110+-009688?style=flat&logo=fastapi)](https://fastapi.tiangolo.com/)
[![Google Gemini](https://img.shields.io/badge/Google_Gemini-3.6_Flash-4285F4?style=flat&logo=google)](https://deepmind.google/technologies/gemini/)
[![pgvector](https://img.shields.io/badge/Supabase-pgvector-3ECF8E?style=flat&logo=supabase)](https://supabase.com/)
[![License](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)

**ReTrace** reconstructs the missing architectural context and rationale behind past engineering and product decisions. By ingesting scattered documentation (RFCs, Slack transcripts, meeting minutes, incident postmortems, and architecture diagrams), ReTrace utilizes Google Gemini and hybrid vector retrieval to answer *"what happened, why was it decided, who authorized it, and what context was never recorded."*

---

## Architectural Blueprint Aesthetic

Designed around an architectural drafting aesthetic:
- **Parchment Canvas**: Cream drafting background (`#FAF8F5`) with technical grid coordinate patterns.
- **Drafting Accents**: Muted ochre (`#D97706`), sage green (`#059669`), slate blueprint navy (`#1E293B`), and terracotta rust (`#DC2626`) for forensic warnings.
- **Strict Evidence Transparency**: Zero hallucination policy — every claim is backed by direct quotes and exact source citations. Any missing rationale is prominently flagged in a dedicated **Missing Context** banner.

---

## System Architecture

```mermaid
flowchart TD
    subgraph Ingestion["1. Multi-Modal Ingestion"]
        A1[PDF Documents / ADRs] --> B[Ingestion Service]
        A2[Screenshots / Diagrams] --> B
        A3[Meeting Notes / Slack Dumps] --> B
        A4[Webpages / Wiki URLs] --> B
    end

    subgraph Extraction["2. Forensic Knowledge Extraction"]
        B --> C[Gemini 3.6 Flash]
        C --> D1[Entities: People, Systems, Teams]
        C --> D2[Decisions & Rationale]
        C --> D3[Timeline Milestones]
        C --> D4[Relationship Links]
        C --> D5[Semantic Text Chunks]
    end

    subgraph Storage["3. Dual-Mode Storage & Vectors"]
        D5 --> E[Gemini Embedding 001]
        E --> F[Supabase pgvector / SQLite NumPy Vector Store]
        D1 & D2 & D3 & D4 --> F
    end

    subgraph Retrieval["4. Hybrid Retrieval & Reconstruction"]
        Q[User Natural Language Query] --> H[Hybrid Fusion Engine]
        H -->|Vector Cosine Similarity| F
        H -->|Keyword Token Match| F
        H --> R[Gemini Synthesis Reasoning Engine]
        R --> RES[Reconstructed Narrative]
    end

    subgraph Presentation["5. Blueprint Dashboard UI"]
        RES --> UI1[Executive Narrative Answer]
        RES --> UI2[Stepped Chronological Timeline]
        RES --> UI3[Interactive Force-Directed Entity Graph]
        RES --> UI4[Missing Context Callout Banner]
        RES --> UI5[Source Citation Cards]
    end
```

---

## Tech Stack

- **Frontend**: Next.js 14 (App Router), React 18, TypeScript, Tailwind CSS, Lucide Icons
- **Graph Visualizer**: `react-force-graph-2d` (Client-side HTML5 Canvas force-directed topology)
- **Backend**: Python 3.10+, FastAPI, Pydantic v2, Uvicorn
- **AI & LLM**: Google Gemini API (`models/gemini-3.6-flash` for extraction & reasoning, `models/gemini-embedding-001` for 768-dim embeddings)
- **Database & Vectors**: 
  - **Live Mode**: Supabase PostgreSQL with `pgvector` HNSW vector indexing
  - **Zero-Config Local Mode**: Embedded SQLite + NumPy cosine similarity engine for instant offline execution
- **Document Parsers**: PyPDF (PDF text), BeautifulSoup4 & HTTPX (Web scraping), Gemini Vision (Image OCR & diagram parsing)

---

## Repository Structure

```
retrace-ai/
├── backend/
│   ├── app/
│   │   ├── main.py              # FastAPI application & CORS configuration
│   │   ├── config.py            # Environment settings & validation
│   │   ├── db.py                # Dual-mode Supabase / SQLite storage layer
│   │   ├── models.py            # Pydantic schemas for entities and responses
│   │   ├── api/
│   │   │   ├── ingest.py        # /api/ingest endpoints (file, text, url)
│   │   │   └── query.py         # /api/query & /api/context endpoints
│   │   └── services/
│   │       ├── extractor.py     # Multi-format document parser & chunker
│   │       ├── gemini_service.py# Structured entity/event extraction
│   │       ├── embedding_service.py # Gemini 768-dim embeddings
│   │       └── retrieval_service.py # Hybrid search & context synthesis
│   ├── tests/
│   │   └── test_integration.py  # End-to-end integration test suite
│   ├── schema.sql               # Supabase PostgreSQL + pgvector schema
│   ├── requirements.txt
│   ├── .env.example
│   └── run.py
├── frontend/
│   ├── src/
│   │   ├── app/
│   │   │   ├── page.tsx         # Main interactive dashboard
│   │   │   ├── layout.tsx
│   │   │   └── globals.css      # Architectural drafting styles & grid
│   │   ├── components/
│   │   │   ├── Navbar.tsx
│   │   │   ├── QueryConsole.tsx
│   │   │   ├── NarrativeCard.tsx
│   │   │   ├── MissingContextCallout.tsx
│   │   │   ├── TimelineView.tsx
│   │   │   ├── RelationshipGraph.tsx
│   │   │   ├── EvidencePanel.tsx
│   │   │   ├── IngestionZone.tsx
│   │   │   └── DocumentLibrary.tsx
│   │   └── lib/
│   │       ├── api.ts          # Backend API client
│   │       └── types.ts        # TypeScript contracts
│   ├── package.json
│   ├── tailwind.config.ts
│   └── .env.example
├── README.md
└── .gitignore
```

---

## Quick Start Setup

### Prerequisites
- Node.js 18+ & npm
- Python 3.10+
- Google Gemini API Key ([Get one here](https://aistudio.google.com/))

### 1. Backend Setup

```bash
cd backend

# Create virtual environment
python -m venv .venv

# Activate virtual environment
# On Windows:
.\.venv\Scripts\activate
# On Linux/macOS:
source .venv/bin/activate

# Install dependencies
pip install -r requirements.txt

# Configure environment variables
cp .env.example .env
```

Edit `backend/.env`:
```env
GEMINI_API_KEY=your_gemini_api_key_here
HOST=127.0.0.1
PORT=8000
ENVIRONMENT=development
CORS_ORIGINS=http://localhost:3000,http://127.0.0.1:3000

# (Optional) Supabase Credentials
# If left empty, ReTrace seamlessly uses local SQLite + NumPy vector search
SUPABASE_URL=
SUPABASE_KEY=
```

Start the backend server:
```bash
python run.py
# API runs at http://127.0.0.1:8000
# Interactive Swagger docs at http://127.0.0.1:8000/docs
```

### 2. Frontend Setup

```bash
cd ../frontend

# Install dependencies
npm install

# Configure environment
cp .env.example .env

# Run development server
npm run dev
# Frontend runs at http://localhost:3000
```

---

## Testing the Application

### Option A: One-Click Demo Load
1. Open `http://localhost:3000` in your browser.
2. Click **"Load Project Phoenix Demo"** in the top navigation or hero banner.
3. This seeds **"Project Phoenix: Architecture Migration"** (RFC-037, Slack transcripts, incident retrospective, and architecture board meeting notes).
4. ReTrace will automatically execute a forensic recovery query:
   > *"Why did we change the architecture?"*
5. Inspect the reconstructed **Narrative**, **Stepped Timeline**, **Interactive Entity Graph**, and **Missing Context Flags**.

### Demo Question Types
The demo supports multiple question types to showcase the system's capabilities:
- **Decision questions**: "Why did we change the architecture?"
- **Attribution questions**: "Who approved Architecture B?"
- **Incident questions**: "What happened during the payment outage?"
- **Analysis questions**: "What alternatives were considered and rejected?"
- **Timeline questions**: "What is the migration timeline?"

### Option B: Run Automated Integration Tests
```bash
cd backend
.\.venv\Scripts\python.exe tests/test_integration.py
```

---

## Optional: Supabase & pgvector Setup

To run ReTrace directly against Supabase PostgreSQL:
1. Create a project at [supabase.com](https://supabase.com).
2. Open the **SQL Editor** in Supabase and paste the contents of [`backend/schema.sql`](backend/schema.sql).
3. Copy your project URL and service role key into `backend/.env`:
   ```env
   SUPABASE_URL=https://your-project.supabase.co
   SUPABASE_KEY=your_supabase_key
   ```
4. Restart the backend server. ReTrace will automatically detect Supabase and run vector queries via the `match_chunks` RPC function.

---

## Security & Privacy
- **API Keys**: All API keys and environment files are strictly excluded via `.gitignore`.
- **Zero Hallucination Guarantee**: When historical records lack specific details, ReTrace refuses to fabricate rationale and explicitly lists them as unrecovered items in the Missing Context panel.

## Demo Scenario: Project Phoenix

The demo showcases **Project Phoenix: Architecture Migration** — a realistic scenario where a team migrates from a synchronous REST-based payment processing system (Architecture A) to an event-driven microservices architecture (Architecture B).

### The Missing Context Gap
The demo deliberately includes a critical gap: **Who specifically approved Architecture B?** The documents mention it was approved by the "Architecture Board" but no individual signatory is recorded. This demonstrates ReTrace's ability to:
1. Answer the question using available evidence
2. Explicitly flag the missing information
3. Suggest investigation steps to recover the lost context

### Demo Documents
1. **RFC-037**: Payment Processing Architecture Overhaul (formal proposal)
2. **Slack Transcript**: Architecture B kickoff discussion
3. **Incident Retrospective #112**: Payment service outage during migration
4. **Architecture Board Meeting Notes**: Q4 2024 review

---

## License
MIT License. Created with Google Gemini & Antigravity.
