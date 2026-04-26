import os
import sys
from pathlib import Path

# Add the parent directory to Python path
current_dir = Path(__file__).parent
parent_dir = current_dir.parent
sys.path.insert(0, str(parent_dir))

from dotenv import load_dotenv
from fastapi import FastAPI, Request, Response
from fastapi.middleware.cors import CORSMiddleware
# from slowapi import Limiter
# from slowapi.util import get_remote_address
# from slowapi.middleware import SlowAPIMiddleware
import time

from app.database import Base, engine
from app.logging_config import log_request, log_error, logger
from app.rate_limits import limiter
from app.routers import auth, contact, reports, stats

load_dotenv()

# Create database tables
Base.metadata.create_all(bind=engine)

app = FastAPI(
    title="CleanSignal Backend",
    description="Professional FastAPI backend for CleanSignal anti-corruption platform with JWT auth, rate limiting, structured logging, file security, and database migrations.",
    version="2.0.0",
)

# Rate limiting middleware
# app.state.limiter = limiter
# app.add_middleware(SlowAPIMiddleware)

origins_env = os.getenv("ALLOWED_ORIGINS", "*")
origins = [o.strip() for o in origins_env.split(",") if o.strip()]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins if origins != ["*"] else ["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routers
app.include_router(auth.router)
app.include_router(reports.router)
app.include_router(stats.router)
app.include_router(contact.router)

# Request logging middleware
@app.middleware("http")
async def log_requests(request: Request, call_next):
    start_time = time.time()

    try:
        response = await call_next(request)
        process_time = time.time() - start_time

        # Log successful requests
        log_request(request, response, process_time)

        return response
    except Exception as e:
        process_time = time.time() - start_time

        # Log errors
        log_error(e, request)

        # Re-raise the exception
        raise


@app.get("/health", tags=["system"])
def health():
    """Health check endpoint."""
    logger.info("Health check requested")
    return {"status": "ok", "service": "cleansignal-backend", "version": "2.0.0"}


@app.get("/", tags=["system"])
def root():
    """Root endpoint with API information."""
    return {
        "message": "CleanSignal Backend v2.0.0 is running",
        "docs": "/docs",
        "health": "/health",
        "features": [
            "JWT Authentication",
            "Rate Limiting",
            "Structured Logging",
            "File Security Scanning",
            "PII Minimization",
            "Database Migrations"
        ]
    }


if __name__ == "__main__":
    import uvicorn
    uvicorn.run("app.main:app", host="127.0.0.1", port=8000, reload=True)