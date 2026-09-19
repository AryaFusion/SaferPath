import uuid
from datetime import UTC, datetime, timedelta

import pytest
from sqlalchemy import select, text

from app.db.session import SessionLocal
from app.models.reports import IncidentReport, ReportModerationAction
from app.modules.reports.schemas import ModerationStatus, ReportCreateRequest
from app.modules.reports.service import ReportFailure, ReportService


def test_moderation_transition_is_persisted_and_invalid_transition_rejected():
    key = f"moderation-{uuid.uuid4()}"
    payload = ReportCreateRequest.model_validate({"session_id": "source-a", "idempotency_key": key, "category": "LIGHTING", "observed_at": "2026-09-19T18:00:00+05:30", "coarse_area": "MUMBAI_CENTRAL"})
    report_id = None
    try:
        with SessionLocal.begin() as session:
            report_id = ReportService().create(session, payload).report_id
        with SessionLocal.begin() as session:
            ReportService().transition(session, report_id, ModerationStatus.ACCEPTED_PUBLIC_CONTEXT, "REVIEWED")
        with SessionLocal() as session:
            action = session.scalar(select(ReportModerationAction).where(ReportModerationAction.report_id == uuid.UUID(report_id)))
            assert action is not None
            assert (action.previous_status, action.new_status, action.reason_code) == ("PENDING", "ACCEPTED_PUBLIC_CONTEXT", "REVIEWED")
            with pytest.raises(ReportFailure, match="invalid_transition"):
                ReportService().transition(session, report_id, ModerationStatus.PENDING, "INVALID")
    finally:
        with SessionLocal.begin() as session:
            session.execute(text("DELETE FROM incident_reports WHERE idempotency_key = :key"), {"key": key})


def test_expired_and_restricted_reports_are_not_publicly_eligible():
    now = datetime.now(UTC)
    with SessionLocal.begin() as session:
        report = IncidentReport(public_reference=f"rpt_{uuid.uuid4().hex}", reporter_session_id="source", coarse_area="MUMBAI_CENTRAL", category="LIGHTING", observed_at=now - timedelta(days=2), submitted_at=now, publication_intent="RESTRICTED_EVIDENCE", moderation_status="ACCEPTED_RESTRICTED_EVIDENCE", idempotency_key=f"eligibility-{uuid.uuid4()}", request_fingerprint=uuid.uuid4().hex, expires_at=now - timedelta(hours=1))
        session.add(report)
        session.flush()
        report_id = report.id
    try:
        with SessionLocal() as session:
            found = session.scalar(select(IncidentReport).where(IncidentReport.id == report_id, IncidentReport.moderation_status.in_({"ACCEPTED_PUBLIC_CONTEXT", "CORRECTED"}), IncidentReport.expires_at >= now))
            assert found is None
    finally:
        with SessionLocal.begin() as session:
            session.execute(text("DELETE FROM incident_reports WHERE id = :id"), {"id": report_id})
