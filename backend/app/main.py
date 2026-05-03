"""FastAPI application factory."""
from __future__ import annotations

from contextlib import asynccontextmanager
from typing import AsyncGenerator

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.api import chat, content, feedback
from app.config import get_settings
from app.middleware.logging import StructuredLoggingMiddleware, configure_logging
from app.middleware.security import PayloadSizeLimitMiddleware, SecurityHeadersMiddleware


@asynccontextmanager
async def lifespan(app: FastAPI) -> AsyncGenerator[None, None]:
    """Application startup / shutdown hook."""
    settings = get_settings()
    configure_logging(settings.log_level)
    yield
    # Cleanup on shutdown (nothing to do currently)


def create_app() -> FastAPI:
    """Build and return the configured FastAPI application."""
    settings = get_settings()

    app = FastAPI(
        title="ElectGuide India API",
        description="AI assistant for Indian election information — ECI-grounded, DPDP-compliant.",
        version="1.0.0",
        docs_url="/docs" if not settings.is_production else None,
        redoc_url="/redoc" if not settings.is_production else None,
        lifespan=lifespan,
    )

    # ── Middleware (order matters — outermost first) ──────────────────────────
    app.add_middleware(StructuredLoggingMiddleware)
    app.add_middleware(SecurityHeadersMiddleware)
    app.add_middleware(PayloadSizeLimitMiddleware)
    app.add_middleware(
        CORSMiddleware,
        allow_origins=settings.cors_origins_list,
        allow_credentials=False,  # no cookies
        allow_methods=["GET", "POST", "OPTIONS"],
        allow_headers=["Content-Type", "Accept"],
        max_age=600,
    )

    # ── Routers ───────────────────────────────────────────────────────────────
    prefix = "/api/v1"
    app.include_router(chat.router, prefix=prefix, tags=["Chat"])
    app.include_router(content.router, prefix=prefix, tags=["Content"])
    app.include_router(feedback.router, prefix=prefix, tags=["Feedback"])

    # ── Health check ──────────────────────────────────────────────────────────
    @app.get("/health", tags=["Health"])
    async def health() -> dict[str, str]:
        return {"status": "ok", "service": "electguide-api"}

    @app.get("/", tags=["Health"])
    async def root() -> dict[str, str]:
        return {"message": "ElectGuide India API", "docs": "/docs"}

    return app


app = create_app()
