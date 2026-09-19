from datetime import datetime
from zoneinfo import ZoneInfo, ZoneInfoNotFoundError

from pydantic import BaseModel, ConfigDict, Field, field_validator, model_validator


class Point(BaseModel):
    model_config = ConfigDict(extra="forbid", allow_inf_nan=False)
    longitude: float = Field(ge=-180, le=180)
    latitude: float = Field(ge=-90, le=90)


class RouteComparisonRequest(BaseModel):
    model_config = ConfigDict(extra="forbid")
    origin: Point
    destination: Point
    timezone: str = Field(max_length=64)
    requested_local_time: datetime
    time_mode: str = Field(pattern="^(departure|arrival)$")
    travel_mode: str = Field(default="walking", pattern="^walking$")
    route_preference: str = Field(
        default="balanced", pattern="^(fastest|contextual|balanced|accessible)$"
    )
    idempotency_key: str = Field(min_length=8, max_length=255)
    session_id: str | None = Field(default=None, max_length=128)

    @field_validator("timezone")
    @classmethod
    def valid_timezone(cls, value: str) -> str:
        try:
            ZoneInfo(value)
        except ZoneInfoNotFoundError as exc:
            raise ValueError("must be an IANA timezone") from exc
        return value

    @model_validator(mode="after")
    def valid_trip(self) -> "RouteComparisonRequest":
        origin = (round(self.origin.longitude, 6), round(self.origin.latitude, 6))
        destination = (round(self.destination.longitude, 6), round(self.destination.latitude, 6))
        if origin == destination:
            raise ValueError("origin and destination must be different")
        if self.requested_local_time.tzinfo is not None:
            raise ValueError("requested_local_time must be local time without an offset")
        return self


class SegmentResponse(BaseModel):
    id: str
    sequence: int
    geometry: list[list[float]]
    length_meters: int
    travel_seconds: int


class RouteResponse(BaseModel):
    id: str
    sequence: int
    provider: str
    provider_metadata: dict[str, str]
    duration_seconds: int
    distance_meters: int
    geometry: list[list[float]]
    segments: list[SegmentResponse]


class RouteComparisonResponse(BaseModel):
    request_id: str
    status: str = "ready"
    reused: bool
    expires_at: datetime
    timezone: str
    requested_local_time: datetime
    time_mode: str
    travel_mode: str
    route_preference: str
    provider_source: str
    routes: list[RouteResponse]
