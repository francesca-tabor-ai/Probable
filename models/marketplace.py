"""Marketplace apps and user integrations."""

from datetime import datetime
from typing import Optional

from sqlalchemy import DateTime, Integer, JSON, String, Text, func
from sqlalchemy.orm import Mapped, mapped_column

from core.db import Base


class MarketplaceApp(Base):
    """App available in the Probable marketplace."""

    __tablename__ = "marketplace_apps"

    id: Mapped[int] = mapped_column(primary_key=True, autoincrement=True)
    slug: Mapped[str] = mapped_column(String(64), unique=True, index=True)
    name: Mapped[str] = mapped_column(String(256), nullable=False)
    description: Mapped[str] = mapped_column(Text, nullable=False)
    category: Mapped[str] = mapped_column(String(64), index=True)  # data, communication, automation, bi
    icon: Mapped[str] = mapped_column(String(8), default="?")  # single char or emoji for card
    sort_order: Mapped[int] = mapped_column(Integer, default=0)
    workflows: Mapped[list] = mapped_column(JSON, default=list)  # [{id, name, description}]
    config_schema: Mapped[dict] = mapped_column(JSON, default=dict)  # fields needed to connect
    is_active: Mapped[bool] = mapped_column(default=True, nullable=False)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now())


class UserAppIntegration(Base):
    """User's connected app instance."""

    __tablename__ = "user_app_integrations"

    id: Mapped[int] = mapped_column(primary_key=True, autoincrement=True)
    user_id: Mapped[int] = mapped_column(nullable=False, index=True)
    app_id: Mapped[int] = mapped_column(nullable=False, index=True)
    config: Mapped[dict] = mapped_column(JSON, default=dict)  # credentials, webhook URLs, etc.
    status: Mapped[str] = mapped_column(String(32), default="active")  # active, paused, error
    last_sync_at: Mapped[Optional[datetime]] = mapped_column(DateTime(timezone=True), nullable=True)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now())
    updated_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())
