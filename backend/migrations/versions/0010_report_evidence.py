"""add report evidence storage boundary

Revision ID: 0010_report_evidence
Revises: 0009_report_relationships
"""
import sqlalchemy as sa
from alembic import op
from sqlalchemy.dialects import postgresql

revision = "0010_report_evidence"
down_revision = "0009_report_relationships"
branch_labels = None
depends_on = None

def upgrade() -> None:
    op.create_table("report_evidence", sa.Column("id", postgresql.UUID(as_uuid=True), primary_key=True), sa.Column("public_reference", sa.String(40), nullable=False, unique=True), sa.Column("report_id", postgresql.UUID(as_uuid=True), sa.ForeignKey("incident_reports.id", ondelete="CASCADE"), nullable=False), sa.Column("object_reference", sa.String(128), nullable=False, unique=True), sa.Column("content_type", sa.String(64), nullable=False), sa.Column("size_bytes", sa.Integer(), nullable=False), sa.Column("upload_state", sa.String(16), nullable=False), sa.Column("access_class", sa.String(24), nullable=False), sa.Column("upload_token_hash", sa.String(64), nullable=False), sa.Column("upload_expires_at", sa.DateTime(timezone=True), nullable=False), sa.Column("retention_until", sa.DateTime(timezone=True), nullable=False), sa.Column("checksum", sa.String(64)), sa.Column("idempotency_key", sa.String(255), nullable=False), sa.Column("request_fingerprint", sa.String(64), nullable=False), sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.func.now()), sa.Column("updated_at", sa.DateTime(timezone=True), server_default=sa.func.now(), onupdate=sa.func.now()), sa.UniqueConstraint("idempotency_key", name="uq_report_evidence_idempotency_key"))
    indexes = (("ix_report_evidence_report", ["report_id"]), ("ix_report_evidence_state", ["upload_state"]), ("ix_report_evidence_retention", ["retention_until"]), ("ix_report_evidence_access", ["access_class"]))
    for name, cols in indexes:
        op.create_index(name, "report_evidence", cols)
    op.create_table("evidence_audit_events", sa.Column("id", postgresql.UUID(as_uuid=True), primary_key=True), sa.Column("evidence_id", postgresql.UUID(as_uuid=True), sa.ForeignKey("report_evidence.id", ondelete="CASCADE"), nullable=False), sa.Column("event_type", sa.String(32), nullable=False), sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.func.now()))
    op.create_index("ix_evidence_audit_events_evidence_id", "evidence_audit_events", ["evidence_id"])

def downgrade() -> None:
    op.drop_table("evidence_audit_events")
    op.drop_table("report_evidence")
