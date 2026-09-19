from fastapi import APIRouter
from pydantic import BaseModel, Field

router = APIRouter()


class EchoRequest(BaseModel):
    message: str = Field(min_length=1, max_length=500)


@router.post("/echo", tags=["system"])
def echo(payload: EchoRequest) -> dict[str, str]:
    return {"message": payload.message}
