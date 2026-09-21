import os
import sys
from fastapi.testclient import TestClient
from app.main import app
from app.config import settings

client = TestClient(app)

def test_integration_phase5():
    print("==========================================================")
    print("PHASE 5: END-TO-END INTEGRATION & VERIFICATION TEST SUITE")
    print("==========================================================")

    # 1. Health check & Gemini configuration
    health_resp = client.get("/api/health")
    assert health_resp.status_code == 200, f"Health check failed: {health_resp.text}"
    health_data = health_resp.json()
    print("1. Health check:", health_data["status"])
    print("   Gemini Configured:", health_data["services"]["gemini"]["configured"])
    assert health_data["services"]["gemini"]["configured"] is True, "Expected GEMINI_API_KEY to be configured!"

    # 2. Seed realistic project records
    print("\n2. Seeding Project Meridian records...")
    seed_resp = client.post("/api/context/seed")
    assert seed_resp.status_code == 200, f"Seed failed: {seed_resp.text}"
    seed_data = seed_resp.json()
    assert seed_data["success"] is True
    print(f"   Successfully seeded {len(seed_data['document_ids'])} documents.")

    # 3. List documents
    docs_resp = client.get("/api/context/documents")
    assert docs_resp.status_code == 200
    docs_data = docs_resp.json()
    print(f"\n3. Indexed Documents Count: {docs_data['total']}")
    for d in docs_data["documents"][:3]:
        print(f"   - [{d['source_type'].upper()}] {d['title']} (Entities: {d['entity_count']}, Events: {d['event_count']})")

    # 4. Global Graph
    graph_resp = client.get("/api/context/graph")
    assert graph_resp.status_code == 200
    graph_data = graph_resp.json()
    print(f"\n4. Global Entity Topology: {len(graph_data['nodes'])} nodes, {len(graph_data['links'])} links.")

    # 5. Execute Hybrid Reconstruction Query
    query = "Why did we switch to PostgreSQL and change the vector index on August 12?"
    print(f"\n5. Executing Forensic Reconstruction Query: '{query}'...")
    query_resp = client.post("/api/query", json={"query": query, "top_k": 5})
    assert query_resp.status_code == 200, f"Query failed: {query_resp.text}"
    recon = query_resp.json()

    print("\n--- RECONSTRUCTION RESULTS ---")
    print(f"Confidence: {recon['confidence_score'].upper()}")
    print(f"Rationale: {recon['confidence_rationale']}")
    print(f"\nDirect Answer:\n{recon['direct_answer']}")
    print(f"\nTimeline Milestones ({len(recon['timeline'])}):")
    for ev in recon["timeline"][:4]:
        print(f"  * [{ev['date']}] {ev['title']} (Actors: {', '.join(ev.get('actors', []))})")
    
    print(f"\nPrimary Citations ({len(recon['citations'])}):")
    for c in recon["citations"][:3]:
        print(f"  * {c['document_title']}: \"{c['quote'][:100]}...\"")

    print(f"\nMissing Context Flags ({len(recon['missing_context'])}):")
    for mc in recon["missing_context"]:
        print(f"  ! [{mc['category'].upper()}]: {mc['description']}")
        print(f"    Investigation: {mc['suggested_investigation']}")

    assert len(recon["direct_answer"]) > 20
    assert len(recon["timeline"]) > 0
    assert len(recon["missing_context"]) > 0

    # 6. Dynamic Ingestion Test
    print("\n6. Testing Dynamic Ingestion of Custom Engineering Note...")
    new_doc_payload = {
        "title": "ADR-09: Deprecating Redis for DragonFly",
        "text": (
            "Architecture Decision Record 09 | Date: 2024-09-18\n"
            "Author: Kevin O'Connor (Infra Lead)\n"
            "We decided on September 18, 2024 to replace Redis cluster with DragonFly due to 25x throughput improvement. "
            "Elena approved the benchmark results. Alternative KeyDB was evaluated but had higher memory overhead."
        ),
        "source_type": "text"
    }
    ingest_resp = client.post("/api/ingest/text", json=new_doc_payload)
    assert ingest_resp.status_code == 200
    print(f"   Dynamic Ingestion Success: {ingest_resp.json()['message']}")

    print("\n==========================================================")
    print("ALL PHASE 5 INTEGRATION & VERIFICATION TESTS PASSED! [100%]")
    print("==========================================================")

if __name__ == "__main__":
    test_integration_phase5()
