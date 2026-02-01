"""Groups and membership."""
import uuid
from datetime import datetime
from sqlalchemy import String, DateTime, ForeignKey, Text, Index, text
from sqlalchemy.orm import Mapped, mapped_column, relationship
from sqlalchemy.dialects.postgresql import UUID

from app.database import Base


class Group(Base):
    __tablename__ = "groups"

    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    name: Mapped[str] = mapped_column(String(255), nullable=False)
    focus: Mapped[str] = mapped_column(String(255), nullable=False)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=datetime.utcnow)

    members: Mapped[list["GroupMember"]] = relationship("GroupMember", back_populates="group")


MEMBERSHIP_STATUS_ACTIVE = "active"
MEMBERSHIP_STATUS_COMPLETED = "completed"
MEMBERSHIP_STATUS_WITHDRAWN = "withdrawn"


class GroupMember(Base):
    __tablename__ = "group_members"

    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    group_id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), ForeignKey("groups.id"), nullable=False)
    user_id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), ForeignKey("users.id"), nullable=False)
    status: Mapped[str] = mapped_column(String(20), default=MEMBERSHIP_STATUS_ACTIVE, nullable=False)
    match_reason: Mapped[str | None] = mapped_column(Text, nullable=True)  # explainable
    joined_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=datetime.utcnow)

    group: Mapped["Group"] = relationship("Group", back_populates="members")

    __table_args__ = (
        Index(
            "group_members_user_id_active_key",
            "user_id",
            unique=True,
            postgresql_where=text("status = 'active'"),
        ),
    )
