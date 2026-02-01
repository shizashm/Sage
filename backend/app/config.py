"""Application configuration."""
import os
from pathlib import Path

from dotenv import load_dotenv
from pydantic import model_validator
from pydantic_settings import BaseSettings

_BACKEND_DIR = Path(__file__).resolve().parent.parent
_ENV_FILE = _BACKEND_DIR / ".env"
load_dotenv(_ENV_FILE, override=True)


def _read_env_value(key: str) -> str | None:
    """Read a single key from .env file (ignores system env)."""
    if not _ENV_FILE.exists():
        return None
    for line in _ENV_FILE.read_text(encoding="utf-8", errors="replace").splitlines():
        line = line.strip()
        if line.startswith("#") or "=" not in line:
            continue
        k, _, v = line.partition("=")
        if k.strip() == key:
            return v.strip().strip('"').strip("'") or None
    return None


class Settings(BaseSettings):
    """App settings from environment."""

    app_name: str = "Sage API"
    debug: bool = False
    database_url: str = "postgresql+asyncpg://postgres:postgres@localhost:5432/sage"
    secret_key: str = "change-me-in-production"
    groq_api_key: str = ""
    openai_api_key: str = ""
    huggingface_token: str = ""
    groq_model: str = "llama-3.1-8b-instant"
    crisis_line_text: str = "Please contact a mental health professional or crisis helpline."

    model_config = {
        "env_file": _ENV_FILE,
        "extra": "ignore",
    }

    @model_validator(mode="after")
    def _prefer_env_file_llm_keys(self):
        groq_from_file = _read_env_value("GROQ_API_KEY")
        openai_from_file = _read_env_value("OPENAI_API_KEY")
        if groq_from_file:
            object.__setattr__(self, "groq_api_key", groq_from_file)
            object.__setattr__(self, "openai_api_key", "")
        elif openai_from_file:
            object.__setattr__(self, "openai_api_key", openai_from_file)
        return self


settings = Settings()
