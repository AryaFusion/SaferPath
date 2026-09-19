from abc import ABC, abstractmethod
from dataclasses import dataclass


class RoutingProviderError(Exception):
    """Safe provider failure; category is suitable for orchestration, never client detail."""

    def __init__(self, category: str) -> None:
        self.category = category
        super().__init__(category)


@dataclass(frozen=True)
class ProviderRouteRequest:
    origin: tuple[float, float]
    destination: tuple[float, float]
    travel_mode: str


@dataclass(frozen=True)
class ProviderSegment:
    sequence: int
    coordinates: tuple[tuple[float, float], ...]
    length_meters: int
    travel_seconds: int


@dataclass(frozen=True)
class ProviderRoute:
    reference: str
    sequence: int
    coordinates: tuple[tuple[float, float], ...]
    duration_seconds: int
    distance_meters: int
    segments: tuple[ProviderSegment, ...]
    metadata: dict[str, str]


class RoutingProvider(ABC):
    name: str

    @abstractmethod
    def routes(self, request: ProviderRouteRequest) -> tuple[ProviderRoute, ...]:
        """Return physical alternatives or raise RoutingProviderError(timeout/unavailable/invalid_response)."""
