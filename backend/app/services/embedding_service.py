import hashlib
import logging
from typing import List
import numpy as np
from app.config import settings

logger = logging.getLogger(__name__)

EMBEDDING_DIM = 768

def _deterministic_mock_embedding(text: str, dim: int = EMBEDDING_DIM) -> List[float]:
    """
    Generate a deterministic unit-normalized 768-dimensional float embedding
    based on character trigrams and token hashing. Used for offline testing / fallback.
    """
    tokens = text.lower().split()
    vec = np.zeros(dim, dtype=np.float32)
    
    for token in tokens:
        h = int(hashlib.sha256(token.encode("utf-8")).hexdigest(), 16)
        idx = h % dim
        sign = 1.0 if (h >> 8) % 2 == 0 else -1.0
        vec[idx] += sign * (1.0 + (h % 5) * 0.1)

    # Character n-grams for subword similarity
    for i in range(len(text) - 2):
        trigram = text[i:i+3].lower()
        h = int(hashlib.md5(trigram.encode("utf-8")).hexdigest(), 16)
        vec[h % dim] += 0.3

    norm = np.linalg.norm(vec)
    if norm > 0:
        vec = vec / norm
    else:
        vec[0] = 1.0

    return vec.tolist()

async def generate_embedding(text: str) -> List[float]:
    """Generate a 768-dimensional embedding for a single text chunk."""
    embeddings = await generate_embeddings_batch([text])
    return embeddings[0]

async def generate_embeddings_batch(texts: List[str]) -> List[List[float]]:
    """
    Generate 768-dim embeddings for a batch of texts using Gemini text-embedding-004.
    Falls back to deterministic mock embedding if no key is configured or API fails.
    """
    api_key = settings.GEMINI_API_KEY.strip() if settings.GEMINI_API_KEY else ""
    is_real_key = bool(api_key and not api_key.startswith("your_"))

    if not is_real_key:
        return [_deterministic_mock_embedding(t) for t in texts]

    # Try modern google.genai
    try:
        from google import genai
        from google.genai import types
        client = genai.Client(api_key=api_key)
        results = []
        for text in texts:
            response = client.models.embed_content(
                model="gemini-embedding-001",
                contents=text[:8000],
                config=types.EmbedContentConfig(output_dimensionality=768)
            )
            # Response may contain embedding.values or embeddings[0].values
            if hasattr(response, 'embeddings') and response.embeddings:
                results.append(list(response.embeddings[0].values))
            elif hasattr(response, 'embedding') and hasattr(response.embedding, 'values'):
                results.append(list(response.embedding.values))
            else:
                results.append(_deterministic_mock_embedding(text))
        return results

    except Exception as e:
        logger.warning(f"Gemini embedding API encountered: {e}. Using deterministic fallback.")
        return [_deterministic_mock_embedding(t) for t in texts]

