from datetime import UTC, datetime

from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session

from app.db.session import get_db
from app.modules.help_points.service import HelpPointService, current_status, is_open

router = APIRouter(tags=["help-points"])


@router.get("/help-points/nearby")
def nearby_help_points(
    latitude: float = Query(ge=-90, le=90),
    longitude: float = Query(ge=-180, le=180),
    radius_meters: int = Query(ge=1),
    category: str | None = None,
    accessibility: str | None = None,
    verified_only: bool = False,
    db: Session = Depends(get_db),
):
    try:
        points = HelpPointService().nearby(
            db, latitude, longitude, radius_meters, category, accessibility, verified_only
        )
    except ValueError as exc:
        raise HTTPException(status_code=422, detail="Help-point lookup is invalid.") from exc
    now = datetime.now(UTC)
    return [
        {
            "reference": point.public_reference,
            "category": point.category,
            "contact": point.public_contact,
            "accessibility": point.accessibility,
            "verification_status": current_status(point, now),
            "operating_status": is_open(point.operating_hours, now),
            "sponsor_disclosure": point.sponsor_disclosure,
        }
        for point in points
    ]
