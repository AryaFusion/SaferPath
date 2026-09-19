from functools import lru_cache
from typing import Annotated

from pydantic import Field, field_validator
from pydantic_settings import BaseSettings, NoDecode, SettingsConfigDict


class Settings(BaseSettings):
    app_name: str = "SaferPath API"
    app_env: str = "development"
    debug: bool = False
    api_v1_prefix: str = "/v1"
    database_url: str
    cors_origins: Annotated[list[str], NoDecode] = Field(default_factory=list)
    trusted_hosts: Annotated[list[str], NoDecode] = Field(
        default_factory=lambda: ["localhost", "127.0.0.1"]
    )
    log_level: str = "INFO"
    request_timeout_seconds: int = 30
    rate_limit_default: str = "100/minute"
    demo_mode: bool = False
    max_request_body_bytes: int = 1_048_576

    model_config = SettingsConfigDict(env_file=".env", env_file_encoding="utf-8", extra="ignore")

    @field_validator("cors_origins", "trusted_hosts", mode="before")
    @classmethod
    def split_csv(cls, value: object) -> object:
        if isinstance(value, str):
            return [item.strip() for item in value.split(",") if item.strip()]
        return value


@lru_cache
def get_settings() -> Settings:
    return Settings()