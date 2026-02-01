"""Extract structured intake from conversation (LLM only; no fallback)."""
import logging
from typing import Any

from app.services.llm import llm_service

logger = logging.getLogger(__name__)


def _empty_extraction() -> dict[str, Any]:
    """Return an incomplete extraction so is_intake_complete is False."""
    return {
        "primary_concern": None,
        "contextual_background": None,
        "emotional_intensity": None,
        "life_impact_areas": None,
        "support_goals": None,
        "availability": None,
    }


async def extract_from_conversation(turns: list[dict]) -> dict[str, Any]:
    """
    Extract intake from conversation using the LLM only. No keyword fallback.
    On missing API key or LLM failure, returns empty extraction so intake does not complete.
    Errors are logged; caller gets a safe incomplete result.
    """
    if not turns:
        return _empty_extraction()
    try:
        result = await llm_service.extract_intake(turns)
        if result is not None:
            return result
        logger.warning("LLM extraction returned None (no API key or all retries failed); returning incomplete extraction")
    except Exception as e:
        logger.exception("LLM extraction error; returning incomplete extraction: %s", e)
    return _empty_extraction()


def is_intake_complete(extracted: dict[str, Any]) -> bool:
    """Return True when all required intake fields are present for matching."""
    if not extracted:
        return False
    primary = extracted.get("primary_concern")
    if not primary or not str(primary).strip():
        return False
    intensity = extracted.get("emotional_intensity")
    if intensity is None:
        return False
    try:
        i = int(intensity)
        if i < 1 or i > 5:
            return False
    except (TypeError, ValueError):
        return False
    areas = extracted.get("life_impact_areas")
    if not areas or not (isinstance(areas, list) and len(areas) > 0):
        return False
    goals = extracted.get("support_goals")
    if not goals or not str(goals).strip():
        return False
    availability = extracted.get("availability")
    if not availability or not str(availability).strip():
        return False
    return True


class ExtractionService:
    async def extract(self, turns: list[dict]) -> dict[str, Any]:
        return await extract_from_conversation(turns)


extraction_service = ExtractionService()
