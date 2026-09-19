"""create incident report foundation

Revision ID: 0007_incident_reports
Revises: 0006_context_coverage
"""

import sqlalchemy as sa
from alembic import op
from sqlalchemy.dialects import postgresql

revision = "0007_incident_reports"
down_revision = "0006_context_coverage"
branch_labels = None
depends_on = None


def upgrade() -> None:
    op.create_table(
        "incident_reports",
        sa.Column("id", postgresql.UUID(as_uuid=True), primary_key=True),
        sa.Column("public_reference", sa.String(40), nullable=False, unique=True),
        sa.Column("reporter_session_id", sa.String(128), nullable=False),
        sa.Column("route_segment_id", postgresql.UUID(as_uuid=True), sa.ForeignKey("route_segments.id", ondelete="SET NULL")),
        sa.Column("coarse_area", sa.String(32)),
        sa.Column("category", sa.String(40), nullable=False),
        sa.Column("observed_at", sa.DateTime(timezone=True), nullable=False),
        sa.Column("submitted_at", sa.DateTime(timezone=True), nullable=False),
        sa.Column("publication_intent", sa.String(32), nullable=False),
        sa.Column("moderation_status", sa.String(40), nullable=False),
        sa.Column("idempotency_key", sa.String(255), nullable=False),
        sa.Column("request_fingerprint", sa.String(64), nullable=False),
        sa.Column("expires_at", sa.DateTime(timezone=True), nullable=False),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.func.now()),
        sa.Column("updated_at", sa.DateTime(timezone=True), server_default=sa.func.now(), onupdate=sa.func.now()),
        sa.UniqueConstraint("idempotency_key", name="uq_incident_reports_idempotency_key"),
    )
    for name, columns in (
        ("ix_incident_reports_status", ["moderation_status"]),
        ("ix_incident_reports_expiry", ["expires_at"]),
        ("ix_incident_reports_observed", ["observed_at"]),
        ("ix_incident_reports_segment", ["route_segment_id"]),
        ("ix_incident_reports_intent", ["publication_intent"]),
        ("ix_incident_reports_reporter_session_id", ["reporter_session_id"]),
    ):
        op.create_index(name, "incident_reports", columns)


def downgrade() -> None:
    op.drop_table("incident_reports")
