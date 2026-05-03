"""Firestore session management.

Creates, reads, and tracks sessions. Sessions auto-delete after 24 hours via TTL.
No PII is ever stored. DPDP Act 2023 compliant.
"""
from __future__ import annotations

import logging
from datetime import UTC, datetime, timedelta
from typing import Any

from app.config import get_settings

logger = logging.getLogger(__name__)

_COLLECTION = "sessions"
_firestore_client: Any = None


def _get_client() -> Any:
    """Return a cached Firestore client (or None in demo mode)."""
    global _firestore_client
    settings = get_settings()

    if not settings.vertex_ai_configured:
        return None

    if _firestore_client is None:
        try:
            from google.cloud import firestore  # type: ignore[import-untyped]
            _firestore_client = firestore.AsyncClient(
                project=settings.gcp_project_id,
                database=settings.firestore_database,
            )
        except Exception as exc:
            logger.warning("Firestore init failed (%s), using in-memory session", type(exc).__name__)
            return None

    return _firestore_client


# In-memory fallback for demo mode
_memory_sessions: dict[str, dict[str, Any]] = {}


async def get_or_create_session(session_id: str) -> dict[str, Any]:
    """Return session data, creating it if it doesn't exist."""
    settings = get_settings()
    client = _get_client()

    if client is None:
        # Demo mode — in-memory
        if session_id not in _memory_sessions:
            _memory_sessions[session_id] = {
                "session_id": session_id,
                "message_count": 0,
                "created_at": datetime.now(UTC).isoformat(),
                "language": "en",
            }
        return _memory_sessions[session_id]

    try:
        doc_ref = client.collection(_COLLECTION).document(session_id)
        doc = await doc_ref.get()

        if doc.exists:
            return doc.to_dict() or {}

        # Create new session
        ttl = datetime.now(UTC) + timedelta(hours=settings.session_ttl_hours)
        session_data: dict[str, Any] = {
            "session_id": session_id,
            "message_count": 0,
            "created_at": datetime.now(UTC),
            "expires_at": ttl,  # Firestore TTL field
            "language": "en",
        }
        await doc_ref.set(session_data)
        return session_data

    except Exception as exc:
        logger.error("Firestore get_or_create_session failed: %s", type(exc).__name__)
        return {"session_id": session_id, "message_count": 0}


async def increment_message_count(session_id: str) -> int:
    """Increment message count. Returns new count."""
    client = _get_client()

    if client is None:
        session = _memory_sessions.get(session_id, {"message_count": 0})
        session["message_count"] = session.get("message_count", 0) + 1
        _memory_sessions[session_id] = session
        return int(session["message_count"])

    try:
        from google.cloud import firestore  # type: ignore[import-untyped]
        doc_ref = client.collection(_COLLECTION).document(session_id)
        await doc_ref.update({"message_count": firestore.Increment(1)})
        doc = await doc_ref.get()
        data = doc.to_dict() or {}
        return int(data.get("message_count", 1))
    except Exception as exc:
        logger.error("increment_message_count failed: %s", type(exc).__name__)
        return 1


async def store_feedback(
    session_id: str,
    message_id: str,
    rating: int,
    language: str,
) -> None:
    """Store feedback in Firestore. No message content is stored."""
    client = _get_client()

    if client is None:
        return  # silently skip in demo mode

    try:
        feedback_ref = client.collection("feedback").document(message_id)
        await feedback_ref.set(
            {
                "session_id": session_id,
                "message_id": message_id,
                "rating": rating,
                "language": language,
                "created_at": datetime.now(UTC),
            }
        )
    except Exception as exc:
        logger.error("store_feedback failed: %s", type(exc).__name__)
