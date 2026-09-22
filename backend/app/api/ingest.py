import os
import re
import uuid
from typing import Optional, Dict, Any, List
from fastapi import APIRouter, UploadFile, File, Form, HTTPException
from app.models import (
    TextIngestRequest,
    UrlIngestRequest,
    IngestResponse,
    ExtractedDocumentData
)
from app.services.extractor import (
    extract_from_text,
    extract_from_pdf,
    extract_from_url,
    chunk_text
)
from app.services.gemini_service import (
    extract_structured_data_with_gemini,
    extract_from_image_with_gemini
)
from app.services.embedding_service import generate_embeddings_batch
from app.db import db

router = APIRouter(prefix="/api/ingest", tags=["Ingestion"])

DATA_DIR = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), "data")
UPLOADS_DIR = os.path.join(DATA_DIR, "uploads")
os.makedirs(UPLOADS_DIR, exist_ok=True)

async def _persist_ingested_content(doc_data: Dict[str, Any], chunks: List[Dict[str, Any]], extracted: ExtractedDocumentData) -> str:
    """Store document, chunks with embeddings, and extracted entities in database."""
    doc_id = await db.insert_document(
        title=doc_data["title"],
        source_type=doc_data["source_type"],
        raw_content=doc_data["raw_content"],
        metadata=doc_data.get("metadata", {})
    )

    if chunks:
        chunk_texts = [c["chunk_text"] for c in chunks]
        embeddings = await generate_embeddings_batch(chunk_texts)
        chunks_with_emb = [
            {
                "chunk_index": c["chunk_index"],
                "chunk_text": c["chunk_text"],
                "embedding": emb,
                "metadata": doc_data.get("metadata", {})
            }
            for c, emb in zip(chunks, embeddings)
        ]
        await db.insert_chunks(doc_id, chunks_with_emb)

    if extracted.entities:
        await db.insert_extracted_entities(doc_id, [e.model_dump() for e in extracted.entities])

    if extracted.relationships:
        await db.insert_extracted_relationships(doc_id, [r.model_dump() for r in extracted.relationships])

    if extracted.events:
        await db.insert_extracted_events(doc_id, [ev.model_dump() for ev in extracted.events])

    return doc_id

@router.post("/text", response_model=IngestResponse)
async def ingest_text_endpoint(payload: TextIngestRequest):
    """Ingest raw text, meeting notes, slack messages, or RFCs."""
    if not payload.text.strip():
        raise HTTPException(status_code=400, detail="Text content cannot be empty.")

    doc_data = extract_from_text(
        title=payload.title,
        text=payload.text,
        source_type=payload.source_type,
        metadata=payload.metadata
    )

    chunks = chunk_text(doc_data["raw_content"])
    extracted: ExtractedDocumentData = await extract_structured_data_with_gemini(
        title=doc_data["title"],
        text=doc_data["raw_content"]
    )

    doc_id = await _persist_ingested_content(doc_data, chunks, extracted)

    return IngestResponse(
        success=True,
        document_id=doc_id,
        title=doc_data["title"],
        source_type=doc_data["source_type"],
        chunk_count=len(chunks),
        extracted_entities_count=len(extracted.entities),
        extracted_events_count=len(extracted.events),
        message=f"Successfully ingested '{doc_data['title']}' with {len(extracted.entities)} entities and {len(extracted.events)} milestones."
    )

@router.post("/url", response_model=IngestResponse)
async def ingest_url_endpoint(payload: UrlIngestRequest):
    """Scrape and ingest an external document or wiki URL."""
    try:
        doc_data = await extract_from_url(payload.url, payload.title)
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Failed to scrape URL: {str(e)}")

    chunks = chunk_text(doc_data["raw_content"])
    extracted: ExtractedDocumentData = await extract_structured_data_with_gemini(
        title=doc_data["title"],
        text=doc_data["raw_content"]
    )

    doc_id = await _persist_ingested_content(doc_data, chunks, extracted)

    return IngestResponse(
        success=True,
        document_id=doc_id,
        title=doc_data["title"],
        source_type="url",
        chunk_count=len(chunks),
        extracted_entities_count=len(extracted.entities),
        extracted_events_count=len(extracted.events),
        message=f"Successfully scraped and ingested '{doc_data['title']}'."
    )

@router.post("/file", response_model=IngestResponse)
async def ingest_file_endpoint(
    file: UploadFile = File(...),
    custom_title: Optional[str] = Form(None)
):
    """Upload and ingest PDF, images, video, audio, code, json, markdown, or text documents."""
    contents = await file.read()
    if not contents:
        raise HTTPException(status_code=400, detail="Uploaded file is empty.")

    filename = file.filename or "uploaded_file"
    content_type = file.content_type or ""
    lower_name = filename.lower()

    # Persist raw binary to uploads directory for inline streaming/viewing
    safe_filename = re.sub(r'[^a-zA-Z0-9_.-]', '_', filename)
    file_id = str(uuid.uuid4())[:8]
    stored_filename = f"{file_id}_{safe_filename}"
    file_storage_path = os.path.join(UPLOADS_DIR, stored_filename)

    with open(file_storage_path, "wb") as f:
        f.write(contents)

    metadata = {
        "filename": filename,
        "stored_filename": stored_filename,
        "file_path": file_storage_path,
        "file_size": len(contents),
        "content_type": content_type
    }

    derived_title = custom_title or filename.rsplit('.', 1)[0].replace('_', ' ').replace('-', ' ').title()

    # 1. PDF
    if lower_name.endswith(".pdf") or "pdf" in content_type:
        try:
            doc_data = extract_from_pdf(contents, filename)
            doc_data["metadata"].update(metadata)
        except Exception as e:
            raise HTTPException(status_code=400, detail=f"Failed to parse PDF: {str(e)}")

    # 2. Images (PNG, JPG, JPEG, WEBP, GIF, SVG)
    elif any(lower_name.endswith(ext) for ext in [".png", ".jpg", ".jpeg", ".webp", ".gif", ".svg"]) or "image" in content_type:
        mime = content_type or "image/png"
        doc_data = await extract_from_image_with_gemini(contents, filename, mime)
        doc_data["source_type"] = "image"
        doc_data["metadata"].update(metadata)

    # 3. Video (MP4, WEBM, MOV, AVI, MKV)
    elif any(lower_name.endswith(ext) for ext in [".mp4", ".webm", ".mov", ".avi", ".mkv", ".m4v"]) or "video" in content_type:
        size_mb = len(contents) / (1024 * 1024)
        raw_content = (
            f"Video Recording Artifact: {filename}\n"
            f"File Size: {size_mb:.2f} MB | Content-Type: {content_type or 'video/mp4'}\n"
            f"Description: Historical video capture, product demo, or architecture review recording '{derived_title}'.\n"
            f"Key discussion points and decisions recorded in video evidence."
        )
        doc_data = {
            "title": derived_title,
            "source_type": "video",
            "raw_content": raw_content,
            "metadata": metadata
        }

    # 4. Audio (MP3, WAV, M4A, OGG, FLAC, AAC)
    elif any(lower_name.endswith(ext) for ext in [".mp3", ".wav", ".m4a", ".ogg", ".flac", ".aac"]) or "audio" in content_type:
        size_mb = len(contents) / (1024 * 1024)
        raw_content = (
            f"Audio Recording Artifact: {filename}\n"
            f"File Size: {size_mb:.2f} MB | Content-Type: {content_type or 'audio/mpeg'}\n"
            f"Description: Historical meeting audio recording, verbal sync, or incident war-room audio '{derived_title}'.\n"
            f"Stakeholders recorded verbal rationale and action items."
        )
        doc_data = {
            "title": derived_title,
            "source_type": "audio",
            "raw_content": raw_content,
            "metadata": metadata
        }

    # 5. Code & Data (JSON, Python, JS, TS, HTML, CSS, YAML, SQL)
    elif any(lower_name.endswith(ext) for ext in [".json", ".py", ".js", ".jsx", ".ts", ".tsx", ".html", ".css", ".yaml", ".yml", ".sql", ".sh", ".toml"]):
        try:
            text_str = contents.decode("utf-8")
        except UnicodeDecodeError:
            text_str = contents.decode("latin-1")
            
        src_type = "json" if lower_name.endswith(".json") else "code"
        doc_data = {
            "title": derived_title,
            "source_type": src_type,
            "raw_content": text_str,
            "metadata": metadata
        }

    # 6. Default Text / Markdown
    else:
        try:
            text_str = contents.decode("utf-8")
        except UnicodeDecodeError:
            text_str = contents.decode("latin-1")
            
        doc_data = extract_from_text(
            title=derived_title,
            text=text_str,
            source_type="text",
            metadata=metadata
        )

    if custom_title:
        doc_data["title"] = custom_title

    chunks = chunk_text(doc_data["raw_content"])
    extracted: ExtractedDocumentData = await extract_structured_data_with_gemini(
        title=doc_data["title"],
        text=doc_data["raw_content"]
    )

    doc_id = await _persist_ingested_content(doc_data, chunks, extracted)

    return IngestResponse(
        success=True,
        document_id=doc_id,
        title=doc_data["title"],
        source_type=doc_data["source_type"],
        chunk_count=len(chunks),
        extracted_entities_count=len(extracted.entities),
        extracted_events_count=len(extracted.events),
        message=f"Successfully processed '{doc_data['title']}' ({doc_data['source_type'].upper()}) with {len(extracted.entities)} entities extracted."
    )
