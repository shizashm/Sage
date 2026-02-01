"""Handoff: list groups, get handoff for group, document."""
import logging
from uuid import UUID

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy import select, func
from sqlalchemy.ext.asyncio import AsyncSession

from app.database import get_db
from app.core.auth import get_current_user
from app.models.user import User
from app.models.group import Group, GroupMember, MEMBERSHIP_STATUS_ACTIVE
from app.models.intake import IntakeResult
from app.models.handoff import HandoffDocument
from app.schemas.handoff import HandoffResponse, HandoffListResponse, HandoffGroupSummary

router = APIRouter()
logger = logging.getLogger(__name__)


def _build_handoff_content(group: Group, members: list, intakes: dict) -> dict:
    participant_summaries = []
    for m in members:
        intake = intakes.get(str(m.user_id), {})
        participant_summaries.append({
            "user_id": str(m.user_id),
            "primary_concern": intake.get("primary_concern"),
            "emotional_intensity": intake.get("emotional_intensity"),
            "support_goals": intake.get("support_goals"),
            "match_reason": m.match_reason,
        })
    return {
        "group_theme": group.focus,
        "group_name": group.name,
        "participant_summaries": participant_summaries,
        "full_conversation_available": True,
    }


@router.get("/groups", response_model=HandoffListResponse)
async def handoff_groups(
    user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    result = await db.execute(
        select(Group).order_by(Group.name)
    )
    groups = result.scalars().all()
    out = []
    for g in groups:
        count_result = await db.execute(
            select(func.count(GroupMember.id)).where(
                GroupMember.group_id == g.id,
                GroupMember.status == MEMBERSHIP_STATUS_ACTIVE,
            )
        )
        count = count_result.scalar() or 0
        out.append(HandoffGroupSummary(group_id=str(g.id), name=g.name, focus=g.focus, participant_count=count))
    return HandoffListResponse(groups=out)


@router.get("/group/{group_id}", response_model=HandoffResponse)
async def get_handoff(
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
            GroupMember.status == MEMBERSHIP_STATUS_ACTIVE,
        )
    )
    members = result.scalars().all()
    user_ids = [m.user_id for m in members]
    result = await db.execute(select(IntakeResult).where(IntakeResult.user_id.in_(user_ids)))
    intakes = {}
    for row in result.scalars().all():
        intakes[str(row.user_id)] = {
            "primary_concern": row.primary_concern,
            "emotional_intensity": row.emotional_intensity,
            "support_goals": row.support_goals,
        }
    content = _build_handoff_content(group, members, intakes)
    handoff = await db.execute(select(HandoffDocument).where(HandoffDocument.group_id == group_id))
    doc = handoff.scalar_one_or_none()
    if not doc:
        doc = HandoffDocument(group_id=group_id, content=content)
        db.add(doc)
        await db.flush()
    else:
        doc.content = content
        await db.flush()
    return HandoffResponse(group_id=group_id, content=doc.content or content, created_at=doc.created_at)


@router.get("/group/{group_id}/document")
async def get_handoff_document(
    group_id: UUID,
    user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    result = await db.execute(select(Group).where(Group.id == group_id))
    group = result.scalar_one_or_none()
    if not group:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Group not found")
    result = await db.execute(select(HandoffDocument).where(HandoffDocument.group_id == group_id))
    doc = result.scalar_one_or_none()
    if not doc or not doc.content:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Handoff not generated yet")
    import json
    from fastapi.responses import Response
    return Response(
        content=json.dumps(doc.content, indent=2),
        media_type="application/json",
        headers={"Content-Disposition": f"attachment; filename=handoff-{group_id}.json"},
    )
