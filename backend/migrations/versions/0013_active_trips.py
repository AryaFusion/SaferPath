"""add active trip sessions and events

Revision ID: 0013_active_trips
Revises: 0012_help_point_verifications
"""
import sqlalchemy as sa
from alembic import op
from sqlalchemy.dialects import postgresql

revision = "0013_active_trips"
down_revision = "0012_help_point_verifications"
branch_labels = None
depends_on = None


def upgrade() -> None:
    op.create_table(
        "trip_sessions",
        sa.Column("id", postgresql.UUID(as_uuid=True), primary_key=True),
        sa.Column("public_reference", sa.String(64), nullable=False, unique=True),
        sa.Column("owner_session_id", sa.String(128), nullable=False),
        sa.Column("route_id", postgresql.UUID(as_uuid=True), sa.ForeignKey("routes.id", ondelete="RESTRICT"), nullable=False),
        sa.Column("planned_departure", sa.DateTime(timezone=True)),
        sa.Column("planned_arrival", sa.DateTime(timezone=True), nullable=False),
        sa.Column("travel_mode", sa.String(24), nullable=False),
        sa.Column("consent_reference", sa.String(128), nullable=False),
        sa.Column("consent_version", sa.String(64), nullable=False),
        sa.Column("consent_active", sa.Boolean(), nullable=False, server_default=sa.true()),
        sa.Column("sharing_scope", sa.String(16), nullable=False, server_default="STATUS_ONLY"),
        sa.Column("status", sa.String(24), nullable=False, server_default="PLANNED"),
        sa.Column("started_at", sa.DateTime(timezone=True)),
        sa.Column("last_update_at", sa.DateTime(timezone=True), nullable=False, server_default=sa.func.now()),
        sa.Column("ended_at", sa.DateTime(timezone=True)),
        sa.Column("retention_until", sa.DateTime(timezone=True), nullable=False),
        sa.Column("created_at", sa.DateTime(timezone=True), nullable=False, server_default=sa.func.now()),
        sa.Column("updated_at", sa.DateTime(timezone=True), nullable=False, server_default=sa.func.now()),
    )
    op.create_index("ix_trip_sessions_public_reference", "trip_sessions", ["public_reference"])
    op.create_index("ix_trip_sessions_owner_status", "trip_sessions", ["owner_session_id", "status"])
    op.create_index("ix_trip_sessions_retention", "trip_sessions", ["retention_until"])
    op.create_table(
        "trip_events",
        sa.Column("id", postgresql.UUID(as_uuid=True), primary_key=True),
        sa.Column("trip_id", postgresql.UUID(as_uuid=True), sa.ForeignKey("trip_sessions.id", ondelete="CASCADE"), nullable=False),
        sa.Column("event_id", sa.String(64), nullable=False),
        sa.Column("event_type", sa.String(48), nullable=False),
        sa.Column("actor", sa.String(32), nullable=False),
        sa.Column("occurred_at", sa.DateTime(timezone=True), nullable=False),
        sa.Column("confidence", sa.String(16)),
        sa.Column("consent_reference", sa.String(128)),
        sa.Column("consent_version", sa.String(64)),
        sa.Column("idempotency_key", sa.String(255), nullable=False),
        sa.Column("request_fingerprint", sa.String(64), nullable=False),
        sa.Column("redacted_payload", postgresql.JSONB(astext_type=sa.Text()), nullable=False, server_default=sa.text("'{}'::jsonb")),
        sa.Column("retention_until", sa.DateTime(timezone=True), nullable=False),
        sa.Column("created_at", sa.DateTime(timezone=True), nullable=False, server_default=sa.func.now()),
        sa.UniqueConstraint("trip_id", "event_id", name="uq_trip_events_trip_event_id"),
        sa.UniqueConstraint("trip_id", "idempotency_key", name="uq_trip_events_trip_key"),
    )
    op.create_index("ix_trip_events_trip_created", "trip_events", ["trip_id", "created_at"])
    op.create_index("ix_trip_events_retention", "trip_events", ["retention_until"])


def downgrade() -> None:
    op.drop_table("trip_events")
    op.drop_table("trip_sessions")
