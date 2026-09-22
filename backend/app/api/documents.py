import os
import mimetypes
from fastapi import APIRouter, HTTPException, Response
from fastapi.responses import FileResponse, PlainTextResponse
from app.db import db

router = APIRouter(prefix="/api/documents", tags=["Documents"])

@router.get("/{document_id}")
async def get_document_details(document_id: str):
    """Retrieve full document metadata and content."""
    doc = await db.get_document_by_id(document_id)
    if not doc:
        raise HTTPException(status_code=404, detail="Document not found")
    return doc

@router.get("/{document_id}/file")
async def get_document_file(document_id: str):
    """
    Stream or download the source document file with correct MIME type
    and byte-range support for video, audio, PDF, and images.
    """
    doc = await db.get_document_by_id(document_id)
    if not doc:
        raise HTTPException(status_code=404, detail="Document not found")

    metadata = doc.get("metadata", {})
    file_path = metadata.get("file_path")

    # If physical file exists on disk, serve it with FileResponse
    if file_path and os.path.exists(file_path):
        filename = metadata.get("filename", os.path.basename(file_path))
        mime_type, _ = mimetypes.guess_type(filename)
        
        if not mime_type:
            mime_type = metadata.get("content_type") or "application/octet-stream"

        # Correct headers for inline viewing in browser
        headers = {
            "Content-Disposition": f'inline; filename="{filename}"',
            "Accept-Ranges": "bytes"
        }

        return FileResponse(
            path=file_path,
            media_type=mime_type,
            headers=headers
        )

    # For text-only or seeded notes that don't have a binary file on disk:
    raw_content = doc.get("raw_content", "")
    content_type = "text/plain; charset=utf-8"
    if doc.get("source_type") == "json":
        content_type = "application/json; charset=utf-8"

    filename = f"{doc.get('title', 'document').replace(' ', '_')}.txt"
    return Response(
        content=raw_content.encode("utf-8"),
        media_type=content_type,
        headers={
            "Content-Disposition": f'inline; filename="{filename}"'
        }
    )
