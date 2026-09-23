import hashlib
import json
import logging
import os
import re
import sqlite3
import uuid
from datetime import datetime
from typing import Dict, Any, List, Optional, Tuple
import numpy as np
from app.config import settings

logger = logging.getLogger(__name__)

# Ensure data directory exists for local fallback
DATA_DIR = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), "data")
os.makedirs(DATA_DIR, exist_ok=True)
SQLITE_DB_PATH = os.path.join(DATA_DIR, "retrace.db")

def compute_content_hash(content: str) -> str:
    """Compute SHA-256 hash of content for deduplication."""
    return hashlib.sha256(content.encode("utf-8")).hexdigest()[:32]

def parse_date_for_sorting(date_str: str) -> str:
    """Extract sortable date string from various date formats."""
    if not date_str:
        return "9999-99-99"
    # YYYY-MM-DD format
    m = re.search(r'(\d{4}-\d{2}-\d{2})', date_str)
    if m:
        return m.group(1)
    # Month DD, YYYY
    months = {"january":"01","february":"02","march":"03","april":"04","may":"05","june":"06",
              "july":"07","august":"08","september":"09","october":"10","november":"11","december":"12"}
    m = re.search(r'(January|February|March|April|May|June|July|August|September|October|November|December)\s+(\d{1,2})(?:st|nd|rd|th)?(?:,\s*(\d{4}))?', date_str, re.IGNORECASE)
    if m:
        month = months.get(m.group(1).lower(), "01")
        day = m.group(2).zfill(2)
        year = m.group(3) or "9999"
        return f"{year}-{month}-{day}"
    # Q1-Q4 YYYY
    m = re.search(r'Q([1-4])\s+(\d{4})', date_str, re.IGNORECASE)
    if m:
        q = int(m.group(1))
        month = str((q - 1) * 3 + 1).zfill(2)
        return f"{m.group(2)}-{month}-01"
    # Fallback: try to find any 4-digit year
    m = re.search(r'(\d{4})', date_str)
    if m:
        return f"{m.group(1)}-01-01"
    return "9999-99-99"

class DatabaseClient:
    def __init__(self):
        self.supabase_url = settings.SUPABASE_URL.strip() if settings.SUPABASE_URL else ""
        self.supabase_key = settings.SUPABASE_KEY.strip() if settings.SUPABASE_KEY else ""
        self.use_supabase = bool(
            self.supabase_url and self.supabase_key and not self.supabase_url.startswith("https://your-")
        )
        self._supabase_client = None
        
        if self.use_supabase:
            try:
                from supabase import create_client
                self._supabase_client = create_client(self.supabase_url, self.supabase_key)
                logger.info("Connected to live Supabase instance with pgvector.")
            except Exception as e:
                logger.warning(f"Failed to initialize Supabase client: {e}. Falling back to SQLite.")
                self.use_supabase = False

        if not self.use_supabase:
            self._init_sqlite()

    def _get_sqlite_conn(self):
        conn = sqlite3.connect(SQLITE_DB_PATH)
        conn.row_factory = sqlite3.Row
        return conn

    def _init_sqlite(self):
        """Initialize local SQLite database mirroring the Supabase schema."""
        conn = self._get_sqlite_conn()
        cursor = conn.cursor()
        
        cursor.execute("""
            CREATE TABLE IF NOT EXISTS documents (
                id TEXT PRIMARY KEY,
                title TEXT NOT NULL,
                source_type TEXT NOT NULL,
                raw_content TEXT NOT NULL,
                metadata TEXT DEFAULT '{}',
                created_at TEXT NOT NULL,
                path TEXT,
                url TEXT,
                content_hash TEXT,
                project TEXT,
                modified_at TEXT,
                indexed_at TEXT,
                index_status TEXT DEFAULT 'indexed'
            )
        """)
        cursor.execute("""
            CREATE TABLE IF NOT EXISTS document_chunks (
                id TEXT PRIMARY KEY,
                document_id TEXT NOT NULL,
                chunk_index INTEGER NOT NULL,
                chunk_text TEXT NOT NULL,
                embedding TEXT,
                metadata TEXT DEFAULT '{}',
                created_at TEXT NOT NULL,
                FOREIGN KEY (document_id) REFERENCES documents (id) ON DELETE CASCADE
            )
        """)
        cursor.execute("""
            CREATE TABLE IF NOT EXISTS extracted_entities (
                id TEXT PRIMARY KEY,
                document_id TEXT,
                name TEXT NOT NULL,
                type TEXT NOT NULL,
                role TEXT,
                description TEXT,
                metadata TEXT DEFAULT '{}',
                created_at TEXT NOT NULL
            )
        """)
        cursor.execute("""
            CREATE TABLE IF NOT EXISTS extracted_relationships (
                id TEXT PRIMARY KEY,
                document_id TEXT,
                source_entity TEXT NOT NULL,
                target_entity TEXT NOT NULL,
                relation_type TEXT NOT NULL,
                context TEXT,
                created_at TEXT NOT NULL
            )
        """)
        cursor.execute("""
            CREATE TABLE IF NOT EXISTS extracted_events (
                id TEXT PRIMARY KEY,
                document_id TEXT,
                date_str TEXT NOT NULL,
                title TEXT NOT NULL,
                description TEXT NOT NULL,
                decision TEXT,
                actors TEXT DEFAULT '[]',
                evidence_quote TEXT,
                created_at TEXT NOT NULL
            )
        """)
        cursor.execute("""
            CREATE TABLE IF NOT EXISTS query_cache (
                query_hash TEXT PRIMARY KEY,
                result TEXT NOT NULL,
                created_at TEXT NOT NULL,
                hit_count INTEGER DEFAULT 0
            )
        """)
        conn.commit()
        conn.close()
        logger.info(f"Initialized local SQLite storage at {SQLITE_DB_PATH}")

    # --- Document & Chunk Storage ---

    async def insert_document(self, title: str, source_type: str, raw_content: str, metadata: Dict[str, Any],
                               path: str = None, url: str = None, project: str = None) -> str:
        doc_id = str(uuid.uuid4())
        now = datetime.utcnow().isoformat()
        content_hash = compute_content_hash(raw_content)

        if self.use_supabase and self._supabase_client:
            try:
                self._supabase_client.table("documents").insert({
                    "id": doc_id,
                    "title": title,
                    "source_type": source_type,
                    "raw_content": raw_content,
                    "metadata": metadata,
                    "created_at": now,
                    "path": path,
                    "url": url,
                    "content_hash": content_hash,
                    "project": project,
                    "indexed_at": now,
                    "index_status": "indexed"
                }).execute()
                return doc_id
            except Exception as e:
                logger.error(f"Supabase document insert failed: {e}. Writing to local SQLite.")

        conn = self._get_sqlite_conn()
        conn.execute(
            "INSERT INTO documents (id, title, source_type, raw_content, metadata, created_at, path, url, content_hash, project, indexed_at, index_status) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)",
            (doc_id, title, source_type, raw_content, json.dumps(metadata), now, path, url, content_hash, project, now, "indexed")
        )
        conn.commit()
        conn.close()
        return doc_id

    async def insert_chunks(self, document_id: str, chunks_with_embeddings: List[Dict[str, Any]]):
        now = datetime.utcnow().isoformat()
        
        if self.use_supabase and self._supabase_client:
            try:
                rows = [
                    {
                        "id": str(uuid.uuid4()),
                        "document_id": document_id,
                        "chunk_index": c["chunk_index"],
                        "chunk_text": c["chunk_text"],
                        "embedding": c.get("embedding"),
                        "metadata": c.get("metadata", {}),
                        "created_at": now
                    }
                    for c in chunks_with_embeddings
                ]
                self._supabase_client.table("document_chunks").insert(rows).execute()
                return
            except Exception as e:
                logger.error(f"Supabase chunks insert failed: {e}. Writing to SQLite.")

        conn = self._get_sqlite_conn()
        rows = [
            (
                str(uuid.uuid4()),
                document_id,
                c["chunk_index"],
                c["chunk_text"],
                json.dumps(c.get("embedding", [])),
                json.dumps(c.get("metadata", {})),
                now
            )
            for c in chunks_with_embeddings
        ]
        conn.executemany(
            "INSERT INTO document_chunks (id, document_id, chunk_index, chunk_text, embedding, metadata, created_at) VALUES (?, ?, ?, ?, ?, ?, ?)",
            rows
        )
        conn.commit()
        conn.close()

    async def insert_extracted_entities(self, document_id: str, entities: List[Dict[str, Any]]):
        if not entities:
            return
        now = datetime.utcnow().isoformat()

        if self.use_supabase and self._supabase_client:
            try:
                rows = [
                    {
                        "id": str(uuid.uuid4()),
                        "document_id": document_id,
                        "name": e["name"],
                        "type": e["type"],
                        "role": e.get("role"),
                        "description": e.get("description"),
                        "metadata": {},
                        "created_at": now
                    }
                    for e in entities
                ]
                self._supabase_client.table("extracted_entities").insert(rows).execute()
                return
            except Exception as e:
                logger.error(f"Supabase entities insert failed: {e}")

        conn = self._get_sqlite_conn()
        rows = [
            (
                str(uuid.uuid4()),
                document_id,
                e["name"],
                e["type"],
                e.get("role"),
                e.get("description"),
                json.dumps({}),
                now
            )
            for e in entities
        ]
        conn.executemany(
            "INSERT INTO extracted_entities (id, document_id, name, type, role, description, metadata, created_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?)",
            rows
        )
        conn.commit()
        conn.close()

    async def insert_extracted_relationships(self, document_id: str, relationships: List[Dict[str, Any]]):
        if not relationships:
            return
        now = datetime.utcnow().isoformat()

        if self.use_supabase and self._supabase_client:
            try:
                rows = [
                    {
                        "id": str(uuid.uuid4()),
                        "document_id": document_id,
                        "source_entity": r["source"],
                        "target_entity": r["target"],
                        "relation_type": r["relation"],
                        "context": r.get("context"),
                        "created_at": now
                    }
                    for r in relationships
                ]
                self._supabase_client.table("extracted_relationships").insert(rows).execute()
                return
            except Exception as e:
                logger.error(f"Supabase relationships insert failed: {e}")

        conn = self._get_sqlite_conn()
        rows = [
            (
                str(uuid.uuid4()),
                document_id,
                r["source"],
                r["target"],
                r["relation"],
                r.get("context"),
                now
            )
            for r in relationships
        ]
        conn.executemany(
            "INSERT INTO extracted_relationships (id, document_id, source_entity, target_entity, relation_type, context, created_at) VALUES (?, ?, ?, ?, ?, ?, ?)",
            rows
        )
        conn.commit()
        conn.close()

    async def insert_extracted_events(self, document_id: str, events: List[Dict[str, Any]]):
        if not events:
            return
        now = datetime.utcnow().isoformat()

        if self.use_supabase and self._supabase_client:
            try:
                rows = [
                    {
                        "id": str(uuid.uuid4()),
                        "document_id": document_id,
                        "date_str": ev["date"],
                        "title": ev["title"],
                        "description": ev["description"],
                        "decision": ev.get("decision"),
                        "actors": ev.get("actors", []),
                        "evidence_quote": ev.get("evidence_quote"),
                        "created_at": now
                    }
                    for ev in events
                ]
                self._supabase_client.table("extracted_events").insert(rows).execute()
                return
            except Exception as e:
                logger.error(f"Supabase events insert failed: {e}")

        conn = self._get_sqlite_conn()
        rows = [
            (
                str(uuid.uuid4()),
                document_id,
                ev["date"],
                ev["title"],
                ev["description"],
                ev.get("decision"),
                json.dumps(ev.get("actors", [])),
                ev.get("evidence_quote"),
                now
            )
            for ev in events
        ]
        conn.executemany(
            "INSERT INTO extracted_events (id, document_id, date_str, title, description, decision, actors, evidence_quote, created_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)",
            rows
        )
        conn.commit()
        conn.close()

    # --- Retrieval Operations ---

    async def search_chunks_by_vector(self, query_embedding: List[float], match_count: int = 6,
                                       project: str = None, source_type: str = None) -> List[Dict[str, Any]]:
        """Find most similar chunks via vector cosine distance with optional metadata filtering."""
        if self.use_supabase and self._supabase_client:
            try:
                response = self._supabase_client.rpc(
                    "match_chunks",
                    {
                        "query_embedding": query_embedding,
                        "match_threshold": 0.2,
                        "match_count": match_count
                    }
                ).execute()
                if response.data:
                    return response.data
            except Exception as e:
                logger.error(f"Supabase match_chunks rpc failed: {e}. Falling back to SQLite.")

        # Local NumPy Cosine Similarity over SQLite chunks
        conn = self._get_sqlite_conn()
        cursor = conn.cursor()
        
        # Build query with optional metadata filters
        where_clauses = []
        params = []
        if project:
            where_clauses.append("d.project = ?")
            params.append(project)
        if source_type:
            where_clauses.append("d.source_type = ?")
            params.append(source_type)
        
        where_sql = (" AND " + " AND ".join(where_clauses)) if where_clauses else ""
        
        cursor.execute(f"""
            SELECT c.id, c.document_id, c.chunk_index, c.chunk_text, c.embedding, c.metadata, 
                   d.title as doc_title, d.source_type, d.path, d.url, d.content_hash, d.project
            FROM document_chunks c
            JOIN documents d ON c.document_id = d.id
            {where_sql}
        """, params)
        rows = cursor.fetchall()
        conn.close()

        if not rows:
            return []

        q_vec = np.array(query_embedding, dtype=np.float32)
        q_norm = np.linalg.norm(q_vec)
        if q_norm == 0:
            q_norm = 1e-8

        results = []
        for r in rows:
            emb_raw = r["embedding"]
            if not emb_raw:
                continue
            emb = np.array(json.loads(emb_raw), dtype=np.float32)
            c_norm = np.linalg.norm(emb)
            if c_norm == 0:
                continue
            similarity = float(np.dot(q_vec, emb) / (q_norm * c_norm))
            results.append({
                "id": r["id"],
                "document_id": r["document_id"],
                "chunk_index": r["chunk_index"],
                "chunk_text": r["chunk_text"],
                "similarity": similarity,
                "document_title": r["doc_title"],
                "source_type": r["source_type"],
                "metadata": json.loads(r["metadata"] or "{}"),
                "path": r["path"],
                "url": r["url"],
                "content_hash": r["content_hash"],
                "project": r["project"]
            })

        results.sort(key=lambda x: x["similarity"], reverse=True)
        return results[:match_count]

    async def search_chunks_by_keywords(self, query_text: str, match_count: int = 6,
                                         project: str = None, source_type: str = None) -> List[Dict[str, Any]]:
        """Keyword matching across document chunks with optional metadata filtering."""
        keywords = [k.lower() for k in query_text.split() if len(k) > 2]
        if not keywords:
            return []

        conn = self._get_sqlite_conn()
        cursor = conn.cursor()
        
        # Build flexible LIKE conditions
        conditions = " OR ".join(["LOWER(c.chunk_text) LIKE ?" for _ in keywords])
        params = [f"%{k}%" for k in keywords]
        
        # Add metadata filters
        where_clauses = [f"({conditions})"]
        if project:
            where_clauses.append("d.project = ?")
            params.append(project)
        if source_type:
            where_clauses.append("d.source_type = ?")
            params.append(source_type)
        
        where_sql = " AND ".join(where_clauses)
        
        query_sql = f"""
            SELECT c.id, c.document_id, c.chunk_index, c.chunk_text, c.metadata, 
                   d.title as doc_title, d.source_type, d.path, d.url, d.content_hash, d.project
            FROM document_chunks c
            JOIN documents d ON c.document_id = d.id
            WHERE {where_sql}
            LIMIT 20
        """
        cursor.execute(query_sql, params)
        rows = cursor.fetchall()
        conn.close()

        results = []
        for r in rows:
            text_lower = r["chunk_text"].lower()
            match_score = sum(1 for k in keywords if k in text_lower) / len(keywords)
            results.append({
                "id": r["id"],
                "document_id": r["document_id"],
                "chunk_index": r["chunk_index"],
                "chunk_text": r["chunk_text"],
                "keyword_score": match_score,
                "document_title": r["doc_title"],
                "source_type": r["source_type"],
                "metadata": json.loads(r["metadata"] or "{}"),
                "path": r["path"],
                "url": r["url"],
                "content_hash": r["content_hash"],
                "project": r["project"]
            })

        results.sort(key=lambda x: x["keyword_score"], reverse=True)
        return results[:match_count]

    async def get_all_documents(self) -> List[Dict[str, Any]]:
        conn = self._get_sqlite_conn()
        cursor = conn.cursor()
        cursor.execute("""
            SELECT d.id, d.title, d.source_type, d.raw_content, d.metadata, d.created_at,
                   d.path, d.url, d.content_hash, d.project, d.indexed_at, d.index_status,
                   (SELECT COUNT(*) FROM extracted_entities WHERE document_id = d.id) as entity_count,
                   (SELECT COUNT(*) FROM extracted_events WHERE document_id = d.id) as event_count
            FROM documents d
            ORDER BY d.created_at DESC
        """)
        rows = cursor.fetchall()
        conn.close()

        return [
            {
                "id": r["id"],
                "title": r["title"],
                "source_type": r["source_type"],
                "content_preview": r["raw_content"][:200] + "...",
                "metadata": json.loads(r["metadata"] or "{}"),
                "created_at": r["created_at"],
                "path": r["path"],
                "url": r["url"],
                "content_hash": r["content_hash"],
                "project": r["project"],
                "indexed_at": r["indexed_at"],
                "index_status": r["index_status"],
                "entity_count": r["entity_count"],
                "event_count": r["event_count"]
            }
            for r in rows
        ]

    async def get_document_by_id(self, doc_id: str) -> Optional[Dict[str, Any]]:
        conn = self._get_sqlite_conn()
        cursor = conn.cursor()
        cursor.execute("""
            SELECT d.id, d.title, d.source_type, d.raw_content, d.metadata, d.created_at,
                   d.path, d.url, d.content_hash, d.project, d.indexed_at, d.index_status
            FROM documents d
            WHERE d.id = ?
        """, (doc_id,))
        r = cursor.fetchone()
        conn.close()
        if not r:
            return None
        return {
            "id": r["id"],
            "title": r["title"],
            "source_type": r["source_type"],
            "raw_content": r["raw_content"],
            "metadata": json.loads(r["metadata"] or "{}"),
            "created_at": r["created_at"],
            "path": r["path"],
            "url": r["url"],
            "content_hash": r["content_hash"],
            "project": r["project"],
            "indexed_at": r["indexed_at"],
            "index_status": r["index_status"]
        }

    async def check_content_hash(self, content_hash: str) -> Optional[str]:
        """Check if content with this hash already exists. Returns doc_id if found."""
        conn = self._get_sqlite_conn()
        cursor = conn.cursor()
        cursor.execute("SELECT id FROM documents WHERE content_hash = ?", (content_hash,))
        r = cursor.fetchone()
        conn.close()
        return r["id"] if r else None

    async def get_cache(self, query_hash: str) -> Optional[Dict[str, Any]]:
        """Get cached query result."""
        conn = self._get_sqlite_conn()
        cursor = conn.cursor()
        cursor.execute("SELECT result, created_at, hit_count FROM query_cache WHERE query_hash = ?", (query_hash,))
        r = cursor.fetchone()
        conn.close()
        if not r:
            return None
        # Update hit count
        conn = self._get_sqlite_conn()
        conn.execute("UPDATE query_cache SET hit_count = hit_count + 1 WHERE query_hash = ?", (query_hash,))
        conn.commit()
        conn.close()
        return {"result": json.loads(r["result"]), "created_at": r["created_at"], "hit_count": r["hit_count"] + 1}

    async def set_cache(self, query_hash: str, result: Dict[str, Any]):
        """Store query result in cache."""
        now = datetime.utcnow().isoformat()
        conn = self._get_sqlite_conn()
        conn.execute(
            "INSERT OR REPLACE INTO query_cache (query_hash, result, created_at, hit_count) VALUES (?, ?, ?, 0)",
            (query_hash, json.dumps(result), now)
        )
        conn.commit()
        conn.close()

    async def get_all_entities_and_relationships(self, document_ids: Optional[List[str]] = None) -> Tuple[List[Dict[str, Any]], List[Dict[str, Any]]]:
        conn = self._get_sqlite_conn()
        cursor = conn.cursor()
        
        if document_ids:
            placeholders = ",".join(["?" for _ in document_ids])
            cursor.execute(f"SELECT * FROM extracted_entities WHERE document_id IN ({placeholders})", document_ids)
            entity_rows = cursor.fetchall()
            cursor.execute(f"SELECT * FROM extracted_relationships WHERE document_id IN ({placeholders})", document_ids)
            rel_rows = cursor.fetchall()
        else:
            cursor.execute("SELECT * FROM extracted_entities")
            entity_rows = cursor.fetchall()
            cursor.execute("SELECT * FROM extracted_relationships")
            rel_rows = cursor.fetchall()

        conn.close()

        entities = [
            {
                "id": r["name"],
                "name": r["name"],
                "type": r["type"],
                "role": r["role"],
                "description": r["description"],
            }
            for r in entity_rows
        ]

        relationships = [
            {
                "source": r["source_entity"],
                "target": r["target_entity"],
                "relation": r["relation_type"],
                "context": r["context"],
            }
            for r in rel_rows
        ]

        # Deduplicate entities by name
        unique_entities = {}
        for e in entities:
            if e["name"] not in unique_entities:
                unique_entities[e["name"]] = e

        return list(unique_entities.values()), relationships

    async def get_events(self, document_ids: Optional[List[str]] = None) -> List[Dict[str, Any]]:
        conn = self._get_sqlite_conn()
        cursor = conn.cursor()
        
        if document_ids:
            placeholders = ",".join(["?" for _ in document_ids])
            cursor.execute(
                f"SELECT e.*, d.title as doc_title FROM extracted_events e JOIN documents d ON e.document_id = d.id WHERE e.document_id IN ({placeholders})",
                document_ids
            )
        else:
            cursor.execute("SELECT e.*, d.title as doc_title FROM extracted_events e JOIN documents d ON e.document_id = d.id")
            
        rows = cursor.fetchall()
        conn.close()

        return [
            {
                "date": r["date_str"],
                "title": r["title"],
                "description": r["description"],
                "decision": r["decision"],
                "actors": json.loads(r["actors"] or "[]"),
                "evidence_quote": r["evidence_quote"],
                "document_title": r["doc_title"]
            }
            for r in rows
        ]

# Global database client singleton
db = DatabaseClient()
