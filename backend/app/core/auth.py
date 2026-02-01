"""Session-based auth: get user from X-Session-Id."""
import logging
from uuid import UUID

from fastapi import Depends, Header, HTTPException, status
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.user import User, AuthSession
from app.database import get_db
from app.core.logging_config import session_id_var

logger = logging.getLogger(__name__)


async def get_current_user(
    x_session_id: str | None = Header(None, alias="X-Session-Id"),
    db: AsyncSession = Depends(get_db),
) -> User:
    """Resolve X-Session-Id to User; set session_id in context for logging."""
    if not x_session_id:
        logger.warning("Missing X-Session-Id header")
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Missing X-Session-Id",
        )
    try:
        session_uuid = UUID(x_session_id)
    except ValueError:
        logger.warning("Invalid X-Session-Id format", extra={"session_id": x_session_id[:8]})
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid session",
        )
    session_id_var.set(x_session_id)
    result = await db.execute(
        select(AuthSession).where(AuthSession.id == session_uuid)
    )
    auth_session = result.scalar_one_or_none()
    if not auth_session:
        logger.warning("Session not found", extra={"session_id": x_session_id[:8]})
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid or expired session",
        )
    result = await db.execute(select(User).where(User.id == auth_session.user_id))
    user = result.scalar_one_or_none()
    if not user:
        logger.warning("User not found for session", extra={"session_id": x_session_id[:8]})
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid session",
        )
    return user
