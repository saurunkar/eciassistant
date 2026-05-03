"""Cloud Translation API v2 wrapper.

Used for optional translation. The app primarily relies on Gemini responding
in the user's chosen language — translation is a fallback layer.
"""
from __future__ import annotations

import logging

from app.config import get_settings

logger = logging.getLogger(__name__)


async def translate_text(text: str, target_language: str, source_language: str = "en") -> str:
    """Translate text using Cloud Translation API.

    Returns original text if translation is unavailable or not configured.
    """
    settings = get_settings()

    if not settings.vertex_ai_configured or target_language == source_language:
        return text

    try:
        from google.cloud import translate_v2 as translate  # type: ignore[import-untyped]

        client = translate.Client()
        result = await _run_sync(client.translate, text, target_language=target_language, source_language=source_language)
        return str(result.get("translatedText", text))

    except Exception as exc:
        logger.warning("Translation failed (%s), returning original text", type(exc).__name__)
        return text


async def _run_sync(func, *args, **kwargs):  # type: ignore[no-untyped-def]
    import asyncio
    return await asyncio.to_thread(func, *args, **kwargs)
