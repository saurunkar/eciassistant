"""POST /api/v1/feedback — thumbs up/down on answers."""
from __future__ import annotations

import logging

from fastapi import APIRouter

from app.models.request import FeedbackRequest
from app.models.response import FeedbackResponse
from app.services import session as session_svc

logger = logging.getLogger(__name__)
router = APIRouter()


@router.post("/feedback", response_model=FeedbackResponse)
async def submit_feedback(req: FeedbackRequest) -> FeedbackResponse:
    """Store feedback. No message content is stored — only rating + message_id."""
    await session_svc.store_feedback(
        session_id=req.session_id,
        message_id=req.message_id,
        rating=req.rating,
        language=req.language,
    )

    logger.info(
        "feedback_received",
        extra={
            "session_id": req.session_id[:8],
            "message_id": req.message_id,
            "rating": req.rating,
        },
    )

    return FeedbackResponse(success=True, message="Thank you for your feedback!")
