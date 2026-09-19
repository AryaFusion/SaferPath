from uuid import uuid4

import pytest

from app.db.session import SessionLocal
from app.models.identity import AuthenticationCode, User, UserSession
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
