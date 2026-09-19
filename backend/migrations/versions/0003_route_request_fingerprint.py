"""add route request idempotency fingerprint

Revision ID: 0003_route_request_fingerprint
Revises: 0002_routing_domain
"""

import sqlalchemy as sa
from alembic import op

revision = "0003_route_request_fingerprint"
down_revision = "0002_routing_domain"
branch_labels = None
depends_on = None


def upgrade() -> None:
    op.add_column("route_requests", sa.Column("request_fingerprint", sa.String(length=64), nullable=True))
    op.execute("UPDATE route_requests SET request_fingerprint = repeat('0', 64) WHERE request_fingerprint IS NULL")
    op.alter_column("route_requests", "request_fingerprint", nullable=False)


def downgrade() -> None:
    op.drop_column("route_requests", "request_fingerprint")
