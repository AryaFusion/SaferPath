"""create routing comparison domain

Revision ID: 0002_routing_domain
Revises: 0001_job_runs
"""

from alembic import op

revision = "0002_routing_domain"
down_revision = "0001_job_runs"
branch_labels = None
depends_on = None


def upgrade() -> None:
    op.execute("""
        CREATE TABLE route_requests (
          id UUID PRIMARY KEY, session_id VARCHAR(128), origin geometry(POINT,4326) NOT NULL,
          destination geometry(POINT,4326) NOT NULL, timezone VARCHAR(64) NOT NULL,
          requested_local_time TIMESTAMP NOT NULL, time_mode VARCHAR(16) NOT NULL,
          travel_mode VARCHAR(24) NOT NULL, route_preference VARCHAR(24) NOT NULL,
          idempotency_key VARCHAR(255) NOT NULL UNIQUE, expires_at TIMESTAMPTZ NOT NULL,
          created_at TIMESTAMPTZ NOT NULL DEFAULT now()
        );
        CREATE INDEX ix_route_requests_session_id ON route_requests (session_id);
        CREATE INDEX ix_route_requests_expires_at ON route_requests (expires_at);
        CREATE TABLE routes (
          id UUID PRIMARY KEY, route_request_id UUID NOT NULL REFERENCES route_requests(id) ON DELETE CASCADE,
          provider VARCHAR(50) NOT NULL, provider_route_ref VARCHAR(255), sequence INTEGER NOT NULL,
          duration_seconds INTEGER NOT NULL, distance_meters INTEGER NOT NULL,
          geometry geometry(LINESTRING,4326) NOT NULL, provider_metadata JSON NOT NULL DEFAULT '{}',
          normalized_state VARCHAR(24) NOT NULL DEFAULT 'normalized', created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
          CONSTRAINT uq_routes_request_sequence UNIQUE(route_request_id, sequence)
        );
        CREATE TABLE route_segments (
          id UUID PRIMARY KEY, route_id UUID NOT NULL REFERENCES routes(id) ON DELETE CASCADE,
          canonical_id VARCHAR(64) NOT NULL, sequence INTEGER NOT NULL,
          geometry geometry(LINESTRING,4326) NOT NULL, length_meters INTEGER NOT NULL,
          travel_seconds INTEGER NOT NULL, CONSTRAINT uq_route_segments_route_sequence UNIQUE(route_id, sequence)
        );
        CREATE INDEX ix_route_segments_canonical_id ON route_segments (canonical_id);
    """)


def downgrade() -> None:
    op.execute("DROP TABLE route_segments; DROP TABLE routes; DROP TABLE route_requests;")
