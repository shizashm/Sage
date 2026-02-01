"""Intake schemas (no group_readiness)."""
from uuid import UUID
from pydantic import BaseModel


class IntakeResponse(BaseModel):
    primary_concern: str | None = None
    contextual_background: str | None = None
    emotional_intensity: int | None = None
    life_impact_areas: list[str] | None = None
    support_goals: str | None = None
    availability: str | None = None


class IntakeUpdate(BaseModel):
    primary_concern: str | None = None
    contextual_background: str | None = None
    emotional_intensity: int | None = None
    life_impact_areas: list[str] | None = None
    support_goals: str | None = None
    availability: str | None = None
