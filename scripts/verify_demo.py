"""
ReTrace Demo Verification Script
Run this before any demo to verify the system is ready.
Usage: python scripts/verify_demo.py
"""
import sys
import json

try:
    from fastapi.testclient import TestClient
    from app.main import app
except ImportError:
    print("ERROR: Must run from backend/ directory with venv activated.")
    print("  cd backend && .\\.venv\\Scripts\\python.exe scripts\\verify_demo.py")
    sys.exit(1)

client = TestClient(app)
results = []


def check(name, condition, detail=""):
    status = "PASS" if condition else "FAIL"
    results.append((status, name, detail))
    symbol = "[PASS]" if status == "PASS" else "[FAIL]"
    msg = f"  {symbol} {name}"
    if detail:
        msg += f" -- {detail}"
    print(msg)
    return condition


print()
print("=" * 56)
print("  RETRACE DEMO VERIFICATION")
print("=" * 56)
print()

# 1. Backend health
print("--- System Health ---")
try:
    health = client.get("/api/health").json()
    check("Backend health", health.get("status") == "healthy",
          f"status={health.get('status')}")
    check("Database mode", True,
          f"mode={health.get('services', {}).get('database', {}).get('mode', 'unknown')}")
except Exception as e:
    check("Backend health", False, str(e))

# 2. Seed Phoenix
print("\n--- Project Phoenix Seed ---")
try:
    seed = client.post("/api/context/seed").json()
    check("Phoenix seed", seed.get("success") is True,
          f"{len(seed.get('document_ids', []))} documents")
except Exception as e:
    check("Phoenix seed", False, str(e))

# 3. Document count
print("\n--- Document Verification ---")
try:
    docs = client.get("/api/context/documents").json()
    titles = [d["title"] for d in docs["documents"]]
    check("Document count", docs["total"] >= 4,
          f"total={docs['total']}")
    check("RFC-037 present", any("RFC-037" in t for t in titles),
          "RFC-037: Payment Processing Architecture Overhaul")
    check("Slack Transcript present", any("Slack" in t for t in titles),
          "Slack Transcript #payments-team")
    check("Incident #112 present", any("112" in t for t in titles),
          "Incident Retrospective #112")
    check("Board Meeting present", any("Board" in t for t in titles),
          "Architecture Board Meeting Notes")
except Exception as e:
    check("Document listing", False, str(e))

# 4. Graph
print("\n--- Entity Graph ---")
try:
    graph = client.get("/api/context/graph").json()
    check("Graph nodes exist", len(graph.get("nodes", [])) > 0,
          f"{len(graph.get('nodes', []))} nodes")
    check("Graph links exist", len(graph.get("links", [])) > 0,
          f"{len(graph.get('links', []))} links")
except Exception as e:
    check("Graph endpoint", False, str(e))

# 5. Demo queries
print("\n--- Demo Query Suite ---")
queries = [
    ("Decision query", "Why did we change the architecture?"),
    ("Attribution query", "Who approved Architecture B?"),
    ("Incident query", "What happened during the payment outage?"),
    ("Alternatives query", "What alternatives were considered and rejected?"),
    ("Cross-source query", "What evidence connects the payment outage to the decision to move to Architecture B?"),
    ("Missing context query", "What context is missing from the architecture decision?"),
]

for label, query in queries:
    try:
        resp = client.post("/api/query", json={"query": query, "top_k": 10})
        data = resp.json()
        has_answer = len(data.get("direct_answer", "")) > 20
        has_citations = len(data.get("citations", [])) > 0
        has_timeline = len(data.get("timeline", [])) > 0
        ok = has_answer and has_citations and has_timeline
        detail = f"answer={len(data.get('direct_answer',''))}ch, citations={len(data.get('citations',[]))}, timeline={len(data.get('timeline',[]))}"
        check(label, ok, detail)
    except Exception as e:
        check(label, False, str(e))

# 6. Missing context detection
print("\n--- Missing Context Detection ---")
try:
    resp = client.post("/api/query", json={"query": "Who formally approved Architecture B?", "top_k": 5})
    data = resp.json()
    mc_count = len(data.get("missing_context", []))
    check("Missing context flags present", mc_count > 0,
          f"{mc_count} flag(s)")
    # Verify flag structure
    if mc_count > 0:
        mc = data["missing_context"][0]
        has_all = all(k in mc for k in ["category", "description", "impact", "suggested_investigation"])
        check("Flag structure valid", has_all,
              "category, description, impact, suggested_investigation")
except Exception as e:
    check("Missing context detection", False, str(e))

# 7. Unsupported question
print("\n--- Unsupported Question Handling ---")
try:
    resp = client.post("/api/query", json={"query": "What color is the sky on Mars?", "top_k": 5})
    data = resp.json()
    check("Unsupported question returns response", "direct_answer" in data,
          "did not crash")
except Exception as e:
    check("Unsupported question", False, str(e))

# 8. Malformed input
print("\n--- Input Validation ---")
try:
    resp_empty = client.post("/api/query", json={"query": "", "top_k": 5})
    check("Empty query returns 400", resp_empty.status_code == 400)

    resp_no_query = client.post("/api/query", json={"top_k": 5})
    check("Missing query returns 422", resp_no_query.status_code == 422)
except Exception as e:
    check("Input validation", False, str(e))

# 9. Ingestion
print("\n--- Text Ingestion ---")
try:
    payload = {"title": "Demo Test Doc", "text": "Test ingestion for demo verification.", "source_type": "text"}
    resp = client.post("/api/ingest/text", json=payload)
    data = resp.json()
    check("Text ingestion works", data.get("success") is True,
          f"doc_id={data.get('document_id', 'none')[:8]}...")
except Exception as e:
    check("Text ingestion", False, str(e))

# Summary
print()
print("=" * 56)
passed = sum(1 for s, _, _ in results if s == "PASS")
failed = sum(1 for s, _, _ in results if s == "FAIL")
total = len(results)

print(f"  RESULTS: {passed}/{total} passed, {failed} failed")
print()

if failed == 0:
    print("  FINAL: DEMO READY")
else:
    print("  FINAL: DEMO NOT READY")
    print()
    print("  Failed checks:")
    for s, name, detail in results:
        if s == "FAIL":
            print(f"    - {name}: {detail}")

print("=" * 56)
print()
sys.exit(0 if failed == 0 else 1)
