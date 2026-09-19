import uuid
from concurrent.futures import ThreadPoolExecutor
from datetime import UTC, datetime, timedelta

import pytest
from sqlalchemy import select, text

from app.db.session import SessionLocal
from app.models.reports import EvidenceAuditEvent, ReportEvidence
from app.modules.reports.evidence import EvidenceFailure, EvidenceService


def _report(client, session_id="evidence-owner"):
    key = f"evidence-report-{uuid.uuid4()}"
    response = client.post("/v1/reports", json={"session_id": session_id, "idempotency_key": key, "category": "LIGHTING", "observed_at": "2026-09-19T18:00:00+05:30", "coarse_area": "MUMBAI_CENTRAL"})
    return response.json()["report_id"], key


def test_evidence_authorization_validation_lifecycle_and_owner_boundary(client):
    report_id, report_key = _report(client)
    evidence_id = None
    try:
        content = b"%PDF-x"
        with SessionLocal.begin() as session:
            evidence, token, _ = EvidenceService().authorize(session, report_id, "evidence-owner", "application/pdf", len(content), f"evidence-{uuid.uuid4()}")
            evidence_id = str(evidence.id)
        with SessionLocal.begin() as session:
            accepted = EvidenceService().complete(session, report_id, evidence_id, "evidence-owner", token, content)
            assert accepted.upload_state == "ACCEPTED"
        with SessionLocal() as session:
            assert session.scalar(select(EvidenceAuditEvent).where(EvidenceAuditEvent.evidence_id == uuid.UUID(evidence_id)))
            with pytest.raises(EvidenceFailure, match="access_denied"):
                EvidenceService().list_owned(session, report_id, "other-owner")
        with SessionLocal.begin() as session:
            EvidenceService().delete(session, report_id, evidence_id, "evidence-owner")
        with SessionLocal() as session:
            assert not EvidenceService().list_owned(session, report_id, "evidence-owner")
            with pytest.raises(EvidenceFailure, match="unsupported_type"):
                EvidenceService().authorize(session, report_id, "evidence-owner", "text/html", 1, f"evidence-{uuid.uuid4()}")
            with pytest.raises(EvidenceFailure, match="invalid_size"):
                EvidenceService().authorize(session, report_id, "evidence-owner", "application/pdf", 0, f"evidence-{uuid.uuid4()}")
    finally:
        with SessionLocal.begin() as session:
            session.execute(text("DELETE FROM route_requests WHERE idempotency_key = :key"), {"key": report_key})
            session.execute(text("DELETE FROM incident_reports WHERE idempotency_key = :key"), {"key": report_key})


def test_evidence_retry_scanner_fail_closed_expiry_and_concurrent_completion(client):
    report_id, report_key = _report(client)
    evidence_id = None
    try:
        content = b"%PDF-x"
        with SessionLocal.begin() as session:
            service = EvidenceService()
            evidence, token, reused = service.authorize(session, report_id, "evidence-owner", "application/pdf", len(content), "evidence-retry-key")
            evidence_id = str(evidence.id)
            repeated, fresh_token, reused = service.authorize(session, report_id, "evidence-owner", "application/pdf", len(content), "evidence-retry-key")
            assert reused and repeated.id == evidence.id and fresh_token != token

        def complete() -> str:
            with SessionLocal.begin() as session:
                return EvidenceService().complete(session, report_id, evidence_id, "evidence-owner", fresh_token, content).upload_state

        with ThreadPoolExecutor(max_workers=2) as executor:
            assert set(executor.map(lambda _: complete(), range(2))) == {"ACCEPTED"}
        with SessionLocal() as session:
            assert session.get(ReportEvidence, uuid.UUID(evidence_id)).upload_state == "ACCEPTED"

        with SessionLocal.begin() as session:
            rejected, rejected_token, _ = EvidenceService().authorize(session, report_id, "evidence-owner", "application/pdf", 10, f"infected-{uuid.uuid4()}")
            with pytest.raises(EvidenceFailure, match="infected"):
                EvidenceService().complete(session, report_id, str(rejected.id), "evidence-owner", rejected_token, b"%PDF-EICAR")

        with SessionLocal.begin() as session:
            expired, _, _ = EvidenceService().authorize(session, report_id, "evidence-owner", "application/pdf", len(content), f"expired-{uuid.uuid4()}")
            expired.upload_expires_at = datetime.now(UTC) - timedelta(seconds=1)
            with pytest.raises(EvidenceFailure, match="expired_authorization"):
                EvidenceService().complete(session, report_id, str(expired.id), "evidence-owner", "invalid-token", content)
    finally:
        with SessionLocal.begin() as session:
            session.execute(text("DELETE FROM incident_reports WHERE idempotency_key = :key"), {"key": report_key})
