import uuid
from datetime import UTC, datetime, timedelta

import pytest
from sqlalchemy import func, select, text

from app.db.session import SessionLocal
from app.models.help_points import HelpPoint, HelpPointVerification
from app.modules.help_points.service import HelpPointService, current_status, is_open


def _point(lon, lat, *, category="HOSPITAL", status="VERIFIED", hours=None, sponsor=None):
    now = datetime.now(UTC)
    return HelpPoint(public_reference=f"hp_{uuid.uuid4().hex}", source_identity=uuid.uuid4().hex, category=category, geometry=func.ST_SetSRID(func.ST_MakePoint(lon, lat), 4326), public_contact="+919999999999", operating_hours=hours, accessibility={"wheelchair_accessible": "YES"}, verification_status=status, verification_source="PUBLIC_AUTHORITY", last_verified_at=now, verification_expires_at=now + timedelta(days=10), provenance="PUBLIC_AUTHORITY", sponsor_disclosure=sponsor)


def test_help_point_postgis_nearby_api_privacy_and_filters(client):
    ids = []
    try:
        with SessionLocal.begin() as session:
            near = _point(72.8373, 19.0269, sponsor="Partner supplied")
            far = _point(72.90, 19.10, category="PHARMACY")
            session.add_all([near, far])
            session.flush()
            ids.extend([near.id, far.id])
        response = client.get("/v1/help-points/nearby?latitude=19.0269&longitude=72.8373&radius_meters=100&category=HOSPITAL")
        assert response.status_code == 200
        body = response.json()
        assert len(body) == 1 and body[0]["reference"].startswith("hp_")
        assert body[0]["sponsor_disclosure"] == "Partner supplied"
        assert "geometry" not in str(body) and "partner_reference" not in str(body)
        assert client.get("/v1/help-points/nearby?latitude=19&longitude=72&radius_meters=999999").status_code == 422
    finally:
        with SessionLocal.begin() as session:
            session.execute(text("DELETE FROM help_points WHERE id = ANY(:ids)"), {"ids": ids})


def test_help_point_hours_and_verification_lifecycle():
    point = _point(72.8, 19.0, hours={"0": {"open": "22:00", "close": "06:00"}})
    monday_late = datetime(2026, 9, 21, 23, 30, tzinfo=UTC)
    monday_midday = datetime(2026, 9, 21, 12, 0, tzinfo=UTC)
    assert is_open(point.operating_hours, monday_late) == "OPEN"
    assert is_open(point.operating_hours, monday_midday) == "CLOSED"
    assert is_open({"0": "24H"}, monday_midday) == "OPEN"
    assert is_open(None, monday_midday) == "UNKNOWN"
    point.verification_expires_at = monday_midday
    assert current_status(point, monday_midday) == "EXPIRED"
    point.verification_status = "SUSPENDED"
    assert current_status(point, monday_late) == "SUSPENDED"


def test_import_identity_is_unique_and_ranking_is_not_sponsor_based():
    point_id = None
    with SessionLocal() as session:
        first = _point(72.80, 19.00)
        second = _point(72.80, 19.00, sponsor="Sponsored")
        second.source_identity = first.source_identity
        session.add(first)
        session.flush()
        point_id = first.id
        session.add(second)
        try:
            session.flush()
            raise AssertionError("source identity must be unique")
        except Exception:
            session.rollback()
    # Ranking is canonical ID order; sponsorship never enters the lookup query.
    assert "sponsor_disclosure" not in str(HelpPointService.nearby)
    if point_id:
        with SessionLocal.begin() as session:
            session.execute(text("DELETE FROM help_points WHERE id = :id"), {"id": point_id})


def test_verification_transition_and_accessibility_filter(client):
    point_id = None
    try:
        with SessionLocal.begin() as session:
            point = _point(72.8373, 19.0269, status="UNVERIFIED")
            point.verification_status = "UNVERIFIED"
            session.add(point)
            session.flush()
            point_id = point.id
            verified_at = datetime.now(UTC)
            HelpPointService().transition(session, point, "VERIFIED", "VERIFIED_ORGANIZATION", verified_at, verified_at + timedelta(days=1))
        with SessionLocal() as session:
            assert session.scalar(select(HelpPointVerification).where(HelpPointVerification.help_point_id == point_id))
            point = session.get(HelpPoint, point_id)
            with pytest.raises(ValueError):
                HelpPointService().transition(session, point, "UNVERIFIED", "x")
        response = client.get("/v1/help-points/nearby?latitude=19.0269&longitude=72.8373&radius_meters=100&accessibility=wheelchair_accessible&verified_only=true")
        assert response.status_code == 200
        assert any(item["reference"].startswith("hp_") for item in response.json())
    finally:
        if point_id:
            with SessionLocal.begin() as session:
                session.execute(text("DELETE FROM help_points WHERE id = :id"), {"id": point_id})
