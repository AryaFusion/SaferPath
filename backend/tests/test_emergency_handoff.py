from concurrent.futures import ThreadPoolExecutor
from datetime import UTC, datetime, timedelta
from uuid import uuid4

from sqlalchemy import select

from app.db.session import SessionLocal
from app.models.job_run import JobRun
from app.models.trips import EmergencyHandoff
from app.modules.trips.emergency import EmergencyProviderResult
from app.modules.trips.schemas import EmergencyHandoffCreateRequest
from app.modules.trips.service import TripJobService, TripService


def _trip(client, owner: str) -> str:
    route = client.post(
        "/v1/routes/compare",
        json={
            "origin": {"longitude": 72.8373, "latitude": 19.0269},
            "destination": {"longitude": 72.8433, "latitude": 19.018},
            "timezone": "Asia/Kolkata",
            "requested_local_time": "2026-09-19T18:00:00",
            "time_mode": "departure",
            "travel_mode": "walking",
            "idempotency_key": f"handoff-route-{uuid4()}",
            "session_id": owner,
        },
    )
    assert route.status_code == 201
    trip = client.post(
        "/v1/trips",
        json={
            "route_id": route.json()["routes"][0]["id"],
            "session_id": owner,
            "planned_arrival": (datetime.now(UTC) + timedelta(hours=1)).isoformat(),
            "travel_mode": "walking",
            "active_trip_consent": True,
            "consent_reference": "active-trip",
            "consent_version": "v1",
        },
    )
    assert trip.status_code == 201
    return trip.json()["trip_id"]


def test_explicit_emergency_handoff_is_idempotent_and_never_auto_confirms(client):
    owner = f"handoff-owner-{uuid4()}"
    trip_id = _trip(client, owner)
    payload = {
        "session_id": owner,
        "trip_id": trip_id,
        "method": "OFFICIAL_CALL",
        "idempotency_key": "handoff-key-0001",
        "explicit_user_action": True,
        "consent_version": "v1",
        "consent_source": "emergency-button",
    }
    first = client.post("/v1/emergency/handoff", json=payload)
    assert first.status_code == 201
    assert first.json()["status"] == "GUIDANCE_DISPLAYED"
    assert client.post("/v1/emergency/handoff", json=payload).json()["handoff_id"] == first.json()["handoff_id"]
    assert client.post("/v1/emergency/handoff", json=payload | {"method": "OFFICIAL_DEEP_LINK"}).status_code == 409
    assert client.post("/v1/emergency/handoff", json=payload | {"idempotency_key": "handoff-key-0002", "explicit_user_action": False}).status_code == 422
    handoff_id = first.json()["handoff_id"]
    action = {"session_id": owner, "idempotency_key": "handoff-action-0001", "action": "CALL_INITIATED"}
    assert client.post(f"/v1/emergency/handoff/{handoff_id}/action", json=action).json()["status"] == "CALL_INITIATED"
    assert client.post(f"/v1/emergency/handoff/{handoff_id}/action", json=action | {"idempotency_key": "handoff-action-0002", "action": "CALL_OPENED"}).json()["status"] == "CALL_OPENED"
    assert client.post(f"/v1/emergency/handoff/{handoff_id}/action", json=action | {"session_id": "other"}).status_code == 403
    state = client.get(f"/v1/trips/{trip_id}?session_id={owner}")
    assert state.status_code == 200
    assert state.json()["emergency_handoff"]["status"] == "CALL_OPENED"


def test_approved_provider_is_unavailable_without_false_confirmation(client):
    owner = f"handoff-provider-{uuid4()}"
    trip_id = _trip(client, owner)
    response = client.post(
        "/v1/emergency/handoff",
        json={
            "session_id": owner,
            "trip_id": trip_id,
            "method": "APPROVED_INTEGRATION",
            "idempotency_key": "provider-handoff-0001",
            "explicit_user_action": True,
            "consent_version": "v1",
            "consent_source": "emergency-button",
        },
    )
    assert response.status_code == 201
    assert response.json()["status"] == "UNAVAILABLE"


def test_handoff_expiry_job_is_durable_and_idempotent(client):
    owner = f"handoff-expiry-{uuid4()}"
    trip_id = _trip(client, owner)
    handoff = client.post("/v1/emergency/handoff", json={"session_id": owner, "trip_id": trip_id, "method": "OFFICIAL_DEEP_LINK", "idempotency_key": "expiry-handoff-0001", "explicit_user_action": True, "consent_version": "v1", "consent_source": "emergency-button"}).json()
    with SessionLocal.begin() as db:
        entity = db.scalar(select(EmergencyHandoff).where(EmergencyHandoff.public_reference == handoff["handoff_id"]))
        entity.expires_at = datetime.now(UTC) - timedelta(seconds=1)
        job = db.scalar(select(JobRun).where(JobRun.idempotency_key == f"{entity.id}:emergency_handoff_expiry"))
        TripJobService().run(db, job, datetime.now(UTC))
        TripJobService().run(db, job, datetime.now(UTC))
        assert entity.status == "EXPIRED"
        assert job.status == "completed" and job.attempts == 1


def test_concurrent_handoff_creation_is_single_logical_handoff(client):
    owner = f"handoff-race-{uuid4()}"
    trip_id = _trip(client, owner)
    payload = EmergencyHandoffCreateRequest(session_id=owner, trip_id=trip_id, method="OFFICIAL_CALL", idempotency_key="handoff-race-key", explicit_user_action=True, consent_version="v1", consent_source="emergency-button")
    def submit():
        with SessionLocal.begin() as db:
            return TripService().create_emergency_handoff(db, payload).handoff_id
    with ThreadPoolExecutor(max_workers=2) as executor:
        ids = list(executor.map(lambda _: submit(), range(2)))
    assert ids[0] == ids[1]


def test_authoritative_confirmation_requires_provider_result(client):
    owner = f"handoff-provider-confirm-{uuid4()}"
    trip_id = _trip(client, owner)
    payload = EmergencyHandoffCreateRequest(session_id=owner, trip_id=trip_id, method="APPROVED_INTEGRATION", idempotency_key="provider-confirm-key", explicit_user_action=True, consent_version="v1", consent_source="button")
    class ConfirmingProvider:
        def submit(self, idempotency_key):
            return EmergencyProviderResult(status="OFFICIAL_CONFIRMATION", provider_reference="provider-confirmation")
    with SessionLocal.begin() as db:
        response = TripService(emergency_provider=ConfirmingProvider()).create_emergency_handoff(db, payload)
    assert response.status == "OFFICIAL_CONFIRMATION"
    assert response.provider_reference == "provider-confirmation"
