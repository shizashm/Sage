"""Intake: get/update structured intake (no group_readiness)."""
import logging
from uuid import UUID

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.database import get_db
from app.core.auth import get_current_user
from app.models.user import User
from app.models.intake import IntakeResult
from app.schemas.intake import IntakeResponse

router = APIRouter()
logger = logging.getLogger(__name__)


@router.get("", response_model=IntakeResponse)
async def get_intake(
    user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    result = await db.execute(
        select(IntakeResult)
        .where(IntakeResult.user_id == user.id)
        .order_by(IntakeResult.updated_at.desc())
        .limit(1)
    )
    row = result.scalar_one_or_none()
    if not row:
        return IntakeResponse()
    return IntakeResponse(
        primary_concern=row.primary_concern,
        contextual_background=row.contextual_background,
        emotional_intensity=row.emotional_intensity,
        life_impact_areas=row.life_impact_areas or [],
        support_goals=row.support_goals,
        availability=row.availability,
    )
