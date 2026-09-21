from fastapi import APIRouter, HTTPException
from app.models import QueryRequest, ReconstructionResponse
from app.services.retrieval_service import reconstruct_context
from app.services.extractor import chunk_text
from app.services.gemini_service import extract_structured_data_with_gemini
from app.services.embedding_service import generate_embeddings_batch
from app.db import db

router = APIRouter(tags=["Query & Context"])

@router.post("/api/query", response_model=ReconstructionResponse)
async def query_endpoint(payload: QueryRequest):
    """
    Search past records with a fuzzy question (e.g. 'Why did we switch databases last month?').
    Runs hybrid retrieval (pgvector cosine similarity + keyword search) and prompts Gemini
    to reconstruct the missing context narrative, chronological timeline, force graph,
    exact citations, and explicitly flagged missing context.
    """
    if not payload.query.strip():
        raise HTTPException(status_code=400, detail="Query cannot be empty.")

    try:
        response = await reconstruct_context(payload.query, top_k=payload.top_k)
        return response
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Context reconstruction failed: {str(e)}")

@router.get("/api/context/documents")
async def list_documents_endpoint():
    """List all ingested historical documents and ingestion statistics."""
    docs = await db.get_all_documents()
    return {"documents": docs, "total": len(docs)}

@router.get("/api/context/graph")
async def get_global_graph_endpoint():
    """Retrieve the global entity relationship graph for force-graph visualization."""
    entities, relationships = await db.get_all_entities_and_relationships()
    return {
        "nodes": [
            {
                "id": e["name"],
                "name": e["name"],
                "type": e["type"],
                "role": e.get("role"),
                "description": e.get("description"),
            }
            for e in entities
        ],
        "links": [
            {
                "source": r["source"],
                "target": r["target"],
                "relation": r["relation"],
                "context": r.get("context"),
            }
            for r in relationships
        ]
    }

@router.post("/api/context/seed")
async def seed_sample_project_data():
    """
    Seed realistic historical project records: 'Project Meridian: The Architecture Pivot'.
    Demonstrates lost context recovery across Slack transcripts, RFCs, and meeting notes.
    """
    sample_docs = [
        {
            "title": "RFC-204: Monolith Migration to Event-Driven Microservices",
            "source_type": "text",
            "content": (
                "RFC-204 | Author: Alice Chen (Principal Architect) | Date: 2024-07-15\n"
                "Status: Approved by Engineering Committee (Bob Martinez, Dev Director; Marcus Vance, VP Eng)\n\n"
                "Context:\n"
                "Our monolith backend in Django is experiencing severe write lock contention during peak checkout events. "
                "On July 10, 2024, our latency spiked to 4.2 seconds. "
                "Proposal:\n"
                "We propose migrating the Order and Payment domains into independent Go services communicating via Apache Kafka. "
                "Database layer will use PostgreSQL with pgvector for catalog recommendations. "
                "Rejected Alternatives:\n"
                "- Keeping MongoDB: Rejected due to lacking ACID transaction isolation required for financial reconciliation. "
                "- gRPC Synchronous Mesh: Rejected due to cascading failure risks.\n\n"
                "Decision:\n"
                "Adopt Kafka + PostgreSQL starting August 1, 2024. Team Nova will execute the migration in Phase 1."
            ),
            "metadata": {"author": "Alice Chen", "document_type": "RFC"}
        },
        {
            "title": "Slack Transcript #arch-council: Database Migration Emergency",
            "source_type": "text",
            "content": (
                "[2024-08-12 14:22] @alice_chen: We hit an unexpected blocker with the PostgreSQL pgvector deployment on AWS RDS. "
                "The vector index build is taking 45 minutes and locking catalog reads.\n"
                "[2024-08-12 14:28] @bob_martinez: Did we test HNSW vs IVFFlat indexes before migrating production traffic?\n"
                "[2024-08-12 14:35] @dave_sre: We tested with 10k rows in staging, but production has 3.8M embeddings.\n"
                "[2024-08-12 14:40] @alice_chen: Decision: We are switching immediately to HNSW indexing with m=16, ef_construction=64. "
                "Also scaling RDS instance from db.r6g.large to db.r6g.2xlarge. Dave, please execute this in window #2.\n"
                "[2024-08-12 15:10] @marcus_vance: Approved the budget increase for the 2xlarge instance for Q3."
            ),
            "metadata": {"channel": "#arch-council", "date": "2024-08-12"}
        },
        {
            "title": "Incident Retrospective #88: Vector Index Lockout",
            "source_type": "text",
            "content": (
                "Incident Retrospective #88 | Date: 2024-08-20\n"
                "Facilitator: Dave Miller (Senior SRE)\n\n"
                "What Happened:\n"
                "On August 12, 2024, the catalog search cluster suffered a 32-minute degradation during the PostgreSQL vector indexing operation.\n"
                "Root Cause:\n"
                "Lack of concurrent indexing flag and memory starvation on RDS.\n\n"
                "Action Items & Decisions:\n"
                "1. Enforce CONCURRENTLY flag for all future index creations (Owner: Dave Miller, Completed: 2024-08-14).\n"
                "2. Standardize Supabase for local staging environments to prevent configuration drift between local dev and cloud RDS.\n"
                "3. Alice Chen to publish revised Vector Store Guidelines by end of August.\n\n"
                "Unresolved Context:\n"
                "Note: It was never documented who originally authored the 10k mock dataset used in staging tests."
            ),
            "metadata": {"incident_id": "INC-88", "date": "2024-08-20"}
        }
    ]

    seeded_ids = []
    for doc in sample_docs:
        doc_id = await db.insert_document(
            title=doc["title"],
            source_type=doc["source_type"],
            raw_content=doc["content"],
            metadata=doc["metadata"]
        )
        # Chunks
        chunks = chunk_text(doc["content"], chunk_size=500, overlap=100)
        chunk_texts = [c["chunk_text"] for c in chunks]
        embeddings = await generate_embeddings_batch(chunk_texts)
        
        chunks_with_emb = [
            {
                "chunk_index": c["chunk_index"],
                "chunk_text": c["chunk_text"],
                "embedding": emb,
                "metadata": doc["metadata"]
            }
            for c, emb in zip(chunks, embeddings)
        ]
        await db.insert_chunks(doc_id, chunks_with_emb)

        # AI Extraction
        extracted = await extract_structured_data_with_gemini(doc["title"], doc["content"])
        await db.insert_extracted_entities(doc_id, [e.model_dump() for e in extracted.entities])
        await db.insert_extracted_relationships(doc_id, [r.model_dump() for r in extracted.relationships])
        await db.insert_extracted_events(doc_id, [ev.model_dump() for ev in extracted.events])

        seeded_ids.append(doc_id)

    return {
        "success": True,
        "message": f"Successfully seeded {len(seeded_ids)} historical records for Project Meridian.",
        "document_ids": seeded_ids
    }
