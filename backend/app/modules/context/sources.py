import json
from abc import ABC, abstractmethod
from dataclasses import dataclass
from datetime import UTC, datetime, timedelta
from math import asin, cos, degrees, radians, sin
from urllib.parse import urlencode, urlparse
from urllib.request import urlopen

from app.core.config import get_settings


@dataclass(frozen=True)
class ContextSignal:
    signal_type: str
    value: str
    source_type: str
    confidence: str
    observed_at: datetime
    expires_at: datetime | None
    freshness: str


class ContextSource(ABC):
    source_type: str

    @abstractmethod
    def signals(
        self,
        segment_sequence: int,
        expected_local_time: datetime,
        latitude: float = 19.0,
        longitude: float = 72.8,
    ) -> tuple[ContextSignal, ...]:
        """Return normalized, non-private signals; source failures must be isolated by the engine."""


class DaylightContextSource(ContextSource):
    source_type = "daylight_calculation"

    def signals(
        self,
        segment_sequence: int,
        expected_local_time: datetime,
        latitude: float = 19.0,
        longitude: float = 72.8,
    ) -> tuple[ContextSignal, ...]:
        state = daylight_state(latitude, longitude, expected_local_time)
        observed = expected_local_time.astimezone(UTC)
        return (
            ContextSignal(
                "DAYLIGHT",
                state,
                self.source_type,
                "high",
                observed,
                observed + timedelta(hours=1),
                "calculated",
            ),
        )


def daylight_state(latitude: float, longitude: float, expected_local_time: datetime) -> str:
    instant = expected_local_time.astimezone(UTC)
    day, hour = instant.timetuple().tm_yday, instant.hour + instant.minute / 60
    gamma = 2 * 3.141592653589793 / 365 * (day - 1 + (hour - 12) / 24)
    declination = (
        0.006918
        - 0.399912 * cos(gamma)
        + 0.070257 * sin(gamma)
        - 0.006758 * cos(2 * gamma)
        + 0.000907 * sin(2 * gamma)
        - 0.002697 * cos(3 * gamma)
        + 0.00148 * sin(3 * gamma)
    )
    equation = 229.18 * (
        0.000075
        + 0.001868 * cos(gamma)
        - 0.032077 * sin(gamma)
        - 0.014615 * cos(2 * gamma)
        - 0.040849 * sin(2 * gamma)
    )
    angle = radians(((hour * 60 + equation + 4 * longitude) % 1440) / 4 - 180)
    elevation = degrees(
        asin(
            sin(radians(latitude)) * sin(declination)
            + cos(radians(latitude)) * cos(declination) * cos(angle)
        )
    )
    return "DAYLIGHT" if elevation >= 0 else "TWILIGHT" if elevation >= -6 else "NIGHT"


class FixtureMappedInfrastructureSource(ContextSource):
    source_type = "fixture_osm_mapped"

    def signals(
        self,
        segment_sequence: int,
        expected_local_time: datetime,
        latitude: float = 19.0,
        longitude: float = 72.8,
    ) -> tuple[ContextSignal, ...]:
        observed = datetime(2026, 9, 1, tzinfo=UTC)
        values = [
            ContextSignal(
                "SIDEWALK",
                "MAPPED_SIDEWALK",
                self.source_type,
                "medium",
                observed,
                observed + timedelta(days=180),
                "mapped",
            ),
            ContextSignal(
                "PEDESTRIAN_PATH",
                "MAPPED_PATH",
                self.source_type,
                "medium",
                observed,
                observed + timedelta(days=180),
                "mapped",
            ),
        ]
        if segment_sequence == 1:
            values.append(
                ContextSignal(
                    "LIGHTING",
                    "MAPPED_LIT",
                    self.source_type,
                    "medium",
                    observed,
                    observed + timedelta(days=180),
                    "mapped",
                )
            )
        return tuple(values)


class FixtureWeatherSource(ContextSource):
    source_type = "fixture_weather"

    def signals(
        self,
        segment_sequence: int,
        expected_local_time: datetime,
        latitude: float = 19.0,
        longitude: float = 72.8,
    ) -> tuple[ContextSignal, ...]:
        value = "CLEAR" if expected_local_time.hour < 21 else "LIGHT_RAIN"
        observed = expected_local_time.astimezone(UTC)
        return (
            ContextSignal(
                "WEATHER",
                value,
                self.source_type,
                "medium",
                observed,
                observed + timedelta(hours=3),
                "fixture_forecast",
            ),
        )


class WeatherProvider(ABC):
    @abstractmethod
    def weather(self, expected_local_time: datetime) -> tuple[ContextSignal, ...]: ...


class FixtureWeatherProvider(WeatherProvider):
    def weather(self, expected_local_time: datetime) -> tuple[ContextSignal, ...]:
        return FixtureWeatherSource().signals(0, expected_local_time)


class OpenMeteoWeatherProvider(WeatherProvider):
    """Server-configured Open-Meteo adapter; provider payloads never leave this boundary."""

    def __init__(self, opener=urlopen) -> None:
        self.opener = opener

    def weather(
        self, expected_local_time: datetime, latitude: float = 19.0, longitude: float = 72.8
    ) -> tuple[ContextSignal, ...]:
        settings = get_settings()
        parsed = urlparse(settings.open_meteo_base_url)
        if (
            parsed.scheme != "https"
            or parsed.hostname != "api.open-meteo.com"
            or parsed.port not in {None, 443}
            or parsed.username
            or parsed.password
        ):
            raise RuntimeError("weather provider is unavailable")
        query = urlencode(
            {
                "latitude": latitude,
                "longitude": longitude,
                "hourly": "weather_code,precipitation,visibility",
                "timezone": "UTC",
            }
        )
        try:
            with self.opener(
                f"{settings.open_meteo_base_url}/v1/forecast?{query}", timeout=10
            ) as response:
                if getattr(response, "status", 200) != 200:
                    raise RuntimeError("weather provider is unavailable")
                payload = json.loads(response.read(1_000_000))
        except (OSError, TimeoutError, json.JSONDecodeError) as exc:
            raise RuntimeError("weather provider is unavailable") from exc
        hourly = payload.get("hourly") if isinstance(payload, dict) else None
        if not isinstance(hourly, dict) or not all(
            isinstance(hourly.get(key), list)
            for key in ("time", "weather_code", "precipitation", "visibility")
        ):
            raise RuntimeError("weather provider response is invalid")
        slots = []
        for index, timestamp in enumerate(hourly["time"]):
            try:
                slots.append((datetime.fromisoformat(timestamp).replace(tzinfo=UTC), index))
            except ValueError:
                continue
        target = expected_local_time.astimezone(UTC)
        if not slots:
            raise RuntimeError("weather provider response is invalid")
        moment, index = min(slots, key=lambda item: abs((item[0] - target).total_seconds()))
        if abs((moment - target).total_seconds()) > 3600:
            raise RuntimeError("weather unavailable for requested time")
        try:
            code, precipitation, visibility = (
                hourly["weather_code"][index],
                hourly["precipitation"][index],
                hourly["visibility"][index],
            )
        except (IndexError, TypeError) as exc:
            raise RuntimeError("weather provider response is invalid") from exc
        condition = (
            "RAIN"
            if precipitation and precipitation > 0
            else "CLEAR"
            if code in {0, 1}
            else "CLOUDY"
        )
        expiry = moment + timedelta(hours=2)
        return (
            ContextSignal("WEATHER", condition, "open_meteo", "medium", moment, expiry, "forecast"),
            ContextSignal(
                "PRECIPITATION",
                str(precipitation),
                "open_meteo",
                "medium",
                moment,
                expiry,
                "forecast",
            ),
            ContextSignal(
                "VISIBILITY", str(visibility), "open_meteo", "medium", moment, expiry, "forecast"
            ),
        )


class ReportContextSource(ContextSource):
    source_type = "community_report"

    def signals(
        self,
        segment_sequence: int,
        expected_local_time: datetime,
        latitude: float = 19.0,
        longitude: float = 72.8,
    ) -> tuple[ContextSignal, ...]:
        return ()


class HelpPointContextSource(ContextSource):
    source_type = "help_point"

    def signals(
        self,
        segment_sequence: int,
        expected_local_time: datetime,
        latitude: float = 19.0,
        longitude: float = 72.8,
    ) -> tuple[ContextSignal, ...]:
        return ()


class FixtureActivitySource(ContextSource):
    source_type = "fixture_mapped_activity"

    def signals(
        self,
        segment_sequence: int,
        expected_local_time: datetime,
        latitude: float = 19.0,
        longitude: float = 72.8,
    ) -> tuple[ContextSignal, ...]:
        hour = expected_local_time.hour + expected_local_time.minute / 60
        value = "OPEN_AMENITY_CONTEXT" if 8 <= hour < 22 else "LIMITED_MAPPED_ACTIVITY_CONTEXT"
        observed = expected_local_time.astimezone(UTC)
        return (
            ContextSignal(
                "MAPPED_ACTIVITY",
                value,
                self.source_type,
                "medium",
                observed,
                observed + timedelta(hours=1),
                "fixture_schedule",
            ),
        )
