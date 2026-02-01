"""FastAPI app: routers, CORS, logging."""
import logging
import sys
import time
import traceback
import uuid

from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse

from app.config import settings
from app.core.logging_config import setup_logging
from app import models  # noqa: F401
from app.api import auth, chat, intake, groups, scheduling, payments, handoff

setup_logging(debug=settings.debug)
logger = logging.getLogger(__name__)


async def catch_all_exception_handler(request: Request, exc: Exception) -> JSONResponse:
    """Log every unhandled exception with full traceback so 500s show in terminal."""
    traceback.print_exc(file=sys.stderr)
    sys.stderr.flush()
    logger.exception("Internal Server Error: %s %s -> %s", request.method, request.url.path, exc)
    return JSONResponse(
        status_code=500,
        content={"detail": "Internal Server Error", "error": str(exc)},
    )


app = FastAPI(
    title=settings.app_name,
    description="AI-assisted intake, coordination, and handoff for group therapy matching.",
    version="0.1.0",
)
app.add_exception_handler(Exception, catch_all_exception_handler)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


app.include_router(auth.router, prefix="/api/auth", tags=["auth"])
app.include_router(chat.router, prefix="/api/chat", tags=["chat"])
app.include_router(intake.router, prefix="/api/intake", tags=["intake"])
app.include_router(groups.router, prefix="/api/groups", tags=["groups"])
app.include_router(scheduling.router, prefix="/api/scheduling", tags=["scheduling"])
app.include_router(payments.router, prefix="/api/payments", tags=["payments"])
app.include_router(handoff.router, prefix="/api/handoff", tags=["handoff"])


@app.on_event("startup")
async def startup():
    logger.info("Application started")
    groq_ok = bool(settings.groq_api_key and settings.groq_api_key.strip())
    openai_ok = bool(settings.openai_api_key and settings.openai_api_key.strip())
    if groq_ok:
        msg = "Groq API key: set (chat will use Groq LLM)"
    elif openai_ok:
        msg = "OpenAI API key: set (chat will use real GPT)"
    else:
        msg = "No LLM API key set (chat will use mock replies)"
    logger.info(msg)
    print(f"\n>>> {msg} <<<\n", flush=True)


@app.get("/")
async def root():
    return {"message": "Sage API", "docs": "/docs", "health": "/health"}


@app.get("/health")
async def health():
    return {"status": "ok"}
