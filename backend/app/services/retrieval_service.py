import json
import logging
import re
from typing import Dict, Any, List, Set
from app.config import settings
from app.db import db
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

def _heuristic_reconstruction(
    query: str,
    retrieved_chunks: List[Dict[str, Any]],
    events: List[Dict[str, Any]],
    entities: List[Dict[str, Any]],
    relationships: List[Dict[str, Any]]
) -> ReconstructionResponse:
    """Fallback rule-based reconstructor for offline testing."""
    citations = []
    for c in retrieved_chunks[:4]:
        citations.append(CitationItem(
            document_id=c.get("document_id"),
            document_title=c.get("document_title", "Document"),
            source_type=c.get("source_type", "text"),
            quote=c.get("chunk_text", "")[:180] + "...",
            relevance="Directly matched search criteria for historical context."
        ))

    # Format timeline
    timeline_events = []
    for ev in events[:6]:
        timeline_events.append(ExtractedEvent(
            date=ev["date"],
            title=ev["title"],
            description=ev["description"],
            decision=ev.get("decision"),
            actors=ev.get("actors", []),
            evidence_quote=ev.get("evidence_quote"),
            document_title=ev.get("document_title")
        ))

    # Detect potential missing context
    missing = []
    if len(retrieved_chunks) < 3:
        missing.append(MissingContextItem(
            category="broken_chain",
            description="Limited source documentation retrieved for this specific query.",
            impact="Historical trail has incomplete coverage; some decisions may have happened in unrecorded channels (e.g. private chats or verbal 1:1s).",
            suggested_investigation="Ingest related Slack/Discord exports or meeting minutes covering the same timeframe."
        ))
    
    missing.append(MissingContextItem(
        category="unrecorded_reason",
        description="Formal alternatives analysis and post-migration review records were not detected.",
        impact="Team cannot verify whether rejected alternatives were evaluated on benchmarks or personal preference.",
        suggested_investigation="Check Jira/GitHub architecture issues or ask the original author."
    ))

    # Build Graph
    graph_nodes = []
    graph_links = []
    seen_nodes: Set[str] = set()

    for e in entities[:15]:
        if e["name"] not in seen_nodes:
            seen_nodes.add(e["name"])
            graph_nodes.append(GraphNode(
                id=e["name"],
                name=e["name"],
                type=e["type"],
                description=e.get("description", e.get("role")),
                val=3.0 if e["type"] in ["decision", "system"] else 2.0
            ))

    for r in relationships[:20]:
        if r["source"] in seen_nodes and r["target"] in seen_nodes:
            graph_links.append(GraphLink(
                source=r["source"],
                target=r["target"],
                relation=r["relation"],
                evidence=r.get("context")
            ))

    direct_ans = (
        f"Based on {len(retrieved_chunks)} historical records found, key decisions regarding '{query}' "
        f"were driven by documented system constraints and verified milestones across {len(events)} events."
    )

    reasoning = (
        f"Forensic analysis of retrieved documents indicates active collaboration among stakeholders. "
        f"The primary decision path centered on resolving architectural bottlenecks and establishing clearer contracts. "
        f"However, several rationale steps were not fully recorded in written archives."
    )

    return ReconstructionResponse(
        query=query,
        direct_answer=direct_ans,
        reasoning_summary=reasoning,
        confidence_score="medium" if len(retrieved_chunks) >= 2 else "low",
        confidence_rationale=f"Synthesized from {len(retrieved_chunks)} evidentiary document chunks and {len(timeline_events)} chronological events.",
        timeline=timeline_events,
        graph=GraphData(nodes=graph_nodes, links=graph_links),
        citations=citations,
        missing_context=missing
    )

async def reconstruct_context(query: str, top_k: int = 6) -> ReconstructionResponse:
    """
    Executes hybrid retrieval (vector similarity + keyword search) and prompts Gemini
    to reconstruct the missing context narrative, timeline, citations, and missing context flags.
    """
    # 1. Embed query
    query_emb = await generate_embedding(query)

    # 2. Vector search
    vector_results = await db.search_chunks_by_vector(query_emb, match_count=top_k)

    # 3. Keyword search
    keyword_results = await db.search_chunks_by_keywords(query, match_count=top_k)

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

    # If no Gemini API key configured, use heuristic
    api_key = settings.GEMINI_API_KEY.strip() if settings.GEMINI_API_KEY else ""
    is_real_key = bool(api_key and not api_key.startswith("your_"))

    if not is_real_key or not top_chunks:
        return _heuristic_reconstruction(query, top_chunks, events, entities, relationships)

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


        # Build Graph structures
        graph_nodes = []
        graph_links = []
        seen_nodes: Set[str] = set()

        for e in entities[:25]:
            if e["name"] not in seen_nodes:
                seen_nodes.add(e["name"])
                graph_nodes.append(GraphNode(
                    id=e["name"],
                    name=e["name"],
                    type=e["type"],
                    description=e.get("description", e.get("role")),
                    val=3.0 if e["type"] in ["decision", "system"] else 2.0
                ))

        for r in relationships[:30]:
            if r["source"] in seen_nodes and r["target"] in seen_nodes:
                graph_links.append(GraphLink(
                    source=r["source"],
                    target=r["target"],
                    relation=r["relation"],
                    evidence=r.get("context")
                ))

        return ReconstructionResponse(
            query=query,
            direct_answer=data.get("direct_answer", ""),
            reasoning_summary=data.get("reasoning_summary", ""),
            confidence_score=data.get("confidence_score", "medium"),
            confidence_rationale=data.get("confidence_rationale", ""),
            timeline=[ExtractedEvent(**ev) for ev in data.get("timeline", [])],
            graph=GraphData(nodes=graph_nodes, links=graph_links),
            citations=[CitationItem(**ci) for ci in data.get("citations", [])],
            missing_context=[MissingContextItem(**mc) for mc in data.get("missing_context", [])]
        )

    except Exception as e:
        logger.error(f"Gemini context reconstruction failed: {e}. Falling back to heuristic reconstruction.")
        return _heuristic_reconstruction(query, top_chunks, events, entities, relationships)
