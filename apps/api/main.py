"""Probable.news FastAPI application."""

from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from apps.api.routers import admin as admin_router
from apps.api.routers import auth as auth_router
from core.config import get_settings
from core.db import engine

settings = get_settings()


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Startup and shutdown."""
    yield
    await engine.dispose()


app = FastAPI(
    title=settings.app_name,
    description="Autonomous data journalism and forecasting API",
    version="0.1.0",
    lifespan=lifespan,
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth_router.router, prefix="/api/v1")
app.include_router(admin_router.router)


@app.get("/health")
async def health():
    """Health check for load balancers and orchestration."""
    return {"status": "ok", "app": settings.app_name}
