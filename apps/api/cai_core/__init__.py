"""
Constitutional AI Core Package

Implements the core Constitutional AI critique algorithm for the playground.
"""

from .constitution import Constitution, Principle, PrincipleCategory
from .critique import (
    constitutional_critique,
    generate_critique,
    generate_revision,
    generate_initial_response,
    full_cai_pipeline,
    compare_constitutions,
    CritiqueResult,
    CritiqueRound,
    PrincipleCritique,
)

__all__ = [
    "Constitution",
    "Principle",
    "PrincipleCategory",
    "constitutional_critique",
    "generate_critique",
    "generate_revision",
    "generate_initial_response",
    "full_cai_pipeline",
    "compare_constitutions",
    "CritiqueResult",
    "CritiqueRound",
    "PrincipleCritique",
]
