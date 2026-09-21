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
    Seed realistic historical project records: 'Project Phoenix: Architecture Migration'.
    Demonstrates lost context recovery across RFCs, Slack transcripts, meeting notes, and incident reports.
    The demo question: 'Why did we change the architecture?' — answerable from these records,
    but with a critical gap: WHO specifically approved Architecture B (the new design).
    """
    sample_docs = [
        {
            "title": "RFC-037: Payment Processing Architecture Overhaul",
            "source_type": "text",
            "content": (
                "RFC-037 | Author: Sarah Kim (Staff Engineer) | Date: 2024-09-03\n"
                "Status: Approved by Architecture Board\n\n"
                "Problem Statement:\n"
                "Our current payment processing pipeline (Architecture A) uses a synchronous REST-based approach "
                "with a single PostgreSQL database handling all transaction records. During Black Friday 2023, "
                "we experienced a cascading failure when the payment database hit 95% CPU utilization, "
                "resulting in $2.3M in lost revenue over 47 minutes.\n\n"
                "Proposed Solution — Architecture B:\n"
                "Migrate to an event-driven architecture using:\n"
                "- Apache Kafka for asynchronous transaction event streaming\n"
                "- Separate PostgreSQL databases per bounded context (orders, payments, inventory)\n"
                "- Saga pattern for distributed transaction coordination\n"
                "- Redis for real-time transaction status caching\n\n"
                "Rejected Alternatives:\n"
                "- Message Queue (RabbitMQ): Rejected due to insufficient throughput for peak loads (tested at 12k msg/s vs required 50k msg/s)\n"
                "- Shared Database with Read Replicas: Rejected because it doesn't solve the write contention root cause\n"
                "- Cloud-native payment processor (Stripe Connect): Rejected for vendor lock-in concerns and custom pricing rules\n\n"
                "Timeline:\n"
                "- Phase 1 (Sep-Oct 2024): Payment service extraction + Kafka setup\n"
                "- Phase 2 (Nov-Dec 2024): Order service migration + Saga implementation\n"
                "- Phase 3 (Jan 2025): Inventory service + full cutover\n\n"
                "Approval:\n"
                "Architecture B was approved for implementation. Team Atlas will execute Phase 1 under Sarah Kim's technical leadership."
            ),
            "metadata": {"author": "Sarah Kim", "document_type": "RFC", "project": "Phoenix"}
        },
        {
            "title": "Slack Transcript #payments-team: Architecture B Kickoff",
            "source_type": "text",
            "content": (
                "[2024-09-05 09:15] @sarah_kim: Quick update — Architecture B got the green light yesterday. "
                "We need to start sprint planning for Phase 1 immediately.\n"
                "[2024-09-05 09:22] @james_dev: Wait, which alternative won? I thought we were leaning toward the read-replica approach.\n"
                "[2024-09-05 09:30] @sarah_kim: No, Architecture B is the full event-driven migration. "
                "The board reviewed both options and decided the read-replica approach was a band-aid.\n"
                "[2024-09-05 09:45] @priya_sre: Makes sense. I've already started benchmarking Kafka vs the current REST pipeline. "
                "Early numbers show 4x throughput improvement.\n"
                "[2024-09-05 10:02] @mike_pm: Who signed off on the budget for the additional infrastructure? "
                "We're talking about 3 new RDS instances plus the Kafka cluster.\n"
                "[2024-09-05 10:15] @sarah_kim: The approval came through the architecture board. "
                "I don't have the specific signatory name — I just got the 'Approved' notification.\n"
                "[2024-09-05 10:20] @mike_pm: We should track that. Someone needs to own the infrastructure cost justification."
            ),
            "metadata": {"channel": "#payments-team", "date": "2024-09-05", "project": "Phoenix"}
        },
        {
            "title": "Incident Retrospective #112: Payment Service Outage During Migration",
            "source_type": "text",
            "content": (
                "Incident Retrospective #112 | Date: 2024-10-18\n"
                "Facilitator: Priya Sharma (Senior SRE)\n\n"
                "What Happened:\n"
                "On October 15, 2024, during Phase 1 migration of the payment service to Architecture B, "
                "a misconfigured Kafka consumer group caused 340 payment transactions to be processed twice. "
                "This resulted in duplicate charges affecting 127 customers.\n\n"
                "Timeline:\n"
                "- 14:22: Deployment of payment-service v2.1.0 with new Kafka consumers\n"
                "- 14:35: Alert triggered — duplicate transaction IDs detected in payment_log table\n"
                "- 14:41: Incident declared (SEV-2)\n"
                "- 14:58: Kafka consumer group reset, duplicate processing halted\n"
                "- 15:30: Rollback to v2.0.8, duplicate transactions reversed\n"
                "- 16:15: All customer charges corrected, incident resolved\n\n"
                "Root Cause:\n"
                "Kafka consumer group was not configured with idempotency checks. The consumer offsets "
                "were reset during a rebalance event, causing reprocessing of already-committed transactions.\n\n"
                "Action Items:\n"
                "1. Implement idempotency keys in payment processing pipeline (Owner: James Dev, Due: 2024-10-25)\n"
                "2. Add Kafka consumer lag monitoring and alerting (Owner: Priya Sharma, Due: 2024-10-22)\n"
                "3. Create runbook for Kafka consumer group incidents (Owner: Sarah Kim, Due: 2024-10-30)\n"
                "4. Conduct Architecture B readiness review before Phase 2 (Owner: Architecture Board, Due: 2024-11-01)\n\n"
                "Lessons Learned:\n"
                "The event-driven architecture provides better isolation, but requires stricter idempotency guarantees. "
                "Architecture A's synchronous nature would have prevented this specific failure mode, "
                "but would have suffered the cascading failure under load instead."
            ),
            "metadata": {"incident_id": "INC-112", "date": "2024-10-18", "project": "Phoenix"}
        },
        {
            "title": "Architecture Board Meeting Notes — Q4 2024 Review",
            "source_type": "text",
            "content": (
                "Architecture Board Meeting | Date: 2024-11-08\n"
                "Attendees: Elena Torres (CTO), Sarah Kim (Staff Engineer), Raj Patel (VP Engineering)\n\n"
                "Agenda Item 3: Project Phoenix — Architecture B Progress Review\n\n"
                "Status Update:\n"
                "- Phase 1 completed (Oct 2024): Payment service successfully migrated to event-driven architecture\n"
                "- Incident #112 addressed: Idempotency controls now production-ready\n"
                "- Phase 2 kickoff scheduled for Nov 12, 2024\n\n"
                "Key Discussion Points:\n"
                "1. Sarah Kim presented Phase 1 metrics: 4.2x throughput improvement, 99.97% uptime post-migration\n"
                "2. Raj Patel raised concern about team capacity for Phase 2 during holiday season\n"
                "3. Elena Torres asked about the original approval process — who specifically authorized Architecture B?\n"
                "   Response: The approval notification came through the automated architecture board system. "
                "   Individual signatory was not recorded in the system. This is a known process gap.\n"
                "4. Decision: Phase 2 will proceed as planned, with enhanced monitoring and rollback procedures.\n\n"
                "Unresolved Items:\n"
                "- The identity of the Architecture B approver remains undocumented\n"
                "- Budget justification for the additional infrastructure was submitted but not formally approved in writing\n"
                "- Need to establish a proper approval audit trail for future architecture decisions"
            ),
            "metadata": {"meeting_type": "Architecture Board", "date": "2024-11-08", "project": "Phoenix"}
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
        "message": f"Successfully seeded {len(seeded_ids)} historical records for Project Phoenix.",
        "document_ids": seeded_ids
    }
