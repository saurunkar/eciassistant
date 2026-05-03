"""Unit tests for POST /api/v1/chat."""
from __future__ import annotations

import json

import pytest
from fastapi.testclient import TestClient


@pytest.mark.unit
class TestChatEndpoint:

    def test_chat_returns_streaming_response(self, client: TestClient, mock_session, mock_rag, valid_chat_payload):
        """Chat endpoint returns text/event-stream content type."""
        with client.stream("POST", "/api/v1/chat", json=valid_chat_payload) as response:
            assert response.status_code == 200
            assert "text/event-stream" in response.headers["content-type"]

    def test_chat_streams_sse_data(self, client: TestClient, mock_session, mock_rag, valid_chat_payload):
        """Chat endpoint streams SSE events with data: prefix."""
        with client.stream("POST", "/api/v1/chat", json=valid_chat_payload) as response:
            chunks = list(response.iter_lines())
        data_lines = [c for c in chunks if c.startswith("data:")]
        assert len(data_lines) >= 1

    def test_chat_final_event_has_done_flag(self, client: TestClient, mock_session, mock_rag, valid_chat_payload):
        """Last SSE event contains done=True and sources."""
        with client.stream("POST", "/api/v1/chat", json=valid_chat_payload) as response:
            lines = [l for l in response.iter_lines() if l.startswith("data:")]
        last = json.loads(lines[-1][len("data: "):])
        assert last.get("done") is True
        assert "sources" in last

    def test_chat_invalid_session_id_rejected(self, client: TestClient):
        """Non-UUID4 session_id returns 422."""
        resp = client.post("/api/v1/chat", json={"session_id": "not-a-uuid", "message": "Hello"})
        assert resp.status_code == 422

    def test_chat_empty_message_rejected(self, client: TestClient, valid_session_id):
        """Empty message returns 422."""
        resp = client.post("/api/v1/chat", json={"session_id": valid_session_id, "message": ""})
        assert resp.status_code == 422

    def test_chat_message_too_long_rejected(self, client: TestClient, valid_session_id):
        """Message over 500 chars returns 422."""
        resp = client.post("/api/v1/chat", json={"session_id": valid_session_id, "message": "x" * 501})
        assert resp.status_code == 422

    def test_chat_hindi_language_accepted(self, client: TestClient, mock_session, mock_rag, valid_session_id):
        """Hindi language code is accepted."""
        with client.stream("POST", "/api/v1/chat", json={
            "session_id": valid_session_id,
            "message": "मतदाता पंजीकरण कैसे करें?",
            "language": "hi",
        }) as response:
            assert response.status_code == 200

    def test_chat_session_limit_enforced(self, client: TestClient, mock_rag, valid_session_id):
        """Session with 20 messages returns 429."""
        from unittest.mock import patch, AsyncMock
        with patch("app.services.session.get_or_create_session", new_callable=AsyncMock) as m:
            m.return_value = {"session_id": valid_session_id, "message_count": 20}
            resp = client.post("/api/v1/chat", json={
                "session_id": valid_session_id,
                "message": "Any question",
            })
        assert resp.status_code == 429
