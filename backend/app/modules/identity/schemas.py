from datetime import datetime
from typing import Any, Literal
from uuid import UUID

from pydantic import BaseModel, ConfigDict, Field


class CodeRequest(BaseModel):
    model_config = ConfigDict(extra="forbid")
    email: str = Field(min_length=3, max_length=254, pattern=r"^[^@\s]+@[^@\s]+\.[^@\s]+$")


class VerifyRequest(CodeRequest):
    code: str = Field(pattern=r"^\d{6}$")


class AccountResponse(BaseModel):
    public_id: str
    display_name: str | None = None
    verified_identifier: bool = True
    account_status: str
    onboarding_complete: bool
    route_planning_available: bool = True


class SessionResponse(BaseModel):
    session_token: str
    account: AccountResponse
    onboarding_required: bool


TravellerType = Literal["STUDENT", "EMPLOYEE", "DAILY_USE", "SKIP"]


class ProfileUpdate(BaseModel):
    model_config = ConfigDict(extra="forbid")
    display_name: str | None = Field(default=None, max_length=80)
    traveller_type: TravellerType | None = None
    language: str | None = Field(default=None, max_length=16)
    accessibility_preferences: dict[str, Any] | None = None
    profile_data: dict[str, Any] | None = None
    clear_fields: set[Literal["display_name", "traveller_type", "language", "accessibility_preferences", "profile_data"]] = Field(default_factory=set)


class ProfileResponse(BaseModel):
    display_name: str | None
    traveller_type: str | None
    language: str | None
    accessibility_preferences: dict[str, Any]
    profile_data: dict[str, Any]


class OnboardingStatus(BaseModel):
    authenticated: bool = True
    profile_complete: bool
    required_actions_remaining: list[str]
    optional_actions_available: list[str]
    route_planning_available: bool = True


ConsentPurpose = Literal["ROUTE_PLANNING_LOCATION", "ACTIVE_TRIP_LOCATION", "TRUSTED_CONTACT_SHARING", "PUBLIC_REPORT_PUBLICATION", "PRIVATE_EVIDENCE_RETENTION", "NOTIFICATIONS", "EMERGENCY_HANDOFF", "PROVIDER_INTEGRATION", "ANALYTICS", "PERSONALISATION"]


class ConsentCreate(BaseModel):
    model_config = ConfigDict(extra="forbid")
    purpose: ConsentPurpose
    scope: dict[str, Any] = Field(default_factory=dict)
    policy_version: str = Field(min_length=1, max_length=64)
    granted: bool


class ConsentResponse(BaseModel):
    id: UUID
    purpose: str
    scope: dict[str, Any]
    policy_version: str
    granted: bool
    granted_at: datetime | None
    withdrawn_at: datetime | None
    effective: bool
