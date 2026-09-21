import os
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.config import settings

app = FastAPI(
    title=settings.PROJECT_NAME,
    version=settings.VERSION,
    description="AI-Powered Lost Context Recovery Tool API"
)

# CORS Middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.CORS_ORIGINS if settings.CORS_ORIGINS else ["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

from app.api.ingest import router as ingest_router
from app.api.query import router as query_router

app.include_router(ingest_router)
app.include_router(query_router)



@app.get("/")
async def root():
    return {
        "name": settings.PROJECT_NAME,
        "version": settings.VERSION,
        "status": "online",
        "blueprint_mode": True,
    }

@app.get("/api/health")
async def health_check():
    gemini_configured = bool(settings.GEMINI_API_KEY and not settings.GEMINI_API_KEY.startswith("your_"))
    supabase_configured = bool(settings.SUPABASE_URL and settings.SUPABASE_KEY and not settings.SUPABASE_URL.startswith("https://your-"))
    
    return {
        "status": "healthy",
        "version": settings.VERSION,
        "services": {
            "gemini": {
                "configured": gemini_configured,
                "model": "gemini-1.5-flash / gemini-2.0-flash",
                "embedding_model": "text-embedding-004",
            },
            "database": {
                "mode": "supabase" if supabase_configured else "local-sqlite-vector",
                "pgvector_ready": supabase_configured,
            }
        }
    }
