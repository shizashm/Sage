"""Crisis detection: keywords -> fixed response, no LLM."""
import logging
import re

from app.config import settings

logger = logging.getLogger(__name__)

CRISIS_PATTERNS = [
    r"\bsuicide\b",
    r"\bkill\s*(my)?self\b",
    r"\bend\s*my\s*life\b",
    r"\bself\s*harm\b",
    r"\bwant\s*to\s*die\b",
    r"\bwanting\s*to\s*die\b",
    r"\bhurt\s*my\s*self\b",
    r"\btake\s*my\s*life\b",
]
CRISIS_REGEX = re.compile("|".join(CRISIS_PATTERNS), re.IGNORECASE)


def is_crisis_message(message: str) -> bool:
    """True if message suggests crisis; use fixed response instead of LLM."""
    if not message or not message.strip():
        return False
    match = CRISIS_REGEX.search(message)
    if match:
        logger.info("Crisis pattern detected in user message", extra={"pattern": match.group(0)})
        return True
    return False


def get_crisis_response() -> str:
    """Fixed empathetic response + crisis line (no LLM)."""
    return (
        "Thank you for sharing. It's really important to talk to someone who can help. "
        f"{settings.crisis_line_text} I'm not able to give advice in this situation."
    )


class CrisisService:
    def check(self, message: str) -> bool:
        return is_crisis_message(message)

    def response(self) -> str:
        return get_crisis_response()


crisis_service = CrisisService()
