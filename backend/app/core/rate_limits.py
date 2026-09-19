"""Bounded rate-limit storage; Redis is required for multi-instance production."""
from time import monotonic


class LocalRateLimitStore:
    def __init__(self) -> None:
        self._values: dict[str, tuple[int, float]] = {}

    def increment(self, key: str, limit: int, ttl_seconds: int) -> bool:
        if len(key) > 256 or limit < 1 or ttl_seconds < 1:
            return False
        count, expiry = self._values.get(key, (0, monotonic() + ttl_seconds))
        if expiry <= monotonic():
            count, expiry = 0, monotonic() + ttl_seconds
        count += 1
        self._values[key] = (count, expiry)
        return count <= limit


class RedisRateLimitStore:
    def __init__(self, client) -> None:
        self.client = client

    def increment(self, key: str, limit: int, ttl_seconds: int) -> bool:
        count = self.client.incr(key)
        if count == 1:
            self.client.expire(key, ttl_seconds)
        return count <= limit
