"""Payment schemas."""
from datetime import datetime
from uuid import UUID
from pydantic import BaseModel


class PaymentCreateRequest(BaseModel):
    amount: float
    slot_id: UUID | None = None


class PaymentResponse(BaseModel):
    id: UUID
    amount: float
    status: str
    created_at: datetime


class PaymentConfirmResponse(BaseModel):
    id: UUID
    status: str
