from dataclasses import dataclass
from typing import Protocol


@dataclass(frozen=True)
class EmergencyProviderResult:
    status: str
    provider_reference: str | None = None
    failure_code: str | None = None


class EmergencyHandoffProvider(Protocol):
    def submit(self, idempotency_key: str) -> EmergencyProviderResult: ...


class UnavailableEmergencyHandoffProvider:
    """Safe default: no external request is attempted or claimed."""

    def submit(self, idempotency_key: str) -> EmergencyProviderResult:
        return EmergencyProviderResult(status="UNAVAILABLE", failure_code="HANDOFF_PROVIDER_UNAVAILABLE")
