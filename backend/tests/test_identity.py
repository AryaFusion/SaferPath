from uuid import uuid4

import pytest

from app.db.session import SessionLocal
from app.models.identity import AuthenticationCode, ConsentRecord, User, UserProfile, UserSession
from app.modules.identity.service import (
    AuthenticationFailure,
    AuthenticationService,
    FixtureAuthenticationCodeProvider,
)


def test_one_time_code_session_rotation_and_revoke():
    provider = FixtureAuthenticationCodeProvider()
    service = AuthenticationService(provider)
    email = f"user-{uuid4()}@example.test"
    with SessionLocal.begin() as db:
        service.request_code(db, email)
        assert provider.last_code
        token = service.verify(db, email, provider.last_code)
        assert service.current(db, token).public_id.startswith("usr_")
        with pytest.raises(AuthenticationFailure):
            service.verify(db, email, provider.last_code)
        service.revoke(db, token)
        with pytest.raises(AuthenticationFailure):
            service.current(db, token)
    with SessionLocal.begin() as db:
        db.query(AuthenticationCode).delete()
        db.query(UserSession).delete()
        db.query(User).delete()


def test_progressive_profile_and_idempotent_consent_are_user_scoped():
    provider = FixtureAuthenticationCodeProvider()
    service = AuthenticationService(provider)
    email = f"profile-{uuid4()}@example.test"
    with SessionLocal.begin() as db:
        service.request_code(db, email)
        token = service.verify(db, email, provider.last_code)
        user = service.current(db, token)
        assert not service.onboarding_complete(db, user)
        profile = service.update_profile(db, user, {"traveller_type": "SKIP", "display_name": "River"}, set())
        assert profile.display_name == "River"
        assert service.onboarding_complete(db, user)
        payload = {"purpose": "ROUTE_PLANNING_LOCATION", "scope": {}, "policy_version": "2026-01", "granted": True}
        first = service.consent(db, user, payload, "request-1")
        assert service.consent(db, user, payload, "request-1").id == first.id
        assert db.query(ConsentRecord).filter(ConsentRecord.user_id == user.id).count() == 1
    with SessionLocal.begin() as db:
        db.query(AuthenticationCode).delete()
        db.query(UserSession).delete()
        db.query(UserProfile).delete()
        db.query(ConsentRecord).delete()
        db.query(User).delete()
