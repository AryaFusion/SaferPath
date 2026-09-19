import pytest
from pydantic import ValidationError

from app.core.config import Settings
from app.modules.context.ingestion.osm_import import overpass_url
from app.modules.context.sources import OpenMeteoWeatherProvider


def production_settings(**overrides):
    values = {
        "database_url": "postgresql+psycopg://user:password@db.example/saferpath",
        "app_env": "production",
        "cors_origins": ["https://app.example"],
        "trusted_hosts": ["api.example"],
        "analytics_subject_secret": "a" * 32,
        "analytics_admin_token": "b" * 32,
        "weather_provider": "open_meteo",
    }
    return Settings(_env_file=None, **(values | overrides))


@pytest.mark.parametrize(
    "overrides",
    [
        {"demo_mode": True},
        {"debug": True},
        {"weather_provider": "fixture"},
        {"analytics_subject_secret": "development-only-change-me"},
        {"analytics_admin_token": "short"},
        {"cors_origins": ["http://app.example"]},
        {"trusted_hosts": ["localhost"]},
    ],
)
def test_production_safety_gate_rejects_unsafe_configuration(overrides):
    with pytest.raises(ValidationError):
        production_settings(**overrides)


def test_development_fixture_configuration_remains_allowed():
    settings = Settings(_env_file=None, database_url="postgresql://localhost/test", demo_mode=True)
    assert settings.weather_provider == "fixture"


def test_outbound_urls_reject_nonstandard_ports_and_credentials(monkeypatch):
    settings = __import__("app.modules.context.sources", fromlist=["get_settings"]).get_settings()
    monkeypatch.setattr(settings, "open_meteo_base_url", "https://api.open-meteo.com:444/v1")
    with pytest.raises(RuntimeError, match="unavailable"):
        OpenMeteoWeatherProvider().weather(__import__("datetime").datetime.now(__import__("datetime").UTC))
    monkeypatch.setattr(settings, "osm_overpass_url", "https://user@overpass-api.de/api/interpreter")
    with pytest.raises(ValueError, match="not allowed"):
        overpass_url()


def test_security_headers_include_permissions_policy(client):
    response = client.get("/v1/health")
    assert response.headers["permissions-policy"] == "geolocation=(), camera=(), microphone=()"
