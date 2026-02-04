"""
CAI Engine service - bridges the API with the core CAI implementation.
"""

import sys
from pathlib import Path

# Ensure parent directory is in path
_parent = Path(__file__).parent.parent
sys.path.insert(0, str(_parent))

# Add cai_core to path - support both local and deployed environments
local_cai_path = _parent / "cai_core"
packages_path = _parent.parent.parent / "packages"

if local_cai_path.exists():
    sys.path.insert(0, str(_parent))
elif packages_path.exists():
    sys.path.insert(0, str(packages_path))

from cai_core import (
    Constitution,
    Principle,
    PrincipleCategory,
    constitutional_critique,
    full_cai_pipeline,
    compare_constitutions,
    CritiqueResult,
)

from models.schemas import (
    ConstitutionSchema,
    CritiqueResultSchema,
    CritiqueRoundSchema,
    PrincipleCritiqueSchema,
)

import anthropic
from typing import List, Optional


def schema_to_constitution(schema: ConstitutionSchema) -> Constitution:
    """Convert a Pydantic schema to a Constitution object."""
    principles = [
        Principle(
            id=p.id,
            name=p.name,
            description=p.description,
            category=PrincipleCategory(p.category.value),
            critique_prompt=p.critique_prompt,
            revision_prompt=p.revision_prompt,
            weight=p.weight,
            enabled=p.enabled,
            examples=[dict(e) for e in p.examples],
        )
        for p in schema.principles
    ]

    return Constitution(
        id=schema.id,
        name=schema.name,
        description=schema.description,
        principles=principles,
        version=schema.version,
        author=schema.author,
        created_at=schema.created_at or "",
        updated_at=schema.updated_at or "",
        tags=schema.tags,
        is_public=schema.is_public,
        metadata=schema.metadata,
    )


def result_to_schema(result: CritiqueResult) -> CritiqueResultSchema:
    """Convert a CritiqueResult to a Pydantic schema."""
    rounds = [
        CritiqueRoundSchema(
            round_number=r.round_number,
            input_response=r.input_response,
            critiques=[
                PrincipleCritiqueSchema(
                    principle_id=c.principle_id,
                    principle_name=c.principle_name,
                    triggered=c.triggered,
                    critique_text=c.critique_text,
                    severity=c.severity,
                    suggestions=c.suggestions,
                )
                for c in r.critiques
            ],
            revised_response=r.revised_response,
            principles_triggered=r.principles_triggered,
            confidence=r.confidence,
            diff_summary=r.diff_summary,
        )
        for r in result.rounds
    ]

    return CritiqueResultSchema(
        original=result.original,
        final=result.final,
        prompt=result.prompt,
        rounds=rounds,
        total_rounds=result.total_rounds,
        constitution_id=result.constitution_id,
        constitution_name=result.constitution_name,
        converged=result.converged,
        total_principles_triggered=result.total_principles_triggered,
        improvement_score=result.improvement_score,
    )


class CAIEngineService:
    """Service class for running Constitutional AI operations."""

    def __init__(self, api_key: Optional[str] = None):
        """Initialize with optional API key (uses ANTHROPIC_API_KEY env var if not provided)."""
        self.client = anthropic.AsyncAnthropic(api_key=api_key) if api_key else anthropic.AsyncAnthropic()

    async def run_critique(
        self,
        prompt: str,
        response: str,
        constitution: ConstitutionSchema,
        max_rounds: int = 3,
        model: str = "claude-sonnet-4-20250514",
    ) -> CritiqueResultSchema:
        """Run constitutional critique on an existing response."""
        const = schema_to_constitution(constitution)

        result = await constitutional_critique(
            prompt=prompt,
            initial_response=response,
            constitution=const,
            client=self.client,
            model=model,
            max_rounds=max_rounds,
        )

        return result_to_schema(result)

    async def run_full_pipeline(
        self,
        prompt: str,
        constitution: ConstitutionSchema,
        max_rounds: int = 3,
        model: str = "claude-sonnet-4-20250514",
    ) -> CritiqueResultSchema:
        """Generate a response and run constitutional critique on it."""
        const = schema_to_constitution(constitution)

        result = await full_cai_pipeline(
            prompt=prompt,
            constitution=const,
            client=self.client,
            model=model,
            max_rounds=max_rounds,
        )

        return result_to_schema(result)

    async def compare_constitutions(
        self,
        prompt: str,
        constitutions: List[ConstitutionSchema],
        max_rounds: int = 3,
        model: str = "claude-sonnet-4-20250514",
    ) -> List[CritiqueResultSchema]:
        """Compare multiple constitutions on the same prompt."""
        consts = [schema_to_constitution(c) for c in constitutions]

        results = await compare_constitutions(
            prompt=prompt,
            constitutions=consts,
            client=self.client,
            model=model,
            max_rounds=max_rounds,
        )

        return [result_to_schema(r) for r in results]


# Singleton instance
_engine: Optional[CAIEngineService] = None


def get_engine() -> CAIEngineService:
    """Get or create the CAI engine singleton."""
    global _engine
    if _engine is None:
        _engine = CAIEngineService()
    return _engine
