"""Auth: signup, login, me, logout (session-based, no JWT)."""
import base64
import hashlib
import hmac
import logging
import os
import sys
import traceback
from uuid import UUID

from fastapi import APIRouter, Depends, Header, HTTPException, status
from fastapi.responses import JSONResponse
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.database import get_db
from app.core.auth import get_current_user
from app.models.user import User, AuthSession
from app.models.chat import ChatSession
from app.schemas.auth import SignupRequest, LoginRequest, AuthResponse, UserResponse

router = APIRouter()
logger = logging.getLogger(__name__)

# PBKDF2-HMAC-SHA256 (stdlib only, no 72-byte limit like bcrypt).
PBKDF2_ITERATIONS = 100_000
PBKDF2_SALT_BYTES = 16
STORED_FORMAT = "pbkdf2_sha256${}${}${}"


def _hash_password(password: str) -> str:
    """Hash password with PBKDF2-HMAC-SHA256; safe for any length."""
    salt = os.urandom(PBKDF2_SALT_BYTES)
    key = hashlib.pbkdf2_hmac(
        "sha256",
        password.encode("utf-8"),
        salt,
        PBKDF2_ITERATIONS,
    )
    return STORED_FORMAT.format(
        PBKDF2_ITERATIONS,
        base64.b64encode(salt).decode("ascii"),
        base64.b64encode(key).decode("ascii"),
    )


def _verify_password(password: str, stored: str) -> bool:
    """Verify password against stored PBKDF2 hash."""
    try:
        prefix, iters, salt_b64, key_b64 = stored.split("$")
        if prefix != "pbkdf2_sha256":
            return False
        salt = base64.b64decode(salt_b64)
        key = base64.b64decode(key_b64)
        expected = hashlib.pbkdf2_hmac("sha256", password.encode("utf-8"), salt, int(iters))
        return hmac.compare_digest(expected, key)
    except Exception:
        return False


def _user_response(user: User) -> UserResponse:
    return UserResponse(
        id=user.id,
        email=user.email,
        name=user.name,
        role=user.role or "client",
        date_of_birth=user.date_of_birth,
    )


@router.post("/signup", response_model=AuthResponse)
async def signup(
    body: SignupRequest,
    db: AsyncSession = Depends(get_db),
):
    try:
        result = await db.execute(select(User).where(User.email == body.email))
        if result.scalar_one_or_none():
            logger.warning("Signup failed: email already exists", extra={"email": body.email})
            raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Email already registered")
        hashed = _hash_password(body.password)
        user = User(
            email=body.email,
            hashed_password=hashed,
            name=body.name,
            role=body.role,
            date_of_birth=body.date_of_birth,
        )
        db.add(user)
        await db.flush()
        auth_session = AuthSession(user_id=user.id)
        db.add(auth_session)
        await db.flush()
        logger.info("User signed up", extra={"user_id": str(user.id), "session_id": str(auth_session.id)})
        return AuthResponse(
            user_id=user.id,
            session_id=auth_session.id,
            user=_user_response(user),
        )
    except HTTPException:
        raise
    except Exception as e:
        traceback.print_exc(file=sys.stderr)
        sys.stderr.flush()
        logger.exception("Signup failed: %s", e)
        return JSONResponse(status_code=500, content={"detail": "Internal Server Error", "error": str(e)})


@router.post("/login", response_model=AuthResponse)
async def login(
    body: LoginRequest,
    db: AsyncSession = Depends(get_db),
):
    result = await db.execute(select(User).where(User.email == body.email))
    user = result.scalar_one_or_none()
    if not user:
        logger.warning("Login failed: invalid credentials", extra={"email": body.email})
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid email or password")
    if not _verify_password(body.password, user.hashed_password):
        logger.warning("Login failed: invalid credentials", extra={"email": body.email})
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid email or password")
    auth_session = AuthSession(user_id=user.id)
    db.add(auth_session)
    await db.flush()
    logger.info("User logged in", extra={"user_id": str(user.id), "session_id": str(auth_session.id)})
    return AuthResponse(
        user_id=user.id,
        session_id=auth_session.id,
        user=_user_response(user),
    )


@router.get("/me", response_model=UserResponse)
async def me(user: User = Depends(get_current_user)):
    return _user_response(user)


@router.post("/logout")
async def logout(
    user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
    x_session_id: str | None = Header(None, alias="X-Session-Id"),
):
    """Invalidate current session and close current chat session so next login gets a fresh intake schema."""
    # Close user's current incomplete chat session so next chat starts fresh (empty turns → fresh extraction)
    result = await db.execute(
        select(ChatSession)
        .where(ChatSession.user_id == user.id, ChatSession.completed == False)
        .order_by(ChatSession.created_at.desc())
        .limit(1)
    )
    chat_session = result.scalar_one_or_none()
    if chat_session:
        chat_session.completed = True
        await db.flush()
        logger.info("Closed chat session on logout for fresh schema next time", extra={"user_id": str(user.id), "chat_session_id": str(chat_session.id)})
    # Invalidate only this auth session (the one used for this request)
    if x_session_id:
        try:
            session_uuid = UUID(x_session_id)
            result = await db.execute(select(AuthSession).where(AuthSession.id == session_uuid))
            auth_session = result.scalar_one_or_none()
            if auth_session:
                await db.delete(auth_session)
                await db.flush()
        except (ValueError, TypeError):
            pass
    logger.info("User logged out", extra={"user_id": str(user.id)})
    return {"status": "ok"}
