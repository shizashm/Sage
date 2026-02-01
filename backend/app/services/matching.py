"""Assign user to focus group with explainable reason (no group_readiness)."""
import logging
from uuid import UUID

from sqlalchemy import select, update
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.group import Group, GroupMember, MEMBERSHIP_STATUS_ACTIVE, MEMBERSHIP_STATUS_WITHDRAWN
from app.models.intake import IntakeResult
from app.services.llm import llm_service

logger = logging.getLogger(__name__)

FOCUS_ANXIETY_STRESS = "anxiety_stress_management"
FOCUS_GRIEF_LOSS = "grief_loss"
FOCUS_POSTPARTUM = "postpartum_parenting"
FOCUS_RELATIONSHIP = "relationship_interpersonal"
FOCUS_WORKPLACE_BURNOUT = "workplace_burnout"
FOCUS_GENERAL = "general"

DEFAULT_GROUPS = [
    ("Anxiety & Stress Management", FOCUS_ANXIETY_STRESS),
    ("Grief & Loss Support", FOCUS_GRIEF_LOSS),
    ("Postpartum & Parenting Stress", FOCUS_POSTPARTUM),
    ("Relationship & Interpersonal Challenges", FOCUS_RELATIONSHIP),
    ("Workplace Burnout & Career Transitions", FOCUS_WORKPLACE_BURNOUT),
    ("General emotional support", FOCUS_GENERAL),
]


async def ensure_focus_groups(db: AsyncSession) -> None:
    """Create default groups if not present (by focus key)."""
    result = await db.execute(select(Group.focus))
    existing_foci = {row[0] for row in result.fetchall()}
    for name, focus_key in DEFAULT_GROUPS:
        if focus_key not in existing_foci:
            g = Group(name=name, focus=focus_key)
            db.add(g)
            existing_foci.add(focus_key)
    await db.flush()
    if existing_foci:
        logger.info("Ensured focus groups", extra={"count": len(existing_foci)})


def _text_for_matching(intake: dict) -> str:
    """Single string of intake content for keyword matching."""
    parts = [
        (intake.get("primary_concern") or ""),
        (intake.get("contextual_background") or ""),
        (intake.get("support_goals") or ""),
    ]
    areas = intake.get("life_impact_areas") or []
    if isinstance(areas, list):
        parts.append(" ".join(str(a) for a in areas))
    else:
        parts.append(str(areas))
    return " ".join(parts).lower()


def _match_focus(intake: dict) -> tuple[str, str]:
    """Return (focus_key, match_reason). Assign only to one of the six groups."""
    concern = (intake.get("primary_concern") or "").lower()
    text = _text_for_matching(intake)
    primary = intake.get("primary_concern") or "your concerns"
    intensity = intake.get("emotional_intensity")
    areas = intake.get("life_impact_areas")

    if "grief" in text or "bereavement" in text or "loss" in concern or "mourn" in text:
        return FOCUS_GRIEF_LOSS, f"Primary concern: {primary}; life impact: {areas or 'general'}."

    if "postpartum" in text or "parenting" in text or "new parent" in text or "baby" in text or "exhaustion" in text and ("parent" in text or "child" in text):
        return FOCUS_POSTPARTUM, f"Primary concern: {primary}; life impact: {areas or 'general'}."

    if "relationship" in text or "communication" in text or "boundary" in text or "conflict" in text or "interpersonal" in text:
        return FOCUS_RELATIONSHIP, f"Primary concern: {primary}; life impact: {areas or 'general'}."

    if "burnout" in text or "career" in text or "professional" in text or "imposter" in text or "workplace" in text or "job" in text:
        return FOCUS_WORKPLACE_BURNOUT, f"Primary concern: {primary}; life impact: {areas or 'general'}."

    if "anxiety" in text or "anxious" in text or "stress" in text or "overwhelm" in text or "panic" in text or "racing" in text:
        return FOCUS_ANXIETY_STRESS, f"Primary concern: {primary}; emotional intensity {intensity or 'N/A'}; life impact: {areas or 'general'}."

    return FOCUS_GENERAL, f"Primary concern: {primary}; life impact: {areas or 'general'}."


async def assign_user_to_group(
    db: AsyncSession,
    user_id: UUID,
    intake: dict,
) -> Group:
    """Assign user to a focus group; create membership with match_reason. Uses LLM if available, else keyword fallback."""
    await ensure_focus_groups(db)
    result = await db.execute(select(Group).order_by(Group.name))
    groups = result.scalars().all()
    groups_for_llm = [{"focus": g.focus, "name": g.name} for g in groups]
    llm_result = await llm_service.match_intake_to_group(intake, groups_for_llm)
    if llm_result is not None:
        focus_key, match_reason = llm_result
        logger.info("Assigned using LLM match", extra={"focus": focus_key})
    else:
        focus_key, match_reason = _match_focus(intake)
        logger.info("Assigned using keyword fallback", extra={"focus": focus_key})
    result = await db.execute(select(Group).where(Group.focus == focus_key))
    group = result.scalar_one_or_none()
    if not group:
        result = await db.execute(select(Group).where(Group.focus == FOCUS_GENERAL))
        group = result.scalar_one_or_none()
    if not group:
        result = await db.execute(select(Group).limit(1))
        group = result.scalar_one()
    await db.execute(
        update(GroupMember)
        .where(GroupMember.user_id == user_id, GroupMember.status == MEMBERSHIP_STATUS_ACTIVE)
        .values(status=MEMBERSHIP_STATUS_WITHDRAWN)
    )
    member = GroupMember(
        group_id=group.id,
        user_id=user_id,
        match_reason=match_reason,
        status=MEMBERSHIP_STATUS_ACTIVE,
    )
    db.add(member)
    await db.flush()
    logger.info("Assigned user to group", extra={"user_id": str(user_id), "group_id": str(group.id), "focus": group.focus})
    return group


class MatchingService:
    async def ensure_groups(self, db: AsyncSession) -> None:
        await ensure_focus_groups(db)

    async def assign(self, db: AsyncSession, user_id: UUID, intake: dict) -> Group:
        return await assign_user_to_group(db, user_id, intake)


matching_service = MatchingService()
