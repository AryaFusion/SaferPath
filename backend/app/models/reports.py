import uuid
from datetime import datetime

from sqlalchemy import DateTime, ForeignKey, Index, String, UniqueConstraint, func
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import Mapped, mapped_column

from app.db.base import Base
from app.db.geometry import Geometry


class IncidentReport(Base):
    __tablename__ = "incident_reports"
    __table_args__ = (
        UniqueConstraint("idempotency_key", name="uq_incident_reports_idempotency_key"),
        Index("ix_incident_reports_status", "moderation_status"),
        Index("ix_incident_reports_expiry", "expires_at"),
        Index("ix_incident_reports_observed", "observed_at"),
        Index("ix_incident_reports_segment", "route_segment_id"),
        Index("ix_incident_reports_intent", "publication_intent"),
    )

    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    public_reference: Mapped[str] = mapped_column(String(40), unique=True, nullable=False)
    reporter_session_id: Mapped[str] = mapped_column(String(128), nullable=False, index=True)
    route_segment_id: Mapped[uuid.UUID | None] = mapped_column(
        ForeignKey("route_segments.id", ondelete="SET NULL"), nullable=True
    )
    coarse_area: Mapped[str | None] = mapped_column(String(32))
    coarse_geometry: Mapped[str | None] = mapped_column(Geometry("POINT", srid=4326))
    category: Mapped[str] = mapped_column(String(40), nullable=False)
    observed_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), nullable=False)
    submitted_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), nullable=False)
    publication_intent: Mapped[str] = mapped_column(String(32), nullable=False)
    moderation_status: Mapped[str] = mapped_column(String(40), nullable=False, index=True)
    idempotency_key: Mapped[str] = mapped_column(String(255), nullable=False)
    request_fingerprint: Mapped[str] = mapped_column(String(64), nullable=False)
    expires_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), nullable=False, index=True
    )
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now())
    updated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now(), onupdate=func.now()
    )


class ReportModerationAction(Base):
    __tablename__ = "report_moderation_actions"
    __table_args__ = (Index("ix_report_moderation_actions_report", "report_id", "created_at"),)

    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    report_id: Mapped[uuid.UUID] = mapped_column(
        ForeignKey("incident_reports.id", ondelete="CASCADE"), nullable=False
    )
    previous_status: Mapped[str] = mapped_column(String(40), nullable=False)
    new_status: Mapped[str] = mapped_column(String(40), nullable=False)
    reason_code: Mapped[str] = mapped_column(String(64), nullable=False)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now())


class ReportRelationship(Base):
    __tablename__ = "report_relationships"
    __table_args__ = (
        UniqueConstraint("report_a_id", "report_b_id", name="uq_report_relationship_pair"),
        Index("ix_report_relationships_type", "relationship_type"),
    )
    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    report_a_id: Mapped[uuid.UUID] = mapped_column(
        ForeignKey("incident_reports.id", ondelete="CASCADE"), nullable=False
    )
    report_b_id: Mapped[uuid.UUID] = mapped_column(
        ForeignKey("incident_reports.id", ondelete="CASCADE"), nullable=False
    )
    relationship_type: Mapped[str] = mapped_column(String(16), nullable=False)
    reason_code: Mapped[str] = mapped_column(String(64), nullable=False)
    rule_version: Mapped[str] = mapped_column(String(16), nullable=False, default="1")
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now())


class ReportSegmentAssociation(Base):
    __tablename__ = "report_segment_associations"
    __table_args__ = (
        UniqueConstraint("report_id", "route_segment_id", name="uq_report_segment_association"),
        Index("ix_report_segment_associations_segment", "route_segment_id"),
    )
    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    report_id: Mapped[uuid.UUID] = mapped_column(
        ForeignKey("incident_reports.id", ondelete="CASCADE"), nullable=False
    )
    route_segment_id: Mapped[uuid.UUID] = mapped_column(
        ForeignKey("route_segments.id", ondelete="CASCADE"), nullable=False
    )
    relationship: Mapped[str] = mapped_column(String(24), nullable=False)
    strength: Mapped[str] = mapped_column(String(24), nullable=False)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now())


class ReportEvidence(Base):
    __tablename__ = "report_evidence"
    __table_args__ = (
        UniqueConstraint("idempotency_key", name="uq_report_evidence_idempotency_key"),
        Index("ix_report_evidence_report", "report_id"),
        Index("ix_report_evidence_state", "upload_state"),
        Index("ix_report_evidence_retention", "retention_until"),
        Index("ix_report_evidence_access", "access_class"),
    )
    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    public_reference: Mapped[str] = mapped_column(String(40), unique=True, nullable=False)
    report_id: Mapped[uuid.UUID] = mapped_column(
        ForeignKey("incident_reports.id", ondelete="CASCADE"), nullable=False
    )
    object_reference: Mapped[str] = mapped_column(String(128), unique=True, nullable=False)
    content_type: Mapped[str] = mapped_column(String(64), nullable=False)
    size_bytes: Mapped[int] = mapped_column(nullable=False)
    upload_state: Mapped[str] = mapped_column(String(16), nullable=False)
    access_class: Mapped[str] = mapped_column(String(24), nullable=False)
    upload_token_hash: Mapped[str] = mapped_column(String(64), nullable=False)
    upload_expires_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), nullable=False)
    retention_until: Mapped[datetime] = mapped_column(DateTime(timezone=True), nullable=False)
    checksum: Mapped[str | None] = mapped_column(String(64))
    idempotency_key: Mapped[str] = mapped_column(String(255), nullable=False)
    request_fingerprint: Mapped[str] = mapped_column(String(64), nullable=False)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now())
    updated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now(), onupdate=func.now()
    )


class EvidenceAuditEvent(Base):
    __tablename__ = "evidence_audit_events"
    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    evidence_id: Mapped[uuid.UUID] = mapped_column(
        ForeignKey("report_evidence.id", ondelete="CASCADE"), nullable=False, index=True
    )
    event_type: Mapped[str] = mapped_column(String(32), nullable=False)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now())
