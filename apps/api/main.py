"""
Constitutional AI Playground API

A FastAPI backend for experimenting with Constitutional AI principles.
"""

import sys
import os
from pathlib import Path
from datetime import datetime

# Set up Python path for both local dev and Vercel serverless
_current_dir = Path(__file__).parent
sys.path.insert(0, str(_current_dir))
sys.path.insert(0, str(_current_dir / "routers"))
sys.path.insert(0, str(_current_dir / "services"))
sys.path.insert(0, str(_current_dir / "models"))

# Add cai_core to path (local copy for Vercel)
if (_current_dir / "cai_core").exists():
    sys.path.insert(0, str(_current_dir))
# Also try packages directory for local dev
_packages_dir = _current_dir.parent.parent / "packages"
if _packages_dir.exists():
    sys.path.insert(0, str(_packages_dir))

# Load environment variables from .env file (for local development)
# In production (Vercel), env vars are already set
from dotenv import load_dotenv
env_path = _current_dir.parent.parent / ".env"
if env_path.exists():
    load_dotenv(env_path)

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

# Handle imports that work both as module and standalone
try:
    from .routers import critique_router, compare_router, constitutions_router
    from .models.schemas import HealthResponse
except ImportError:
    from routers import critique_router, compare_router, constitutions_router
    from models.schemas import HealthResponse

# API version
VERSION = "0.1.0"

# Create FastAPI app
app = FastAPI(
    title="Constitutional AI Playground API",
    description="""
    An interactive platform for experimenting with Constitutional AI principles.

    ## Features

    - **Critique Engine**: Run Constitutional AI critique loops on AI responses
    - **Constitution Management**: Create, edit, and manage AI constitutions
    - **A/B Testing**: Compare multiple constitutions on the same prompt
    - **Pre-built Templates**: Access Anthropic-style and specialized constitutions

    ## About Constitutional AI

    Constitutional AI is an approach developed by Anthropic for training AI systems
    to be helpful, harmless, and honest. It works by:

    1. Generating an initial response
    2. Having the AI critique its own response against a set of principles
    3. Revising based on the critique
    4. Repeating until the response aligns with the "constitution"

    This playground makes that process visible, interactive, and customizable.
    """,
    version=VERSION,
    docs_url="/docs",
    redoc_url="/redoc",
)

# Configure CORS for frontend - allow all origins for API access
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=False,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routers
app.include_router(critique_router, prefix="/api")
app.include_router(compare_router, prefix="/api")
app.include_router(constitutions_router, prefix="/api")


@app.get("/", tags=["root"])
async def root():
    """Root endpoint with API information."""
    return {
        "name": "Constitutional AI Playground API",
        "version": VERSION,
        "docs": "/docs",
        "description": "An interactive platform for experimenting with Constitutional AI",
    }


@app.get("/health", response_model=HealthResponse, tags=["health"])
async def health_check() -> HealthResponse:
    """Health check endpoint."""
    return HealthResponse(
        status="healthy",
        version=VERSION,
        timestamp=datetime.utcnow().isoformat(),
    )


@app.get("/api/models", tags=["config"])
async def available_models():
    """List available Claude models for critique."""
    return {
        "models": [
            {
                "id": "claude-sonnet-4-20250514",
                "name": "Claude Sonnet 4",
                "description": "Fast and capable, good balance of speed and quality",
                "recommended": True,
            },
            {
                "id": "claude-3-5-haiku-20241022",
                "name": "Claude 3.5 Haiku",
                "description": "Fastest model, good for quick iterations",
                "recommended": False,
            },
            {
                "id": "claude-opus-4-20250514",
                "name": "Claude Opus 4",
                "description": "Most capable model, best for complex analysis",
                "recommended": False,
            },
        ],
        "default": "claude-sonnet-4-20250514",
    }


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
