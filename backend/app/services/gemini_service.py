import json
import logging
import re
from typing import Dict, Any, List, Optional
from app.config import settings
from app.models import (
    ExtractedDocumentData,
    ExtractedEntity,
    ExtractedRelationship,
    ExtractedEvent,
)

logger = logging.getLogger(__name__)

SYSTEM_EXTRACTION_PROMPT = """You are ReTrace — an expert Forensic Knowledge Recovery Architect.
Your role is to analyze historical team records, architecture documents, meeting transcripts, pull requests, RFCs, and incident reports to reconstruct lost organizational context.

Analyze the provided document and extract structured intelligence strictly in JSON format matching this schema:
{
  "summary": "Concise 2-3 sentence summary of what this document is about and what decisions it records.",
  "entities": [
    {
      "name": "Entity name (person, system, team, vendor, or project)",
      "type": "person | team | system | decision | concept | document",
      "role": "Specific title or purpose (e.g. Lead Architect, Primary Database, Incident Commander)",
      "description": "Short explanation of this entity's role in this document"
    }
  ],
  "relationships": [
    {
      "source": "Name of source entity (must match an entity name)",
      "target": "Name of target entity (must match an entity name)",
      "relation": "Concise action verb (e.g., approved, replaced, authored, opposed, deployed_to, depends_on)",
      "context": "Context or justification for this link"
    }
  ],
  "events": [
    {
      "date": "Exact date or relative timeframe mentioned (e.g. '2024-08-15', 'August 2024', 'Sprint 42')",
      "title": "Short event title",
      "description": "What occurred during this event",
      "decision": "Specific decision made (or null if none)",
      "actors": ["Names of people or teams involved"],
      "evidence_quote": "Exact verbatim quote from the text supporting this event"
    }
  ],
  "key_decisions": [
    {
      "decision": "Clear statement of the decision",
      "why": "Stated rationale or triggering constraint",
      "alternatives_rejected": "Alternative solutions discussed but rejected (or null)",
      "status": "decided | proposed | superseded | postponed"
    }
  ]
}

CRITICAL RULES:
1. Do NOT hallucinate facts not present in the document.
2. If dates are approximate, keep the natural language phrasing (e.g., 'Late July 2024').
3. Ensure every relationship connects entities that actually exist in the text.
4. Output ONLY the raw JSON object, without markdown explanation.
"""

def _clean_json_string(raw_text: str) -> str:
    """Strip markdown code fence blocks if returned by the model."""
    text = raw_text.strip()
    if text.startswith("```"):
        text = re.sub(r"^```(?:json)?\s*", "", text)
        text = re.sub(r"\s*```$", "", text)
    return text.strip()

def _heuristic_rule_based_extraction(title: str, text: str) -> ExtractedDocumentData:
    """
    Deterministic rule-based extractor used when GEMINI_API_KEY is not configured
    or during offline testing. Guarantees the system never crashes.
    """
    entities: List[ExtractedEntity] = []
    events: List[ExtractedEvent] = []
    relationships: List[ExtractedRelationship] = []
    key_decisions: List[Dict[str, Any]] = []

    # Find common date patterns (YYYY-MM-DD, Month DD, YYYY, etc.)
    date_matches = re.findall(
        r'\b(?:January|February|March|April|May|June|July|August|September|October|November|December)\s+\d{1,2}(?:st|nd|rd|th)?(?:,\s+\d{4})?|\b\d{4}-\d{2}-\d{2}\b|\bQ[1-4]\s+\d{4}\b',
        text,
        re.IGNORECASE
    )

    # Detect @mentions (always valid person references)
    mention_matches = list(set(re.findall(r'@([A-Za-z0-9_]+)', text)))

    # Detect capitalized name patterns, but filter false positives
    raw_name_matches = re.findall(r'\b([A-Z][a-z]+ [A-Z][a-z]+)\b', text)

    # Known false positive patterns (section headers, common phrases)
    false_positives = {
        "Problem Statement", "Action Items", "Next Steps", "Conclusion",
        "Requirements", "Background", "Context", "Summary", "Overview",
        "Agenda", "Attendees", "Participants", "Notes", "Minutes",
        "Discussion", "Recommendation", "Decision", "Status", "Timeline",
        "Alternatives Considered", "Rejected Alternatives", "Root Cause",
        "Lessons Learned", "Risk Assessment", "Mitigation Strategy",
        "Budget Resources", "Scope Objectives", "Success Criteria",
        "Phase Stage", "Task Item", "Point Note", "Remark Comment",
        "Feedback Suggestion", "Proposal Guideline", "Policy Procedure",
        "Process Protocol", "Standard Specification", "Definition Description",
        "Explanation Analysis", "Evaluation Review", "Report Section",
        "Architecture Board", "Board Meeting", "Staff Engineer",
        "VP Engineering", "Payment Service", "Architecture B",
        "Phase Phase", "Incident Retrospective", "Slack Transcript"
    }

    # Filter name matches
    actors = []
    for name in mention_matches:
        if name not in false_positives and len(name) > 2:
            actors.append(name)

    for name in raw_name_matches:
        if name not in false_positives and len(name) > 3:
            # Additional check: must not contain common non-person words
            lower_name = name.lower()
            non_person = {"the", "and", "for", "with", "from", "this", "that", "was", "are",
                         "has", "have", "had", "will", "can", "may", "might", "should",
                         "problem", "statement", "action", "items", "next", "steps",
                         "conclusion", "requirements", "background", "context", "summary",
                         "overview", "agenda", "attendees", "participants", "notes",
                         "minutes", "discussion", "recommendation", "decision", "status",
                         "timeline", "alternatives", "considered", "rejected", "root",
                         "cause", "lessons", "learned", "risk", "assessment", "mitigation",
                         "strategy", "budget", "resources", "scope", "objectives", "success",
                         "criteria", "phase", "stage", "task", "item", "point", "note"}
            if not any(w in lower_name.split() for w in non_person):
                actors.append(name)

    # Deduplicate and limit
    actors = list(dict.fromkeys(actors))[:6]

    for actor in actors:
        entities.append(ExtractedEntity(
            name=actor,
            type="person",
            role="Contributor / Stakeholder",
            description=f"Identified contributor in {title}"
        ))

    # Detect common system/tech names
    tech_keywords = ["PostgreSQL", "MongoDB", "Redis", "Kafka", "Docker", "Kubernetes", "AWS",
                     "FastAPI", "Next.js", "GraphQL", "REST", "Supabase", "Gemini", "React",
                     "Node.js", "TypeScript", "Python", "Go", "Rust", "Java", "C++",
                     "MySQL", "Elasticsearch", "RabbitMQ", "Celery", "Nginx", "Apache",
                     "GCP", "Azure", "Terraform", "Ansible", "Jenkins",
                     "Prometheus", "Grafana", "Datadog", "Splunk", "PagerDuty", "Slack",
                     "Jira", "Confluence", "Notion", "Figma", "Miro", "Linear",
                     "Architecture B", "Architecture A", "Event-Driven", "Microservices",
                     "Monolith", "Serverless", "CQRS", "Event Sourcing", "Payment Service"]
    found_tech = [tech for tech in tech_keywords if tech.lower() in text.lower()]
    for tech in found_tech:
        entities.append(ExtractedEntity(
            name=tech,
            type="system",
            role="Infrastructure / Tech Stack",
            description=f"{tech} technology referenced in decisions"
        ))

    # Identify decisions via keyword sentences
    decision_sentences = []
    sentences = re.split(r'(?<=[.!?])\s+', text)
    for s in sentences:
        s_clean = s.strip()
        if re.search(r'\b(decided|chose|selected|migrated|approved|rejected|switched|transitioned|agreed)\b', s_clean, re.IGNORECASE):
            decision_sentences.append(s_clean)

    for idx, d_sent in enumerate(decision_sentences[:5]):
        event_date = date_matches[idx] if idx < len(date_matches) else "Historical Record"
        events.append(ExtractedEvent(
            date=event_date,
            title=f"Decision: {d_sent[:50]}...",
            description=d_sent,
            decision=d_sent,
            actors=actors[:2],
            evidence_quote=d_sent[:150],
            document_title=title
        ))
        key_decisions.append({
            "decision": d_sent,
            "why": "Documented in historical notes",
            "alternatives_rejected": None,
            "status": "decided"
        })

    # If no dates found, create a baseline event
    if not events:
        events.append(ExtractedEvent(
            date="Timeline Reference",
            title=f"Ingestion of {title}",
            description=f"Recorded document: {text[:120]}...",
            decision=None,
            actors=actors[:2],
            evidence_quote=text[:100],
            document_title=title
        ))

    # Build relationships between actors and tech
    if actors and found_tech:
        for i, actor in enumerate(actors[:2]):
            for j, tech in enumerate(found_tech[:2]):
                relationships.append(ExtractedRelationship(
                    source=actor,
                    target=tech,
                    relation="evaluated_or_implemented",
                    context=f"Recorded connection in {title}"
                ))

    summary = f"Archived document '{title}' containing {len(events)} milestones, referencing {len(actors)} stakeholders and {len(found_tech)} systems."

    return ExtractedDocumentData(
        summary=summary,
        entities=entities,
        relationships=relationships,
        events=events,
        key_decisions=key_decisions
    )

async def extract_structured_data_with_gemini(title: str, text: str) -> ExtractedDocumentData:
    """
    Calls Google Gemini to perform deep forensic entity, timeline, decision, and relationship extraction.
    Falls back gracefully to heuristic extraction if GEMINI_API_KEY is not set or API call fails.
    """
    api_key = settings.GEMINI_API_KEY.strip() if settings.GEMINI_API_KEY else ""
    is_real_key = bool(api_key and not api_key.startswith("your_"))

    if not is_real_key:
        logger.info("GEMINI_API_KEY not set or placeholder. Using heuristic extraction.")
        return _heuristic_rule_based_extraction(title, text)

    user_content = f"DOCUMENT TITLE: {title}\n\nDOCUMENT CONTENT:\n{text[:15000]}"

    try:
        from google import genai
        client = genai.Client(api_key=api_key)
        
        # Try modern flash models
        models_to_try = ["models/gemini-3.6-flash", "models/gemini-3.5-flash-lite", "gemini-3.6-flash"]

        last_err = None
        for m_name in models_to_try:
            try:
                response = client.models.generate_content(
                    model=m_name,
                    contents=[SYSTEM_EXTRACTION_PROMPT, user_content],
                )
                raw_output = response.text or ""
                cleaned = _clean_json_string(raw_output)
                data_dict = json.loads(cleaned)
                return ExtractedDocumentData(**data_dict)
            except Exception as m_err:
                last_err = m_err
                continue
        raise last_err or Exception("Failed to generate content with Gemini")

    except Exception as e_modern:
        logger.warning(f"Gemini API extraction encountered: {e_modern}. Falling back to heuristic extraction.")
        return _heuristic_rule_based_extraction(title, text)


async def extract_from_image_with_gemini(image_bytes: bytes, filename: str, mime_type: str) -> Dict[str, Any]:
    """
    Use Gemini Multimodal Vision to extract text, diagrams, decisions, and entities from images.
    """
    api_key = settings.GEMINI_API_KEY.strip() if settings.GEMINI_API_KEY else ""
    is_real_key = bool(api_key and not api_key.startswith("your_"))
    
    doc_title = filename.rsplit('.', 1)[0].replace('_', ' ').replace('-', ' ').title()

    if not is_real_key:
        fallback_text = f"Image '{filename}' uploaded (OCR preview unavailable in offline mode without GEMINI_API_KEY)."
        return {
            "title": doc_title,
            "source_type": "image",
            "raw_content": fallback_text,
            "metadata": {"filename": filename, "mime_type": mime_type, "size_bytes": len(image_bytes)}
        }

    prompt = (
        "Transcribe and analyze all readable text, system architecture diagrams, chat conversations, "
        "or whiteboard notes in this image. Pay special attention to dates, named people, decisions, and system components."
    )

    try:
        from google import genai
        from google.genai import types
        client = genai.Client(api_key=api_key)
        response = client.models.generate_content(
            model="gemini-2.0-flash",
            contents=[
                prompt,
                types.Part.from_bytes(data=image_bytes, mime_type=mime_type)
            ]
        )
        content = response.text or ""
        return {
            "title": doc_title,
            "source_type": "image",
            "raw_content": content,
            "metadata": {"filename": filename, "mime_type": mime_type, "size_bytes": len(image_bytes)}
        }
    except Exception as e:
        logger.error(f"Image vision analysis failed: {e}")
        return {
            "title": doc_title,
            "source_type": "image",
            "raw_content": f"Image '{filename}' (Vision extraction error: {str(e)})",
            "metadata": {"filename": filename, "mime_type": mime_type, "error": str(e)}
        }
