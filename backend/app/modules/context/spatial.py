from dataclasses import dataclass

from sqlalchemy import func, select
from sqlalchemy.orm import Session

from app.core.config import Settings, get_settings
from app.models.context import SafetySignal
from app.models.routing import RouteSegment


@dataclass(frozen=True)
class SpatialMatch:
    signal_id: str
    segment_id: str
    relationship: str
    strength: str


def get_spatial_distance(signal_type: str, settings: Settings | None = None) -> int:
    cfg = settings or get_settings()
    key = signal_type.upper()
    if key in {"LIGHTING", "STREET_LAMP"}:
        return cfg.spatial_distance_street_lamp_meters
    if key == "ACTIVITY":
        return cfg.spatial_distance_activity_meters
    if key == "TRANSIT":
        return cfg.spatial_distance_transit_meters
    return cfg.spatial_distance_default_meters


def _distance(signal_type: str) -> int:
    return get_spatial_distance(signal_type)


def match_signals(db: Session, segment: RouteSegment) -> list[SpatialMatch]:
    segment_srid = db.scalar(
        select(func.ST_SRID(RouteSegment.geometry)).where(RouteSegment.id == segment.id)
    )
    if segment_srid is not None and segment_srid != 4326:
        raise ValueError(f"RouteSegment SRID {segment_srid} does not match expected 4326")

    results = []
    rows = db.execute(
        select(
            SafetySignal.id,
            SafetySignal.signal_type,
            func.GeometryType(SafetySignal.geometry),
        )
        .where(
            SafetySignal.geometry.is_not(None),
            func.ST_SRID(SafetySignal.geometry) == 4326,
        )
        .order_by(SafetySignal.id)
    ).all()

    for signal_id, signal_type, geometry_type in rows:
        if geometry_type == "POINT":
            relevant = db.scalar(
                select(
                    func.ST_DWithin(
                        func.geography(SafetySignal.geometry),
                        func.geography(RouteSegment.geometry),
                        _distance(signal_type),
                    )
                )
                .select_from(SafetySignal)
                .join(RouteSegment, RouteSegment.id == segment.id)
                .where(SafetySignal.id == signal_id)
            )
            if relevant:
                results.append(
                    SpatialMatch(str(signal_id), str(segment.id), "PROXIMITY", "STRONG_PROXIMITY")
                )
        else:
            relevant = db.scalar(
                select(func.ST_Intersects(SafetySignal.geometry, RouteSegment.geometry))
                .select_from(SafetySignal)
                .join(RouteSegment, RouteSegment.id == segment.id)
                .where(SafetySignal.id == signal_id)
            )
            if relevant:
                results.append(
                    SpatialMatch(
                        str(signal_id), str(segment.id), "INTERSECTION", "EXACT_INTERSECTION"
                    )
                )

    results.sort(key=lambda match: (match.signal_id, match.segment_id))
    return results
