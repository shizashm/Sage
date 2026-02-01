"""Payments: create, status, confirm (mock)."""
import logging
from uuid import UUID

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.database import get_db
from app.core.auth import get_current_user
from app.models.user import User
from app.models.payment import Payment
from app.schemas.payment import PaymentCreateRequest, PaymentResponse, PaymentConfirmResponse

router = APIRouter()
logger = logging.getLogger(__name__)


@router.post("", response_model=PaymentResponse)
async def create_payment(
    body: PaymentCreateRequest,
    user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    payment = Payment(user_id=user.id, amount=body.amount, status="pending")
    db.add(payment)
    await db.flush()
    logger.info("Payment created", extra={"user_id": str(user.id), "payment_id": str(payment.id), "amount": body.amount})
    return PaymentResponse(id=payment.id, amount=float(payment.amount), status=payment.status, created_at=payment.created_at)


@router.get("/{payment_id}/status", response_model=PaymentResponse)
async def payment_status(
    payment_id: UUID,
    user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    result = await db.execute(select(Payment).where(Payment.id == payment_id, Payment.user_id == user.id))
    payment = result.scalar_one_or_none()
    if not payment:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Payment not found")
    return PaymentResponse(id=payment.id, amount=float(payment.amount), status=payment.status, created_at=payment.created_at)


@router.post("/{payment_id}/confirm", response_model=PaymentConfirmResponse)
async def confirm_payment(
    payment_id: UUID,
    user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    result = await db.execute(select(Payment).where(Payment.id == payment_id, Payment.user_id == user.id))
    payment = result.scalar_one_or_none()
    if not payment:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Payment not found")
    payment.status = "completed"
    await db.flush()
    logger.info("Payment confirmed", extra={"user_id": str(user.id), "payment_id": str(payment_id)})
    return PaymentConfirmResponse(id=payment.id, status=payment.status)
