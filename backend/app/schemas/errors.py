from typing import Any

from pydantic import BaseModel


class ErrorBody(BaseModel):
    code: str
    message: str
    request_id: str
    details: list[dict[str, Any]] | None = None


class ErrorEnvelope(BaseModel):
    error: ErrorBody