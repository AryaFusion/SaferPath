from app.core.rate_limits import LocalRateLimitStore


def test_local_rate_limit_is_bounded_and_expires(monkeypatch):
    store = LocalRateLimitStore()
    assert store.increment("auth:subject", 2, 60)
    assert store.increment("auth:subject", 2, 60)
    assert not store.increment("auth:subject", 2, 60)
    assert not store.increment("x" * 257, 2, 60)
