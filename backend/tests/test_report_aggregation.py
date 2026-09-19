import uuid
from datetime import UTC, datetime, timedelta

from sqlalchemy import func, select, text

from app.db.session import SessionLocal
from app.models.reports import IncidentReport
from app.models.routing import RouteSegment
from app.modules.context.service import ReportContextSource
from app.modules.reports.service import ReportService


def _route_segment(client) -> tuple[str, str, uuid.UUID]:
    key = f"aggregation-route-{uuid.uuid4()}"
    response = client.post("/v1/routes/compare", json={"origin": {"longitude": 72.8373, "latitude": 19.0269}, "destination": {"longitude": 72.8433, "latitude": 19.018}, "timezone": "Asia/Kolkata", "requested_local_time": "2026-09-19T18:00:00", "time_mode": "departure", "idempotency_key": key})
    route_id = uuid.UUID(response.json()["routes"][0]["id"])
    with SessionLocal() as session:
        segment = session.scalar(select(RouteSegment).where(RouteSegment.route_id == route_id).order_by(RouteSegment.sequence))
        assert segment is not None
        return key, str(route_id), segment.id


def _report(segment_id: uuid.UUID, source: str, category: str, observed: datetime) -> IncidentReport:
    return IncidentReport(
        public_reference=f"rpt_{uuid.uuid4().hex}", reporter_session_id=source, route_segment_id=segment_id,
        category=category, observed_at=observed, submitted_at=observed,
        publication_intent="PUBLIC_CONTEXT", moderation_status="ACCEPTED_PUBLIC_CONTEXT",
        idempotency_key=f"aggregation-{uuid.uuid4()}", request_fingerprint=uuid.uuid4().hex,
        expires_at=observed + timedelta(days=2),
    )


def test_report_aggregation_distinguishes_single_duplicate_independent_and_conflicting(client):
    route_key, _, segment_id = _route_segment(client)
    now = datetime(2026, 9, 19, 12, 30, tzinfo=UTC)
    report_ids: list[uuid.UUID] = []
    try:
        with SessionLocal.begin() as session:
            single = _report(segment_id, "source-a", "LIGHTING", now)
            duplicate = _report(segment_id, "source-a", "LIGHTING", now + timedelta(minutes=1))
            independent = _report(segment_id, "source-b", "LIGHTING", now + timedelta(minutes=2))
            conflict = _report(segment_id, "source-c", "TRANSIT_CONTEXT", now + timedelta(minutes=3))
            session.add_all([single, duplicate, independent, conflict])
            session.flush()
            report_ids.extend([single.id, duplicate.id, independent.id, conflict.id])
            service = ReportService()
            assert service.relate(session, single.id, duplicate.id).relationship_type == "DUPLICATE"
            # Reverse insertion is canonical and does not create a second row.
            assert service.relate(session, duplicate.id, single.id).id == service.relate(session, single.id, duplicate.id).id
            assert service.relate(session, single.id, conflict.id).relationship_type == "CONFLICTING"

        with SessionLocal() as session:
            segment = session.get(RouteSegment, segment_id)
            signal = ReportContextSource(session).signals(segment, now + timedelta(minutes=5))[0]
            # The duplicate is suppressed; independent sources corroborate, but
            # a persisted conflict must take precedence as uncertainty.
            assert signal.value == "CONFLICTING"
            assert signal.source_type == "community_reports"
    finally:
        with SessionLocal.begin() as session:
            session.execute(text("DELETE FROM route_requests WHERE idempotency_key = :key"), {"key": route_key})


def test_relationship_temporal_boundary_and_distinct_classification(client):
    route_key, _, segment_id = _route_segment(client)
    now = datetime(2026, 9, 19, 12, 30, tzinfo=UTC)
    try:
        with SessionLocal.begin() as session:
            first = _report(segment_id, "a", "LIGHTING", now)
            at_boundary = _report(segment_id, "b", "LIGHTING", now + timedelta(minutes=30))
            related = _report(segment_id, "d", "LIGHTING", now + timedelta(minutes=31))
            outside = _report(segment_id, "c", "LIGHTING", now + timedelta(minutes=61))
            session.add_all([first, at_boundary, related, outside])
            session.flush()
            service = ReportService()
            assert service.relate(session, first.id, at_boundary.id).relationship_type == "DUPLICATE"
            assert service.relate(session, first.id, related.id).relationship_type == "RELATED"
            assert service.relate(session, first.id, outside.id).relationship_type == "DISTINCT"
    finally:
        with SessionLocal.begin() as session:
            session.execute(text("DELETE FROM route_requests WHERE idempotency_key = :key"), {"key": route_key})


def test_coarse_postgis_association_is_persisted_and_internal(client):
    route_key, _, segment_id = _route_segment(client)
    now = datetime(2026, 9, 19, 12, 30, tzinfo=UTC)
    try:
        with SessionLocal.begin() as session:
            report = _report(segment_id, "private-source", "LIGHTING", now)
            report.coarse_geometry = session.scalar(
                select(func.ST_StartPoint(RouteSegment.geometry)).where(RouteSegment.id == segment_id)
            )
            session.add(report)
            session.flush()
            associations = ReportService().associate_segments(session, report)
            assert [association.route_segment_id for association in associations] == sorted(
                association.route_segment_id for association in associations
            )
            assert segment_id in {association.route_segment_id for association in associations}
            assert all(association.strength == "COARSE_PROXIMITY" for association in associations)
    finally:
        with SessionLocal.begin() as session:
            session.execute(text("DELETE FROM route_requests WHERE idempotency_key = :key"), {"key": route_key})
