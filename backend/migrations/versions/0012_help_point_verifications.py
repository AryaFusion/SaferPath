"""add help point verification history

Revision ID: 0012_help_point_verifications
Revises: 0011_help_points
"""
import sqlalchemy as sa
from alembic import op
from sqlalchemy.dialects import postgresql

revision = "0012_help_point_verifications"
down_revision = "0011_help_points"
branch_labels = None
depends_on = None

def upgrade() -> None:
    op.create_table("help_point_verifications", sa.Column("id", postgresql.UUID(as_uuid=True), primary_key=True), sa.Column("help_point_id", postgresql.UUID(as_uuid=True), sa.ForeignKey("help_points.id", ondelete="CASCADE"), nullable=False), sa.Column("previous_status", sa.String(16), nullable=False), sa.Column("new_status", sa.String(16), nullable=False), sa.Column("source", sa.String(64), nullable=False), sa.Column("verified_at", sa.DateTime(timezone=True)), sa.Column("expires_at", sa.DateTime(timezone=True)), sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.func.now()))
    op.create_index("ix_help_point_verifications_point", "help_point_verifications", ["help_point_id", "created_at"])

def downgrade() -> None:
    op.drop_table("help_point_verifications")
