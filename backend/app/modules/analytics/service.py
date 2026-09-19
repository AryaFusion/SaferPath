"""Privacy-minimized product analytics.  This module is intentionally separate from audit."""
import hashlib
import hmac
from datetime import UTC, datetime, timedelta

from sqlalchemy import delete, func, select
from sqlalchemy.exc import IntegrityError
from sqlalchemy.orm import Session

from app.core.config import get_settings
from app.models.analytics import (
    AnalyticsEvent,
    AuditEvent,
    Experiment,
    ExperimentAssignment,
    ExperimentVariant,
)
from app.models.job_run import JobRun

EVENT_TYPES = frozenset({
    "ROUTE_COMPARE_STARTED", "ROUTE_COMPARE_COMPLETED", "ROUTE_COMPARE_FAILED", "CONTEXT_VIEWED",
    "CONTEXT_DEGRADED", "HELP_POINT_VIEWED", "TRIP_STARTED", "TRIP_COMPLETED", "TRIP_STOPPED",
    "TRIP_DEVIATION_DETECTED", "TRIP_DEVIATION_CONFIRMED", "TRIP_DEVIATION_REJECTED",
    "TRIP_DEVIATION_UNCERTAIN", "ALTERNATE_PATH_EVALUATED", "CHECKIN_COMPLETED", "CHECKIN_MISSED",
    "SHARING_GRANT_CREATED", "SHARING_GRANT_REVOKED", "EMERGENCY_HANDOFF_INITIATED",
    "EMERGENCY_HANDOFF_STATE_CHANGED", "REPORT_SUBMITTED", "REPORT_MODERATION_RESULT", "JOB_FAILED",
    "PROVIDER_FAILURE", "PROVIDER_TIMEOUT",
})
SAFE_DIMENSIONS = frozenset({"mode", "context_band", "failure_class", "provider", "status", "result", "source", "handoff_type"})


class AnalyticsFailure(Exception):
    pass


def subject_key(subject: str) -> str:
    """HMAC is purpose-limited and rotates by changing ANALYTICS_SUBJECT_SECRET."""
    return hmac.new(get_settings().analytics_subject_secret.encode(), subject.encode(), hashlib.sha256).hexdigest()


def validate_dimensions(dimensions: dict) -> dict:
    if set(dimensions) - SAFE_DIMENSIONS or len(dimensions) > 8:
        raise AnalyticsFailure("invalid_dimensions")
    if any(not isinstance(v, str) or len(v) > 64 for v in dimensions.values()):
        raise AnalyticsFailure("invalid_dimensions")
    return dict(dimensions)


class AnalyticsService:
    def ingest(self, db: Session, *, event_id: str, event_type: str, actor_class: str,
               dimensions: dict, subject: str | None, consent: bool, consent_version: str | None,
               occurred_at: datetime | None = None) -> AnalyticsEvent | None:
        if not consent:
            return None
        if event_type not in EVENT_TYPES or actor_class not in {"ANONYMOUS", "USER", "SYSTEM"}:
            raise AnalyticsFailure("invalid_event")
        dimensions = validate_dimensions(dimensions)
        now = datetime.now(UTC)
        event = AnalyticsEvent(event_id=event_id, event_type=event_type, schema_version=1,
            occurred_at=occurred_at or now, actor_class=actor_class,
            subject_key=subject_key(subject) if subject else None, consent_version=consent_version,
            dimensions=dimensions, retention_until=now + timedelta(days=get_settings().analytics_retention_days))
        try:
            with db.begin_nested():
                db.add(event)
                db.flush()
            return event
        except IntegrityError:
            existing = db.scalar(select(AnalyticsEvent).where(AnalyticsEvent.event_id == event_id))
            if existing and (existing.event_type != event_type or existing.dimensions != dimensions):
                raise AnalyticsFailure("idempotency_conflict") from None
            return existing

    def summary(self, db: Session, start: datetime, end: datetime) -> list[dict]:
        if end <= start or end - start > timedelta(days=90):
            raise AnalyticsFailure("invalid_range")
        rows = db.execute(select(AnalyticsEvent.event_type, func.count(AnalyticsEvent.id)).where(
            AnalyticsEvent.occurred_at >= start, AnalyticsEvent.occurred_at < end).group_by(AnalyticsEvent.event_type)).all()
        minimum = get_settings().analytics_minimum_count
        return [{"event_type": key, "count": count} for key, count in rows if count >= minimum]

    def audit(self, db: Session, actor: str, action: str, request_id: str | None, metadata: dict | None = None) -> None:
        db.add(AuditEvent(actor_key=subject_key(actor), action=action, entity_type="analytics",
            request_id=request_id, metadata_=validate_dimensions(metadata or {}),
            retention_until=datetime.now(UTC) + timedelta(days=365)))

    def assign(self, db: Session, experiment_key: str, subject: str) -> ExperimentAssignment | None:
        exp = db.scalar(select(Experiment).where(Experiment.key == experiment_key).order_by(Experiment.version.desc()))
        now = datetime.now(UTC)
        if not exp or exp.status != "ACTIVE" or (exp.starts_at and exp.starts_at > now) or (exp.ends_at and exp.ends_at <= now):
            return None
        key = subject_key(subject)
        found = db.scalar(select(ExperimentAssignment).where(ExperimentAssignment.experiment_key == exp.key, ExperimentAssignment.experiment_version == exp.version, ExperimentAssignment.subject_key == key))
        if found:
            return found
        variants = db.scalars(select(ExperimentVariant).where(ExperimentVariant.experiment_key == exp.key, ExperimentVariant.experiment_version == exp.version, ExperimentVariant.active.is_(True))).all()
        total = sum(item.weight for item in variants)
        if total <= 0:
            raise AnalyticsFailure("invalid_experiment")
        bucket = int.from_bytes(hmac.new(get_settings().analytics_subject_secret.encode(), f"{exp.key}:{exp.version}:{key}".encode(), hashlib.sha256).digest()[:8], "big") % total
        selected = variants[-1]
        for item in variants:
            bucket -= item.weight
            if bucket < 0:
                selected = item
                break
        assignment = ExperimentAssignment(experiment_key=exp.key, experiment_version=exp.version, subject_key=key, variant_key=selected.key, assigned_at=now, expires_at=exp.ends_at)
        db.add(assignment)
        db.flush()
        return assignment

    def cleanup(self, db: Session, idempotency_key: str) -> int:
        prior = db.scalar(select(JobRun).where(JobRun.job_type == "analytics_retention", JobRun.idempotency_key == idempotency_key))
        if prior and prior.status == "completed":
            return 0
        job = prior or JobRun(job_type="analytics_retention", idempotency_key=idempotency_key, status="running", attempts=0)
        if not prior:
            db.add(job)
        job.attempts += 1
        job.started_at = datetime.now(UTC)
        db.flush()
        result = db.execute(delete(AnalyticsEvent).where(AnalyticsEvent.retention_until <= datetime.now(UTC)))
        job.status = "completed"
        job.completed_at = datetime.now(UTC)
        return result.rowcount or 0

    def delete_subject_events(self, db: Session, subject: str) -> int:
        """Privacy-request integration point for linkable optional analytics only.

        Fully anonymous events have no subject key and are intentionally not linkable to a
        person; audit records remain outside this retention/deletion boundary.
        """
        result = db.execute(
            delete(AnalyticsEvent).where(AnalyticsEvent.subject_key == subject_key(subject))
        )
        return result.rowcount or 0
