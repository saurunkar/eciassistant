"""Structured JSON logging middleware — Cloud Logging compatible.

NEVER logs user message content (DPDP Act 2023 compliance).
Logs only: session_id, message_id, latency_ms, status_code, method, path.
"""
from __future__ import annotations

import json
import logging
import time
import uuid

from starlette.middleware.base import BaseHTTPMiddleware, RequestResponseEndpoint
from starlette.requests import Request
from starlette.responses import Response

logger = logging.getLogger("electguide.access")


class StructuredLoggingMiddleware(BaseHTTPMiddleware):
    """Log every request as structured JSON compatible with Cloud Logging."""

    async def dispatch(self, request: Request, call_next: RequestResponseEndpoint) -> Response:
        start = time.monotonic()
        request_id = str(uuid.uuid4())[:8]

        # NEVER read the body here — that consumes the stream
        response = await call_next(request)

        duration_ms = round((time.monotonic() - start) * 1000, 2)

        log_entry = {
            "severity": "INFO" if response.status_code < 400 else "ERROR",
            "message": f"{request.method} {request.url.path}",
            "httpRequest": {
                "requestMethod": request.method,
                "requestUrl": str(request.url.path),
                "status": response.status_code,
                "latency": f"{duration_ms}ms",
                "userAgent": "",  # deliberately omitted (no PII)
                "remoteIp": "",   # deliberately omitted (DPDP compliance)
            },
            "request_id": request_id,
            "labels": {"service": "electguide-api"},
        }

        if response.status_code >= 400:
            logger.warning(json.dumps(log_entry))
        else:
            logger.info(json.dumps(log_entry))

        return response


def configure_logging(log_level: str = "INFO") -> None:
    """Configure root logger for structured JSON output."""
    logging.basicConfig(
        level=getattr(logging, log_level, logging.INFO),
        format="%(message)s",
        handlers=[logging.StreamHandler()],
    )
    # Suppress noisy third-party loggers
    for lib in ("uvicorn.access", "google.auth", "urllib3"):
        logging.getLogger(lib).setLevel(logging.WARNING)
