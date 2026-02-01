"""Chat schemas."""
from datetime import datetime
from uuid import UUID
from pydantic import BaseModel


class ChatSendRequest(BaseModel):
    message: str


class ChatSendResponse(BaseModel):
    reply: str
    turn_id: UUID
    intake_complete: bool = False
    group_id: UUID | None = None
    group_name: str | None = None
    group_focus: str | None = None
    match_reason: str | None = None


class ChatTurnResponse(BaseModel):
    id: UUID
    role: str
    content: str
    created_at: datetime


class ChatHistoryResponse(BaseModel):
    turns: list[ChatTurnResponse]
