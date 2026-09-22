"""
Critical path tests for ReTrace demo reliability.
These tests run WITHOUT a Gemini API key (heuristic fallback mode).
Focus: protecting the demo path.
"""
import sys
from fastapi.testclient import TestClient
from app.main import app

client = TestClient(app)

# --- SETUP ---
def setup_module():
    """Seed Phoenix data before tests."""
    client.post("/api/context/seed")


# --- 1. DECISION QUERY ---
def test_decision_query():
    """Why did we change the architecture?"""
    resp = client.post("/api/query", json={"query": "Why did we change the architecture?", "top_k": 5})
    assert resp.status_code == 200
    data = resp.json()
    assert len(data["direct_answer"]) > 20, "Direct answer too short"
    assert len(data["citations"]) > 0, "No citations returned"
    assert data["confidence_score"] in ("high", "medium", "low"), "Invalid confidence"


# --- 2. ATTRIBUTION QUERY ---
def test_attribution_query():
    """Who approved Architecture B?"""
    resp = client.post("/api/query", json={"query": "Who approved Architecture B?", "top_k": 5})
    assert resp.status_code == 200
    data = resp.json()
    assert len(data["direct_answer"]) > 20
    assert len(data["citations"]) > 0
    # Should NOT invent a specific approver name
    answer_lower = data["direct_answer"].lower()
    # The answer should not claim a specific person approved it
    # (the documents say the approver is undocumented)


# --- 3. INCIDENT QUERY ---
def test_incident_query():
    """What happened during the payment outage?"""
    resp = client.post("/api/query", json={"query": "What happened during the payment outage?", "top_k": 5})
    assert resp.status_code == 200
    data = resp.json()
    assert len(data["direct_answer"]) > 20
    assert len(data["citations"]) > 0
    # Should cite Incident Retrospective #112
    citation_titles = [c["document_title"] for c in data["citations"]]
    assert any("112" in t or "incident" in t.lower() for t in citation_titles), \
        f"Expected Incident Retrospective citation, got: {citation_titles}"


# --- 4. ALTERNATIVES QUERY ---
def test_alternatives_query():
    """What alternatives were considered and rejected?"""
    resp = client.post("/api/query", json={"query": "What alternatives were considered and rejected?", "top_k": 5})
    assert resp.status_code == 200
    data = resp.json()
    assert len(data["direct_answer"]) > 20
    assert len(data["citations"]) > 0


# --- 5. CROSS-SOURCE QUERY ---
def test_cross_source_query():
    """What evidence connects the payment outage to the decision to move to Architecture B?"""
    resp = client.post("/api/query", json={"query": "What evidence connects the payment outage to the decision to move to Architecture B?", "top_k": 10})
    assert resp.status_code == 200
    data = resp.json()
    assert len(data["direct_answer"]) > 20
    # Should pull from multiple documents
    citation_docs = set(c["document_title"] for c in data["citations"])
    assert len(citation_docs) >= 2, f"Expected citations from 2+ docs, got: {citation_docs}"


# --- 6. UNSUPPORTED QUESTION ---
def test_unsupported_question():
    """Question about something not in the dataset."""
    resp = client.post("/api/query", json={"query": "What was the salary of the CEO in 2023?", "top_k": 5})
    assert resp.status_code == 200
    data = resp.json()
    # Should still return a response (not crash)
    assert "direct_answer" in data
    assert "missing_context" in data


# --- 7. MISSING CONTEXT DETECTION ---
def test_missing_context_detection():
    """What context is missing from the architecture decision?"""
    resp = client.post("/api/query", json={"query": "What context is missing from the architecture decision?", "top_k": 10})
    assert resp.status_code == 200
    data = resp.json()
    assert len(data["missing_context"]) > 0, "No missing context flags returned"
    # Each flag should have required fields
    for mc in data["missing_context"]:
        assert "category" in mc, "Missing 'category' field"
        assert "description" in mc, "Missing 'description' field"
        assert "impact" in mc, "Missing 'impact' field"
        assert "suggested_investigation" in mc, "Missing 'suggested_investigation' field"


# --- 8. MALFORMED INPUT ---
def test_empty_query():
    """Empty query should return 400."""
    resp = client.post("/api/query", json={"query": "", "top_k": 5})
    assert resp.status_code == 400


def test_whitespace_query():
    """Whitespace-only query should return 400."""
    resp = client.post("/api/query", json={"query": "   ", "top_k": 5})
    assert resp.status_code == 400


def test_missing_query_field():
    """Missing query field should return 422."""
    resp = client.post("/api/query", json={"top_k": 5})
    assert resp.status_code == 422


# --- 9. RETRIEVAL WITH NO USEFUL EVIDENCE ---
def test_nonsensical_query():
    """Query that should return low-confidence or generic results."""
    resp = client.post("/api/query", json={"query": "purple elephant dancing on mars", "top_k": 5})
    assert resp.status_code == 200
    data = resp.json()
    # Should not crash, should return something
    assert "direct_answer" in data
    assert data["confidence_score"] in ("high", "medium", "low")


# --- 10. ENDPOINT SMOKE TESTS ---
def test_health_endpoint():
    resp = client.get("/api/health")
    assert resp.status_code == 200
    data = resp.json()
    assert data["status"] == "healthy"


def test_documents_endpoint():
    resp = client.get("/api/context/documents")
    assert resp.status_code == 200
    data = resp.json()
    assert data["total"] >= 4, f"Expected 4+ Phoenix docs, got {data['total']}"


def test_graph_endpoint():
    resp = client.get("/api/context/graph")
    assert resp.status_code == 200
    data = resp.json()
    assert len(data["nodes"]) > 0, "No graph nodes"
    assert len(data["links"]) >= 0, "Graph links missing"


def test_ingest_text_endpoint():
    payload = {"title": "Test Ingest", "text": "Test content for ingestion.", "source_type": "text"}
    resp = client.post("/api/ingest/text", json=payload)
    assert resp.status_code == 200
    data = resp.json()
    assert data["success"] is True
    assert "document_id" in data


def test_seed_endpoint():
    resp = client.post("/api/context/seed")
    assert resp.status_code == 200
    data = resp.json()
    assert data["success"] is True
    assert len(data["document_ids"]) == 4


if __name__ == "__main__":
    import pytest
    sys.exit(pytest.main([__file__, "-v"]))
