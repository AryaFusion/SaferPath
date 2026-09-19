"""persist context coverage and evaluation time

Revision ID: 0006_context_coverage
Revises: 0005_osm_signal_geometry
"""

import sqlalchemy as sa
from alembic import op

revision = "0006_context_coverage"
down_revision = "0005_osm_signal_geometry"
branch_labels = None
depends_on = None


def upgrade() -> None:
    op.add_column(
        "context_versions",
        sa.Column(
            "coverage",
            sa.String(length=16),
            nullable=False,
            server_default="UNKNOWN",
        ),
    )
    op.add_column(
        "context_versions",
        sa.Column("evaluated_at", sa.DateTime(timezone=True), server_default=sa.func.now()),
    )


def downgrade() -> None:
    op.drop_column("context_versions", "evaluated_at")
    op.drop_column("context_versions", "coverage")
