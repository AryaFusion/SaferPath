import json
import urllib.error
import urllib.request
import uuid
from datetime import UTC, datetime, timedelta

import pytest
from sqlalchemy import func, select, text
from sqlalchemy.exc import SQLAlchemyError

from app.core.config import Settings, get_settings
from app.db.session import SessionLocal
from app.models.context import SafetySignal
from app.models.routing import Route, RouteRequest, RouteSegment
from app.modules.context.ingestion.osm_import import normalize, overpass_url, pilot_bbox
from app.modules.context.spatial import (
    SpatialMatch,
    _distance,
    get_spatial_distance,
    match_signals,
)


@pytest.fixture
def test_context():
    """Create a persistent RouteSegment in Mumbai pilot area for PostGIS spatial matching tests."""
    prefix = f"postgis-test-{uuid.uuid4().hex[:8]}"
    with SessionLocal() as session:
        req = RouteRequest(
            origin=func.ST_GeomFromText("POINT(72.8370 19.0260)", 4326),
            destination=func.ST_GeomFromText("POINT(72.8380 19.0260)", 4326),
            timezone="Asia/Kolkata",
            requested_local_time=datetime(2026, 9, 19, 18, 0),
            time_mode="departure",
            travel_mode="walking",
            route_preference="balanced",
            idempotency_key=f"{prefix}-req",
            request_fingerprint=uuid.uuid4().hex,
            expires_at=datetime.now(UTC) + timedelta(days=1),
        )
        session.add(req)
        session.flush()

        route = Route(
            route_request_id=req.id,
            provider="test",
            sequence=1,
            duration_seconds=100,
            distance_meters=105,
            geometry=func.ST_GeomFromText("LINESTRING(72.8370 19.0260, 72.8380 19.0260)", 4326),
        )
        session.add(route)
        session.flush()

        segment = RouteSegment(
            route_id=route.id,
            canonical_id=f"{prefix}-seg-1",
            sequence=1,
            geometry=func.ST_GeomFromText("LINESTRING(72.8370 19.0260, 72.8380 19.0260)", 4326),
            length_meters=105,
            travel_seconds=100,
        )
        session.add(segment)
        session.commit()
        segment_id = segment.id
        req_id = req.id

    yield prefix, segment_id

    with SessionLocal() as session:
        session.execute(
            text("DELETE FROM safety_signals WHERE source_reference LIKE :prefix"),
            {"prefix": f"{prefix}%"},
        )
        session.execute(
            text("DELETE FROM route_requests WHERE id = :id"),
            {"id": req_id},
        )
        session.commit()


def _add_signal(session, ref, sig_type, geom_wkt, srid=4326):
    sig = SafetySignal(
        signal_type=sig_type,
        normalized_value={"value": "TEST"},
        source_type="OSM",
        source_reference=str(ref),
        source_identity=f"ident-{ref}",
        geometry=func.ST_SetSRID(func.ST_GeomFromText(geom_wkt), srid),
        observed_at=datetime.now(UTC),
        confidence="medium",
        verification_status="mapped",
        privacy_class="public",
        provenance={"source": "OSM", "test": True},
    )
    session.add(sig)
    session.flush()
    return sig


# -----------------------------------------------------------------------------
# A, B, C: POINT within, outside, and boundary-distance
# -----------------------------------------------------------------------------


def test_point_signal_within_and_outside_configured_distance(test_context):
    prefix, segment_id = test_context
    with SessionLocal() as session:
        segment = session.get(RouteSegment, segment_id)

        # Point exactly on segment (distance 0m < 30m configured distance for LIGHTING)
        sig_near = _add_signal(session, f"{prefix}-lamp-near", "LIGHTING", "POINT(72.8375 19.0260)")

        # Point ~500m away (outside 30m, 75m, 150m)
        sig_far = _add_signal(session, f"{prefix}-lamp-far", "LIGHTING", "POINT(72.8420 19.0260)")
        session.commit()

        matches = match_signals(session, segment)
        matched_ids = {m.signal_id for m in matches}

        # A: within configured distance
        assert str(sig_near.id) in matched_ids
        # B: outside configured distance
        assert str(sig_far.id) not in matched_ids


def test_point_signal_boundary_distance_behavior(test_context):
    prefix, segment_id = test_context
    with SessionLocal() as session:
        segment = session.get(RouteSegment, segment_id)

        # In Mumbai at lat ~19.0260:
        # 1 deg latitude ≈ 110,650 meters -> 0.0001 deg latitude ≈ 11.065 meters
        # 0.0002 deg latitude ≈ 22.13 meters (< 30m threshold)
        # 0.00035 deg latitude ≈ 38.7 meters (> 30m threshold, but < 75m threshold)
        # 0.0008 deg latitude ≈ 88.5 meters (> 75m threshold, but < 150m threshold)
        # 0.0018 deg latitude ≈ 199.1 meters (> 150m threshold)

        sig_22m = _add_signal(session, f"{prefix}-lamp-22m", "LIGHTING", "POINT(72.8375 19.02620)")
        sig_38m_lamp = _add_signal(session, f"{prefix}-lamp-38m", "LIGHTING", "POINT(72.8375 19.02635)")
        sig_38m_activity = _add_signal(session, f"{prefix}-act-38m", "ACTIVITY", "POINT(72.8375 19.02635)")
        sig_88m_activity = _add_signal(session, f"{prefix}-act-88m", "ACTIVITY", "POINT(72.8375 19.02680)")
        sig_88m_transit = _add_signal(session, f"{prefix}-trn-88m", "TRANSIT", "POINT(72.8375 19.02680)")
        sig_200m_transit = _add_signal(session, f"{prefix}-trn-200m", "TRANSIT", "POINT(72.8375 19.02780)")
        session.commit()

        # Measure exact geodesic distance via PostGIS geography
        dist_22m = session.scalar(
            select(
                func.ST_Distance(
                    func.geography(SafetySignal.geometry),
                    func.geography(RouteSegment.geometry),
                )
            )
            .select_from(SafetySignal)
            .join(RouteSegment, RouteSegment.id == segment.id)
            .where(SafetySignal.id == sig_22m.id)
        )
        assert 20.0 < dist_22m < 25.0  # ~22.1m

        dist_38m = session.scalar(
            select(
                func.ST_Distance(
                    func.geography(SafetySignal.geometry),
                    func.geography(RouteSegment.geometry),
                )
            )
            .select_from(SafetySignal)
            .join(RouteSegment, RouteSegment.id == segment.id)
            .where(SafetySignal.id == sig_38m_lamp.id)
        )
        assert 35.0 < dist_38m < 42.0  # ~38.7m

        matches = match_signals(session, segment)
        matched_ids = {m.signal_id for m in matches}

        # 22m lamp (within 30m) matches
        assert str(sig_22m.id) in matched_ids

        # 38m lamp (outside 30m) does NOT match
        assert str(sig_38m_lamp.id) not in matched_ids

        # 38m activity (within 75m) DOES match
        assert str(sig_38m_activity.id) in matched_ids

        # 88m activity (outside 75m) does NOT match
        assert str(sig_88m_activity.id) not in matched_ids

        # 88m transit (within 150m) DOES match
        assert str(sig_88m_transit.id) in matched_ids

        # 200m transit (outside 150m) does NOT match
        assert str(sig_200m_transit.id) not in matched_ids


# -----------------------------------------------------------------------------
# D, E: LINESTRING intersecting and not intersecting
# -----------------------------------------------------------------------------


def test_linestring_intersecting_and_not_intersecting(test_context):
    prefix, segment_id = test_context
    with SessionLocal() as session:
        segment = session.get(RouteSegment, segment_id)

        # Route segment is LINESTRING(72.8370 19.0260, 72.8380 19.0260)
        # Crossing street intersects segment at (72.8375, 19.0260)
        sig_crossing = _add_signal(
            session,
            f"{prefix}-cross-road",
            "PEDESTRIAN_INFRASTRUCTURE",
            "LINESTRING(72.8375 19.0250, 72.8375 19.0270)",
        )

        # Parallel street 100m away does NOT intersect
        sig_parallel = _add_signal(
            session,
            f"{prefix}-parallel-road",
            "PEDESTRIAN_INFRASTRUCTURE",
            "LINESTRING(72.8370 19.0270, 72.8380 19.0270)",
        )
        session.commit()

        matches = match_signals(session, segment)
        matched_ids = {m.signal_id for m in matches}

        # D: LINESTRING intersecting
        assert str(sig_crossing.id) in matched_ids

        # E: LINESTRING not intersecting
        assert str(sig_parallel.id) not in matched_ids

        # Check match details
        cross_match = next(m for m in matches if m.signal_id == str(sig_crossing.id))
        assert cross_match.relationship == "INTERSECTION"
        assert cross_match.strength == "EXACT_INTERSECTION"


# -----------------------------------------------------------------------------
# F, G: POLYGON intersecting and not intersecting
# -----------------------------------------------------------------------------


def test_polygon_intersecting_and_not_intersecting(test_context):
    prefix, segment_id = test_context
    with SessionLocal() as session:
        segment = session.get(RouteSegment, segment_id)

        # Amenity polygon covering the middle of the segment
        sig_poly_hit = _add_signal(
            session,
            f"{prefix}-amenity-poly",
            "ACTIVITY",
            "POLYGON((72.8372 19.0258, 72.8378 19.0258, 72.8378 19.0262, 72.8372 19.0262, 72.8372 19.0258))",
        )

        # Distant park polygon 500m away
        sig_poly_miss = _add_signal(
            session,
            f"{prefix}-park-poly",
            "ACTIVITY",
            "POLYGON((72.8420 19.0300, 72.8430 19.0300, 72.8430 19.0310, 72.8420 19.0310, 72.8420 19.0300))",
        )
        session.commit()

        matches = match_signals(session, segment)
        matched_ids = {m.signal_id for m in matches}

        # F: POLYGON intersecting
        assert str(sig_poly_hit.id) in matched_ids

        # G: POLYGON not intersecting
        assert str(sig_poly_miss.id) not in matched_ids

        # Check match details
        poly_match = next(m for m in matches if m.signal_id == str(sig_poly_hit.id))
        assert poly_match.relationship == "INTERSECTION"
        assert poly_match.strength == "EXACT_INTERSECTION"


# -----------------------------------------------------------------------------
# H, I, J, K, L: Multiple matching signals, ordering, association, labels
# -----------------------------------------------------------------------------


def test_multiple_matching_signals_association_and_labels(test_context):
    prefix, segment_id = test_context
    with SessionLocal() as session:
        segment = session.get(RouteSegment, segment_id)

        sig1 = _add_signal(session, f"{prefix}-lamp-1", "LIGHTING", "POINT(72.8372 19.0260)")
        sig2 = _add_signal(session, f"{prefix}-lamp-2", "LIGHTING", "POINT(72.8378 19.0260)")
        sig3 = _add_signal(
            session,
            f"{prefix}-footway",
            "PEDESTRIAN_INFRASTRUCTURE",
            "LINESTRING(72.8374 19.0255, 72.8374 19.0265)",
        )
        sig4 = _add_signal(
            session,
            f"{prefix}-cafe",
            "ACTIVITY",
            "POLYGON((72.8371 19.0259, 72.8373 19.0259, 72.8373 19.0261, 72.8371 19.0261, 72.8371 19.0259))",
        )
        session.commit()

        # H: multiple matching signals returned
        matches = match_signals(session, segment)
        matched_ids = [m.signal_id for m in matches]
        expected_ids = {str(s.id) for s in (sig1, sig2, sig3, sig4)}
        assert expected_ids.issubset(set(matched_ids))

        # I: deterministic ordering
        matches_second_run = match_signals(session, segment)
        assert matches == matches_second_run
        # Must be strictly sorted
        assert matched_ids == sorted(matched_ids)

        # J: signal -> route segment association
        for m in matches:
            assert m.segment_id == str(segment.id)

        # K, L: spatial relationship and strength
        m_sig1 = next(m for m in matches if m.signal_id == str(sig1.id))
        assert m_sig1.relationship == "PROXIMITY"
        assert m_sig1.strength == "STRONG_PROXIMITY"

        m_sig3 = next(m for m in matches if m.signal_id == str(sig3.id))
        assert m_sig3.relationship == "INTERSECTION"
        assert m_sig3.strength == "EXACT_INTERSECTION"

        m_sig4 = next(m for m in matches if m.signal_id == str(sig4.id))
        assert m_sig4.relationship == "INTERSECTION"
        assert m_sig4.strength == "EXACT_INTERSECTION"


# -----------------------------------------------------------------------------
# M: SRID mismatch prevented and handled correctly
# -----------------------------------------------------------------------------


def test_srid_mismatch_prevented_and_handled(test_context):
    prefix, segment_id = test_context
    with SessionLocal() as session:
        segment = session.get(RouteSegment, segment_id)

        # 1. Database level: column safety_signals.geometry enforces SRID 4326
        with pytest.raises(SQLAlchemyError):
            session.execute(
                text(
                    "INSERT INTO safety_signals (id, signal_type, normalized_value, source_type, source_reference, source_identity, geometry, observed_at, confidence, verification_status, privacy_class, provenance) "
                    "VALUES (:id, 'TEST', '{\"value\": 1}', 'OSM', 'srid-fail', :ident, ST_SetSRID(ST_MakePoint(72.8, 19.0), 3857), :now, 'medium', 'mapped', 'public', '{}')"
                ),
                {
                    "id": uuid.uuid4(),
                    "ident": f"srid-mismatch-{uuid.uuid4()}",
                    "now": datetime.now(UTC),
                },
            )
            session.commit()
        session.rollback()

        # 2. Database level: route_segments.geometry also enforces SRID 4326
        bad_seg = RouteSegment(
            id=uuid.uuid4(),
            route_id=segment.route_id,
            canonical_id=f"{prefix}-bad-srid",
            sequence=99,
            geometry=func.ST_SetSRID(func.ST_GeomFromText("LINESTRING(0 0, 1 1)"), 3857),
            length_meters=1,
            travel_seconds=1,
        )
        with pytest.raises(SQLAlchemyError):
            session.add(bad_seg)
            session.flush()
        session.rollback()

        # 3. Matcher level: if RouteSegment has mismatched SRID, ValueError is raised
        class DummySegment:
            id = uuid.uuid4()

        # Mock db scalar returning non-4326 SRID for RouteSegment
        class DummySession:
            def scalar(self, stmt):
                return 3857

        with pytest.raises(ValueError, match="does not match expected 4326"):
            match_signals(DummySession(), DummySegment())


# -----------------------------------------------------------------------------
# 3. VERIFY CONFIGURED DISTANCES
# -----------------------------------------------------------------------------


def test_signal_type_association_distance_configuration():
    # Initial configured distances from plan:
    # street_lamp: 30m, activity: 75m, transit: 150m, default: 30m
    settings = get_settings()
    assert settings.spatial_distance_street_lamp_meters == 30
    assert settings.spatial_distance_activity_meters == 75
    assert settings.spatial_distance_transit_meters == 150
    assert settings.spatial_distance_default_meters == 30

    assert get_spatial_distance("LIGHTING") == 30
    assert get_spatial_distance("street_lamp") == 30
    assert get_spatial_distance("ACTIVITY") == 75
    assert get_spatial_distance("TRANSIT") == 150
    assert get_spatial_distance("UNKNOWN_SIGNAL") == 30
    assert _distance("LIGHTING") == 30

    # Test configuration override behavior
    custom = Settings(
        database_url="postgresql+psycopg://test:test@localhost/test",
        spatial_distance_street_lamp_meters=45,
        spatial_distance_activity_meters=90,
        spatial_distance_transit_meters=200,
        spatial_distance_default_meters=50,
    )
    assert get_spatial_distance("LIGHTING", custom) == 45
    assert get_spatial_distance("ACTIVITY", custom) == 90
    assert get_spatial_distance("TRANSIT", custom) == 200
    assert get_spatial_distance("OTHER", custom) == 50


# -----------------------------------------------------------------------------
# 4. VERIFY MISSING DATA SEMANTICS
# -----------------------------------------------------------------------------


def test_missing_data_semantics_no_safety_penalties(test_context):
    prefix, segment_id = test_context
    with SessionLocal() as session:
        segment = session.get(RouteSegment, segment_id)

        # Element with absent lighting tag does NOT emit an UNLIT signal
        node_no_lighting = {"type": "node", "id": 1, "tags": {"amenity": "bench"}}
        norm = normalize(node_no_lighting)
        signal_types = {item[0] for item in norm}
        assert "LIGHTING" not in signal_types

        # Element with absent activity tag does NOT emit NO_ACTIVITY signal
        node_no_activity = {"type": "node", "id": 2, "tags": {"highway": "crossing"}}
        norm_act = normalize(node_no_activity)
        act_types = {item[0] for item in norm_act}
        assert "ACTIVITY" not in act_types

        # Spatial non-match does NOT emit safety warning
        # Far signal ~1km away
        _add_signal(session, f"{prefix}-far-bench", "ACTIVITY", "POINT(72.8500 19.0300)")
        session.commit()

        matches = match_signals(session, segment)
        # Returns clean SpatialMatch objects only; NO safety scores or warnings
        for m in matches:
            assert isinstance(m, SpatialMatch)
            assert not hasattr(m, "safety_score")
            assert not hasattr(m, "warning")
            assert not hasattr(m, "penalty")


# -----------------------------------------------------------------------------
# 5. VERIFY DETERMINISM
# -----------------------------------------------------------------------------


def test_spatial_matching_is_deterministic(test_context):
    prefix, segment_id = test_context
    with SessionLocal() as session:
        segment = session.get(RouteSegment, segment_id)

        _add_signal(session, f"{prefix}-det-1", "LIGHTING", "POINT(72.8371 19.0260)")
        _add_signal(session, f"{prefix}-det-2", "LIGHTING", "POINT(72.8376 19.0260)")
        _add_signal(
            session,
            f"{prefix}-det-3",
            "PEDESTRIAN_INFRASTRUCTURE",
            "LINESTRING(72.8375 19.0255, 72.8375 19.0265)",
        )
        session.commit()

        run1 = match_signals(session, segment)
        run2 = match_signals(session, segment)
        run3 = match_signals(session, segment)

        assert run1 == run2 == run3
        assert [m.signal_id for m in run1] == sorted(m.signal_id for m in run1)
        assert all(m.relationship in {"PROXIMITY", "INTERSECTION"} for m in run1)
        assert all(m.strength in {"STRONG_PROXIMITY", "EXACT_INTERSECTION"} for m in run1)


# -----------------------------------------------------------------------------
# 8. BOUNDED OVERPASS SMOKE
# -----------------------------------------------------------------------------


def test_bounded_overpass_smoke():
    """Bounded Overpass smoke test:
    - uses configured endpoint
    - stays inside Mumbai pilot bbox
    - bounded timeout (15s)
    - bounded feature count (limit 1)
    - does NOT persist uncontrolled external data
    - reports honest status if external network is unavailable
    """
    south, west, north, east = pilot_bbox()
    endpoint = overpass_url()
    assert endpoint.startswith("https://")

    timeout = min(get_settings().osm_import_timeout_seconds, 30)
    query = f"[out:json][timeout:{timeout}];node({south:.2f},{west:.2f},{south + 0.02:.2f},{west + 0.02:.2f})[amenity];out 1;"
    req = urllib.request.Request(
        endpoint,
        data=query.encode("utf-8"),
        headers={
            "User-Agent": "SaferPath-Verification-Smoke/1.0",
            "Content-Type": "application/x-www-form-urlencoded",
        },
    )

    try:
        with urllib.request.urlopen(req, timeout=timeout) as resp:
            assert resp.status == 200
            raw = resp.read(20000)
            data = json.loads(raw)
            assert "elements" in data
            # Feature count is bounded
            assert len(data["elements"]) <= 1
            # Verify coordinates stay within pilot bounds if returned
            for el in data["elements"]:
                if "lat" in el and "lon" in el:
                    assert south <= el["lat"] <= north
                    assert west <= el["lon"] <= east
    except (urllib.error.URLError, TimeoutError, OSError) as exc:
        pytest.skip(f"External Overpass network access unavailable: {exc}")
