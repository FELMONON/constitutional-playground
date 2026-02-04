"""
API routes for comparing multiple constitutions.
"""

import sys
from pathlib import Path

# Ensure parent directory is in path
_parent = Path(__file__).parent.parent
sys.path.insert(0, str(_parent))

from fastapi import APIRouter, HTTPException

from models.schemas import (
    CompareRequest,
    CompareResult,
)
from services.cai_engine import get_engine
from services.metrics import calculate_comparison_metrics, calculate_all_scores

router = APIRouter(prefix="/compare", tags=["compare"])


@router.post("/", response_model=CompareResult)
async def compare_constitutions(request: CompareRequest) -> CompareResult:
    """
    Compare multiple constitutions on the same prompt.

    This endpoint:
    1. Generates one initial response to the prompt
    2. Applies each constitution's critique process in parallel
    3. Returns all results with comparison metrics

    Great for A/B testing different constitution designs.
    """
    try:
        engine = get_engine()
        results = await engine.compare_constitutions(
            prompt=request.prompt,
            constitutions=request.constitutions,
            max_rounds=request.max_rounds,
            model=request.model,
        )

        # Calculate comparison metrics
        metrics = calculate_comparison_metrics(results)

        # Add individual scores to metrics
        for result in results:
            const_id = result.constitution_id
            if const_id in metrics["constitutions"]:
                metrics["constitutions"][const_id]["scores"] = calculate_all_scores(result)

        return CompareResult(
            prompt=request.prompt,
            results=results,
            comparison_metrics=metrics,
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Comparison failed: {str(e)}")


@router.post("/quick")
async def quick_compare(request: CompareRequest):
    """
    Quick comparison that returns only the final outputs and key metrics.

    Use this for faster comparisons when you don't need the full critique trace.
    """
    try:
        engine = get_engine()
        results = await engine.compare_constitutions(
            prompt=request.prompt,
            constitutions=request.constitutions,
            max_rounds=request.max_rounds,
            model=request.model,
        )

        quick_results = []
        for result in results:
            quick_results.append({
                "constitution_id": result.constitution_id,
                "constitution_name": result.constitution_name,
                "original": result.original,
                "final": result.final,
                "total_rounds": result.total_rounds,
                "converged": result.converged,
                "principles_triggered": result.total_principles_triggered,
                "scores": calculate_all_scores(result),
            })

        return {
            "prompt": request.prompt,
            "results": quick_results,
            "summary": calculate_comparison_metrics(results)["summary"],
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Comparison failed: {str(e)}")
