"""Async database engine and session."""
import logging
import sys
import traceback

from fastapi import HTTPException
from sqlalchemy.ext.asyncio import AsyncSession, async_sessionmaker, create_async_engine
from sqlalchemy.orm import DeclarativeBase

from app.config import settings

logger = logging.getLogger(__name__)

engine = create_async_engine(
    settings.database_url,
    echo=settings.debug,
    pool_pre_ping=True,
)

AsyncSessionLocal = async_sessionmaker(
    engine,
    class_=AsyncSession,
    expire_on_commit=False,
    autocommit=False,
    autoflush=False,
)


class Base(DeclarativeBase):
    """Declarative base for models."""
    pass


async def get_db():
    """Dependency: yield async DB session."""
    try:
        async with AsyncSessionLocal() as session:
            try:
                yield session
                await session.commit()
            except HTTPException:
                await session.rollback()
                raise
            except Exception:
                await session.rollback()
                logger.exception("Database session rollback")
                raise
            finally:
                await session.close()
    except HTTPException:
        raise
    except Exception as e:
        traceback.print_exc(file=sys.stderr)
        sys.stderr.flush()
        logger.exception("get_db failed (e.g. DB connection): %s", e)
        raise


async def init_db():
    """Create all tables."""
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)
    logger.info("Database tables created")
