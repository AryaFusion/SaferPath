"""add privacy-preserving analytics and experiments

Revision ID: 0016_analytics_experiments
Revises: 0015_emergency_handoff
"""
import sqlalchemy as sa
from alembic import op
from sqlalchemy.dialects import postgresql

revision = "0016_analytics_experiments"
down_revision = "0015_emergency_handoff"
branch_labels = None
depends_on = None


def upgrade():
    op.create_table("analytics_events", sa.Column("id", postgresql.UUID(as_uuid=True), primary_key=True), sa.Column("event_id", sa.String(64), nullable=False), sa.Column("event_type", sa.String(64), nullable=False), sa.Column("schema_version", sa.Integer, nullable=False), sa.Column("occurred_at", sa.DateTime(timezone=True), nullable=False), sa.Column("actor_class", sa.String(24), nullable=False), sa.Column("subject_key", sa.String(64)), sa.Column("consent_version", sa.String(64)), sa.Column("experiment_assignment_id", sa.String(64)), sa.Column("dimensions", sa.JSON, nullable=False), sa.Column("retention_until", sa.DateTime(timezone=True), nullable=False), sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.func.now()), sa.UniqueConstraint("event_id", name="uq_analytics_events_event_id"))
    op.create_index("ix_analytics_events_type_occurred", "analytics_events", ["event_type", "occurred_at"])
    op.create_index("ix_analytics_events_retention", "analytics_events", ["retention_until"])
    op.create_index("ix_analytics_events_subject_key", "analytics_events", ["subject_key"])
    op.create_table("audit_events", sa.Column("id", postgresql.UUID(as_uuid=True), primary_key=True), sa.Column("actor_key", sa.String(64), nullable=False), sa.Column("action", sa.String(64), nullable=False), sa.Column("entity_type", sa.String(64), nullable=False), sa.Column("entity_reference", sa.String(64)), sa.Column("request_id", sa.String(64)), sa.Column("metadata", sa.JSON, nullable=False), sa.Column("retention_until", sa.DateTime(timezone=True), nullable=False), sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.func.now()))
    op.create_index("ix_audit_events_action_created", "audit_events", ["action", "created_at"])
    op.create_table("experiments", sa.Column("key", sa.String(64), primary_key=True), sa.Column("version", sa.Integer, primary_key=True), sa.Column("status", sa.String(16), nullable=False), sa.Column("starts_at", sa.DateTime(timezone=True)), sa.Column("ends_at", sa.DateTime(timezone=True)), sa.Column("owner_key", sa.String(64), nullable=False), sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.func.now()), sa.Column("updated_at", sa.DateTime(timezone=True), server_default=sa.func.now()))
    op.create_table("experiment_variants", sa.Column("id", postgresql.UUID(as_uuid=True), primary_key=True), sa.Column("experiment_key", sa.String(64), nullable=False), sa.Column("experiment_version", sa.Integer, nullable=False), sa.Column("key", sa.String(64), nullable=False), sa.Column("weight", sa.Integer, nullable=False), sa.Column("config", sa.JSON, nullable=False), sa.Column("active", sa.Boolean, nullable=False), sa.UniqueConstraint("experiment_key", "experiment_version", "key", name="uq_experiment_variant"))
    op.create_table("experiment_assignments", sa.Column("id", postgresql.UUID(as_uuid=True), primary_key=True), sa.Column("experiment_key", sa.String(64), nullable=False), sa.Column("experiment_version", sa.Integer, nullable=False), sa.Column("subject_key", sa.String(64), nullable=False), sa.Column("variant_key", sa.String(64), nullable=False), sa.Column("assigned_at", sa.DateTime(timezone=True), nullable=False), sa.Column("expires_at", sa.DateTime(timezone=True)), sa.UniqueConstraint("experiment_key", "experiment_version", "subject_key", name="uq_experiment_assignment_scope"))


def downgrade():
    op.drop_table("experiment_assignments")
    op.drop_table("experiment_variants")
    op.drop_table("experiments")
    op.drop_table("audit_events")
    op.drop_table("analytics_events")
