from concurrent.futures import ThreadPoolExecutor
from datetime import UTC, datetime, timedelta
from uuid import uuid4

import pytest
from sqlalchemy import func, select

from app.core.config import get_settings
from app.db.session import SessionLocal
from app.models.analytics import (
    AnalyticsEvent,
    AuditEvent,
    Experiment,
    ExperimentAssignment,
    ExperimentVariant,
)
from app.modules.analytics.service import AnalyticsFailure, AnalyticsService, subject_key


@pytest.fixture(autouse=True)
def cleanup_analytics():
    yield
    with SessionLocal.begin() as session:
        session.query(ExperimentAssignment).delete()
        session.query(ExperimentVariant).delete()
        session.query(Experiment).delete()
        session.query(AnalyticsEvent).delete()
        session.query(AuditEvent).delete()


def _ingest(session, event_id, **overrides):
    arguments = {
        "event_id": event_id,
        "event_type": "ROUTE_COMPARE_COMPLETED",
        "actor_class": "ANONYMOUS",
        "dimensions": {"mode": "walking"},
        "subject": None,
        "consent": True,
        "consent_version": "v1",
    }
    return AnalyticsService().ingest(session, **(arguments | overrides))


def test_allowlist_consent_and_privacy_safe_subject():
    event_id = str(uuid4())
    with SessionLocal.begin() as session:
        assert _ingest(session, event_id, consent=False) is None
        event = _ingest(session, event_id, subject="private-session-reference")
        assert event.subject_key == subject_key("private-session-reference")
        assert event.subject_key != "private-session-reference"
        with pytest.raises(AnalyticsFailure, match="invalid_dimensions"):
            _ingest(session, str(uuid4()), dimensions={"longitude": "72.8"})
        with pytest.raises(AnalyticsFailure, match="invalid_event"):
            _ingest(session, str(uuid4()), event_type="UNRESTRICTED_EVENT")


def test_idempotency_conflict_and_concurrent_ingestion():
    event_id = str(uuid4())
    with SessionLocal.begin() as session:
        first = _ingest(session, event_id)
        assert _ingest(session, event_id).id == first.id
        with pytest.raises(AnalyticsFailure, match="idempotency_conflict"):
            _ingest(session, event_id, dimensions={"mode": "cycling"})

    concurrent_id = str(uuid4())

    def submit(_):
        with SessionLocal.begin() as session:
            return _ingest(session, concurrent_id).event_id

    with ThreadPoolExecutor(max_workers=2) as executor:
        assert list(executor.map(submit, range(2))) == [concurrent_id, concurrent_id]
    with SessionLocal() as session:
        assert session.scalar(select(func.count()).select_from(AnalyticsEvent).where(AnalyticsEvent.event_id == concurrent_id)) == 1


def test_summary_retention_privacy_deletion_and_audit():
    now = datetime.now(UTC)
    with SessionLocal.begin() as session:
        service = AnalyticsService()
        for _ in range(get_settings().analytics_minimum_count):
            _ingest(session, str(uuid4()), subject="deletion-subject")
        assert service.summary(session, now - timedelta(days=1), now + timedelta(days=1)) == [
            {"event_type": "ROUTE_COMPARE_COMPLETED", "count": get_settings().analytics_minimum_count}
        ]
        assert service.delete_subject_events(session, "deletion-subject") == get_settings().analytics_minimum_count
        expired = _ingest(session, str(uuid4()))
        expired.retention_until = now - timedelta(seconds=1)
        retention_key = f"analytics-test-retention-{uuid4()}"
        assert service.cleanup(session, retention_key) == 1
        assert service.cleanup(session, retention_key) == 0
        service.audit(session, "operator", "ADMIN_ANALYTICS_VIEWED", "request-1", {"result": "summary"})
    with SessionLocal() as session:
        assert session.scalar(select(func.count()).select_from(AnalyticsEvent)) == 0
        audit = session.scalar(select(AuditEvent))
        assert audit.actor_key != "operator"
        assert "operator" not in str(audit.metadata_)


def test_admin_api_and_experiment_assignment(client, monkeypatch):
    monkeypatch.setattr(get_settings(), "analytics_admin_token", "test-admin-token")
    headers = {"X-Analytics-Admin": "test-admin-token"}
    assert client.get("/v1/analytics/summary").status_code == 403
    assert client.post("/v1/analytics/events", json={
        "event_id": str(uuid4()), "event_type": "ROUTE_COMPARE_COMPLETED",
        "actor_class": "ANONYMOUS", "dimensions": {"mode": "walking"},
        "analytics_consent": False,
    }).json()["accepted"] is False
    created = client.post("/v1/analytics/experiments", headers=headers, json={
        "key": "context-copy", "version": 1,
        "variants": [{"key": "control", "weight": 1}, {"key": "copy-b", "weight": 1, "config": {"copy": "b"}}],
    })
    assert created.status_code == 201
    assignment_headers = {"X-Subject-Reference": "anonymous-browser-session"}
    one = client.post("/v1/analytics/experiments/context-copy/assign", headers=assignment_headers)
    two = client.post("/v1/analytics/experiments/context-copy/assign", headers=assignment_headers)
    assert one.status_code == two.status_code == 200
    assert one.json() == two.json()
    unsafe = client.post("/v1/analytics/experiments", headers=headers, json={
        "key": "unsafe", "version": 1,
        "variants": [{"key": "a", "weight": 1, "config": {"authorization": "off"}}],
    })
    assert unsafe.status_code == 422
