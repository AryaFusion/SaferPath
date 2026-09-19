from datetime import datetime

from pydantic import BaseModel


class SegmentContext(BaseModel):
    segment_id: str
    sequence: int
    expected_local_time: datetime
    context_band: str
    confidence: str
    coverage: str
    source_classes: list[str]
    strongest_support: list[str]
    caution: list[str]
    unknown: list[str]
    stale_groups: list[str] = []
    freshness: dict[str, str]


class RouteContextResponse(BaseModel):
    route_id: str
    context_version: str
    model_version: str
    feature_version: str
    rule_version: str
    requested_local_time: datetime
    timezone: str
    time_mode: str
    route_context_band: str
    route_confidence: str
    route_coverage: str
    freshness_summary: dict[str, str]
    affected_segments: list[str]
    explanation: dict
    segments: list[SegmentContext]
