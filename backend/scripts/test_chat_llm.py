#!/usr/bin/env python3
"""
Test that the chat API and LLM (OpenAI) are working.
Sends a few messages and prints each reply + X-Chat-Source header.
Run from backend folder with the server up:
  python scripts/test_chat_llm.py --email your@email.com --password yourpassword
Or set env: TEST_EMAIL, TEST_PASSWORD
"""
import argparse
import os
import sys
import time

import httpx

BASE_URL = os.environ.get("BASE_URL", "http://127.0.0.1:8000")


def main() -> None:
    parser = argparse.ArgumentParser(description="Test chat API and LLM (OpenAI)")
    parser.add_argument("--email", default=os.environ.get("TEST_EMAIL"), help="Login email")
    parser.add_argument("--password", default=os.environ.get("TEST_PASSWORD"), help="Login password")
    parser.add_argument("--base-url", default=BASE_URL, help="API base URL")
    args = parser.parse_args()

    if not args.email or not args.password:
        print("Usage: python scripts/test_chat_llm.py --email your@email.com --password yourpassword")
        print("   Or set TEST_EMAIL and TEST_PASSWORD in the environment.")
        sys.exit(1)

    base = args.base_url.rstrip("/")

    print("=" * 60)
    print("1. Checking LLM status (is OpenAI key configured?)")
    print("=" * 60)
    try:
        r = httpx.get(f"{base}/api/chat/llm-status", timeout=10.0)
        r.raise_for_status()
        data = r.json()
        print(f"   groq_configured: {data.get('groq_configured')}")
        print(f"   openai_configured: {data.get('openai_configured')}")
        print(f"   message: {data.get('message')}")
        if not data.get("groq_configured") and not data.get("openai_configured"):
            print("\n   -> No LLM API key set on server; chat will use mock replies.")
    except Exception as e:
        print(f"   Failed to get llm-status: {e}")
        print("   (Is the server running? Try: uvicorn app.main:app --reload --port 8000)")

    print("\n" + "=" * 60)
    print("2. Logging in to get session")
    print("=" * 60)
    try:
        r = httpx.post(
            f"{base}/api/auth/login",
            json={"email": args.email, "password": args.password},
            timeout=10.0,
        )
        r.raise_for_status()
        auth = r.json()
        session_id = auth.get("session_id")
        if not session_id:
            print("   No session_id in response")
            sys.exit(1)
        print(f"   session_id: {session_id}")
    except httpx.HTTPStatusError as e:
        print(f"   Login failed: {e.response.status_code} - {e.response.text}")
        sys.exit(1)
    except Exception as e:
        print(f"   Login failed: {e}")
        sys.exit(1)

    print("\n" + "=" * 60)
    print("3. Sending chat messages (check X-Chat-Source header)")
    print("=" * 60)

    messages = [
        "I've been feeling really anxious lately.",
        "I'd say it's a 4 out of 5.",
        "Mostly work and sleep.",
    ]
    headers = {"X-Session-Id": session_id, "Content-Type": "application/json"}
    sources = []
    first_error = None

    for i, msg in enumerate(messages, 1):
        if i > 1:
            time.sleep(1.5)
        print(f"\n   Message {i}: {msg!r}")
        try:
            r = httpx.post(
                f"{base}/api/chat/send",
                headers=headers,
                json={"message": msg},
                timeout=30.0,
            )
            r.raise_for_status()
            body = r.json()
            reply = body.get("reply", "")
            source = r.headers.get("x-chat-source", "?")
            error = r.headers.get("x-chat-error", "")
            sources.append(source)
            print(f"   Reply: {reply[:200]}{'...' if len(reply) > 200 else ''}")
            print(f"   X-Chat-Source: {source}")
            if source == "groq":
                print("   -> LLM (Groq) was used for this reply.")
            elif source == "openai":
                print("   -> LLM (OpenAI) was used for this reply.")
            elif source == "mock_no_key":
                print("   -> Mock used (no API key on server).")
            elif source == "groq_failed":
                print("   -> Groq call failed; mock fallback was used.")
            elif source == "openai_failed":
                print("   -> OpenAI call failed; mock fallback was used.")
                if error:
                    if first_error is None:
                        first_error = error
                    print(f"   X-Chat-Error: {error}")
        except Exception as e:
            print(f"   Request failed: {e}")
            sources.append("error")

    print("\n" + "=" * 60)
    print("4. Summary")
    print("=" * 60)
    if "groq" in sources:
        print("   Groq was used for at least one reply. LLM is working.")
    elif "openai" in sources:
        print("   OpenAI was used for at least one reply. LLM is working.")
    elif "groq_failed" in sources:
        print("   Groq key is set but the API call failed.")
        if first_error:
            print(f"   Error from server: {first_error}")
        else:
            print("   Check server logs for the error.")
    elif "openai_failed" in sources:
        print("   OpenAI key is set but the API call failed.")
        if first_error:
            print(f"   Error from server: {first_error}")
        else:
            print("   Check server logs for the error.")
    elif "mock_no_key" in sources:
        print("   Mock was used (no API key). Add GROQ_API_KEY or OPENAI_API_KEY to backend/.env and restart.")
    else:
        print("   Could not determine source. Check X-Chat-Source in the output above.")
    print()


if __name__ == "__main__":
    main()
