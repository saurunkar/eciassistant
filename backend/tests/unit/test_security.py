"""Unit tests for input sanitisation and security middleware."""
from __future__ import annotations

import pytest

from app.middleware.security import sanitise_text
from app.models.request import ChatRequest


@pytest.mark.unit
class TestInputSanitisation:

    def test_html_tags_stripped(self):
        """HTML tags are removed from user input."""
        result = sanitise_text("<script>alert('xss')</script>Hello")
        assert "<script>" not in result
        assert "Hello" in result

    def test_javascript_uri_stripped(self):
        """javascript: URI scheme is removed."""
        result = sanitise_text("javascript:alert(1)")
        assert "javascript" not in result.lower() or "alert" not in result

    def test_null_bytes_removed(self):
        """Null bytes are stripped."""
        result = sanitise_text("Hello\x00World")
        assert "\x00" not in result
        assert "HelloWorld" in result

    def test_clean_text_preserved(self):
        """Normal text passes through unchanged."""
        text = "How do I register to vote in India?"
        assert sanitise_text(text) == text

    def test_pydantic_rejects_html_in_message(self):
        """ChatRequest sanitises HTML in message field."""
        req = ChatRequest(
            session_id="12345678-1234-4234-8234-123456789abc",
            message="<b>bold</b> question about elections",
            language="en",
        )
        assert "<b>" not in req.message

    def test_pydantic_rejects_invalid_uuid(self):
        """ChatRequest rejects non-UUID4 session_id."""
        with pytest.raises(Exception):
            ChatRequest(
                session_id="not-a-valid-uuid",
                message="Hello",
                language="en",
            )


@pytest.mark.unit
class TestSecurityHeaders:

    def test_health_has_x_frame_options(self, client):
        """Security headers present on all responses."""
        resp = client.get("/health")
        assert resp.headers.get("x-frame-options") == "DENY"

    def test_health_has_csp(self, client):
        """CSP header present."""
        resp = client.get("/health")
        assert "content-security-policy" in resp.headers
