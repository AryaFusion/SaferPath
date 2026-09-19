"""add trusted contacts, sharing grants, deviations, and notifications

Revision ID: 0014_sharing_deviations
Revises: 0013_active_trips
"""
import sqlalchemy as sa
from alembic import op
from sqlalchemy.dialects import postgresql

revision = "0014_sharing_deviations"
down_revision = "0013_active_trips"
branch_labels = None
depends_on = None


def upgrade() -> None:
    op.create_table(
        "trusted_contacts",
        sa.Column("id", postgresql.UUID(as_uuid=True), primary_key=True),
        sa.Column("public_reference", sa.String(64), nullable=False, unique=True),
        sa.Column("owner_session_id", sa.String(128), nullable=False),
        sa.Column("contact_reference", sa.String(128), nullable=False),
        sa.Column("display_name", sa.String(128), nullable=False),
        sa.Column("relationship_label", sa.String(64), nullable=False),
        sa.Column("verification_status", sa.String(24), nullable=False, server_default="PENDING"),
        sa.Column("verification_token_hash", sa.String(64), nullable=True),
        sa.Column("verification_expires_at", sa.DateTime(timezone=True), nullable=True),
        sa.Column("verified_at", sa.DateTime(timezone=True), nullable=True),
        sa.Column("revoked_at", sa.DateTime(timezone=True), nullable=True),
        sa.Column("created_at", sa.DateTime(timezone=True), nullable=False, server_default=sa.func.now()),
        sa.Column("updated_at", sa.DateTime(timezone=True), nullable=False, server_default=sa.func.now()),
        sa.UniqueConstraint("owner_session_id", "contact_reference", name="uq_trusted_contacts_owner_ref"),
    )
    op.create_index("ix_trusted_contacts_public_reference", "trusted_contacts", ["public_reference"])
    op.create_index("ix_trusted_contacts_owner_session_id", "trusted_contacts", ["owner_session_id"])
    op.create_index("ix_trusted_contacts_owner_status", "trusted_contacts", ["owner_session_id", "verification_status"])
    op.create_index("ix_trusted_contacts_token_hash", "trusted_contacts", ["verification_token_hash"])

    op.create_table(
        "sharing_grants",
        sa.Column("id", postgresql.UUID(as_uuid=True), primary_key=True),
        sa.Column("public_reference", sa.String(64), nullable=False, unique=True),
        sa.Column("trip_id", postgresql.UUID(as_uuid=True), sa.ForeignKey("trip_sessions.id", ondelete="CASCADE"), nullable=False),
        sa.Column("contact_id", postgresql.UUID(as_uuid=True), sa.ForeignKey("trusted_contacts.id", ondelete="CASCADE"), nullable=False),
        sa.Column("scope", sa.String(24), nullable=False, server_default="STATUS_ONLY"),
        sa.Column("token_hash", sa.String(64), nullable=False, unique=True),
        sa.Column("status", sa.String(24), nullable=False, server_default="ACTIVE"),
        sa.Column("issued_at", sa.DateTime(timezone=True), nullable=False),
        sa.Column("expires_at", sa.DateTime(timezone=True), nullable=False),
        sa.Column("revoked_at", sa.DateTime(timezone=True), nullable=True),
        sa.Column("last_accessed_at", sa.DateTime(timezone=True), nullable=True),
        sa.Column("created_at", sa.DateTime(timezone=True), nullable=False, server_default=sa.func.now()),
        sa.Column("updated_at", sa.DateTime(timezone=True), nullable=False, server_default=sa.func.now()),
        sa.UniqueConstraint("trip_id", "contact_id", name="uq_sharing_grants_trip_contact"),
    )
    op.create_index("ix_sharing_grants_public_reference", "sharing_grants", ["public_reference"])
    op.create_index("ix_sharing_grants_trip_id", "sharing_grants", ["trip_id"])
    op.create_index("ix_sharing_grants_contact_id", "sharing_grants", ["contact_id"])
    op.create_index("ix_sharing_grants_token_hash", "sharing_grants", ["token_hash"])
    op.create_index("ix_sharing_grants_status_expires", "sharing_grants", ["status", "expires_at"])
    op.create_index("ix_sharing_grants_expires_at", "sharing_grants", ["expires_at"])

    op.create_table(
        "trip_deviations",
        sa.Column("id", postgresql.UUID(as_uuid=True), primary_key=True),
        sa.Column("public_reference", sa.String(64), nullable=False, unique=True),
        sa.Column("trip_id", postgresql.UUID(as_uuid=True), sa.ForeignKey("trip_sessions.id", ondelete="CASCADE"), nullable=False),
        sa.Column("original_route_id", postgresql.UUID(as_uuid=True), sa.ForeignKey("routes.id", ondelete="RESTRICT"), nullable=False),
        sa.Column("alternate_route_id", postgresql.UUID(as_uuid=True), sa.ForeignKey("routes.id", ondelete="SET NULL"), nullable=True),
        sa.Column("status", sa.String(40), nullable=False, server_default="DEVIATION_PENDING_CONFIRMATION"),
        sa.Column("detected_at", sa.DateTime(timezone=True), nullable=False),
        sa.Column("user_response_at", sa.DateTime(timezone=True), nullable=True),
        sa.Column("user_response", sa.String(32), nullable=True),
        sa.Column("deviation_event_id", sa.String(64), nullable=True),
        sa.Column("context_version_id", postgresql.UUID(as_uuid=True), sa.ForeignKey("context_versions.id", ondelete="SET NULL"), nullable=True),
        sa.Column("context_band", sa.String(40), nullable=True),
        sa.Column("confidence", sa.String(16), nullable=True),
        sa.Column("explanation", postgresql.JSONB(astext_type=sa.Text()), nullable=True),
        sa.Column("retention_until", sa.DateTime(timezone=True), nullable=False),
        sa.Column("created_at", sa.DateTime(timezone=True), nullable=False, server_default=sa.func.now()),
        sa.Column("updated_at", sa.DateTime(timezone=True), nullable=False, server_default=sa.func.now()),
    )
    op.create_index("ix_trip_deviations_public_reference", "trip_deviations", ["public_reference"])
    op.create_index("ix_trip_deviations_trip_id", "trip_deviations", ["trip_id"])
    op.create_index("ix_trip_deviations_trip_status", "trip_deviations", ["trip_id", "status"])
    op.create_index("ix_trip_deviations_retention", "trip_deviations", ["retention_until"])

    op.create_table(
        "notification_dispatches",
        sa.Column("id", postgresql.UUID(as_uuid=True), primary_key=True),
        sa.Column("public_reference", sa.String(64), nullable=False, unique=True),
        sa.Column("trip_id", postgresql.UUID(as_uuid=True), sa.ForeignKey("trip_sessions.id", ondelete="CASCADE"), nullable=False),
        sa.Column("contact_id", postgresql.UUID(as_uuid=True), sa.ForeignKey("trusted_contacts.id", ondelete="CASCADE"), nullable=False),
        sa.Column("recipient_reference", sa.String(128), nullable=False),
        sa.Column("event_type", sa.String(64), nullable=False),
        sa.Column("channel", sa.String(32), nullable=False, server_default="IN_APP"),
        sa.Column("status", sa.String(24), nullable=False, server_default="QUEUED"),
        sa.Column("idempotency_key", sa.String(255), nullable=False),
        sa.Column("payload", postgresql.JSONB(astext_type=sa.Text()), nullable=False, server_default=sa.text("'{}'::jsonb")),
        sa.Column("attempts", sa.Integer(), nullable=False, server_default="0"),
        sa.Column("error_message", sa.String(255), nullable=True),
        sa.Column("dispatched_at", sa.DateTime(timezone=True), nullable=True),
        sa.Column("created_at", sa.DateTime(timezone=True), nullable=False, server_default=sa.func.now()),
        sa.Column("updated_at", sa.DateTime(timezone=True), nullable=False, server_default=sa.func.now()),
        sa.UniqueConstraint("idempotency_key", name="uq_notification_dispatches_key"),
    )
    op.create_index("ix_notification_dispatches_public_reference", "notification_dispatches", ["public_reference"])
    op.create_index("ix_notification_dispatches_trip_id", "notification_dispatches", ["trip_id"])
    op.create_index("ix_notification_dispatches_trip_status", "notification_dispatches", ["trip_id", "status"])


def downgrade() -> None:
    op.drop_table("notification_dispatches")
    op.drop_table("trip_deviations")
    op.drop_table("sharing_grants")
    op.drop_table("trusted_contacts")

