from datetime import UTC, datetime

from sqlalchemy import func, select
from sqlalchemy.orm import Session

from app.core.config import get_settings
from app.models.help_points import HelpPoint, HelpPointVerification

CATEGORIES = {
    "POLICE",
    "HOSPITAL",
    "CLINIC",
    "PHARMACY",
    "TRANSIT_STAFFED_POINT",
    "SECURITY_DESK",
    "PUBLIC_HELP_DESK",
    "VERIFIED_PARTNER_LOCATION",
}
_TRANSITIONS = {
    "UNVERIFIED": {"VERIFIED", "SUSPENDED"},
    "VERIFIED": {"STALE", "EXPIRED", "SUSPENDED"},
    "STALE": {"VERIFIED", "EXPIRED", "SUSPENDED"},
    "EXPIRED": {"VERIFIED", "SUSPENDED"},
    "SUSPENDED": {"UNVERIFIED", "VERIFIED"},
}


def current_status(point: HelpPoint, at: datetime) -> str:
    if point.verification_status == "SUSPENDED":
        return "SUSPENDED"
    if point.verification_expires_at is None or point.last_verified_at is None:
        return "UNVERIFIED"
    if at >= point.verification_expires_at:
        return "EXPIRED"
    if (at - point.last_verified_at).days >= get_settings().help_point_stale_days:
        return "STALE"
    return "VERIFIED"


def is_open(hours: dict | None, at: datetime) -> str:
    if not hours:
        return "UNKNOWN"
    entry = hours.get(str(at.weekday()))
    if entry == "24H":
        return "OPEN"
    if not isinstance(entry, dict) or "open" not in entry or "close" not in entry:
        return "UNKNOWN"
    try:
        opening, closing = entry["open"], entry["close"]
        minute = at.hour * 60 + at.minute
        start = int(opening[:2]) * 60 + int(opening[3:])
        end = int(closing[:2]) * 60 + int(closing[3:])
    except (TypeError, ValueError):
        return "UNKNOWN"
    open_now = start <= minute < end if start < end else minute >= start or minute < end
    return "OPEN" if open_now else "CLOSED"


class HelpPointService:
    def transition(
        self,
        db: Session,
        point: HelpPoint,
        state: str,
        source: str,
        verified_at: datetime | None = None,
        expires_at: datetime | None = None,
    ) -> None:
        if state not in _TRANSITIONS.get(point.verification_status, set()) or not source:
            raise ValueError("transition")
        if state == "VERIFIED" and (
            verified_at is None or expires_at is None or expires_at <= verified_at
        ):
            raise ValueError("verification")
        db.add(
            HelpPointVerification(
                help_point_id=point.id,
                previous_status=point.verification_status,
                new_status=state,
                source=source,
                verified_at=verified_at,
                expires_at=expires_at,
            )
        )
        point.verification_status = state
        if state == "VERIFIED":
            point.verification_source, point.last_verified_at, point.verification_expires_at = (
                source,
                verified_at,
                expires_at,
            )
        db.flush()

    def nearby(
        self,
        db: Session,
        latitude: float,
        longitude: float,
        radius: int,
        category: str | None = None,
        accessibility: str | None = None,
        verified_only: bool = False,
    ) -> list[HelpPoint]:
        if radius < 1 or radius > get_settings().help_point_nearby_max_radius_meters:
            raise ValueError("radius")
        if category and category not in CATEGORIES:
            raise ValueError("category")
        point = func.ST_SetSRID(func.ST_MakePoint(longitude, latitude), 4326)
        statement = select(HelpPoint).where(
            func.ST_DWithin(func.geography(HelpPoint.geometry), func.geography(point), radius)
        )
        if category:
            statement = statement.where(HelpPoint.category == category)
        points = list(db.scalars(statement.order_by(HelpPoint.id)))
        now = datetime.now(UTC)
        return [
            point
            for point in points
            if (not verified_only or current_status(point, now) == "VERIFIED")
            and (not accessibility or point.accessibility.get(accessibility) == "YES")
        ]
