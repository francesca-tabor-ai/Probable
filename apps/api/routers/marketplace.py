"""Marketplace API — list apps, user integrations, connect/disconnect."""

from typing import Annotated, Optional

from fastapi import APIRouter, Depends, HTTPException, status
from pydantic import BaseModel, Field
from sqlalchemy import select

from core.db import DbSession
from models.marketplace import MarketplaceApp, UserAppIntegration
from apps.api.routers.auth import get_current_user
from models.user import User

router = APIRouter(prefix="/api", tags=["marketplace"])


# ---------------------------------------------------------------------------
# Schemas
# ---------------------------------------------------------------------------


class IntegrationConfig(BaseModel):
    """Config for connecting an app (webhook URL, API key, etc.)."""

    webhook_url: Optional[str] = None
    api_key: Optional[str] = None
    channel_id: Optional[str] = None
    extra: Optional[dict] = None


class IntegrationCreate(BaseModel):
    """Request to connect an app."""

    app_id: int
    config: Optional[dict] = Field(default_factory=dict)


# ---------------------------------------------------------------------------
# Public: List marketplace apps
# ---------------------------------------------------------------------------


@router.get("/marketplace/apps")
async def marketplace_apps_list(
    db: DbSession,
    category: Optional[str] = None,
):
    """List all active marketplace apps. Optional category filter."""
    q = select(MarketplaceApp).where(MarketplaceApp.is_active).order_by(MarketplaceApp.sort_order, MarketplaceApp.name)
    if category:
        q = q.where(MarketplaceApp.category == category)
    result = await db.execute(q)
    apps = result.scalars().all()
    return [
        {
            "id": a.id,
            "slug": a.slug,
            "name": a.name,
            "description": a.description,
            "category": a.category,
            "icon": a.icon,
            "workflows": a.workflows or [],
            "configSchema": a.config_schema or {},
        }
        for a in apps
    ]


@router.get("/marketplace/apps/{slug}")
async def marketplace_app_get(slug: str, db: DbSession):
    """Get single app by slug."""
    r = await db.execute(select(MarketplaceApp).where(MarketplaceApp.slug == slug, MarketplaceApp.is_active))
    app = r.scalar_one_or_none()
    if not app:
        raise HTTPException(status_code=404, detail="App not found")
    return {
        "id": app.id,
        "slug": app.slug,
        "name": app.name,
        "description": app.description,
        "category": app.category,
        "icon": app.icon,
        "workflows": app.workflows or [],
        "configSchema": app.config_schema or {},
    }


# ---------------------------------------------------------------------------
# User integrations (auth required)
# ---------------------------------------------------------------------------


@router.get("/marketplace/integrations")
async def user_integrations_list(
    db: DbSession,
    current_user: Annotated[User, Depends(get_current_user)],
):
    """List current user's connected apps."""
    q = (
        select(UserAppIntegration, MarketplaceApp)
        .join(MarketplaceApp, UserAppIntegration.app_id == MarketplaceApp.id)
        .where(UserAppIntegration.user_id == current_user.id)
        .order_by(UserAppIntegration.created_at.desc())
    )
    result = await db.execute(q)
    rows = result.all()
    return [
        {
            "id": integ.id,
            "appId": integ.app_id,
            "appSlug": app.slug,
            "appName": app.name,
            "appIcon": app.icon,
            "category": app.category,
            "status": integ.status,
            "lastSyncAt": integ.last_sync_at.isoformat() if integ.last_sync_at else None,
            "createdAt": integ.created_at.isoformat() if integ.created_at else None,
        }
        for integ, app in rows
    ]


@router.post("/marketplace/integrations", status_code=201)
async def integration_connect(
    db: DbSession,
    current_user: Annotated[User, Depends(get_current_user)],
    data: IntegrationCreate,
):
    """Connect an app. Creates or updates integration."""
    # Verify app exists
    r = await db.execute(select(MarketplaceApp).where(MarketplaceApp.id == data.app_id, MarketplaceApp.is_active))
    app = r.scalar_one_or_none()
    if not app:
        raise HTTPException(status_code=404, detail="App not found")

    # Check existing
    existing = await db.execute(
        select(UserAppIntegration).where(
            UserAppIntegration.user_id == current_user.id,
            UserAppIntegration.app_id == data.app_id,
        )
    )
    integ = existing.scalar_one_or_none()

    if integ:
        integ.config = data.config or {}
        integ.status = "active"
        await db.flush()
        await db.refresh(integ)
    else:
        integ = UserAppIntegration(
            user_id=current_user.id,
            app_id=data.app_id,
            config=data.config or {},
        )
        db.add(integ)
        await db.flush()
        await db.refresh(integ)

    return {
        "id": integ.id,
        "appId": app.id,
        "appSlug": app.slug,
        "appName": app.name,
        "status": integ.status,
        "createdAt": integ.created_at.isoformat() if integ.created_at else None,
    }


@router.delete("/marketplace/integrations/{id}", status_code=204)
async def integration_disconnect(
    id: int,
    db: DbSession,
    current_user: Annotated[User, Depends(get_current_user)],
):
    """Disconnect an app."""
    r = await db.execute(
        select(UserAppIntegration).where(
            UserAppIntegration.id == id,
            UserAppIntegration.user_id == current_user.id,
        )
    )
    integ = r.scalar_one_or_none()
    if not integ:
        raise HTTPException(status_code=404, detail="Integration not found")
    await db.delete(integ)
    return None
