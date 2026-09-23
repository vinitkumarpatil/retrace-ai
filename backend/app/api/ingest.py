import uuid
from typing import Optional, Dict, Any, List
from fastapi import APIRouter, UploadFile, File, Form, HTTPException
from pydantic import BaseModel, Field
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
    chunk_text,
    is_audio_file,
    get_audio_mime_type,
    AUDIO_EXTENSIONS
)
from app.services.gemini_service import (
    extract_structured_data_with_gemini,
    extract_from_image_with_gemini,
    extract_from_audio_with_gemini
)
from app.services.embedding_service import generate_embeddings_batch
from app.db import db, compute_content_hash

router = APIRouter(prefix="/api/ingest", tags=["Ingestion"])

async def _persist_ingested_content(doc_data: Dict[str, Any], chunks: List[Dict[str, Any]], extracted: ExtractedDocumentData,
                                     path: str = None, url: str = None, project: str = None) -> tuple[str, bool]:
    """Store document, chunks with embeddings, and extracted entities in database. Returns (doc_id, is_duplicate)."""
    # Check for duplicate content
    content_hash = compute_content_hash(doc_data["raw_content"])
    existing_doc_id = await db.check_content_hash(content_hash)
    if existing_doc_id:
        return existing_doc_id, True

    doc_id = await db.insert_document(
        title=doc_data["title"],
        source_type=doc_data["source_type"],
        raw_content=doc_data["raw_content"],
        metadata=doc_data.get("metadata", {}),
        path=path,
        url=url,
        project=project
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

    return doc_id, False

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

    doc_id, is_duplicate = await _persist_ingested_content(
        doc_data, chunks, extracted,
        path=payload.path, url=payload.url, project=payload.project
    )

    content_hash = compute_content_hash(doc_data["raw_content"])

    return IngestResponse(
        success=True,
        document_id=doc_id,
        title=doc_data["title"],
        source_type=doc_data["source_type"],
        chunk_count=len(chunks) if not is_duplicate else 0,
        extracted_entities_count=len(extracted.entities) if not is_duplicate else 0,
        extracted_events_count=len(extracted.events) if not is_duplicate else 0,
        message=f"Successfully ingested '{doc_data['title']}'" + (" (duplicate detected, reusing existing)" if is_duplicate else f" with {len(extracted.entities)} entities and {len(extracted.events)} milestones."),
        content_hash=content_hash,
        is_duplicate=is_duplicate
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

    doc_id, is_duplicate = await _persist_ingested_content(
        doc_data, chunks, extracted,
        url=payload.url, project=payload.project
    )

    content_hash = compute_content_hash(doc_data["raw_content"])

    return IngestResponse(
        success=True,
        document_id=doc_id,
        title=doc_data["title"],
        source_type="url",
        chunk_count=len(chunks) if not is_duplicate else 0,
        extracted_entities_count=len(extracted.entities) if not is_duplicate else 0,
        extracted_events_count=len(extracted.events) if not is_duplicate else 0,
        message=f"Successfully scraped and ingested '{doc_data['title']}'" + (" (duplicate detected)" if is_duplicate else "."),
        content_hash=content_hash,
        is_duplicate=is_duplicate
    )

@router.post("/file", response_model=IngestResponse)
async def ingest_file_endpoint(
    file: UploadFile = File(...),
    custom_title: Optional[str] = Form(None),
    project: Optional[str] = Form(None)
):
    """Upload and ingest a PDF, screenshot/image, markdown, or text document."""
    contents = await file.read()
    if not contents:
        raise HTTPException(status_code=400, detail="Uploaded file is empty.")

    filename = file.filename or "uploaded_file"
    content_type = file.content_type or ""
    lower_name = filename.lower()

    if lower_name.endswith(".pdf") or "pdf" in content_type:
        try:
            doc_data = extract_from_pdf(contents, filename)
        except Exception as e:
            raise HTTPException(status_code=400, detail=f"Failed to parse PDF: {str(e)}")
    elif any(lower_name.endswith(ext) for ext in [".png", ".jpg", ".jpeg", ".webp"]) or "image" in content_type:
        mime = content_type or "image/png"
        doc_data = await extract_from_image_with_gemini(contents, filename, mime)
    elif is_audio_file(filename) or "audio" in content_type:
        mime = content_type or get_audio_mime_type(filename)
        doc_data = await extract_from_audio_with_gemini(contents, filename, mime)
    elif lower_name.endswith(".json"):
        try:
            text_str = contents.decode("utf-8")
        except UnicodeDecodeError:
            text_str = contents.decode("latin-1")
        doc_data = extract_from_text(
            title=custom_title or filename.rsplit('.', 1)[0].replace('_', ' ').title(),
            text=text_str,
            source_type="text",
            metadata={"filename": filename, "format": "json"}
        )
    elif lower_name.endswith(".csv"):
        try:
            text_str = contents.decode("utf-8")
        except UnicodeDecodeError:
            text_str = contents.decode("latin-1")
        doc_data = extract_from_text(
            title=custom_title or filename.rsplit('.', 1)[0].replace('_', ' ').title(),
            text=text_str,
            source_type="text",
            metadata={"filename": filename, "format": "csv"}
        )
    else:
        try:
            text_str = contents.decode("utf-8")
        except UnicodeDecodeError:
            text_str = contents.decode("latin-1")
            
        doc_data = extract_from_text(
            title=custom_title or filename.rsplit('.', 1)[0].replace('_', ' ').title(),
            text=text_str,
            source_type="text",
            metadata={"filename": filename}
        )

    if custom_title:
        doc_data["title"] = custom_title

    chunks = chunk_text(doc_data["raw_content"])
    extracted: ExtractedDocumentData = await extract_structured_data_with_gemini(
        title=doc_data["title"],
        text=doc_data["raw_content"]
    )

    doc_id, is_duplicate = await _persist_ingested_content(
        doc_data, chunks, extracted,
        path=filename, project=project
    )

    content_hash = compute_content_hash(doc_data["raw_content"])

    return IngestResponse(
        success=True,
        document_id=doc_id,
        title=doc_data["title"],
        source_type=doc_data["source_type"],
        chunk_count=len(chunks) if not is_duplicate else 0,
        extracted_entities_count=len(extracted.entities) if not is_duplicate else 0,
        extracted_events_count=len(extracted.events) if not is_duplicate else 0,
        message=f"Successfully processed '{doc_data['title']}'" + (" (duplicate detected)" if is_duplicate else f" with {len(extracted.entities)} entities extracted."),
        content_hash=content_hash,
        is_duplicate=is_duplicate
    )


@router.post("/audio", response_model=IngestResponse)
async def ingest_audio_endpoint(
    file: UploadFile = File(...),
    custom_title: Optional[str] = Form(None),
    project: Optional[str] = Form(None),
    relative_path: Optional[str] = Form(None)
):
    """Upload and transcribe an audio file (mp3, wav, m4a, ogg, webm, flac)."""
    contents = await file.read()
    if not contents:
        raise HTTPException(status_code=400, detail="Uploaded audio file is empty.")

    filename = file.filename or "uploaded_audio"
    content_type = file.content_type or ""
    mime = content_type or get_audio_mime_type(filename)

    if not (is_audio_file(filename) or "audio" in content_type):
        raise HTTPException(status_code=400, detail=f"File '{filename}' is not a recognized audio format.")

    doc_data = await extract_from_audio_with_gemini(contents, filename, mime)

    if custom_title:
        doc_data["title"] = custom_title

    file_path = relative_path or filename
    if relative_path:
        doc_data["metadata"]["relative_path"] = relative_path

    chunks = chunk_text(doc_data["raw_content"])
    extracted: ExtractedDocumentData = await extract_structured_data_with_gemini(
        title=doc_data["title"],
        text=doc_data["raw_content"]
    )

    doc_id, is_duplicate = await _persist_ingested_content(
        doc_data, chunks, extracted,
        path=file_path, project=project
    )

    content_hash = compute_content_hash(doc_data["raw_content"])

    return IngestResponse(
        success=True,
        document_id=doc_id,
        title=doc_data["title"],
        source_type="audio",
        chunk_count=len(chunks) if not is_duplicate else 0,
        extracted_entities_count=len(extracted.entities) if not is_duplicate else 0,
        extracted_events_count=len(extracted.events) if not is_duplicate else 0,
        message=f"Successfully transcribed and ingested '{doc_data['title']}'" + (" (duplicate detected)" if is_duplicate else f" with {len(extracted.entities)} entities extracted."),
        content_hash=content_hash,
        is_duplicate=is_duplicate
    )


@router.post("/browser", response_model=IngestResponse)
async def ingest_browser_context(payload: TextIngestRequest):
    """Ingest browser context captured by the Chrome extension."""
    if not payload.text.strip():
        raise HTTPException(status_code=400, detail="Browser context cannot be empty.")

    # Mark source type as url for browser captures
    source_type = "url"

    doc_data = extract_from_text(
        title=payload.title,
        text=payload.text,
        source_type=source_type,
        metadata={**payload.metadata, "captured_via": "chrome_extension"}
    )

    chunks = chunk_text(doc_data["raw_content"])
    extracted: ExtractedDocumentData = await extract_structured_data_with_gemini(
        title=doc_data["title"],
        text=doc_data["raw_content"]
    )

    doc_id, is_duplicate = await _persist_ingested_content(
        doc_data, chunks, extracted,
        url=payload.url, project=payload.project
    )

    content_hash = compute_content_hash(doc_data["raw_content"])

    return IngestResponse(
        success=True,
        document_id=doc_id,
        title=doc_data["title"],
        source_type=source_type,
        chunk_count=len(chunks) if not is_duplicate else 0,
        extracted_entities_count=len(extracted.entities) if not is_duplicate else 0,
        extracted_events_count=len(extracted.events) if not is_duplicate else 0,
        message=f"Browser context captured: '{doc_data['title']}'" + (" (duplicate detected)" if is_duplicate else f" with {len(extracted.entities)} entities."),
        content_hash=content_hash,
        is_duplicate=is_duplicate
    )


# --- Recursive Folder Ingestion ---

import os
import pathlib
import mimetypes

SUPPORTED_EXTENSIONS = {
    '.pdf', '.txt', '.md', '.json', '.csv',
    '.py', '.js', '.ts', '.jsx', '.tsx', '.html', '.css', '.xml',
    '.yml', '.yaml', '.toml', '.cfg', '.ini', '.env',
    '.sql', '.sh', '.bash', '.zsh',
    '.rst', '.adoc',
    '.docx',
    '.mp3', '.wav', '.m4a', '.ogg', '.webm', '.flac', '.aac', '.wma', '.opus',
}

MAX_FILE_SIZE = 10 * 1024 * 1024  # 10MB limit per file
MAX_DEPTH = 10  # Maximum directory depth


class FolderIngestRequest(BaseModel):
    root_path: str = Field(..., description="Root folder path to recursively ingest")
    project: Optional[str] = Field(default=None, description="Project name")
    max_depth: int = Field(default=10, description="Maximum directory depth")


class FolderIngestProgress(BaseModel):
    status: str
    files_discovered: int
    files_processed: int
    files_skipped: int
    files_failed: int
    current_file: Optional[str] = None
    results: List[Dict[str, Any]] = []


def _discover_files(root_path: str, max_depth: int = 10) -> List[Dict[str, Any]]:
    """Recursively discover supported files in a directory."""
    discovered = []
    root = pathlib.Path(root_path)

    if not root.exists():
        return discovered

    def _walk(current_path: pathlib.Path, depth: int):
        if depth > max_depth:
            return

        try:
            entries = sorted(current_path.iterdir(), key=lambda x: (x.is_file(), x.name.lower()))
        except PermissionError:
            return

        for entry in entries:
            if entry.name.startswith('.'):
                continue  # Skip hidden files/folders

            if entry.is_dir():
                _walk(entry, depth + 1)
            elif entry.is_file():
                ext = entry.suffix.lower()
                if ext in SUPPORTED_EXTENSIONS:
                    try:
                        stat = entry.stat()
                        rel_path = str(entry.relative_to(root))
                        mime_type = mimetypes.guess_type(entry.name)[0] or 'application/octet-stream'

                        discovered.append({
                            "absolute_path": str(entry.resolve()),
                            "relative_path": rel_path,
                            "filename": entry.name,
                            "extension": ext,
                            "mime_type": mime_type,
                            "file_size": stat.st_size,
                            "modified_at": stat.st_mtime,
                            "root_folder": root.name,
                        })
                    except (OSError, ValueError):
                        continue

    _walk(root, 0)
    return discovered


async def _ingest_single_file(file_info: Dict[str, Any], project: str = None) -> Dict[str, Any]:
    """Ingest a single file from the discovered list."""
    abs_path = file_info["absolute_path"]
    ext = file_info["extension"]
    filename = file_info["filename"]

    try:
        with open(abs_path, 'rb', encoding=None) as f:
            contents = f.read()
    except Exception as e:
        return {"success": False, "filename": filename, "error": f"Read error: {str(e)}"}

    if not contents:
        return {"success": False, "filename": filename, "error": "File is empty"}

    try:
        text_str = None
        if ext == '.pdf':
            doc_data = extract_from_pdf(contents, filename)
        elif ext in ['.png', '.jpg', '.jpeg', '.webp']:
            mime = file_info.get("mime_type", "image/png")
            doc_data = await extract_from_image_with_gemini(contents, filename, mime)
        elif ext in AUDIO_EXTENSIONS:
            mime = file_info.get("mime_type", get_audio_mime_type(filename))
            doc_data = await extract_from_audio_with_gemini(contents, filename, mime)
        elif ext == '.docx':
            # Basic DOCX extraction - extract text from XML
            try:
                import zipfile
                import xml.etree.ElementTree as ET
                with zipfile.ZipFile(abs_path) as z:
                    xml_content = z.read('word/document.xml')
                    tree = ET.fromstring(xml_content)
                    ns = {'w': 'http://schemas.openxmlformats.org/wordprocessingml/2006/main'}
                    paragraphs = tree.findall('.//w:p', ns)
                    text_str = '\n'.join(''.join(node.text or '' for node in p.findall('.//w:t', ns)) for p in paragraphs)
            except Exception:
                text_str = contents.decode('utf-8', errors='replace')

            if text_str:
                doc_data = extract_from_text(
                    title=filename.rsplit('.', 1)[0].replace('_', ' ').replace('-', ' ').title(),
                    text=text_str,
                    source_type="text",
                    metadata={"filename": filename, "format": "docx"}
                )
            else:
                return {"success": False, "filename": filename, "error": "Could not extract DOCX content"}
        else:
            # Text-based files
            try:
                text_str = contents.decode('utf-8')
            except UnicodeDecodeError:
                try:
                    text_str = contents.decode('latin-1')
                except:
                    return {"success": False, "filename": filename, "error": "Cannot decode file"}

            doc_data = extract_from_text(
                title=filename.rsplit('.', 1)[0].replace('_', ' ').replace('-', ' ').title(),
                text=text_str,
                source_type="text",
                metadata={"filename": filename, "format": ext.lstrip('.')}
            )

        # Add file metadata
        doc_data["metadata"]["relative_path"] = file_info["relative_path"]
        doc_data["metadata"]["absolute_path"] = abs_path
        doc_data["metadata"]["root_folder"] = file_info["root_folder"]
        doc_data["metadata"]["file_size"] = file_info["file_size"]
        doc_data["metadata"]["modified_at"] = file_info["modified_at"]

        chunks = chunk_text(doc_data["raw_content"])
        extracted: ExtractedDocumentData = await extract_structured_data_with_gemini(
            title=doc_data["title"],
            text=doc_data["raw_content"]
        )

        doc_id, is_duplicate = await _persist_ingested_content(
            doc_data, chunks, extracted,
            path=abs_path, project=project
        )

        return {
            "success": True,
            "filename": filename,
            "doc_id": doc_id,
            "is_duplicate": is_duplicate,
            "title": doc_data["title"],
        }

    except Exception as e:
        return {"success": False, "filename": filename, "error": str(e)}


@router.post("/folder")
async def ingest_folder_endpoint(payload: FolderIngestRequest):
    """Recursively ingest all supported files from a folder."""
    root_path = payload.root_path

    if not os.path.exists(root_path):
        raise HTTPException(status_code=400, detail=f"Folder not found: {root_path}")

    if not os.path.isdir(root_path):
        raise HTTPException(status_code=400, detail=f"Path is not a directory: {root_path}")

    # Discover all files
    discovered = _discover_files(root_path, payload.max_depth)

    if not discovered:
        return FolderIngestProgress(
            status="completed",
            files_discovered=0,
            files_processed=0,
            files_skipped=0,
            files_failed=0,
            results=[]
        )

    # Process files
    results = []
    processed = 0
    skipped = 0
    failed = 0

    for file_info in discovered:
        result = await _ingest_single_file(file_info, project=payload.project)
        results.append(result)

        if result["success"]:
            if result.get("is_duplicate"):
                skipped += 1
            else:
                processed += 1
        else:
            failed += 1

    return FolderIngestProgress(
        status="completed",
        files_discovered=len(discovered),
        files_processed=processed,
        files_skipped=skipped,
        files_failed=failed,
        results=results
    )
