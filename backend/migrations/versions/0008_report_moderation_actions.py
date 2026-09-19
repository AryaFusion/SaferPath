"""add report moderation actions

Revision ID: 0008_report_moderation_actions
Revises: 0007_incident_reports
"""

import sqlalchemy as sa
from alembic import op
from sqlalchemy.dialects import postgresql

revision = "0008_report_moderation_actions"
down_revision = "0007_incident_reports"
branch_labels = None
depends_on = None

def upgrade() -> None:
    op.create_table("report_moderation_actions", sa.Column("id", postgresql.UUID(as_uuid=True), primary_key=True), sa.Column("report_id", postgresql.UUID(as_uuid=True), sa.ForeignKey("incident_reports.id", ondelete="CASCADE"), nullable=False), sa.Column("previous_status", sa.String(40), nullable=False), sa.Column("new_status", sa.String(40), nullable=False), sa.Column("reason_code", sa.String(64), nullable=False), sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.func.now()))
    op.create_index("ix_report_moderation_actions_report", "report_moderation_actions", ["report_id", "created_at"])

def downgrade() -> None:
    op.drop_table("report_moderation_actions")
