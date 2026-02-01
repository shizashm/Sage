"""Scheduling schemas."""
from datetime import datetime
from uuid import UUID
from pydantic import BaseModel


class SlotResponse(BaseModel):
    id: UUID
    slot_at: datetime


class SlotListResponse(BaseModel):
    slots: list[SlotResponse]


class ConfirmSlotRequest(BaseModel):
    slot_id: UUID
