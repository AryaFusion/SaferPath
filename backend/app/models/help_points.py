import uuid
from datetime import datetime

from sqlalchemy import JSON, DateTime, ForeignKey, Index, String, UniqueConstraint, func
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import Mapped, mapped_column

from app.db.base import Base
from app.db.geometry import Geometry


class HelpPoint(Base):
    __tablename__ = "help_points"
    __table_args__ = (
        UniqueConstraint("source_identity", name="uq_help_points_source_identity"),
        Index("ix_help_points_category", "category"),
        Index("ix_help_points_status", "verification_status"),
        Index("ix_help_points_expiry", "verification_expires_at"),
    )
    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    public_reference: Mapped[str] = mapped_column(String(40), nullable=False, unique=True)
    source_identity: Mapped[str] = mapped_column(String(64), nullable=False)
    partner_reference: Mapped[str | None] = mapped_column(String(64))
    category: Mapped[str] = mapped_column(String(40), nullable=False)
    geometry: Mapped[str] = mapped_column(Geometry("POINT", srid=4326), nullable=False)
    public_contact: Mapped[str | None] = mapped_column(String(255))
    operating_hours: Mapped[dict | None] = mapped_column(JSON)
    accessibility: Mapped[dict] = mapped_column(JSON, nullable=False, default=dict)
    verification_status: Mapped[str] = mapped_column(String(16), nullable=False)
    verification_source: Mapped[str | None] = mapped_column(String(64))
    last_verified_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True))
    verification_expires_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True))
    provenance: Mapped[str] = mapped_column(String(64), nullable=False)
    sponsor_disclosure: Mapped[str | None] = mapped_column(String(120))
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now())
    updated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now(), onupdate=func.now()
    )


class HelpPointVerification(Base):
    __tablename__ = "help_point_verifications"
    __table_args__ = (Index("ix_help_point_verifications_point", "help_point_id", "created_at"),)
    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    help_point_id: Mapped[uuid.UUID] = mapped_column(
        ForeignKey("help_points.id", ondelete="CASCADE"), nullable=False
    )
    previous_status: Mapped[str] = mapped_column(String(16), nullable=False)
    new_status: Mapped[str] = mapped_column(String(16), nullable=False)
    source: Mapped[str] = mapped_column(String(64), nullable=False)
    verified_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True))
    expires_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True))
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now())
