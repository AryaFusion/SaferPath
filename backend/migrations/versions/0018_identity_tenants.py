"""add identity and tenant foundations

Revision ID: 0018_identity_tenants
Revises: 0017_analytics_integrity
"""
import sqlalchemy as sa
from alembic import op
from sqlalchemy.dialects import postgresql

revision = "0018_identity_tenants"
down_revision = "0017_analytics_integrity"
branch_labels = None
depends_on = None


def upgrade():
    op.create_table("users", sa.Column("id", postgresql.UUID(as_uuid=True), primary_key=True), sa.Column("public_id", sa.String(64), nullable=False, unique=True), sa.Column("email_key", sa.String(64), nullable=False, unique=True), sa.Column("status", sa.String(16), nullable=False), sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.func.now()))
    op.create_table("user_sessions", sa.Column("id", postgresql.UUID(as_uuid=True), primary_key=True), sa.Column("user_id", postgresql.UUID(as_uuid=True), sa.ForeignKey("users.id", ondelete="CASCADE"), nullable=False), sa.Column("secret_hash", sa.String(64), nullable=False, unique=True), sa.Column("expires_at", sa.DateTime(timezone=True), nullable=False), sa.Column("revoked_at", sa.DateTime(timezone=True)), sa.Column("last_seen_at", sa.DateTime(timezone=True)), sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.func.now()))
    op.create_index("ix_user_sessions_secret", "user_sessions", ["secret_hash"])
    op.create_table("authentication_codes", sa.Column("id", postgresql.UUID(as_uuid=True), primary_key=True), sa.Column("email_key", sa.String(64), nullable=False), sa.Column("code_hash", sa.String(64), nullable=False), sa.Column("expires_at", sa.DateTime(timezone=True), nullable=False), sa.Column("attempts", sa.Integer, nullable=False), sa.Column("consumed_at", sa.DateTime(timezone=True)), sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.func.now()))
    op.create_index("ix_authentication_codes_email_created", "authentication_codes", ["email_key", "created_at"])
    op.create_table("tenants", sa.Column("id", postgresql.UUID(as_uuid=True), primary_key=True), sa.Column("public_id", sa.String(64), nullable=False, unique=True), sa.Column("display_name", sa.String(128), nullable=False), sa.Column("status", sa.String(16), nullable=False), sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.func.now()))
    op.create_table("tenant_memberships", sa.Column("id", postgresql.UUID(as_uuid=True), primary_key=True), sa.Column("tenant_id", postgresql.UUID(as_uuid=True), sa.ForeignKey("tenants.id", ondelete="CASCADE"), nullable=False), sa.Column("user_id", postgresql.UUID(as_uuid=True), sa.ForeignKey("users.id", ondelete="CASCADE"), nullable=False), sa.Column("role", sa.String(24), nullable=False), sa.Column("status", sa.String(16), nullable=False), sa.Column("revoked_at", sa.DateTime(timezone=True)), sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.func.now()), sa.UniqueConstraint("tenant_id", "user_id", name="uq_tenant_member"))


def downgrade():
    op.drop_table("tenant_memberships")
    op.drop_table("tenants")
    op.drop_table("authentication_codes")
    op.drop_table("user_sessions")
    op.drop_table("users")
