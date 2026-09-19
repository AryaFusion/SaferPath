from app.core.config import get_settings
from app.modules.routing.errors import RoutingFailure
from app.modules.routing.provider import (
    ProviderRoute,
    ProviderRouteRequest,
    ProviderSegment,
    RoutingProvider,
)


class FixtureRoutingProvider(RoutingProvider):
    """Bounded, deterministic Mumbai pilot geometry. It makes no contextual or safety claim."""

    name = "fixture"

    def routes(self, request: ProviderRouteRequest) -> tuple[ProviderRoute, ...]:
        o, d = request.origin, request.destination
        settings = get_settings()
        if not all(
            settings.fixture_pilot_min_longitude
            <= longitude
            <= settings.fixture_pilot_max_longitude
            and settings.fixture_pilot_min_latitude
            <= latitude
            <= settings.fixture_pilot_max_latitude
            for longitude, latitude in (o, d)
        ):
            raise RoutingFailure("outside_pilot")
        mid_lng, mid_lat = round((o[0] + d[0]) / 2, 6), round((o[1] + d[1]) / 2, 6)
        # Small stable corridors around the submitted journey; no provider/network call is made.
        bends = ((0.0, 0.0007), (0.0007, 0.0), (-0.0007, 0.0))
        results = []
        for sequence, (dx, dy) in enumerate(bends, start=1):
            pivot = (round(mid_lng + dx, 6), round(mid_lat + dy, 6))
            coords = (o, pivot, d)
            distance = 1200 + sequence * 85
            duration = round(distance / 1.25)
            segments = (
                ProviderSegment(1, (o, pivot), distance // 2, duration // 2),
                ProviderSegment(2, (pivot, d), distance - distance // 2, duration - duration // 2),
            )
            results.append(
                ProviderRoute(
                    f"fixture-{sequence}",
                    sequence,
                    coords,
                    duration,
                    distance,
                    segments,
                    {"dataset": "mumbai-pilot-v1"},
                )
            )
        return tuple(results)
