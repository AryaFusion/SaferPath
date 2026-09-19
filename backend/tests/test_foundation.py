from sqlalchemy import text

from app.db.session import SessionLocal
from app.models import JobRun


def test_root_and_health(client):
    assert client.get("/").json()["status"] == "ok"
    response = client.get("/v1/health")
    assert response.status_code == 200
    assert response.json() == {"status": "ok"}
    assert response.headers["x-request-id"]


def test_readiness_endpoint(client):
    response = client.get("/v1/readiness")
    assert response.status_code == 200
    assert response.json() == {"status": "ready", "database": "ok"}


def test_request_id_is_validated_and_returned(client):
    response = client.get("/v1/health", headers={"X-Request-ID": "foundation-test-1"})
    assert response.headers["x-request-id"] == "foundation-test-1"

    oversized = client.get("/v1/health", headers={"X-Request-ID": "x" * 65})
    assert oversized.headers["x-request-id"] != "x" * 65


def test_error_envelope_and_validation(client):
    not_found = client.get("/v1/missing")
    assert not_found.status_code == 404
    assert not_found.json()["error"]["code"] == "NOT_FOUND"

    invalid = client.post("/v1/echo", json={"message": ""})
    assert invalid.status_code == 422
    assert invalid.json()["error"]["code"] == "VALIDATION_ERROR"
    assert invalid.json()["error"]["request_id"]


def test_cors_and_security_headers(client):
    response = client.options(
        "/v1/health",
        headers={
            "Origin": "http://localhost:5173",
            "Access-Control-Request-Method": "GET",
            "Host": "localhost",
        },
    )
    assert response.status_code == 200
    assert response.headers["access-control-allow-origin"] == "http://localhost:5173"
    assert response.headers["x-content-type-options"] == "nosniff"
    assert response.headers["x-frame-options"] == "DENY"


def test_trusted_host_rejects_unknown_host(client):
    response = client.get("/v1/health", headers={"Host": "untrusted.example"})
    assert response.status_code == 400


def test_readiness_postgis_and_job_runs():
    with SessionLocal() as session:
        assert session.execute(text("SELECT PostGIS_Version()")).scalar_one()
        assert JobRun.__tablename__ == "job_runs"
        assert "idempotency_key" in JobRun.__table__.columns