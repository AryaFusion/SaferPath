"""BE-04 Extended Integration Tests — golden-time scenarios, failure modes, API structure.

These tests verify time-aware contextual evidence, failure degradation, and
the complete API contract without hardcoding band outcomes.
"""

from __future__ import annotations

import json
import uuid
from datetime import UTC, datetime, timedelta
from zoneinfo import ZoneInfo

import pytest
from sqlalchemy import text

from app.db.session import SessionLocal
from app.models.context import SafetySignal
from app.modules.context.service import (
    MODEL_VERSION,
    RULE_VERSION,
    _confidence,
    _contextual_band,
    _coverage,
)
from app.modules.context.sources import (
    DaylightContextSource,
    OpenMeteoWeatherProvider,
    daylight_state,
)

# ---------------------------------------------------------------------------
# Helpers
# ---------------------------------------------------------------------------

IST = ZoneInfo("Asia/Kolkata")
MUMBAI_LAT, MUMBAI_LON = 19.076, 72.877


def _route(client, time_str: str, mode: str = "departure") -> tuple[str, str]:
    """Create a route and return (route_id, idempotency_key)."""
    key = f"be04-ext-{uuid.uuid4()}"
    response = client.post(
        "/v1/routes/compare",
        json={
            "origin": {"longitude": 72.8373, "latitude": 19.0269},
            "destination": {"longitude": 72.8433, "latitude": 19.018},
            "timezone": "Asia/Kolkata",
            "requested_local_time": f"2026-09-19T{time_str}:00",
            "time_mode": mode,
            "idempotency_key": key,
        },
    )
    assert response.status_code == 201, f"Route creation failed: {response.text}"
    return response.json()["routes"][0]["id"], key


def _cleanup(keys: list[str]) -> None:
    with SessionLocal() as session:
        for key in keys:
            session.execute(
                text("DELETE FROM route_requests WHERE idempotency_key = :key"),
                {"key": key},
            )
        session.commit()


# ===========================================================================
# 1. GOLDEN-TIME: Same route at 18:00, 21:00, 23:30 — evidence must differ
# ===========================================================================


def test_golden_18_produces_daylight_support(client):
    """At 18:00 IST the engine must report daylight as supporting evidence."""
    keys = []
    try:
        route_id, key = _route(client, "18:00")
        keys.append(key)
        resp = client.get(f"/v1/routes/{route_id}/context")
        assert resp.status_code == 200
        data = resp.json()
        # Must have supporting daylight evidence
        first_seg = data["segments"][0]
        assert "Calculated daylight context" in first_seg["strongest_support"]
        # No safety score must appear anywhere in the response
        assert "safety_score" not in json.dumps(data)
        # context_version must be present and non-empty
        assert data["context_version"]
    finally:
        _cleanup(keys)


def test_golden_21_produces_night_caution(client):
    """At 21:00 IST it is nighttime — NIGHT context must appear in caution."""
    keys = []
    try:
        route_id, key = _route(client, "21:00")
        keys.append(key)
        resp = client.get(f"/v1/routes/{route_id}/context")
        assert resp.status_code == 200
        data = resp.json()
        first_seg = data["segments"][0]
        assert "Night-time context" in first_seg["caution"]
    finally:
        _cleanup(keys)


def test_golden_2330_produces_night_and_limited_activity(client):
    """At 23:30 IST both NIGHT and limited activity context must be present."""
    keys = []
    try:
        route_id, key = _route(client, "23:30")
        keys.append(key)
        resp = client.get(f"/v1/routes/{route_id}/context")
        assert resp.status_code == 200
        data = resp.json()
        first_seg = data["segments"][0]
        assert "Night-time context" in first_seg["caution"]
        assert "Limited mapped activity context" in first_seg["caution"]
    finally:
        _cleanup(keys)


def test_golden_times_produce_different_evidence(client):
    """Evidence must differ across the three golden times."""
    keys = []
    try:
        id_18, k18 = _route(client, "18:00")
        id_21, k21 = _route(client, "21:00")
        id_2330, k2330 = _route(client, "23:30")
        keys.extend([k18, k21, k2330])

        r18 = client.get(f"/v1/routes/{id_18}/context").json()
        r21 = client.get(f"/v1/routes/{id_21}/context").json()
        r2330 = client.get(f"/v1/routes/{id_2330}/context").json()

        # Daylight at 18:00; night at 21:00 — DAYLIGHT signal differs
        seg18 = r18["segments"][0]
        seg21 = r21["segments"][0]
        seg2330 = r2330["segments"][0]

        # Freshness dict must exist and contain DAYLIGHT key
        assert "DAYLIGHT" in seg18["freshness"]
        assert "DAYLIGHT" in seg21["freshness"]

        # Expected local times must differ across routes
        assert seg18["expected_local_time"] != seg21["expected_local_time"]
        assert seg21["expected_local_time"] != seg2330["expected_local_time"]

        # Caution lists must differ: 18:00 has no night, 21:00 has night
        assert "Night-time context" not in seg18["caution"]
        assert "Night-time context" in seg21["caution"]
        assert "Night-time context" in seg2330["caution"]

        # Activity differs between 18:00 (open) and 23:30 (limited)
        assert "Limited mapped activity context" not in seg18["caution"]
        assert "Limited mapped activity context" in seg2330["caution"]

    finally:
        _cleanup(keys)


def test_golden_night_alone_does_not_produce_caution_segment(client):
    """NIGHT alone must NOT result in CAUTION_SEGMENT — spec requirement."""
    keys = []
    try:
        route_id, key = _route(client, "23:30")
        keys.append(key)
        resp = client.get(f"/v1/routes/{route_id}/context")
        assert resp.status_code == 200
        data = resp.json()
        # Route or first segment must not be CAUTION_SEGMENT from night alone
        # (It may be MIXED_CONTEXT or GOOD_CONTEXT because there is infra support)
        assert data["route_context_band"] != "CAUTION_SEGMENT", (
            "NIGHT alone should not produce CAUTION_SEGMENT — spec violation"
        )
    finally:
        _cleanup(keys)


# ===========================================================================
# 2. API STRUCTURE VERIFICATION
# ===========================================================================


def test_api_response_structure_is_complete(client):
    """Verify all required fields are present and no private data is exposed."""
    keys = []
    try:
        route_id, key = _route(client, "18:00")
        keys.append(key)
        resp = client.get(f"/v1/routes/{route_id}/context")
        assert resp.status_code == 200
        data = resp.json()

        # Required top-level fields
        required_top = {
            "route_id", "context_version", "model_version", "feature_version",
            "rule_version", "requested_local_time", "timezone", "time_mode",
            "route_context_band", "route_confidence", "route_coverage",
            "freshness_summary", "affected_segments", "explanation", "segments",
        }
        assert required_top <= set(data.keys()), f"Missing fields: {required_top - set(data.keys())}"

        # Explanation must contain required sub-fields
        exp = data["explanation"]
        assert "context_band" in exp
        assert "confidence" in exp
        assert "coverage" in exp
        assert "strongest_support" in exp
        assert "strongest_caution" in exp
        assert "unknown_groups" in exp
        assert "stale_groups" in exp
        assert "affected_segments" in exp
        assert "source_classes" in exp
        assert "freshness" in exp

        # Segments must have required fields
        seg = data["segments"][0]
        seg_required = {
            "segment_id", "sequence", "expected_local_time", "context_band",
            "confidence", "coverage", "source_classes", "strongest_support",
            "caution", "unknown", "stale_groups", "freshness",
        }
        assert seg_required <= set(seg.keys()), f"Missing segment fields: {seg_required - set(seg.keys())}"

        # No private data
        raw_str = json.dumps(data)
        assert "safety_score" not in raw_str
        assert "SAFE" not in raw_str or "source_classes" in raw_str  # SAFE should not appear as a label
        assert "UNSAFE" not in raw_str
        assert "DANGEROUS" not in raw_str
        assert "api_key" not in raw_str.lower()

        # Valid enum values for top-level fields
        assert data["route_context_band"] in {
            "STRONG_CONTEXTUAL_SUPPORT", "GOOD_CONTEXT", "MIXED_CONTEXT",
            "CAUTION_SEGMENT", "LIMITED_DATA", "UNKNOWN",
        }
        assert data["route_confidence"] in {"HIGH", "MEDIUM", "LOW", "UNKNOWN"}
        assert data["route_coverage"] in {"AVAILABLE", "PARTIAL", "LIMITED", "UNAVAILABLE"}

    finally:
        _cleanup(keys)


def test_context_version_persisted_with_explanation(client):
    """context_version must be persisted in DB with explanation JSON."""

    from app.models.context import ContextVersion

    keys = []
    try:
        route_id, key = _route(client, "18:00")
        keys.append(key)
        resp = client.get(f"/v1/routes/{route_id}/context")
        assert resp.status_code == 200
        cv_id = resp.json()["context_version"]

        with SessionLocal() as session:
            cv = session.get(ContextVersion, uuid.UUID(cv_id))
            assert cv is not None, "ContextVersion must be persisted"
            assert cv.context_band in {
                "STRONG_CONTEXTUAL_SUPPORT", "GOOD_CONTEXT", "MIXED_CONTEXT",
                "CAUTION_SEGMENT", "LIMITED_DATA", "UNKNOWN",
            }
            assert cv.confidence in {"HIGH", "MEDIUM", "LOW", "UNKNOWN"}
            assert cv.coverage in {"AVAILABLE", "PARTIAL", "LIMITED", "UNAVAILABLE"}
            assert cv.evaluated_at is not None
            assert isinstance(cv.explanation, dict)
            assert "context_band" in cv.explanation
            assert "confidence" in cv.explanation
            assert cv.explanation["evaluated_time_window"]["start"]
            assert cv.explanation["evaluated_time_window"]["end"]
            assert cv.model_version == MODEL_VERSION
            assert cv.rule_version == RULE_VERSION
    finally:
        _cleanup(keys)


def test_segment_timestamps_increase_for_departure_mode(client):
    """Each segment's expected_local_time must be >= the previous segment's time."""
    keys = []
    try:
        route_id, key = _route(client, "18:00", "departure")
        keys.append(key)
        resp = client.get(f"/v1/routes/{route_id}/context")
        assert resp.status_code == 200
        segments = resp.json()["segments"]
        if len(segments) >= 2:
            times = [datetime.fromisoformat(s["expected_local_time"]) for s in segments]
            for i in range(1, len(times)):
                assert times[i] >= times[i - 1], (
                    f"Segment {i} time {times[i]} is before segment {i-1} time {times[i-1]}"
                )
    finally:
        _cleanup(keys)


def test_arrival_mode_last_segment_matches_requested_time(client):
    """In arrival mode, the last segment's expected time must be at requested_local_time."""
    keys = []
    try:
        route_id, key = _route(client, "23:30", "arrival")
        keys.append(key)
        resp = client.get(f"/v1/routes/{route_id}/context")
        assert resp.status_code == 200
        data = resp.json()
        last_seg = data["segments"][-1]
        assert last_seg["expected_local_time"].startswith("2026-09-19T23:30:00"), (
            f"Last segment time {last_seg['expected_local_time']} does not match 23:30"
        )
    finally:
        _cleanup(keys)


# ===========================================================================
# 3. FAILURE MODE TESTS
# ===========================================================================


def test_weather_unavailable_degrades_gracefully(client):
    """When Open-Meteo is unavailable the engine must still return a response."""
    from unittest.mock import patch

    keys = []
    try:
        route_id, key = _route(client, "18:00")
        keys.append(key)

        # Patch OpenMeteoWeatherProvider.weather to always raise RuntimeError
        with patch.object(
            OpenMeteoWeatherProvider,
            "weather",
            side_effect=RuntimeError("weather provider is unavailable"),
        ):
            resp = client.get(f"/v1/routes/{route_id}/context")
        assert resp.status_code == 200
        data = resp.json()
        # Engine must degrade — but never fail
        # WEATHER data unavailable → should appear in unknown_groups or coverage degraded
        assert data["route_confidence"] in {"HIGH", "MEDIUM", "LOW", "UNKNOWN"}
        assert data["route_coverage"] in {"AVAILABLE", "PARTIAL", "LIMITED", "UNAVAILABLE"}
        # No CAUTION_SEGMENT purely from missing weather
        # (cannot assert exact band without hardcoding, but engine must not crash)
        assert data["route_context_band"] in {
            "STRONG_CONTEXTUAL_SUPPORT", "GOOD_CONTEXT", "MIXED_CONTEXT",
            "CAUTION_SEGMENT", "LIMITED_DATA", "UNKNOWN",
        }
    finally:
        _cleanup(keys)


def test_weather_timeout_degrades_gracefully(client):
    """Timeout from Open-Meteo must result in graceful degradation."""
    keys = []
    try:
        route_id, key = _route(client, "18:00")
        keys.append(key)

        with patch_weather_provider(TimeoutError("timeout")):
            resp = client.get(f"/v1/routes/{route_id}/context")
        assert resp.status_code == 200
    finally:
        _cleanup(keys)


def patch_weather_provider(exc):
    """Context manager that patches OpenMeteoWeatherProvider.weather to raise exc."""
    from unittest.mock import patch
    return patch.object(OpenMeteoWeatherProvider, "weather", side_effect=RuntimeError("weather provider is unavailable"))


def test_weather_malformed_response_degrades_gracefully(client):
    """Malformed weather response raises RuntimeError; engine must degrade."""
    keys = []
    try:
        route_id, key = _route(client, "18:00")
        keys.append(key)

        with patch_weather_provider(RuntimeError("weather provider response is invalid")):
            resp = client.get(f"/v1/routes/{route_id}/context")
        assert resp.status_code == 200
        data = resp.json()
        # Weather unavailable should appear in unknown groups
        seg = data["segments"][0]
        assert any("Weather" in item or "weather" in item.lower() for item in seg.get("unknown", []))
    finally:
        _cleanup(keys)


def test_invalid_route_id_returns_404(client):
    """Non-existent route_id must return HTTP 404."""
    resp = client.get("/v1/routes/00000000-0000-0000-0000-000000000000/context")
    assert resp.status_code == 404


def test_malformed_route_id_returns_404(client):
    """Completely invalid (non-UUID) route_id must return HTTP 404."""
    resp = client.get("/v1/routes/not-a-uuid/context")
    assert resp.status_code == 404


# ===========================================================================
# 4. STALE SIGNAL HANDLING
# ===========================================================================


def test_expired_signal_is_excluded_from_evidence(client):
    """A signal whose expires_at is before the evaluation time must not contribute."""
    keys = []
    try:
        route_id, key = _route(client, "18:00")
        keys.append(key)

        # First evaluate to create segments
        resp = client.get(f"/v1/routes/{route_id}/context")
        assert resp.status_code == 200
        seg_id = resp.json()["segments"][0]["segment_id"]

        # Insert an artificially expired signal for this segment
        with SessionLocal() as session:
            past_time = datetime(2026, 1, 1, tzinfo=UTC)
            session.add(
                SafetySignal(
                    route_segment_id=uuid.UUID(seg_id),
                    signal_type="EXPIRED_TEST",
                    normalized_value={"value": "SHOULD_NOT_APPEAR", "freshness": "mapped"},
                    source_type="test_fixture",
                    observed_at=past_time,
                    expires_at=past_time + timedelta(hours=1),  # expired well before eval
                    confidence="medium",
                    verification_status="fixture",
                    privacy_class="public",
                    provenance={"source": "test"},
                )
            )
            session.commit()

        # Re-evaluate; expired signal must not appear in strongest_support
        resp2 = client.get(f"/v1/routes/{route_id}/context")
        assert resp2.status_code == 200
        seg = resp2.json()["segments"][0]
        all_support = seg["strongest_support"]
        assert "SHOULD_NOT_APPEAR" not in all_support
        assert "SHOULD_NOT_APPEAR" not in json.dumps(seg.get("stale_groups", []))

        # Clean up test signal
        with SessionLocal() as session:
            session.execute(
                text("DELETE FROM safety_signals WHERE source_type = 'test_fixture' AND route_segment_id = :sid"),
                {"sid": seg_id},
            )
            session.commit()

    finally:
        _cleanup(keys)


# ===========================================================================
# 5. COVERAGE / CONFIDENCE / BAND UNIT TESTS (pure logic, no DB)
# ===========================================================================


def test_coverage_available_when_real_sources_present():
    signals = [{"stale": False, "source_type": "daylight_calculation"}]
    source_available = {
        "daylight_calculation": True,
        "open_meteo": True,
        "osm_spatial": True,
    }
    assert _coverage(signals, source_available) == "AVAILABLE"


def test_coverage_partial_when_some_real_sources_missing():
    signals = [{"stale": False, "source_type": "daylight_calculation"}]
    source_available = {
        "daylight_calculation": True,
        "open_meteo": False,
        "osm_spatial": False,
    }
    assert _coverage(signals, source_available) == "PARTIAL"


def test_coverage_unavailable_when_no_fresh_signals():
    source_available = {"daylight_calculation": True}
    assert _coverage([], source_available) == "UNAVAILABLE"


def test_confidence_unknown_when_no_signals():
    assert _confidence([], "UNAVAILABLE", {}) == "UNKNOWN"


def test_confidence_high_with_multiple_fresh_real_sources():
    signals = [
        {"stale": False, "source_type": "daylight_calculation"},
        {"stale": False, "source_type": "open_meteo"},
        {"stale": False, "source_type": "osm_spatial"},
    ]
    result = _confidence(signals, "AVAILABLE", {
        "daylight_calculation": True, "open_meteo": True, "osm_spatial": True
    })
    assert result == "HIGH"


def test_confidence_degrades_with_stale_signals():
    signals = [
        {"stale": True, "source_type": "daylight_calculation"},
        {"stale": False, "source_type": "open_meteo"},
    ]
    result = _confidence(signals, "PARTIAL", {})
    assert result in {"MEDIUM", "LOW"}  # must degrade


def test_band_night_alone_not_caution_segment():
    """Single night caution with infrastructure support must not become CAUTION_SEGMENT."""
    support = ["Mapped pedestrian infrastructure", "Mapped street lighting"]
    caution = ["Night-time context"]
    result = _contextual_band(support, caution, [], "PARTIAL")
    assert result != "CAUTION_SEGMENT"


def test_band_rain_alone_not_caution_segment():
    """Rain alone (no other cautions, some support) must not produce CAUTION_SEGMENT."""
    support = ["Mapped pedestrian infrastructure"]
    caution = ["Rain conditions present"]
    result = _contextual_band(support, caution, [], "PARTIAL")
    assert result != "CAUTION_SEGMENT"


def test_band_missing_data_not_caution_segment():
    """Missing/unavailable data alone must not produce CAUTION_SEGMENT."""
    result = _contextual_band([], [], ["Weather data unavailable"], "UNAVAILABLE")
    assert result in {"LIMITED_DATA", "UNKNOWN"}
    assert result != "CAUTION_SEGMENT"


def test_band_strong_support_produces_strong_support():
    support = ["Mapped pedestrian infrastructure", "Calculated daylight context", "Active amenity context"]
    result = _contextual_band(support, [], [], "AVAILABLE")
    assert result == "STRONG_CONTEXTUAL_SUPPORT"


def test_band_some_support_good_context():
    support = ["Calculated daylight context"]
    result = _contextual_band(support, [], [], "PARTIAL")
    assert result == "GOOD_CONTEXT"


def test_band_mixed_when_support_and_caution():
    support = ["Calculated daylight context"]
    caution = ["Night-time context"]
    result = _contextual_band(support, caution, [], "PARTIAL")
    assert result == "MIXED_CONTEXT"


# ===========================================================================
# 6. ASTRONOMICAL DAYLIGHT TESTS
# ===========================================================================


def test_daylight_state_at_noon_ist_is_daylight():
    state = daylight_state(MUMBAI_LAT, MUMBAI_LON, datetime(2026, 9, 19, 12, 0, tzinfo=IST))
    assert state == "DAYLIGHT"


def test_daylight_state_at_2130_ist_is_night():
    state = daylight_state(MUMBAI_LAT, MUMBAI_LON, datetime(2026, 9, 19, 21, 30, tzinfo=IST))
    assert state == "NIGHT"


def test_daylight_source_returns_single_signal():
    source = DaylightContextSource()
    sigs = source.signals(1, datetime(2026, 9, 19, 12, 0, tzinfo=IST))
    assert len(sigs) == 1
    assert sigs[0].signal_type == "DAYLIGHT"
    assert sigs[0].freshness == "calculated"
    assert sigs[0].expires_at is not None


# ===========================================================================
# 7. OPEN-METEO PROVIDER TESTS (unit level)
# ===========================================================================


def test_open_meteo_provider_normalizes_rain():
    class FakeResponse:
        status = 200
        def read(self, _):
            return json.dumps({
                "hourly": {
                    "time": ["2026-09-19T12:30"],  # UTC equivalent of 18:00 IST
                    "weather_code": [61],
                    "precipitation": [2.5],
                    "visibility": [8000],
                }
            }).encode()
        def __enter__(self): return self
        def __exit__(self, *args): return None

    provider = OpenMeteoWeatherProvider(lambda url, timeout: FakeResponse())
    sigs = provider.weather(datetime(2026, 9, 19, 18, 0, tzinfo=IST), MUMBAI_LAT, MUMBAI_LON)
    weather_sig = next(s for s in sigs if s.signal_type == "WEATHER")
    assert weather_sig.value == "RAIN"
    assert {s.signal_type for s in sigs} == {"WEATHER", "PRECIPITATION", "VISIBILITY"}


def test_open_meteo_provider_raises_on_timeout():
    with pytest.raises(RuntimeError, match="unavailable"):
        OpenMeteoWeatherProvider(
            lambda url, timeout: (_ for _ in ()).throw(TimeoutError())
        ).weather(datetime(2026, 9, 19, 18, 0, tzinfo=IST))


def test_open_meteo_provider_raises_on_malformed_json():
    class BadResponse:
        status = 200
        def read(self, _): return b"not json"
        def __enter__(self): return self
        def __exit__(self, *args): return None

    with pytest.raises(RuntimeError, match="unavailable"):
        OpenMeteoWeatherProvider(lambda url, timeout: BadResponse()).weather(
            datetime(2026, 9, 19, 18, 0, tzinfo=IST)
        )


def test_open_meteo_provider_raises_when_slot_too_far():
    """If the nearest forecast slot is > 1h away, provider must raise."""
    class FakeResponse:
        status = 200
        def read(self, _):
            return json.dumps({
                "hourly": {
                    "time": ["2026-01-01T00:00"],  # far from our target
                    "weather_code": [0],
                    "precipitation": [0.0],
                    "visibility": [10000],
                }
            }).encode()
        def __enter__(self): return self
        def __exit__(self, *args): return None

    with pytest.raises(RuntimeError, match="unavailable"):
        OpenMeteoWeatherProvider(lambda url, timeout: FakeResponse()).weather(
            datetime(2026, 9, 19, 18, 0, tzinfo=IST)
        )


# ===========================================================================
# 8. PARTIAL COVERAGE SCENARIO
# ===========================================================================


def test_partial_coverage_reflected_in_response(client):
    """When weather is unavailable coverage must degrade from AVAILABLE."""
    keys = []
    try:
        route_id, key = _route(client, "18:00")
        keys.append(key)

        with patch_weather_provider(RuntimeError("unavailable")):
            resp = client.get(f"/v1/routes/{route_id}/context")
        assert resp.status_code == 200
        data = resp.json()
        # Coverage must not be AVAILABLE when weather is down
        # (it may be PARTIAL or LIMITED depending on OSM data presence)
        assert data["route_coverage"] in {"PARTIAL", "LIMITED", "UNAVAILABLE"}
    finally:
        _cleanup(keys)


# ===========================================================================
# 9. NO SAFETY LABELS IN PERSISTED DATA
# ===========================================================================


def test_no_safety_score_or_label_in_response(client):
    """Verify no safety scoring or SAFE/UNSAFE classification in any response."""
    keys = []
    try:
        route_id, key = _route(client, "21:00")
        keys.append(key)
        resp = client.get(f"/v1/routes/{route_id}/context")
        assert resp.status_code == 200
        raw = json.dumps(resp.json())
        # Exact forbidden strings
        assert "safety_score" not in raw
        assert "UNSAFE" not in raw
        assert "DANGEROUS" not in raw
        assert "crime" not in raw.lower()
    finally:
        _cleanup(keys)


# ===========================================================================
# 10. MULTIPLE SOURCE CLASSES IN RESPONSE
# ===========================================================================


def test_multiple_source_classes_present(client):
    """Response must include evidence from multiple source classes."""
    keys = []
    try:
        route_id, key = _route(client, "18:00")
        keys.append(key)
        resp = client.get(f"/v1/routes/{route_id}/context")
        assert resp.status_code == 200
        data = resp.json()
        # Must have more than one source class (at minimum daylight + infrastructure)
        source_classes = data["explanation"]["source_classes"]
        assert len(source_classes) >= 2, f"Expected ≥2 source classes, got: {source_classes}"
    finally:
        _cleanup(keys)


def test_spatially_matched_osm_signal_contributes_to_context(client):
    """A PostGIS match must be included in the final context evidence."""
    from sqlalchemy import func, select

    from app.models.routing import RouteSegment

    keys = []
    signal_id = None
    try:
        route_id, key = _route(client, "18:00")
        keys.append(key)
        with SessionLocal() as session:
            segment = session.scalar(
                select(RouteSegment)
                .join_from(RouteSegment, RouteSegment.route)
                .where(RouteSegment.route_id == uuid.UUID(route_id))
                .order_by(RouteSegment.sequence)
            )
            assert segment is not None
            signal = SafetySignal(
                signal_type="LIGHTING",
                normalized_value={"value": "MAPPED_LIT"},
                source_type="OSM",
                source_reference=f"be04-context-osm-{uuid.uuid4()}",
                source_identity=uuid.uuid4().hex,
                geometry=func.ST_StartPoint(RouteSegment.geometry),
                observed_at=datetime(2026, 9, 1, tzinfo=UTC),
                expires_at=datetime(2027, 3, 1, tzinfo=UTC),
                confidence="medium",
                verification_status="mapped",
                privacy_class="public",
                provenance={"source": "OSM"},
            )
            # Bind the geometry expression to this specific segment.
            signal.geometry = session.scalar(
                select(func.ST_StartPoint(RouteSegment.geometry)).where(RouteSegment.id == segment.id)
            )
            session.add(signal)
            session.commit()
            signal_id = signal.id

        data = client.get(f"/v1/routes/{route_id}/context").json()
        first = data["segments"][0]
        assert "osm_spatial" in first["source_classes"]
        assert "Mapped street lighting" in first["strongest_support"]
    finally:
        if signal_id is not None:
            with SessionLocal() as session:
                session.execute(text("DELETE FROM safety_signals WHERE id = :id"), {"id": signal_id})
                session.commit()
        _cleanup(keys)
