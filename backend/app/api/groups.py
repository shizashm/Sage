"""Groups: my group, list groups, get by id."""
import logging
from uuid import UUID

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.database import get_db
from app.core.auth import get_current_user
from app.models.user import User
from app.models.group import Group, GroupMember, MEMBERSHIP_STATUS_ACTIVE
from app.models.intake import IntakeResult
from app.schemas.group import GroupResponse, GroupListResponse

router = APIRouter()
logger = logging.getLogger(__name__)


@router.get("/my", response_model=GroupResponse)
async def my_group(
    user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    result = await db.execute(
        select(GroupMember, Group)
        .join(Group, Group.id == GroupMember.group_id)
        .where(GroupMember.user_id == user.id, GroupMember.status == MEMBERSHIP_STATUS_ACTIVE)
    )
    row = result.one_or_none()
    if not row:
        logger.info("No group assigned for user", extra={"user_id": str(user.id)})
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="No group assigned yet. Complete intake first.")
    member, group = row
    intake_result = await db.execute(
        select(IntakeResult)
        .where(IntakeResult.user_id == user.id)
        .order_by(IntakeResult.updated_at.desc())
        .limit(1)
    )
    intake = intake_result.scalar_one_or_none()
    life_impact = list(intake.life_impact_areas) if intake and intake.life_impact_areas else None
    primary_concern = intake.primary_concern if intake else None
    return GroupResponse(
        id=group.id, name=group.name, focus=group.focus,
        match_reason=member.match_reason, primary_concern=primary_concern, life_impact_areas=life_impact,
    )


@router.get("", response_model=GroupListResponse)
async def list_groups(
    user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    result = await db.execute(select(Group).order_by(Group.name))
    groups = result.scalars().all()
    return GroupListResponse(groups=[GroupResponse(id=g.id, name=g.name, focus=g.focus) for g in groups])


@router.get("/{group_id}", response_model=GroupResponse)
async def get_group(
    group_id: UUID,
    user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    result = await db.execute(select(Group).where(Group.id == group_id))
    group = result.scalar_one_or_none()
    if not group:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Group not found")
    result = await db.execute(
        select(GroupMember).where(
            GroupMember.group_id == group_id,
            GroupMember.user_id == user.id,
            GroupMember.status == MEMBERSHIP_STATUS_ACTIVE,
        )
    )
    member = result.scalar_one_or_none()
    match_reason = member.match_reason if member else None
    life_impact = None
    primary_concern = None
    if member:
        intake_result = await db.execute(
            select(IntakeResult)
            .where(IntakeResult.user_id == user.id)
            .order_by(IntakeResult.updated_at.desc())
            .limit(1)
        )
        intake = intake_result.scalar_one_or_none()
        if intake:
            life_impact = list(intake.life_impact_areas) if intake.life_impact_areas else None
            primary_concern = intake.primary_concern
    return GroupResponse(
        id=group.id, name=group.name, focus=group.focus,
        match_reason=match_reason, primary_concern=primary_concern, life_impact_areas=life_impact,
    )
