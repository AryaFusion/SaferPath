"""add help points

Revision ID: 0011_help_points
Revises: 0010_report_evidence
"""
import sqlalchemy as sa
from alembic import op
from sqlalchemy.dialects import postgresql

revision = "0011_help_points"
down_revision = "0010_report_evidence"
branch_labels = None
depends_on = None

def upgrade() -> None:
    op.create_table("help_points", sa.Column("id", postgresql.UUID(as_uuid=True), primary_key=True), sa.Column("public_reference", sa.String(40), nullable=False, unique=True), sa.Column("source_identity", sa.String(64), nullable=False), sa.Column("partner_reference", sa.String(64)), sa.Column("category", sa.String(40), nullable=False), sa.Column("geometry", sa.Text(), nullable=False), sa.Column("public_contact", sa.String(255)), sa.Column("operating_hours", sa.JSON()), sa.Column("accessibility", sa.JSON(), nullable=False), sa.Column("verification_status", sa.String(16), nullable=False), sa.Column("verification_source", sa.String(64)), sa.Column("last_verified_at", sa.DateTime(timezone=True)), sa.Column("verification_expires_at", sa.DateTime(timezone=True)), sa.Column("provenance", sa.String(64), nullable=False), sa.Column("sponsor_disclosure", sa.String(120)), sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.func.now()), sa.Column("updated_at", sa.DateTime(timezone=True), server_default=sa.func.now(), onupdate=sa.func.now()), sa.UniqueConstraint("source_identity", name="uq_help_points_source_identity"))
    op.execute("ALTER TABLE help_points ALTER COLUMN geometry TYPE geometry(POINT,4326) USING geometry::geometry")
    op.execute("CREATE INDEX ix_help_points_geometry_gist ON help_points USING GIST (geometry)")
    for name, cols in (("ix_help_points_category", ["category"]), ("ix_help_points_status", ["verification_status"]), ("ix_help_points_expiry", ["verification_expires_at"])):
        op.create_index(name, "help_points", cols)

def downgrade() -> None:
    op.drop_table("help_points")
