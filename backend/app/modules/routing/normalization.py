import hashlib
import json
from dataclasses import dataclass

from app.modules.routing.provider import ProviderRoute

MAX_POINTS = 1_000


class RouteNormalizationError(ValueError):
    pass


def _coordinates(coordinates: tuple[tuple[float, float], ...]) -> tuple[tuple[float, float], ...]:
    if not 2 <= len(coordinates) <= MAX_POINTS:
        raise RouteNormalizationError("invalid geometry size")
    for longitude, latitude in coordinates:
        if not -180 <= longitude <= 180 or not -90 <= latitude <= 90:
            raise RouteNormalizationError("invalid geometry coordinate")
    normalized = tuple((round(lon, 6), round(lat, 6)) for lon, lat in coordinates)
    if len(set(normalized)) < 2:
        raise RouteNormalizationError("degenerate geometry")
    return normalized


def canonical_segment_id(coordinates: tuple[tuple[float, float], ...]) -> str:
    """SHA-256 of rounded WGS84 directed geometry, stable across providers and requests."""
    canonical = json.dumps(_coordinates(coordinates), separators=(",", ":"))
    return hashlib.sha256(canonical.encode()).hexdigest()


@dataclass(frozen=True)
class NormalizedSegment:
    canonical_id: str
    sequence: int
    coordinates: tuple[tuple[float, float], ...]
    length_meters: int
    travel_seconds: int


@dataclass(frozen=True)
class NormalizedRoute:
    reference: str
    sequence: int
    coordinates: tuple[tuple[float, float], ...]
    duration_seconds: int
    distance_meters: int
    segments: tuple[NormalizedSegment, ...]
    metadata: dict[str, str]


def normalize_route(route: ProviderRoute) -> NormalizedRoute:
    if route.duration_seconds <= 0 or route.distance_meters <= 0 or route.sequence < 1:
        raise RouteNormalizationError("invalid route metrics")
    coordinates = _coordinates(route.coordinates)
    expected = list(range(1, len(route.segments) + 1))
    if [segment.sequence for segment in route.segments] != expected:
        raise RouteNormalizationError("invalid segment ordering")
    normalized = []
    seen = set()
    for segment in route.segments:
        segment_coordinates = _coordinates(segment.coordinates)
        if segment.length_meters <= 0 or segment.travel_seconds <= 0:
            raise RouteNormalizationError("invalid segment metrics")
        identity = canonical_segment_id(segment_coordinates)
        if identity in seen:
            raise RouteNormalizationError("duplicate segments")
        seen.add(identity)
        normalized.append(
            NormalizedSegment(
                identity,
                segment.sequence,
                segment_coordinates,
                segment.length_meters,
                segment.travel_seconds,
            )
        )
    if sum(item.travel_seconds for item in normalized) != route.duration_seconds:
        raise RouteNormalizationError("segment duration does not match route")
    return NormalizedRoute(
        route.reference,
        route.sequence,
        coordinates,
        route.duration_seconds,
        route.distance_meters,
        tuple(normalized),
        route.metadata,
    )
