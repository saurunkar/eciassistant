"""Pytest configuration and shared fixtures."""
from __future__ import annotations

from collections.abc import AsyncGenerator
from unittest.mock import AsyncMock, MagicMock, patch

import pytest
from fastapi.testclient import TestClient
from httpx import ASGITransport, AsyncClient

from app.main import app


@pytest.fixture
def client() -> TestClient:
    """Synchronous test client."""
    return TestClient(app, raise_server_exceptions=True)


@pytest.fixture
async def async_client() -> AsyncGenerator[AsyncClient, None]:
    """Async test client for streaming responses."""
    async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as ac:
        yield ac


@pytest.fixture(autouse=True)
def mock_settings(monkeypatch):
    """Override settings so tests never need real GCP."""
    monkeypatch.setenv("GCP_PROJECT_ID", "")  # triggers demo/fallback mode
    monkeypatch.setenv("ENVIRONMENT", "development")
    monkeypatch.setenv("CORS_ORIGINS", "http://localhost:5173")
    from app.config import get_settings
    get_settings.cache_clear()
    yield
    get_settings.cache_clear()


@pytest.fixture
def valid_session_id() -> str:
    return "12345678-1234-4234-8234-123456789abc"


@pytest.fixture
def valid_chat_payload(valid_session_id: str) -> dict:
    return {
        "session_id": valid_session_id,
        "message": "How do I register to vote in India?",
        "language": "en",
    }


@pytest.fixture
def mock_gemini_stream():
    """Mock Gemini streaming to yield predictable chunks."""
    async def _fake_stream(*args, **kwargs):
        yield "This is a test answer "
        yield "about Indian elections."

    with patch("app.services.gemini.generate_answer", side_effect=_fake_stream):
        yield


@pytest.fixture
def mock_session():
    """Mock session service to return a fresh session."""
    with patch("app.services.session.get_or_create_session", new_callable=AsyncMock) as m_get, \
         patch("app.services.session.increment_message_count", new_callable=AsyncMock) as m_inc:
        m_get.return_value = {"session_id": "12345678-1234-4234-8234-123456789abc", "message_count": 0}
        m_inc.return_value = 1
        yield m_get, m_inc


@pytest.fixture
def mock_rag():
    """Mock RAG to return empty context (unit test mode)."""
    with patch("app.services.rag.retrieve_context", new_callable=AsyncMock) as m:
        m.return_value = ("", [])
        yield m
