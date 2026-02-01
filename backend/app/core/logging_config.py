"""Structured logging configuration."""
import logging
import sys
from contextvars import ContextVar

# Request-scoped: set by middleware for inclusion in log records
request_id_var: ContextVar[str | None] = ContextVar("request_id", default=None)
session_id_var: ContextVar[str | None] = ContextVar("session_id", default=None)


class SafeFormatter(logging.Formatter):
    """Formatter that never raises; uses '-' for missing request_id/session_id."""

    def format(self, record: logging.LogRecord) -> str:
        setattr(record, "request_id", getattr(record, "request_id", None) or "-")
        setattr(record, "session_id", getattr(record, "session_id", None) or "-")
        try:
            return super().format(record)
        except (KeyError, AttributeError, TypeError):
            return f"{record.levelname} | {record.name} | {record.getMessage()}"


class RequestContextFilter(logging.Filter):
    """Add request_id and session_id to log records when set."""

    def filter(self, record: logging.LogRecord) -> bool:
        rid = getattr(record, "request_id", None) or request_id_var.get()
        sid = getattr(record, "session_id", None) or session_id_var.get()
        record.request_id = rid if rid is not None else "-"
        record.session_id = sid if sid is not None else "-"
        return True


def setup_logging(debug: bool = False) -> None:
    """Configure root logger; simple format (no custom attributes) to avoid 500s."""
    level = logging.DEBUG if debug else logging.INFO
    log_format = "%(asctime)s | %(levelname)-8s | %(name)s | %(message)s"
    formatter = logging.Formatter(log_format, datefmt="%Y-%m-%d %H:%M:%S")
    handler = logging.StreamHandler(sys.stdout)
    handler.setFormatter(formatter)
    root = logging.getLogger()
    root.handlers.clear()
    root.addHandler(handler)
    root.setLevel(level)
    logging.getLogger("uvicorn.access").setLevel(logging.WARNING)
    logging.getLogger("sqlalchemy.engine").setLevel(logging.WARNING)
