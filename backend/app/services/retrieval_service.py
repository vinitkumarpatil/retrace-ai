import hashlib
import json
import logging
import re
from datetime import datetime
from typing import Dict, Any, List, Set, Optional
from app.config import settings
from app.db import db, compute_content_hash, parse_date_for_sorting
from app.models import (
    ReconstructionResponse,
    GraphData,
    GraphNode,
    GraphLink,
    CitationItem,
    MissingContextItem,
    ExtractedEvent
)
from app.services.embedding_service import generate_embedding
from app.services.work_engine import (
    is_likely_person,
    detect_missing_context,
    sort_timeline_chronologically,
    calculate_deterministic_confidence,
    build_graph,
    build_timeline_events,
    build_citations,
    get_sources_used
)

logger = logging.getLogger(__name__)

RECONSTRUCTION_PROMPT_TEMPLATE = """You are ReTrace — an expert Forensic Knowledge Recovery Architect.
A team member has asked a question about past decisions, architecture choices, or organizational history:
QUESTION: "{query}"

You have retrieved the following evidentiary document chunks and knowledge records:
=== RETRIEVED EVIDENCE CHUNKS ===
{evidence_chunks}

=== ASSOCIATED TIMELINE EVENTS & ENTITIES ===
{entity_context}

YOUR MANDATE:
Reconstruct the true narrative of what occurred, why decisions were made, who was involved, and what context is STILL MISSING.

Return your response strictly as a JSON object adhering to this schema:
{{
  "direct_answer": "Clear, direct 2-3 sentence executive answer to the user's question.",
  "reasoning_summary": "In-depth narrative explaining the technical and organizational rationale, constraints, trade-offs, and sequence of events.",
  "confidence_score": "high | medium | low",
  "confidence_rationale": "Justification for confidence level based on quality, recency, and completeness of retrieved documents.",
  "timeline": [
    {{
      "date": "Timeline date or period",
      "title": "Milestone title",
      "description": "What occurred and what was decided",
      "decision": "Explicit decision made (or null)",
      "actors": ["Name(s) of key actors involved"],
      "evidence_quote": "Verbatim quote supporting this milestone",
      "document_title": "Title of source document"
    }}
  ],
  "citations": [
    {{
      "document_title": "Title of source document",
      "source_type": "pdf | image | text | url",
      "quote": "Direct quote from the document supporting the narrative",
      "relevance": "Why this citation matters to the answer"
    }}
  ],
  "missing_context": [
    {{
      "category": "unrecorded_reason | missing_stakeholder | broken_chain | unresolved_question | gap_in_dates",
      "description": "Specific missing context or unanswered question",
      "impact": "Why this missing detail creates ambiguity or risk for the team",
      "suggested_investigation": "Specific action, document, or person to consult to uncover the missing truth"
    }}
  ]
}}

CRITICAL ACCURACY RULES:
1. NEVER hallucinate facts not present in the retrieved evidence.
2. If evidence is missing, contradictory, or vague, explicitly create a 'missing_context' entry rather than inventing reasons.
3. Output ONLY the raw JSON object, no introductory or concluding text.
"""

def _clean_json_string(raw_text: str) -> str:
    text = raw_text.strip()
    if text.startswith("```"):
        text = re.sub(r"^```(?:json)?\s*", "", text)
        text = re.sub(r"\s*```$", "", text)
    return text.strip()

def _is_backend_only_query(query: str) -> bool:
    """Determine if a query can be answered without Gemini (backend-only)."""
    backend_only_patterns = [
        r"(?i)^(show|list|find|get|display)\s+(all\s+)?(files?|documents?|sources?|notes?)",
        r"(?i)^(show|list|find|get|display)\s+.*\b(from|in|about|related to|mentioning)\b",
        r"(?i)^(which|what)\s+(files?|documents?|sources?)\s+",
        r"(?i)^(open|show)\s+.*\evidence\b",
        r"(?i)^(search|filter)\s+",
    ]
    return any(re.search(p, query) for p in backend_only_patterns)

def _sort_timeline_chronologically(events: List[Dict[str, Any]]) -> List[Dict[str, Any]]:
    """Sort timeline events chronologically by date."""
    dated_events = []
    undated_events = []
    for ev in events:
        date_str = ev.get("date", "")
        sort_key = parse_date_for_sorting(date_str)
        if sort_key == "9999-99-99":
            undated_events.append(ev)
        else:
            dated_events.append((sort_key, ev))
    dated_events.sort(key=lambda x: x[0])
    return [ev for _, ev in dated_events] + undated_events

def _calculate_deterministic_confidence(
    retrieved_chunks: List[Dict[str, Any]],
    events: List[Dict[str, Any]],
    query: str
) -> tuple[str, str]:
    """Calculate confidence based on deterministic signals."""
    score = 0.5  # baseline
    rationale_parts = []
    
    # Number of evidence chunks
    chunk_count = len(retrieved_chunks)
    if chunk_count >= 4:
        score += 0.15
        rationale_parts.append(f"{chunk_count} evidence chunks retrieved")
    elif chunk_count >= 2:
        score += 0.05
        rationale_parts.append(f"{chunk_count} evidence chunks retrieved")
    else:
        score -= 0.1
        rationale_parts.append(f"Only {chunk_count} evidence chunks retrieved")
    
    # Number of events
    event_count = len(events)
    if event_count >= 3:
        score += 0.1
        rationale_parts.append(f"{event_count} timeline events found")
    elif event_count >= 1:
        score += 0.05
    
    # Source diversity
    doc_ids = set(c.get("document_id") for c in retrieved_chunks if c.get("document_id"))
    if len(doc_ids) >= 3:
        score += 0.1
        rationale_parts.append(f"Evidence from {len(doc_ids)} distinct sources")
    elif len(doc_ids) >= 2:
        score += 0.05
    
    # Vector similarity quality
    avg_sim = sum(c.get("similarity", 0) for c in retrieved_chunks) / max(chunk_count, 1)
    if avg_sim > 0.7:
        score += 0.1
        rationale_parts.append("High similarity scores")
    elif avg_sim > 0.5:
        score += 0.05
    
    # Determine level
    if score >= 0.75:
        level = "high"
    elif score >= 0.55:
        level = "medium"
    else:
        level = "low"
    
    rationale = "; ".join(rationale_parts) if rationale_parts else "Limited evidence available"
    return level, rationale

def _build_source_traceable_citation(chunk: Dict[str, Any]) -> CitationItem:
    """Build a citation with full source traceability."""
    return CitationItem(
        document_id=chunk.get("document_id"),
        document_title=chunk.get("document_title", "Document"),
        source_type=chunk.get("source_type", "text"),
        quote=chunk.get("chunk_text", "")[:180] + "...",
        relevance="Directly matched search criteria for historical context.",
        path=chunk.get("path"),
        url=chunk.get("url"),
        chunk_id=chunk.get("id"),
        score=round(chunk.get("fusion_score", chunk.get("similarity", 0)), 3)
    )

def _heuristic_reconstruction(
    query: str,
    retrieved_chunks: List[Dict[str, Any]],
    events: List[Dict[str, Any]],
    entities: List[Dict[str, Any]],
    relationships: List[Dict[str, Any]]
) -> ReconstructionResponse:
    """Fallback rule-based reconstructor for offline testing."""
    # Use work_engine functions for deterministic processing
    citations = build_citations(retrieved_chunks)
    timeline_events = build_timeline_events(events)
    graph = build_graph(entities, relationships)
    missing = detect_missing_context(query, retrieved_chunks, events, entities, relationships)
    sources_used = get_sources_used(retrieved_chunks)

    # Build query-aware answer
    query_lower = query.lower()
    if any(w in query_lower for w in ["who", "approved", "decided"]):
        person_entities = [e for e in entities if e.get("type") == "person"]
        if person_entities:
            names = [e["name"] for e in person_entities[:3]]
            direct_ans = f"The documents reference {', '.join(names)} as key stakeholders involved in this decision."
        else:
            direct_ans = "The available documents do not clearly identify who specifically made or approved this decision."
    elif any(w in query_lower for w in ["why", "reason", "rationale"]):
        direct_ans = f"Based on {len(retrieved_chunks)} evidence sources, the decision appears driven by documented architectural constraints and team requirements."
    elif any(w in query_lower for w in ["what happened", "timeline", "sequence"]):
        direct_ans = f"The evidence reveals {len(events)} recorded events across {len(set(c.get('document_id') for c in retrieved_chunks))} sources."
    else:
        direct_ans = f"Analysis of {len(retrieved_chunks)} historical records provides context regarding '{query}'."

    reasoning = (
        f"Forensic analysis of retrieved documents indicates collaboration among stakeholders. "
        f"The evidence spans {len(set(c.get('document_id') for c in retrieved_chunks))} distinct sources "
        f"with {len(events)} recorded events and {len(relationships)} documented relationships."
    )

    # Deterministic confidence
    confidence_score, confidence_rationale = calculate_deterministic_confidence(
        retrieved_chunks, events, entities, relationships, query
    )

    return ReconstructionResponse(
        query=query,
        direct_answer=direct_ans,
        reasoning_summary=reasoning,
        confidence_score=confidence_score,
        confidence_rationale=confidence_rationale,
        timeline=timeline_events,
        graph=graph,
        citations=citations,
        missing_context=missing,
        sources_used=sources_used,
        backend_only=True
    )

async def reconstruct_context(query: str, top_k: int = 6, project: str = None, source_type: str = None) -> ReconstructionResponse:
    """
    Executes hybrid retrieval (vector similarity + keyword search) and routes to
    backend-only or Gemini-assisted reconstruction based on query complexity.
    """
    # Check cache first
    cache_key = hashlib.sha256(f"{query}:{top_k}:{project}:{source_type}".encode()).hexdigest()[:16]
    cached = await db.get_cache(cache_key)
    if cached:
        logger.info(f"Cache hit for query: {query[:50]}...")
        result = cached["result"]
        result["confidence_rationale"] += f" (cached, {cached['hit_count']} hits)"
        return ReconstructionResponse(**result)

    # 1. Embed query
    query_emb = await generate_embedding(query)

    # 2. Vector search with metadata filtering
    vector_results = await db.search_chunks_by_vector(query_emb, match_count=top_k, project=project, source_type=source_type)

    # 3. Keyword search with metadata filtering
    keyword_results = await db.search_chunks_by_keywords(query, match_count=top_k, project=project, source_type=source_type)

    # 4. Hybrid Reciprocal Fusion / deduplication
    chunk_map = {}
    for idx, vr in enumerate(vector_results):
        cid = vr["id"]
        score = (1.0 / (60 + idx + 1)) * 0.6 + (vr.get("similarity", 0.0) * 0.4)
        chunk_map[cid] = {**vr, "fusion_score": score}

    for idx, kr in enumerate(keyword_results):
        cid = kr["id"]
        k_score = (1.0 / (60 + idx + 1)) * 0.4 + (kr.get("keyword_score", 0.0) * 0.3)
        if cid in chunk_map:
            chunk_map[cid]["fusion_score"] += k_score
        else:
            chunk_map[cid] = {**kr, "fusion_score": k_score}

    fused_chunks = list(chunk_map.values())
    fused_chunks.sort(key=lambda x: x.get("fusion_score", 0), reverse=True)
    top_chunks = fused_chunks[:top_k]

    # Collect linked document IDs
    doc_ids = list(set([c["document_id"] for c in top_chunks if "document_id" in c]))

    # Retrieve entities, relationships, and events
    entities, relationships = await db.get_all_entities_and_relationships(doc_ids if doc_ids else None)
    events = await db.get_events(doc_ids if doc_ids else None)

    # Check if this is a backend-only query
    api_key = settings.GEMINI_API_KEY.strip() if settings.GEMINI_API_KEY else ""
    is_real_key = bool(api_key and not api_key.startswith("your_"))
    use_backend_only = not is_real_key or not top_chunks or _is_backend_only_query(query)

    if use_backend_only:
        result = _heuristic_reconstruction(query, top_chunks, events, entities, relationships)
        # Cache the result
        await db.set_cache(cache_key, result.model_dump())
        return result

    # Format evidence chunks for Gemini
    evidence_text = "\n\n".join([
        f"[Source #{i+1}: {c.get('document_title', 'Doc')} ({c.get('source_type', 'text')})]\n{c.get('chunk_text', '')}"
        for i, c in enumerate(top_chunks)
    ])

    entity_text = f"Entities ({len(entities)}): " + ", ".join([f"{e['name']} ({e['type']})" for e in entities[:20]]) + "\n"
    entity_text += f"Recorded Events ({len(events)}): " + "; ".join([f"{ev['date']}: {ev['title']}" for ev in events[:10]])

    prompt = RECONSTRUCTION_PROMPT_TEMPLATE.format(
        query=query,
        evidence_chunks=evidence_text,
        entity_context=entity_text
    )

    try:
        from google import genai
        client = genai.Client(api_key=api_key)
        
        models_to_try = ["models/gemini-3.6-flash", "models/gemini-3.5-flash-lite", "gemini-3.6-flash"]

        last_err = None
        raw_text = ""
        for m_name in models_to_try:
            try:
                response = client.models.generate_content(
                    model=m_name,
                    contents=[prompt],
                )
                raw_text = response.text or ""
                break
            except Exception as m_err:
                last_err = m_err
                continue

        if not raw_text and last_err:
            raise last_err

        cleaned = _clean_json_string(raw_text)
        data = json.loads(cleaned)


        # Build Graph structures using work_engine
        graph = build_graph(entities, relationships, max_nodes=25, max_links=30)

        # Collect source document IDs
        sources_used = get_sources_used(top_chunks)

        result = ReconstructionResponse(
            query=query,
            direct_answer=data.get("direct_answer", ""),
            reasoning_summary=data.get("reasoning_summary", ""),
            confidence_score=data.get("confidence_score", "medium"),
            confidence_rationale=data.get("confidence_rationale", ""),
            timeline=[ExtractedEvent(**ev) for ev in data.get("timeline", [])],
            graph=graph,
            citations=[CitationItem(**ci) for ci in data.get("citations", [])],
            missing_context=[MissingContextItem(**mc) for mc in data.get("missing_context", [])],
            sources_used=sources_used,
            backend_only=False
        )

        # Cache the result
        await db.set_cache(cache_key, result.model_dump())
        return result

    except Exception as e:
        logger.error(f"Gemini context reconstruction failed: {e}. Falling back to heuristic reconstruction.")
        result = _heuristic_reconstruction(query, top_chunks, events, entities, relationships)
        await db.set_cache(cache_key, result.model_dump())
        return result
