"""add OSM source identity and geometry

Revision ID: 0005_osm_signal_geometry
Revises: 0004_safety_context
"""
import sqlalchemy as sa
from alembic import op

revision = "0005_osm_signal_geometry"
down_revision = "0004_safety_context"
branch_labels = None
depends_on = None

def upgrade() -> None:
    op.add_column("safety_signals", sa.Column("source_identity", sa.String(64)))
    op.execute("ALTER TABLE safety_signals ADD COLUMN geometry geometry(GEOMETRY,4326)")
    op.create_unique_constraint("uq_safety_signals_source_identity", "safety_signals", ["source_identity"])
    op.execute("CREATE INDEX ix_safety_signals_geometry_gist ON safety_signals USING GIST (geometry)")

def downgrade() -> None:
    op.drop_constraint("uq_safety_signals_source_identity", "safety_signals")
    op.drop_column("safety_signals", "geometry")
    op.drop_column("safety_signals", "source_identity")
