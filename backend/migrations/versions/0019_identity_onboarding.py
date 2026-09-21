"""add progressive identity onboarding records

Revision ID: 0019_identity_onboarding
Revises: 0018_identity_tenants
"""
import sqlalchemy as sa
from alembic import op
from sqlalchemy.dialects import postgresql

revision = "0019_identity_onboarding"
down_revision = "0018_identity_tenants"
branch_labels = None
depends_on = None


def upgrade():
    op.create_table("user_profiles", sa.Column("user_id", postgresql.UUID(as_uuid=True), sa.ForeignKey("users.id", ondelete="CASCADE"), primary_key=True), sa.Column("display_name", sa.String(80)), sa.Column("traveller_type", sa.String(32)), sa.Column("language", sa.String(16)), sa.Column("accessibility_preferences", sa.JSON(), nullable=False), sa.Column("profile_data", sa.JSON(), nullable=False), sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.func.now()), sa.Column("updated_at", sa.DateTime(timezone=True), server_default=sa.func.now()))
    op.create_table("notification_preferences", sa.Column("user_id", postgresql.UUID(as_uuid=True), sa.ForeignKey("users.id", ondelete="CASCADE"), primary_key=True), sa.Column("preferences", sa.JSON(), nullable=False), sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.func.now()), sa.Column("updated_at", sa.DateTime(timezone=True), server_default=sa.func.now()))
    op.create_table("consent_records", sa.Column("id", postgresql.UUID(as_uuid=True), primary_key=True), sa.Column("user_id", postgresql.UUID(as_uuid=True), sa.ForeignKey("users.id", ondelete="CASCADE"), nullable=False), sa.Column("purpose", sa.String(64), nullable=False), sa.Column("scope", sa.JSON(), nullable=False), sa.Column("policy_version", sa.String(64), nullable=False), sa.Column("granted", sa.Boolean(), nullable=False), sa.Column("actor", sa.String(32), nullable=False), sa.Column("audit_reference", sa.String(64)), sa.Column("idempotency_key", sa.String(128)), sa.Column("granted_at", sa.DateTime(timezone=True)), sa.Column("withdrawn_at", sa.DateTime(timezone=True)), sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.func.now()), sa.UniqueConstraint("user_id", "idempotency_key", name="uq_consent_idempotency"))
    op.create_index("ix_consent_records_user_purpose", "consent_records", ["user_id", "purpose"])


def downgrade():
    op.drop_index("ix_consent_records_user_purpose", table_name="consent_records")
    op.drop_table("consent_records")
    op.drop_table("notification_preferences")
    op.drop_table("user_profiles")
