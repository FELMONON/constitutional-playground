"""
Constitution data models for Constitutional AI.

A Constitution is a collection of principles that guide AI behavior.
"""

from dataclasses import dataclass, field
from enum import Enum
from typing import List, Optional, Any
import json
from datetime import datetime


class PrincipleCategory(str, Enum):
    """Categories for organizing principles."""

    SAFETY = "safety"
    HONESTY = "honesty"
    HELPFULNESS = "helpfulness"
    ETHICS = "ethics"
    CUSTOM = "custom"


@dataclass
class Principle:
    """A single principle in a constitution."""

    id: str
    name: str
    description: str
    category: PrincipleCategory
    critique_prompt: str
    revision_prompt: str
    weight: float = 1.0
    enabled: bool = True
    examples: List[dict] = field(default_factory=list)

    def to_dict(self) -> dict:
        """Convert to dictionary for JSON serialization."""
        return {
            "id": self.id,
            "name": self.name,
            "description": self.description,
            "category": self.category.value,
            "critique_prompt": self.critique_prompt,
            "revision_prompt": self.revision_prompt,
            "weight": self.weight,
            "enabled": self.enabled,
            "examples": self.examples,
        }

    @classmethod
    def from_dict(cls, data: dict) -> "Principle":
        """Create from dictionary."""
        return cls(
            id=data["id"],
            name=data["name"],
            description=data["description"],
            category=PrincipleCategory(data["category"]),
            critique_prompt=data["critique_prompt"],
            revision_prompt=data["revision_prompt"],
            weight=data.get("weight", 1.0),
            enabled=data.get("enabled", True),
            examples=data.get("examples", []),
        )


@dataclass
class Constitution:
    """A collection of principles that define AI behavior guidelines."""

    id: str
    name: str
    description: str
    principles: List[Principle]
    version: str = "1.0.0"
    author: str = "anonymous"
    created_at: str = field(default_factory=lambda: datetime.utcnow().isoformat())
    updated_at: str = field(default_factory=lambda: datetime.utcnow().isoformat())
    tags: List[str] = field(default_factory=list)
    is_public: bool = False
    metadata: dict = field(default_factory=dict)

    def get_enabled_principles(self) -> List[Principle]:
        """Get only enabled principles."""
        return [p for p in self.principles if p.enabled]

    def get_principles_by_category(self, category: PrincipleCategory) -> List[Principle]:
        """Get principles filtered by category."""
        return [p for p in self.principles if p.category == category]

    def get_principle_by_id(self, principle_id: str) -> Optional[Principle]:
        """Get a specific principle by ID."""
        for p in self.principles:
            if p.id == principle_id:
                return p
        return None

    def add_principle(self, principle: Principle) -> None:
        """Add a principle to the constitution."""
        if self.get_principle_by_id(principle.id):
            raise ValueError(f"Principle with id '{principle.id}' already exists")
        self.principles.append(principle)
        self.updated_at = datetime.utcnow().isoformat()

    def remove_principle(self, principle_id: str) -> bool:
        """Remove a principle by ID. Returns True if removed."""
        for i, p in enumerate(self.principles):
            if p.id == principle_id:
                self.principles.pop(i)
                self.updated_at = datetime.utcnow().isoformat()
                return True
        return False

    def reorder_principles(self, principle_ids: List[str]) -> None:
        """Reorder principles according to the given ID list."""
        id_to_principle = {p.id: p for p in self.principles}
        self.principles = [id_to_principle[pid] for pid in principle_ids if pid in id_to_principle]
        self.updated_at = datetime.utcnow().isoformat()

    def to_dict(self) -> dict:
        """Convert to dictionary for JSON serialization."""
        return {
            "id": self.id,
            "name": self.name,
            "description": self.description,
            "principles": [p.to_dict() for p in self.principles],
            "version": self.version,
            "author": self.author,
            "created_at": self.created_at,
            "updated_at": self.updated_at,
            "tags": self.tags,
            "is_public": self.is_public,
            "metadata": self.metadata,
        }

    @classmethod
    def from_dict(cls, data: dict) -> "Constitution":
        """Create from dictionary."""
        return cls(
            id=data["id"],
            name=data["name"],
            description=data["description"],
            principles=[Principle.from_dict(p) for p in data["principles"]],
            version=data.get("version", "1.0.0"),
            author=data.get("author", "anonymous"),
            created_at=data.get("created_at", datetime.utcnow().isoformat()),
            updated_at=data.get("updated_at", datetime.utcnow().isoformat()),
            tags=data.get("tags", []),
            is_public=data.get("is_public", False),
            metadata=data.get("metadata", {}),
        )

    def to_json(self, indent: int = 2) -> str:
        """Serialize to JSON string."""
        return json.dumps(self.to_dict(), indent=indent)

    @classmethod
    def from_json(cls, json_str: str) -> "Constitution":
        """Create from JSON string."""
        return cls.from_dict(json.loads(json_str))

    @classmethod
    def from_file(cls, filepath: str) -> "Constitution":
        """Load constitution from a JSON file."""
        with open(filepath, "r") as f:
            return cls.from_dict(json.load(f))

    def to_file(self, filepath: str) -> None:
        """Save constitution to a JSON file."""
        with open(filepath, "w") as f:
            json.dump(self.to_dict(), f, indent=2)


def create_empty_constitution(
    name: str,
    description: str = "",
    author: str = "anonymous"
) -> Constitution:
    """Create a new empty constitution."""
    import uuid
    return Constitution(
        id=str(uuid.uuid4()),
        name=name,
        description=description,
        principles=[],
        author=author,
    )


def create_custom_principle(
    name: str,
    description: str,
    critique_prompt: str,
    revision_prompt: str,
    category: PrincipleCategory = PrincipleCategory.CUSTOM,
    weight: float = 1.0,
) -> Principle:
    """Create a custom principle."""
    import uuid
    return Principle(
        id=str(uuid.uuid4()),
        name=name,
        description=description,
        category=category,
        critique_prompt=critique_prompt,
        revision_prompt=revision_prompt,
        weight=weight,
    )
