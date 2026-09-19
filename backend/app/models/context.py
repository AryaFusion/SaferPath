import uuid
from datetime import datetime

from sqlalchemy import JSON, DateTime, ForeignKey, Index, String, func
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import Mapped, mapped_column

from app.db.base import Base
from app.db.geometry import Geometry


class SafetySignal(Base):
    __tablename__ = "safety_signals"
    __table_args__ = (
        Index("ix_safety_signals_segment_type", "route_segment_id", "signal_type"),
        Index("ix_safety_signals_source_observed", "source_type", "observed_at"),
        Index("ix_safety_signals_expires_at", "expires_at"),
    )

    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    route_segment_id: Mapped[uuid.UUID | None] = mapped_column(
        ForeignKey("route_segments.id", ondelete="CASCADE"), nullable=True
    )
    signal_type: Mapped[str] = mapped_column(String(40), nullable=False)
    normalized_value: Mapped[dict] = mapped_column(JSON, nullable=False)
    source_type: Mapped[str] = mapped_column(String(40), nullable=False)
    source_reference: Mapped[str | None] = mapped_column(String(255))
    source_identity: Mapped[str | None] = mapped_column(String(64), unique=True)
    geometry: Mapped[str | None] = mapped_column(Geometry("GEOMETRY", srid=4326))
    observed_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), nullable=False)
    expires_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True))
    confidence: Mapped[str] = mapped_column(String(16), nullable=False)
    verification_status: Mapped[str] = mapped_column(String(24), nullable=False)
    privacy_class: Mapped[str] = mapped_column(String(24), nullable=False, default="public")
    provenance: Mapped[dict] = mapped_column(JSON, nullable=False, default=dict)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now())
    updated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now(), onupdate=func.now()
    )


class ContextVersion(Base):
    __tablename__ = "context_versions"

    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    route_id: Mapped[uuid.UUID] = mapped_column(
        ForeignKey("routes.id", ondelete="CASCADE"), nullable=False, index=True
    )
    model_version: Mapped[str] = mapped_column(String(32), nullable=False)
    feature_version: Mapped[str] = mapped_column(String(32), nullable=False)
    rule_version: Mapped[str] = mapped_column(String(32), nullable=False)
    requested_time: Mapped[datetime] = mapped_column(DateTime(timezone=False), nullable=False)
    context_band: Mapped[str] = mapped_column(String(40), nullable=False)
    confidence: Mapped[str] = mapped_column(String(16), nullable=False)
    coverage: Mapped[str] = mapped_column(String(16), nullable=False, server_default="UNKNOWN")
    explanation: Mapped[dict] = mapped_column(JSON, nullable=False)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now())
    evaluated_at: Mapped[datetime | None] = mapped_column(
        DateTime(timezone=True), server_default=func.now()
    )
