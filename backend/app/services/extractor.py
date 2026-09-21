import io
import re
from typing import Dict, Any, List, Optional
import httpx
from bs4 import BeautifulSoup
from pypdf import PdfReader

def chunk_text(text: str, chunk_size: int = 1000, overlap: int = 200) -> List[Dict[str, Any]]:
    """
    Split text into overlapping semantic chunks for embedding and retrieval.
    Tries to break on paragraph or sentence boundaries.
    """
    cleaned_text = re.sub(r'\r\n', '\n', text).strip()
    if not cleaned_text:
        return []

    # Split into paragraphs
    paragraphs = [p.strip() for p in cleaned_text.split('\n\n') if p.strip()]
    chunks: List[Dict[str, Any]] = []
    
    current_chunk = ""
    chunk_index = 0
    
    for para in paragraphs:
        if len(current_chunk) + len(para) + 2 <= chunk_size:
            current_chunk = f"{current_chunk}\n\n{para}".strip()
        else:
            if current_chunk:
                chunks.append({
                    "chunk_index": chunk_index,
                    "chunk_text": current_chunk,
                    "char_count": len(current_chunk)
                })
                chunk_index += 1
                # Overlap logic
                overlap_text = current_chunk[-overlap:] if len(current_chunk) > overlap else current_chunk
                current_chunk = f"{overlap_text}\n\n{para}".strip()
            else:
                # Paragraph itself is larger than chunk_size, split by sentences or hard split
                sentences = re.split(r'(?<=[.!?])\s+', para)
                sub_chunk = ""
                for sent in sentences:
                    if len(sub_chunk) + len(sent) + 1 <= chunk_size:
                        sub_chunk = f"{sub_chunk} {sent}".strip()
                    else:
                        if sub_chunk:
                            chunks.append({
                                "chunk_index": chunk_index,
                                "chunk_text": sub_chunk,
                                "char_count": len(sub_chunk)
                            })
                            chunk_index += 1
                        sub_chunk = sent
                if sub_chunk:
                    current_chunk = sub_chunk

    if current_chunk:
        chunks.append({
            "chunk_index": chunk_index,
            "chunk_text": current_chunk,
            "char_count": len(current_chunk)
        })

    return chunks

def extract_from_pdf(file_bytes: bytes, filename: str) -> Dict[str, Any]:
    """Extract raw text and metadata from a PDF file using pypdf."""
    reader = PdfReader(io.BytesIO(file_bytes))
    num_pages = len(reader.pages)
    text_content = []
    
    for idx, page in enumerate(reader.pages):
        page_text = page.extract_text() or ""
        if page_text.strip():
            text_content.append(f"--- Page {idx + 1} ---\n{page_text.strip()}")
            
    full_text = "\n\n".join(text_content)
    
    # Try to extract title from PDF metadata or use filename
    doc_info = reader.metadata or {}
    title = getattr(doc_info, 'title', None) or filename.rsplit('.', 1)[0].replace('_', ' ').replace('-', ' ').title()
    
    return {
        "title": title,
        "source_type": "pdf",
        "raw_content": full_text,
        "metadata": {
            "filename": filename,
            "page_count": num_pages,
            "file_size": len(file_bytes),
        }
    }

async def extract_from_url(url: str, custom_title: Optional[str] = None) -> Dict[str, Any]:
    """Fetch and scrape clean readable text from a URL."""
    headers = {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) ReTrace/0.1.0"
    }
    
    async with httpx.AsyncClient(timeout=15.0, follow_redirects=True) as client:
        response = await client.get(url, headers=headers)
        response.raise_for_status()
        html = response.text

    soup = BeautifulSoup(html, "html.parser")
    
    # Remove script, style, navigation, footer tags
    for tag in soup(["script", "style", "nav", "footer", "header", "noscript", "svg"]):
        tag.decompose()
        
    page_title = custom_title or (soup.title.string.strip() if soup.title and soup.title.string else url)
    
    # Extract headings and paragraphs
    paragraphs = []
    for elem in soup.find_all(['h1', 'h2', 'h3', 'h4', 'p', 'li', 'pre', 'code']):
        txt = elem.get_text(separator=" ", strip=True)
        if len(txt) > 20:
            paragraphs.append(txt)
            
    raw_content = "\n\n".join(paragraphs) if paragraphs else soup.get_text(separator="\n", strip=True)
    
    return {
        "title": page_title,
        "source_type": "url",
        "raw_content": raw_content,
        "metadata": {
            "url": url,
            "char_count": len(raw_content),
        }
    }

def extract_from_text(title: str, text: str, source_type: str = "text", metadata: Optional[Dict[str, Any]] = None) -> Dict[str, Any]:
    """Prepare raw text or markdown input."""
    return {
        "title": title,
        "source_type": source_type,
        "raw_content": text.strip(),
        "metadata": metadata or {
            "char_count": len(text.strip()),
        }
    }
