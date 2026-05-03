"""Security middleware: input sanitisation, security headers, CORS enforcement."""
from __future__ import annotations

import re

import bleach
from starlette.middleware.base import BaseHTTPMiddleware, RequestResponseEndpoint
from starlette.requests import Request
from starlette.responses import Response


class SecurityHeadersMiddleware(BaseHTTPMiddleware):
    """Injects security headers on every response."""

    async def dispatch(self, request: Request, call_next: RequestResponseEndpoint) -> Response:
        response = await call_next(request)

        response.headers["X-Content-Type-Options"] = "nosniff"
        response.headers["X-Frame-Options"] = "DENY"
        response.headers["X-XSS-Protection"] = "1; mode=block"
        response.headers["Referrer-Policy"] = "strict-origin-when-cross-origin"
        response.headers["Permissions-Policy"] = "camera=(), microphone=(), geolocation=()"
        response.headers["Content-Security-Policy"] = (
            "default-src 'self'; "
            "script-src 'self'; "
            "style-src 'self' 'unsafe-inline'; "
            "img-src 'self' data: https:; "
            "connect-src 'self' https://eci.gov.in; "
            "frame-ancestors 'none';"
        )
        # DPDP Act 2023 — no tracking
        response.headers["Cache-Control"] = "no-store, no-cache, must-revalidate"

        return response


class PayloadSizeLimitMiddleware(BaseHTTPMiddleware):
    """Reject requests with bodies larger than 4 KB."""

    MAX_BYTES = 4 * 1024  # 4 KB

    async def dispatch(self, request: Request, call_next: RequestResponseEndpoint) -> Response:
        content_length = request.headers.get("content-length")
        if content_length and int(content_length) > self.MAX_BYTES:
            return Response(
                content='{"detail":"Request payload too large"}',
                status_code=413,
                media_type="application/json",
            )
        return await call_next(request)


def sanitise_text(text: str) -> str:
    """Strip HTML/JS tags and dangerous patterns from user input."""
    # Strip all HTML tags
    clean = bleach.clean(text, tags=[], strip=True)
    # Remove javascript:/data: URI schemes
    clean = re.sub(r"(?i)(javascript|data|vbscript)\s*:", "", clean)
    # Remove null bytes
    clean = clean.replace("\x00", "")
    # Collapse excess whitespace
    return " ".join(clean.split()).strip()
