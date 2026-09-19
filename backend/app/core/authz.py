"""Server-side identity and tenant authorization dependencies."""
from dataclasses import dataclass

from fastapi import Depends, Header, HTTPException
from sqlalchemy import select
from sqlalchemy.orm import Session

from app.db.session import get_transactional_db
from app.models.identity import TenantMembership, User
from app.modules.identity.service import (
    AuthenticationFailure,
    AuthenticationService,
    FixtureAuthenticationCodeProvider,
)

service = AuthenticationService(FixtureAuthenticationCodeProvider())
OPERATOR_ROLES = frozenset({"MODERATOR", "ANALYST", "PARTNER_OPERATOR", "PARTNER_ADMIN", "TRUST_ADMIN"})


def current_user(
    authorization: str | None = Header(default=None, alias="Authorization"),
    db: Session = Depends(get_transactional_db),
) -> User:
    if not authorization or not authorization.startswith("Bearer "):
        raise HTTPException(status_code=401, detail="Authentication is required.")
    try:
        return service.current(db, authorization[7:])
    except AuthenticationFailure as exc:
        raise HTTPException(status_code=401, detail="Authentication is required.") from exc


@dataclass(frozen=True)
class CurrentTenant:
    membership: TenantMembership


def current_tenant(
    tenant: str = Header(alias="X-Tenant"),
    user: User = Depends(current_user),
    db: Session = Depends(get_transactional_db),
) -> CurrentTenant:
    # The public tenant header only selects an already-authorized membership;
    # it is never accepted as proof of access.
    from app.models.identity import Tenant

    membership = db.scalar(
        select(TenantMembership)
        .join(Tenant, Tenant.id == TenantMembership.tenant_id)
        .where(
            Tenant.public_id == tenant,
            TenantMembership.user_id == user.id,
            TenantMembership.status == "ACTIVE",
            TenantMembership.revoked_at.is_(None),
            Tenant.status == "ACTIVE",
        )
    )
    if not membership:
        raise HTTPException(status_code=403, detail="Tenant access is not permitted.")
    return CurrentTenant(membership)


def require_operator(context: CurrentTenant = Depends(current_tenant)) -> CurrentTenant:
    if context.membership.role not in OPERATOR_ROLES:
        raise HTTPException(status_code=403, detail="Operator access is not permitted.")
    return context
