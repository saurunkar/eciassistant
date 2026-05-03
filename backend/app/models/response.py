"""Pydantic v2 response schemas — all outputs typed here."""
from __future__ import annotations

from typing import Literal

from pydantic import BaseModel, ConfigDict, Field


class SourceCitation(BaseModel):
    """A single ECI document citation."""

    title: str
    url: str = ""
    excerpt: str = ""


class ChatResponse(BaseModel):
    """Response body from POST /api/v1/chat."""

    model_config = ConfigDict(frozen=True)

    message_id: str
    answer: str
    sources: list[SourceCitation] = Field(default_factory=list)
    language: Literal["en", "hi"] = "en"
    is_fallback: bool = Field(
        default=False,
        description="True when answer came from built-in KB, not Vertex AI",
    )


class ElectionPhase(BaseModel):
    """A single election phase for the Timeline."""

    id: int
    title: str
    title_hi: str
    description: str
    description_hi: str
    icon: str
    color: str
    steps: list[str]
    steps_hi: list[str]


class GlossaryTerm(BaseModel):
    """A single glossary entry."""

    term: str
    term_hi: str
    definition: str
    definition_hi: str
    category: str


class VoterGuideStep(BaseModel):
    """One step in the first-time voter guide."""

    step: int
    title: str
    title_hi: str
    description: str
    description_hi: str
    action_url: str = ""
    tips: list[str] = Field(default_factory=list)
    tips_hi: list[str] = Field(default_factory=list)


class TimelineResponse(BaseModel):
    phases: list[ElectionPhase]


class GlossaryResponse(BaseModel):
    terms: list[GlossaryTerm]


class VoterGuideResponse(BaseModel):
    steps: list[VoterGuideStep]


class FeedbackResponse(BaseModel):
    success: bool
    message: str = "Thank you for your feedback!"
