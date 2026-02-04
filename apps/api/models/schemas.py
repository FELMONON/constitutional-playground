"""
Pydantic schemas for API request/response validation.
"""

from pydantic import BaseModel, Field
from typing import List, Optional, Dict, Any
from enum import Enum


class PrincipleCategoryEnum(str, Enum):
    SAFETY = "safety"
    HONESTY = "honesty"
    HELPFULNESS = "helpfulness"
    ETHICS = "ethics"
    CUSTOM = "custom"


class PrincipleSchema(BaseModel):
    id: str
    name: str
    description: str
    category: PrincipleCategoryEnum
    critique_prompt: str
    revision_prompt: str
    weight: float = 1.0
    enabled: bool = True
    examples: List[Dict[str, str]] = Field(default_factory=list)


class ConstitutionSchema(BaseModel):
    id: str
    name: str
    description: str
    principles: List[PrincipleSchema]
    version: str = "1.0.0"
    author: str = "anonymous"
    created_at: Optional[str] = None
    updated_at: Optional[str] = None
    tags: List[str] = Field(default_factory=list)
    is_public: bool = False
    metadata: Dict[str, Any] = Field(default_factory=dict)


class ConstitutionCreateRequest(BaseModel):
    name: str
    description: str = ""
    principles: List[PrincipleSchema] = Field(default_factory=list)
    author: str = "anonymous"
    tags: List[str] = Field(default_factory=list)
    is_public: bool = False


class PrincipleCritiqueSchema(BaseModel):
    principle_id: str
    principle_name: str
    triggered: bool
    critique_text: str
    severity: float
    suggestions: List[str] = Field(default_factory=list)


class CritiqueRoundSchema(BaseModel):
    round_number: int
    input_response: str
    critiques: List[PrincipleCritiqueSchema]
    revised_response: str
    principles_triggered: List[str]
    confidence: float
    diff_summary: str = ""


class CritiqueResultSchema(BaseModel):
    original: str
    final: str
    prompt: str
    rounds: List[CritiqueRoundSchema]
    total_rounds: int
    constitution_id: str
    constitution_name: str
    converged: bool
    total_principles_triggered: List[str] = Field(default_factory=list)
    improvement_score: float = 0.0


# Request schemas
class CritiqueRequest(BaseModel):
    """Request to run constitutional critique on a response."""
    prompt: str = Field(..., description="The original user prompt")
    response: str = Field(..., description="The AI response to critique")
    constitution: ConstitutionSchema = Field(..., description="The constitution to use")
    max_rounds: int = Field(default=3, ge=1, le=5, description="Maximum critique rounds")
    model: str = Field(default="claude-sonnet-4-20250514", description="Model to use")


class FullPipelineRequest(BaseModel):
    """Request to run full CAI pipeline (generate + critique)."""
    prompt: str = Field(..., description="The user prompt to respond to")
    constitution: ConstitutionSchema = Field(..., description="The constitution to use")
    max_rounds: int = Field(default=3, ge=1, le=5, description="Maximum critique rounds")
    model: str = Field(default="claude-sonnet-4-20250514", description="Model to use")


class CompareRequest(BaseModel):
    """Request to compare multiple constitutions on the same prompt."""
    prompt: str = Field(..., description="The prompt to test")
    constitutions: List[ConstitutionSchema] = Field(..., min_length=2, max_length=5)
    max_rounds: int = Field(default=3, ge=1, le=5)
    model: str = Field(default="claude-sonnet-4-20250514")


class CompareResult(BaseModel):
    """Result of comparing multiple constitutions."""
    prompt: str
    results: List[CritiqueResultSchema]
    comparison_metrics: Dict[str, Any] = Field(default_factory=dict)


# Response schemas for constitution management
class ConstitutionListResponse(BaseModel):
    constitutions: List[ConstitutionSchema]
    total: int


class ConstitutionResponse(BaseModel):
    constitution: ConstitutionSchema


# Health check
class HealthResponse(BaseModel):
    status: str
    version: str
    timestamp: str
