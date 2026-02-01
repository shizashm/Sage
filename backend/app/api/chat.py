"""Chat: send message, history, complete intake."""
import json
import logging
from uuid import UUID

from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.responses import JSONResponse
from sqlalchemy import select, delete, update
from sqlalchemy.ext.asyncio import AsyncSession

from app.database import get_db
from app.core.auth import get_current_user
from app.models.user import User
from app.models.chat import ChatSession, ChatTurn
from app.models.intake import IntakeResult
from app.models.group import GroupMember, MEMBERSHIP_STATUS_ACTIVE, MEMBERSHIP_STATUS_WITHDRAWN
from app.schemas.chat import ChatSendRequest, ChatSendResponse, ChatTurnResponse, ChatHistoryResponse
from app.services.crisis import crisis_service
from app.services.llm import llm_service
from app.services.extraction import extraction_service, is_intake_complete
from app.config import settings
from app.services.matching import matching_service

router = APIRouter()
logger = logging.getLogger(__name__)


@router.get("/llm-status")
async def llm_status():
    """Return which LLM is configured (no auth). Use to verify key is loaded."""
    groq_ok = bool(settings.groq_api_key and settings.groq_api_key.strip())
    openai_ok = bool(settings.openai_api_key and settings.openai_api_key.strip())
    if groq_ok:
        message = "Chat will use Groq LLM"
    elif openai_ok:
        message = "Chat will use OpenAI GPT"
    else:
        message = "Chat will use mock (no API key)"
    return {
        "groq_configured": groq_ok,
        "openai_configured": openai_ok,
        "message": message,
    }


async def get_or_create_chat_session(db: AsyncSession, user_id: UUID) -> ChatSession:
    result = await db.execute(
        select(ChatSession)
        .where(ChatSession.user_id == user_id)
        .order_by(ChatSession.created_at.desc())
        .limit(1)
    )
    session = result.scalars().first()
    if session and not session.completed:
        return session
    session = ChatSession(user_id=user_id)
    db.add(session)
    await db.flush()
    logger.info("Created new chat session", extra={"user_id": str(user_id), "session_id": str(session.id)})
    return session


@router.post("/send", response_model=ChatSendResponse)
async def send_message(
    body: ChatSendRequest,
    user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    message = (body.message or "").strip()
    logger.info("Chat /send received message (user_id=%s)", user.id)
    if not message:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Message cannot be empty")
    if crisis_service.check(message):
        reply = crisis_service.response()
        session = await get_or_create_chat_session(db, user.id)
        user_turn = ChatTurn(chat_session_id=session.id, role="user", content=message)
        assistant_turn = ChatTurn(chat_session_id=session.id, role="assistant", content=reply)
        db.add(user_turn)
        db.add(assistant_turn)
        await db.flush()
        logger.info("Crisis response returned", extra={"user_id": str(user.id)})
        return ChatSendResponse(reply=reply, turn_id=assistant_turn.id)
    session = await get_or_create_chat_session(db, user.id)
    result = await db.execute(
        select(ChatTurn).where(ChatTurn.chat_session_id == session.id).order_by(ChatTurn.created_at)
    )
    turns = result.scalars().all()
    history = [{"role": t.role, "content": t.content} for t in turns]
    reply, source, openai_error = await llm_service.chat(message, history)
    user_turn = ChatTurn(chat_session_id=session.id, role="user", content=message)
    assistant_turn = ChatTurn(chat_session_id=session.id, role="assistant", content=reply)
    db.add(user_turn)
    db.add(assistant_turn)
    await db.flush()
    logger.info("Chat turn saved", extra={"user_id": str(user.id), "session_id": str(session.id)})

    # Auto-complete: after each turn, use LLM extraction and check if intake is complete
    intake_complete = False
    group_id = None
    group_name = None
    group_focus = None
    match_reason = None
    MIN_USER_TURNS_BEFORE_COMPLETE = 3
    if not session.completed:
        turn_result = await db.execute(
            select(ChatTurn).where(ChatTurn.chat_session_id == session.id).order_by(ChatTurn.created_at)
        )
        all_turns = [{"role": t.role, "content": t.content} for t in turn_result.scalars().all()]
        user_turn_count = sum(1 for t in all_turns if t.get("role") == "user")
        extracted = await extraction_service.extract(all_turns)
        # Don't trust emotional_intensity until enough turns (avoid LLM default e.g. 5 on new chat)
        if user_turn_count < MIN_USER_TURNS_BEFORE_COMPLETE:
            extracted["emotional_intensity"] = None
        # Log extracted schema so far for evaluation (server console)
        logger.info(
            "Extracted intake schema so far (user_turns=%s, complete=%s):\n%s",
            user_turn_count,
            is_intake_complete(extracted),
            json.dumps(extracted, indent=2, default=str),
        )
        if user_turn_count >= MIN_USER_TURNS_BEFORE_COMPLETE and is_intake_complete(extracted):
            session.completed = True
            intake = IntakeResult(
                user_id=user.id,
                chat_session_id=session.id,
                primary_concern=extracted.get("primary_concern"),
                contextual_background=extracted.get("contextual_background"),
                emotional_intensity=extracted.get("emotional_intensity"),
                life_impact_areas=extracted.get("life_impact_areas"),
                support_goals=extracted.get("support_goals"),
                availability=extracted.get("availability"),
            )
            db.add(intake)
            await db.flush()
            group = await matching_service.assign(db, user.id, extracted)
            intake.group_id = group.id
            await db.flush()
            member_result = await db.execute(
                select(GroupMember)
                .where(
                    GroupMember.group_id == group.id,
                    GroupMember.user_id == user.id,
                    GroupMember.status == MEMBERSHIP_STATUS_ACTIVE,
                )
                .limit(1)
            )
            member = member_result.scalar_one_or_none()
            intake_complete = True
            group_id = group.id
            group_name = group.name
            group_focus = group.focus
            match_reason = member.match_reason if member else None
            logger.info(
                "Intake auto-completed and user assigned to group",
                extra={"user_id": str(user.id), "group_id": str(group.id)},
            )
            reply = "We have enough information. We're finding a support group for you…"

    response = ChatSendResponse(
        reply=reply,
        turn_id=assistant_turn.id,
        intake_complete=intake_complete,
        group_id=group_id,
        group_name=group_name,
        group_focus=group_focus,
        match_reason=match_reason,
    )
    headers = {"X-Chat-Source": source}
    if openai_error:
        headers["X-Chat-Error"] = openai_error[:500]
    return JSONResponse(
        content=response.model_dump(mode="json"),
        headers=headers,
    )


@router.get("/history", response_model=ChatHistoryResponse)
async def get_history(
    user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    result = await db.execute(
        select(ChatSession)
        .where(ChatSession.user_id == user.id)
        .order_by(ChatSession.created_at.desc())
        .limit(1)
    )
    session = result.scalars().first()
    if not session:
        return ChatHistoryResponse(turns=[])
    result = await db.execute(
        select(ChatTurn).where(ChatTurn.chat_session_id == session.id).order_by(ChatTurn.created_at)
    )
    turns = result.scalars().all()
    return ChatHistoryResponse(
        turns=[ChatTurnResponse(id=t.id, role=t.role, content=t.content, created_at=t.created_at) for t in turns]
    )


@router.post("/complete")
async def complete_intake(
    user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    result = await db.execute(
        select(ChatSession)
        .where(ChatSession.user_id == user.id)
        .order_by(ChatSession.created_at.desc())
        .limit(1)
    )
    session = result.scalars().first()
    if not session:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="No chat session found")
    if session.completed:
        return {"status": "already_completed", "session_id": str(session.id)}
    session.completed = True
    turn_result = await db.execute(
        select(ChatTurn).where(ChatTurn.chat_session_id == session.id).order_by(ChatTurn.created_at)
    )
    turns = [{"role": t.role, "content": t.content} for t in turn_result.scalars().all()]
    extracted = await extraction_service.extract(turns)
    intake = IntakeResult(
        user_id=user.id,
        chat_session_id=session.id,
        primary_concern=extracted.get("primary_concern"),
        contextual_background=extracted.get("contextual_background"),
        emotional_intensity=extracted.get("emotional_intensity"),
        life_impact_areas=extracted.get("life_impact_areas"),
        support_goals=extracted.get("support_goals"),
        availability=extracted.get("availability"),
    )
    db.add(intake)
    await db.flush()
    group = await matching_service.assign(db, user.id, extracted)
    intake.group_id = group.id
    await db.flush()
    logger.info("Intake completed and user assigned to group", extra={"user_id": str(user.id), "group_id": str(group.id)})
    return {"status": "completed", "session_id": str(session.id), "group_id": str(group.id)}


@router.post("/restart")
async def restart_chat(
    user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """
    Restart intake: clear schema (turns, intake, group assignment) and mark chat session incomplete.
    Therapist only sees complete sessions (turned to group); this session becomes incomplete again.
    """
    result = await db.execute(
        select(ChatSession)
        .where(ChatSession.user_id == user.id, ChatSession.completed == True)
        .order_by(ChatSession.created_at.desc())
        .limit(1)
    )
    session = result.scalar_one_or_none()
    if not session:
        return {"status": "no_completed_session", "message": "No completed session to restart"}
    intake_result = await db.execute(
        select(IntakeResult).where(IntakeResult.chat_session_id == session.id)
    )
    intake = intake_result.scalar_one_or_none()
    if intake and intake.group_id:
        await db.execute(
            update(GroupMember)
            .where(
                GroupMember.user_id == user.id,
                GroupMember.group_id == intake.group_id,
            )
            .values(status=MEMBERSHIP_STATUS_WITHDRAWN)
        )
    if intake:
        await db.delete(intake)
    await db.execute(delete(ChatTurn).where(ChatTurn.chat_session_id == session.id))
    session.completed = False
    await db.flush()
    logger.info(
        "Chat restarted: session set incomplete, turns and intake cleared",
        extra={"user_id": str(user.id), "chat_session_id": str(session.id)},
    )
    return {"status": "ok", "message": "Session restarted; schema cleared"}
