"""Handoff schemas."""
from datetime import datetime
from uuid import UUID
from pydantic import BaseModel


class HandoffResponse(BaseModel):
    group_id: UUID
    content: dict
    created_at: datetime


class HandoffGroupSummary(BaseModel):
    group_id: str
    name: str
    focus: str
    participant_count: int


class HandoffListResponse(BaseModel):
    groups: list[HandoffGroupSummary]
