"""
Core Constitutional AI critique engine.

Implements the self-critique and revision loop that is central to Constitutional AI.
"""

import asyncio
from dataclasses import dataclass, field
from typing import List, Optional
import anthropic
from difflib import SequenceMatcher

from .constitution import Constitution, Principle


@dataclass
class PrincipleCritique:
    """Result of critiquing a response against a single principle."""

    principle_id: str
    principle_name: str
    triggered: bool
    critique_text: str
    severity: float  # 0.0 to 1.0
    suggestions: List[str] = field(default_factory=list)


@dataclass
class Revision:
    """A revised response with metadata."""

    text: str
    confidence: float
    changes_made: List[str] = field(default_factory=list)


@dataclass
class CritiqueRound:
    """One complete round of critique and revision."""

    round_number: int
    input_response: str
    critiques: List[PrincipleCritique]
    revised_response: str
    principles_triggered: List[str]
    confidence: float
    diff_summary: str = ""


@dataclass
class CritiqueResult:
    """Complete result of the constitutional critique process."""

    original: str
    final: str
    prompt: str
    rounds: List[CritiqueRound]
    total_rounds: int
    constitution_id: str
    constitution_name: str
    converged: bool
    total_principles_triggered: List[str] = field(default_factory=list)
    improvement_score: float = 0.0


def calculate_text_similarity(text1: str, text2: str) -> float:
    """Calculate similarity between two texts (0.0 to 1.0)."""
    return SequenceMatcher(None, text1, text2).ratio()


def generate_diff_summary(original: str, revised: str) -> str:
    """Generate a human-readable summary of changes."""
    if original == revised:
        return "No changes made."

    original_words = set(original.lower().split())
    revised_words = set(revised.lower().split())

    added = revised_words - original_words
    removed = original_words - revised_words

    summary_parts = []
    if removed:
        summary_parts.append(f"Removed concepts: {', '.join(list(removed)[:5])}")
    if added:
        summary_parts.append(f"Added concepts: {', '.join(list(added)[:5])}")

    len_diff = len(revised) - len(original)
    if abs(len_diff) > 50:
        if len_diff > 0:
            summary_parts.append(f"Response expanded by ~{len_diff} characters")
        else:
            summary_parts.append(f"Response shortened by ~{abs(len_diff)} characters")

    return " | ".join(summary_parts) if summary_parts else "Minor phrasing changes."


async def generate_critique(
    response: str,
    principle: Principle,
    prompt: str,
    client: anthropic.AsyncAnthropic,
    model: str = "claude-sonnet-4-20250514",
) -> PrincipleCritique:
    """
    Generate a critique of a response against a single principle.

    Returns a PrincipleCritique with analysis of whether the principle was violated.
    """
    critique_system = """You are a Constitutional AI critic. Your job is to analyze an AI response
and determine if it violates a specific principle. Be thorough but fair in your assessment.

Respond in this exact JSON format:
{
    "triggered": true/false,
    "severity": 0.0-1.0,
    "critique": "Your detailed critique",
    "suggestions": ["suggestion1", "suggestion2"]
}

Only set triggered=true if there is a clear violation. Minor issues should have low severity."""

    critique_prompt = f"""Original user prompt: {prompt}

AI Response to evaluate:
\"\"\"
{response}
\"\"\"

Principle to check: {principle.name}
Description: {principle.description}
Critique question: {principle.critique_prompt}

Analyze whether this response violates this principle. Provide your assessment in the specified JSON format."""

    try:
        message = await client.messages.create(
            model=model,
            max_tokens=1024,
            system=critique_system,
            messages=[{"role": "user", "content": critique_prompt}],
        )

        response_text = message.content[0].text

        # Parse JSON response
        import json
        import re

        # Extract JSON from response (handle markdown code blocks)
        json_match = re.search(r'\{[\s\S]*\}', response_text)
        if json_match:
            result = json.loads(json_match.group())
        else:
            # Fallback if no JSON found
            result = {
                "triggered": False,
                "severity": 0.0,
                "critique": response_text,
                "suggestions": []
            }

        return PrincipleCritique(
            principle_id=principle.id,
            principle_name=principle.name,
            triggered=result.get("triggered", False),
            critique_text=result.get("critique", ""),
            severity=result.get("severity", 0.0),
            suggestions=result.get("suggestions", []),
        )

    except Exception as e:
        # Return non-triggered critique on error
        return PrincipleCritique(
            principle_id=principle.id,
            principle_name=principle.name,
            triggered=False,
            critique_text=f"Error during critique: {str(e)}",
            severity=0.0,
            suggestions=[],
        )


async def generate_revision(
    original_response: str,
    critiques: List[PrincipleCritique],
    prompt: str,
    client: anthropic.AsyncAnthropic,
    model: str = "claude-sonnet-4-20250514",
) -> Revision:
    """
    Generate a revised response based on critiques.

    Takes the original response and all critiques, produces an improved version.
    """
    triggered_critiques = [c for c in critiques if c.triggered]

    if not triggered_critiques:
        # No violations found, return original
        return Revision(
            text=original_response,
            confidence=1.0,
            changes_made=["No changes needed - response already aligns with principles"],
        )

    revision_system = """You are a Constitutional AI reviser. Your job is to revise an AI response
to better align with the given principles while maintaining helpfulness.

Important guidelines:
1. Make the minimum changes necessary to address the critiques
2. Preserve the helpful and accurate parts of the original
3. Don't over-correct or become unhelpfully restrictive
4. Maintain the same general tone and style

Respond with ONLY the revised response text, no explanations or metadata."""

    critiques_text = "\n\n".join([
        f"Principle: {c.principle_name}\nCritique: {c.critique_text}\nSuggestions: {', '.join(c.suggestions)}"
        for c in triggered_critiques
    ])

    revision_prompt = f"""Original user prompt: {prompt}

Original AI response:
\"\"\"
{original_response}
\"\"\"

Critiques to address:
{critiques_text}

Please provide a revised response that addresses these critiques while remaining helpful."""

    try:
        message = await client.messages.create(
            model=model,
            max_tokens=2048,
            system=revision_system,
            messages=[{"role": "user", "content": revision_prompt}],
        )

        revised_text = message.content[0].text.strip()

        # Calculate confidence based on how much changed
        similarity = calculate_text_similarity(original_response, revised_text)
        confidence = 0.5 + (similarity * 0.5)  # Higher similarity = higher confidence

        changes_made = [
            f"Addressed {c.principle_name} violation" for c in triggered_critiques
        ]

        return Revision(
            text=revised_text,
            confidence=confidence,
            changes_made=changes_made,
        )

    except Exception as e:
        return Revision(
            text=original_response,
            confidence=0.0,
            changes_made=[f"Revision failed: {str(e)}"],
        )


async def generate_initial_response(
    prompt: str,
    client: anthropic.AsyncAnthropic,
    model: str = "claude-sonnet-4-20250514",
) -> str:
    """Generate an initial response to a prompt (before constitutional critique)."""
    try:
        message = await client.messages.create(
            model=model,
            max_tokens=2048,
            messages=[{"role": "user", "content": prompt}],
        )
        return message.content[0].text
    except Exception as e:
        raise RuntimeError(f"Failed to generate initial response: {str(e)}")


async def constitutional_critique(
    prompt: str,
    initial_response: str,
    constitution: Constitution,
    client: Optional[anthropic.AsyncAnthropic] = None,
    model: str = "claude-sonnet-4-20250514",
    max_rounds: int = 3,
    convergence_threshold: float = 0.98,
) -> CritiqueResult:
    """
    Implements Constitutional AI self-critique loop.

    This is the core algorithm that:
    1. Takes an initial response
    2. Critiques it against each principle in the constitution
    3. Revises based on critiques
    4. Repeats until convergence or max rounds

    Returns detailed trace of each critique round for visualization.
    """
    if client is None:
        client = anthropic.AsyncAnthropic()

    rounds: List[CritiqueRound] = []
    current_response = initial_response
    all_triggered_principles: set = set()

    enabled_principles = constitution.get_enabled_principles()

    for round_num in range(max_rounds):
        # Step 1: Generate critique against each principle (in parallel)
        critique_tasks = [
            generate_critique(current_response, principle, prompt, client, model)
            for principle in enabled_principles
        ]
        critiques = await asyncio.gather(*critique_tasks)

        # Track triggered principles
        round_triggered = [c.principle_name for c in critiques if c.triggered]
        all_triggered_principles.update(round_triggered)

        # Step 2: Generate revision based on critiques
        revision = await generate_revision(
            current_response, critiques, prompt, client, model
        )

        # Step 3: Generate diff summary
        diff_summary = generate_diff_summary(current_response, revision.text)

        # Step 4: Record round details
        rounds.append(CritiqueRound(
            round_number=round_num,
            input_response=current_response,
            critiques=critiques,
            revised_response=revision.text,
            principles_triggered=round_triggered,
            confidence=revision.confidence,
            diff_summary=diff_summary,
        ))

        # Step 5: Check for convergence
        similarity = calculate_text_similarity(current_response, revision.text)
        if similarity >= convergence_threshold:
            break

        current_response = revision.text

    # Calculate improvement score
    initial_similarity = calculate_text_similarity(initial_response, current_response)
    improvement_score = 1.0 - initial_similarity  # Higher = more changes made

    return CritiqueResult(
        original=initial_response,
        final=current_response,
        prompt=prompt,
        rounds=rounds,
        total_rounds=len(rounds),
        constitution_id=constitution.id,
        constitution_name=constitution.name,
        converged=len(rounds) < max_rounds,
        total_principles_triggered=list(all_triggered_principles),
        improvement_score=improvement_score,
    )


async def full_cai_pipeline(
    prompt: str,
    constitution: Constitution,
    client: Optional[anthropic.AsyncAnthropic] = None,
    model: str = "claude-sonnet-4-20250514",
    max_rounds: int = 3,
) -> CritiqueResult:
    """
    Run the full CAI pipeline: generate initial response, then critique and revise.
    """
    if client is None:
        client = anthropic.AsyncAnthropic()

    # Generate initial response
    initial_response = await generate_initial_response(prompt, client, model)

    # Run constitutional critique
    return await constitutional_critique(
        prompt=prompt,
        initial_response=initial_response,
        constitution=constitution,
        client=client,
        model=model,
        max_rounds=max_rounds,
    )


async def compare_constitutions(
    prompt: str,
    constitutions: List[Constitution],
    client: Optional[anthropic.AsyncAnthropic] = None,
    model: str = "claude-sonnet-4-20250514",
    max_rounds: int = 3,
) -> List[CritiqueResult]:
    """
    Compare multiple constitutions on the same prompt.

    Returns a list of CritiqueResults, one for each constitution.
    """
    if client is None:
        client = anthropic.AsyncAnthropic()

    # Generate one initial response
    initial_response = await generate_initial_response(prompt, client, model)

    # Run critique with each constitution (in parallel)
    tasks = [
        constitutional_critique(
            prompt=prompt,
            initial_response=initial_response,
            constitution=const,
            client=client,
            model=model,
            max_rounds=max_rounds,
        )
        for const in constitutions
    ]

    return await asyncio.gather(*tasks)
