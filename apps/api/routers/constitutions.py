"""
API routes for constitution management.
"""

import sys
import json
import uuid
from pathlib import Path
from datetime import datetime
from typing import List, Optional
from fastapi import APIRouter, HTTPException, Query

# Ensure parent directory is in path
_parent = Path(__file__).parent.parent
sys.path.insert(0, str(_parent))

from models.schemas import (
    ConstitutionSchema,
    ConstitutionCreateRequest,
    ConstitutionListResponse,
    ConstitutionResponse,
    PrincipleSchema,
    PrincipleCategoryEnum,
)

router = APIRouter(prefix="/constitutions", tags=["constitutions"])

# Path to pre-built constitutions - support both local dev and deployed environments
_local_data_dir = Path(__file__).parent.parent / "data" / "constitutions"
_repo_data_dir = Path(__file__).parent.parent.parent.parent / "data" / "constitutions"
CONSTITUTIONS_DIR = _local_data_dir if _local_data_dir.exists() else _repo_data_dir

# In-memory store for user-created constitutions (would be a database in production)
_user_constitutions: dict[str, ConstitutionSchema] = {}


def load_prebuilt_constitutions() -> List[ConstitutionSchema]:
    """Load all pre-built constitution JSON files."""
    constitutions = []

    if CONSTITUTIONS_DIR.exists():
        for filepath in CONSTITUTIONS_DIR.glob("*.json"):
            try:
                with open(filepath) as f:
                    data = json.load(f)
                    # Convert category strings to enums
                    for p in data.get("principles", []):
                        p["category"] = PrincipleCategoryEnum(p["category"])
                    constitutions.append(ConstitutionSchema(**data))
            except Exception as e:
                print(f"Error loading {filepath}: {e}")

    return constitutions


@router.get("/", response_model=ConstitutionListResponse)
async def list_constitutions(
    category: Optional[str] = Query(None, description="Filter by tag"),
    include_prebuilt: bool = Query(True, description="Include pre-built constitutions"),
) -> ConstitutionListResponse:
    """
    List all available constitutions.

    Returns both pre-built constitutions and user-created ones.
    """
    constitutions = []

    # Add pre-built constitutions
    if include_prebuilt:
        constitutions.extend(load_prebuilt_constitutions())

    # Add user-created constitutions
    constitutions.extend(_user_constitutions.values())

    # Filter by category/tag if specified
    if category:
        constitutions = [c for c in constitutions if category.lower() in [t.lower() for t in c.tags]]

    return ConstitutionListResponse(
        constitutions=constitutions,
        total=len(constitutions),
    )


@router.get("/prebuilt", response_model=ConstitutionListResponse)
async def list_prebuilt_constitutions() -> ConstitutionListResponse:
    """List only pre-built constitutions."""
    constitutions = load_prebuilt_constitutions()
    return ConstitutionListResponse(
        constitutions=constitutions,
        total=len(constitutions),
    )


@router.get("/{constitution_id}", response_model=ConstitutionResponse)
async def get_constitution(constitution_id: str) -> ConstitutionResponse:
    """Get a specific constitution by ID."""
    # Check user constitutions first
    if constitution_id in _user_constitutions:
        return ConstitutionResponse(constitution=_user_constitutions[constitution_id])

    # Check pre-built constitutions
    for const in load_prebuilt_constitutions():
        if const.id == constitution_id:
            return ConstitutionResponse(constitution=const)

    raise HTTPException(status_code=404, detail=f"Constitution '{constitution_id}' not found")


@router.post("/", response_model=ConstitutionResponse)
async def create_constitution(request: ConstitutionCreateRequest) -> ConstitutionResponse:
    """
    Create a new constitution.

    The constitution will be stored in memory (in production, this would persist to a database).
    """
    constitution_id = str(uuid.uuid4())
    now = datetime.utcnow().isoformat()

    constitution = ConstitutionSchema(
        id=constitution_id,
        name=request.name,
        description=request.description,
        principles=request.principles,
        version="1.0.0",
        author=request.author,
        created_at=now,
        updated_at=now,
        tags=request.tags,
        is_public=request.is_public,
        metadata={},
    )

    _user_constitutions[constitution_id] = constitution

    return ConstitutionResponse(constitution=constitution)


@router.put("/{constitution_id}", response_model=ConstitutionResponse)
async def update_constitution(
    constitution_id: str,
    request: ConstitutionCreateRequest,
) -> ConstitutionResponse:
    """Update an existing user-created constitution."""
    if constitution_id not in _user_constitutions:
        raise HTTPException(status_code=404, detail=f"Constitution '{constitution_id}' not found or not editable")

    existing = _user_constitutions[constitution_id]
    now = datetime.utcnow().isoformat()

    updated = ConstitutionSchema(
        id=constitution_id,
        name=request.name,
        description=request.description,
        principles=request.principles,
        version=existing.version,
        author=request.author,
        created_at=existing.created_at,
        updated_at=now,
        tags=request.tags,
        is_public=request.is_public,
        metadata=existing.metadata,
    )

    _user_constitutions[constitution_id] = updated

    return ConstitutionResponse(constitution=updated)


@router.delete("/{constitution_id}")
async def delete_constitution(constitution_id: str):
    """Delete a user-created constitution."""
    if constitution_id not in _user_constitutions:
        raise HTTPException(status_code=404, detail=f"Constitution '{constitution_id}' not found or not deletable")

    del _user_constitutions[constitution_id]

    return {"message": f"Constitution '{constitution_id}' deleted"}


@router.post("/{constitution_id}/fork", response_model=ConstitutionResponse)
async def fork_constitution(constitution_id: str, new_name: str = Query(...)) -> ConstitutionResponse:
    """
    Fork an existing constitution (create a copy that can be modified).

    Works with both pre-built and user-created constitutions.
    """
    # Find the source constitution
    source = None

    if constitution_id in _user_constitutions:
        source = _user_constitutions[constitution_id]
    else:
        for const in load_prebuilt_constitutions():
            if const.id == constitution_id:
                source = const
                break

    if not source:
        raise HTTPException(status_code=404, detail=f"Constitution '{constitution_id}' not found")

    # Create fork
    new_id = str(uuid.uuid4())
    now = datetime.utcnow().isoformat()

    forked = ConstitutionSchema(
        id=new_id,
        name=new_name,
        description=f"Forked from: {source.name}\n\n{source.description}",
        principles=source.principles.copy(),
        version="1.0.0",
        author="user",
        created_at=now,
        updated_at=now,
        tags=source.tags + ["forked"],
        is_public=False,
        metadata={"forked_from": constitution_id},
    )

    _user_constitutions[new_id] = forked

    return ConstitutionResponse(constitution=forked)


# Principle templates endpoint
@router.get("/templates/principles")
async def get_principle_templates():
    """Get available principle templates for building constitutions."""
    return {
        "categories": [
            {
                "id": "safety",
                "name": "Safety",
                "description": "Principles focused on preventing harm",
            },
            {
                "id": "honesty",
                "name": "Honesty",
                "description": "Principles focused on truthfulness and transparency",
            },
            {
                "id": "helpfulness",
                "name": "Helpfulness",
                "description": "Principles focused on being useful and effective",
            },
            {
                "id": "ethics",
                "name": "Ethics",
                "description": "Principles focused on fairness and ethical behavior",
            },
        ],
        "templates": [
            {
                "id": "harm_avoidance",
                "name": "Harm Avoidance",
                "category": "safety",
                "description": "Prevent responses that could cause harm",
            },
            {
                "id": "truthfulness",
                "name": "Truthfulness",
                "category": "honesty",
                "description": "Ensure claims are accurate",
            },
            {
                "id": "task_completion",
                "name": "Task Completion",
                "category": "helpfulness",
                "description": "Actually address user requests",
            },
            {
                "id": "fairness",
                "name": "Fairness",
                "category": "ethics",
                "description": "Avoid bias and stereotypes",
            },
        ],
    }
