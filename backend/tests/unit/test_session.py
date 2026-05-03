"""Unit tests for session management service."""
from __future__ import annotations

import pytest

from app.services import session as session_svc


@pytest.mark.unit
class TestSessionService:

    async def test_new_session_created_in_memory(self):
        """get_or_create_session creates a session in demo mode."""
        sid = "aaaabbbb-aaaa-4aaa-8aaa-aaaaaaaaaaaa"
        sess = await session_svc.get_or_create_session(sid)
        assert sess["session_id"] == sid
        assert sess["message_count"] == 0

    async def test_existing_session_returned(self):
        """Second call returns same session."""
        sid = "bbbbcccc-bbbb-4bbb-8bbb-bbbbbbbbbbbb"
        sess1 = await session_svc.get_or_create_session(sid)
        sess2 = await session_svc.get_or_create_session(sid)
        assert sess1["session_id"] == sess2["session_id"]

    async def test_message_count_increments(self):
        """increment_message_count increases count."""
        sid = "ccccdddd-cccc-4ccc-8ccc-cccccccccccc"
        await session_svc.get_or_create_session(sid)
        count = await session_svc.increment_message_count(sid)
        assert count >= 1

    async def test_store_feedback_no_error(self):
        """store_feedback runs without error in demo mode."""
        await session_svc.store_feedback(
            session_id="ddddeeee-dddd-4ddd-8ddd-dddddddddddd",
            message_id="msg-001",
            rating=1,
            language="en",
        )
        # No exception = pass
