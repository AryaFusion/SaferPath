from datetime import UTC, datetime


class Clock:
    @staticmethod
    def now_utc() -> datetime:
        return datetime.now(UTC)


clock = Clock()
