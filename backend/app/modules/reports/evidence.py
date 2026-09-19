import hashlib
import secrets
import uuid
from datetime import UTC, datetime, timedelta

from sqlalchemy import select
from sqlalchemy.orm import Session

from app.core.config import get_settings
from app.models.reports import EvidenceAuditEvent, IncidentReport, ReportEvidence

ALLOWED_TYPES = {
    "image/jpeg": b"\xff\xd8\xff",
    "image/png": b"\x89PNG\r\n\x1a\n",
    "image/webp": b"RIFF",
    "application/pdf": b"%PDF-",
}
_TRANSITIONS = {
    "REQUESTED": {"UPLOADING", "EXPIRED", "DELETED"},
    "UPLOADING": {"QUARANTINED", "REJECTED", "EXPIRED", "DELETED"},
    "QUARANTINED": {"SCANNING", "REJECTED", "EXPIRED", "DELETED"},
    "SCANNING": {"ACCEPTED", "REJECTED", "EXPIRED", "DELETED"},
    "ACCEPTED": {"EXPIRED", "DELETED"},
    "REJECTED": {"DELETED"},
    "EXPIRED": {"DELETED"},
    "DELETED": set(),
}


class EvidenceFailure(Exception):
    def __init__(self, code: str) -> None:
        self.code = code
        super().__init__(code)


class DeterministicScanner:
    def scan(self, content: bytes) -> str:
        return "INFECTED" if b"EICAR" in content else "CLEAN"


class EvidenceService:
    def __init__(self, scanner: DeterministicScanner | None = None) -> None:
        self.scanner = scanner or DeterministicScanner()

    def authorize(
        self,
        db: Session,
        report_id: str,
        session_id: str | None,
        content_type: str,
        size_bytes: int,
        idempotency_key: str,
    ) -> tuple[ReportEvidence, str, bool]:
        report = self._owned_report(db, report_id, session_id)
        content_type = content_type.lower().strip()
        if content_type not in ALLOWED_TYPES:
            raise EvidenceFailure("unsupported_type")
        if (
            not isinstance(size_bytes, int)
            or not 1 <= size_bytes <= get_settings().evidence_max_bytes
        ):
            raise EvidenceFailure("invalid_size")
        fingerprint = hashlib.sha256(
            f"{report.id}:{content_type}:{size_bytes}".encode()
        ).hexdigest()
        existing = db.scalar(
            select(ReportEvidence).where(ReportEvidence.idempotency_key == idempotency_key)
        )
        if existing:
            if existing.request_fingerprint != fingerprint or existing.report_id != report.id:
                raise EvidenceFailure("idempotency_conflict")
            if existing.upload_state != "REQUESTED":
                raise EvidenceFailure("authorization_reuse")
            token = secrets.token_urlsafe(32)
            existing.upload_token_hash = hashlib.sha256(token.encode()).hexdigest()
            existing.upload_expires_at = datetime.now(UTC) + timedelta(
                minutes=get_settings().evidence_upload_authorization_minutes
            )
            self._audit(db, existing, "UPLOAD_AUTHORIZED")
            db.flush()
            return existing, token, True
        token, now = secrets.token_urlsafe(32), datetime.now(UTC)
        evidence = ReportEvidence(
            public_reference=f"ev_{secrets.token_urlsafe(16)}",
            report_id=report.id,
            object_reference=f"evidence/{uuid.uuid4().hex}",
            content_type=content_type,
            size_bytes=size_bytes,
            upload_state="REQUESTED",
            access_class="RESTRICTED_EVIDENCE",
            upload_token_hash=hashlib.sha256(token.encode()).hexdigest(),
            upload_expires_at=now
            + timedelta(minutes=get_settings().evidence_upload_authorization_minutes),
            retention_until=now + timedelta(days=get_settings().evidence_retention_days),
            idempotency_key=idempotency_key,
            request_fingerprint=fingerprint,
        )
        db.add(evidence)
        db.flush()
        self._audit(db, evidence, "UPLOAD_AUTHORIZED")
        return evidence, token, False

    def complete(
        self,
        db: Session,
        report_id: str,
        evidence_id: str,
        session_id: str | None,
        token: str,
        content: bytes,
    ) -> ReportEvidence:
        evidence = self._evidence(db, report_id, evidence_id, session_id)
        if evidence.upload_state == "ACCEPTED":
            return evidence
        if datetime.now(UTC) > evidence.upload_expires_at:
            self._transition(db, evidence, "EXPIRED")
            raise EvidenceFailure("expired_authorization")
        if not secrets.compare_digest(
            evidence.upload_token_hash, hashlib.sha256(token.encode()).hexdigest()
        ):
            raise EvidenceFailure("invalid_authorization")
        if len(content) != evidence.size_bytes or not content.startswith(
            ALLOWED_TYPES[evidence.content_type]
        ):
            self._transition(db, evidence, "REJECTED")
            raise EvidenceFailure("invalid_content")
        for state in ("UPLOADING", "QUARANTINED", "SCANNING"):
            self._transition(db, evidence, state)
        verdict = self.scanner.scan(content)
        if verdict != "CLEAN":
            self._transition(db, evidence, "REJECTED")
            raise EvidenceFailure("infected" if verdict == "INFECTED" else "scanner_failure")
        evidence.checksum = hashlib.sha256(content).hexdigest()
        self._transition(db, evidence, "ACCEPTED")
        return evidence

    def list_owned(
        self, db: Session, report_id: str, session_id: str | None
    ) -> list[ReportEvidence]:
        report = self._owned_report(db, report_id, session_id)
        statement = (
            select(ReportEvidence)
            .where(
                ReportEvidence.report_id == report.id,
                ReportEvidence.upload_state != "DELETED",
                ReportEvidence.retention_until >= datetime.now(UTC),
            )
            .order_by(ReportEvidence.created_at)
        )
        return list(db.scalars(statement))

    def delete(self, db: Session, report_id: str, evidence_id: str, session_id: str | None) -> None:
        self._transition(db, self._evidence(db, report_id, evidence_id, session_id), "DELETED")

    def _transition(self, db: Session, evidence: ReportEvidence, state: str) -> None:
        if state not in _TRANSITIONS[evidence.upload_state]:
            raise EvidenceFailure("invalid_transition")
        evidence.upload_state = state
        self._audit(db, evidence, state)
        db.flush()

    @staticmethod
    def _audit(db: Session, evidence: ReportEvidence, event: str) -> None:
        db.add(EvidenceAuditEvent(evidence_id=evidence.id, event_type=event))

    @staticmethod
    def _owned_report(db: Session, report_id: str, session_id: str | None) -> IncidentReport:
        try:
            report = db.get(IncidentReport, uuid.UUID(report_id))
        except ValueError as exc:
            raise EvidenceFailure("not_found") from exc
        if report is None:
            raise EvidenceFailure("not_found")
        if not session_id or not secrets.compare_digest(report.reporter_session_id, session_id):
            raise EvidenceFailure("access_denied")
        return report

    def _evidence(
        self, db: Session, report_id: str, evidence_id: str, session_id: str | None
    ) -> ReportEvidence:
        report = self._owned_report(db, report_id, session_id)
        try:
            evidence = db.get(ReportEvidence, uuid.UUID(evidence_id))
        except ValueError as exc:
            raise EvidenceFailure("not_found") from exc
        if evidence is None or evidence.report_id != report.id:
            raise EvidenceFailure("not_found")
        return evidence
