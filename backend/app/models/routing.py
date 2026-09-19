import uuid
from datetime import datetime

from sqlalchemy import JSON, DateTime, ForeignKey, Index, Integer, String, UniqueConstraint, func
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.db.base import Base
from app.db.geometry import Geometry


class RouteRequest(Base):
    __tablename__ = "route_requests"
    __table_args__ = (
        UniqueConstraint("idempotency_key", name="uq_route_requests_idempotency_key"),
    )

    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    session_id: Mapped[str | None] = mapped_column(String(128), index=True)
    origin: Mapped[str] = mapped_column(Geometry("POINT", srid=4326), nullable=False)
    destination: Mapped[str] = mapped_column(Geometry("POINT", srid=4326), nullable=False)
    timezone: Mapped[str] = mapped_column(String(64), nullable=False)
    requested_local_time: Mapped[datetime] = mapped_column(DateTime(timezone=False), nullable=False)
    time_mode: Mapped[str] = mapped_column(String(16), nullable=False)
    travel_mode: Mapped[str] = mapped_column(String(24), nullable=False)
    route_preference: Mapped[str] = mapped_column(String(24), nullable=False)
    idempotency_key: Mapped[str] = mapped_column(String(255), nullable=False)
    request_fingerprint: Mapped[str] = mapped_column(String(64), nullable=False)
    expires_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), nullable=False, index=True
    )
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now(), nullable=False
    )
    routes: Mapped[list["Route"]] = relationship(
        back_populates="route_request", cascade="all, delete-orphan"
    )


class Route(Base):
    __tablename__ = "routes"
    __table_args__ = (
        UniqueConstraint("route_request_id", "sequence", name="uq_routes_request_sequence"),
    )

    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    route_request_id: Mapped[uuid.UUID] = mapped_column(
        ForeignKey("route_requests.id", ondelete="CASCADE"), nullable=False
    )
    provider: Mapped[str] = mapped_column(String(50), nullable=False)
    provider_route_ref: Mapped[str | None] = mapped_column(String(255))
    sequence: Mapped[int] = mapped_column(Integer, nullable=False)
    duration_seconds: Mapped[int] = mapped_column(Integer, nullable=False)
    distance_meters: Mapped[int] = mapped_column(Integer, nullable=False)
    geometry: Mapped[str] = mapped_column(Geometry("LINESTRING", srid=4326), nullable=False)
    provider_metadata: Mapped[dict] = mapped_column(JSON, nullable=False, default=dict)
    normalized_state: Mapped[str] = mapped_column(String(24), nullable=False, default="normalized")
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now(), nullable=False
    )
    route_request: Mapped[RouteRequest] = relationship(back_populates="routes")
    segments: Mapped[list["RouteSegment"]] = relationship(
        back_populates="route", cascade="all, delete-orphan"
    )


class RouteSegment(Base):
    __tablename__ = "route_segments"
    __table_args__ = (
        UniqueConstraint("route_id", "sequence", name="uq_route_segments_route_sequence"),
        Index("ix_route_segments_canonical_id", "canonical_id"),
    )

    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    route_id: Mapped[uuid.UUID] = mapped_column(
        ForeignKey("routes.id", ondelete="CASCADE"), nullable=False
    )
    canonical_id: Mapped[str] = mapped_column(String(64), nullable=False)
    sequence: Mapped[int] = mapped_column(Integer, nullable=False)
    geometry: Mapped[str] = mapped_column(Geometry("LINESTRING", srid=4326), nullable=False)
    length_meters: Mapped[int] = mapped_column(Integer, nullable=False)
    travel_seconds: Mapped[int] = mapped_column(Integer, nullable=False)
    route: Mapped[Route] = relationship(back_populates="segments")
