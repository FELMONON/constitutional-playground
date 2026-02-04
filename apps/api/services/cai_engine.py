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
from typing import List, Optional, Dict, Any, AsyncGenerator


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

    async def run_full_pipeline_streaming(
        self,
        prompt: str,
        constitution: ConstitutionSchema,
        max_rounds: int = 3,
        model: str = "claude-sonnet-4-20250514",
    ) -> AsyncGenerator[Dict[str, Any], None]:
        """
        Run the full CAI pipeline with streaming updates.

        Yields events for each stage of the process.
        """
        const = schema_to_constitution(constitution)

        # Event: Starting generation
        yield {
            "type": "generating",
            "message": "Generating initial response...",
        }

        # Generate initial response
        initial_response = await self.client.messages.create(
            model=model,
            max_tokens=1024,
            messages=[{"role": "user", "content": prompt}],
        )
        initial_text = initial_response.content[0].text

        # Event: Generation complete
        yield {
            "type": "generated",
            "message": "Initial response generated",
            "response": initial_text,
        }

        # Run critique loop
        current_response = initial_text
        rounds = []
        all_principles_triggered = []

        for round_num in range(max_rounds):
            # Event: Starting critique
            yield {
                "type": "critiquing",
                "round": round_num + 1,
                "message": f"Running critique round {round_num + 1}...",
            }

            # Run critique for this round
            critiques = []
            principles_triggered = []

            for principle in const.principles:
                if not principle.enabled:
                    continue

                critique_prompt = f"""Analyze this AI response for the following principle:

Principle: {principle.name}
Description: {principle.description}
Critique question: {principle.critique_prompt}

User prompt: {prompt}

AI response: {current_response}

Does this response violate or could improve on this principle?
Respond in JSON format:
{{"triggered": true/false, "critique": "your critique", "severity": 0.0-1.0, "suggestions": ["suggestion1", "suggestion2"]}}"""

                critique_response = await self.client.messages.create(
                    model=model,
                    max_tokens=512,
                    messages=[{"role": "user", "content": critique_prompt}],
                )

                try:
                    import json
                    critique_text = critique_response.content[0].text
                    # Extract JSON from response
                    start = critique_text.find("{")
                    end = critique_text.rfind("}") + 1
                    if start >= 0 and end > start:
                        critique_data = json.loads(critique_text[start:end])
                        if critique_data.get("triggered", False):
                            critiques.append({
                                "principle_id": principle.id,
                                "principle_name": principle.name,
                                "triggered": True,
                                "critique_text": critique_data.get("critique", ""),
                                "severity": critique_data.get("severity", 0.5),
                                "suggestions": critique_data.get("suggestions", []),
                            })
                            principles_triggered.append(principle.id)
                except:
                    pass

            # Event: Critique complete
            yield {
                "type": "critiqued",
                "round": round_num + 1,
                "message": f"Critique round {round_num + 1} complete",
                "critiques": critiques,
                "principles_triggered": principles_triggered,
            }

            # Check if we should revise
            if not critiques:
                # No critiques - we've converged
                rounds.append({
                    "round_number": round_num,
                    "input_response": current_response,
                    "critiques": critiques,
                    "revised_response": current_response,
                    "principles_triggered": principles_triggered,
                    "confidence": 1.0,
                    "diff_summary": "No changes needed - response aligns with all principles.",
                })
                break

            # Event: Starting revision
            yield {
                "type": "revising",
                "round": round_num + 1,
                "message": f"Revising response for round {round_num + 1}...",
            }

            # Build revision prompt
            critique_text = "\n".join([
                f"- {c['principle_name']}: {c['critique_text']}"
                for c in critiques
            ])

            revision_prompt = f"""Revise this AI response based on the following critiques:

Original prompt: {prompt}

Current response: {current_response}

Critiques:
{critique_text}

Please provide an improved response that addresses these critiques while remaining helpful and accurate."""

            revision_response = await self.client.messages.create(
                model=model,
                max_tokens=1024,
                messages=[{"role": "user", "content": revision_prompt}],
            )
            revised_text = revision_response.content[0].text

            # Event: Revision complete
            yield {
                "type": "revised",
                "round": round_num + 1,
                "message": f"Revision for round {round_num + 1} complete",
                "revised_response": revised_text,
            }

            rounds.append({
                "round_number": round_num,
                "input_response": current_response,
                "critiques": critiques,
                "revised_response": revised_text,
                "principles_triggered": principles_triggered,
                "confidence": 1.0 - (len(critiques) * 0.1),
                "diff_summary": f"Addressed {len(critiques)} principle(s)",
            })

            all_principles_triggered.extend(principles_triggered)
            current_response = revised_text

        # Event: Complete
        yield {
            "type": "complete",
            "message": "Constitutional AI pipeline complete",
            "result": {
                "original": initial_text,
                "final": current_response,
                "prompt": prompt,
                "rounds": rounds,
                "total_rounds": len(rounds),
                "constitution_id": const.id,
                "constitution_name": const.name,
                "converged": len(rounds) < max_rounds or not rounds[-1]["critiques"],
                "total_principles_triggered": list(set(all_principles_triggered)),
                "improvement_score": 0.0,
            },
        }


# Singleton instance
_engine: Optional[CAIEngineService] = None


def get_engine() -> CAIEngineService:
    """Get or create the CAI engine singleton."""
    global _engine
    if _engine is None:
        _engine = CAIEngineService()
    return _engine


def get_streaming_engine() -> CAIEngineService:
    """Get or create the CAI engine for streaming (same instance)."""
    return get_engine()
