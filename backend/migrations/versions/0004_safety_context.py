"""add safety context signals and versions

Revision ID: 0004_safety_context
Revises: 0003_route_request_fingerprint
"""

import sqlalchemy as sa
from alembic import op
from sqlalchemy.dialects import postgresql

revision = "0004_safety_context"
down_revision = "0003_route_request_fingerprint"
branch_labels = None
depends_on = None


def upgrade() -> None:
    op.create_table("safety_signals", sa.Column("id", postgresql.UUID(as_uuid=True), primary_key=True), sa.Column("route_segment_id", postgresql.UUID(as_uuid=True), sa.ForeignKey("route_segments.id", ondelete="CASCADE")), sa.Column("signal_type", sa.String(40), nullable=False), sa.Column("normalized_value", sa.JSON(), nullable=False), sa.Column("source_type", sa.String(40), nullable=False), sa.Column("source_reference", sa.String(255)), sa.Column("observed_at", sa.DateTime(timezone=True), nullable=False), sa.Column("expires_at", sa.DateTime(timezone=True)), sa.Column("confidence", sa.String(16), nullable=False), sa.Column("verification_status", sa.String(24), nullable=False), sa.Column("privacy_class", sa.String(24), nullable=False), sa.Column("provenance", sa.JSON(), nullable=False), sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.func.now()), sa.Column("updated_at", sa.DateTime(timezone=True), server_default=sa.func.now()))
    op.create_index("ix_safety_signals_segment_type", "safety_signals", ["route_segment_id", "signal_type"])
    op.create_index("ix_safety_signals_source_observed", "safety_signals", ["source_type", "observed_at"])
    op.create_index("ix_safety_signals_expires_at", "safety_signals", ["expires_at"])
    op.create_table("context_versions", sa.Column("id", postgresql.UUID(as_uuid=True), primary_key=True), sa.Column("route_id", postgresql.UUID(as_uuid=True), sa.ForeignKey("routes.id", ondelete="CASCADE"), nullable=False), sa.Column("model_version", sa.String(32), nullable=False), sa.Column("feature_version", sa.String(32), nullable=False), sa.Column("rule_version", sa.String(32), nullable=False), sa.Column("requested_time", sa.DateTime(), nullable=False), sa.Column("context_band", sa.String(40), nullable=False), sa.Column("confidence", sa.String(16), nullable=False), sa.Column("explanation", sa.JSON(), nullable=False), sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.func.now()))
    op.create_index("ix_context_versions_route_id", "context_versions", ["route_id"])


def downgrade() -> None:
    op.drop_table("context_versions")
    op.drop_table("safety_signals")
