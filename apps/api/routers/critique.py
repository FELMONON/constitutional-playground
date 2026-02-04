"""
API routes for Constitutional AI critique operations.
"""

import sys
import json
from pathlib import Path
from typing import AsyncGenerator

# Ensure parent directory is in path
_parent = Path(__file__).parent.parent
sys.path.insert(0, str(_parent))

from fastapi import APIRouter, HTTPException
from fastapi.responses import StreamingResponse

from models.schemas import (
    CritiqueRequest,
    FullPipelineRequest,
    CritiqueResultSchema,
)
from services.cai_engine import get_engine, get_streaming_engine
from services.metrics import calculate_all_scores

router = APIRouter(prefix="/critique", tags=["critique"])


@router.post("/", response_model=CritiqueResultSchema)
async def run_critique(request: CritiqueRequest) -> CritiqueResultSchema:
    """
    Run Constitutional AI critique on an existing response.

    This endpoint takes a prompt, response, and constitution, then:
    1. Critiques the response against each principle
    2. Revises based on critiques
    3. Repeats until convergence or max rounds

    Returns the full trace of the critique process.
    """
    try:
        engine = get_engine()
        result = await engine.run_critique(
            prompt=request.prompt,
            response=request.response,
            constitution=request.constitution,
            max_rounds=request.max_rounds,
            model=request.model,
        )
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Critique failed: {str(e)}")


@router.post("/full-pipeline", response_model=CritiqueResultSchema)
async def run_full_pipeline(request: FullPipelineRequest) -> CritiqueResultSchema:
    """
    Run the full Constitutional AI pipeline.

    This endpoint:
    1. Generates an initial response to the prompt
    2. Critiques and revises according to the constitution
    3. Returns the complete trace

    Use this when you want to see how a constitution affects a fresh response.
    """
    try:
        engine = get_engine()
        result = await engine.run_full_pipeline(
            prompt=request.prompt,
            constitution=request.constitution,
            max_rounds=request.max_rounds,
            model=request.model,
        )
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Pipeline failed: {str(e)}")


@router.post("/with-scores")
async def run_critique_with_scores(request: CritiqueRequest):
    """
    Run critique and return results with calculated scores.

    Returns the critique result plus safety, helpfulness, and honesty scores.
    """
    try:
        engine = get_engine()
        result = await engine.run_critique(
            prompt=request.prompt,
            response=request.response,
            constitution=request.constitution,
            max_rounds=request.max_rounds,
            model=request.model,
        )

        scores = calculate_all_scores(result)

        return {
            "result": result,
            "scores": scores,
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Critique failed: {str(e)}")


@router.post("/full-pipeline/stream")
async def run_full_pipeline_stream(request: FullPipelineRequest):
    """
    Run the full Constitutional AI pipeline with streaming updates.

    Streams Server-Sent Events (SSE) for each stage:
    - generating: Initial response generation started
    - generated: Initial response complete
    - critiquing: Starting critique round N
    - critiqued: Critique round N complete with results
    - revising: Starting revision for round N
    - revised: Revision complete for round N
    - complete: Full pipeline complete with final result

    Use this for real-time UI updates during the critique loop.
    """
    async def event_stream() -> AsyncGenerator[str, None]:
        try:
            engine = get_streaming_engine()
            async for event in engine.run_full_pipeline_streaming(
                prompt=request.prompt,
                constitution=request.constitution,
                max_rounds=request.max_rounds,
                model=request.model,
            ):
                yield f"data: {json.dumps(event)}\n\n"
        except Exception as e:
            yield f"data: {json.dumps({'type': 'error', 'error': str(e)})}\n\n"

    return StreamingResponse(
        event_stream(),
        media_type="text/event-stream",
        headers={
            "Cache-Control": "no-cache",
            "Connection": "keep-alive",
            "X-Accel-Buffering": "no",
        },
    )
