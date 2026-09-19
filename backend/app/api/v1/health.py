from fastapi import APIRouter, Depends
from sqlalchemy import text
from sqlalchemy.orm import Session

from app.db.session import get_db

router = APIRouter()
db_dependency = Depends(get_db)


@router.get("/health", tags=["system"])
def health() -> dict[str, str]:
    return {"status": "ok"}


@router.get("/readiness", tags=["system"])
def readiness(session: Session = db_dependency) -> dict[str, str]:
    session.execute(text("SELECT 1"))
    session.execute(text("SELECT PostGIS_Version()"))
    return {"status": "ready", "database": "ok"}
