"""add emergency handoffs

Revision ID: 0015_emergency_handoff
Revises: 0014_sharing_deviations
"""

import sqlalchemy as sa
from alembic import op
from sqlalchemy.dialects import postgresql

revision = "0015_emergency_handoff"
down_revision = "0014_sharing_deviations"
branch_labels = None
depends_on = None


def upgrade():
    op.create_table(
        "emergency_handoffs",
        sa.Column("id", postgresql.UUID(as_uuid=True), primary_key=True),
        sa.Column("public_reference", sa.String(64), nullable=False, unique=True),
        sa.Column(
            "trip_id",
            postgresql.UUID(as_uuid=True),
            sa.ForeignKey("trip_sessions.id", ondelete="CASCADE"),
            nullable=False,
        ),
        sa.Column("initiated_by", sa.String(128), nullable=False),
        sa.Column("handoff_type", sa.String(32), nullable=False),
        sa.Column("status", sa.String(40), nullable=False),
        sa.Column("requested_at", sa.DateTime(timezone=True), nullable=False),
        sa.Column("completed_at", sa.DateTime(timezone=True)),
        sa.Column("expires_at", sa.DateTime(timezone=True), nullable=False),
        sa.Column("consent_version", sa.String(64), nullable=False),
        sa.Column("consent_source", sa.String(64), nullable=False),
        sa.Column("provider_reference", sa.String(128)),
        sa.Column("failure_code", sa.String(64)),
        sa.Column("idempotency_key", sa.String(255), nullable=False),
        sa.Column("request_fingerprint", sa.String(64), nullable=False),
        sa.Column("retention_until", sa.DateTime(timezone=True), nullable=False),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.func.now()),
        sa.Column("updated_at", sa.DateTime(timezone=True), server_default=sa.func.now()),
        sa.UniqueConstraint("trip_id", "idempotency_key", name="uq_emergency_handoffs_trip_key"),
    )
    op.create_index(
        "ix_emergency_handoffs_trip_status", "emergency_handoffs", ["trip_id", "status"]
    )
    op.create_index("ix_emergency_handoffs_retention", "emergency_handoffs", ["retention_until"])


def downgrade():
    op.drop_table("emergency_handoffs")
