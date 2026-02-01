"""Scheduling: slots, confirm."""
import logging
from datetime import datetime, timezone, timedelta
from uuid import UUID

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.database import get_db
from app.core.auth import get_current_user
from app.models.user import User
from app.models.group import GroupMember, MEMBERSHIP_STATUS_ACTIVE
from app.models.scheduling import ScheduleSlot, SlotConfirmation
from app.schemas.scheduling import SlotResponse, SlotListResponse, ConfirmSlotRequest

router = APIRouter()
logger = logging.getLogger(__name__)


async def get_user_group_id(db: AsyncSession, user_id: UUID) -> UUID | None:
    result = await db.execute(
        select(GroupMember.group_id).where(
            GroupMember.user_id == user_id,
            GroupMember.status == MEMBERSHIP_STATUS_ACTIVE,
        )
    )
    row = result.first()
    return row[0] if row else None


@router.get("/slots", response_model=SlotListResponse)
async def get_slots(
    user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    group_id = await get_user_group_id(db, user.id)
    if not group_id:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="No group assigned. Complete intake first.")
    result = await db.execute(
        select(ScheduleSlot).where(ScheduleSlot.group_id == group_id).order_by(ScheduleSlot.slot_at)
    )
    slots = result.scalars().all()
    if not slots:
        now = datetime.now(timezone.utc)
        for i in range(3):
            slot = ScheduleSlot(group_id=group_id, slot_at=now + timedelta(days=7 + i, hours=18))
            db.add(slot)
        await db.flush()
        result = await db.execute(
            select(ScheduleSlot).where(ScheduleSlot.group_id == group_id).order_by(ScheduleSlot.slot_at)
        )
        slots = result.scalars().all()
    return SlotListResponse(slots=[SlotResponse(id=s.id, slot_at=s.slot_at) for s in slots])


@router.post("/confirm")
async def confirm_slot(
    body: ConfirmSlotRequest,
    user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    result = await db.execute(select(ScheduleSlot).where(ScheduleSlot.id == body.slot_id))
    slot = result.scalar_one_or_none()
    if not slot:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Slot not found")
    group_id = await get_user_group_id(db, user.id)
    if group_id != slot.group_id:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Slot does not belong to your group")
    result = await db.execute(
        select(SlotConfirmation).where(
            SlotConfirmation.slot_id == body.slot_id,
            SlotConfirmation.user_id == user.id,
        )
    )
    if result.scalar_one_or_none():
        return {"status": "already_confirmed", "slot_id": str(body.slot_id)}
    conf = SlotConfirmation(slot_id=body.slot_id, user_id=user.id)
    db.add(conf)
    await db.flush()
    logger.info("Slot confirmed", extra={"user_id": str(user.id), "slot_id": str(body.slot_id)})
    return {"status": "confirmed", "slot_id": str(body.slot_id)}
