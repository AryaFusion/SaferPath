import secrets
from datetime import UTC, datetime, timedelta

from fastapi import APIRouter, Depends, Header, HTTPException, Request
from pydantic import BaseModel, Field
from sqlalchemy.orm import Session

from app.core.config import get_settings
from app.db.session import get_transactional_db
from app.models.analytics import Experiment, ExperimentVariant
from app.modules.analytics.service import (
    EVENT_TYPES,
    SAFE_DIMENSIONS,
    AnalyticsFailure,
    AnalyticsService,
)

router = APIRouter(tags=["analytics"])
service = AnalyticsService()

class AnalyticsEventRequest(BaseModel):
    event_id: str = Field(min_length=1, max_length=64)
    event_type: str
    actor_class: str
    dimensions: dict[str, str] = Field(default_factory=dict)
    subject_reference: str | None = Field(default=None, min_length=1, max_length=128)
    analytics_consent: bool
    consent_version: str | None = Field(default=None, max_length=64)


class VariantRequest(BaseModel):
    key: str = Field(min_length=1, max_length=64, pattern=r"^[a-z0-9_-]+$")
    weight: int = Field(gt=0, le=10_000)
    # Presentation-only knobs: safety, privacy and authorization controls are never configurable.
    config: dict[str, str] = Field(default_factory=dict)


class ExperimentRequest(BaseModel):
    key: str = Field(min_length=1, max_length=64, pattern=r"^[a-z0-9_-]+$")
    version: int = Field(ge=1)
    starts_at: datetime | None = None
    ends_at: datetime | None = None
    variants: list[VariantRequest] = Field(min_length=1, max_length=16)

def admin(token: str | None = Header(default=None, alias="X-Analytics-Admin")) -> str:
    configured = get_settings().analytics_admin_token
    if not configured or not token or not secrets.compare_digest(token, configured):
        raise HTTPException(status_code=403, detail="Analytics access is not permitted.")
    return token

@router.post("/analytics/events", status_code=202)
def ingest(payload: AnalyticsEventRequest, db: Session = Depends(get_transactional_db)) -> dict:
    try:
        event = service.ingest(db, event_id=payload.event_id, event_type=payload.event_type, actor_class=payload.actor_class, dimensions=payload.dimensions, subject=payload.subject_reference, consent=payload.analytics_consent, consent_version=payload.consent_version)
        return {"accepted": event is not None, "event_id": payload.event_id}
    except AnalyticsFailure as exc:
        raise HTTPException(status_code=409 if str(exc) == "idempotency_conflict" else 422, detail="Invalid analytics event.") from exc

@router.get("/analytics/summary")
def summary(request: Request, start: datetime | None = None, end: datetime | None = None, _: str = Depends(admin), db: Session = Depends(get_transactional_db)) -> dict:
    finish = end or datetime.now(UTC)
    begin = start or finish - timedelta(days=7)
    try:
        data = service.summary(db, begin, finish)
        service.audit(db, "analytics_admin", "ADMIN_ANALYTICS_VIEWED", request.state.request_id, {"result": "summary"})
        return {"start": begin, "end": finish, "events": data}
    except AnalyticsFailure as exc:
        raise HTTPException(status_code=422, detail="Invalid analytics date range.") from exc

@router.get("/analytics/allowlist")
def allowlist(_: str = Depends(admin)) -> dict:
    return {"event_types": sorted(EVENT_TYPES), "dimensions": sorted(SAFE_DIMENSIONS), "schema_version": 1}


@router.post("/analytics/experiments", status_code=201)
def create_experiment(payload: ExperimentRequest, request: Request, _: str = Depends(admin), db: Session = Depends(get_transactional_db)) -> dict:
    if payload.ends_at and payload.starts_at and payload.ends_at <= payload.starts_at:
        raise HTTPException(status_code=422, detail="Experiment window is invalid.")
    if len({variant.key for variant in payload.variants}) != len(payload.variants):
        raise HTTPException(status_code=422, detail="Experiment variants must be unique.")
    if db.get(Experiment, (payload.key, payload.version)):
        raise HTTPException(status_code=409, detail="Experiment version already exists.")
    experiment = Experiment(key=payload.key, version=payload.version, status="ACTIVE", starts_at=payload.starts_at, ends_at=payload.ends_at, owner_key="analytics_admin")
    db.add(experiment)
    db.flush()
    for variant in payload.variants:
        if set(variant.config) - {"copy", "ordering", "presentation"}:
            raise HTTPException(status_code=422, detail="Only presentation experiment configuration is allowed.")
        db.add(ExperimentVariant(experiment_key=payload.key, experiment_version=payload.version, key=variant.key, weight=variant.weight, config=variant.config))
    service.audit(db, "analytics_admin", "EXPERIMENT_CONFIGURATION_CHANGED", request.state.request_id, {"result": "created"})
    return {"key": payload.key, "version": payload.version, "status": "ACTIVE"}


@router.post("/analytics/experiments/{experiment_key}/assign")
def assignment(experiment_key: str, subject_reference: str = Header(min_length=1, max_length=128, alias="X-Subject-Reference"), db: Session = Depends(get_transactional_db)) -> dict:
    item = service.assign(db, experiment_key, subject_reference)
    if not item:
        raise HTTPException(status_code=404, detail="No active eligible experiment.")
    return {"experiment_key": item.experiment_key, "version": item.experiment_version, "variant": item.variant_key}
