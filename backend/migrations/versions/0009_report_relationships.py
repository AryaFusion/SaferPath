"""add report relationships and coarse associations

Revision ID: 0009_report_relationships
Revises: 0008_report_moderation_actions
"""
import sqlalchemy as sa
from alembic import op
from sqlalchemy.dialects import postgresql

revision = "0009_report_relationships"
down_revision = "0008_report_moderation_actions"
branch_labels = None
depends_on = None

def upgrade() -> None:
    op.execute("ALTER TABLE incident_reports ADD COLUMN coarse_geometry geometry(POINT,4326)")
    op.create_table("report_relationships", sa.Column("id", postgresql.UUID(as_uuid=True), primary_key=True), sa.Column("report_a_id", postgresql.UUID(as_uuid=True), sa.ForeignKey("incident_reports.id", ondelete="CASCADE"), nullable=False), sa.Column("report_b_id", postgresql.UUID(as_uuid=True), sa.ForeignKey("incident_reports.id", ondelete="CASCADE"), nullable=False), sa.Column("relationship_type", sa.String(16), nullable=False), sa.Column("reason_code", sa.String(64), nullable=False), sa.Column("rule_version", sa.String(16), nullable=False), sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.func.now()), sa.UniqueConstraint("report_a_id", "report_b_id", name="uq_report_relationship_pair"))
    op.create_index("ix_report_relationships_type", "report_relationships", ["relationship_type"])
    op.create_table("report_segment_associations", sa.Column("id", postgresql.UUID(as_uuid=True), primary_key=True), sa.Column("report_id", postgresql.UUID(as_uuid=True), sa.ForeignKey("incident_reports.id", ondelete="CASCADE"), nullable=False), sa.Column("route_segment_id", postgresql.UUID(as_uuid=True), sa.ForeignKey("route_segments.id", ondelete="CASCADE"), nullable=False), sa.Column("relationship", sa.String(24), nullable=False), sa.Column("strength", sa.String(24), nullable=False), sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.func.now()), sa.UniqueConstraint("report_id", "route_segment_id", name="uq_report_segment_association"))
    op.create_index("ix_report_segment_associations_segment", "report_segment_associations", ["route_segment_id"])

def downgrade() -> None:
    op.drop_table("report_segment_associations")
    op.drop_table("report_relationships")
    op.drop_column("incident_reports", "coarse_geometry")
