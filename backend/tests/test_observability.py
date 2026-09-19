from app.core.metrics import metrics


def test_request_logging_metrics_use_route_templates_not_sensitive_path(client):
    metrics.counts.clear()
    response = client.get("/v1/shared-trips/private-sharing-token")
    assert response.status_code in {404, 422}
    assert all("private-sharing-token" not in str(labels) for _, labels in metrics.counts)
    assert any(name == "http_requests_total" for name, _ in metrics.counts)
