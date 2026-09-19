from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.db.session import get_transactional_db
from app.modules.context.schemas import RouteContextResponse
from app.modules.context.service import ContextNotFound, SafetyContextService

router = APIRouter(tags=["context"])
service = SafetyContextService()


@router.get("/routes/{route_id}/context", response_model=RouteContextResponse)
def route_context(
    route_id: str, db: Session = Depends(get_transactional_db)
) -> RouteContextResponse:
    try:
        return service.evaluate(db, route_id)
    except ContextNotFound as exc:
        raise HTTPException(status_code=404, detail="Route was not found.") from exc
