"""Notification provider abstraction boundary for SaferPath."""

from __future__ import annotations

from abc import ABC, abstractmethod
from dataclasses import dataclass
from datetime import UTC, datetime
from typing import Literal

NotificationStatus = Literal["QUEUED", "SENT", "DELIVERED", "FAILED", "UNAVAILABLE"]


@dataclass(frozen=True)
class NotificationMessage:
    recipient_reference: str
    event_type: str
    body: str
    channel: str = "IN_APP"
    metadata: dict | None = None


@dataclass(frozen=True)
class NotificationResult:
    status: NotificationStatus
    provider_reference: str | None = None
    error_message: str | None = None
    dispatched_at: datetime | None = None


class NotificationProvider(ABC):
    """Abstract notification boundary.

    Distinguishes:
    - QUEUED: Intent accepted for delivery.
    - SENT: Provider accepted and sent.
    - DELIVERED: Provider confirmed receipt by recipient.
    - FAILED: Delivery attempted and failed.
    - UNAVAILABLE: Provider offline / not configured.

    Never claim delivery if unconfirmed.
    """

    @abstractmethod
    def send(self, message: NotificationMessage) -> NotificationResult:
        """Send a notification message through the provider."""


class UnavailableNotificationProvider(NotificationProvider):
    """Default provider when no external provider credentials exist.

    Reports UNAVAILABLE state without faking delivery.
    """

    def send(self, message: NotificationMessage) -> NotificationResult:
        return NotificationResult(
            status="UNAVAILABLE",
            error_message="Notification provider is not configured",
        )


class MockNotificationProvider(NotificationProvider):
    """Deterministic in-memory notification provider for testing and local verification."""

    def __init__(self, mode: NotificationStatus = "SENT") -> None:
        self.mode = mode
        self.dispatched: list[tuple[NotificationMessage, NotificationResult]] = []

    def send(self, message: NotificationMessage) -> NotificationResult:
        now = datetime.now(UTC)
        if self.mode == "UNAVAILABLE":
            result = NotificationResult(
                status="UNAVAILABLE",
                error_message="Mock provider configured as unavailable",
            )
        elif self.mode == "FAILED":
            result = NotificationResult(
                status="FAILED",
                error_message="Mock provider simulated failure",
                dispatched_at=now,
            )
        elif self.mode == "DELIVERED":
            result = NotificationResult(
                status="DELIVERED",
                provider_reference=f"mock-{len(self.dispatched) + 1}",
                dispatched_at=now,
            )
        elif self.mode == "SENT":
            result = NotificationResult(
                status="SENT",
                provider_reference=f"mock-{len(self.dispatched) + 1}",
                dispatched_at=now,
            )
        else:
            result = NotificationResult(
                status="QUEUED",
                dispatched_at=now,
            )
        self.dispatched.append((message, result))
        return result

