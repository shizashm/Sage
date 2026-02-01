"""LLM service: intake chat + output guard + extraction (no diagnosis/treatment)."""
import asyncio
import json
import logging
from typing import Any, Optional

from app.config import settings

logger = logging.getLogger(__name__)

EXTRACTION_MAX_RETRIES = 3
EXTRACTION_RETRY_BASE_DELAY_SEC = 1.0
RETRYABLE_HTTP_CODES = (429, 500, 502, 503, 504)

SYSTEM_PROMPT = """You are an empathetic intake assistant for a mental wellness platform. You work quietly in the background. Your only role is to listen and collect information so we can match the user to a small support group of people with similar challenges; a licensed therapist leads the group. You do NOT diagnose, treat, or give medical or clinical advice. You are an AI tool — not a human, not a replacement for professional support.

## Tone and principles
- Be empathetic, not sympathetic. Reflect and validate; do not rescue or fix.
- Focus on reflection, not coaching. Help the user name and reflect on their feelings before any "next steps."
- Gentle, validating, non-judgmental. No motivational fluff.
- Adapt: use a calmer, slower tone when they seem overwhelmed; be a bit more encouraging when they seem motivated.
- They control what they share; they can skip questions or leave anytime. Say so briefly if they seem unsure.
- If they use harsh self-talk (e.g. "I failed again"), reflect back in a gentler frame (e.g. "That was really hard. One setback doesn't define you") without lecturing.
- When useful, gently surface patterns (e.g. "It sounds like stress tends to show up around deadlines") to help them feel seen — do not diagnose or label.
- Acknowledge feelings without validating harm. Keep clear boundaries; if they need crisis or professional support, encourage off-platform resources (the app will also show crisis info when needed).

## What to collect (one topic at a time)
Ask one or two short questions per message. Gather:

1. **Primary concern / focus area** – Main challenge (e.g. stress, anxiety, grief, loneliness, work, life transition). This becomes their "focus area" for matching.
2. **Contextual background** – Brief context they choose to share (work, relationships, recent events).
3. **Emotional intensity** – How much it affects day-to-day life, 1 (a little) to 5 (a lot). We match by similar intensity.
4. **Life impact areas** – Which parts of life are affected (e.g. work, sleep, relationships, health). At least one.
5. **Support goals** – What they want from the group (e.g. feel less alone, coping strategies, shared experience).
6. **Availability** – When they could do a weekly session (e.g. weekday evenings, weekends, flexible).

If they ask why we ask: we match them with others with similar focus and intensity and find a time that works; a licensed therapist leads the session.

## What you must NOT do
- Do NOT diagnose, suggest disorders, or give treatment, medication, or therapy advice.
- Do NOT say you have "enough information," that intake is "complete," or that you are "matching" them. The system will match when ready; you only collect information.
- Do NOT tell them what is "wrong" or what they "should" do. If they ask for that: "I'm here to understand your situation for matching only. A licensed therapist will work with you in your group."
- Do NOT minimize or invalidate. No motivational clichés.
- If asked what you are: you can say you're an AI intake assistant, not a human or substitute for professional support.
"""

OUTPUT_BLOCK_PATTERNS = [
    "diagnosis", "diagnose", "disorder", "medication", "prescribe",
    "you should take", "treatment plan", "therapy technique",
]


def _blocked_output(reply: str) -> bool:
    lower = reply.lower()
    for phrase in OUTPUT_BLOCK_PATTERNS:
        if phrase in lower:
            logger.warning("Blocked LLM output containing clinical language", extra={"phrase": phrase})
            return True
    return False


def _mock_reply(user_message: str, conversation_history: list[dict]) -> str:
    """Mock LLM for demo when no API key is set."""
    msg_lower = user_message.lower()
    if "anxiety" in msg_lower or "stressed" in msg_lower:
        return "Thanks for sharing. How would you rate how much this affects you day to day, from 1 (a little) to 5 (a lot)?"
    if "1" in user_message or "2" in user_message or "3" in user_message or "4" in user_message or "5" in user_message:
        return "That helps. What areas of life are most affected—for example work, sleep, or relationships?"
    if "work" in msg_lower or "sleep" in msg_lower or "relationship" in msg_lower:
        return "Got it. What would you most like to get from group support?"
    if "goal" in msg_lower or "support" in msg_lower or "help" in msg_lower:
        return "When are you generally available for a weekly session—e.g. weekday evenings or weekends?"
    return "Thank you. Can you tell me a bit more about what's been on your mind lately?"


GROQ_BASE_URL = "https://api.groq.com/openai/v1"

EXTRACTION_SYSTEM = """You extract structured intake from a mental wellness intake conversation. Return ONLY a single JSON object with exactly these keys (use null for any the user has NOT clearly shared in the conversation):

- primary_concern (string): main focus e.g. "Anxiety", "Stress", "Grief / loss", "General emotional support". Null if not stated.
- contextual_background (string): brief context they shared (work, relationships, events). Null if not stated.
- emotional_intensity (integer 1-5): how much it affects day-to-day, 1=a little to 5=a lot. Null if not stated.
- life_impact_areas (array of strings): e.g. ["work", "sleep", "relationships"]. Empty array [] if not stated.
- support_goals (string): what they want from the group. Null if not stated.
- availability (string): e.g. "Weekday evenings", "Weekends", "Flexible". Null if not stated.

Rules:
- Consider the ENTIRE conversation from start to end. If the user stated something in any earlier turn, include it in your extraction. Do NOT clear or set to null a field just because the latest message did not repeat it.
- Only use null or [] for information the user has never shared in this conversation. Do NOT guess or infer.
- No other text, only the JSON object."""


def _is_retryable_extraction_error(exc: BaseException) -> bool:
    """Return True if the error is transient and worth retrying (rate limit, server, timeout, connection)."""
    if isinstance(exc, (ConnectionError, TimeoutError, OSError)):
        return True
    code = getattr(exc, "status_code", None)
    if code is not None and code in RETRYABLE_HTTP_CODES:
        return True
    try:
        import openai
        if hasattr(openai, "APIStatusError") and isinstance(exc, openai.APIStatusError):
            return getattr(exc, "status_code", 0) in RETRYABLE_HTTP_CODES
        if hasattr(openai, "APIConnectionError") and hasattr(openai, "APITimeoutError"):
            if isinstance(exc, (openai.APIConnectionError, openai.APITimeoutError)):
                return True
    except ImportError:
        pass
    return False


def _normalize_extraction_result(result: dict[str, Any]) -> dict[str, Any]:
    """Normalize LLM extraction JSON to expected keys and types."""
    normalized: dict[str, Any] = {
        "primary_concern": result.get("primary_concern") if result.get("primary_concern") else None,
        "contextual_background": result.get("contextual_background") if result.get("contextual_background") else None,
        "emotional_intensity": result.get("emotional_intensity"),
        "life_impact_areas": result.get("life_impact_areas") if isinstance(result.get("life_impact_areas"), list) else None,
        "support_goals": result.get("support_goals") if result.get("support_goals") else None,
        "availability": result.get("availability") if result.get("availability") else None,
    }
    if normalized["emotional_intensity"] is not None:
        try:
            n = int(normalized["emotional_intensity"])
            normalized["emotional_intensity"] = n if 1 <= n <= 5 else None
        except (TypeError, ValueError):
            normalized["emotional_intensity"] = None
    if normalized["life_impact_areas"] is None:
        normalized["life_impact_areas"] = []
    return normalized


async def extract_intake_llm(turns: list[dict]) -> dict[str, Any] | None:
    """
    Use LLM to extract structured intake from conversation. Returns None if no API key or on failure.
    Retries on transient errors (429, 5xx, timeout, connection). Caller must not fall back to keyword.
    """
    if not turns:
        return None
    conv_text = "\n".join(
        f"{t['role'].upper()}: {t['content']}" for t in turns[-20:]
    )
    user_msg = f"From this FULL conversation (all turns), extract intake. Preserve any detail the user shared in any turn; use null only for info they never mentioned. Return only valid JSON.\n\nConversation:\n{conv_text}"
    messages = [
        {"role": "system", "content": EXTRACTION_SYSTEM},
        {"role": "user", "content": user_msg},
    ]
    last_error: Optional[BaseException] = None

    if settings.groq_api_key:
        import openai
        client = openai.AsyncOpenAI(
            api_key=settings.groq_api_key,
            base_url=GROQ_BASE_URL,
        )
        for attempt in range(EXTRACTION_MAX_RETRIES):
            try:
                resp = await client.chat.completions.create(
                    model=settings.groq_model,
                    messages=messages,
                    max_tokens=400,
                    response_format={"type": "json_object"},
                )
                raw = (resp.choices[0].message.content or "").strip()
                if raw:
                    result = json.loads(raw)
                    logger.info("LLM extraction done (Groq)", extra={"primary_concern": result.get("primary_concern")})
                    return _normalize_extraction_result(result)
            except json.JSONDecodeError as e:
                logger.warning("Extraction: Groq returned invalid JSON: %s", e)
                last_error = e
                break
            except Exception as e:
                last_error = e
                if _is_retryable_extraction_error(e) and attempt < EXTRACTION_MAX_RETRIES - 1:
                    delay = EXTRACTION_RETRY_BASE_DELAY_SEC * (2 ** attempt)
                    logger.warning("Extraction: Groq transient error (attempt %s/%s), retry in %.1fs: %s",
                                   attempt + 1, EXTRACTION_MAX_RETRIES, delay, e)
                    await asyncio.sleep(delay)
                else:
                    logger.warning("Extraction: Groq failed: %s", e)
                    break
        return None

    if settings.openai_api_key:
        import openai
        client = openai.AsyncOpenAI(api_key=settings.openai_api_key)
        for attempt in range(EXTRACTION_MAX_RETRIES):
            try:
                resp = await client.chat.completions.create(
                    model="gpt-4o-mini",
                    messages=messages,
                    max_tokens=400,
                    response_format={"type": "json_object"},
                )
                raw = (resp.choices[0].message.content or "").strip()
                if raw:
                    result = json.loads(raw)
                    logger.info("LLM extraction done (OpenAI)", extra={"primary_concern": result.get("primary_concern")})
                    return _normalize_extraction_result(result)
            except json.JSONDecodeError as e:
                logger.warning("Extraction: OpenAI returned invalid JSON: %s", e)
                last_error = e
                break
            except Exception as e:
                last_error = e
                if _is_retryable_extraction_error(e) and attempt < EXTRACTION_MAX_RETRIES - 1:
                    delay = EXTRACTION_RETRY_BASE_DELAY_SEC * (2 ** attempt)
                    logger.warning("Extraction: OpenAI transient error (attempt %s/%s), retry in %.1fs: %s",
                                   attempt + 1, EXTRACTION_MAX_RETRIES, delay, e)
                    await asyncio.sleep(delay)
                else:
                    logger.warning("Extraction: OpenAI failed: %s", e)
                    break
        return None

    logger.warning("Extraction: No LLM API key configured (set GROQ_API_KEY or OPENAI_API_KEY)")
    return None


async def get_reply(user_message: str, conversation_history: list[dict]) -> tuple[str, str, str | None]:
    """
    Get assistant reply: Groq (if key set), else OpenAI (if key set), else mock.
    Returns (reply_text, source, error_message).
    source is "groq" | "openai" | "mock" | "mock_no_key" | "groq_failed" | "openai_failed".
    """
    if not user_message or not user_message.strip():
        return "Could you say a bit more?", "mock", None
    fallback = "I'm here to listen and help match you to a group—I can't give clinical advice, but a therapist will work with you once you join. What would you like to share?"
    reply: Optional[str] = None
    source = "mock"
    error_message: str | None = None
    messages = [{"role": "system", "content": SYSTEM_PROMPT}]
    for turn in conversation_history[-10:]:
        messages.append({"role": turn["role"], "content": turn["content"]})
    messages.append({"role": "user", "content": user_message})

    if settings.groq_api_key:
        try:
            import openai
            client = openai.AsyncOpenAI(
                api_key=settings.groq_api_key,
                base_url=GROQ_BASE_URL,
            )
            resp = await client.chat.completions.create(
                model=settings.groq_model,
                messages=messages,
                max_tokens=300,
            )
            reply = (resp.choices[0].message.content or "").strip()
            source = "groq"
        except Exception as e:
            error_message = str(e)
            logger.warning("Chat: Groq call failed, using mock: %s", e)
            reply = _mock_reply(user_message, conversation_history)
            source = "groq_failed"
    elif settings.openai_api_key:
        try:
            import openai
            client = openai.AsyncOpenAI(api_key=settings.openai_api_key)
            resp = await client.chat.completions.create(
                model="gpt-4o-mini",
                messages=messages,
                max_tokens=300,
            )
            reply = (resp.choices[0].message.content or "").strip()
            source = "openai"
        except Exception as e:
            error_message = str(e)
            logger.warning("Chat: OpenAI call failed, using mock: %s", e)
            reply = _mock_reply(user_message, conversation_history)
            source = "openai_failed"
    else:
        reply = _mock_reply(user_message, conversation_history)
        source = "mock_no_key"
    if not reply:
        return fallback, source, error_message
    if _blocked_output(reply):
        return fallback, source, error_message
    return reply, source, error_message


MATCHING_SYSTEM = """You match a user to exactly one support group based on their intake. You will receive:
1. The user's intake (primary concern, context, life impact areas, support goals).
2. A list of groups with "focus" (unique key) and "name".

Return ONLY a JSON object with exactly two keys:
- focus (string): the exact "focus" key of the group you choose (must be one of the provided focus keys).
- match_reason (string): 1–2 sentences explaining why this group fits, for the user (e.g. "Based on your intake, you mentioned work-related stress affecting sleep. This group focuses on workplace wellness and others developing healthier boundaries."). Keep it warm and clear.

Rules: Pick exactly one group. Use "general" only if no other group clearly fits. No other text, only the JSON object."""


async def match_intake_to_group_llm(
    intake: dict,
    groups: list[dict],
) -> tuple[str, str] | None:
    """Use LLM to pick one group and return (focus_key, match_reason). Returns None if no API key or on failure."""
    if not groups:
        return None
    intake_summary = {
        "primary_concern": intake.get("primary_concern"),
        "contextual_background": intake.get("contextual_background"),
        "life_impact_areas": intake.get("life_impact_areas"),
        "support_goals": intake.get("support_goals"),
        "emotional_intensity": intake.get("emotional_intensity"),
    }
    user_msg = (
        f"Intake summary:\n{json.dumps(intake_summary, indent=2, default=str)}\n\n"
        f"Available groups (use exactly one 'focus' key):\n{json.dumps(groups, indent=2)}"
    )
    messages = [
        {"role": "system", "content": MATCHING_SYSTEM},
        {"role": "user", "content": user_msg},
    ]
    valid_foci = {g.get("focus") for g in groups if g.get("focus")}

    if settings.groq_api_key:
        try:
            import openai
            client = openai.AsyncOpenAI(api_key=settings.groq_api_key, base_url=GROQ_BASE_URL)
            resp = await client.chat.completions.create(
                model=settings.groq_model,
                messages=messages,
                max_tokens=200,
                response_format={"type": "json_object"},
            )
            raw = (resp.choices[0].message.content or "").strip()
            if raw:
                result = json.loads(raw)
                focus = (result.get("focus") or "").strip()
                reason = (result.get("match_reason") or "").strip() or "This group matches your intake focus."
                if focus in valid_foci:
                    logger.info("LLM group match", extra={"focus": focus})
                    return focus, reason
        except Exception as e:
            logger.warning("LLM matching failed, will use keyword fallback: %s", e)
    if settings.openai_api_key:
        try:
            import openai
            client = openai.AsyncOpenAI(api_key=settings.openai_api_key)
            resp = await client.chat.completions.create(
                model="gpt-4o-mini",
                messages=messages,
                max_tokens=200,
                response_format={"type": "json_object"},
            )
            raw = (resp.choices[0].message.content or "").strip()
            if raw:
                result = json.loads(raw)
                focus = (result.get("focus") or "").strip()
                reason = (result.get("match_reason") or "").strip() or "This group matches your intake focus."
                if focus in valid_foci:
                    logger.info("LLM group match", extra={"focus": focus})
                    return focus, reason
        except Exception as e:
            logger.warning("LLM matching failed, will use keyword fallback: %s", e)
    return None


class LLMService:
    async def chat(self, user_message: str, conversation_history: list[dict]) -> tuple[str, str, str | None]:
        return await get_reply(user_message, conversation_history)

    async def extract_intake(self, turns: list[dict]) -> dict[str, Any] | None:
        return await extract_intake_llm(turns)

    async def match_intake_to_group(self, intake: dict, groups: list[dict]) -> tuple[str, str] | None:
        return await match_intake_to_group_llm(intake, groups)


llm_service = LLMService()
