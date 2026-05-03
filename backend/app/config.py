"""Application configuration — single source of truth.

All settings are read from environment variables (or a .env file in development).
In Cloud Run, secrets are injected via Secret Manager mounted as env vars.
"""
from __future__ import annotations

import os
from functools import lru_cache
from typing import Literal

from pydantic import field_validator
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    """All application settings. Order of precedence: env var > .env file > default."""

    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        case_sensitive=False,
        extra="ignore",
    )

    # ── GCP ──────────────────────────────────────────────────────────────────
    gcp_project_id: str = ""
    gcp_region: str = "asia-south1"

    # ── Vertex AI ─────────────────────────────────────────────────────────────
    vertex_ai_location: str = "asia-south1"
    vertex_ai_model: str = "gemini-1.5-pro"
    vertex_ai_search_engine_id: str = ""  # blank → fallback knowledge base

    # ── Firestore ─────────────────────────────────────────────────────────────
    firestore_database: str = "(default)"

    # ── Cloud Storage ──────────────────────────────────────────────────────────
    gcs_bucket_name: str = "electguide-eci-docs"

    # ── Session ───────────────────────────────────────────────────────────────
    session_ttl_hours: int = 24
    max_messages_per_session: int = 20

    # ── Security / CORS ───────────────────────────────────────────────────────
    cors_origins: str = "http://localhost:5173"

    # ── App ───────────────────────────────────────────────────────────────────
    environment: Literal["development", "staging", "production"] = "development"
    log_level: str = "DEBUG"

    # ── Derived helpers ───────────────────────────────────────────────────────
    @property
    def cors_origins_list(self) -> list[str]:
        return [o.strip() for o in self.cors_origins.split(",") if o.strip()]

    @property
    def is_production(self) -> bool:
        return self.environment == "production"

    @property
    def vertex_ai_configured(self) -> bool:
        """True when a real Vertex AI project is available."""
        return bool(self.gcp_project_id and self.gcp_project_id != "your-project-id")

    @property
    def rag_configured(self) -> bool:
        """True when Vertex AI Search is set up."""
        return bool(self.vertex_ai_search_engine_id)

    @field_validator("log_level")
    @classmethod
    def _upper_log_level(cls, v: str) -> str:
        return v.upper()


@lru_cache(maxsize=1)
def get_settings() -> Settings:
    """Return cached Settings singleton."""
    return Settings()
