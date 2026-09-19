from fastapi import APIRouter, Depends, Header, HTTPException
from pydantic import BaseModel, ConfigDict, Field
from sqlalchemy.orm import Session

from app.core.config import get_settings
from app.db.session import get_transactional_db
from app.modules.identity.service import (
    AuthenticationFailure,
    AuthenticationService,
    FixtureAuthenticationCodeProvider,
)

router = APIRouter(prefix="/auth", tags=["authentication"])
provider = FixtureAuthenticationCodeProvider()
service = AuthenticationService(provider)

class CodeRequest(BaseModel):
    model_config = ConfigDict(extra="forbid")
    email: str = Field(min_length=3, max_length=254, pattern=r"^[^@\s]+@[^@\s]+\.[^@\s]+$")

class VerifyRequest(CodeRequest):
    code: str = Field(pattern=r"^\d{6}$")

@router.post("/codes", status_code=202)
def request_code(payload: CodeRequest, db: Session = Depends(get_transactional_db)) -> dict:
    if get_settings().app_env.lower() in {"production", "release"}:
        raise HTTPException(status_code=503, detail="Authentication delivery is unavailable.")
    service.request_code(db, payload.email)
    return {"accepted": True}

@router.post("/verify")
def verify(payload: VerifyRequest, db: Session = Depends(get_transactional_db)) -> dict:
    try:
        return {"session_token": service.verify(db, payload.email, payload.code)}
    except AuthenticationFailure as exc:
        raise HTTPException(status_code=401, detail="Authentication could not be completed.") from exc

@router.post("/revoke", status_code=204)
def revoke(authorization: str = Header(alias="Authorization"), db: Session = Depends(get_transactional_db)):
    try:
        service.revoke(db, authorization.removeprefix("Bearer "))
    except AuthenticationFailure as exc:
        raise HTTPException(status_code=401, detail="Authentication could not be completed.") from exc
