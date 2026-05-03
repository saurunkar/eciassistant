"""POST /api/v1/chat — main streaming chat endpoint."""
from __future__ import annotations

import json
import uuid
import logging
from collections.abc import AsyncGenerator

from fastapi import APIRouter, HTTPException
from fastapi.responses import StreamingResponse

from app.config import get_settings
from app.models.request import ChatRequest
from app.models.response import SourceCitation
from app.services import gemini, rag, session

logger = logging.getLogger(__name__)
router = APIRouter()


async def _stream_sse(
    chat_req: ChatRequest,
    rag_context: str,
    rag_chunks: list,
    message_id: str,
) -> AsyncGenerator[str, None]:
    """Yield SSE-formatted chunks, then a final [DONE] event."""
    full_answer = ""

    try:
        async for chunk in gemini.generate_answer(
            question=chat_req.message,
            language=chat_req.language,
            rag_context=rag_context,
        ):
            full_answer += chunk
            payload = json.dumps({"chunk": chunk, "message_id": message_id})
            yield f"data: {payload}\n\n"

        # Final event with sources
        sources = [
            SourceCitation(
                title=c.title,
                url=c.url,
                excerpt=c.content[:120] if hasattr(c, "content") else "",
            ).model_dump()
            for c in rag_chunks
        ] if rag_chunks else [{"title": "Election Commission of India", "url": "https://eci.gov.in", "excerpt": ""}]

        final = json.dumps({
            "done": True,
            "message_id": message_id,
            "sources": sources,
            "language": chat_req.language,
        })
        yield f"data: {final}\n\n"

    except Exception as e:
        import asyncio
        if isinstance(e, asyncio.CancelledError):
            logger.info("Client disconnected during stream", extra={"session_id": chat_req.session_id[:8]})
            raise e
        logger.error(f"Stream error: {e}")
        yield f"data: {json.dumps({'chunk': ' [Connection Error]'})}\n\n"
        yield f"data: {json.dumps({'done': True, 'message_id': message_id})}\n\n"

    # Increment message count (fire-and-forget, no await needed here)
    logger.info(
        "chat_complete",
        extra={"session_id": chat_req.session_id[:8], "message_id": message_id, "language": chat_req.language},
    )


@router.post("/chat")
async def chat(chat_req: ChatRequest) -> StreamingResponse:
    """Stream an answer to the user's election question."""
    settings = get_settings()

    # ── Session check ───────────────────────────────────────────────────────
    sess = await session.get_or_create_session(chat_req.session_id)
    message_count = int(sess.get("message_count", 0))

    if message_count >= settings.max_messages_per_session:
        raise HTTPException(
            status_code=429,
            detail="Session limit reached. Please refresh to start a new session.",
        )

    await session.increment_message_count(chat_req.session_id)
    message_id = str(uuid.uuid4())

    # ── RAG retrieval ───────────────────────────────────────────────────────
    rag_context, rag_chunks = await rag.retrieve_context(chat_req.message)

    # ── Stream response ─────────────────────────────────────────────────────
    return StreamingResponse(
        _stream_sse(chat_req, rag_context, rag_chunks, message_id),
        media_type="text/event-stream",
        headers={
            "Cache-Control": "no-cache",
            "Connection": "keep-alive",
            "X-Accel-Buffering": "no",  # disable nginx buffering
        },
    )
