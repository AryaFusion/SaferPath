"""BE-04 Safety Context Engine — time-aware, evidence-based route context."""

from __future__ import annotations

import uuid
from datetime import UTC, datetime, timedelta
from zoneinfo import ZoneInfo

from sqlalchemy import func, or_, select
from sqlalchemy.orm import Session

from app.core.config import get_settings
from app.models.context import ContextVersion, SafetySignal
from app.models.help_points import HelpPoint
from app.models.reports import IncidentReport, ReportRelationship, ReportSegmentAssociation
from app.models.routing import Route, RouteRequest, RouteSegment
from app.modules.context.schemas import RouteContextResponse, SegmentContext
from app.modules.context.sources import (
    ContextSignal,
    ContextSource,
    DaylightContextSource,
    FixtureActivitySource,
    FixtureMappedInfrastructureSource,
    OpenMeteoWeatherProvider,
)
from app.modules.context.spatial import SpatialMatch, match_signals
from app.modules.help_points.service import current_status, is_open

# ---------------------------------------------------------------------------
# Version constants — increment when rules or features change
# ---------------------------------------------------------------------------
MODEL_VERSION = "0.4.0"
FEATURE_VERSION = "0.4.0"
RULE_VERSION = "0.4.0"

# ---------------------------------------------------------------------------
# Band ordering for deterministic aggregation (worst→best index)
# ---------------------------------------------------------------------------
_BAND_ORDER = [
    "UNKNOWN",
    "LIMITED_DATA",
    "CAUTION_SEGMENT",
    "MIXED_CONTEXT",
    "GOOD_CONTEXT",
    "STRONG_CONTEXTUAL_SUPPORT",
]

# ---------------------------------------------------------------------------
# Controlled explanation templates — no raw provider text
# ---------------------------------------------------------------------------
_SUPPORT_MESSAGES = {
    "DAYLIGHT": "Calculated daylight context",
    "TWILIGHT": "Calculated twilight context",
    "SIDEWALK": "Mapped pedestrian infrastructure",
    "PEDESTRIAN_PATH": "Mapped pedestrian path",
    "LIGHTING": "Mapped street lighting",
    "PEDESTRIAN_INFRASTRUCTURE": "Mapped pedestrian infrastructure (OSM)",
    "ACTIVITY": "Mapped active amenity context (OSM)",
    "TRANSIT": "Mapped transit infrastructure (OSM)",
    "ACCESSIBILITY": "Mapped accessibility feature (OSM)",
    "ROAD_CONTEXT": "Mapped road context (OSM)",
    "WEATHER_CLEAR": "Clear weather conditions",
}

_CAUTION_MESSAGES = {
    "NIGHT": "Night-time context",
    "LIMITED_MAPPED_ACTIVITY_CONTEXT": "Limited mapped activity context",
    "RAIN": "Rain conditions present",
    "LIGHT_RAIN": "Light rain conditions present",
}

_UNKNOWN_LABELS = {
    "WEATHER": "Weather data unavailable for this segment",
    "LIGHTING": "Street lighting data unavailable",
    "ACTIVITY": "Activity context unavailable",
    "OSM": "OSM spatial data unavailable for this segment",
}

_REPORT_PUBLIC_STATUSES = {"ACCEPTED_PUBLIC_CONTEXT", "CORRECTED"}


# ---------------------------------------------------------------------------
# Sentinel
# ---------------------------------------------------------------------------
class ContextNotFound(Exception):
    """Raised when the requested route does not exist."""


# ---------------------------------------------------------------------------
# OSM Context Source — wraps existing spatial matcher
# ---------------------------------------------------------------------------
class OSMContextSource(ContextSource):
    """Converts PostGIS spatial matches into normalized ContextSignals.

    Keeps all spatial matching logic inside spatial.py — this adapter only
    maps SpatialMatch records to the ContextSignal interface.
    """

    source_type = "osm_spatial"

    def __init__(self, db: Session) -> None:
        self._db = db

    def signals(  # type: ignore[override]
        self,
        segment: RouteSegment,
        segment_sequence: int,
        expected_local_time: datetime,
        latitude: float = 19.0,
        longitude: float = 72.8,
    ) -> tuple[ContextSignal, ...]:
        try:
            matches: list[SpatialMatch] = match_signals(self._db, segment)
        except Exception:
            # Spatial matching failure → no evidence (do NOT fabricate)
            return ()

        if not matches:
            return ()

        now = datetime.now(UTC)
        results: list[ContextSignal] = []
        for match in matches:
            signal_row = self._db.get(SafetySignal, uuid.UUID(match.signal_id))
            if signal_row is None:
                continue
            signal_type = signal_row.signal_type
            value = (signal_row.normalized_value or {}).get("value", match.relationship)
            # Use the original signal's expiry; default to 180 days for infrastructure
            expires_at = signal_row.expires_at or (now + timedelta(days=180))
            results.append(
                ContextSignal(
                    signal_type=signal_type,
                    value=value,
                    source_type=self.source_type,
                    confidence="medium",
                    observed_at=signal_row.observed_at,
                    expires_at=expires_at,
                    freshness="spatial_matched",
                )
            )
        return tuple(results)


# ---------------------------------------------------------------------------
# Open-Meteo Context Source — wraps OpenMeteoWeatherProvider
# ---------------------------------------------------------------------------
class OpenMeteoContextSource(ContextSource):
    """Delegates to OpenMeteoWeatherProvider; degrades gracefully on failure."""

    source_type = "open_meteo"

    def __init__(self, provider: OpenMeteoWeatherProvider | None = None) -> None:
        self._provider = provider or OpenMeteoWeatherProvider()

    def signals(
        self,
        segment_sequence: int,
        expected_local_time: datetime,
        latitude: float = 19.0,
        longitude: float = 72.8,
    ) -> tuple[ContextSignal, ...]:
        try:
            return self._provider.weather(expected_local_time, latitude, longitude)
        except RuntimeError:
            # Provider unavailable — return no signals (limited evidence)
            return ()


class ReportContextSource:
    """Bounded, segment-associated community evidence; never exposes report contents."""

    source_type = "community_reports"

    def __init__(self, db: Session) -> None:
        self._db = db

    def signals(self, segment: RouteSegment, expected: datetime) -> tuple[ContextSignal, ...]:
        reports = list(
            self._db.scalars(
                select(IncidentReport)
                .outerjoin(
                    ReportSegmentAssociation,
                    ReportSegmentAssociation.report_id == IncidentReport.id,
                )
                .where(
                    or_(
                        IncidentReport.route_segment_id == segment.id,
                        ReportSegmentAssociation.route_segment_id == segment.id,
                    ),
                    IncidentReport.moderation_status.in_(_REPORT_PUBLIC_STATUSES),
                    IncidentReport.observed_at <= expected,
                    IncidentReport.expires_at >= expected,
                )
                .order_by(IncidentReport.id)
            )
        )
        if not reports:
            return ()
        report_ids = {report.id for report in reports}
        relationships = list(
            self._db.scalars(
                select(ReportRelationship).where(
                    ReportRelationship.report_a_id.in_(report_ids),
                    ReportRelationship.report_b_id.in_(report_ids),
                )
            )
        )
        # A canonical duplicate pair has one representative: report_a.  This
        # keeps repeated submissions from becoming independent corroboration.
        suppressed = {
            relationship.report_b_id
            for relationship in relationships
            if relationship.relationship_type == "DUPLICATE"
        }
        reports = [report for report in reports if report.id not in suppressed]
        if not reports:
            return ()
        sources = {report.reporter_session_id for report in reports}
        conflicting = any(
            relationship.relationship_type == "CONFLICTING" for relationship in relationships
        )
        value = "CONFLICTING" if conflicting else "CORROBORATED" if len(sources) >= 2 else "LIMITED"
        observed = max(report.observed_at for report in reports)
        return (
            ContextSignal(
                "COMMUNITY_REPORT",
                value,
                self.source_type,
                "low" if value == "LIMITED" else "medium",
                observed,
                min(report.expires_at for report in reports),
                "fresh",
            ),
        )


class HelpPointContextSource:
    source_type = "help_points"

    def __init__(self, db: Session) -> None:
        self._db = db

    def signals(self, segment: RouteSegment, expected: datetime) -> tuple[ContextSignal, ...]:
        points = list(
            self._db.scalars(
                select(HelpPoint)
                .select_from(HelpPoint)
                .join(RouteSegment, RouteSegment.id == segment.id)
                .where(
                    func.ST_DWithin(
                        func.geography(HelpPoint.geometry),
                        func.geography(RouteSegment.geometry),
                        get_settings().help_point_association_meters,
                    )
                )
            )
        )
        usable = [
            point
            for point in points
            if current_status(point, expected) == "VERIFIED"
            and is_open(point.operating_hours, expected) == "OPEN"
        ]
        if not usable:
            return ()
        return (
            ContextSignal(
                "HELP_POINT",
                "VERIFIED_OPEN",
                self.source_type,
                "medium",
                expected,
                min(point.verification_expires_at for point in usable),
                "verified",
            ),
        )


# ---------------------------------------------------------------------------
# Coverage / Confidence helpers
# ---------------------------------------------------------------------------


def _coverage(signals: list, source_available: dict[str, bool]) -> str:
    """Return coverage enum string.

    AVAILABLE   — current evidence from ≥1 real source
    PARTIAL     — evidence exists but some expected sources missing
    LIMITED     — minimal or stale evidence only
    UNAVAILABLE — no usable evidence at all
    """
    real_sources = {"daylight_calculation", "open_meteo", "osm_spatial"}
    available_real = [s for s in real_sources if source_available.get(s, False)]

    fresh_signals = [sig for sig in signals if not sig.get("stale", False)]

    if not fresh_signals:
        return "UNAVAILABLE"
    if len(available_real) == len(real_sources):
        return "AVAILABLE"
    if len(available_real) >= 1:
        return "PARTIAL"
    # Only fixture signals present
    return "LIMITED"


def _confidence(
    signals: list,
    coverage: str,
    source_available: dict[str, bool],
) -> str:
    """Four-level contextual confidence.

    HIGH    — multiple real sources, all fresh, good coverage
    MEDIUM  — some real sources or some stale signals
    LOW     — limited coverage or many stale signals
    UNKNOWN — no usable signals
    """
    if not signals:
        return "UNKNOWN"

    if coverage == "UNAVAILABLE":
        return "UNKNOWN"

    stale_count = sum(1 for sig in signals if sig.get("stale", False))
    fixture_count = sum(1 for sig in signals if "fixture" in sig.get("source_type", ""))
    real_count = len(signals) - fixture_count

    if coverage in ("LIMITED", "PARTIAL") and real_count == 0:
        return "LOW"
    if coverage == "UNAVAILABLE":
        return "UNKNOWN"
    if stale_count > 0 or coverage == "PARTIAL":
        return "MEDIUM"
    if coverage == "LIMITED":
        return "LOW"
    if real_count >= 2 and stale_count == 0:
        return "HIGH"
    return "MEDIUM"


def _contextual_band(
    support: list[str],
    caution: list[str],
    unknown: list[str],
    coverage: str,
) -> str:
    """Deterministic contextual band.

    Rules:
    - No evidence → UNKNOWN
    - All sources unavailable → LIMITED_DATA
    - CAUTION_SEGMENT only when explicit caution evidence AND corroborated absence of support
      (NIGHT alone / RAIN alone does NOT produce CAUTION_SEGMENT)
    - Strong support beats incidental caution
    """
    if coverage == "UNAVAILABLE" and not support and not caution:
        return "UNKNOWN"
    if coverage in ("UNAVAILABLE", "LIMITED") and not support:
        return "LIMITED_DATA"

    # CAUTION_SEGMENT requires: explicit caution items AND zero support
    if caution and not support and len(caution) >= 2:
        return "CAUTION_SEGMENT"

    if len(support) >= 3:
        return "STRONG_CONTEXTUAL_SUPPORT"
    if support:
        if caution:
            return "MIXED_CONTEXT"
        return "GOOD_CONTEXT"
    if caution:
        return "MIXED_CONTEXT"
    if unknown:
        return "LIMITED_DATA"
    return "UNKNOWN"


# ---------------------------------------------------------------------------
# Main service
# ---------------------------------------------------------------------------


class SafetyContextService:
    """Evaluates time-aware, evidence-based route context.

    Pipeline:
        route → segments → expected timestamps
        → per-source signals
        → temporal validity filter
        → freshness classification
        → coverage / confidence / band
        → structured explanation
        → persisted ContextVersion
        → RouteContextResponse
    """

    def __init__(
        self,
        sources: tuple[ContextSource, ...] | None = None,
        weather_provider: OpenMeteoWeatherProvider | None = None,
    ) -> None:
        # Sources injected here; OSMContextSource is added per-evaluate (needs db)
        self._static_sources: tuple[ContextSource, ...] = sources or (
            DaylightContextSource(),
            FixtureMappedInfrastructureSource(),
            OpenMeteoContextSource(weather_provider),
            FixtureActivitySource(),
        )

    # ------------------------------------------------------------------
    # Public API
    # ------------------------------------------------------------------

    def evaluate(self, db: Session, route_id: str) -> RouteContextResponse:
        route = self._load_route(db, route_id)
        osm_source = OSMContextSource(db)
        report_source = ReportContextSource(db)
        help_point_source = HelpPointContextSource(db)

        rr: RouteRequest = route.route_request
        tz = ZoneInfo(rr.timezone)
        base_time = rr.requested_local_time.replace(tzinfo=tz)
        expected_times = self._expected_times(route, base_time, rr.time_mode)

        segments_ctx: list[SegmentContext] = []
        for segment in sorted(route.segments, key=lambda s: s.sequence):
            expected = expected_times[segment.id]
            ctx = self._segment_context(
                db, segment, expected, osm_source, report_source, help_point_source
            )
            segments_ctx.append(ctx)

        route_band = self._route_band(segments_ctx)
        route_cov = self._route_coverage(segments_ctx)
        route_conf = self._route_confidence(segments_ctx)
        affected = self._affected_segments(segments_ctx)

        explanation: dict = {
            "context_band": route_band,
            "confidence": route_conf,
            "coverage": route_cov,
            "strongest_support": self._collect_route_support(segments_ctx),
            "strongest_caution": self._collect_route_caution(segments_ctx),
            "unknown_groups": self._collect_route_unknown(segments_ctx),
            "stale_groups": self._collect_route_stale(segments_ctx),
            "affected_segments": affected,
            "source_classes": self._collect_source_classes(segments_ctx),
            "freshness": self._freshness_summary(segments_ctx),
            "evaluated_time_window": {
                "start": segments_ctx[0].expected_local_time.isoformat() if segments_ctx else None,
                "end": segments_ctx[-1].expected_local_time.isoformat() if segments_ctx else None,
            },
        }

        version = ContextVersion(
            route_id=route.id,
            model_version=MODEL_VERSION,
            feature_version=FEATURE_VERSION,
            rule_version=RULE_VERSION,
            requested_time=rr.requested_local_time,
            context_band=route_band,
            confidence=route_conf,
            coverage=route_cov,
            explanation=explanation,
        )
        db.add(version)
        db.commit()
        db.refresh(version)

        return RouteContextResponse(
            route_id=str(route.id),
            context_version=str(version.id),
            model_version=MODEL_VERSION,
            feature_version=FEATURE_VERSION,
            rule_version=RULE_VERSION,
            requested_local_time=base_time,
            timezone=rr.timezone,
            time_mode=rr.time_mode,
            route_context_band=route_band,
            route_confidence=route_conf,
            route_coverage=route_cov,
            freshness_summary=explanation["freshness"],
            affected_segments=affected,
            explanation=explanation,
            segments=segments_ctx,
        )

    # ------------------------------------------------------------------
    # Private helpers
    # ------------------------------------------------------------------

    def _load_route(self, db: Session, route_id: str) -> Route:
        try:
            rid = uuid.UUID(route_id)
        except ValueError as exc:
            raise ContextNotFound(route_id) from exc
        route = db.get(Route, rid)
        if route is None:
            raise ContextNotFound(route_id)
        return route

    def _expected_times(
        self,
        route: Route,
        base_time: datetime,
        time_mode: str,
    ) -> dict[uuid.UUID, datetime]:
        """Build per-segment expected traversal timestamps.

        departure mode: segment[0] starts at base_time; each subsequent
                        segment starts after the prior segment's travel_seconds.
        arrival mode:   last segment ends at base_time; work backwards.
        """
        segments = sorted(route.segments, key=lambda s: s.sequence)
        times: dict[uuid.UUID, datetime] = {}

        if time_mode == "arrival":
            cursor = base_time
            for segment in reversed(segments):
                times[segment.id] = cursor
                cursor -= timedelta(seconds=segment.travel_seconds)
        else:
            # departure (default)
            cursor = base_time
            for segment in segments:
                times[segment.id] = cursor
                cursor += timedelta(seconds=segment.travel_seconds)

        return times

    def _segment_context(
        self,
        db: Session,
        segment: RouteSegment,
        expected: datetime,
        osm_source: OSMContextSource,
        report_source: ReportContextSource,
        help_point_source: HelpPointContextSource,
    ) -> SegmentContext:
        """Evaluate a single segment: gather signals, classify, build context."""

        # Approximate centroid of segment for geo-aware sources
        lat, lon = self._segment_centroid(segment)

        # Track per-source availability
        source_available: dict[str, bool] = {}
        all_signals: list[ContextSignal] = []
        osm_sigs: tuple[ContextSignal, ...] = ()
        report_sigs: tuple[ContextSignal, ...] = ()
        help_point_sigs: tuple[ContextSignal, ...] = ()

        # --- Static sources (daylight, fixture infra, weather, activity) ---
        for source in self._static_sources:
            try:
                sigs = source.signals(segment.sequence, expected, lat, lon)
                source_available[source.source_type] = bool(sigs)
                all_signals.extend(sigs)
            except Exception:
                source_available[source.source_type] = False

        # --- OSM spatial source ---
        try:
            osm_sigs = osm_source.signals(segment, segment.sequence, expected, lat, lon)
            source_available["osm_spatial"] = bool(osm_sigs)
            all_signals.extend(osm_sigs)
        except Exception:
            source_available["osm_spatial"] = False

        try:
            report_sigs = report_source.signals(segment, expected)
            source_available["community_reports"] = bool(report_sigs)
            all_signals.extend(report_sigs)
        except Exception:
            source_available["community_reports"] = False

        try:
            help_point_sigs = help_point_source.signals(segment, expected)
            source_available["help_points"] = bool(help_point_sigs)
            all_signals.extend(help_point_sigs)
        except Exception:
            source_available["help_points"] = False

        # --- Persist generated signals ---
        self._persist_signals(db, segment.id, all_signals)

        # --- Retrieve stored temporally-valid signals ---
        stored = self._fetch_stored(db, segment.id, expected)

        # --- Classify each stored signal ---
        classified: list[dict] = []
        for sig in stored:
            nv = sig.normalized_value or {}
            freshness_val = nv.get("freshness", "unknown")
            exp = sig.expires_at
            is_stale = exp is not None and exp < expected
            classified.append(
                {
                    "signal_type": sig.signal_type,
                    "value": nv.get("value", ""),
                    "source_type": sig.source_type,
                    "freshness": freshness_val,
                    "stale": is_stale,
                    "confidence": sig.confidence,
                }
            )

        # Spatial matches are deliberately not re-persisted against a route
        # segment: their source rows remain the canonical OSM observations.
        # They must, however, join this evaluation's normalized evidence.  The
        # previous handoff skipped them both in persistence and in this list,
        # which meant real PostGIS matches could not influence context.
        for sig in (*osm_sigs, *report_sigs, *help_point_sigs):
            if sig.observed_at > expected:
                continue
            classified.append(
                {
                    "signal_type": sig.signal_type,
                    "value": sig.value,
                    "source_type": sig.source_type,
                    "freshness": sig.freshness,
                    "stale": sig.expires_at is not None and sig.expires_at < expected,
                    "confidence": sig.confidence,
                }
            )

        # --- Build explanation components ---
        support: list[str] = []
        caution: list[str] = []
        unknown: list[str] = []
        stale_groups: list[str] = []
        source_classes: set[str] = set()

        for sig in classified:
            stype = sig["signal_type"]
            val = sig["value"]
            src = sig["source_type"]
            source_classes.add(src)

            if sig["stale"]:
                stale_groups.append(f"{stype}:{val}")
                continue  # stale signals do not contribute to band evidence

            # Daylight signals
            if stype == "DAYLIGHT":
                if val == "DAYLIGHT":
                    support.append(_SUPPORT_MESSAGES["DAYLIGHT"])
                elif val == "TWILIGHT":
                    support.append(_SUPPORT_MESSAGES["TWILIGHT"])
                elif val == "NIGHT":
                    # NIGHT alone → contextual, not caution
                    caution.append(_CAUTION_MESSAGES["NIGHT"])

            # Infrastructure signals
            elif stype == "SIDEWALK":
                support.append(_SUPPORT_MESSAGES["SIDEWALK"])
            elif stype == "PEDESTRIAN_PATH":
                support.append(_SUPPORT_MESSAGES["PEDESTRIAN_PATH"])
            elif stype == "LIGHTING":
                if "LIT_YES" in val or val in {"MAPPED_LIT", "STREET_LAMP"}:
                    support.append(_SUPPORT_MESSAGES["LIGHTING"])
            elif stype == "PEDESTRIAN_INFRASTRUCTURE":
                support.append(_SUPPORT_MESSAGES["PEDESTRIAN_INFRASTRUCTURE"])

            # OSM mapped context
            elif stype == "ACTIVITY":
                support.append(_SUPPORT_MESSAGES["ACTIVITY"])
            elif stype == "TRANSIT":
                support.append(_SUPPORT_MESSAGES["TRANSIT"])
            elif stype == "ACCESSIBILITY":
                support.append(_SUPPORT_MESSAGES["ACCESSIBILITY"])
            elif stype == "ROAD_CONTEXT":
                support.append(_SUPPORT_MESSAGES["ROAD_CONTEXT"])

            # Activity schedule (fixture)
            elif stype == "MAPPED_ACTIVITY":
                if val == "OPEN_AMENITY_CONTEXT":
                    support.append("Active amenity context")
                else:
                    caution.append(_CAUTION_MESSAGES.get(val, "Limited activity context"))

            # Weather — informational only, never force CAUTION_SEGMENT alone
            elif stype == "WEATHER":
                if val == "CLEAR":
                    support.append(_SUPPORT_MESSAGES["WEATHER_CLEAR"])
                # Rain is contextual — add to caution but band logic prevents CAUTION_SEGMENT alone
                elif val in {"RAIN", "LIGHT_RAIN"}:
                    caution.append(_CAUTION_MESSAGES.get(val, "Rain conditions present"))
                # CLOUDY → neither support nor caution
            elif stype in {"PRECIPITATION", "VISIBILITY"}:
                pass  # informational; captured via WEATHER signal
            elif stype == "COMMUNITY_REPORT":
                if val == "CORROBORATED":
                    caution.append("Corroborated recent community report evidence")
                elif val == "CONFLICTING":
                    caution.append("Mixed recent community report evidence")
                    unknown.append("Conflicting community report evidence reduces certainty")
                else:
                    unknown.append("Limited corroboration from recent community report evidence")

            elif stype == "HELP_POINT" and val == "VERIFIED_OPEN":
                support.append("Verified help-point availability")

        # Unknown sources
        if not source_available.get("open_meteo", False):
            unknown.append(_UNKNOWN_LABELS["WEATHER"])
        if not source_available.get("osm_spatial", False):
            unknown.append(_UNKNOWN_LABELS["OSM"])

        # Deduplicate (preserve first occurrence)
        support = list(dict.fromkeys(support))
        caution = list(dict.fromkeys(caution))
        unknown = list(dict.fromkeys(unknown))
        stale_groups = list(dict.fromkeys(stale_groups))

        coverage = _coverage(classified, source_available)
        confidence = _confidence(classified, coverage, source_available)
        band = _contextual_band(support, caution, unknown, coverage)

        freshness: dict[str, str] = {}
        for sig in classified:
            freshness[sig["signal_type"]] = (
                "stale" if sig["stale"] else sig.get("freshness", "unknown")
            )

        return SegmentContext(
            segment_id=str(segment.id),
            sequence=segment.sequence,
            expected_local_time=expected,
            context_band=band,
            confidence=confidence,
            coverage=coverage,
            source_classes=sorted(source_classes),
            strongest_support=support,
            caution=caution,
            unknown=unknown,
            stale_groups=stale_groups,
            freshness=freshness,
        )

    def _persist_signals(
        self,
        db: Session,
        segment_id: uuid.UUID,
        signals: list[ContextSignal],
    ) -> None:
        """Persist generated signals; skip OSM-spatial signals (already in DB)."""
        for sig in signals:
            if sig.source_type in {"osm_spatial", "community_reports", "help_points"}:
                continue  # canonical source records remain authoritative
            db.add(
                SafetySignal(
                    route_segment_id=segment_id,
                    signal_type=sig.signal_type,
                    normalized_value={"value": sig.value, "freshness": sig.freshness},
                    source_type=sig.source_type,
                    observed_at=sig.observed_at,
                    expires_at=sig.expires_at,
                    confidence=sig.confidence,
                    verification_status="fixture" if "fixture" in sig.source_type else "calculated",
                    privacy_class="public",
                    provenance={"source": sig.source_type},
                )
            )
        db.flush()

    def _fetch_stored(
        self,
        db: Session,
        segment_id: uuid.UUID,
        expected: datetime,
    ) -> list[SafetySignal]:
        """Retrieve signals valid at the expected traversal time."""
        from sqlalchemy import or_

        return list(
            db.scalars(
                select(SafetySignal)
                .where(
                    SafetySignal.route_segment_id == segment_id,
                    SafetySignal.observed_at <= expected,
                    or_(
                        SafetySignal.expires_at.is_(None),
                        SafetySignal.expires_at >= expected,
                    ),
                )
                .order_by(SafetySignal.observed_at.desc())
            )
        )

    @staticmethod
    def _segment_centroid(segment: RouteSegment) -> tuple[float, float]:
        """Return (lat, lon) approximation from geometry WKT for source calls.

        Falls back to Mumbai pilot centroid if geometry is unavailable.
        """
        try:
            geom = str(segment.geometry) if segment.geometry else ""
            if "LINESTRING" in geom:
                coords_str = geom.replace("LINESTRING(", "").replace(")", "").strip()
                pairs = coords_str.split(",")
                midpoint = pairs[len(pairs) // 2].strip().split()
                return float(midpoint[1]), float(midpoint[0])  # lat, lon
        except Exception:
            pass
        return 19.0, 72.8

    # ------------------------------------------------------------------
    # Route-level aggregation
    # ------------------------------------------------------------------

    def _route_band(self, segments: list[SegmentContext]) -> str:
        if not segments:
            return "UNKNOWN"
        # Aggregate: weakest segment defines the route band
        worst_idx = min(
            _BAND_ORDER.index(s.context_band) if s.context_band in _BAND_ORDER else 0
            for s in segments
        )
        return _BAND_ORDER[worst_idx]

    def _route_coverage(self, segments: list[SegmentContext]) -> str:
        if not segments:
            return "UNAVAILABLE"
        coverages = [s.coverage for s in segments]
        if all(c == "AVAILABLE" for c in coverages):
            return "AVAILABLE"
        if all(c == "UNAVAILABLE" for c in coverages):
            return "UNAVAILABLE"
        if any(c in ("AVAILABLE", "PARTIAL") for c in coverages):
            return "PARTIAL"
        return "LIMITED"

    def _route_confidence(self, segments: list[SegmentContext]) -> str:
        if not segments:
            return "UNKNOWN"
        _ORDER = ["UNKNOWN", "LOW", "MEDIUM", "HIGH"]
        min_idx = min(_ORDER.index(s.confidence) if s.confidence in _ORDER else 0 for s in segments)
        return _ORDER[min_idx]

    def _affected_segments(self, segments: list[SegmentContext]) -> list[str]:
        """Segments with non-trivial caution or limited context."""
        return [
            s.segment_id
            for s in segments
            if s.caution or s.context_band in {"CAUTION_SEGMENT", "LIMITED_DATA", "UNKNOWN"}
        ]

    def _collect_route_support(self, segments: list[SegmentContext]) -> list[str]:
        seen: set[str] = set()
        result: list[str] = []
        for seg in segments:
            for item in seg.strongest_support:
                if item not in seen:
                    seen.add(item)
                    result.append(item)
        return result

    def _collect_route_caution(self, segments: list[SegmentContext]) -> list[str]:
        seen: set[str] = set()
        result: list[str] = []
        for seg in segments:
            for item in seg.caution:
                if item not in seen:
                    seen.add(item)
                    result.append(item)
        return result

    def _collect_route_unknown(self, segments: list[SegmentContext]) -> list[str]:
        seen: set[str] = set()
        result: list[str] = []
        for seg in segments:
            for item in seg.unknown:
                if item not in seen:
                    seen.add(item)
                    result.append(item)
        return result

    def _collect_route_stale(self, segments: list[SegmentContext]) -> list[str]:
        seen: set[str] = set()
        result: list[str] = []
        for seg in segments:
            for item in seg.stale_groups:
                if item not in seen:
                    seen.add(item)
                    result.append(item)
        return result

    def _collect_source_classes(self, segments: list[SegmentContext]) -> list[str]:
        classes: set[str] = set()
        for seg in segments:
            classes.update(seg.source_classes)
        return sorted(classes)

    def _freshness_summary(self, segments: list[SegmentContext]) -> dict[str, str]:
        summary: dict[str, str] = {}
        for seg in segments:
            for signal_type, freshness_val in seg.freshness.items():
                # Take the "worst" freshness if the same type appears in multiple segments
                existing = summary.get(signal_type)
                if existing is None or (freshness_val == "stale" and existing != "stale"):
                    summary[signal_type] = freshness_val
        return summary
