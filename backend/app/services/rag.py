"""Vertex AI Search RAG service.

Retrieves relevant ECI document chunks to ground Gemini answers.
Falls back gracefully when no search engine is configured.
"""
from __future__ import annotations

import logging
from dataclasses import dataclass

from app.config import get_settings

logger = logging.getLogger(__name__)


@dataclass
class RagChunk:
    """A retrieved document chunk."""

    title: str
    content: str
    url: str = ""
    score: float = 0.0


async def retrieve_context(question: str, top_k: int = 5) -> tuple[str, list[RagChunk]]:
    """Query Vertex AI Search and return context string + source chunks.

    Returns ("", []) when RAG is not configured.
    """
    settings = get_settings()

    if not settings.rag_configured or not settings.vertex_ai_configured:
        return "", []

    try:
        from google.cloud import discoveryengine_v1beta as discoveryengine  # type: ignore[import-untyped]

        client = discoveryengine.SearchServiceClient()
        serving_config = (
            f"projects/{settings.gcp_project_id}"
            f"/locations/{settings.vertex_ai_location}"
            f"/collections/default_collection"
            f"/engines/{settings.vertex_ai_search_engine_id}"
            f"/servingConfigs/default_config"
        )

        request = discoveryengine.SearchRequest(
            serving_config=serving_config,
            query=question,
            page_size=top_k,
            content_search_spec=discoveryengine.SearchRequest.ContentSearchSpec(
                snippet_spec=discoveryengine.SearchRequest.ContentSearchSpec.SnippetSpec(
                    return_snippet=True,
                    max_snippet_count=3,
                ),
                extractive_content_spec=discoveryengine.SearchRequest.ContentSearchSpec.ExtractiveContentSpec(
                    max_extractive_answer_count=1,
                ),
            ),
        )

        import asyncio
        response = await asyncio.to_thread(client.search, request)
        chunks: list[RagChunk] = []

        for result in response.results:
            doc = result.document
            snippets: list[str] = []
            for chunk in doc.derived_struct_data.get("snippets", []):
                if chunk.get("snippet"):
                    snippets.append(chunk["snippet"])

            chunks.append(
                RagChunk(
                    title=doc.derived_struct_data.get("title", "ECI Document"),
                    content=" ".join(snippets),
                    url=doc.derived_struct_data.get("link", ""),
                    score=result.relevance_score if hasattr(result, "relevance_score") else 0.0,
                )
            )

        context = "\n\n".join(
            f"[Source: {c.title}]\n{c.content}" for c in chunks if c.content
        )
        return context, chunks

    except Exception as exc:
        logger.error("Vertex AI Search failed (%s), proceeding without RAG", type(exc).__name__)
        return "", []
