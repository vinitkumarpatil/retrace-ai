"""
Work Engine - Processes evidence to produce context reconstruction.
Separates deterministic backend processing from Gemini reasoning.
"""
import re
import logging
from typing import Dict, Any, List, Set, Optional
from app.models import (
    MissingContextItem,
    ExtractedEvent,
    GraphData,
    GraphNode,
    GraphLink,
    CitationItem
)
from app.db import parse_date_for_sorting

logger = logging.getLogger(__name__)

# Patterns that indicate non-person entities (false positives to avoid)
NOT_PERSON_PATTERNS = [
    r"(?i)^(problem|issue|action|next|root|decision|conclusion|requirement|summary|background|context|rejected|alternatives?|considered|status|overview|agenda|attendees|participants|notes|minutes|discussion|recommendation|summary|附录|appendix|section|chapter|part|volume)\b",
    r"(?i)^(step|phase|stage|task|item|point|note|remark|comment|feedback|suggestion|proposal|recommendation|guideline|policy|procedure|process|protocol|standard|specification|definition|description|explanation|analysis|assessment|evaluation|review|report|survey|study|research|investigation|examination|inspection|audit|assessment|appraisal|estimation|forecast|projection|prediction|simulation|modeling|testing|validation|verification|calibration|optimization|improvement|enhancement|modification|adjustment|correction|revision|update|upgrade|migration|transition|transformation|conversion|adaptation|customization|configuration|initialization|deployment|installation|setup|implementation|integration|synchronization|coordination|collaboration|communication|consultation|negotiation|mediation|arbitration|adjudication|resolution|settlement|compromise|agreement|contract|treaty|pact|accord|protocol|charter|constitution|bylaws|regulations|rules|guidelines|standards|specifications|requirements|criteria|benchmarks|metrics|indicators|measures|targets|goals|objectives|strategies|tactics|plans|programs|projects|initiatives|efforts|activities|actions|operations|processes|procedures|methods|techniques|approaches|frameworks|models|architectures|designs|patterns|structures|systems|networks|platforms|environments|infrastructures|technologies|tools|instruments|devices|equipment|facilities|resources|assets|capabilities|competencies|skills|knowledge|expertise|experience|qualifications|credentials|certifications|licenses|permits|approvals|authorizations|clearances|access|permissions|privileges|rights|entitlements|benefits|advantages|opportunities|threats|risks|challenges|obstacles|barriers|constraints|limitations|restrictions|conditions|assumptions|dependencies|prerequisites|prerequisites|dependencies|dependencies|dependencies|dependencies",
]

# Section headers that should not be entities
SECTION_HEADERS = [
    "Problem Statement", "Action Items", "Next Steps", "Conclusion",
    "Requirements", "Background", "Context", "Summary", "Overview",
    "Agenda", "Attendees", "Participants", "Notes", "Minutes",
    "Discussion", "Recommendation", "Decision", "Status", "Timeline",
    "Alternatives Considered", "Rejected Alternatives", "Root Cause",
    "Lessons Learned", "Risk Assessment", "Mitigation Strategy",
    "Budget", "Resources", "Scope", "Objectives", "Success Criteria"
]


def is_likely_person(name: str) -> bool:
    """Determine if a name string is likely an actual person name."""
    name = name.strip()

    # Too short or too long
    if len(name) < 3 or len(name) > 40:
        return False

    # Check against known false positive patterns
    for pattern in NOT_PERSON_PATTERNS:
        if re.search(pattern, name):
            return False

    # Check if it matches section headers
    if name in SECTION_HEADERS:
        return False

    # Must have at least one capitalized word that looks like a name part
    parts = name.split()
    if len(parts) < 2:
        return False

    # All parts should be capitalized (title case) for a person name
    if not all(part[0].isupper() and len(part) > 1 for part in parts):
        return False

    # Should not contain common non-person words
    non_person_words = {
        "the", "and", "for", "with", "from", "this", "that", "was", "are",
        "has", "have", "had", "will", "can", "may", "might", "should",
        "would", "could", "not", "but", "however", "although", "while",
        "where", "when", "what", "which", "who", "how", "why", "all",
        "any", "each", "every", "some", "many", "much", "few", "more",
        "most", "other", "another", "such", "than", "then", "also",
        "very", "just", "only", "even", "still", "already", "yet",
        "Problem", "Statement", "Action", "Items", "Next", "Steps",
        "Conclusion", "Requirements", "Background", "Context", "Summary",
        "Overview", "Agenda", "Attendees", "Participants", "Notes",
        "Minutes", "Discussion", "Recommendation", "Decision", "Status",
        "Timeline", "Alternatives", "Considered", "Rejected", "Root",
        "Cause", "Lessons", "Learned", "Risk", "Assessment", "Mitigation",
        "Strategy", "Budget", "Resources", "Scope", "Objectives", "Success",
        "Criteria", "Phase", "Stage", "Task", "Item", "Point", "Note",
        "Remark", "Comment", "Feedback", "Suggestion", "Proposal",
        "Guideline", "Policy", "Procedure", "Process", "Protocol",
        "Standard", "Specification", "Definition", "Description",
        "Explanation", "Analysis", "Evaluation", "Review", "Report",
        "Section", "Chapter", "Part", "Volume", "Step"
    }

    lower_parts = set(p.lower() for p in parts)
    if lower_parts & non_person_words:
        return False

    return True


def detect_missing_context(
    query: str,
    retrieved_chunks: List[Dict[str, Any]],
    events: List[Dict[str, Any]],
    entities: List[Dict[str, Any]],
    relationships: List[Dict[str, Any]]
) -> List[MissingContextItem]:
    """
    Detect query-specific missing context based on evidence analysis.
    Returns empty list if no significant gaps detected.
    """
    missing = []
    query_lower = query.lower()

    # Analyze what the query is asking about
    is_asking_who = any(w in query_lower for w in ["who", "which person", "who approved", "who decided", "who was responsible"])
    is_asking_why = any(w in query_lower for w in ["why", "reason", "rationale", "justification", "cause"])
    is_asking_when = any(w in query_lower for w in ["when", "timeline", "sequence", "order", "before", "after"])
    is_asking_what = any(w in query_lower for w in ["what", "which", "describe", "explain"])
    is_asking_how = any(w in query_lower for w in ["how", "process", "method", "approach"])
    is_asking_missing = any(w in query_lower for w in ["missing", "gap", "absent", "unknown", "unresolved", "without"])

    # Check for insufficient evidence
    if len(retrieved_chunks) < 2:
        missing.append(MissingContextItem(
            category="broken_chain",
            description=f"The available sources contain limited documentation related to this question.",
            impact="Without more evidence, the reconstructed context may be incomplete or inaccurate.",
            suggested_investigation="Ingest additional related documents, meeting notes, or communication records."
        ))
        return missing

    # When explicitly asking about missing context, always provide analysis
    if is_asking_missing:
        # Check for approval gaps
        person_entities = [e for e in entities if e.get("type") == "person"]
        has_approval = any(
            r.get("relation", "").lower() in ["approved", "authorized", "signed_off", "decided"]
            for r in relationships
        )
        if not has_approval:
            missing.append(MissingContextItem(
                category="missing_stakeholder",
                description="The available documents do not clearly identify who formally approved or authorized the architecture decision.",
                impact="Accountability for the decision cannot be fully established from available records.",
                suggested_investigation="Check meeting minutes, email threads, or approval workflows from the decision timeframe."
            ))

        # Check for rationale gaps
        has_rationale = any(
            any(w in (c.get("chunk_text", "").lower()) for w in ["because", "reason", "due to", "rationale", "justification"])
            for c in retrieved_chunks
        )
        if not has_rationale:
            missing.append(MissingContextItem(
                category="unrecorded_reason",
                description="The formal rationale and alternatives analysis for this decision were not fully documented.",
                impact="The team cannot verify whether rejected alternatives were evaluated on objective criteria.",
                suggested_investigation="Look for RFC comments, design review notes, or Slack discussions from the decision period."
            ))

        # Always provide some missing context when explicitly asked
        if not missing:
            missing.append(MissingContextItem(
                category="unresolved_question",
                description="While the available evidence covers the main decision points, some contextual details remain unrecorded.",
                impact="Minor details about the decision process may have been communicated verbally or in channels not captured.",
                suggested_investigation="Review any supplementary meeting notes or informal communications from the same period."
            ))
        return missing

    # Check for missing person/approver when asking "who"
    if is_asking_who:
        has_approval = any(
            r.get("relation", "").lower() in ["approved", "authorized", "signed_off", "decided"]
            for r in relationships
        )
        if not has_approval:
            missing.append(MissingContextItem(
                category="missing_stakeholder",
                description="The documents do not identify who formally approved or authorized this decision.",
                impact="Accountability for the decision cannot be established from available records.",
                suggested_investigation="Check meeting minutes, email threads, or approval workflows from the decision timeframe."
            ))

    # Check for missing rationale when asking "why"
    if is_asking_why:
        has_rationale = any(
            any(w in (c.get("chunk_text", "").lower()) for w in ["because", "reason", "due to", "rationale", "justification"])
            for c in retrieved_chunks
        )
        if not has_rationale:
            missing.append(MissingContextItem(
                category="unrecorded_reason",
                description="The available sources do not explicitly document the rationale behind this decision.",
                impact="The team cannot verify whether the decision was based on data, intuition, or external pressure.",
                suggested_investigation="Look for RFC comments, design review notes, or Slack discussions from the decision period."
            ))

    # Check for timeline gaps when asking "when"
    if is_asking_when and events:
        dates = [parse_date_for_sorting(e.get("date", "")) for e in events]
        valid_dates = [d for d in dates if d != "9999-99-99"]
        if len(valid_dates) >= 2:
            # Check for large gaps between events
            valid_dates.sort()
            for i in range(1, len(valid_dates)):
                try:
                    d1 = valid_dates[i-1]
                    d2 = valid_dates[i]
                    # Simple gap detection (months apart)
                    if d1[:7] != d2[:7] and d1[:4] == d2[:4]:
                        missing.append(MissingContextItem(
                            category="gap_in_dates",
                            description=f"Timeline gap detected between {d1} and {d2} with no recorded events.",
                            impact="Events during this period may have influenced the outcome but are not documented.",
                            suggested_investigation="Search for records from the gap period, including emails, commits, or meeting notes."
                        ))
                        break
                except Exception:
                    pass

    # Check for contradictions
    if len(retrieved_chunks) >= 3:
        # Simple contradiction detection: check for opposing statements
        chunk_texts = [c.get("chunk_text", "").lower() for c in retrieved_chunks]
        contradiction_pairs = [
            ("approved", "rejected"), ("decided", "postponed"),
            ("migrated", "stayed"), ("increased", "decreased"),
            ("success", "failure"), ("before", "after"),
            ("yes", "no"), ("true", "false")
        ]
        for pos, neg in contradiction_pairs:
            has_pos = any(pos in t for t in chunk_texts)
            has_neg = any(neg in t for t in chunk_texts)
            if has_pos and has_neg:
                missing.append(MissingContextItem(
                    category="unresolved_question",
                    description=f"The sources contain potentially conflicting information regarding '{pos}' vs '{neg}'.",
                    impact="Without clarification, the team may draw incorrect conclusions about what actually occurred.",
                    suggested_investigation="Cross-reference timestamps and authors to determine which information is authoritative."
                ))
                break

    # Check for missing relationships
    if is_asking_what and not relationships:
        missing.append(MissingContextItem(
            category="broken_chain",
            description="No explicit relationships between entities were found in the retrieved evidence.",
            impact="The connection between actors, systems, and decisions cannot be established.",
            suggested_investigation="Ingest documents that describe how components or people interact."
        ))

    # Deduplicate by description
    seen_descriptions = set()
    unique_missing = []
    for item in missing:
        if item.description not in seen_descriptions:
            seen_descriptions.add(item.description)
            unique_missing.append(item)

    return unique_missing


def build_source_traceable_citation(chunk: Dict[str, Any]) -> CitationItem:
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


def sort_timeline_chronologically(events: List[Dict[str, Any]]) -> List[Dict[str, Any]]:
    """Sort timeline events chronologically by date, deduplicate."""
    seen = set()
    dated_events = []
    undated_events = []

    for ev in events:
        # Deduplicate by title+date
        key = f"{ev.get('date', '')}:{ev.get('title', '')}"
        if key in seen:
            continue
        seen.add(key)

        date_str = ev.get("date", "")
        sort_key = parse_date_for_sorting(date_str)
        if sort_key == "9999-99-99":
            undated_events.append(ev)
        else:
            dated_events.append((sort_key, ev))

    dated_events.sort(key=lambda x: x[0])
    return [ev for _, ev in dated_events] + undated_events


def calculate_deterministic_confidence(
    retrieved_chunks: List[Dict[str, Any]],
    events: List[Dict[str, Any]],
    entities: List[Dict[str, Any]],
    relationships: List[Dict[str, Any]],
    query: str
) -> tuple[str, str]:
    """
    Calculate confidence based on deterministic signals.
    Returns (level, rationale) where level is 'high', 'medium', or 'low'.
    """
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

    # Entity diversity
    entity_count = len(set(e.get("name") for e in entities))
    if entity_count >= 5:
        score += 0.05
        rationale_parts.append(f"{entity_count} distinct entities identified")

    # Relationship coverage
    rel_count = len(relationships)
    if rel_count >= 3:
        score += 0.05
        rationale_parts.append(f"{rel_count} relationships documented")

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


def build_graph(
    entities: List[Dict[str, Any]],
    relationships: List[Dict[str, Any]],
    max_nodes: int = 20,
    max_links: int = 30
) -> GraphData:
    """Build graph nodes and relationships from extracted data."""
    graph_nodes = []
    graph_links = []
    seen_nodes: Set[str] = set()

    for e in entities[:max_nodes]:
        if e["name"] not in seen_nodes:
            seen_nodes.add(e["name"])
            graph_nodes.append(GraphNode(
                id=e["name"],
                name=e["name"],
                type=e["type"],
                description=e.get("description", e.get("role")),
                val=3.0 if e["type"] in ["decision", "system"] else 2.0
            ))

    for r in relationships[:max_links]:
        if r["source"] in seen_nodes and r["target"] in seen_nodes:
            graph_links.append(GraphLink(
                source=r["source"],
                target=r["target"],
                relation=r["relation"],
                evidence=r.get("context")
            ))

    return GraphData(nodes=graph_nodes, links=graph_links)


def build_timeline_events(events: List[Dict[str, Any]], max_events: int = 8) -> List[ExtractedEvent]:
    """Build timeline events from extracted data."""
    sorted_events = sort_timeline_chronologically(events[:max_events])
    return [
        ExtractedEvent(
            date=ev["date"],
            title=ev["title"],
            description=ev["description"],
            decision=ev.get("decision"),
            actors=ev.get("actors", []),
            evidence_quote=ev.get("evidence_quote"),
            document_title=ev.get("document_title")
        )
        for ev in sorted_events
    ]


def build_citations(retrieved_chunks: List[Dict[str, Any]], max_citations: int = 6) -> List[CitationItem]:
    """Build traceable citations from retrieved chunks."""
    citations = []
    seen_docs = set()
    for c in retrieved_chunks[:max_citations * 2]:
        doc_id = c.get("document_id")
        if doc_id not in seen_docs:
            seen_docs.add(doc_id)
            citations.append(build_source_traceable_citation(c))
            if len(citations) >= max_citations:
                break
    return citations


def get_sources_used(retrieved_chunks: List[Dict[str, Any]]) -> List[str]:
    """Collect unique source document IDs used."""
    return list(set(c.get("document_id") for c in retrieved_chunks if c.get("document_id")))
