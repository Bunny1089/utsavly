import os
import sys
from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

# Ensure repository root is on sys.path for root imports like seed.py
ROOT_DIR = os.path.abspath(os.path.join(os.path.dirname(__file__), ".."))
if ROOT_DIR not in sys.path:
    sys.path.insert(0, ROOT_DIR)

from backend.config import settings, APP_NAME
from backend.database import Base, engine
from backend.routers import events, budget, timeline, vendors, ideas, health, copilot

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Ensure database schema exists
    Base.metadata.create_all(bind=engine)
    # Run seed script on startup if events table is empty
    try:
        import seed
        seed.seed_if_empty()
    except Exception as e:
        print(f"Startup check/seed note: {e}")
    yield

# Initialize SQLite database tables at import time as well
Base.metadata.create_all(bind=engine)

app = FastAPI(
    title=f"{APP_NAME} API",
    description="GenAI-powered Indian Event Planning Assistant Backend",
    version="1.0.0",
    lifespan=lifespan
)

# CORS Middleware with ALLOWED_ORIGINS support
cors_list = settings.cors_origins
allow_all = "*" in cors_list
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"] if allow_all else cors_list,
    allow_credentials=not allow_all,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Register API Routers under /api
app.include_router(events.router, prefix="/api")
app.include_router(budget.router, prefix="/api")
app.include_router(timeline.router, prefix="/api")
app.include_router(vendors.router, prefix="/api")
app.include_router(ideas.router, prefix="/api")
app.include_router(health.router, prefix="/api")
app.include_router(copilot.router, prefix="/api")

@app.get("/")
def root():
    return {
        "app": APP_NAME,
        "status": "online",
        "mock_mode": settings.ai_mock,
        "docs_url": "/docs"
    }

@app.get("/api/health")
def api_health():
    return {"status": "ok"}

