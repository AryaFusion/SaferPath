import uuid

import pytest
from sqlalchemy import text

from app.db.session import SessionLocal
from app.modules.context.sources import OpenMeteoWeatherProvider, daylight_state


def test_astronomical_daylight_uses_location_date_and_timezone():
    from datetime import datetime
    from zoneinfo import ZoneInfo

    mumbai = ZoneInfo("Asia/Kolkata")
    assert daylight_state(19.076, 72.877, datetime(2026, 6, 1, 12, 0, tzinfo=mumbai)) == "DAYLIGHT"
    assert daylight_state(19.076, 72.877, datetime(2026, 6, 1, 23, 30, tzinfo=mumbai)) == "NIGHT"
    assert daylight_state(19.076, 72.877, datetime(2026, 6, 1, 21, 0, tzinfo=mumbai)) == "NIGHT"
    assert daylight_state(51.507, -0.128, datetime(2026, 6, 1, 18, 0, tzinfo=ZoneInfo("Europe/London"))) == "DAYLIGHT"


def test_open_meteo_normalizes_nearest_hour_and_sanitizes_failures(monkeypatch):
    import json
    from datetime import datetime
    from zoneinfo import ZoneInfo

    class Response:
        status = 200
        def read(self, limit): return json.dumps({"hourly": {"time": ["2026-09-19T18:00"], "weather_code": [61], "precipitation": [1.2], "visibility": [8000]}}).encode()
        def __enter__(self): return self
        def __exit__(self, *args): return None
    provider = OpenMeteoWeatherProvider(lambda url, timeout: Response())
    signals = provider.weather(datetime(2026, 9, 19, 23, 30, tzinfo=ZoneInfo("Asia/Kolkata")))
    assert signals[0].value == "RAIN"
    assert {signal.signal_type for signal in signals} == {"WEATHER", "PRECIPITATION", "VISIBILITY"}
    provider = OpenMeteoWeatherProvider(lambda url, timeout: (_ for _ in ()).throw(TimeoutError()))
    with pytest.raises(RuntimeError, match="unavailable"):
        provider.weather(datetime(2026, 9, 19, 18, tzinfo=ZoneInfo("Asia/Kolkata")))


def _route(client, time: str) -> tuple[str, str]:
    key = f"context-{uuid.uuid4()}"
    response = client.post("/v1/routes/compare", json={"origin": {"longitude": 72.8373, "latitude": 19.0269}, "destination": {"longitude": 72.8433, "latitude": 19.018}, "timezone": "Asia/Kolkata", "requested_local_time": f"2026-09-19T{time}:00", "time_mode": "departure", "idempotency_key": key})
    assert response.status_code == 201
    return response.json()["routes"][0]["id"], key


def test_context_is_time_aware_and_evidence_based(client):
    keys = []
    try:
        route_18, key_18 = _route(client, "18:00")
        route_21, key_21 = _route(client, "21:00")
        route_2330, key_2330 = _route(client, "23:30")
        keys.extend((key_18, key_21, key_2330))
        at_18 = client.get(f"/v1/routes/{route_18}/context")
        at_21 = client.get(f"/v1/routes/{route_21}/context")
        at_2330 = client.get(f"/v1/routes/{route_2330}/context")
        assert all(item.status_code == 200 for item in (at_18, at_21, at_2330))
        first = at_18.json()
        assert first["context_version"]
        assert first["segments"][0]["expected_local_time"]
        assert "safety_score" not in first
        assert "Calculated daylight context" in first["segments"][0]["strongest_support"]
        assert "Night-time context" in at_21.json()["segments"][0]["caution"]
        assert "Limited mapped activity context" in at_2330.json()["segments"][0]["caution"]
    finally:
        with SessionLocal() as session:
            for key in keys:
                session.execute(text("DELETE FROM route_requests WHERE idempotency_key = :key"), {"key": key})
            session.commit()


def test_context_arrival_times_run_backwards_and_unknown_route_is_safe(client):
    key = f"context-arrival-{uuid.uuid4()}"
    try:
        result = client.post("/v1/routes/compare", json={"origin": {"longitude": 72.8373, "latitude": 19.0269}, "destination": {"longitude": 72.8433, "latitude": 19.018}, "timezone": "Asia/Kolkata", "requested_local_time": "2026-09-19T23:30:00", "time_mode": "arrival", "idempotency_key": key}).json()
        context = client.get(f"/v1/routes/{result['routes'][0]['id']}/context").json()
        assert context["segments"][-1]["expected_local_time"].startswith("2026-09-19T23:30:00")
        assert client.get("/v1/routes/00000000-0000-0000-0000-000000000000/context").status_code == 404
    finally:
        with SessionLocal() as session:
            session.execute(text("DELETE FROM route_requests WHERE idempotency_key = :key"), {"key": key})
            session.commit()
