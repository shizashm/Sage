"""Group schemas."""
from datetime import datetime
from uuid import UUID
from pydantic import BaseModel


class GroupMemberResponse(BaseModel):
    user_id: UUID


class GroupResponse(BaseModel):
    id: UUID
    name: str
    focus: str
    match_reason: str | None = None
    primary_concern: str | None = None
    life_impact_areas: list[str] | None = None


class GroupListResponse(BaseModel):
    groups: list[GroupResponse]
