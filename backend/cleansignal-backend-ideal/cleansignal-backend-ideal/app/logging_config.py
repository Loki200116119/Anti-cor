import logging
import sys
from pathlib import Path
from typing import Any, Dict

import structlog
from structlog.dev import ConsoleRenderer
from structlog.processors import JSONRenderer
# from structlog.stdlib import LogRecord, add_log_level, filter_by_level

# Create logs directory
logs_dir = Path("logs")
logs_dir.mkdir(exist_ok=True)

# Configure standard logging
logging.basicConfig(
    format="%(message)s",
    stream=sys.stdout,
    level=logging.INFO,
)

# Shared processors for both development and production
shared_processors = [
    structlog.processors.TimeStamper(fmt="iso"),
    structlog.processors.StackInfoRenderer(),
    structlog.processors.format_exc_info,
    structlog.processors.UnicodeDecoder(),
]

# Development configuration (console output)
development_processors = shared_processors + [
    structlog.dev.ConsoleRenderer(colors=True),
]

# Production configuration (JSON output)
production_processors = shared_processors + [
    structlog.processors.JSONRenderer(),
]

# Configure structlog
structlog.configure(
    processors=development_processors,  # Change to production_processors for production
    context_class=dict,
    logger_factory=structlog.stdlib.LoggerFactory(),
    wrapper_class=structlog.stdlib.BoundLogger,
    cache_logger_on_first_use=True,
)

# Get logger
logger = structlog.get_logger()

# File handler for production logs
file_handler = logging.FileHandler(logs_dir / "app.log")
file_handler.setLevel(logging.INFO)
file_handler.setFormatter(logging.Formatter('%(message)s'))

# Add file handler to root logger
logging.getLogger().addHandler(file_handler)

# FastAPI access log configuration
access_logger = structlog.get_logger("access")

def log_request(request, response, time_taken):
    """Log HTTP requests."""
    access_logger.info(
        "HTTP Request",
        method=request.method,
        url=str(request.url),
        status_code=response.status_code,
        time_taken=f"{time_taken:.4f}s",
        user_agent=request.headers.get("user-agent", ""),
        ip=request.client.host if request.client else "",
    )

def log_error(error: Exception, request=None):
    """Log application errors."""
    logger.error(
        "Application Error",
        error=str(error),
        error_type=type(error).__name__,
        url=str(request.url) if request else None,
        method=request.method if request else None,
    )